'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveThesis } from '@/lib/actions/thesis'
import { createNotification } from '@/lib/actions/notifications'
import type { Tables } from '@/types/database'
import type { ActionResult } from './organizations'
import { computeRadarScore, type ScoreContext } from '@/lib/radar/score'
import type {
  RadarOpportunity,
  RadarQueryOptions,
  RadarResult,
  RequestNdaInput,
  RequestNdaResult,
  ToggleFollowInput,
  ToggleFollowResult,
} from '@/types/radar'
import { isFrontendDemo } from '@/lib/demo/frontend-demo'
import { getMockRadarResult } from '@/lib/demo/mock-radar-result'

type ProjectRow = Pick<
  Tables<'projects'>,
  | 'id'
  | 'organization_id'
  | 'codename'
  | 'sector_l1'
  | 'sector_l2'
  | 'sector_l3'
  | 'revenue_annual_usd'
  | 'value_min_usd'
  | 'value_max_usd'
  | 'objective'
  | 'status'
  | 'updated_at'
  | 'description'
  | 'extra_data'
>

interface InvestorOrgContext {
  userId: string
  verificationStatus: string
}

const DEFAULT_THRESHOLD = 50
const DEFAULT_LIMIT = 24
const FALLBACK_LIMIT = 5

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function toStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    const normalized = normalizeText(value)
    return normalized ? [normalized] : []
  }
  if (!Array.isArray(value)) return []
  return value
    .map((item) => normalizeText(item))
    .filter((item) => item.length > 0)
}

function toOptionalNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return value
}

async function getAuthenticatedInvestorContext(
  organizationId: string,
  requireWritable = false
): Promise<ActionResult<InvestorOrgContext>> {
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
    .select('id, profile_type, verification_status')
    .eq('id', organizationId)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    return { success: false, error: 'Organização não encontrada' }
  }

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (membershipError || !membership) {
    return { success: false, error: 'Você não possui acesso a esta organização' }
  }

  if (org.profile_type !== 'investor') {
    return { success: false, error: 'Módulo de radar disponível apenas para perfil investidor' }
  }

  if (requireWritable && org.verification_status === 'pending') {
    return { success: false, error: 'Conta em análise. Ação disponível após a verificação.' }
  }

  return {
    success: true,
    data: {
      userId: user.id,
      verificationStatus: org.verification_status,
    },
  }
}

