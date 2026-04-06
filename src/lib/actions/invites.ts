'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { sendInviteEmail, resendInviteEmail as resendInviteEmailService } from '@/lib/email/send-invite'
import type {
  OrganizationInvite,
  OrganizationMember,
  MemberRole,
  Json,
  Database,
} from '@/types/database'

// ============================================
// Types
// ============================================

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateInviteInput {
  email: string
  role?: MemberRole
}

export interface InviteWithOrganization extends OrganizationInvite {
  organization?: {
    id: string
    name: string
    slug: string
    profile_type: string
  }
  inviter?: {
    email: string
    full_name?: string
  }
}

// ============================================
// Constants
// ============================================

const MAX_PENDING_INVITES = 10

// ============================================
// Helper: Log audit event
// ============================================

async function logInviteAuditEvent(
  action: string,
  userId: string,
  orgId: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createAdminClient()
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')

  await supabase.from('audit_logs').insert({
    action: action as Database["public"]["Enums"]["audit_action"],
    user_id: userId,
    organization_id: orgId,
    metadata: metadata as Json,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// ============================================
// Helper: Validate email format
// ============================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return emailRegex.test(email)
}

// ============================================
// 2.2.7 - Criar convite
// POST /organizations/:id/invites equivalent
// ============================================

export async function createInvite(
  orgId: string,
  input: CreateInviteInput
): Promise<ActionResult<OrganizationInvite>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Validate email format
    const email = input.email.toLowerCase().trim()
    if (!isValidEmail(email)) {
      return { success: false, error: 'Email inválido' }
    }

    // Check if user is already a member
    const adminSupabase = await createAdminClient()
    
    // Find user by email
    const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers()
    const existingUser = users?.find(u => u.email?.toLowerCase() === email)
    
    if (existingUser) {
      // Check if already a member
      const { data: existingMember } = await adminSupabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', existingUser.id)
        .single()

      if (existingMember) {
        return { success: false, error: 'Este usuário já é membro da organização' }
      }
    }

    // Check if invite already exists for this email
    const { data: existingInvite } = await supabase
      .from('organization_invites')
      .select('id, expires_at')
      .eq('organization_id', orgId)
      .eq('email', email)
      .single() as { data: { id: string; expires_at: string } | null; error: unknown }

    if (existingInvite) {
      const expiresAt = new Date(existingInvite.expires_at)
      if (expiresAt > new Date()) {
        return { success: false, error: 'Já existe um convite pendente para este email' }
      }
      // Delete expired invite
      await supabase
        .from('organization_invites')
        .delete()
        .eq('id', existingInvite.id)
    }

    // Check pending invites limit (trigger will also validate, but better UX to check here)
    const { count } = await supabase
      .from('organization_invites')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gt('expires_at', new Date().toISOString())

    if (count && count >= MAX_PENDING_INVITES) {
      return { 
        success: false, 
        error: `Limite de ${MAX_PENDING_INVITES} convites pendentes atingido` 
      }
    }

    // Create invite (RLS enforces owner/admin permission)
    const inviteData = {
      organization_id: orgId,
      email,
      role: input.role || 'member',
      invited_by: user.id,
    }
    // Type assertion needed due to Supabase client type inference issues
    type InsertFn = (data: typeof inviteData) => ReturnType<ReturnType<typeof supabase.from>['insert']>
    const { data: invite, error: inviteError } = await (supabase
      .from('organization_invites')
      .insert as unknown as InsertFn)(inviteData)
      .select()
      .single() as { data: OrganizationInvite | null; error: Error | null }

    if (inviteError) {
      console.error('Error creating invite:', inviteError)
      if (inviteError.message?.includes('validate_invite_limit')) {
        return { 
          success: false, 
          error: `Limite de ${MAX_PENDING_INVITES} convites pendentes atingido` 
        }
      }
      return { success: false, error: 'Erro ao criar convite' }
    }

    // Get organization details for email
    const { data: org } = await supabase
      .from('organizations')
      .select('name, slug')
      .eq('id', orgId)
      .single() as { data: { name: string; slug: string } | null; error: unknown }

    // Send invite email (works in mock mode without Brevo credentials)
    if (org && invite) {
      await sendInviteEmail({
        recipientEmail: email,
        organizationId: orgId,
        organizationName: org.name,
        organizationSlug: org.slug,
        inviterUserId: user.id,
        inviterEmail: user.email || undefined,
        role: (input.role || 'member') as 'owner' | 'admin' | 'member' | 'viewer',
        inviteToken: invite.token,
        expiresAt: new Date(invite.expires_at),
      })
    }

    // Log audit event (email send is logged separately in sendInviteEmail)
    if (invite) {
      await logInviteAuditEvent('org.invite_sent', user.id, orgId, {
        invite_id: invite.id,
        email,
        role: input.role || 'member',
      })
    }

    return { success: true, data: invite ?? undefined }
  } catch (error) {
    console.error('Unexpected error in createInvite:', error)
    return { success: false, error: 'Erro inesperado ao criar convite' }
  }
}

