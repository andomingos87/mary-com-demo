'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type {
  OrganizationMember,
  MemberRole,
  VerificationStatus,
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

export interface MemberWithUser extends OrganizationMember {
  user?: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
}

export interface UpdateMemberInput {
  role?: MemberRole
  verificationStatus?: VerificationStatus
}

// ============================================
// Helper: Log audit event
// ============================================

async function logMemberAuditEvent(
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
// 2.2.6 - Listar membros da organização
// GET /organizations/:id/members equivalent
// ============================================

export async function listOrganizationMembers(
  orgId: string
): Promise<ActionResult<MemberWithUser[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get members (RLS ensures user is a member of the org)
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId)
      .order('role', { ascending: true })
      .order('joined_at', { ascending: true }) as { data: OrganizationMember[] | null; error: Error | null }

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return { success: false, error: 'Erro ao buscar membros' }
    }

    // Get user details from auth (using admin client)
    if (members && members.length > 0) {
      const adminSupabase = await createAdminClient()
      const userIds = members.map(m => m.user_id)
      
      // Fetch user data from auth.users
      const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers()
      
      if (!usersError && users) {
        const userMap = new Map(
          users
            .filter(u => userIds.includes(u.id))
            .map(u => [u.id, {
              id: u.id,
              email: u.email || '',
              user_metadata: u.user_metadata as { full_name?: string; avatar_url?: string } | undefined,
            }])
        )

        const membersWithUsers: MemberWithUser[] = members.map(m => ({
          ...m,
          user: userMap.get(m.user_id),
        }))

        return { success: true, data: membersWithUsers }
      }
    }

    return { success: true, data: members || [] }
  } catch (error) {
    console.error('Unexpected error in listOrganizationMembers:', error)
    return { success: false, error: 'Erro inesperado ao buscar membros' }
  }
}

// ============================================
// 2.2.10 - Atualizar role do membro
// PATCH /members/:id equivalent
// ============================================

export async function updateMemberRole(
  memberId: string,
  input: UpdateMemberInput
): Promise<ActionResult<OrganizationMember>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get the member to update
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('id', memberId)
      .single() as { data: OrganizationMember | null; error: Error | null }

    if (memberError || !member) {
      return { success: false, error: 'Membro não encontrado' }
    }

    // Cannot update own role
    if (member.user_id === user.id) {
      return { success: false, error: 'Não é possível alterar seu próprio papel' }
    }

    // Prepare update
    const updateData: Record<string, unknown> = {}
    if (input.role !== undefined) updateData.role = input.role
    if (input.verificationStatus !== undefined) {
      updateData.verification_status = input.verificationStatus
    }

    // Update member (RLS enforces owner/admin permission)
    // Type assertion needed due to Supabase client type inference issues
    type UpdateFn = (data: typeof updateData) => ReturnType<ReturnType<typeof supabase.from>['update']>
    const { data: updatedMember, error: updateError } = await (supabase
      .from('organization_members')
      .update as unknown as UpdateFn)(updateData)
      .eq('id', memberId)
      .select()
      .single() as { data: OrganizationMember | null; error: Error | null }

    if (updateError) {
      console.error('Error updating member:', updateError)
      if (updateError.message?.includes('validate_owner_removal')) {
        return { success: false, error: 'Não é possível remover o último owner' }
      }
      return { success: false, error: 'Erro ao atualizar membro' }
    }

    // Log audit event
    await logMemberAuditEvent('org.member_role_changed', user.id, member.organization_id, {
      member_id: memberId,
      member_user_id: member.user_id,
      old_role: member.role,
      new_role: input.role,
      old_verification: member.verification_status,
      new_verification: input.verificationStatus,
    })

    return { success: true, data: updatedMember ?? undefined }
  } catch (error) {
    console.error('Unexpected error in updateMemberRole:', error)
    return { success: false, error: 'Erro inesperado ao atualizar membro' }
  }
}

// ============================================
// 2.2.11 - Remover membro
// DELETE /members/:id equivalent
// ============================================

export async function removeMember(
  memberId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get the member to remove
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('id', memberId)
      .single() as { data: OrganizationMember | null; error: Error | null }

    if (memberError || !member) {
      return { success: false, error: 'Membro não encontrado' }
    }

    // Cannot remove self
    if (member.user_id === user.id) {
      return { success: false, error: 'Não é possível remover a si mesmo' }
    }

    // Delete member (RLS enforces owner/admin permission)
    // Trigger validate_owner_removal prevents removing last owner
    const { error: deleteError } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      if (deleteError.message?.includes('validate_owner_removal')) {
        return { success: false, error: 'Não é possível remover o último owner' }
      }
      return { success: false, error: 'Erro ao remover membro' }
    }

    // Log audit event
    await logMemberAuditEvent('org.member_removed', user.id, member.organization_id, {
      member_id: memberId,
      removed_user_id: member.user_id,
      role: member.role,
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in removeMember:', error)
    return { success: false, error: 'Erro inesperado ao remover membro' }
  }
}

// ============================================
// Helper: Get current user's membership
// ============================================

export async function getCurrentMembership(
  orgId: string
): Promise<ActionResult<OrganizationMember>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get membership
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) {
      return { success: false, error: 'Não é membro desta organização' }
    }

    return { success: true, data: member }
  } catch (error) {
    console.error('Unexpected error in getCurrentMembership:', error)
    return { success: false, error: 'Erro inesperado ao buscar membership' }
  }
}

// ============================================
// Helper: Leave organization (self-removal)
// ============================================

export async function leaveOrganization(
  orgId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get own membership
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single() as { data: OrganizationMember | null; error: Error | null }

    if (memberError || !member) {
      return { success: false, error: 'Não é membro desta organização' }
    }

    // If owner, check if there are other owners
    if (member.role === 'owner') {
      const adminSupabase = await createAdminClient()
      const { count } = await adminSupabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('role', 'owner')

      if (count && count <= 1) {
        return { 
          success: false, 
          error: 'Você é o único owner. Transfira a propriedade antes de sair.' 
        }
      }
    }

    // Use admin client to bypass RLS (user cannot delete own membership via RLS)
    const adminSupabase = await createAdminClient()
    const { error: deleteError } = await adminSupabase
      .from('organization_members')
      .delete()
      .eq('id', member.id)

    if (deleteError) {
      console.error('Error leaving organization:', deleteError)
      return { success: false, error: 'Erro ao sair da organização' }
    }

    // Log audit event
    await logMemberAuditEvent('org.member_removed', user.id, orgId, {
      member_id: member.id,
      removed_user_id: user.id,
      self_removal: true,
      role: member.role,
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in leaveOrganization:', error)
    return { success: false, error: 'Erro inesperado ao sair da organização' }
  }
}

