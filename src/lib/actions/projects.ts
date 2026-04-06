'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  ProjectStatus,
  ProjectObjective,
  Json,
  Database,
} from '@/types/database'
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsFilters,
  ProjectWithDetails,
  ActionResult,
  ProjectFieldMetadata,
} from '@/types/projects'
import { isValidCodename, CODENAME_MIN_LENGTH, CODENAME_MAX_LENGTH } from '@/types/projects'
import { applyBulkL1Metadata, calculateScore, parseFieldMetadata } from '@/lib/readiness'
import { getGateBlockErrorForStatusTransition } from '@/lib/projects/status-gates'
import {
  canTransitionProjectStatus,
  isRollbackTransition,
} from '@/lib/projects/status-flow'

// ============================================
// Helper: Log audit event
// ============================================

async function logProjectAuditEvent(
  action: Database['public']['Enums']['audit_action'],
  userId: string,
  projectId: string | null,
  orgId: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createAdminClient()
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')

  const baseMetadata = projectId ? { ...metadata, project_id: projectId } : metadata

  await supabase.from('audit_logs').insert({
    action,
    user_id: userId,
    organization_id: orgId,
    metadata: baseMetadata as Json,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

const PROJECT_CREATE_BLOCKED_NDA_REQUIRED = 'PROJECT_CREATE_BLOCKED_NDA_REQUIRED'

// ============================================
// Create Project
// ============================================

export async function createProject(
  input: CreateProjectInput
): Promise<ActionResult<Project>> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { data: organization, error: organizationError } = await supabase
      .from('organizations')
      .select('profile_type')
      .eq('id', input.organizationId)
      .is('deleted_at', null)
      .single()

    if (organizationError || !organization) {
      return { success: false, error: 'Organização não encontrada' }
    }

    let resolvedSourceProjectId = input.sourceProjectId
    let resolvedNdaRequestId = input.ndaRequestId

    // E4 gate: for investor orgs, project creation requires an approved NDA request.
    if (organization.profile_type === 'investor') {
      if (!resolvedSourceProjectId) {
        // UX fallback: if investor didn't explicitly choose an opportunity, try latest approved NDA.
        const { data: latestApprovedNda } = await supabase
          .from('nda_requests')
          .select('id, project_id')
          .eq('investor_organization_id', input.organizationId)
          .eq('status', 'approved')
          .is('deleted_at', null)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (latestApprovedNda?.project_id) {
          resolvedSourceProjectId = latestApprovedNda.project_id
          resolvedNdaRequestId = latestApprovedNda.id
        } else {
          await logProjectAuditEvent('project.creation_blocked_no_nda', user.id, null, input.organizationId, {
            reason_code: PROJECT_CREATE_BLOCKED_NDA_REQUIRED,
            reason: 'approved_nda_required',
          })
          return {
            success: false,
            error: `${PROJECT_CREATE_BLOCKED_NDA_REQUIRED}: Projeto só pode ser criado após NDA aprovado.`,
          }
        }
      }

      const { data: ndaRequest, error: ndaRequestError } = await supabase
        .from('nda_requests')
        .select('id, status')
        .eq('investor_organization_id', input.organizationId)
        .eq('project_id', resolvedSourceProjectId)
        .is('deleted_at', null)
        .maybeSingle()

      const ndaIsApproved = !ndaRequestError && ndaRequest?.status === 'approved'
      const ndaMatchesRequestedId = !resolvedNdaRequestId || ndaRequest?.id === resolvedNdaRequestId

      if (!ndaIsApproved || !ndaMatchesRequestedId) {
        await logProjectAuditEvent('project.creation_blocked_no_nda', user.id, resolvedSourceProjectId, input.organizationId, {
          reason_code: PROJECT_CREATE_BLOCKED_NDA_REQUIRED,
          nda_request_id: ndaRequest?.id ?? null,
          requested_nda_request_id: resolvedNdaRequestId ?? null,
          nda_status: ndaRequest?.status ?? null,
        })
        return {
          success: false,
          error: `${PROJECT_CREATE_BLOCKED_NDA_REQUIRED}: Projeto só pode ser criado após NDA aprovado.`,
        }
      }
    }

    // Validate codename
    if (!isValidCodename(input.codename)) {
      return {
        success: false,
        error: `Codename inválido. Use ${CODENAME_MIN_LENGTH}-${CODENAME_MAX_LENGTH} caracteres, começando com letra ou número.`,
      }
    }

    // Check if codename is unique within organization
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', input.organizationId)
      .eq('codename', input.codename)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return { success: false, error: 'Codename já existe nesta organização' }
    }

    // Validate name
    if (!input.name || input.name.trim().length < 2) {
      return { success: false, error: 'Nome do projeto é obrigatório (mínimo 2 caracteres)' }
    }

    // Prepare initial field metadata with L1
    const initialFields: Record<string, unknown> = {
      name: input.name,
      codename: input.codename,
      objective: input.objective,
    }
    if (input.description) initialFields.description = input.description
    if (input.sectorL1) initialFields.sector_l1 = input.sectorL1
    if (input.sectorL2) initialFields.sector_l2 = input.sectorL2
    if (input.sectorL3) initialFields.sector_l3 = input.sectorL3

    const fieldMetadata = applyBulkL1Metadata({}, initialFields, user.id, 'manual')

    // Validate equity only for fundraising
    if (input.objective !== 'fundraising' && (input.equityMinPct || input.equityMaxPct)) {
      return { success: false, error: 'Equity só é aplicável para objetivo de captação' }
    }

    // Validate min <= max
    if (input.valueMinUsd && input.valueMaxUsd && input.valueMinUsd > input.valueMaxUsd) {
      return { success: false, error: 'Valor mínimo não pode ser maior que o valor máximo' }
    }
    if (input.equityMinPct && input.equityMaxPct && input.equityMinPct > input.equityMaxPct) {
      return { success: false, error: 'Equity mínimo não pode ser maior que o equity máximo' }
    }

    // Create project
    const projectData = {
      organization_id: input.organizationId,
      name: input.name.trim(),
      codename: input.codename,
      objective: input.objective,
      status: 'screening',
      description: input.description,
      sector_l1: input.sectorL1,
      sector_l2: input.sectorL2,
      sector_l3: input.sectorL3,
      created_by: user.id,
      field_metadata: fieldMetadata as Json,
      visibility: input.visibility || 'private',
      contacts: (input.contacts || []) as unknown as Json,
      advisor_preference: input.advisorPreference || null,
      advisor_email: input.advisorEmail || null,
      value_min_usd: input.valueMinUsd || null,
      value_max_usd: input.valueMaxUsd || null,
      equity_min_pct: input.objective === 'fundraising' ? (input.equityMinPct || null) : null,
      equity_max_pct: input.objective === 'fundraising' ? (input.equityMaxPct || null) : null,
      reason: input.reason || null,
    } as ProjectInsert

    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (createError || !project) {
      console.error('Error creating project:', createError)
      if (createError?.code === '23505') {
        return { success: false, error: 'Codename já existe nesta organização' }
      }
      return { success: false, error: 'Erro ao criar projeto' }
    }

    // Auto-add creator as project manager
    const adminSupabase = await createAdminClient()
    await adminSupabase.from('project_members').insert({
      project_id: project.id,
      user_id: user.id,
      role: 'manager',
      designation: 'member',
      added_by: user.id,
    })

    // Calculate initial readiness score
    const readinessResult = calculateScore(project)

    // Update project with readiness data
    await supabase
      .from('projects')
      .update({
        readiness_score: readinessResult.score,
        readiness_data: {
          lastScore: readinessResult.score,
          lastCalculatedAt: readinessResult.calculatedAt,
          checklist: readinessResult.checklist,
        } as unknown as Json,
      })
      .eq('id', project.id)

    // Log audit event
    await logProjectAuditEvent('project.created', user.id, project.id, input.organizationId, {
      codename: project.codename,
      objective: project.objective,
    })

    if (organization.profile_type === 'investor') {
      await logProjectAuditEvent('project.created_from_nda', user.id, project.id, input.organizationId, {
        source_project_id: resolvedSourceProjectId ?? null,
        nda_request_id: resolvedNdaRequestId ?? null,
      })
    }

    return { success: true, data: { ...project, readiness_score: readinessResult.score } }
  } catch (error) {
    console.error('Unexpected error in createProject:', error)
    return { success: false, error: 'Erro inesperado ao criar projeto' }
  }
}