// ============================================
// 2.2.8 - Aceitar convite
// POST /invites/:token/accept equivalent
// ============================================

export async function acceptInvite(
  token: string
): Promise<ActionResult<OrganizationMember>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Find invite by token (using admin client to bypass RLS)
    const adminSupabase = await createAdminClient()
    const { data: invite, error: inviteError } = await adminSupabase
      .from('organization_invites')
      .select(`
        *,
        organizations (
          id,
          name,
          slug,
          profile_type,
          deleted_at
        )
      `)
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return { success: false, error: 'Convite não encontrado' }
    }

    // Check if organization still exists
    const org = (invite as any).organizations
    if (!org || org.deleted_at) {
      return { success: false, error: 'Organização não existe mais' }
    }

    // Check if invite is expired
    const expiresAt = new Date(invite.expires_at)
    if (expiresAt < new Date()) {
      // Log and delete expired invite
      await logInviteAuditEvent('org.invite_expired', user.id, invite.organization_id, {
        invite_id: invite.id,
        email: invite.email,
      })
      await adminSupabase
        .from('organization_invites')
        .delete()
        .eq('id', invite.id)
      return { success: false, error: 'Convite expirado' }
    }

    // Check if email matches
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      return { 
        success: false, 
        error: 'Este convite foi enviado para outro email' 
      }
    }

    // Check if user is already a member
    const { data: existingMember } = await adminSupabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', invite.organization_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      // Delete the invite since user is already a member
      await adminSupabase
        .from('organization_invites')
        .delete()
        .eq('id', invite.id)
      return { success: false, error: 'Você já é membro desta organização' }
    }

    // Create membership
    const { data: member, error: memberError } = await adminSupabase
      .from('organization_members')
      .insert({
        organization_id: invite.organization_id,
        user_id: user.id,
        role: invite.role,
        verification_status: 'pending',
        invited_by: invite.invited_by,
      })
      .select()
      .single()

    if (memberError) {
      console.error('Error creating membership:', memberError)
      return { success: false, error: 'Erro ao aceitar convite' }
    }

    // Delete the invite
    await adminSupabase
      .from('organization_invites')
      .delete()
      .eq('id', invite.id)

    // Log audit event
    await logInviteAuditEvent('org.invite_accepted', user.id, invite.organization_id, {
      invite_id: invite.id,
      member_id: member.id,
      role: invite.role,
    })

    await logInviteAuditEvent('org.member_added', user.id, invite.organization_id, {
      member_id: member.id,
      via: 'invite',
      role: invite.role,
    })

    return { success: true, data: member }
  } catch (error) {
    console.error('Unexpected error in acceptInvite:', error)
    return { success: false, error: 'Erro inesperado ao aceitar convite' }
  }
}

// ============================================
// 2.2.9 - Cancelar convite
// DELETE /invites/:id equivalent
// ============================================

