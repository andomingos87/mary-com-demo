'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Project, ProjectObjective, Json, Database } from '@/types/database'
import type {
  ReadinessResult,
  ReadinessChecklistItem,
  ActionResult,
  ProjectFieldMetadata,
  FieldMetadata,
  MrsReadinessData,
  MrsPriority,
  MrsStatus,
} from '@/types/projects'
import {
  calculateScore,
  getChecklistByObjective,
  applyFieldMetadata,
  parseFieldMetadata,
  getFieldLevel,
  generateHash,
  addMrsItemFile,
  resolveMrsReadinessData,
  updateMrsItem,
} from '@/lib/readiness'
import {
  calculateVdrContribution,
  computeIsMatchingReady,
} from '@/lib/readiness/vdr-contribution'

// ============================================
// Helper: Log audit event
// ============================================

async function logReadinessAuditEvent(
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
    action: 'project.readiness_calculated' as Database['public']['Enums']['audit_action'],
    user_id: userId,
    organization_id: orgId,
    metadata: { ...metadata, project_id: projectId } as Json,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

interface AuthorizedOrgContext {
  userId: string
  orgId: string
  orgSlug: string
}

async function getAuthorizedAssetOrgContext(orgSlug: string): Promise<ActionResult<AuthorizedOrgContext>> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, slug, profile_type')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    return { success: false, error: 'Organização não encontrada' }
  }

  if (org.profile_type !== 'asset') {
    return { success: false, error: 'MRS disponível apenas para perfil asset' }
  }

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single()

  if (membershipError || !membership) {
    return { success: false, error: 'Usuário não pertence à organização' }
  }

  return {
    success: true,
    data: {
      userId: user.id,
      orgId: org.id,
      orgSlug: org.slug,
    },
  }
}

// ============================================
// Calculate Readiness Score
// ============================================

/**
 * Calcula e retorna o Readiness Score de um projeto
 * Não atualiza o banco - use updateProjectReadiness para isso
 */
export async function calculateReadinessScore(
  projectId: string
): Promise<ActionResult<ReadinessResult>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
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

    // Calculate score using domain logic
    const result = calculateScore(project)

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error in calculateReadinessScore:', error)
    return { success: false, error: 'Erro inesperado ao calcular readiness' }
  }
}

// ============================================
// Update Project Readiness
// ============================================

/**
 * Recalcula e persiste o Readiness Score no projeto
 */
export async function updateProjectReadiness(
  projectId: string
): Promise<ActionResult<Project>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
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

    // Calculate base score
    const result = calculateScore(project)

    // VDR integration (Phase 2): include validation levels as a sub-score
    const { data: vdrDocs } = await supabase
      .from('vdr_documents')
      .select('validation_n1, validation_n2, validation_n3')
      .eq('project_id', projectId)
      .neq('status', 'deleted')
      .is('deleted_at', null)

    const { vdrSubScore, vdrN2PlusCoverage } = calculateVdrContribution(
      vdrDocs || []
    )
    const totalVdrDocs = vdrDocs?.length || 0
    const finalScore = totalVdrDocs > 0
      ? Math.round(result.score * 0.8 + vdrSubScore * 0.2)
      : result.score
    const isMatchingReady = computeIsMatchingReady(
      result.l2PlusCoverage,
      vdrN2PlusCoverage
    )

    // Get existing readiness_data for history and optional MRS canonical contract
    const existingData =
      project.readiness_data && typeof project.readiness_data === 'object'
        ? (project.readiness_data as Record<string, unknown>)
        : {}
    const history = Array.isArray(existingData.history)
      ? (existingData.history as Array<{ score: number; calculatedAt: string }>)
      : []
    const hasMrsContract = Boolean(existingData.mrs)
    const mrsData = hasMrsContract ? resolveMrsReadinessData(existingData) : null
    const resolvedScore = hasMrsContract ? (mrsData?.score.totalScore ?? finalScore) : finalScore

    // Add to history (keep last 10)
    history.push({
      score: resolvedScore,
      calculatedAt: result.calculatedAt,
    })
    if (history.length > 10) {
      history.shift()
    }

    // Update project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        readiness_score: resolvedScore,
        readiness_data: {
          ...existingData,
          lastScore: resolvedScore,
          lastCalculatedAt: result.calculatedAt,
          checklist: result.checklist,
          baseScore: result.score,
          vdrSubScore,
          vdrN2PlusCoverage,
          isMatchingReady,
          ...(mrsData ? { mrs: mrsData, gates: mrsData.gates } : {}),
          history,
        } as unknown as Json,
      })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError || !updatedProject) {
      console.error('Error updating readiness:', updateError)
      return { success: false, error: 'Erro ao atualizar readiness' }
    }

    // Log audit event
    await logReadinessAuditEvent(user.id, projectId, project.organization_id, {
      score: resolvedScore,
      baseScore: result.score,
      vdrSubScore,
      vdrN2PlusCoverage,
      l2PlusCoverage: result.l2PlusCoverage,
      isMatchingReady,
      hasMrsContract,
      ndaEligible: mrsData?.gates.ndaEligible,
      nboEligible: mrsData?.gates.nboEligible,
    })

    return { success: true, data: updatedProject }
  } catch (error) {
    console.error('Unexpected error in updateProjectReadiness:', error)
    return { success: false, error: 'Erro inesperado ao atualizar readiness' }
  }
}