// ============================================
// Lookup User by Email
// ============================================

export async function lookupUserByEmail(
  email: string
): Promise<ActionResult<{ exists: boolean; displayName?: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Basic email format validation
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: true, data: { exists: false } }
    }

    const adminSupabase = await createAdminClient()
    const { data: targetLookup } = await (adminSupabase.auth.admin as any).getUserByEmail(normalizedEmail)
    const targetUser = targetLookup?.user as {
      id: string
      email?: string | null
      user_metadata?: unknown
    } | null

    if (targetUser) {
      const fullName = (targetUser.user_metadata as Record<string, string> | undefined)?.full_name
      return { success: true, data: { exists: true, displayName: fullName || targetUser.email || undefined } }
    }

    return { success: true, data: { exists: false } }
  } catch (error) {
    console.error('Unexpected error in lookupUserByEmail:', error)
    return { success: false, error: 'Erro ao buscar usuário' }
  }
}

// ============================================
// Get Project by ID
// ============================================

export async function getProject(
  projectId: string
): Promise<ActionResult<ProjectWithDetails>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get project with relations
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        organization:organizations!projects_organization_id_fkey (
          id,
          name,
          slug,
          profile_type
        )
      `)
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !project) {
      if (fetchError?.code === 'PGRST116') {
        return { success: false, error: 'Projeto não encontrado' }
      }
      console.error('Error fetching project:', fetchError)
      return { success: false, error: 'Erro ao buscar projeto' }
    }

    // Get taxonomy labels if set
    let taxonomyL1 = null
    let taxonomyL2 = null
    let taxonomyL3 = null

    const taxonomyCodes = [project.sector_l1, project.sector_l2, project.sector_l3].filter(
      (code): code is string => Boolean(code)
    )
    if (taxonomyCodes.length > 0) {
      const { data: taxonomyData } = await supabase
        .from('taxonomy_maics')
        .select('*')
        .in('code', taxonomyCodes)

      if (taxonomyData) {
        taxonomyL1 = taxonomyData.find(t => t.code === project.sector_l1) || null
        taxonomyL2 = taxonomyData.find(t => t.code === project.sector_l2) || null
        taxonomyL3 = taxonomyData.find(t => t.code === project.sector_l3) || null
      }
    }

    // Calculate readiness result
    const readinessResult = calculateScore(project)

    const projectWithDetails: ProjectWithDetails = {
      ...project,
      organization: project.organization ? {
        id: project.organization.id,
        name: project.organization.name,
        slug: project.organization.slug,
        profile_type: project.organization.profile_type,
      } : undefined,
      taxonomyL1,
      taxonomyL2,
      taxonomyL3,
      readinessResult,
      parsedFieldMetadata: parseFieldMetadata(project.field_metadata),
    }

    return { success: true, data: projectWithDetails }
  } catch (error) {
    console.error('Unexpected error in getProject:', error)
    return { success: false, error: 'Erro inesperado ao buscar projeto' }
  }
}

// ============================================
// Get Project by Codename
// ============================================

/**
 * Get a project by its codename within an organization.
 * @param orgIdOrSlug - Organization UUID or slug
 * @param codename - Project codename
 */
export async function getProjectByCodename(
  orgIdOrSlug: string,
  codename: string
): Promise<ActionResult<ProjectWithDetails>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Resolve org ID from slug if needed
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgIdOrSlug)
    let organizationId = orgIdOrSlug

    if (!isUuid) {
      // Lookup organization by slug
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgIdOrSlug)
        .is('deleted_at', null)
        .single()

      if (orgError || !org) {
        return { success: false, error: 'Organização não encontrada' }
      }
      organizationId = org.id
    }

    // Get project by codename
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        organization:organizations!projects_organization_id_fkey (
          id,
          name,
          slug,
          profile_type
        )
      `)
      .eq('organization_id', organizationId)
      .eq('codename', codename)
      .is('deleted_at', null)
      .single()

    if (fetchError || !project) {
      if (fetchError?.code === 'PGRST116') {
        return { success: false, error: 'Projeto não encontrado' }
      }
      console.error('Error fetching project:', fetchError)
      return { success: false, error: 'Erro ao buscar projeto' }
    }

    // Use getProject to get full details
    return getProject(project.id)
  } catch (error) {
    console.error('Unexpected error in getProjectByCodename:', error)
    return { success: false, error: 'Erro inesperado ao buscar projeto' }
  }
}

