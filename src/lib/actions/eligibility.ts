'use server'

/**
 * Eligibility Server Actions
 * TASK-013: Manual Review Request for Ineligible Users
 * TASK-014: Email Notification for Manual Review Requests
 *
 * Actions for handling eligibility manual review requests
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { sendManualReviewEmail } from '@/lib/email/send-manual-review'
import { logger } from '@/lib/logger'
import type {
  OnboardingStep,
  OnboardingData,
  Json,
  Database,
} from '@/types/database'
import type { ActionResult, EligibilityInput } from '@/types/onboarding'

// ============================================
// Types
// ============================================

export interface ManualReviewRequest {
  organizationId: string
  formData: EligibilityInput
  justification: string
}

export interface ManualReviewResult {
  success: boolean
  reviewId?: string
  message: string
}

// ============================================
// Helper: Log audit event
// ============================================

async function logEligibilityAuditEvent(
  action: Database["public"]["Enums"]["audit_action"],
  userId: string,
  orgId: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createAdminClient()
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')

  await supabase.from('audit_logs').insert({
    action,
    user_id: userId,
    organization_id: orgId,
    metadata: metadata as Json,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// ============================================
// submitManualReviewRequest - Submits review request with justification
// ============================================

/**
 * Submits a manual review request for an ineligible user.
 *
 * This is called when a user doesn't meet the eligibility criteria
 * but wants to request manual approval with a justification.
 *
 * TASK-013: Creates the review request
 * TASK-014: Stores in DB and sends email notification to review team
 *
 * @param organizationId - The organization ID
 * @param formData - The eligibility form data
 * @param justification - User's explanation for why they should be approved
 */
export async function submitManualReviewRequest(
  organizationId: string,
  formData: EligibilityInput,
  justification: string
): Promise<ActionResult<ManualReviewResult>> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Verify user has access to org
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, name, profile_type, onboarding_data')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    const onboardingData = (org.onboarding_data as OnboardingData) || {}

    // TASK-014: Insert into eligibility_reviews table
    const { data: review, error: reviewError } = await adminSupabase
      .from('eligibility_reviews')
      .insert({
        organization_id: organizationId,
        submitted_by: user.id,
        form_data: {
          dealsLast3Years: formData.dealsLast3Years,
          totalDealValueUsd: formData.totalDealValueUsd,
          yearsExperience: formData.yearsExperience,
        },
        justification: justification.trim() || null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (reviewError) {
      logger.error('Error creating eligibility review record', {
        error: reviewError,
        organizationId,
        userId: user.id,
      })
      // Continue even if review record fails - update org is more important
    }

    const reviewId = review?.id

    // Update organization with review request
    const reviewRequestData = {
      deals_last_3_years: formData.dealsLast3Years,
      total_deal_value_usd: formData.totalDealValueUsd,
      years_experience: formData.yearsExperience,
      justification: justification.trim(),
      submitted_at: new Date().toISOString(),
      submitted_by: user.id,
      status: 'pending_review' as const,
      review_id: reviewId,
    }

    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update({
        onboarding_step: 'pending_review' as OnboardingStep,
        verification_status: 'pending',
        onboarding_data: {
          ...onboardingData,
          eligibility: {
            ...onboardingData.eligibility,
            ...reviewRequestData,
            manual_review_requested: true,
          },
          flow: {
            ...onboardingData.flow,
            last_step_at: new Date().toISOString(),
            steps_completed: [
              ...(onboardingData.flow?.steps_completed || []),
              'eligibility_check',
            ],
          },
        } as unknown as Json,
      })
      .eq('id', organizationId)

    if (updateError) {
      logger.error('Error updating organization for review request', {
        error: updateError,
        organizationId,
      })
      return { success: false, error: 'Erro ao enviar solicitação de revisão' }
    }

    // TASK-014: Send email notification to review team
    const emailResult = await sendManualReviewEmail({
      organizationId: org.id,
      organizationName: org.name,
      profileType: org.profile_type as 'investor' | 'advisor' | 'asset',
      submittedBy: {
        userId: user.id,
        email: user.email || '',
        name: (user.user_metadata as { full_name?: string })?.full_name,
      },
      eligibilityData: {
        dealsLast3Years: formData.dealsLast3Years ?? 0,
        totalDealValueUsd: formData.totalDealValueUsd ?? 0,
        yearsExperience: formData.yearsExperience ?? 0,
      },
      justification: justification.trim() || undefined,
      reviewId,
    })

    if (!emailResult.success) {
      logger.warn('Failed to send manual review email, but review was created', {
        organizationId,
        reviewId,
        emailError: emailResult.error,
      })
      // Don't fail the request if email fails - the review is already saved
    }

    // Log audit event
    await logEligibilityAuditEvent(
      'onboarding.eligibility_submitted',
      user.id,
      organizationId,
      {
        eligible: false,
        manual_review_requested: true,
        has_justification: !!justification.trim(),
        justification_length: justification.trim().length,
        profile_type: org.profile_type,
        deals: formData.dealsLast3Years,
        deal_value: formData.totalDealValueUsd,
        years_experience: formData.yearsExperience,
        review_id: reviewId,
        email_sent: emailResult.success,
        email_message_id: emailResult.messageId,
      }
    )

    return {
      success: true,
      data: {
        success: true,
        reviewId,
        message: 'Solicitação de revisão enviada com sucesso. Nossa equipe analisará seu perfil.',
      },
    }
  } catch (error) {
    logger.error('Unexpected error in submitManualReviewRequest', { error })
    return { success: false, error: 'Erro inesperado ao enviar solicitação de revisão' }
  }
}
