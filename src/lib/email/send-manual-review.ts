/**
 * Send Manual Review Request Email
 * TASK-014: Email Notification for Manual Review Requests
 *
 * Sends email notifications to the Mary team when users request manual eligibility review.
 */

import { sendEmail, type SendEmailResult } from './index'
import {
  generateManualReviewHtml,
  generateManualReviewText,
  generateManualReviewSubject,
  type ManualReviewEmailParams,
} from './templates/manual-review'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// ============================================
// Configuration
// ============================================

// Email addresses for the review team
const REVIEW_TEAM_EMAILS = [
  { email: 'review@mary.network', name: 'Mary Review Team' },
]

// Optional: Add CC recipients
const REVIEW_CC_EMAILS: { email: string; name?: string }[] = []

// ============================================
// Types
// ============================================

export interface SendManualReviewEmailParams {
  organizationId: string
  organizationName: string
  profileType: 'investor' | 'advisor' | 'asset'
  submittedBy: {
    userId: string
    email: string
    name?: string
  }
  eligibilityData: {
    dealsLast3Years: number
    totalDealValueUsd: number
    yearsExperience: number
  }
  justification?: string
  reviewId?: string
}

export interface SendManualReviewEmailResult extends SendEmailResult {
  logged?: boolean
  reviewId?: string
}

// ============================================
// Send Manual Review Email
// ============================================

/**
 * Send manual review notification email to the Mary review team.
 *
 * @param params - Parameters for the manual review email
 * @returns Result of email send operation
 */
export async function sendManualReviewEmail(
  params: SendManualReviewEmailParams
): Promise<SendManualReviewEmailResult> {
  try {
    const submittedAt = new Date()

    // Build template params
    const templateParams: ManualReviewEmailParams = {
      organizationId: params.organizationId,
      organizationName: params.organizationName,
      profileType: params.profileType,
      submittedBy: {
        email: params.submittedBy.email,
        name: params.submittedBy.name,
      },
      eligibilityData: params.eligibilityData,
      justification: params.justification,
      submittedAt,
    }

    // Generate email content
    const subject = generateManualReviewSubject(templateParams)
    const htmlContent = generateManualReviewHtml(templateParams)
    const textContent = generateManualReviewText(templateParams)

    // Send email
    const result = await sendEmail({
      to: REVIEW_TEAM_EMAILS,
      subject,
      htmlContent,
      textContent,
      cc: REVIEW_CC_EMAILS.length > 0 ? REVIEW_CC_EMAILS : undefined,
      tags: ['manual-review', 'eligibility', params.profileType],
    })

    // Update eligibility_reviews table with email status if reviewId provided
    if (params.reviewId) {
      const supabase = await createAdminClient()
      await supabase
        .from('eligibility_reviews')
        .update({
          email_sent: result.success,
          email_sent_at: result.success ? new Date().toISOString() : null,
          email_message_id: result.messageId || null,
        })
        .eq('id', params.reviewId)
    }

    logger.info('Manual review email processed', {
      success: result.success,
      messageId: result.messageId,
      organizationId: params.organizationId,
      organizationName: params.organizationName,
      profileType: params.profileType,
      reviewId: params.reviewId,
    })

    return {
      ...result,
      logged: true,
      reviewId: params.reviewId,
    }
  } catch (error) {
    logger.error('Failed to send manual review email', {
      error,
      organizationId: params.organizationId,
      organizationName: params.organizationName,
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logged: false,
    }
  }
}

/**
 * Send manual review email with automatic user lookup.
 * Fetches user details from the database if not provided.
 */
export async function sendManualReviewEmailWithLookup(
  organizationId: string,
  submittedByUserId: string,
  eligibilityData: {
    dealsLast3Years: number
    totalDealValueUsd: number
    yearsExperience: number
  },
  justification?: string,
  reviewId?: string
): Promise<SendManualReviewEmailResult> {
  try {
    const supabase = await createAdminClient()

    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, profile_type')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return {
        success: false,
        error: 'Organization not found',
      }
    }

    // Get user details
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers()
    const user = users?.find((u) => u.id === submittedByUserId)

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Send email
    return sendManualReviewEmail({
      organizationId: org.id,
      organizationName: org.name,
      profileType: org.profile_type as 'investor' | 'advisor' | 'asset',
      submittedBy: {
        userId: user.id,
        email: user.email || '',
        name: (user.user_metadata as { full_name?: string })?.full_name,
      },
      eligibilityData,
      justification,
      reviewId,
    })
  } catch (error) {
    logger.error('Failed to send manual review email with lookup', {
      error,
      organizationId,
      submittedByUserId,
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