// ============================================
// Get Breadcrumb Label for Project Detail
// ============================================

export async function getProjectBreadcrumbLabel(
  orgSlug: string,
  codename: string
): Promise<ActionResult<{ label: string }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const { data: organization, error: organizationError } = await supabase
      .from('organizations')
      .select('id, profile_type')
      .eq('slug', orgSlug)
      .is('deleted_at', null)
      .single()

    if (organizationError || !organization) {
      return { success: false, error: 'Organização não encontrada' }
    }

    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organization.id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return { success: false, error: 'Você não possui acesso a esta organização' }
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, codename')
      .eq('organization_id', organization.id)
      .eq('codename', codename)
      .is('deleted_at', null)
      .single()

    if (projectError || !project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    const codenameLabel = project.codename || codename
    const nameLabel = project.name?.trim() || codenameLabel

    if (organization.profile_type !== 'investor') {
      return { success: true, data: { label: nameLabel } }
    }

    const { data: approvedNda, error: ndaError } = await supabase
      .from('nda_requests')
      .select('id')
      .eq('investor_organization_id', organization.id)
      .eq('project_id', project.id)
      .eq('status', 'approved')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()

    if (ndaError) {
      return { success: false, error: 'Erro ao validar NDA do projeto' }
    }

    return {
      success: true,
      data: { label: approvedNda ? nameLabel : codenameLabel },
    }
  } catch (error) {
    console.error('Unexpected error in getProjectBreadcrumbLabel:', error)
    return { success: false, error: 'Erro inesperado ao resolver breadcrumb do projeto' }
  }
}

