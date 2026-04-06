'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type {
  AdvisorProjectAssignment,
  AdvisorProjectAssignmentInsert,
  AdvisorSide,
  Json,
  AuditAction,
} from '@/types/database'

// ============================================
// Types
// ============================================

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface ConflictCheckResult {
  hasConflict: boolean
  existingSide?: AdvisorSide
  projectId?: string
}

export interface CreateAssignmentInput {
  advisorMemberId: string
  projectId: string
  side: AdvisorSide
}

// ============================================
// Helper: Log audit event
// ============================================

async function logAdvisorAuditEvent(
  action: AuditAction,
  userId: string,
  orgId: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createAdminClient()
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')

  await supabase.from('audit_logs').insert({
    action: action,
    user_id: userId,
    organization_id: orgId,
    metadata: metadata as Json,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// ============================================
// 2.2.12 - Verificar conflito Advisor
// GET /advisor/conflict-check equivalent
// ============================================

export async function checkAdvisorConflict(
  advisorMemberId: string,
  projectId: string,
  requestedSide: AdvisorSide
): Promise<ActionResult<ConflictCheckResult>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Use the database function for conflict check
    const { data, error } = await supabase.rpc('check_advisor_conflict', {
      p_advisor_member_id: advisorMemberId,
      p_project_id: projectId,
      p_requested_side: requestedSide,
    })

    if (error) {
      console.error('Error checking advisor conflict:', error)
      return { success: false, error: 'Erro ao verificar conflito' }
    }

    // If there's a conflict, get the existing side
    if (data === true) {
      const adminSupabase = await createAdminClient()
      const { data: existing } = await adminSupabase
        .from('advisor_project_assignments')
        .select('side')
        .eq('advisor_member_id', advisorMemberId)
        .eq('project_id', projectId)
        .single()

      return {
        success: true,
        data: {
          hasConflict: true,
          existingSide: existing?.side,
          projectId,
        },
      }
    }

    return {
      success: true,
      data: {
        hasConflict: false,
      },
    }
  } catch (error) {
    console.error('Unexpected error in checkAdvisorConflict:', error)
    return { success: false, error: 'Erro inesperado ao verificar conflito' }
  }
}

// ============================================
// Create advisor assignment
// ============================================

export async function createAdvisorAssignment(
  input: CreateAssignmentInput
): Promise<ActionResult<AdvisorProjectAssignment>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // First check for conflict
    const conflictResult = await checkAdvisorConflict(
      input.advisorMemberId,
      input.projectId,
      input.side
    )

    if (!conflictResult.success) {
      return { success: false, error: conflictResult.error }
    }

    if (conflictResult.data?.hasConflict) {
      // Log the blocked attempt
      const adminSupabase = await createAdminClient()
      const { data: member } = await adminSupabase
        .from('organization_members')
        .select('organization_id')
        .eq('id', input.advisorMemberId)
        .single()

      if (member) {
        await logAdvisorAuditEvent('advisor.conflict_blocked', user.id, member.organization_id, {
          advisor_member_id: input.advisorMemberId,
          project_id: input.projectId,
          requested_side: input.side,
          existing_side: conflictResult.data.existingSide,
        })
      }

      return {
        success: false,
        error: `Conflito detectado: Advisor já está no lado ${
          conflictResult.data.existingSide === 'sell_side' ? 'vendedor' : 'comprador'
        } deste projeto`,
      }
    }

    // Create assignment (RLS policy will also check for conflict)
    const assignmentData = {
      advisor_member_id: input.advisorMemberId,
      project_id: input.projectId,
      side: input.side,
      assigned_by: user.id,
    }
    
    // Type assertion needed due to Supabase client type inference issues
    type InsertFn = (data: typeof assignmentData) => ReturnType<ReturnType<typeof supabase.from>['insert']>
    const insertResult = await (supabase
      .from('advisor_project_assignments')
      .insert as unknown as InsertFn)(assignmentData)
      .select()
      .single()
    
    const assignment = insertResult.data as AdvisorProjectAssignment | null
    const assignmentError = insertResult.error

    if (assignmentError) {
      console.error('Error creating advisor assignment:', assignmentError)
      if (assignmentError.message?.includes('check_advisor_conflict')) {
        return { success: false, error: 'Conflito de interesse detectado' }
      }
      return { success: false, error: 'Erro ao criar assignment' }
    }

    // Get organization for audit
    const adminSupabase = await createAdminClient()
    const { data: member } = await adminSupabase
      .from('organization_members')
      .select('organization_id')
      .eq('id', input.advisorMemberId)
      .single()

    if (member && assignment) {
      await logAdvisorAuditEvent('advisor.assigned', user.id, member.organization_id, {
        assignment_id: assignment.id,
        advisor_member_id: input.advisorMemberId,
        project_id: input.projectId,
        side: input.side,
      })
    }

    return { success: true, data: assignment ?? undefined }
  } catch (error) {
    console.error('Unexpected error in createAdvisorAssignment:', error)
    return { success: false, error: 'Erro inesperado ao criar assignment' }
  }
}

