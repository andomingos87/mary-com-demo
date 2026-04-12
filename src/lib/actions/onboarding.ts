'use server'

/**
 * Onboarding Server Actions
 * Phase 3.3 - Backend: Server Actions de Onboarding
 * 
 * Actions para orquestrar o fluxo de onboarding com enriquecimento de dados
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type {
  Organization,
  OrganizationProfile,
  OnboardingStep,
  OnboardingData,
  OnboardingProgress,
  Json,
  Database,
} from '@/types/database'
import type {
  ActionResult,
  StartOnboardingResult,
  StartOnboardingOptions,
  ExistingOrgCheck,
  EnrichedCnpjData,
  EnrichedWebsiteDataResult,
  GeneratedDescriptionResult,
  ProfileDetailsInput,
  AssetCompanyData,
  AssetMatchingData,
  AssetTeamData,
  AssetCodenameData,
  EligibilityInput,
  EligibilityResult,
  OnboardingProgressResult,
  ELIGIBILITY_CRITERIA,
} from '@/types/onboarding'
import { getNextStep } from '@/types/onboarding'
import {
  fetchCnpjData,
  cleanCnpj,
  isValidCnpjFormat,
  scrapeWebsite,
  prepareContentForAI,
  extractDomain,
  fetchLogo,
  checkCvmRegistration,
  generateDescription as generateAIDescription,
  generateFallbackDescription,
  isValidUrl,
  normalizeUrl,
} from '@/lib/enrichment'

// ============================================
// Helper: Log audit event
// ============================================

async function logOnboardingAuditEvent(
  action: Database["public"]["Enums"]["audit_action"],
  userId: string,
  orgId: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createAdminClient()
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip')
  const userAgent = headersList.get('user-agent')

  await supabase.from('audit_logs').insert({
    action,
    user_id: userId,
    organization_id: orgId,
    metadata: metadata as Json,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// ============================================
// Helper: Generate unique slug
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
}

async function generateUniqueSlug(name: string): Promise<string> {
  const adminSupabase = await createAdminClient()
  let baseSlug = generateSlug(name)
  if (!baseSlug) {
    baseSlug = 'org'
  }

  // Always add a unique suffix to prevent collisions
  const timestamp = Date.now().toString(36) // Full base36 timestamp
  const randomPart = Math.random().toString(36).slice(2, 6)
  const uniqueSlug = `${baseSlug}-${timestamp}-${randomPart}`

  // Double-check this exact slug doesn't exist (very unlikely)
  const { data: existing } = await adminSupabase
    .from('organizations')
    .select('slug')
    .eq('slug', uniqueSlug)
    .is('deleted_at', null)
    .single()

  if (existing) {
    // Extremely rare: add another random suffix
    return `${uniqueSlug}-${Math.random().toString(36).slice(2, 4)}`
  }

  return uniqueSlug
}

function normalizeProjectCodename(rawCodename: string, orgId: string): string {
  const normalized = rawCodename
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

  if (normalized.length >= 3) {
    return normalized
  }

  return `projeto-${orgId.slice(0, 8)}`
}

async function generateUniqueProjectCodename(
  orgId: string,
  baseCodename: string
): Promise<string> {
  const adminSupabase = await createAdminClient()
  let candidate = baseCodename
  let suffix = 1

  while (true) {
    const { data: existing } = await adminSupabase
      .from('projects')
      .select('id')
      .eq('organization_id', orgId)
      .eq('codename', candidate)
      .is('deleted_at', null)
      .maybeSingle()

    if (!existing) {
      return candidate
    }

    suffix += 1
    const suffixText = `-${suffix}`
    const maxBaseLength = Math.max(3, 50 - suffixText.length)
    candidate = `${baseCodename.slice(0, maxBaseLength)}${suffixText}`
  }
}

async function ensureAssetProjectSeed(
  org: Pick<Organization, 'id' | 'name' | 'created_by' | 'profile_type'> & { onboarding_data: Json | null }
): Promise<ActionResult<{ codename: string }>> {
  if (org.profile_type !== 'asset') {
    return { success: true, data: { codename: '' } }
  }

  const adminSupabase = await createAdminClient()

  const { data: existingProject } = await adminSupabase
    .from('projects')
    .select('id, codename')
    .eq('organization_id', org.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingProject?.codename) {
    return { success: true, data: { codename: existingProject.codename } }
  }

  const onboardingData =
    org.onboarding_data && typeof org.onboarding_data === 'object' && !Array.isArray(org.onboarding_data)
      ? (org.onboarding_data as Record<string, unknown>)
      : {}
  const assetCodenameData =
    onboardingData.assetCodenameData &&
    typeof onboardingData.assetCodenameData === 'object' &&
    !Array.isArray(onboardingData.assetCodenameData)
      ? (onboardingData.assetCodenameData as Record<string, unknown>)
      : {}
  const desiredCodenameRaw = assetCodenameData.codename
  const desiredCodename =
    typeof desiredCodenameRaw === 'string' && desiredCodenameRaw.trim().length > 0
      ? desiredCodenameRaw.trim()
      : `Projeto ${org.name || 'Ativo'}`
  const normalizedCodename = normalizeProjectCodename(desiredCodename, org.id)
  const uniqueCodename = await generateUniqueProjectCodename(org.id, normalizedCodename)
  const assetCompanyData =
    onboardingData.assetCompanyData &&
    typeof onboardingData.assetCompanyData === 'object' &&
    !Array.isArray(onboardingData.assetCompanyData)
      ? (onboardingData.assetCompanyData as Record<string, unknown>)
      : {}
  const projectObjective =
    assetCompanyData.projectObjective &&
    typeof assetCompanyData.projectObjective === 'object' &&
    !Array.isArray(assetCompanyData.projectObjective)
      ? (assetCompanyData.projectObjective as Record<string, unknown>)
      : {}
  const projectObjectiveRaw = projectObjective.type
  const objective: Database['public']['Enums']['project_objective'] =
    projectObjectiveRaw === 'fundraising' ? 'fundraising' : 'sale'

  const { error: insertError } = await adminSupabase
    .from('projects')
    .insert({
      organization_id: org.id,
      name: desiredCodename,
      codename: uniqueCodename,
      objective,
      status: 'teaser',
      description: typeof assetCompanyData.companyDescription === 'string' ? assetCompanyData.companyDescription : null,
      created_by: org.created_by || null,
      visibility: 'private',
    })

  if (insertError) {
    console.error('Error creating seed project from onboarding codename:', insertError)
    return { success: false, error: 'Erro ao preparar projeto inicial do ativo' }
  }

  return { success: true, data: { codename: uniqueCodename } }
}

// ============================================
// Helper: Advance onboarding step
// ============================================

async function advanceStep(
  orgId: string,
  newStep: OnboardingStep,
  stepData?: Record<string, unknown>
): Promise<{ success: boolean; currentStep: OnboardingStep; message: string }> {
  const adminSupabase = await createAdminClient()
  
  const { data, error } = await adminSupabase.rpc('advance_onboarding_step', {
    p_org_id: orgId,
    p_new_step: newStep,
    p_step_data: stepData as Json,
  })

  if (error) {
    console.error('Error advancing step:', error)
    return { success: false, currentStep: newStep, message: error.message }
  }

  const result = Array.isArray(data) ? data[0] : data
  if (result) {
    // Map snake_case from DB to camelCase
    return {
      success: result.success,
      currentStep: result.current_step,
      message: result.message,
    }
  }
  return { success: false, currentStep: newStep, message: 'Unknown error' }
}

// ============================================
// 0. checkExistingOnboarding - Verifica org existente
// ============================================

export async function checkExistingOnboarding(): Promise<ActionResult<ExistingOrgCheck>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const adminSupabase = await createAdminClient()
    const { data: existingOrg } = await adminSupabase
      .from('organizations')
      .select('id, name, cnpj, onboarding_step, profile_type')
      .eq('created_by', user.id)
      .neq('onboarding_step', 'completed')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return {
      success: true,
      data: {
        hasIncompleteOrg: !!existingOrg,
        organization: existingOrg ? {
          id: existingOrg.id,
          name: existingOrg.name,
          cnpj: existingOrg.cnpj,
          onboarding_step: existingOrg.onboarding_step as OnboardingStep,
          profile_type: existingOrg.profile_type as OrganizationProfile,
        } : undefined,
      }
    }
  } catch (error) {
    console.error('Unexpected error in checkExistingOnboarding:', error)
    return { success: false, error: 'Erro ao verificar onboarding existente' }
  }
}

// ============================================
// 1. startOnboarding - Cria organização draft
// ============================================

export async function startOnboarding(
  profileType: OrganizationProfile,
  options?: StartOnboardingOptions
): Promise<ActionResult<StartOnboardingResult>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Validate profile type
    if (!['investor', 'asset', 'advisor'].includes(profileType)) {
      return { success: false, error: 'Tipo de perfil inválido' }
    }

    const adminSupabase = await createAdminClient()
    const initialStep: OnboardingStep = profileType === 'investor' ? 'profile_details' : 'cnpj_input'

    // Check for existing incomplete organization (unless forceNew)
    if (!options?.forceNew) {
      const { data: existingOrg } = await adminSupabase
        .from('organizations')
        .select('id, onboarding_step, profile_type, cnpj')
        .eq('created_by', user.id)
        .neq('onboarding_step', 'completed')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingOrg) {
        // If profile type is different, update it and reset to cnpj_input
        if (existingOrg.profile_type !== profileType) {
          await adminSupabase
            .from('organizations')
            .update({ 
              profile_type: profileType,
              onboarding_step: initialStep,
            })
            .eq('id', existingOrg.id)

          return {
            success: true,
            data: {
              orgId: existingOrg.id,
              step: initialStep,
              isResumed: true,
            },
          }
        }

        // Return existing org with current step
        return {
          success: true,
          data: {
            orgId: existingOrg.id,
            step: existingOrg.onboarding_step as OnboardingStep,
            isResumed: true,
          },
        }
      }
    }

    // If forceNew, soft delete existing incomplete organizations
    if (options?.forceNew) {
      await adminSupabase
        .from('organizations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('created_by', user.id)
        .neq('onboarding_step', 'completed')
        .is('deleted_at', null)
    }

    // Generate temporary name and slug
    const tempName = `Nova Organização - ${new Date().toLocaleDateString('pt-BR')}`
    const slug = await generateUniqueSlug(tempName)

    // Create organization in draft state
    const orgData = {
      name: tempName,
      slug,
      profile_type: profileType,
      created_by: user.id,
      onboarding_step: initialStep,
      onboarding_started_at: new Date().toISOString(),
      onboarding_data: {
        flow: {
          started_at: new Date().toISOString(),
          steps_completed: ['profile_selection'],
        },
      } as unknown as Json,
      verification_status: 'pending' as const,
    }

    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single()

    if (orgError || !org) {
      console.error('Error creating organization:', orgError)
      return { success: false, error: 'Erro ao criar organização' }
    }

    // Add creator as owner
    const memberData = {
      organization_id: org.id,
      user_id: user.id,
      role: 'owner' as const,
      verification_status: 'pending' as const,
    }

    const { error: memberError } = await adminSupabase
      .from('organization_members')
      .insert(memberData)

    if (memberError) {
      console.error('Error adding owner:', memberError)
      // Rollback organization creation
      await adminSupabase.from('organizations').delete().eq('id', org.id)
      return { success: false, error: 'Erro ao configurar proprietário' }
    }

    // Log audit event
    await logOnboardingAuditEvent('onboarding.started', user.id, org.id, {
      profile_type: profileType,
      step: initialStep,
      is_new: true,
    })

    return {
      success: true,
      data: {
        orgId: org.id,
        step: initialStep,
        isResumed: false,
      },
    }
  } catch (error) {
    console.error('Unexpected error in startOnboarding:', error)
    return { success: false, error: 'Erro inesperado ao iniciar onboarding' }
  }
}

// ============================================
// 2. enrichFromCnpj - Orquestra BrasilAPI + CVM
// ============================================

export async function enrichFromCnpjAction(
  orgId: string,
  cnpj: string
): Promise<ActionResult<EnrichedCnpjData>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Validate CNPJ format
    const cleanedCnpj = cleanCnpj(cnpj)
    if (!isValidCnpjFormat(cleanedCnpj)) {
      return { success: false, error: 'CNPJ inválido' }
    }

    // Verify user has access to org
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, profile_type, onboarding_step')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    // Check if CNPJ already exists in another organization
    const { data: existingCnpjOrg } = await adminSupabase
      .from('organizations')
      .select('id, name, created_by')
      .eq('cnpj', cleanedCnpj)
      .neq('id', orgId)
      .is('deleted_at', null)
      .single()

    if (existingCnpjOrg) {
      // If same user owns the existing org, suggest resuming
      if (existingCnpjOrg.created_by === user.id) {
        return {
          success: false,
          error: `Este CNPJ já está vinculado à organização "${existingCnpjOrg.name}". Volte ao início e selecione "Continuar cadastro existente".`
        }
      }
      // Different user owns the CNPJ
      return {
        success: false,
        error: 'Este CNPJ já está cadastrado na plataforma por outro usuário.'
      }
    }

    // Fetch data from BrasilAPI and CVM in parallel
    const [cnpjResult, cvmResult] = await Promise.all([
      fetchCnpjData(cleanedCnpj),
      checkCvmRegistration(cleanedCnpj),
    ])

    if (cnpjResult.status !== 'success' || !cnpjResult.data) {
      return { 
        success: false, 
        error: cnpjResult.error || 'CNPJ não encontrado na Receita Federal' 
      }
    }

    const companyData = cnpjResult.data

    // Prepare enriched data
    const enrichedData: EnrichedCnpjData = {
      razaoSocial: companyData.razaoSocial,
      nomeFantasia: companyData.nomeFantasia,
      cnpj: companyData.cnpj,
      cnaeCode: companyData.cnaeCode,
      cnaeDescription: companyData.cnaeDescription,
      naturezaJuridica: companyData.naturezaJuridica,
      capitalSocial: companyData.capitalSocial,
      porte: companyData.porte,
      situacaoCadastral: companyData.situacaoCadastral,
      dataInicioAtividade: companyData.dataInicioAtividade,
      address: companyData.address,
      telefone: companyData.telefone,
      email: companyData.email,
      shareholders: companyData.shareholders,
      confidence: 'high',
      fetchedAt: new Date().toISOString(),
    }

    // Add CVM data if available
    if (cvmResult.status === 'success' && cvmResult.data) {
      enrichedData.cvm = {
        isRegistered: cvmResult.data.isRegistered,
        participantType: cvmResult.data.participantType,
        participantName: cvmResult.data.participantName,
      }
    }

    const profileType = org.profile_type as OrganizationProfile
    const nextStep = getNextStep('cnpj_input', profileType) ?? 'data_enrichment'

    // Update organization with enriched data
    const updateData = {
      name: companyData.nomeFantasia || companyData.razaoSocial,
      cnpj: companyData.cnpj,
      cnae_code: companyData.cnaeCode,
      cnae_description: companyData.cnaeDescription,
      legal_nature: companyData.naturezaJuridica,
      capital_social: companyData.capitalSocial,
      founding_date: companyData.dataInicioAtividade,
      phone: companyData.telefone,
      address_full: companyData.address as unknown as Json,
      shareholders: companyData.shareholders as unknown as Json,
      onboarding_step: nextStep,
      onboarding_data: {
        brasil_api: {
          raw_response: cnpjResult.data,
          fetched_at: new Date().toISOString(),
        },
        cvm: cvmResult.data ? {
          is_registered: cvmResult.data.isRegistered,
          participant_type: cvmResult.data.participantType,
          checked_at: new Date().toISOString(),
        } : undefined,
        flow: {
          last_step_at: new Date().toISOString(),
          steps_completed: ['profile_selection', 'cnpj_input'],
        },
      } as unknown as Json,
    }

    // Also update slug based on company name
    const newSlug = await generateUniqueSlug(companyData.nomeFantasia || companyData.razaoSocial)
    
    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update({ ...updateData, slug: newSlug })
      .eq('id', orgId)

    if (updateError) {
      console.error('Error updating organization:', updateError)
      // Handle duplicate CNPJ constraint violation (fallback)
      if (updateError.code === '23505') {
        return { 
          success: false, 
          error: 'Este CNPJ já está cadastrado na plataforma. Se você já iniciou um cadastro anteriormente, volte ao início e selecione "Continuar cadastro".' 
        }
      }
      return { success: false, error: 'Erro ao salvar dados da empresa' }
    }

    // Log audit event
    await logOnboardingAuditEvent('onboarding.cnpj_enriched', user.id, orgId, {
      cnpj: companyData.cnpj,
      razao_social: companyData.razaoSocial,
      cvm_registered: cvmResult.data?.isRegistered || false,
    })

    return { success: true, data: enrichedData }
  } catch (error) {
    console.error('Unexpected error in enrichFromCnpj:', error)
    return { success: false, error: 'Erro inesperado ao buscar dados do CNPJ' }
  }
}

// ============================================
// 3. enrichFromWebsite - Orquestra Jina + Clearbit
// ============================================

export async function enrichFromWebsiteAction(
  orgId: string,
  url: string
): Promise<ActionResult<EnrichedWebsiteDataResult>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Validate URL
    if (!isValidUrl(url)) {
      return { success: false, error: 'URL inválida' }
    }

    const normalizedUrl = normalizeUrl(url)
    const domain = extractDomain(normalizedUrl)

    // Verify user has access to org
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, onboarding_data')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    // Fetch website content and logo in parallel
    const [websiteResult, logoResult] = await Promise.all([
      scrapeWebsite(normalizedUrl),
      fetchLogo(normalizedUrl),
    ])

    // Prepare result
    const enrichedData: EnrichedWebsiteDataResult = {
      url: normalizedUrl,
      title: websiteResult.status === 'success' ? websiteResult.data?.title || null : null,
      description: websiteResult.status === 'success' ? websiteResult.data?.extractedDescription || null : null,
      logoUrl: logoResult.status === 'success' && logoResult.data?.exists ? logoResult.data.logoUrl : null,
      logoExists: logoResult.status === 'success' && logoResult.data?.exists || false,
      confidence: websiteResult.status === 'success' ? 'high' : 'low',
      fetchedAt: new Date().toISOString(),
    }

    // Update organization with website data
    const existingData = (org.onboarding_data as OnboardingData) || {}
    const updateData = {
      website: normalizedUrl,
      logo_url: enrichedData.logoUrl,
      onboarding_data: {
        ...existingData,
        jina_reader: websiteResult.status === 'success' ? {
          markdown_content: websiteResult.data?.markdownContent?.slice(0, 10000), // Limit size
          fetched_at: new Date().toISOString(),
        } : undefined,
        clearbit: {
          logo_url: enrichedData.logoUrl,
          fetched_at: new Date().toISOString(),
        },
        flow: {
          ...existingData.flow,
          last_step_at: new Date().toISOString(),
        },
      } as unknown as Json,
    }

    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update(updateData as Database['public']['Tables']['organizations']['Update'])
      .eq('id', orgId)

    if (updateError) {
      console.error('Error updating organization:', updateError)
      // Don't fail - website enrichment is optional
    }

    // Log audit event
    await logOnboardingAuditEvent('onboarding.website_scraped', user.id, orgId, {
      url: normalizedUrl,
      domain,
      logo_found: enrichedData.logoExists,
    })

    return { success: true, data: enrichedData }
  } catch (error) {
    console.error('Unexpected error in enrichFromWebsite:', error)
    return { success: false, error: 'Erro inesperado ao buscar dados do website' }
  }
}

// ============================================
// 4. generateDescription - Chama OpenAI
// ============================================

export async function generateDescriptionAction(
  orgId: string
): Promise<ActionResult<GeneratedDescriptionResult>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get organization data
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, name, cnae_description, onboarding_data')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    const onboardingData = (org.onboarding_data as OnboardingData) || {}
    
    // Prepare context for AI
    const context = {
      razaoSocial: org.name,
      cnaeDescription: org.cnae_description || '',
      websiteContent: onboardingData.jina_reader?.markdown_content
        ? prepareContentForAI(onboardingData.jina_reader.markdown_content)
        : null,
    }

    // Generate description
    let descriptionResult = await generateAIDescription(context)
    
    // Fallback if OpenAI fails
    if (descriptionResult.status !== 'success' || !descriptionResult.data) {
      const fallbackText = generateFallbackDescription(context)
      descriptionResult = {
        status: 'success',
        data: {
          text: fallbackText,
          model: 'fallback',
          tokensUsed: 0,
          generatedAt: new Date().toISOString(),
          source: 'openai' as const,
          confidence: 'low' as const,
        },
        duration: 0,
      }
    }

    const result: GeneratedDescriptionResult = {
      description: descriptionResult.data!.text,
      confidence: descriptionResult.data!.confidence,
      model: descriptionResult.data!.model,
      generatedAt: descriptionResult.data!.generatedAt,
    }

    // Update organization with description
    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update({
        description: result.description,
        onboarding_data: {
          ...onboardingData,
          ai_description: {
            text: result.description,
            model: result.model,
            generated_at: result.generatedAt,
          },
          flow: {
            ...onboardingData.flow,
            last_step_at: new Date().toISOString(),
          },
        } as unknown as Json,
      })
      .eq('id', orgId)

    if (updateError) {
      console.error('Error updating organization:', updateError)
    }

    // Log audit event
    await logOnboardingAuditEvent('onboarding.description_generated', user.id, orgId, {
      model: result.model,
      confidence: result.confidence,
      length: result.description.length,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error in generateDescription:', error)
    return { success: false, error: 'Erro inesperado ao gerar descrição' }
  }
}

// ============================================
// 5. saveProfileDetails - Salva dados específicos do perfil
// ============================================

export async function saveProfileDetails(
  orgId: string,
  data: ProfileDetailsInput
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Verify user has access to org
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, profile_type, onboarding_data')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    // Validate profile type matches
    if (data.profileType !== org.profile_type) {
      return { success: false, error: 'Tipo de perfil não corresponde' }
    }

    const onboardingData = (org.onboarding_data as OnboardingData) || {}

    // Update organization with profile details
    const updateData: Record<string, unknown> = {
      onboarding_step: 'eligibility_check' as OnboardingStep,
      onboarding_data: {
        ...onboardingData,
        profile_details: data,
        flow: {
          ...onboardingData.flow,
          last_step_at: new Date().toISOString(),
          steps_completed: [
            ...(onboardingData.flow?.steps_completed || []),
            'profile_details',
          ],
        },
      } as unknown as Json,
    }

    // Add common fields
    if (data.description) updateData.description = data.description
    if (data.website) updateData.website = data.website
    if (data.phone) updateData.phone = data.phone

    // Add settings based on profile type
    const settings: Record<string, unknown> = {}

    // Common settings for all profiles (TASK-008: LinkedIn)
    if (data.linkedinUrl) {
      settings.linkedin_url = data.linkedinUrl
    }

    if (data.profileType === 'investor') {
      settings.investor_type = data.investorType
      settings.ticket_min = data.ticketMin
      settings.ticket_max = data.ticketMax
      settings.sectors_of_interest = data.sectorsOfInterest
      settings.geography_focus = data.geographyFocus
      if (data.investmentStage) settings.investment_stage = data.investmentStage
    } else if (data.profileType === 'asset') {
      settings.sector = data.sector
      settings.revenue_annual_usd = data.revenueAnnualUsd
      settings.objective = data.objective
      if (data.stage) settings.stage = data.stage
      // TASK-025: EBITDA field for Asset profile
      if (data.ebitdaAnnualUsd) settings.ebitda_annual_usd = data.ebitdaAnnualUsd
    } else if (data.profileType === 'advisor') {
      settings.advisor_type = data.advisorType
      settings.sector_specialization = data.sectorSpecialization
      settings.preferred_side = data.preferredSide
      if (data.cvmRegistry) settings.cvm_registry = data.cvmRegistry
    }

    updateData.settings = settings as Json

    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update(updateData as Database['public']['Tables']['organizations']['Update'])
      .eq('id', orgId)

    if (updateError) {
      console.error('Error updating organization:', updateError)
      return { success: false, error: 'Erro ao salvar detalhes do perfil' }
    }

    // Log audit event
    await logOnboardingAuditEvent('onboarding.step_completed', user.id, orgId, {
      step: 'profile_details',
      profile_type: data.profileType,
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in saveProfileDetails:', error)
    return { success: false, error: 'Erro inesperado ao salvar detalhes do perfil' }
  }
}

// ============================================
// 6. submitEligibility - Valida gate de elegibilidade
// ============================================

export async function submitEligibility(
  orgId: string,
  data: EligibilityInput
): Promise<ActionResult<EligibilityResult>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Verify user has access to org
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, slug, profile_type, onboarding_data')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    const profileType = org.profile_type as OrganizationProfile
    const onboardingData = (org.onboarding_data as OnboardingData) || {}

    // Investor flow (MVP): etapa 2 finaliza onboarding e envia para tese.
    if (profileType === 'investor') {
      const eligibilityData = {
        dealsLast3Years: data.dealsLast3Years,
        totalDealValueUsd: data.totalDealValueUsd,
        yearsExperience: data.yearsExperience,
        submittedAt: new Date().toISOString(),
        result: {
          eligible: true,
          score: 100,
        },
      }

      const result: EligibilityResult = {
        eligible: true,
        score: 100,
        reasons: [],
        requirements: {
          met: ['Dados financeiros essenciais informados'],
          notMet: [],
        },
        nextStep: 'completed',
        redirectPath: `/${org.slug}/thesis`,
      }

      const { error: updateError } = await adminSupabase
        .from('organizations')
        .update({
          onboarding_data: {
            ...onboardingData,
            eligibilityData,
            investor_financial_essentials: {
              deals_last_3_years: data.dealsLast3Years,
              total_deal_value_usd: data.totalDealValueUsd,
              years_experience: data.yearsExperience,
              submitted_at: new Date().toISOString(),
            },
            eligibility: {
              deals_last_3_years: data.dealsLast3Years,
              total_deal_value_usd: data.totalDealValueUsd,
              years_experience: data.yearsExperience,
              submitted_at: new Date().toISOString(),
              result: {
                eligible: true,
                score: 100,
              },
            },
            flow: {
              ...onboardingData.flow,
              last_step_at: new Date().toISOString(),
              steps_completed: [
                ...(onboardingData.flow?.steps_completed || []),
                'eligibility_check',
              ],
            },
          } as unknown as Json,
        })
        .eq('id', orgId)

      if (updateError) {
        console.error('Error updating investor essentials:', updateError)
        return { success: false, error: 'Erro ao salvar dados financeiros do investidor' }
      }

      const completionResult = await completeOnboarding(orgId)
      if (!completionResult.success) {
        return { success: false, error: completionResult.error || 'Erro ao finalizar onboarding' }
      }

      await logOnboardingAuditEvent('onboarding.eligibility_submitted', user.id, orgId, {
        eligible: true,
        score: 100,
        profile_type: profileType,
        deals: data.dealsLast3Years,
        deal_value: data.totalDealValueUsd,
        flow_variant: 'investor_two_steps',
      })

      return { success: true, data: result }
    }

    // Get eligibility criteria for profile type
    const criteria = {
      investor: {
        minDeals: 1,
        minDealValue: 100000,
        minYearsExperience: 2,
      },
      advisor: {
        minDeals: 3,
        minDealValue: 500000,
        minYearsExperience: 3,
      },
      asset: {
        minDeals: 0,
        minDealValue: 0,
        minYearsExperience: 0,
      },
    }[profileType]

    // Evaluate eligibility
    const met: string[] = []
    const notMet: string[] = []
    const reasons: string[] = []
    let score = 0

    // Assets are always eligible
    if (profileType === 'asset') {
      score = 100
      met.push('Empresas/Ativos não requerem gate de elegibilidade')
    } else {
      // Check deals
      if (data.dealsLast3Years !== undefined) {
        if (data.dealsLast3Years >= criteria.minDeals) {
          met.push(`Mínimo de ${criteria.minDeals} deal(s) nos últimos 3 anos`)
          score += 30
        } else {
          notMet.push(`Mínimo de ${criteria.minDeals} deal(s) nos últimos 3 anos`)
          reasons.push(`Você informou ${data.dealsLast3Years} deal(s), mas o mínimo é ${criteria.minDeals}`)
        }
      }

      // Check deal value
      if (data.totalDealValueUsd !== undefined) {
        if (data.totalDealValueUsd >= criteria.minDealValue) {
          met.push(`Valor total de deals >= USD ${criteria.minDealValue.toLocaleString()}`)
          score += 40
        } else {
          notMet.push(`Valor total de deals >= USD ${criteria.minDealValue.toLocaleString()}`)
          reasons.push(`Você informou USD ${data.totalDealValueUsd.toLocaleString()}, mas o mínimo é USD ${criteria.minDealValue.toLocaleString()}`)
        }
      }

      // Check experience
      if (data.yearsExperience !== undefined) {
        if (data.yearsExperience >= criteria.minYearsExperience) {
          met.push(`Mínimo de ${criteria.minYearsExperience} anos de experiência`)
          score += 30
        } else {
          notMet.push(`Mínimo de ${criteria.minYearsExperience} anos de experiência`)
          reasons.push(`Você informou ${data.yearsExperience} anos, mas o mínimo é ${criteria.minYearsExperience}`)
        }
      }
    }

    const eligible = notMet.length === 0
    const nextStep: OnboardingStep = eligible ? 'terms_acceptance' : 'pending_review'

    const result: EligibilityResult = {
      eligible,
      score,
      reasons,
      requirements: { met, notMet },
      nextStep,
    }

    const eligibilityData = {
      dealsLast3Years: data.dealsLast3Years,
      totalDealValueUsd: data.totalDealValueUsd,
      yearsExperience: data.yearsExperience,
      submittedAt: new Date().toISOString(),
      result,
    }

    // Update organization
    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update({
        onboarding_step: nextStep,
        verification_status: eligible ? 'pending' : 'pending',
        onboarding_data: {
          ...onboardingData,
          eligibilityData,
          eligibility: {
            deals_last_3_years: data.dealsLast3Years,
            total_deal_value_usd: data.totalDealValueUsd,
            years_experience: data.yearsExperience,
            submitted_at: new Date().toISOString(),
            result: result,
          },
          flow: {
            ...onboardingData.flow,
            last_step_at: new Date().toISOString(),
            steps_completed: [
              ...(onboardingData.flow?.steps_completed || []),
              'eligibility_check',
            ],
          },
        } as unknown as Json,
      })
      .eq('id', orgId)

    if (updateError) {
      console.error('Error updating organization:', updateError)
      return { success: false, error: 'Erro ao salvar elegibilidade' }
    }

    // Log audit event
    await logOnboardingAuditEvent('onboarding.eligibility_submitted', user.id, orgId, {
      eligible,
      score,
      profile_type: profileType,
      deals: data.dealsLast3Years,
      deal_value: data.totalDealValueUsd,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error in submitEligibility:', error)
    return { success: false, error: 'Erro inesperado ao verificar elegibilidade' }
  }
}

// ============================================
// 7. completeOnboarding - Finaliza e muda status
// ============================================

export async function completeOnboarding(
  orgId: string
): Promise<ActionResult<Organization>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Verify user has access to org
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    // Validate org is ready to complete
    const currentStep = org.onboarding_step
    const validSteps: OnboardingStep[] = ['mfa_setup', 'terms_acceptance', 'pending_review']
    const isInvestorFastTrack =
      org.profile_type === 'investor' && currentStep === 'eligibility_check'
    
    if (!currentStep || (!validSteps.includes(currentStep) && !isInvestorFastTrack)) {
      return { 
        success: false, 
        error: 'Onboarding não pode ser finalizado neste momento' 
      }
    }

    const onboardingData = (org.onboarding_data as OnboardingData) || {}

    const seedResult = await ensureAssetProjectSeed({
      id: org.id,
      name: org.name,
      created_by: org.created_by,
      profile_type: org.profile_type,
      onboarding_data: org.onboarding_data,
    })
    if (!seedResult.success) {
      return { success: false, error: seedResult.error || 'Erro ao concluir preparação do ativo' }
    }

    // Update organization to completed
    const { data: updatedOrg, error: updateError } = await adminSupabase
      .from('organizations')
      .update({
        onboarding_step: 'completed' as OnboardingStep,
        onboarding_completed_at: new Date().toISOString(),
        verification_status: 'verified' as const,
        onboarding_data: {
          ...onboardingData,
          flow: {
            ...onboardingData.flow,
            completed_at: new Date().toISOString(),
            steps_completed: [
              ...(onboardingData.flow?.steps_completed || []),
              'completed',
            ],
          },
        } as unknown as Json,
      })
      .eq('id', orgId)
      .select()
      .single()

    if (updateError || !updatedOrg) {
      console.error('Error completing onboarding:', updateError)
      return { success: false, error: 'Erro ao finalizar onboarding' }
    }

    // Update member verification status
    await adminSupabase
      .from('organization_members')
      .update({ verification_status: 'completed' as const })
      .eq('organization_id', orgId)
      .eq('user_id', user.id)

    // Log audit event
    await logOnboardingAuditEvent('onboarding.completed', user.id, orgId, {
      profile_type: org.profile_type,
      duration_ms: onboardingData.flow?.started_at
        ? Date.now() - new Date(onboardingData.flow.started_at).getTime()
        : null,
    })

    // Revalidate cached pages to ensure fresh data after onboarding completion
    revalidatePath('/dashboard')
    revalidatePath('/onboarding')
    if (org.slug) {
      revalidatePath(`/${org.slug}/mrs`)
      revalidatePath(`/${org.slug}/projeto`)
      revalidatePath(`/${org.slug}/projects`)
    }

    return { success: true, data: updatedOrg }
  } catch (error) {
    console.error('Unexpected error in completeOnboarding:', error)
    return { success: false, error: 'Erro inesperado ao finalizar onboarding' }
  }
}

// ============================================
// 8. getOnboardingProgress - Retorna estado atual
// ============================================

export async function getOnboardingProgress(
  orgId: string
): Promise<ActionResult<OnboardingProgressResult>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get organization
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    const onboardingData = (org.onboarding_data as OnboardingData) || {}
    const currentStep = org.onboarding_step || 'profile_selection'
    const profileType = org.profile_type as OrganizationProfile

    // Calculate steps completed
    const stepsCompleted = onboardingData.flow?.steps_completed || []
    
    // Calculate progress percentage
    const stepOrder: OnboardingStep[] = [
      'profile_selection',
      'cnpj_input',
      'data_enrichment',
      'data_confirmation',
      'asset_company_data',
      'asset_matching_data',
      'asset_team',
      'asset_codename',
      'profile_details',
      'eligibility_check',
      'terms_acceptance',
      'mfa_setup',
      'pending_review',
      'completed',
    ]
    
    // Skip eligibility_check for assets
    const applicableSteps = profileType === 'asset'
      ? stepOrder.filter(s => !['profile_details', 'eligibility_check'].includes(s))
      : stepOrder
    
    const currentIndex = applicableSteps.indexOf(currentStep)
    const percentComplete = currentIndex >= 0
      ? Math.round((currentIndex / (applicableSteps.length - 1)) * 100)
      : 0

    // Check enrichment status
    const enrichmentStatus = {
      cnpj: !!org.cnpj,
      website: !!org.website,
      description: !!org.description,
      cvm: !!onboardingData.cvm?.checked_at,
    }

    // Determine missing fields
    const missingFields: string[] = []
    if (!org.name || org.name.startsWith('Nova Organização')) missingFields.push('name')
    if (!org.cnpj) missingFields.push('cnpj')
    if (!org.cnae_code) missingFields.push('cnae_code')
    if (!org.website) missingFields.push('website')

    // Determine if can proceed
    const canProceed = missingFields.length === 0 || currentStep === 'profile_selection'

    const result: OnboardingProgressResult = {
      currentStep: currentStep as OnboardingStep,
      stepsCompleted: stepsCompleted as OnboardingStep[],
      percentComplete,
      startedAt: org.onboarding_started_at ?? undefined,
      completedAt: org.onboarding_completed_at ?? undefined,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        profileType: org.profile_type,
      },
      enrichmentStatus,
      canProceed,
      missingFields,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error in getOnboardingProgress:', error)
    return { success: false, error: 'Erro inesperado ao buscar progresso' }
  }
}

// ============================================
// 9. confirmData - Confirma dados enriquecidos
// ============================================

export async function confirmOnboardingData(
  orgId: string,
  confirmedData: {
    name?: string
    description?: string
    website: string
    phone?: string
    /** URL do LinkedIn da organização (TASK-008) */
    linkedinUrl?: string
    /** Quadro societário editado pelo usuário (TASK-022/023) */
    shareholders?: Array<{
      nome: string
      cpfCnpj: string
      qualificacao: string
      percentualParticipacao?: number
      dataEntrada?: string
    }>
  }
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Verify user has access to org
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, onboarding_data, slug, settings, profile_type')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    const onboardingData = (org.onboarding_data as OnboardingData) || {}

    const trimmedWebsite = confirmedData.website?.trim()
    if (!trimmedWebsite) {
      return { success: false, error: 'Website é obrigatório' }
    }
    if (!isValidUrl(trimmedWebsite)) {
      return { success: false, error: 'Website inválido' }
    }
    const normalizedWebsite = normalizeUrl(trimmedWebsite)

    const nextStep: OnboardingStep =
      org.profile_type === 'asset' ? 'asset_company_data' : 'profile_details'

    // Prepare update
    const updateData: Record<string, unknown> = {
      onboarding_step: nextStep,
      onboarding_data: {
        ...onboardingData,
        flow: {
          ...onboardingData.flow,
          last_step_at: new Date().toISOString(),
          steps_completed: [
            ...(onboardingData.flow?.steps_completed || []),
            'data_enrichment',
            'data_confirmation',
          ],
        },
      } as unknown as Json,
    }

    if (confirmedData.name) {
      updateData.name = confirmedData.name
      // Update slug if name changed
      const newSlug = await generateUniqueSlug(confirmedData.name)
      if (newSlug !== org.slug) {
        updateData.slug = newSlug
      }
    }
    if (confirmedData.description) updateData.description = confirmedData.description
    updateData.website = normalizedWebsite
    if (confirmedData.phone) updateData.phone = confirmedData.phone

    // TASK-022/023: Save edited shareholders
    if (confirmedData.shareholders && confirmedData.shareholders.length > 0) {
      // Transform to database format (snake_case)
      updateData.shareholders = confirmedData.shareholders.map((s) => ({
        nome: s.nome,
        cpf_cnpj: s.cpfCnpj,
        qualificacao: s.qualificacao,
        percentual_participacao: s.percentualParticipacao ?? null,
        data_entrada: s.dataEntrada ?? null,
      })) as unknown as Json
    }

    // TASK-008: Save LinkedIn URL in settings
    if (confirmedData.linkedinUrl) {
      // Merge with existing settings
      const existingSettings = (org as { settings?: Record<string, unknown> }).settings || {}
      updateData.settings = {
        ...existingSettings,
        linkedin_url: confirmedData.linkedinUrl,
      } as unknown as Json
    }

    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update(updateData as Database['public']['Tables']['organizations']['Update'])
      .eq('id', orgId)

    if (updateError) {
      console.error('Error updating organization:', updateError)
      return { success: false, error: 'Erro ao confirmar dados' }
    }

    // Log audit event
    await logOnboardingAuditEvent('onboarding.step_completed', user.id, orgId, {
      step: 'data_confirmation',
      confirmed_fields: Object.keys(confirmedData),
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in confirmOnboardingData:', error)
    return { success: false, error: 'Erro inesperado ao confirmar dados' }
  }
}