// ============================================
// List Projects
// ============================================

export async function listProjects(
  orgId: string,
  filters?: ListProjectsFilters
): Promise<ActionResult<Project[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Check if user is org admin/owner (bypass visibility filter)
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    const isAdmin = membership?.role === 'admin' || membership?.role === 'owner'

    // Build query
    let query = supabase
      .from('projects')
      .select('*')
      .eq('organization_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Filter by access if not admin: only public projects or projects user is member of
    if (!isAdmin) {
      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id)

      const memberProjectIds = memberProjects?.map((m) => m.project_id) || []

      if (memberProjectIds.length > 0) {
        query = query.or(`visibility.eq.public,id.in.(${memberProjectIds.join(',')})`)
      } else {
        query = query.eq('visibility', 'public')
      }
    }

    // Apply filters
    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      query = query.in('status', statuses)
    }

    if (filters?.objective) {
      const objectives = Array.isArray(filters.objective) ? filters.objective : [filters.objective]
      query = query.in('objective', objectives)
    }

    if (filters?.sectorL1) {
      query = query.eq('sector_l1', filters.sectorL1)
    }

    if (filters?.search) {
      query = query.ilike('codename', `%${filters.search}%`)
    }

    // Pagination
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
    }

    const { data: projects, error: fetchError } = await query

    if (fetchError) {
      console.error('Error listing projects:', fetchError)
      return { success: false, error: 'Erro ao listar projetos' }
    }

    return { success: true, data: projects || [] }
  } catch (error) {
    console.error('Unexpected error in listProjects:', error)
    return { success: false, error: 'Erro inesperado ao listar projetos' }
  }
}