// ============================================
// Remove advisor assignment
// ============================================

export async function removeAdvisorAssignment(
  assignmentId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get assignment details first (using admin to ensure we can read it)
    const adminSupabase = await createAdminClient()
    const { data: assignment, error: fetchError } = await adminSupabase
      .from('advisor_project_assignments')
      .select(`
        *,
        organization_members (
          organization_id
        )
      `)
      .eq('id', assignmentId)
      .single()

    if (fetchError || !assignment) {
      return { success: false, error: 'Assignment não encontrado' }
    }

    // Delete assignment (RLS enforces owner/admin permission)
    const { error: deleteError } = await supabase
      .from('advisor_project_assignments')
      .delete()
      .eq('id', assignmentId)

    if (deleteError) {
      console.error('Error deleting advisor assignment:', deleteError)
      return { success: false, error: 'Erro ao remover assignment' }
    }

    // Log audit event
    const orgId = (assignment as any).organization_members?.organization_id
    if (orgId) {
      await logAdvisorAuditEvent('advisor.unassigned', user.id, orgId, {
        assignment_id: assignmentId,
        advisor_member_id: assignment.advisor_member_id,
        project_id: assignment.project_id,
        side: assignment.side,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in removeAdvisorAssignment:', error)
    return { success: false, error: 'Erro inesperado ao remover assignment' }
  }
}

// ============================================
// List advisor assignments for a project
// ============================================

export async function listProjectAdvisors(
  projectId: string
): Promise<ActionResult<AdvisorProjectAssignment[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get assignments (RLS ensures user can view)
    const { data: assignments, error: assignmentsError } = await supabase
      .from('advisor_project_assignments')
      .select('*')
      .eq('project_id', projectId)
      .order('assigned_at', { ascending: true })

    if (assignmentsError) {
      console.error('Error fetching advisor assignments:', assignmentsError)
      return { success: false, error: 'Erro ao buscar advisors do projeto' }
    }

    return { success: true, data: assignments || [] }
  } catch (error) {
    console.error('Unexpected error in listProjectAdvisors:', error)
    return { success: false, error: 'Erro inesperado ao buscar advisors' }
  }
}

// ============================================
// Get advisor's assignments across projects
// ============================================

export async function getAdvisorAssignments(
  advisorMemberId: string
): Promise<ActionResult<AdvisorProjectAssignment[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get assignments (RLS ensures user can view)
    const { data: assignments, error: assignmentsError } = await supabase
      .from('advisor_project_assignments')
      .select('*')
      .eq('advisor_member_id', advisorMemberId)
      .order('assigned_at', { ascending: false })

    if (assignmentsError) {
      console.error('Error fetching advisor assignments:', assignmentsError)
      return { success: false, error: 'Erro ao buscar assignments do advisor' }
    }

    return { success: true, data: assignments || [] }
  } catch (error) {
    console.error('Unexpected error in getAdvisorAssignments:', error)
    return { success: false, error: 'Erro inesperado ao buscar assignments' }
  }
}

