'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type { Json, Database } from '@/types/database'
import type {
  ActionResult,
  ProjectInvite,
  ProjectInviteWithDetails,
  ProjectMemberRole,
} from '@/types/projects'
import { sendProjectInviteEmail } from '@/lib/email/send-project-invite'
import { createNotification } from './notifications'

// ============================================
// Constants
// ============================================

const MAX_PROJECT_INVITES = 20
const INVITE_EXPIRY_DAYS = 7

// ============================================
// Helper: Log audit event
// ============================================

async function logProjectInviteAuditEvent(
  action: string,
  userId: string,
  projectId: string,
  orgId: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createAdminClient()
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')

  await supabase.from('audit_logs').insert({
    action: action as Database['public']['Enums']['audit_action'],
    user_id: userId,
    organization_id: orgId,
    metadata: { ...metadata, project_id: projectId } as Json,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// ============================================
// Helper: Validate email
// ============================================

function isValidEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
}

// ============================================
// Create Project Invite
// ============================================

export async function createProjectInvite(
  projectId: string,
  email: string,
  role: ProjectMemberRole = 'viewer'
): Promise<ActionResult<ProjectInvite>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Validate email
    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmail(normalizedEmail)) {
      return { success: false, error: 'Email inválido' }
    }

    // Block self-invite
    if (normalizedEmail === user.email?.toLowerCase()) {
      return { success: false, error: 'Você não pode convidar a si mesmo' }
    }

    // Get project with org info
    const { data: project } = await supabase
      .from('projects')
      .select('id, codename, organization_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (!project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Check if already a member
    const adminSupabase = await createAdminClient()
    const { data: targetLookup } = await (adminSupabase.auth.admin as any).getUserByEmail(normalizedEmail)
    const targetUser = targetLookup?.user as { id: string } | null

    if (targetUser) {
      const { data: existingMember } = await adminSupabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', targetUser.id)
        .single()

      if (existingMember) {
        return { success: false, error: 'Este usuário já é membro do projeto' }
      }

      // Check org membership
      const { data: orgMember } = await adminSupabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', project.organization_id)
        .eq('user_id', targetUser.id)
        .single()

      if (!orgMember) {
        return { success: false, error: 'O usuário precisa ser membro da organização primeiro' }
      }
    }

    // Check duplicate invite
    const { data: existingInvite } = await supabase
      .from('project_invites')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', normalizedEmail)
      .single()

    if (existingInvite) {
      return { success: false, error: 'Já existe um convite pendente para este email' }
    }

    // Check invite limit
    const { count } = await supabase
      .from('project_invites')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)

    if ((count || 0) >= MAX_PROJECT_INVITES) {
      return { success: false, error: `Limite de ${MAX_PROJECT_INVITES} convites pendentes atingido` }
    }

    // Create invite
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS)

    const { data: inviteRaw, error: insertError } = await supabase
      .from('project_invites')
      .insert({
        project_id: projectId,
        email: normalizedEmail,
        role,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    const invite = inviteRaw as unknown as ProjectInvite | null

    if (insertError || !invite) {
      console.error('Error creating project invite:', insertError)
      if (insertError?.code === '23505') {
        return { success: false, error: 'Já existe um convite pendente para este email' }
      }
      return { success: false, error: 'Erro ao criar convite' }
    }

    // Get org info for email
    const { data: org } = await adminSupabase
      .from('organizations')
      .select('name, slug')
      .eq('id', project.organization_id)
      .single()

    // Send invite email
    await sendProjectInviteEmail({
      recipientEmail: normalizedEmail,
      projectCodename: project.codename,
      organizationName: org?.name || '',
      organizationSlug: org?.slug || '',
      inviterUserId: user.id,
      inviterEmail: user.email,
      role,
      inviteToken: invite.token,
      expiresAt,
    })

    // Create notification if user exists on platform
    if (targetUser) {
      await createNotification({
        userId: targetUser.id,
        type: 'project.invite_received',
        title: 'Convite para projeto',
        body: `Você foi convidado para o projeto ${project.codename}`,
        data: { projectId, projectCodename: project.codename, role },
        actionUrl: `/invite/project/${invite.token}`,
      })
    }

    await logProjectInviteAuditEvent('project.invite_sent', user.id, projectId, project.organization_id, {
      email: normalizedEmail,
      role,
    })

    return { success: true, data: invite }
  } catch (error) {
    console.error('Unexpected error in createProjectInvite:', error)
    return { success: false, error: 'Erro inesperado ao criar convite' }
  }
}