// ============================================
// Update Project
// ============================================

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<ActionResult<Project>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get current project
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentProject) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Validate codename if changing
    if (input.codename && input.codename !== currentProject.codename) {
      if (!isValidCodename(input.codename)) {
        return {
          success: false,
          error: `Codename inválido. Use ${CODENAME_MIN_LENGTH}-${CODENAME_MAX_LENGTH} caracteres.`,
        }
      }

      // Check uniqueness
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('organization_id', currentProject.organization_id)
        .eq('codename', input.codename)
        .neq('id', projectId)
        .is('deleted_at', null)
        .single()

      if (existing) {
        return { success: false, error: 'Codename já existe nesta organização' }
      }
    }

    // Prepare update data
    const updateData: ProjectUpdate & { visibility?: string } = {}
    const changedFields: Record<string, unknown> = {}

    if (input.codename !== undefined) {
      updateData.codename = input.codename
      changedFields.codename = input.codename
    }
    if (input.description !== undefined) {
      updateData.description = input.description
      changedFields.description = input.description
    }
    if (input.objective !== undefined) {
      updateData.objective = input.objective
      changedFields.objective = input.objective
    }
    if (input.sectorL1 !== undefined) {
      updateData.sector_l1 = input.sectorL1
      changedFields.sector_l1 = input.sectorL1
    }
    if (input.sectorL2 !== undefined) {
      updateData.sector_l2 = input.sectorL2
      changedFields.sector_l2 = input.sectorL2
    }
    if (input.sectorL3 !== undefined) {
      updateData.sector_l3 = input.sectorL3
      changedFields.sector_l3 = input.sectorL3
    }
    if (input.valueMinUsd !== undefined) {
      ;(updateData as any).value_min_usd = input.valueMinUsd
      changedFields.value_min_usd = input.valueMinUsd
    }
    if (input.valueMaxUsd !== undefined) {
      ;(updateData as any).value_max_usd = input.valueMaxUsd
      changedFields.value_max_usd = input.valueMaxUsd
    }
    if (input.equityMinPct !== undefined) {
      ;(updateData as any).equity_min_pct = input.equityMinPct
      changedFields.equity_min_pct = input.equityMinPct
    }
    if (input.equityMaxPct !== undefined) {
      ;(updateData as any).equity_max_pct = input.equityMaxPct
      changedFields.equity_max_pct = input.equityMaxPct
    }
    if (input.reason !== undefined) {
      ;(updateData as any).reason = input.reason
      changedFields.reason = input.reason
    }
    if (input.ebitdaAnnualUsd !== undefined) {
      updateData.ebitda_annual_usd = input.ebitdaAnnualUsd
      changedFields.ebitda_annual_usd = input.ebitdaAnnualUsd
    }
    if (input.revenueAnnualUsd !== undefined) {
      updateData.revenue_annual_usd = input.revenueAnnualUsd
      changedFields.revenue_annual_usd = input.revenueAnnualUsd
    }
    if (input.visibility !== undefined) {
      updateData.visibility = input.visibility
    }
    if (input.contacts !== undefined) {
      ;(updateData as any).contacts = input.contacts as unknown as Json
    }

    // Update field metadata for changed fields
    if (Object.keys(changedFields).length > 0) {
      const currentMetadata = parseFieldMetadata(currentProject.field_metadata)
      const updatedMetadata = applyBulkL1Metadata(currentMetadata, changedFields, user.id, 'manual')
      updateData.field_metadata = updatedMetadata as Json
    }

    // Update project
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()

    if (updateError || !project) {
      console.error('Error updating project:', updateError)
      return { success: false, error: 'Erro ao atualizar projeto' }
    }

    // Recalculate readiness score
    const readinessResult = calculateScore(project)

    await supabase
      .from('projects')
      .update({
        readiness_score: readinessResult.score,
        readiness_data: {
          lastScore: readinessResult.score,
          lastCalculatedAt: readinessResult.calculatedAt,
          checklist: readinessResult.checklist,
        } as unknown as Json,
      })
      .eq('id', project.id)

    // Log audit event
    await logProjectAuditEvent('project.updated', user.id, project.id, project.organization_id, {
      changes: Object.keys(changedFields),
    })

    // Log taxonomy update if changed
    if (input.sectorL1 !== undefined || input.sectorL2 !== undefined || input.sectorL3 !== undefined) {
      await logProjectAuditEvent('project.taxonomy_updated', user.id, project.id, project.organization_id, {
        sector_l1: project.sector_l1,
        sector_l2: project.sector_l2,
        sector_l3: project.sector_l3,
      })
    }

    // Log visibility change
    if (input.visibility !== undefined && input.visibility !== (currentProject as any).visibility) {
      await logProjectAuditEvent('project.visibility_changed' as Database['public']['Enums']['audit_action'], user.id, project.id, project.organization_id, {
        old_visibility: (currentProject as any).visibility,
        new_visibility: input.visibility,
      })
    }

    return { success: true, data: { ...project, readiness_score: readinessResult.score } }
  } catch (error) {
    console.error('Unexpected error in updateProject:', error)
    return { success: false, error: 'Erro inesperado ao atualizar projeto' }
  }
}

