'use server'

import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import type { VdrAccessPermission, GrantAccessInput } from '@/types/vdr'

/**
 * Grant access to an organization or user
 */
export async function grantAccess(input: GrantAccessInput): Promise<{
  success: boolean
  data?: VdrAccessPermission
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  if (!input.granteeOrgId && !input.granteeUserId) {
    return { success: false, error: 'Must specify granteeOrgId or granteeUserId' }
  }

  const { data, error } = await supabase
    .from('vdr_access_permissions')
    .insert({
      project_id: input.projectId,
      grantee_org_id: input.granteeOrgId,
      grantee_user_id: input.granteeUserId,
      permission_type: input.permissionType,
      document_id: input.documentId,
      folder_id: input.folderId,
      expires_at: input.expiresAt,
      granted_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error granting access:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.access_granted', {
    permission_id: data.id,
    grantee_org_id: input.granteeOrgId,
    grantee_user_id: input.granteeUserId,
    permission_type: input.permissionType,
    project_id: input.projectId,
  }, user.id)

  return { success: true, data }
}

/**
 * Revoke access
 */
export async function revokeAccess(permissionId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('vdr_access_permissions')
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
    })
    .eq('id', permissionId)
    .select('project_id, grantee_org_id')
    .single()

  if (error) {
    console.error('Error revoking access:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.access_revoked', {
    permission_id: permissionId,
    project_id: data?.project_id,
    grantee_org_id: data?.grantee_org_id,
  }, user.id)

  return { success: true }
}

/**
 * List access permissions for a project
 */
export async function listPermissions(projectId: string): Promise<{
  success: boolean
  data?: VdrAccessPermission[]
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_access_permissions')
    .select('*')
    .eq('project_id', projectId)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })

  if (error) {
    console.error('Error listing permissions:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * List permissions with org details (for VdrPermissionsPanel)
 */
export async function listPermissionsWithDetails(projectId: string): Promise<{
  success: boolean
  data?: Array<VdrAccessPermission & {
    grantee_org: { id: string; name: string; slug: string; profile_type: string } | null
  }>
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_access_permissions')
    .select(`
      *,
      grantee_org:organizations!grantee_org_id(id, name, slug, profile_type)
    `)
    .eq('project_id', projectId)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })

  if (error) {
    console.error('Error listing permissions with details:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: data as any }
}

/**
 * Search organizations (for grant access dialog)
 */
export async function searchOrganizations(
  query: string,
  profileType?: 'investor' | 'asset' | 'advisor'
): Promise<{
  success: boolean
  data?: Array<{ id: string; name: string; slug: string; profile_type: string }>
  error?: string
}> {
  const supabase = await createClient()

  let q = supabase
    .from('organizations')
    .select('id, name, slug, profile_type')
    .is('deleted_at', null)
    .ilike('name', `%${query}%`)
    .limit(10)

  if (profileType) {
    q = q.eq('profile_type', profileType)
  }

  const { data, error } = await q

  if (error) {
    console.error('Error searching organizations:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: data as any }
}