// ============================================
// Accept Project Invite
// ============================================

export async function acceptProjectInvite(
  token: string
): Promise<ActionResult<{ projectId: string; orgSlug: string; codename: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const adminSupabase = await createAdminClient()

    // Get invite
    const { data: inviteRaw2, error: inviteError } = await adminSupabase
      .from('project_invites')
      .select('*, projects(id, codename, organization_id, organizations(slug))')
      .eq('token', token)
      .single()

    const invite = inviteRaw2 as any

    if (inviteError || !invite) {
      return { success: false, error: 'Convite não encontrado ou já utilizado' }
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      return { success: false, error: 'Este convite expirou' }
    }

    // Check email match
    if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
      return { success: false, error: 'Este convite foi enviado para outro email' }
    }

    const project = invite.projects as unknown as {
      id: string
      codename: string
      organization_id: string
      organizations: { slug: string }
    }

    if (!project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Check org membership (blocker #2)
    const { data: orgMember } = await adminSupabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', project.organization_id)
      .eq('user_id', user.id)
      .single()

    if (!orgMember) {
      return { success: false, error: 'Você precisa ser membro da organização para aceitar este convite' }
    }

    // Create project member (preserve designation and metadata from invite)
    const { error: memberError } = await adminSupabase
      .from('project_members')
      .insert({
        project_id: project.id,
        user_id: user.id,
        role: invite.role,
        designation: invite.designation || 'member',
        metadata: invite.metadata || {},
        added_by: invite.invited_by,
      })

    if (memberError) {
      console.error('Error creating project member from invite:', memberError)
      if (memberError.code === '23505') {
        // Already a member, just delete invite
        await adminSupabase.from('project_invites').delete().eq('id', invite.id)
        return { success: true, data: { projectId: project.id, orgSlug: project.organizations.slug, codename: project.codename } }
      }
      return { success: false, error: 'Erro ao aceitar convite' }
    }

    // Delete invite
    await adminSupabase.from('project_invites').delete().eq('id', invite.id)

    // Notify inviter
    await createNotification({
      userId: invite.invited_by,
      type: 'project.invite_accepted',
      title: 'Convite aceito',
      body: `${user.email} aceitou o convite para o projeto ${project.codename}`,
      data: { projectId: project.id, acceptedBy: user.id },
      actionUrl: `/${project.organizations.slug}/projects/${project.codename}/members`,
    })

    await logProjectInviteAuditEvent('project.invite_accepted', user.id, project.id, project.organization_id, {
      email: invite.email,
      role: invite.role,
      invited_by: invite.invited_by,
    })

    return { success: true, data: { projectId: project.id, orgSlug: project.organizations.slug, codename: project.codename } }
  } catch (error) {
    console.error('Unexpected error in acceptProjectInvite:', error)
    return { success: false, error: 'Erro inesperado ao aceitar convite' }
  }
}

// ============================================
// Cancel Project Invite
// ============================================

export async function cancelProjectInvite(
  inviteId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get invite for audit
    const { data: inviteRaw3 } = await supabase
      .from('project_invites')
      .select('project_id, email, projects(organization_id)')
      .eq('id', inviteId)
      .single()

    const invite = inviteRaw3 as any

    if (!invite) {
      return { success: false, error: 'Convite não encontrado' }
    }

    const { error: deleteError } = await supabase
      .from('project_invites')
      .delete()
      .eq('id', inviteId)

    if (deleteError) {
      console.error('Error cancelling project invite:', deleteError)
      return { success: false, error: 'Erro ao cancelar convite' }
    }

    const orgId = (invite.projects as unknown as { organization_id: string })?.organization_id
    if (orgId) {
      await logProjectInviteAuditEvent('project.invite_cancelled', user.id, invite.project_id, orgId, {
        email: invite.email,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in cancelProjectInvite:', error)
    return { success: false, error: 'Erro inesperado ao cancelar convite' }
  }
}

// ============================================
// List Project Invites
// ============================================

export async function listProjectInvites(
  projectId: string
): Promise<ActionResult<ProjectInvite[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { data: invites, error: fetchError } = await supabase
      .from('project_invites')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error listing project invites:', fetchError)
      return { success: false, error: 'Erro ao listar convites' }
    }

    return { success: true, data: (invites || []) as unknown as ProjectInvite[] }
  } catch (error) {
    console.error('Unexpected error in listProjectInvites:', error)
    return { success: false, error: 'Erro inesperado ao listar convites' }
  }
}