export async function autoSaveProjectFields(
  projectId: string,
  input: Partial<UpdateProjectInput>
): Promise<ActionResult<Project>> {
  const allowedFields: Array<keyof UpdateProjectInput> = [
    'description',
    'sectorL1',
    'sectorL2',
    'sectorL3',
    'valueMinUsd',
    'valueMaxUsd',
    'equityMinPct',
    'equityMaxPct',
    'reason',
    'ebitdaAnnualUsd',
    'revenueAnnualUsd',
    'visibility',
    'contacts',
  ]

  const payload = allowedFields.reduce<UpdateProjectInput>((acc, field) => {
    const value = input[field]
    if (value !== undefined) {
      acc[field] = value as never
    }
    return acc
  }, {})

  if (Object.keys(payload).length === 0) {
    return { success: false, error: 'Nenhum campo válido informado para auto-save do projeto' }
  }

  return updateProject(projectId, payload)
}

// ============================================
// Change Project Status
// ============================================

export async function changeProjectStatus(
  projectId: string,
  status: ProjectStatus,
  options?: {
    reasonCode?: string
    reasonText?: string
  }
): Promise<ActionResult<Project>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get current project
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('id, status, organization_id, readiness_data')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentProject) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    const previousStatus = currentProject.status as ProjectStatus

    if (!canTransitionProjectStatus(previousStatus, status)) {
      return {
        success: false,
        error: `Transição de status inválida: ${previousStatus} -> ${status}`,
      }
    }

    const gateBlockError = getGateBlockErrorForStatusTransition(previousStatus, status, currentProject.readiness_data)
    if (gateBlockError) {
      return {
        success: false,
        error: gateBlockError,
      }
    }

    const rollback = isRollbackTransition(previousStatus, status)
    if (rollback) {
      if (!options?.reasonCode || !options?.reasonText) {
        return {
          success: false,
          error: 'Rollback exige reasonCode e reasonText',
        }
      }

      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', currentProject.organization_id)
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membership || !['owner', 'admin'].includes(membership.role)) {
        return {
          success: false,
          error: 'Rollback de estágio permitido apenas para owner/admin',
        }
      }
    }

    // Update status
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError || !project) {
      console.error('Error changing project status:', updateError)
      return { success: false, error: 'Erro ao alterar status' }
    }

    if (rollback) {
      await logProjectAuditEvent('project.stage_rollback', user.id, project.id, project.organization_id, {
        status_change: { from: previousStatus, to: status },
        reason_code: options?.reasonCode,
        reason_text: options?.reasonText,
      })
    } else {
      await logProjectAuditEvent('project.stage_changed', user.id, project.id, project.organization_id, {
        status_change: { from: previousStatus, to: status },
      })
    }

    return { success: true, data: project }
  } catch (error) {
    console.error('Unexpected error in changeProjectStatus:', error)
    return { success: false, error: 'Erro inesperado ao alterar status' }
  }
}

// ============================================
// Delete Project (Soft Delete)
// ============================================

export async function deleteProject(
  projectId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get project for audit log
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('codename, organization_id')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', projectId)

    if (deleteError) {
      console.error('Error deleting project:', deleteError)
      return { success: false, error: 'Erro ao excluir projeto' }
    }

    // Log audit event
    await logProjectAuditEvent('project.deleted', user.id, projectId, project.organization_id, {
      codename: project.codename,
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteProject:', error)
    return { success: false, error: 'Erro inesperado ao excluir projeto' }
  }
}

// ============================================
// Check Codename Availability
// ============================================

export async function checkCodenameAvailability(
  orgId: string,
  codename: string
): Promise<ActionResult<{ available: boolean; suggestion?: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    if (!isValidCodename(codename)) {
      return { success: true, data: { available: false } }
    }

    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', orgId)
      .eq('codename', codename)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return { success: true, data: { available: true } }
    }

    // Generate suggestion
    const timestamp = Date.now().toString(36).slice(-4)
    return {
      success: true,
      data: {
        available: false,
        suggestion: `${codename}-${timestamp}`,
      },
    }
  } catch (error) {
    console.error('Unexpected error in checkCodenameAvailability:', error)
    return { success: false, error: 'Erro ao verificar disponibilidade' }
  }
}
