import 'server-only';
import { headers } from 'next/headers';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { logger } from './logger';

export type AuditAction =
  // Auth actions
  | 'auth.login'
  | 'auth.logout'
  | 'auth.mfa_success'
  | 'auth.mfa_failed'
  | 'auth.signup'
  | 'auth.otp_sent'
  | 'auth.otp_verified'
  | 'auth.recovery_requested'
  | 'auth.recovery_completed'
  | 'auth.session_created'
  | 'auth.session_invalidated'
  | 'auth.new_device_detected'
  | 'auth.country_change_detected'
  // VDR actions
  | 'vdr.view_doc'
  | 'vdr.share_link'
  | 'vdr.revoke_access'
  | 'vdr.folder_created'
  | 'vdr.folder_updated'
  | 'vdr.folder_deleted'
  | 'vdr.document_created'
  | 'vdr.document_updated'
  | 'vdr.document_deleted'
  | 'vdr.document_duplicated'
  | 'vdr.document_validated'
  | 'vdr.document_unvalidated'
  | 'vdr.document_bulk_updated'
  | 'vdr.documents_initialized'
  | 'vdr.documents_reordered'
  | 'vdr.file_added'
  | 'vdr.file_removed'
  | 'vdr.external_link_added'
  | 'vdr.external_link_removed'
  | 'vdr.link_created'
  | 'vdr.link_revoked'
  | 'vdr.shared_link_validation_failed'
  | 'vdr.access_granted'
  | 'vdr.access_revoked'
  | 'vdr.view_started'
  | 'vdr.view_ended'
  | 'vdr.print_attempt'
  | 'vdr.qa_message_sent'
  | 'vdr.qa_resolved'
  | 'vdr.qa_promoted_to_faq'
  | 'vdr.folders_reordered'
  // AI actions
  | 'ai.prompt_sent'
  | 'ai.doc_generated'
  // Project actions
  | 'project.created'
  | 'project.status_changed'
  | 'project.updated'
  | 'project.deleted'
  | 'project.taxonomy_updated'
  | 'project.readiness_calculated'
  // Org actions
  | 'org.created'
  | 'org.updated'
  | 'org.deleted'
  | 'org.member_added'
  | 'org.member_removed'
  | 'org.member_role_changed'
  | 'org.invite_sent'
  | 'org.invite_accepted'
  | 'org.invite_cancelled'
  | 'org.invite_expired'
  // Advisor actions
  | 'advisor.assigned'
  | 'advisor.unassigned'
  | 'advisor.conflict_blocked'
  // Onboarding actions
  | 'onboarding.started'
  | 'onboarding.step_completed'
  | 'onboarding.cnpj_enriched'
  | 'onboarding.website_scraped'
  | 'onboarding.description_generated'
  | 'onboarding.eligibility_submitted'
  | 'onboarding.completed'
  | 'onboarding.abandoned'
  // Billing actions
  | 'billing.subscription_updated'
  // Page actions
  | 'page.view';

function parseIpFromHeaders(headersList: Headers): string | null {
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? null;
  }
  return headersList.get('x-real-ip') ?? null;
}

export async function logAuditEvent(
  action: AuditAction,
  metadata: Record<string, any> = {},
  userId?: string,
  orgId?: string,
  opts?: { ipAddress?: string; userAgent?: string }
) {
  try {
    const authSupabase = await createClient();
    const adminSupabase = await createAdminClient();

    let resolvedUserId = userId;
    let resolvedOrgId = orgId;

    if (!resolvedUserId || !resolvedOrgId) {
      const {
        data: { user },
      } = await authSupabase.auth.getUser();

      if (!resolvedUserId) {
        resolvedUserId = user?.id ?? undefined;
      }

      if (!resolvedOrgId && user?.id) {
        const { data: membership } = await authSupabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        resolvedOrgId = membership?.organization_id ?? undefined;
      }
    }

    if (action === 'page.view' && !resolvedUserId) {
      return;
    }

    let ipAddress = opts?.ipAddress ?? null;
    let userAgent = opts?.userAgent ?? null;
    if (!ipAddress || !userAgent) {
      const headersList = await headers();
      if (!ipAddress) ipAddress = parseIpFromHeaders(headersList);
      if (!userAgent) userAgent = headersList.get('user-agent');
    }

    const { error } = await adminSupabase.from('audit_logs').insert({
      action: action as Database['public']['Enums']['audit_action'],
      metadata,
      user_id: resolvedUserId ?? null,
      organization_id: resolvedOrgId ?? null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      logger.error('Failed to persist audit log', { error, action, metadata });
    } else {
      logger.info('Audit log persisted', { action, metadata });
    }
  } catch (err) {
    logger.error('Unexpected error persisting audit log', { err, action, metadata });
  }
}

export async function logPageView(path: string, metadata: Record<string, any> = {}) {
  return logAuditEvent('page.view', { path, ...metadata });
}

