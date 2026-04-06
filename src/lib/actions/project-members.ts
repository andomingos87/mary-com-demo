'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type { Json, Database } from '@/types/database'
import type {
  ActionResult,
  ProjectMember,
  ProjectMemberWithUser,
  ProjectMemberRole,
} from '@/types/projects'

// ============================================
// Constants
// ============================================

const MAX_RESPONSIBLES_PER_PROJECT = 10

// ============================================
// Types for Responsibles
// ============================================

export interface ProjectResponsible {
  id: string
  project_id: string
  user_id: string
  role: ProjectMemberRole
  designation: 'responsible'
  metadata: {
    cargo?: string
    phone?: string
  }
  added_by: string | null
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
}

export interface PendingResponsible {
  id: string
  project_id: string
  email: string
  designation: 'responsible'
  metadata: {
    cargo?: string
    phone?: string
  }
  status: 'pending'
  created_at: string
}

export type ResponsibleItem = (ProjectResponsible & { status: 'active' }) | PendingResponsible

// ============================================
// Helper: Log audit event
// ============================================

async function logProjectMemberAuditEvent(
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
// Check Project Access
// ============================================

export async function checkProjectAccess(
  projectId: string,
  userId: string
): Promise<ActionResult<{ hasAccess: boolean; role: ProjectMemberRole | 'admin' | null }>> {
  try {
    const adminSupabase = await createAdminClient()

    // Get project with org info
    const { data: project, error } = await adminSupabase
      .from('projects')
      .select('id, organization_id, created_by, visibility')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (error || !project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Check if user is org admin/owner
    const { data: orgMember } = await adminSupabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', project.organization_id)
      .eq('user_id', userId)
      .single()

    if (orgMember?.role === 'admin' || orgMember?.role === 'owner') {
      return { success: true, data: { hasAccess: true, role: 'admin' } }
    }

    // Check if user is project member
    const { data: projectMember } = await adminSupabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectMember) {
      return { success: true, data: { hasAccess: true, role: projectMember.role as ProjectMemberRole } }
    }

    // Check if project is public and user is org member
    if (project.visibility === 'public' && orgMember) {
      return { success: true, data: { hasAccess: true, role: 'viewer' } }
    }

    return { success: true, data: { hasAccess: false, role: null } }
  } catch (error) {
    console.error('Unexpected error in checkProjectAccess:', error)
    return { success: false, error: 'Erro ao verificar acesso' }
  }
}

// ============================================
// Add Project Member
// ============================================

export async function addProjectMember(
  projectId: string,
  targetUserId: string,
  role: ProjectMemberRole,
  designation: 'member' | 'responsible' = 'member',
  metadata?: { cargo?: string; phone?: string }
): Promise<ActionResult<ProjectMember>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get project for org_id
    const { data: project } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (!project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    const { data: member, error: insertError } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: targetUserId,
        role,
        designation,
        metadata: (metadata || {}) as unknown as Json,
        added_by: user.id,
      })
      .select()
      .single()

    if (insertError || !member) {
      console.error('Error adding project member:', insertError)
      if (insertError?.code === '23505') {
        return { success: false, error: 'Usuário já é membro deste projeto' }
      }
      return { success: false, error: 'Erro ao adicionar membro' }
    }

    const auditAction = designation === 'responsible' ? 'project.responsible_added' : 'project.member_added'
    await logProjectMemberAuditEvent(auditAction, user.id, projectId, project.organization_id, {
      target_user_id: targetUserId,
      role,
      designation,
    })

    return { success: true, data: member as unknown as ProjectMember }
  } catch (error) {
    console.error('Unexpected error in addProjectMember:', error)
    return { success: false, error: 'Erro inesperado ao adicionar membro' }
  }
}

// ============================================
// Remove Project Member
// ============================================

