'use server'

import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/audit'
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit'
import { getRequestIpAddress } from '@/lib/actions/vdr-access-logs'
import type {
  VdrSharedLink,
  VdrDocument,
  VdrFolder,
  CreateSharedLinkInput,
} from '@/types/vdr'

/**
 * Create a shared link
 */
export async function createSharedLink(input: CreateSharedLinkInput): Promise<{
  success: boolean
  data?: VdrSharedLink & { url: string }
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const token = nanoid(64)

  // Minimum password policy when creating password-protected links
  if (input.password && input.password.length < 8) {
    return {
      success: false,
      error: 'A senha deve ter pelo menos 8 caracteres quando o link for protegido.',
    }
  }

  // Hash password with bcrypt if provided
  const passwordHash = input.password
    ? await bcrypt.hash(input.password, 12)
    : null

  const { data, error } = await supabase
    .from('vdr_shared_links')
    .insert({
      project_id: input.projectId,
      token,
      created_by: user.id,
      document_id: input.documentId,
      folder_id: input.folderId,
      expires_at: input.expiresAt,
      max_views: input.maxViews,
      password_hash: passwordHash,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating shared link:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.link_created', {
    link_id: data.id,
    document_id: input.documentId,
    folder_id: input.folderId,
    project_id: input.projectId,
    expires_at: input.expiresAt,
  }, user.id)

  // Generate the full URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = `${baseUrl}/vdr/share/${token}`

  return { success: true, data: { ...data, url } }
}

/**
 * Revoke a shared link
 */
export async function revokeSharedLink(linkId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('vdr_shared_links')
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
    })
    .eq('id', linkId)
    .select('project_id')
    .single()

  if (error) {
    console.error('Error revoking shared link:', error)
    return { success: false, error: error.message }
  }

  await logAuditEvent('vdr.link_revoked', {
    link_id: linkId,
    project_id: data?.project_id,
  }, user.id)

  return { success: true }
}

/**
 * List shared links for a project (active only)
 */