export async function cancelInvite(
  inviteId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get invite (RLS will check if user has permission)
    const { data: invite, error: fetchError } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('id', inviteId)
      .single() as { data: OrganizationInvite | null; error: Error | null }

    if (fetchError || !invite) {
      return { success: false, error: 'Convite não encontrado' }
    }

    // Delete invite (RLS enforces owner/admin or invitee permission)
    const { error: deleteError } = await supabase
      .from('organization_invites')
      .delete()
      .eq('id', inviteId)

    if (deleteError) {
      console.error('Error deleting invite:', deleteError)
      return { success: false, error: 'Erro ao cancelar convite' }
    }

    // Log audit event
    await logInviteAuditEvent('org.invite_cancelled', user.id, invite.organization_id, {
      invite_id: inviteId,
      email: invite.email,
      role: invite.role,
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in cancelInvite:', error)
    return { success: false, error: 'Erro inesperado ao cancelar convite' }
  }
}

// ============================================
// Helper: List pending invites for an organization
// ============================================

export async function listPendingInvites(
  orgId: string
): Promise<ActionResult<OrganizationInvite[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get pending invites (RLS enforces owner/admin permission)
    const { data: invites, error: invitesError } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('organization_id', orgId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (invitesError) {
      console.error('Error fetching invites:', invitesError)
      return { success: false, error: 'Erro ao buscar convites' }
    }

    return { success: true, data: invites || [] }
  } catch (error) {
    console.error('Unexpected error in listPendingInvites:', error)
    return { success: false, error: 'Erro inesperado ao buscar convites' }
  }
}

// ============================================
// Helper: Get invite by token (public)
// ============================================

export async function getInviteByToken(
  token: string
): Promise<ActionResult<InviteWithOrganization>> {
  try {
    const supabase = await createClient()
    
    // Get current user (optional - invite can be viewed without auth)
    const { data: { user } } = await supabase.auth.getUser()

    // Use admin client to fetch invite details
    const adminSupabase = await createAdminClient()
    const { data: invite, error: inviteError } = await adminSupabase
      .from('organization_invites')
      .select(`
        *,
        organizations (
          id,
          name,
          slug,
          profile_type
        )
      `)
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return { success: false, error: 'Convite não encontrado' }
    }

    // Check if expired
    const expiresAt = new Date(invite.expires_at)
    if (expiresAt < new Date()) {
      return { success: false, error: 'Convite expirado' }
    }

    // Get inviter details
    const { data: { users } } = await adminSupabase.auth.admin.listUsers()
    const inviter = users?.find(u => u.id === invite.invited_by)

    const org = (invite as any).organizations
    const result: InviteWithOrganization = {
      ...invite,
      organization: org ? {
        id: org.id,
        name: org.name,
        slug: org.slug,
        profile_type: org.profile_type,
      } : undefined,
      inviter: inviter ? {
        email: inviter.email || '',
        full_name: (inviter.user_metadata as { full_name?: string } | undefined)?.full_name,
      } : undefined,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error in getInviteByToken:', error)
    return { success: false, error: 'Erro inesperado ao buscar convite' }
  }
}

// ============================================
// Helper: Resend invite (reset expiration)
// ============================================

export async function resendInvite(
  inviteId: string
): Promise<ActionResult<OrganizationInvite>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get invite (RLS will check permission)
    const { data: invite, error: fetchError } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('id', inviteId)
      .single() as { data: OrganizationInvite | null; error: Error | null }

    if (fetchError || !invite) {
      return { success: false, error: 'Convite não encontrado' }
    }

    // Generate new expiration (7 days from now)
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7)

    // Update expiration using admin client
    const adminSupabase = await createAdminClient()
    const { data: updatedInvite, error: updateError } = await adminSupabase
      .from('organization_invites')
      .update({ 
        expires_at: newExpiresAt.toISOString(),
      })
      .eq('id', inviteId)
      .select()
      .single() as { data: OrganizationInvite | null; error: Error | null }

    if (updateError) {
      console.error('Error resending invite:', updateError)
      return { success: false, error: 'Erro ao reenviar convite' }
    }

    // Send email using the dedicated service
    await resendInviteEmailService(inviteId, user.id)

    // Log audit event
    await logInviteAuditEvent('org.invite_sent', user.id, invite.organization_id, {
      invite_id: inviteId,
      email: invite.email,
      role: invite.role,
      resent: true,
    })

    return { success: true, data: updatedInvite ?? undefined }
  } catch (error) {
    console.error('Unexpected error in resendInvite:', error)
    return { success: false, error: 'Erro inesperado ao reenviar convite' }
  }
}

