'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import type { VdrAccessLog } from '@/types/vdr'

/**
 * Resolve requester IP from forwarded headers.
 * Guardrail: keep `headers()` usage scoped to access-logs module.
 */
export async function getRequestIpAddress(): Promise<string> {
  const headersList = await headers()
  return headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headersList.get('x-real-ip')
    || 'unknown'
}

/**
 * Log a view start event
 */
export async function logViewStart(
  projectId: string,
  documentId: string,
  sessionId: string,
  sharedLinkId?: string
): Promise<{ success: boolean; logId?: string; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Get user's org
  let orgId: string | undefined
  if (user) {
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()
    orgId = member?.organization_id
  }

  const { data, error } = await supabase
    .from('vdr_access_logs')
    .insert({
      project_id: projectId,
      document_id: documentId,
      shared_link_id: sharedLinkId,
      user_id: user?.id,
      organization_id: orgId,
      action: 'view_start',
      session_id: sessionId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error logging view start:', error)
    return { success: false, error: error.message }
  }

  // Increment view count on shared link if used
  if (sharedLinkId) {
    // Get current view count and increment
    const { data: linkData } = await supabase
      .from('vdr_shared_links')
      .select('view_count')
      .eq('id', sharedLinkId)
      .single()

    if (linkData) {
      await supabase
        .from('vdr_shared_links')
        .update({ view_count: (linkData.view_count ?? 0) + 1 })
        .eq('id', sharedLinkId)
    }
  }

  return { success: true, logId: data.id }
}

/**
 * Log a view end event
 */
export async function logViewEnd(sessionId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  // Use the database function to end the session
  const { error } = await supabase.rpc('end_vdr_session', {
    p_session_id: sessionId,
  })

  if (error) {
    console.error('Error logging view end:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Log a print attempt
 */
export async function logPrintAttempt(
  projectId: string,
  documentId: string,
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('vdr_access_logs')
    .insert({
      project_id: projectId,
      document_id: documentId,
      user_id: user?.id,
      action: 'print_attempt',
      session_id: sessionId,
    })

  if (error) {
    console.error('Error logging print attempt:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.print_attempt', {
    document_id: documentId,
    project_id: projectId,
  }, user?.id)

  return { success: true }
}

/**
 * Get access logs for a project
 */
export async function getAccessLogs(
  projectId: string,
  limit = 50
): Promise<{ success: boolean; data?: VdrAccessLog[]; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_access_logs')
    .select('*')
    .eq('project_id', projectId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error getting access logs:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