export async function removeProjectMember(
  projectId: string,
  targetUserId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (!project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Get designation before deleting for audit
    const adminSupabase = await createAdminClient()
    const { data: existingMember } = await adminSupabase
      .from('project_members')
      .select('designation')
      .eq('project_id', projectId)
      .eq('user_id', targetUserId)
      .single()

    const { error: deleteError } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', targetUserId)

    if (deleteError) {
      console.error('Error removing project member:', deleteError)
      return { success: false, error: 'Erro ao remover membro' }
    }

    const auditAction = existingMember?.designation === 'responsible'
      ? 'project.responsible_removed'
      : 'project.member_removed'

    await logProjectMemberAuditEvent(auditAction, user.id, projectId, project.organization_id, {
      target_user_id: targetUserId,
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in removeProjectMember:', error)
    return { success: false, error: 'Erro inesperado ao remover membro' }
  }
}

// ============================================
// List Project Members
// ============================================

export async function listProjectMembers(
  projectId: string
): Promise<ActionResult<ProjectMemberWithUser[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { data: members, error: fetchError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error listing project members:', fetchError)
      return { success: false, error: 'Erro ao listar membros' }
    }

    if (!members || members.length === 0) {
      return { success: true, data: [] }
    }

    // Fetch user details via admin client
    const adminSupabase = await createAdminClient()
    const { data: { users } } = await adminSupabase.auth.admin.listUsers()

    const userMap = new Map(users?.map(u => [u.id, u]) || [])

    const membersWithUsers: ProjectMemberWithUser[] = members.map((m) => {
      const authUser = userMap.get(m.user_id)
      return {
        id: m.id,
        project_id: m.project_id,
        user_id: m.user_id,
        role: m.role as ProjectMemberRole,
        added_by: m.added_by,
        added_at: m.created_at,
        user: authUser ? {
          id: authUser.id,
          email: authUser.email || '',
          user_metadata: {
            full_name: (authUser.user_metadata as Record<string, string> | undefined)?.full_name,
            avatar_url: (authUser.user_metadata as Record<string, string> | undefined)?.avatar_url,
          },
        } : undefined,
      }
    })

    return { success: true, data: membersWithUsers }
  } catch (error) {
    console.error('Unexpected error in listProjectMembers:', error)
    return { success: false, error: 'Erro inesperado ao listar membros' }
  }
}

// ============================================
// Update Project Member Role
// ============================================

export async function updateProjectMemberRole(
  projectId: string,
  targetUserId: string,
  newRole: ProjectMemberRole
): Promise<ActionResult<ProjectMember>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (!project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Get current role for audit
    const { data: currentMember } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', targetUserId)
      .single()

    if (!currentMember) {
      return { success: false, error: 'Membro não encontrado' }
    }

    const { data: updated, error: updateError } = await supabase
      .from('project_members')
      .update({ role: newRole })
      .eq('project_id', projectId)
      .eq('user_id', targetUserId)
      .select()
      .single()

    if (updateError || !updated) {
      console.error('Error updating project member role:', updateError)
      return { success: false, error: 'Erro ao atualizar papel' }
    }

    await logProjectMemberAuditEvent('project.member_role_changed', user.id, projectId, project.organization_id, {
      target_user_id: targetUserId,
      old_role: currentMember.role,
      new_role: newRole,
    })

    return { success: true, data: updated as unknown as ProjectMember }
  } catch (error) {
    console.error('Unexpected error in updateProjectMemberRole:', error)
    return { success: false, error: 'Erro inesperado ao atualizar papel' }
  }
}

// ============================================
// Add Project Responsible
// ============================================

export async function addProjectResponsible(
  projectId: string,
  email: string,
  cargo?: string,
  phone?: string
): Promise<ActionResult<{ status: 'added' | 'invited'; email: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(normalizedEmail)) {
      return { success: false, error: 'Email inválido' }
    }

    // Get project
    const { data: project } = await supabase
      .from('projects')
      .select('id, codename, organization_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (!project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Check responsible limit
    const adminSupabase = await createAdminClient()

    const { count: memberCount } = await adminSupabase
      .from('project_members')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('designation', 'responsible')

    const { count: inviteCount } = await adminSupabase
      .from('project_invites')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('designation', 'responsible')
      .eq('status', 'pending')

    const totalResponsibles = (memberCount || 0) + (inviteCount || 0)
    if (totalResponsibles >= MAX_RESPONSIBLES_PER_PROJECT) {
      return { success: false, error: `Limite de ${MAX_RESPONSIBLES_PER_PROJECT} responsáveis atingido` }
    }

    const meta = { cargo: cargo || undefined, phone: phone || undefined }

    // Lookup user by email
    const { data: { users } } = await adminSupabase.auth.admin.listUsers()
    const targetUser = users?.find(u => u.email?.toLowerCase() === normalizedEmail)

    if (targetUser) {
      // Check if already a member
      const { data: existingMember } = await adminSupabase
        .from('project_members')
        .select('id, designation')
        .eq('project_id', projectId)
        .eq('user_id', targetUser.id)
        .single()

      if (existingMember) {
        if (existingMember.designation === 'responsible') {
          return { success: false, error: 'Este usuário já é responsável deste projeto' }
        }
        // Upgrade existing member to also be responsible
        await adminSupabase
          .from('project_members')
          .update({ designation: 'responsible', metadata: meta as unknown as Json })
          .eq('id', existingMember.id)

        return { success: true, data: { status: 'added', email: normalizedEmail } }
      }

      // Add as new responsible member
      const result = await addProjectMember(projectId, targetUser.id, 'viewer', 'responsible', meta)
      if (!result.success) {
        return { success: false, error: result.error || 'Erro ao adicionar responsável' }
      }

      return { success: true, data: { status: 'added', email: normalizedEmail } }
    }

    // User not found — check for existing invite
    const { data: existingInvite } = await adminSupabase
      .from('project_invites')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', normalizedEmail)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return { success: false, error: 'Já existe um convite pendente para este email' }
    }

    // Create invite with designation = responsible
    const { data: invite, error: inviteError } = await adminSupabase
      .from('project_invites')
      .insert({
        project_id: projectId,
        email: normalizedEmail,
        role: 'viewer',
        designation: 'responsible',
        metadata: meta as unknown as Json,
        invited_by: user.id,
      })
      .select()
      .single()

    if (inviteError || !invite) {
      console.error('Error creating responsible invite:', inviteError)
      return { success: false, error: 'Erro ao enviar convite' }
    }

    // Get org info for email
    const { data: org } = await adminSupabase
      .from('organizations')
      .select('name, slug')
      .eq('id', project.organization_id)
      .single()

    // Send invite email (reuse existing infra)
    const { sendProjectInviteEmail } = await import('@/lib/email/send-project-invite')
    await sendProjectInviteEmail({
      recipientEmail: normalizedEmail,
      projectCodename: project.codename,
      organizationName: org?.name || '',
      organizationSlug: org?.slug || '',
      inviterUserId: user.id,
      inviterEmail: user.email,
      role: 'viewer',
      inviteToken: invite.token,
      expiresAt: new Date(invite.expires_at),
    })

    await logProjectMemberAuditEvent('project.responsible_added', user.id, projectId, project.organization_id, {
      email: normalizedEmail,
      status: 'invited',
      cargo,
    })

    return { success: true, data: { status: 'invited', email: normalizedEmail } }
  } catch (error) {
    console.error('Unexpected error in addProjectResponsible:', error)
    return { success: false, error: 'Erro inesperado ao adicionar responsável' }
  }
}