// ============================================
// 10.1 autoSaveOnboardingField - Salva campo isolado
// ============================================

export async function autoSaveOnboardingField(
  orgId: string,
  field: string,
  value: unknown
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, onboarding_data')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    const onboardingData = (org.onboarding_data as OnboardingData) || {}
    const legacyAliasesByField: Record<string, string[]> = {
      assetCompanyData: ['asset_company_data'],
      assetMatchingData: ['asset_matching_data'],
      assetTeamData: ['asset_team_data'],
      assetCodenameData: ['asset_codename_data'],
      profileDetails: ['profile_details'],
      eligibilityData: ['eligibility'],
    }
    const legacyAliases = legacyAliasesByField[field] || []
    const aliasPayload = Object.fromEntries(
      legacyAliases.map((legacyField) => [legacyField, value as Json])
    )

    const nextData = {
      ...onboardingData,
      [field]: value as Json,
      ...aliasPayload,
      flow: {
        ...onboardingData.flow,
        last_step_at: new Date().toISOString(),
      },
    } as unknown as Json

    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update({ onboarding_data: nextData })
      .eq('id', orgId)

    if (updateError) {
      return { success: false, error: 'Erro ao salvar campo' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in autoSaveOnboardingField:', error)
    return { success: false, error: 'Erro inesperado no auto-save' }
  }
}

export async function autoSaveOnboardingFields(
  orgId: string,
  payload: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const MAX_AUTOSAVE_PAYLOAD_SIZE_BYTES = 100_000
    const isPlainObject = (value: unknown): value is Record<string, unknown> =>
      Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    const mergeObjects = (
      base: Record<string, unknown>,
      incoming: Record<string, unknown>
    ): Record<string, unknown> => {
      const merged: Record<string, unknown> = { ...base }
      for (const [key, value] of Object.entries(incoming)) {
        if (isPlainObject(value) && isPlainObject(merged[key])) {
          merged[key] = mergeObjects(merged[key] as Record<string, unknown>, value)
        } else {
          merged[key] = value
        }
      }
      return merged
    }

    if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
      return { success: false, error: 'Payload inválido para auto-save' }
    }

    const payloadString = JSON.stringify(payload)
    if (!payloadString) {
      return { success: false, error: 'Payload inválido para auto-save' }
    }

    if (payloadString.length > MAX_AUTOSAVE_PAYLOAD_SIZE_BYTES) {
      return { success: false, error: 'Payload excede limite de auto-save' }
    }

    const normalizedPayload = JSON.parse(payloadString) as Record<string, unknown>
    const hasUnsafeKey = Object.keys(normalizedPayload).some(
      (key) => key.startsWith('__') || key === 'constructor' || key === 'prototype'
    )
    if (hasUnsafeKey) {
      return { success: false, error: 'Payload contém chaves inválidas' }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, onboarding_data')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    const onboardingData = (org.onboarding_data as OnboardingData) || {}
    const safeOnboardingData =
      onboardingData && typeof onboardingData === 'object' && !Array.isArray(onboardingData)
        ? (onboardingData as Record<string, unknown>)
        : {}
    const nextData = {
      ...mergeObjects(safeOnboardingData, normalizedPayload),
      flow: {
        ...(safeOnboardingData.flow as Record<string, unknown> | undefined),
        last_step_at: new Date().toISOString(),
      },
    } as unknown as Json

    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update({ onboarding_data: nextData })
      .eq('id', orgId)

    if (updateError) {
      return { success: false, error: 'Erro ao salvar rascunho do onboarding' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in autoSaveOnboardingFields:', error)
    return { success: false, error: 'Erro inesperado no auto-save de campos' }
  }
}

async function persistAssetStepProgress(
  orgId: string,
  completedStep: OnboardingStep,
  nextStep: OnboardingStep
): Promise<ActionResult> {
  const adminSupabase = await createAdminClient()
  const { data: org, error: orgError } = await adminSupabase
    .from('organizations')
    .select('id, onboarding_data')
    .eq('id', orgId)
    .single()

  if (orgError || !org) {
    return { success: false, error: 'Organização não encontrada' }
  }

  const onboardingData = (org.onboarding_data as OnboardingData) || {}
  const flowSteps = onboardingData.flow?.steps_completed || []
  const normalizedSteps = flowSteps.includes(completedStep)
    ? flowSteps
    : [...flowSteps, completedStep]

  const { error: updateError } = await adminSupabase
    .from('organizations')
    .update({
      onboarding_step: nextStep,
      onboarding_data: {
        ...onboardingData,
        flow: {
          ...onboardingData.flow,
          last_step_at: new Date().toISOString(),
          steps_completed: normalizedSteps,
        },
      } as unknown as Json,
    })
    .eq('id', orgId)

  if (updateError) {
    return { success: false, error: 'Erro ao avançar etapa do onboarding' }
  }

  return { success: true }
}

// ============================================
// 10.2 saveAssetCompanyData - Passo 1 Ativo
// ============================================

export async function saveAssetCompanyData(
  orgId: string,
  data: AssetCompanyData
): Promise<ActionResult> {
  if (!data.companyDescription?.trim()) {
    return { success: false, error: 'Descrição da empresa é obrigatória' }
  }
  if (!data.projectObjective?.type || !data.projectObjective?.subReason) {
    return { success: false, error: 'Objetivo do projeto é obrigatório' }
  }
  if (!data.businessModel?.length || !data.sectors?.length) {
    return { success: false, error: 'Modelo de negócio e setor são obrigatórios' }
  }

  const saveResult = await autoSaveOnboardingField(orgId, 'assetCompanyData', data)
  if (!saveResult.success) {
    return saveResult
  }

  return persistAssetStepProgress(orgId, 'asset_company_data', 'asset_matching_data')
}

// ============================================
// 10.3 saveAssetMatchingData - Passo 2 Ativo
// ============================================

export async function saveAssetMatchingData(
  orgId: string,
  data: AssetMatchingData
): Promise<ActionResult> {
  if (!data.rob12Months || data.ebitdaPercent === undefined || !data.employeeCount || !data.foundingYear) {
    return { success: false, error: 'Campos obrigatórios de matching não preenchidos' }
  }
  if (!data.headquarters?.city || !data.headquarters?.state || !data.headquarters?.country) {
    return { success: false, error: 'Sede é obrigatória' }
  }

  const saveResult = await autoSaveOnboardingField(orgId, 'assetMatchingData', data)
  if (!saveResult.success) {
    return saveResult
  }

  return persistAssetStepProgress(orgId, 'asset_matching_data', 'asset_team')
}

// ============================================
// 10.4 saveAssetTeamData - Passo 3 Ativo
// ============================================

export async function saveAssetTeamData(
  orgId: string,
  data: AssetTeamData
): Promise<ActionResult> {
  const hasValidShareholder = data.shareholders?.some(
    (shareholder) => shareholder.name?.trim() && shareholder.email?.trim()
  )
  if (!hasValidShareholder) {
    return { success: false, error: 'Ao menos um sócio com nome e email é obrigatório' }
  }

  const saveResult = await autoSaveOnboardingField(orgId, 'assetTeamData', data)
  if (!saveResult.success) {
    return saveResult
  }

  return persistAssetStepProgress(orgId, 'asset_team', 'asset_codename')
}

// ============================================
// 10.5 saveAssetCodename - Passo 4 Ativo
// ============================================

export async function saveAssetCodename(
  orgId: string,
  data: AssetCodenameData
): Promise<ActionResult> {
  if (!data.codename?.trim()) {
    return { success: false, error: 'Codinome é obrigatório' }
  }

  const saveResult = await autoSaveOnboardingField(orgId, 'assetCodenameData', data)
  if (!saveResult.success) {
    return saveResult
  }

  return persistAssetStepProgress(orgId, 'asset_codename', 'terms_acceptance')
}

// ============================================
// 11. acceptTerms - Aceita termos de uso
// ============================================

export async function acceptTerms(
  orgId: string,
  acceptedTerms: {
    termsOfService: boolean
    privacyPolicy: boolean
    dataProcessing: boolean
  }
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Validate all terms accepted
    if (!acceptedTerms.termsOfService || !acceptedTerms.privacyPolicy || !acceptedTerms.dataProcessing) {
      return { success: false, error: 'Todos os termos devem ser aceitos' }
    }

    // Verify user has access to org
    const adminSupabase = await createAdminClient()
    const { data: org, error: orgError } = await adminSupabase
      .from('organizations')
      .select('id, onboarding_data')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return { success: false, error: 'Organização não encontrada' }
    }

    const onboardingData = (org.onboarding_data as OnboardingData) || {}

    // Update organization
    const { error: updateError } = await adminSupabase
      .from('organizations')
      .update({
        onboarding_step: 'mfa_setup' as OnboardingStep,
        onboarding_data: {
          ...onboardingData,
          terms_acceptance: {
            terms_of_service: acceptedTerms.termsOfService,
            privacy_policy: acceptedTerms.privacyPolicy,
            data_processing: acceptedTerms.dataProcessing,
            accepted_at: new Date().toISOString(),
            accepted_by: user.id,
          },
          flow: {
            ...onboardingData.flow,
            last_step_at: new Date().toISOString(),
            steps_completed: [
              ...(onboardingData.flow?.steps_completed || []),
              'terms_acceptance',
            ],
          },
        } as unknown as Json,
      })
      .eq('id', orgId)

    if (updateError) {
      console.error('Error updating organization:', updateError)
      return { success: false, error: 'Erro ao aceitar termos' }
    }

    // Log audit event
    await logOnboardingAuditEvent('onboarding.step_completed', user.id, orgId, {
      step: 'terms_acceptance',
      terms_accepted: acceptedTerms,
    })

    return { success: true }
  } catch (error) {
    console.error('Unexpected error in acceptTerms:', error)
    return { success: false, error: 'Erro inesperado ao aceitar termos' }
  }
}