// ============================================
// Get Readiness Checklist
// ============================================

/**
 * Retorna o checklist de readiness para um objetivo específico
 */
export async function getReadinessChecklist(
  objective: ProjectObjective
): Promise<ActionResult<ReadinessChecklistItem[]>> {
  try {
    const checklist = getChecklistByObjective(objective)

    if (!checklist || checklist.length === 0) {
      return { success: false, error: 'Objetivo inválido' }
    }

    return { success: true, data: checklist }
  } catch (error) {
    console.error('Unexpected error in getReadinessChecklist:', error)
    return { success: false, error: 'Erro inesperado ao obter checklist' }
  }
}

// ============================================
// Validate Field (Apply L2)
// ============================================

/**
 * Aplica validação L2 (Advisor/Admin) a um campo
 * Requer que o campo já tenha L1
 */
export async function validateField(
  projectId: string,
  fieldName: string,
  notes?: string
): Promise<ActionResult<Project>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Get field value
    const fieldValue = getProjectFieldValue(project, fieldName)
    if (fieldValue === null || fieldValue === undefined) {
      return { success: false, error: 'Campo não preenchido' }
    }

    // Parse existing metadata
    const metadata = parseFieldMetadata(project.field_metadata)

    // Check L1 exists
    if (!metadata[fieldName]?.l1) {
      return { success: false, error: 'Campo precisa ter L1 antes de validar L2' }
    }

    // Apply L2
    const updatedMetadata = applyFieldMetadata(
      metadata,
      fieldName,
      2,
      user.id,
      fieldValue,
      { notes }
    )

    // Update project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        field_metadata: updatedMetadata as Json,
      })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError || !updatedProject) {
      console.error('Error validating field:', updateError)
      return { success: false, error: 'Erro ao validar campo' }
    }

    // Recalculate readiness
    await updateProjectReadiness(projectId)

    return { success: true, data: updatedProject }
  } catch (error) {
    console.error('Unexpected error in validateField:', error)
    return { success: false, error: 'Erro inesperado ao validar campo' }
  }
}

// ============================================
// Audit Field (Apply L3)
// ============================================

/**
 * Aplica auditoria L3 (Auditor externo) a um campo
 * Requer que o campo já tenha L2
 */
export async function auditField(
  projectId: string,
  fieldName: string,
  notes?: string
): Promise<ActionResult<Project>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    // Get field value
    const fieldValue = getProjectFieldValue(project, fieldName)
    if (fieldValue === null || fieldValue === undefined) {
      return { success: false, error: 'Campo não preenchido' }
    }

    // Parse existing metadata
    const metadata = parseFieldMetadata(project.field_metadata)

    // Check L2 exists
    if (!metadata[fieldName]?.l2) {
      return { success: false, error: 'Campo precisa ter L2 antes de auditar L3' }
    }

    // Apply L3
    const updatedMetadata = applyFieldMetadata(
      metadata,
      fieldName,
      3,
      user.id,
      fieldValue,
      { notes }
    )

    // Update project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        field_metadata: updatedMetadata as Json,
      })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError || !updatedProject) {
      console.error('Error auditing field:', updateError)
      return { success: false, error: 'Erro ao auditar campo' }
    }

    // Recalculate readiness
    await updateProjectReadiness(projectId)

    return { success: true, data: updatedProject }
  } catch (error) {
    console.error('Unexpected error in auditField:', error)
    return { success: false, error: 'Erro inesperado ao auditar campo' }
  }
}