// ============================================
// Resend Project Invite
// ============================================

export async function resendProjectInvite(
  inviteId: string
): Promise<ActionResult<ProjectInvite>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get invite
    const { data: inviteRaw4 } = await supabase
      .from('project_invites')
      .select('*, projects(id, codename, organization_id, organizations(name, slug))')
      .eq('id', inviteId)
      .single()

    const invite = inviteRaw4 as any

    if (!invite) {
      return { success: false, error: 'Convite não encontrado' }
    }

    // Reset expiry
    const newExpiry = new Date()
    newExpiry.setDate(newExpiry.getDate() + INVITE_EXPIRY_DAYS)

    const adminSupabase = await createAdminClient()
    const { data: updatedRaw, error: updateError } = await adminSupabase
      .from('project_invites')
      .update({ expires_at: newExpiry.toISOString() })
      .eq('id', inviteId)
      .select()
      .single()

    if (updateError || !updatedRaw) {
      console.error('Error resending project invite:', updateError)
      return { success: false, error: 'Erro ao reenviar convite' }
    }

    const project = invite.projects as {
      id: string
      codename: string
      organization_id: string
      organizations: { name: string; slug: string }
    }

    // Resend email
    await sendProjectInviteEmail({
      recipientEmail: invite.email,
      projectCodename: project.codename,
      organizationName: project.organizations.name,
      organizationSlug: project.organizations.slug,
      inviterUserId: user.id,
      inviterEmail: user.email,
      role: invite.role as ProjectMemberRole,
      inviteToken: invite.token,
      expiresAt: newExpiry,
    })

    return { success: true, data: updatedRaw as unknown as ProjectInvite }
  } catch (error) {
    console.error('Unexpected error in resendProjectInvite:', error)
    return { success: false, error: 'Erro inesperado ao reenviar convite' }
  }
}

// ============================================
// Get Project Invite by Token (Public)
// ============================================

export async function getProjectInviteByToken(
  token: string
): Promise<ActionResult<ProjectInviteWithDetails>> {
  try {
    const adminSupabase = await createAdminClient()

    const { data: inviteRaw5, error } = await adminSupabase
      .from('project_invites')
      .select('*, projects(id, codename, organization_id, organizations(name, slug))')
      .eq('token', token)
      .single()

    const invite = inviteRaw5 as any

    if (error || !invite) {
      return { success: false, error: 'Convite não encontrado' }
    }

    // Get inviter info
    const { data: { user: inviter } } = await adminSupabase.auth.admin.getUserById(invite.invited_by)

    const project = invite.projects as {
      id: string
      codename: string
      organization_id: string
      organizations: { name: string; slug: string }
    }

    const result: ProjectInviteWithDetails = {
      id: invite.id,
      project_id: invite.project_id,
      email: invite.email,
      role: invite.role as ProjectMemberRole,
      token: invite.token,
      expires_at: invite.expires_at,
      invited_by: invite.invited_by,
      created_at: invite.created_at,
      project: {
        id: project.id,
        codename: project.codename,
        organization_id: project.organization_id,
      },
      inviter: inviter ? {
        email: inviter.email || '',
        full_name: (inviter.user_metadata as Record<string, string> | undefined)?.full_name,
      } : undefined,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error in getProjectInviteByToken:', error)
    return { success: false, error: 'Erro inesperado ao buscar convite' }
  }
}