export async function listSharedLinks(projectId: string): Promise<{
  success: boolean
  data?: VdrSharedLink[]
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_shared_links')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listing shared links:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * List all shared links for a project with document/folder details (for VdrLinksPanel)
 * Includes active, expired, and revoked links
 */
export async function listSharedLinksWithDetails(projectId: string): Promise<{
  success: boolean
  data?: Array<VdrSharedLink & {
    document: { id: string; name: string } | null
    folder: { id: string; name: string } | null
    status: 'active' | 'expired' | 'revoked' | 'max_views_reached'
  }>
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_shared_links')
    .select(`
      *,
      document:vdr_documents!document_id(id, name),
      folder:vdr_folders!folder_id(id, name)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listing shared links with details:', error)
    return { success: false, error: error.message }
  }

  // Calculate status for each link
  const now = new Date()
  const linksWithStatus = data.map(link => {
    let status: 'active' | 'expired' | 'revoked' | 'max_views_reached' = 'active'

    if (!link.is_active || link.revoked_at) {
      status = 'revoked'
    } else if (link.expires_at && new Date(link.expires_at) < now) {
      status = 'expired'
    } else if (link.max_views && (link.view_count ?? 0) >= link.max_views) {
      status = 'max_views_reached'
    }

    return {
      ...link,
      document: link.document ?? null,
      folder: link.folder ?? null,
      status,
    }
  })

  return { success: true, data: linksWithStatus as any }
}

/**
 * Validate and get shared link by token
 */
export async function getSharedLinkByToken(token: string): Promise<{
  success: boolean
  data?: VdrSharedLink & { document?: VdrDocument | null; folder?: VdrFolder | null }
  error?: string
  requiresPassword?: boolean
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vdr_shared_links')
    .select(`
      *,
      document:vdr_documents(*),
      folder:vdr_folders(*)
    `)
    .eq('token', token)
    .single()

  if (error || !data) {
    return { success: false, error: 'Link not found' }
  }

  // Check if link is active
  if (!data.is_active) {
    return { success: false, error: 'Link has been revoked' }
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { success: false, error: 'Link has expired' }
  }

  // Check max views
  if (data.max_views && (data.view_count ?? 0) >= data.max_views) {
    return { success: false, error: 'Link has reached maximum views' }
  }

  // Transform data to match expected type
  const result = {
    ...data,
    document: data.document ?? undefined,
    folder: data.folder ?? undefined,
  }

  // Check if password required
  if (data.password_hash) {
    return { success: true, data: result, requiresPassword: true }
  }

  return { success: true, data: result }
}

/**
 * Validate shared link for public (unauthenticated) access.
 * Uses admin client to bypass RLS since there's no logged-in user.
 * This function is designed for the public /vdr/share/[token] route.
 */
export async function validatePublicSharedLink(
  token: string,
  password?: string
): Promise<{
  success: boolean
  data?: VdrSharedLink & { document?: VdrDocument | null; folder?: VdrFolder | null }
  error?: string
  requiresPassword?: boolean
}> {
  const supabase = await createAdminClient() // bypasses RLS

  const { data, error } = await supabase
    .from('vdr_shared_links')
    .select(`
      *,
      document:vdr_documents(*),
      folder:vdr_folders(*)
    `)
    .eq('token', token)
    .single()

  if (error || !data) {
    return { success: false, error: 'Link não encontrado' }
  }

  // Check if link is active
  if (!data.is_active) {
    return { success: false, error: 'Link foi revogado' }
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { success: false, error: 'Link expirado' }
  }

  // Check max views
  if (data.max_views && (data.view_count ?? 0) >= data.max_views) {
    return { success: false, error: 'Limite de visualizações atingido' }
  }

  // Transform data to match expected type
  const result = {
    ...data,
    document: data.document ?? undefined,
    folder: data.folder ?? undefined,
  }

  // Check if password is required but not provided
  if (data.password_hash && !password) {
    return { success: true, data: result, requiresPassword: true }
  }

  // Verify password with bcrypt if provided (with rate limiting and audit)
  if (data.password_hash && password) {
    const ip = await getRequestIpAddress()
    const rateLimitId = `vdr:${token}:${ip}`

    const rateLimitResult = await checkRateLimit(rateLimitId, 'shared_link_attempt')
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: `Muitas tentativas. Tente novamente em ${rateLimitResult.retryAfterSeconds || 30} segundos.`,
      }
    }

    try {
      const valid = await bcrypt.compare(password, data.password_hash)
      if (!valid) {
        await logAuditEvent(
          'vdr.shared_link_validation_failed',
          { token_prefix: token.substring(0, 8) + '***', link_id: data.id, project_id: data.project_id },
          undefined,
          undefined,
          { ipAddress: ip }
        )
        return { success: false, error: 'Senha incorreta' }
      }
      await resetRateLimit(rateLimitId, 'shared_link_attempt')
    } catch (err) {
      console.error('bcrypt.compare error:', err)
      return { success: false, error: 'Erro ao validar senha. Tente novamente.' }
    }
  }

  // Increment view_count only after successful validation
  await supabase
    .from('vdr_shared_links')
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq('id', data.id)

  // Send notification to link creator (V1-16)
  await notifyLinkAccess(supabase, data)

  return { success: true, data: result }
}

/**
 * Internal helper to notify link creator when someone accesses their shared link
 */
async function notifyLinkAccess(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  link: {
    id: string
    created_by: string
    project_id: string
    document_id: string | null
    folder_id: string | null
    view_count: number | null
    document?: { name: string } | null
    folder?: { name: string } | null
  }
) {
  try {
    const targetName = link.folder?.name || link.document?.name || 'VDR'
    const targetType = link.folder ? 'pasta' : 'documento'
    const viewCount = (link.view_count ?? 0) + 1 // +1 because we just incremented

    // Get project codename for the action URL
    const { data: project } = await supabase
      .from('projects')
      .select('codename, organization_id')
      .eq('id', link.project_id)
      .single()

    // Get org slug for the action URL
    let actionUrl: string | undefined
    if (project) {
      const { data: org } = await supabase
        .from('organizations')
        .select('slug')
        .eq('id', project.organization_id)
        .single()

      if (org) {
        actionUrl = `/${org.slug}/projects/${project.codename}/vdr`
      }
    }

    // Create notification for link creator
    // Using 'as any' because notifications table is not in generated types yet
    await supabase
      .from('notifications' as any)
      .insert({
        user_id: link.created_by,
        type: 'vdr.link_accessed',
        title: `Link acessado: ${targetName}`,
        body: `Alguém acessou seu link compartilhado para ${targetType} "${targetName}". Total de visualizações: ${viewCount}.`,
        data: {
          link_id: link.id,
          project_id: link.project_id,
          document_id: link.document_id,
          folder_id: link.folder_id,
          view_count: viewCount,
          target_name: targetName,
          target_type: targetType,
        },
        action_url: actionUrl,
      })
  } catch (err) {
    // Don't fail the main operation if notification fails
    console.error('Error sending link access notification:', err)
  }
}