// ============================================
// Get Field Validation Status
// ============================================

/**
 * Retorna o status de validação de todos os campos de um projeto
 */
export async function getFieldValidationStatus(
  projectId: string
): Promise<ActionResult<Record<string, { level: 0 | 1 | 2 | 3; isValid: boolean }>>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    const metadata = parseFieldMetadata(project.field_metadata)
    const checklist = getChecklistByObjective(project.objective)

    const status: Record<string, { level: 0 | 1 | 2 | 3; isValid: boolean }> = {}

    for (const item of checklist) {
      const fieldMeta = metadata[item.field]
      const currentLevel = getFieldLevel(fieldMeta)
      const fieldValue = getProjectFieldValue(project, item.field)
      const hasValue = fieldValue !== null && fieldValue !== undefined && fieldValue !== ''

      // Validate hash if metadata exists
      let isValid = true
      if (fieldMeta && hasValue) {
        const currentHash = generateHash(fieldValue)
        const storedHash = fieldMeta.l3?.hash || fieldMeta.l2?.hash || fieldMeta.l1?.hash
        isValid = storedHash === currentHash
      }

      status[item.field] = {
        level: currentLevel,
        isValid: hasValue && isValid,
      }
    }

    return { success: true, data: status }
  } catch (error) {
    console.error('Unexpected error in getFieldValidationStatus:', error)
    return { success: false, error: 'Erro inesperado ao obter status de validação' }
  }
}

// ============================================
// MRS Canonical Actions (E3/H3.1/H3.2/H3.3)
// ============================================

export interface MrsProjectSummary {
  id: string
  codename: string
  name: string
  readinessScore: number
  mrs: MrsReadinessData
}

export async function listMrsProjectsByOrgSlug(
  orgSlug: string
): Promise<ActionResult<MrsProjectSummary[]>> {
  try {
    const orgContext = await getAuthorizedAssetOrgContext(orgSlug)
    if (!orgContext.success || !orgContext.data) {
      return { success: false, error: orgContext.error }
    }

    const supabase = await createClient()
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, codename, name, readiness_score, readiness_data')
      .eq('organization_id', orgContext.data.orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error listing MRS projects:', error)
      return { success: false, error: 'Erro ao listar projetos de MRS' }
    }

    const summaries: MrsProjectSummary[] = (projects || []).map((project) => {
      const mrs = resolveMrsReadinessData(project.readiness_data)
      return {
        id: project.id,
        codename: project.codename,
        name: project.name,
        readinessScore: mrs.score.totalScore,
        mrs,
      }
    })

    return { success: true, data: summaries }
  } catch (error) {
    console.error('Unexpected error in listMrsProjectsByOrgSlug:', error)
    return { success: false, error: 'Erro inesperado ao listar MRS' }
  }
}

interface UpdateMrsItemInput {
  orgSlug: string
  projectId: string
  itemId: string
  status?: MrsStatus
  priority?: MrsPriority
  ownerUserId?: string
  comments?: string
}

