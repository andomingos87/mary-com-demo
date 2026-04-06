'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from './organizations'
import type { InvestmentThesis, Json } from '@/types/database'
import type {
  ActiveThesisResponse,
  CreateThesisInput,
  ThesisMutationOptions,
  UpdateThesisInput,
} from '@/types/thesis'

interface ThesisOrgContext {
  id: string
  profile_type: string
  verification_status: string
}

async function getAuthenticatedUserId() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { supabase, error: 'Não autenticado' as const }
  }

  return { supabase, userId: user.id as string }
}

async function validateThesisOrgAccess(
  organizationId: string,
  userId: string,
  options?: { requireWritable?: boolean }
): Promise<ActionResult<ThesisOrgContext>> {
  const supabase = await createClient()

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
    .eq('user_id', userId)
    .single()

  if (membershipError || !membership) {
    return { success: false, error: 'Você não possui acesso a esta organização' }
  }

  if (org.profile_type !== 'investor') {
    return { success: false, error: 'Módulo de tese disponível apenas para perfil investidor' }
  }

  if (options?.requireWritable && org.verification_status === 'pending') {
    return { success: false, error: 'Conta em análise. Ação disponível após a verificação.' }
  }

  return { success: true, data: org }
}

function normalizeCriteria(criteria?: Record<string, unknown>): ActionResult<Json> {
  if (!criteria) {
    return { success: true, data: {} }
  }

  const normalized: Record<string, unknown> = { ...criteria }

  const listFields: Array<keyof typeof normalized> = [
    'sectors',
    'targetAudience',
    'geo',
    'stage',
    'operationType',
  ]
  for (const field of listFields) {
    if (normalized[field] !== undefined && !Array.isArray(normalized[field])) {
      const labels: Record<string, string> = {
        sectors: 'Setores',
        targetAudience: 'Publico-alvo',
        geo: 'Geografia',
        stage: 'Estagio',
        operationType: 'Tipo de operacao',
      }
      return { success: false, error: `${labels[String(field)] || String(field)} deve ser uma lista.` }
    }
  }

  const robMin = normalized.robMin
  const robMax = normalized.robMax
  const ebitdaPercentMin = normalized.ebitdaPercentMin
  const ticketMin = normalized.ticketMin
  const ticketMax = normalized.ticketMax

  if (robMin !== undefined && robMin !== null && typeof robMin !== 'number') {
    return { success: false, error: 'ROB minimo deve ser um numero valido.' }
  }

  if (robMax !== undefined && robMax !== null && typeof robMax !== 'number') {
    return { success: false, error: 'ROB maximo deve ser um numero valido.' }
  }

  if (
    typeof robMin === 'number' &&
    typeof robMax === 'number' &&
    Number.isFinite(robMin) &&
    Number.isFinite(robMax) &&
    robMin > robMax
  ) {
    return { success: false, error: 'ROB minimo nao pode ser maior que ROB maximo.' }
  }

  if (
    ebitdaPercentMin !== undefined &&
    ebitdaPercentMin !== null &&
    (typeof ebitdaPercentMin !== 'number' ||
      !Number.isFinite(ebitdaPercentMin) ||
      ebitdaPercentMin < 0 ||
      ebitdaPercentMin > 100)
  ) {
    return { success: false, error: 'EBITDA % minimo deve estar entre 0 e 100.' }
  }

  if (ticketMin !== undefined && ticketMin !== null && typeof ticketMin !== 'number') {
    return { success: false, error: 'Cheque minimo deve ser um numero valido.' }
  }

  if (ticketMax !== undefined && ticketMax !== null && typeof ticketMax !== 'number') {
    return { success: false, error: 'Cheque maximo deve ser um numero valido.' }
  }

  if (
    typeof ticketMin === 'number' &&
    typeof ticketMax === 'number' &&
    Number.isFinite(ticketMin) &&
    Number.isFinite(ticketMax) &&
    ticketMin > ticketMax
  ) {
    return { success: false, error: 'Cheque minimo nao pode ser maior que cheque maximo.' }
  }

  const exclusionCriteria = normalized.exclusionCriteria
  if (
    exclusionCriteria !== undefined &&
    exclusionCriteria !== null &&
    typeof exclusionCriteria !== 'string'
  ) {
    return { success: false, error: 'Criterios de exclusao deve ser um texto.' }
  }

  const additionalInfo = normalized.additionalInfo
  if (additionalInfo !== undefined && additionalInfo !== null && typeof additionalInfo !== 'string') {
    return { success: false, error: 'Informacoes adicionais deve ser um texto.' }
  }

  return { success: true, data: normalized as Json }
}

