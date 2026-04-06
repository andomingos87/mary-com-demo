/**
 * Send Organization Invite Email
 * 
 * Função de alto nível para enviar emails de convite.
 * Integra com o serviço de email e templates.
 */

import { sendEmail, type SendEmailResult } from './index';
import {
  generateInviteHtml,
  generateInviteText,
  generateInviteSubject,
  type InviteEmailParams,
} from './templates/invite';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

export interface SendInviteEmailParams {
  recipientEmail: string;
  recipientName?: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  inviterUserId: string;
  inviterEmail?: string;
  inviterName?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  inviteToken: string;
  expiresAt: Date;
}

export interface SendInviteEmailResult extends SendEmailResult {
  logged?: boolean;
}

// ============================================
// Send Invite Email
// ============================================

/**
 * Send organization invite email
 * 
 * @param params - Invite email parameters
 * @returns Result of email send operation
 */
export async function sendInviteEmail(
  params: SendInviteEmailParams
): Promise<SendInviteEmailResult> {
  try {
    // Get inviter details if not provided
    let inviterEmail = params.inviterEmail;
    let inviterName = params.inviterName;

    if (!inviterEmail) {
      const supabase = await createAdminClient();
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const inviter = users?.find(u => u.id === params.inviterUserId);
      
      if (inviter) {
        inviterEmail = inviter.email || '';
        inviterName = (inviter.user_metadata as { full_name?: string } | undefined)?.full_name;
      }
    }

    // Build template params
    const templateParams: InviteEmailParams = {
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      organizationName: params.organizationName,
      organizationSlug: params.organizationSlug,
      inviterEmail: inviterEmail || 'um membro',
      inviterName: inviterName,
      role: params.role,
      inviteToken: params.inviteToken,
      expiresAt: params.expiresAt,
    };

    // Generate email content
    const subject = generateInviteSubject(templateParams);
    const htmlContent = generateInviteHtml(templateParams);
    const textContent = generateInviteText(templateParams);

    // Send email
    const result = await sendEmail({
      to: {
        email: params.recipientEmail,
        name: params.recipientName,
      },
      subject,
      htmlContent,
      textContent,
      tags: ['invite', 'organization', params.organizationSlug],
    });

    // Log audit event
    if (result.success) {
      const supabase = await createAdminClient();
      await supabase.from('audit_logs').insert({
        user_id: params.inviterUserId,
        organization_id: params.organizationId,
        action: 'org.invite_sent',
        metadata: {
          email_sent: true,
          recipient_email: params.recipientEmail,
          role: params.role,
          message_id: result.messageId,
        },
      });
    }

    logger.info('Invite email processed', {
      success: result.success,
      messageId: result.messageId,
      recipientEmail: params.recipientEmail,
      organizationSlug: params.organizationSlug,
    });

    return {
      ...result,
      logged: true,
    };
  } catch (error) {
    logger.error('Failed to send invite email', {
      error,
      recipientEmail: params.recipientEmail,
      organizationId: params.organizationId,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logged: false,
    };
  }
}

/**
 * Resend invite email (for expired or unread invites)
 */
export async function resendInviteEmail(
  inviteId: string,
  inviterUserId: string
): Promise<SendInviteEmailResult> {
  try {
    const supabase = await createAdminClient();

    // Get invite with organization details
    const { data: invite, error } = await supabase
      .from('organization_invites')
      .select(`
        *,
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('id', inviteId)
      .single();

    if (error || !invite) {
      return {
        success: false,
        error: 'Invite not found',
      };
    }

    const org = (invite as any).organizations;
    if (!org) {
      return {
        success: false,
        error: 'Organization not found',
      };
    }

    // Send email
    return sendInviteEmail({
      recipientEmail: invite.email,
      organizationId: org.id,
      organizationName: org.name,
      organizationSlug: org.slug,
      inviterUserId,
      role: invite.role,
      inviteToken: invite.token,
      expiresAt: new Date(invite.expires_at),
    });
  } catch (error) {
    logger.error('Failed to resend invite email', { error, inviteId });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

