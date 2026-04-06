/**
 * Send Project Invite Email
 */

import { sendEmail, type SendEmailResult } from './index'
import {
  generateProjectInviteHtml,
  generateProjectInviteText,
  generateProjectInviteSubject,
  type ProjectInviteEmailParams,
} from './templates/project-invite'
import { logger } from '@/lib/logger'

// ============================================
// Types
// ============================================

export interface SendProjectInviteEmailParams {
  recipientEmail: string
  projectCodename: string
  organizationName: string
  organizationSlug: string
  inviterUserId: string
  inviterEmail?: string
  inviterName?: string
  role: string
  inviteToken: string
  expiresAt: Date
}

// ============================================
// Send Project Invite Email
// ============================================

export async function sendProjectInviteEmail(
  params: SendProjectInviteEmailParams
): Promise<SendEmailResult> {
  try {
    const templateParams: ProjectInviteEmailParams = {
      recipientEmail: params.recipientEmail,
      projectCodename: params.projectCodename,
      organizationName: params.organizationName,
      organizationSlug: params.organizationSlug,
      inviterEmail: params.inviterEmail || 'um membro',
      inviterName: params.inviterName,
      role: params.role,
      inviteToken: params.inviteToken,
      expiresAt: params.expiresAt,
    }

    const subject = generateProjectInviteSubject(templateParams)
    const htmlContent = generateProjectInviteHtml(templateParams)
    const textContent = generateProjectInviteText(templateParams)

    const result = await sendEmail({
      to: { email: params.recipientEmail },
      subject,
      htmlContent,
      textContent,
      tags: ['invite', 'project', params.projectCodename],
    })

    logger.info('Project invite email processed', {
      success: result.success,
      messageId: result.messageId,
      recipientEmail: params.recipientEmail,
      projectCodename: params.projectCodename,
    })

    return result
  } catch (error) {
    logger.error('Failed to send project invite email', {
      error,
      recipientEmail: params.recipientEmail,
      projectCodename: params.projectCodename,
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