export async function listTheses(organizationId: string): Promise<ActionResult<InvestmentThesis[]>> {
  try {
    const auth = await getAuthenticatedUserId()
    if (auth.error || !auth.userId) {
      return { success: false, error: auth.error }
    }

    const access = await validateThesisOrgAccess(organizationId, auth.userId)
    if (!access.success) {
      return { success: false, error: access.error }
    }

    const { data, error } = await auth.supabase
      .from('investment_theses')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('is_active', { ascending: false })
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error listing theses:', error)
      return { success: false, error: 'Erro ao listar teses' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error in listTheses:', error)
    return { success: false, error: 'Erro inesperado ao listar teses' }
  }
}

export async function getActiveThesis(
  organizationId: string
): Promise<ActionResult<ActiveThesisResponse>> {
  try {
    const auth = await getAuthenticatedUserId()
    if (auth.error || !auth.userId) {
      return { success: false, error: auth.error }
    }

    const access = await validateThesisOrgAccess(organizationId, auth.userId)
    if (!access.success || !access.data) {
      return { success: false, error: access.error }
    }

    const metadata = {
      organizationId,
      profileType: access.data.profile_type,
      readOnlyMode: access.data.verification_status === 'pending',
    }

    const { data, error } = await auth.supabase
      .from('investment_theses')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error getting active thesis:', error)
      return { success: false, error: 'Erro ao buscar tese ativa' }
    }

    const thesis = (data && data.length > 0 ? data[0] : null) as InvestmentThesis | null

    if (!thesis) {
      return {
        success: true,
        data: {
          thesis: null,
          state: 'no_active_thesis',
          metadata,
        },
      }
    }

    return {
      success: true,
      data: {
        thesis,
        state: 'active_found',
        metadata,
      },
    }
  } catch (error) {
    console.error('Unexpected error in getActiveThesis:', error)
    return { success: false, error: 'Erro inesperado ao buscar tese ativa' }
  }
}