// ============================================
// List Project Responsibles
// ============================================

export async function listProjectResponsibles(
  projectId: string
): Promise<ActionResult<ResponsibleItem[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const adminSupabase = await createAdminClient()

    // Get active responsibles (project_members with designation = responsible)
    const { data: members, error: membersError } = await adminSupabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('designation', 'responsible')
      .order('created_at', { ascending: true })

    if (membersError) {
      console.error('Error listing responsibles:', membersError)
      return { success: false, error: 'Erro ao listar responsáveis' }
    }

    // Get pending invites (project_invites with designation = responsible)
    const { data: invites, error: invitesError } = await adminSupabase
      .from('project_invites')
      .select('*')
      .eq('project_id', projectId)
      .eq('designation', 'responsible')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (invitesError) {
      console.error('Error listing responsible invites:', invitesError)
    }

    // Fetch user details for active members
    const { data: { users } } = await adminSupabase.auth.admin.listUsers()
    const userMap = new Map(users?.map(u => [u.id, u]) || [])

    const result: ResponsibleItem[] = []

    // Add active responsibles
    for (const m of members || []) {
      const authUser = userMap.get(m.user_id)
      const meta = (m.metadata || {}) as { cargo?: string; phone?: string }
      result.push({
        id: m.id,
        project_id: m.project_id,
        user_id: m.user_id,
        role: m.role as ProjectMemberRole,
        designation: 'responsible',
        metadata: meta,
        added_by: m.added_by,
        created_at: m.created_at,
        updated_at: m.updated_at,
        status: 'active',
        user: authUser ? {
          id: authUser.id,
          email: authUser.email || '',
          user_metadata: {
            full_name: (authUser.user_metadata as Record<string, string> | undefined)?.full_name,
            avatar_url: (authUser.user_metadata as Record<string, string> | undefined)?.avatar_url,
          },
        } : undefined,
      })
    }

    // Add pending invites
    for (const inv of invites || []) {
      const meta = (inv.metadata || {}) as { cargo?: string; phone?: string }
      result.push({
        id: inv.id,
        project_id: inv.project_id,
        email: inv.email,
        designation: 'responsible',
        metadata: meta,
        status: 'pending',
        created_at: inv.created_at,
      })
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error in listProjectResponsibles:', error)
    return { success: false, error: 'Erro inesperado ao listar responsáveis' }
  }
}

// ============================================
// Remove Project Responsible
// ============================================

export async function removeProjectResponsible(
  projectId: string,
  responsibleId: string,
  type: 'member' | 'invite'
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (!project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    const adminSupabase = await createAdminClient()

    if (type === 'member') {
      const { error: deleteError } = await adminSupabase
        .from('project_members')
        .delete()
        .eq('id', responsibleId)
        .eq('project_id', projectId)
        .eq('designation', 'responsible')

      if (deleteError) {
        console.error('Error removing responsible member:', deleteError)
        return { success: false, error: 'Erro ao remover responsável' }
      }
    } else {
      const { error: deleteError } = await adminSupabase
        .from('project_invites')
        .delete()
        .eq('id', responsibleId)
        .eq('project_id', projectId)
        .eq('designation', 'responsible')

      if (deleteError) {
        console.error('Error removing responsible invite:', deleteError)
        return { success: false, error: 'Erro ao remover convite' }
      }
    }

    await logProjectMemberAuditEvent('project.responsible_removed', user.id, projectId, project.organization_id, {
      responsible_id: responsibleId,
      type,
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in removeProjectResponsible:', error)
    return { success: false, error: 'Erro inesperado ao remover responsável' }
  }
}