export async function updateMrsItemAction(
  input: UpdateMrsItemInput
): Promise<ActionResult<MrsReadinessData>> {
  try {
    const orgContext = await getAuthorizedAssetOrgContext(input.orgSlug)
    if (!orgContext.success || !orgContext.data) {
      return { success: false, error: orgContext.error }
    }

    const supabase = await createClient()
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, readiness_data, organization_id')
      .eq('id', input.projectId)
      .eq('organization_id', orgContext.data.orgId)
      .is('deleted_at', null)
      .single()

    if (projectError || !project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    const currentMrs = resolveMrsReadinessData(project.readiness_data)
    const updatedMrs = updateMrsItem(currentMrs, input.itemId, {
      status: input.status,
      priority: input.priority,
      ownerUserId: input.ownerUserId,
      comments: input.comments,
    })

    const currentReadinessData =
      project.readiness_data && typeof project.readiness_data === 'object'
        ? (project.readiness_data as Record<string, unknown>)
        : {}

    const nextReadinessData = {
      ...currentReadinessData,
      mrs: updatedMrs,
      lastScore: updatedMrs.score.totalScore,
      lastCalculatedAt: updatedMrs.updatedAt,
      gates: updatedMrs.gates,
    } as unknown as Json

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        readiness_score: updatedMrs.score.totalScore,
        readiness_data: nextReadinessData,
      })
      .eq('id', input.projectId)

    if (updateError) {
      console.error('Error updating MRS item:', updateError)
      return { success: false, error: 'Erro ao atualizar item do MRS' }
    }

    await logReadinessAuditEvent(orgContext.data.userId, input.projectId, orgContext.data.orgId, {
      event: 'mrs.item.updated',
      itemId: input.itemId,
      status: input.status,
      priority: input.priority,
      ndaEligible: updatedMrs.gates.ndaEligible,
      nboEligible: updatedMrs.gates.nboEligible,
      stepScores: updatedMrs.score.stepScores,
      totalScore: updatedMrs.score.totalScore,
    })

    revalidatePath(`/${input.orgSlug}/mrs`)
    return { success: true, data: updatedMrs }
  } catch (error) {
    console.error('Unexpected error in updateMrsItemAction:', error)
    return { success: false, error: 'Erro inesperado ao atualizar item do MRS' }
  }
}

interface AddMrsItemFileInput {
  orgSlug: string
  projectId: string
  itemId: string
  fileName: string
  fileUrl?: string
  fileType?: string
  fileSizeBytes?: number
}

export async function addMrsItemFileAction(
  input: AddMrsItemFileInput
): Promise<ActionResult<MrsReadinessData>> {
  try {
    const orgContext = await getAuthorizedAssetOrgContext(input.orgSlug)
    if (!orgContext.success || !orgContext.data) {
      return { success: false, error: orgContext.error }
    }

    const supabase = await createClient()
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, readiness_data, organization_id')
      .eq('id', input.projectId)
      .eq('organization_id', orgContext.data.orgId)
      .is('deleted_at', null)
      .single()

    if (projectError || !project) {
      return { success: false, error: 'Projeto não encontrado' }
    }

    const currentMrs = resolveMrsReadinessData(project.readiness_data)
    const updatedMrs = addMrsItemFile(currentMrs, input.itemId, {
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSizeBytes: input.fileSizeBytes,
      uploadedBy: orgContext.data.userId,
    })

    const currentReadinessData =
      project.readiness_data && typeof project.readiness_data === 'object'
        ? (project.readiness_data as Record<string, unknown>)
        : {}

    const nextReadinessData = {
      ...currentReadinessData,
      mrs: updatedMrs,
      lastScore: updatedMrs.score.totalScore,
      lastCalculatedAt: updatedMrs.updatedAt,
      gates: updatedMrs.gates,
    } as unknown as Json

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        readiness_score: updatedMrs.score.totalScore,
        readiness_data: nextReadinessData,
      })
      .eq('id', input.projectId)

    if (updateError) {
      console.error('Error adding MRS item file:', updateError)
      return { success: false, error: 'Erro ao registrar upload no MRS' }
    }

    await logReadinessAuditEvent(orgContext.data.userId, input.projectId, orgContext.data.orgId, {
      event: 'mrs.item.file_added',
      itemId: input.itemId,
      fileName: input.fileName,
      ndaEligible: updatedMrs.gates.ndaEligible,
      nboEligible: updatedMrs.gates.nboEligible,
      totalScore: updatedMrs.score.totalScore,
    })

    revalidatePath(`/${input.orgSlug}/mrs`)
    return { success: true, data: updatedMrs }
  } catch (error) {
    console.error('Unexpected error in addMrsItemFileAction:', error)
    return { success: false, error: 'Erro inesperado ao registrar upload no MRS' }
  }
}

// ============================================
// Helper: Get project field value
// ============================================

function getProjectFieldValue(project: Project, field: string): unknown {
  const fieldMap: Record<string, keyof Project> = {
    codename: 'codename',
    objective: 'objective',
    description: 'description',
    sector_l1: 'sector_l1',
    sector_l2: 'sector_l2',
    sector_l3: 'sector_l3',
    value_min_usd: 'value_min_usd' as keyof Project,
    ebitda_annual_usd: 'ebitda_annual_usd',
    revenue_annual_usd: 'revenue_annual_usd',
  }

  const key = fieldMap[field]
  if (!key) return null

  return project[key]
}