export async function listRadarOpportunities(
  organizationId: string,
  options?: RadarQueryOptions
): Promise<ActionResult<RadarResult>> {
  try {
    const threshold = options?.threshold ?? DEFAULT_THRESHOLD
    const limit = options?.limit ?? DEFAULT_LIMIT

    const accessResult = await getAuthenticatedInvestorContext(organizationId)
    if (!accessResult.success || !accessResult.data) {
      return { success: false, error: accessResult.error }
    }

    const readOnlyModeEarly = accessResult.data.verificationStatus === 'pending'
    if (isFrontendDemo()) {
      return { success: true, data: getMockRadarResult(readOnlyModeEarly) }
    }

    const activeThesisResult = await getActiveThesis(organizationId)
    if (!activeThesisResult.success || !activeThesisResult.data) {
      return { success: false, error: activeThesisResult.error || 'Erro ao buscar tese ativa' }
    }

    const readOnlyMode = accessResult.data.verificationStatus === 'pending'

    if (!activeThesisResult.data.thesis) {
      return {
        success: true,
        data: {
          state: 'no_active_thesis',
          activeThesis: null,
          opportunities: [],
          fallbackUsed: false,
          readOnlyMode,
        },
      }
    }

    const thesis = activeThesisResult.data.thesis
    const criteria = (thesis.criteria || {}) as Record<string, unknown>
    const scoreContext: ScoreContext = {
      sectors: toStringArray(criteria.sectors),
      targetAudience: toStringArray(criteria.targetAudience),
      geo: toStringArray(criteria.geo),
      robMin: toOptionalNumber(criteria.robMin),
      robMax: toOptionalNumber(criteria.robMax),
      ebitdaPercentMin: toOptionalNumber(criteria.ebitdaPercentMin),
      stage: toStringArray(criteria.stage),
      operationType: Array.from(new Set(toStringArray(criteria.operationType))),
      ticketMin: toOptionalNumber(criteria.ticketMin),
      ticketMax: toOptionalNumber(criteria.ticketMax),
    }

    const supabase = await createClient()
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(
        'id, organization_id, codename, sector_l1, sector_l2, sector_l3, revenue_annual_usd, value_min_usd, value_max_usd, objective, status, updated_at, description, extra_data'
      )
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .neq('organization_id', organizationId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (projectsError) {
      console.error('Error listing radar projects:', projectsError)
      return { success: false, error: 'Erro ao buscar oportunidades do radar' }
    }

    const baseProjects = (projects || []) as ProjectRow[]
    if (baseProjects.length === 0) {
      return {
        success: true,
        data: {
          state: 'no_matches',
          activeThesis: thesis,
          opportunities: [],
          fallbackUsed: false,
          readOnlyMode,
        },
      }
    }

    const projectIds = baseProjects.map((project) => project.id)

    const { data: follows, error: followsError } = await supabase
      .from('investor_follows')
      .select('project_id')
      .eq('investor_organization_id', organizationId)
      .in('project_id', projectIds)
      .is('deleted_at', null)

    if (followsError) {
      console.error('Error listing follows for radar:', followsError)
      return { success: false, error: 'Erro ao buscar estado de follow' }
    }

    const { data: ndaRequests, error: ndaError } = await supabase
      .from('nda_requests')
      .select('project_id, status')
      .eq('investor_organization_id', organizationId)
      .in('project_id', projectIds)
      .is('deleted_at', null)

    if (ndaError) {
      console.error('Error listing NDA requests for radar:', ndaError)
      return { success: false, error: 'Erro ao buscar estado de NDA' }
    }

    const followingProjectIds = new Set((follows || []).map((item) => item.project_id))
    const ndaRequestedProjectIds = new Set(
      (ndaRequests || [])
        .filter((item) => item.status !== 'cancelled')
        .map((item) => item.project_id)
    )

    const opportunities: RadarOpportunity[] = baseProjects.map((project) => {
      const { score, reasons } = computeRadarScore(project, scoreContext)
      const hasDescription = !!project.description?.trim()
      const hasNdaRequest = ndaRequestedProjectIds.has(project.id)

      return {
        projectId: project.id,
        assetOrganizationId: project.organization_id,
        codename: project.codename,
        sector: project.sector_l1 || project.sector_l2 || project.sector_l3,
        matchScore: score,
        updatedAt: project.updated_at,
        teaserSummary: hasDescription ? project.description : null,
        matchReasons: reasons,
        ctaState: {
          canViewTeaser: hasDescription,
          canRequestNda: !hasNdaRequest && !readOnlyMode,
          isFollowing: followingProjectIds.has(project.id),
          hasNdaRequest,
        },
      }
    })

    const sorted = opportunities.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    const aboveThreshold = sorted.filter((item) => item.matchScore >= threshold)
    const fallbackUsed = aboveThreshold.length === 0
    const finalItems = fallbackUsed ? sorted.slice(0, FALLBACK_LIMIT) : aboveThreshold

    return {
      success: true,
      data: {
        state: finalItems.length > 0 ? 'matches_found' : 'no_matches',
        activeThesis: thesis,
        opportunities: finalItems,
        fallbackUsed,
        readOnlyMode,
      },
    }
  } catch (error) {
    console.error('Unexpected error in listRadarOpportunities:', error)
    return { success: false, error: 'Erro inesperado ao listar oportunidades do radar' }
  }
}

export async function toggleFollowOpportunity(
  input: ToggleFollowInput
): Promise<ActionResult<ToggleFollowResult>> {
  try {
    const accessResult = await getAuthenticatedInvestorContext(input.organizationId, true)
    if (!accessResult.success || !accessResult.data) {
      return { success: false, error: accessResult.error }
    }

    const supabase = await createClient()
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', input.projectId)
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .single()

    if (projectError || !project) {
      return { success: false, error: 'Oportunidade não encontrada' }
    }

    if (project.organization_id === input.organizationId) {
      return { success: false, error: 'Você não pode seguir a própria organização' }
    }

    const { data: existing, error: existingError } = await supabase
      .from('investor_follows')
      .select('id')
      .eq('investor_organization_id', input.organizationId)
      .eq('project_id', input.projectId)
      .is('deleted_at', null)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking follow state:', existingError)
      return { success: false, error: 'Erro ao verificar follow' }
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from('investor_follows')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: accessResult.data.userId,
        })
        .eq('id', existing.id)
        .is('deleted_at', null)

      if (deleteError) {
        console.error('Error deleting follow:', deleteError)
        return { success: false, error: 'Erro ao remover follow' }
      }

      return { success: true, data: { isFollowing: false } }
    }

    const { error: insertError } = await supabase.from('investor_follows').insert({
      investor_organization_id: input.organizationId,
      asset_organization_id: project.organization_id,
      project_id: input.projectId,
      created_by: accessResult.data.userId,
      updated_by: accessResult.data.userId,
    })

    if (insertError) {
      console.error('Error creating follow:', insertError)
      return { success: false, error: 'Erro ao criar follow' }
    }

    return { success: true, data: { isFollowing: true } }
  } catch (error) {
    console.error('Unexpected error in toggleFollowOpportunity:', error)
    return { success: false, error: 'Erro inesperado ao atualizar follow' }
  }
}