export async function createThesis(
  input: CreateThesisInput,
  options?: ThesisMutationOptions
): Promise<ActionResult<InvestmentThesis>> {
  try {
    const auth = await getAuthenticatedUserId()
    if (auth.error || !auth.userId) {
      return { success: false, error: auth.error }
    }

    const access = await validateThesisOrgAccess(input.organizationId, auth.userId, {
      requireWritable: true,
    })
    if (!access.success) {
      return { success: false, error: access.error }
    }

    const name = input.name?.trim()
    if (!name || name.length < 2) {
      return { success: false, error: 'Nome da tese é obrigatório (mínimo 2 caracteres)' }
    }

    const criteriaResult = normalizeCriteria(input.criteria)
    if (!criteriaResult.success) {
      return { success: false, error: criteriaResult.error }
    }

    const { data, error } = await auth.supabase
      .from('investment_theses')
      .insert({
        organization_id: input.organizationId,
        name,
        summary: input.summary?.trim() || null,
        criteria: criteriaResult.data,
        is_active: false,
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .select('*')
      .single()

    if (error || !data) {
      console.error('Error creating thesis:', error)
      return { success: false, error: 'Erro ao criar tese' }
    }

    if (options?.setActive) {
      const activeResult = await activateThesis(data.id)
      if (!activeResult.success || !activeResult.data) {
        return { success: false, error: activeResult.error || 'Erro ao ativar tese recém-criada' }
      }
      return { success: true, data: activeResult.data }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error in createThesis:', error)
    return { success: false, error: 'Erro inesperado ao criar tese' }
  }
}

export async function updateThesis(
  thesisId: string,
  input: UpdateThesisInput
): Promise<ActionResult<InvestmentThesis>> {
  try {
    const auth = await getAuthenticatedUserId()
    if (auth.error || !auth.userId) {
      return { success: false, error: auth.error }
    }

    const { data: currentThesis, error: currentError } = await auth.supabase
      .from('investment_theses')
      .select('*')
      .eq('id', thesisId)
      .single()

    if (currentError || !currentThesis || currentThesis.deleted_at) {
      return { success: false, error: 'Tese não encontrada ou removida' }
    }

    const access = await validateThesisOrgAccess(currentThesis.organization_id, auth.userId, {
      requireWritable: true,
    })
    if (!access.success) {
      return { success: false, error: access.error }
    }

    const updatePayload: Record<string, unknown> = { updated_by: auth.userId }

    if (input.name !== undefined) {
      const parsedName = input.name.trim()
      if (parsedName.length < 2) {
        return { success: false, error: 'Nome da tese é obrigatório (mínimo 2 caracteres)' }
      }
      updatePayload.name = parsedName
    }

    if (input.summary !== undefined) {
      updatePayload.summary = input.summary.trim() || null
    }

    if (input.criteria !== undefined) {
      const criteriaResult = normalizeCriteria(input.criteria)
      if (!criteriaResult.success) {
        return { success: false, error: criteriaResult.error }
      }
      updatePayload.criteria = criteriaResult.data
    }

    if (Object.keys(updatePayload).length === 1) {
      return { success: true, data: currentThesis }
    }

    const { data, error } = await auth.supabase
      .from('investment_theses')
      .update(updatePayload)
      .eq('id', thesisId)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (error || !data) {
      console.error('Error updating thesis:', error)
      return { success: false, error: 'Erro ao atualizar tese' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error in updateThesis:', error)
    return { success: false, error: 'Erro inesperado ao atualizar tese' }
  }
}

export async function autoSaveThesisField(
  thesisId: string,
  field: 'name' | 'summary' | 'criteria',
  value: unknown
): Promise<ActionResult<InvestmentThesis>> {
  if (field === 'name' && typeof value !== 'string') {
    return { success: false, error: 'Nome da tese inválido' }
  }
  if (field === 'summary' && typeof value !== 'string') {
    return { success: false, error: 'Resumo da tese inválido' }
  }
  if (field === 'criteria' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
    return { success: false, error: 'Critérios da tese inválidos' }
  }

  const payload: UpdateThesisInput =
    field === 'name'
      ? { name: value as string }
      : field === 'summary'
        ? { summary: value as string }
        : { criteria: value as UpdateThesisInput['criteria'] }

  return updateThesis(thesisId, payload)
}

export async function activateThesis(thesisId: string): Promise<ActionResult<InvestmentThesis>> {
  try {
    const auth = await getAuthenticatedUserId()
    if (auth.error || !auth.userId) {
      return { success: false, error: auth.error }
    }

    const { data: targetThesis, error: targetError } = await auth.supabase
      .from('investment_theses')
      .select('*')
      .eq('id', thesisId)
      .single()

    if (targetError || !targetThesis || targetThesis.deleted_at) {
      return { success: false, error: 'Tese não encontrada ou removida' }
    }

    const access = await validateThesisOrgAccess(targetThesis.organization_id, auth.userId, {
      requireWritable: true,
    })
    if (!access.success) {
      return { success: false, error: access.error }
    }

    if (targetThesis.is_active) {
      return { success: true, data: targetThesis }
    }

    const now = new Date().toISOString()

    const { error: deactivateError } = await auth.supabase
      .from('investment_theses')
      .update({
        is_active: false,
        updated_by: auth.userId,
        updated_at: now,
      })
      .eq('organization_id', targetThesis.organization_id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .neq('id', targetThesis.id)

    if (deactivateError) {
      console.error('Error deactivating active thesis:', deactivateError)
      return { success: false, error: 'Erro ao desativar tese ativa anterior' }
    }

    const { data: activated, error: activateError } = await auth.supabase
      .from('investment_theses')
      .update({
        is_active: true,
        updated_by: auth.userId,
        updated_at: now,
      })
      .eq('id', targetThesis.id)
      .is('deleted_at', null)
      .select('*')
      .single()

    if (activateError || !activated) {
      console.error('Error activating thesis:', activateError)
      if (activateError?.code === '23505') {
        return {
          success: false,
          error: 'Conflito de ativação simultânea. Atualize a tela e tente novamente.',
        }
      }
      return { success: false, error: 'Erro ao ativar tese' }
    }

    return { success: true, data: activated }
  } catch (error) {
    console.error('Unexpected error in activateThesis:', error)
    return { success: false, error: 'Erro inesperado ao ativar tese' }
  }
}

export async function deleteThesis(thesisId: string): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthenticatedUserId()
    if (auth.error || !auth.userId) {
      return { success: false, error: auth.error }
    }

    const { data: thesis, error: fetchError } = await auth.supabase
      .from('investment_theses')
      .select('id, organization_id, deleted_at')
      .eq('id', thesisId)
      .single()

    if (fetchError || !thesis || thesis.deleted_at) {
      return { success: false, error: 'Tese não encontrada ou removida' }
    }

    const access = await validateThesisOrgAccess(thesis.organization_id, auth.userId, {
      requireWritable: true,
    })
    if (!access.success) {
      return { success: false, error: access.error }
    }

    const { error: deleteError } = await auth.supabase
      .from('investment_theses')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        updated_by: auth.userId,
      })
      .eq('id', thesisId)
      .is('deleted_at', null)

    if (deleteError) {
      console.error('Error deleting thesis:', deleteError)
      return { success: false, error: 'Erro ao remover tese' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteThesis:', error)
    return { success: false, error: 'Erro inesperado ao remover tese' }
  }
}