export async function requestNdaForOpportunity(
  input: RequestNdaInput
): Promise<ActionResult<RequestNdaResult>> {
  try {
    const accessResult = await getAuthenticatedInvestorContext(input.organizationId, true)
    if (!accessResult.success || !accessResult.data) {
      return { success: false, error: accessResult.error }
    }

    const supabase = await createClient()
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, codename, organization_id')
      .eq('id', input.projectId)
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .single()

    if (projectError || !project) {
      return { success: false, error: 'Oportunidade não encontrada' }
    }

    if (project.organization_id === input.organizationId) {
      return { success: false, error: 'Você não pode solicitar NDA para a própria organização' }
    }

    const { data: existing, error: existingError } = await supabase
      .from('nda_requests')
      .select('id')
      .eq('investor_organization_id', input.organizationId)
      .eq('project_id', input.projectId)
      .is('deleted_at', null)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking NDA request:', existingError)
      return { success: false, error: 'Erro ao verificar solicitação de NDA' }
    }

    if (existing) {
      return {
        success: true,
        data: {
          requestId: existing.id,
          created: false,
        },
      }
    }

    const activeThesis = await getActiveThesis(input.organizationId)
    const thesisId = activeThesis.success && activeThesis.data?.thesis ? activeThesis.data.thesis.id : null

    const { data: createdRequest, error: createError } = await supabase
      .from('nda_requests')
      .insert({
        investor_organization_id: input.organizationId,
        asset_organization_id: project.organization_id,
        project_id: input.projectId,
        thesis_id: thesisId,
        status: 'pending',
        requested_by: accessResult.data.userId,
        updated_by: accessResult.data.userId,
      })
      .select('id')
      .single()

    if (createError || !createdRequest) {
      console.error('Error creating NDA request:', createError)
      return { success: false, error: 'Erro ao registrar solicitação de NDA' }
    }

    const { data: targetMembers, error: membersError } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', project.organization_id)
      .in('role', ['owner', 'admin'])

    if (membersError) {
      console.error('Error loading organization members for NDA notification:', membersError)
    } else if (targetMembers && targetMembers.length > 0) {
      const uniqueUsers = Array.from(new Set(targetMembers.map((member) => member.user_id)))
      await Promise.all(
        uniqueUsers.map((userId) =>
          createNotification({
            userId,
            type: 'system.info',
            title: 'Nova solicitação de NDA',
            body: `O investidor solicitou NDA para a oportunidade ${project.codename}.`,
            data: {
              source: 'radar',
              ndaRequestId: createdRequest.id,
              projectId: input.projectId,
              codename: project.codename,
            },
          })
        )
      )
    }

    return {
      success: true,
      data: {
        requestId: createdRequest.id,
        created: true,
      },
    }
  } catch (error) {
    console.error('Unexpected error in requestNdaForOpportunity:', error)
    return { success: false, error: 'Erro inesperado ao solicitar NDA' }
  }
}
