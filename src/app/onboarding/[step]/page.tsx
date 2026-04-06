/**
 * Onboarding Step Page
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Dynamic page that renders the OnboardingWizard at the specified step.
 */

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/onboarding'
import type { OnboardingStep, OrganizationProfile, OnboardingData } from '@/types/database'
import type {
  EnrichedCnpjData,
  EnrichedWebsiteDataResult,
  GeneratedDescriptionResult,
  ProfileDetailsInput,
} from '@/types/onboarding'
import { STEP_ORDER, SKIPPABLE_STEPS, getNextStep } from '@/types/onboarding'
import { hydrateAssetStepFormData } from '@/lib/onboarding/asset-step-hydration'

// Map URL slugs to step IDs
const STEP_SLUG_MAP: Record<string, OnboardingStep> = {
  'profile-selection': 'profile_selection',
  'cnpj-input': 'cnpj_input',
  'data-enrichment': 'data_enrichment',
  'data-confirmation': 'data_confirmation',
  'asset-company-data': 'asset_company_data',
  'asset-matching-data': 'asset_matching_data',
  'asset-team': 'asset_team',
  'asset-codename': 'asset_codename',
  'profile-details': 'profile_details',
  'eligibility-check': 'eligibility_check',
  'terms-acceptance': 'terms_acceptance',
  'mfa-setup': 'mfa_setup',
  'pending-review': 'pending_review',
  'completed': 'completed',
}

interface OnboardingStepPageProps {
  params: Promise<{ step: string }>
}

// Helper to reconstruct enriched data from onboarding_data
function reconstructEnrichedData(org: {
  name: string
  cnpj: string | null
  cnae_code: string | null
  cnae_description: string | null
  legal_nature: string | null
  capital_social: number | null
  founding_date: string | null
  phone: string | null
  website: string | null
  logo_url: string | null
  description: string | null
  address_full: Record<string, unknown> | null
  shareholders: Array<Record<string, unknown>> | null
  onboarding_data: OnboardingData | null
}): {
  cnpj?: EnrichedCnpjData
  website?: EnrichedWebsiteDataResult
  description?: GeneratedDescriptionResult
} {
  const result: {
    cnpj?: EnrichedCnpjData
    website?: EnrichedWebsiteDataResult
    description?: GeneratedDescriptionResult
  } = {}

  // Reconstruct CNPJ data if available
  if (org.cnpj) {
    const address = org.address_full as {
      logradouro?: string
      numero?: string
      complemento?: string
      bairro?: string
      cidade?: string
      uf?: string
      cep?: string
    } | null

    result.cnpj = {
      razaoSocial: org.name,
      nomeFantasia: org.name,
      cnpj: org.cnpj,
      cnaeCode: org.cnae_code || '',
      cnaeDescription: org.cnae_description || '',
      naturezaJuridica: org.legal_nature || '',
      capitalSocial: org.capital_social || 0,
      porte: '',
      situacaoCadastral: 'ATIVA',
      dataInicioAtividade: org.founding_date || '',
      address: {
        logradouro: address?.logradouro || '',
        numero: address?.numero || '',
        complemento: address?.complemento || '',
        bairro: address?.bairro || '',
        cidade: address?.cidade || '',
        uf: address?.uf || '',
        cep: address?.cep || '',
      },
      telefone: org.phone || '',
      email: null,
      shareholders: (org.shareholders || []).map(s => ({
        nome: String(s.nome || ''),
        cpfCnpj: String(s.cpfCnpj || s.cpf_cnpj || ''),
        qualificacao: String(s.qualificacao || ''),
      })),
      confidence: 'high',
      fetchedAt: org.onboarding_data?.brasil_api?.fetched_at || new Date().toISOString(),
    }
  }

  // Reconstruct website data if available
  if (org.website || org.logo_url) {
    result.website = {
      url: org.website || '',
      title: null,
      description: null,
      logoUrl: org.logo_url || null,
      logoExists: !!org.logo_url,
      confidence: 'medium',
      fetchedAt: org.onboarding_data?.clearbit?.fetched_at || new Date().toISOString(),
    }
  }

  // Reconstruct description data if available
  if (org.description) {
    result.description = {
      description: org.description,
      confidence: org.onboarding_data?.ai_description ? 'high' : 'medium',
      model: org.onboarding_data?.ai_description?.model || 'unknown',
      generatedAt: org.onboarding_data?.ai_description?.generated_at || new Date().toISOString(),
    }
  }

  return result
}

// Helper to reconstruct formData for ProfileDetailsForm from saved data
function reconstructFormData(org: {
  profile_type: OrganizationProfile | null
  description: string | null
  website: string | null
  phone: string | null
  name: string
  onboarding_data: OnboardingData | null
  settings: Record<string, unknown> | null
  shareholders?: Array<Record<string, unknown>> | null
  responsibleNameFallback?: string
}): Partial<ProfileDetailsInput> | undefined {
  if (!org.profile_type) return undefined

  const onboardingData = org.onboarding_data

  // Best source: profile_details saved by saveProfileDetails action
  if (onboardingData?.profile_details) {
    return onboardingData.profile_details as unknown as Partial<ProfileDetailsInput>
  }

  // Fallback: reconstruct from settings columns
  const settings = org.settings

  const base: Record<string, unknown> = {
    profileType: org.profile_type,
    linkedinUrl: (settings?.linkedin_url as string) || undefined,
  }

  // Asset flow now relies on dedicated onboarding_data payloads.
  // Merge saved payloads to rehydrate each step when user revisits.
  if (org.profile_type === 'asset') {
    return hydrateAssetStepFormData(onboardingData, base, {
      companyName: org.name,
      responsibleName: org.responsibleNameFallback,
      shareholders: org.shareholders,
    }) as unknown as Partial<ProfileDetailsInput>
  }

  if (!settings) return undefined

  if (org.profile_type === 'investor') {
    return {
      ...base,
      investorType: settings.investor_type,
      ticketMin: settings.ticket_min,
      ticketMax: settings.ticket_max,
      sectorsOfInterest: settings.sectors_of_interest,
      geographyFocus: settings.geography_focus,
      investmentStage: settings.investment_stage,
    } as unknown as Partial<ProfileDetailsInput>
  } else if (org.profile_type === 'advisor') {
    return {
      ...base,
      advisorType: settings.advisor_type,
      sectorSpecialization: settings.sector_specialization,
      cvmRegistry: settings.cvm_registry,
      preferredSide: settings.preferred_side,
    } as unknown as Partial<ProfileDetailsInput>
  }

  return undefined
}

// Helper to reconstruct completed steps from onboarding_data
function getCompletedSteps(org: {
  profile_type: OrganizationProfile | null
  onboarding_step: OnboardingStep
  onboarding_data: OnboardingData | null
}): OnboardingStep[] {
  const steps: OnboardingStep[] = []

  // Always mark profile_selection as completed if we have a profile
  if (org.profile_type) {
    steps.push('profile_selection')
  }

  // Use flow.steps_completed from onboarding_data if available
  const flowSteps = org.onboarding_data?.flow?.steps_completed as string[] | undefined
  if (flowSteps) {
    for (const s of flowSteps) {
      if (STEP_ORDER.includes(s as OnboardingStep) && !steps.includes(s as OnboardingStep)) {
        steps.push(s as OnboardingStep)
      }
    }
  }

  // Also infer completed steps from the current onboarding_step position
  // All steps before the current one should be marked as completed
  const currentIndex = STEP_ORDER.indexOf(org.onboarding_step)
  if (currentIndex > 0) {
    for (let i = 0; i < currentIndex; i++) {
      if (!steps.includes(STEP_ORDER[i])) {
        steps.push(STEP_ORDER[i])
      }
    }
  }

  return steps
}

export default async function OnboardingStepPage({ params }: OnboardingStepPageProps) {
  const { step: stepSlug } = await params
  
  // Validate step
  const step = STEP_SLUG_MAP[stepSlug]
  if (!step || !STEP_ORDER.includes(step)) {
    notFound()
  }

  // Get user's current onboarding state
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const responsibleNameFallback =
    typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined

  // Completed step is a terminal redirect.
  // Investors go to thesis; other profiles go to dashboard.
  if (step === 'completed') {
    const { data: latestOrg } = await supabase
      .from('organizations')
      .select('slug, profile_type')
      .eq('created_by', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestOrg?.profile_type === 'investor' && latestOrg.slug) {
      redirect(`/${latestOrg.slug}/thesis`)
    }

    redirect('/dashboard')
  }

  // Check if user has an organization in progress - fetch all relevant data
  const { data: organizations } = await supabase
    .from('organizations')
    .select(`
      id, 
      slug,
      name,
      profile_type, 
      onboarding_step,
      cnpj,
      cnae_code,
      cnae_description,
      legal_nature,
      capital_social,
      founding_date,
      phone,
      website,
      logo_url,
      description,
      address_full,
      shareholders,
      onboarding_data,
      settings
    `)
    .eq('created_by', user.id)
    .neq('onboarding_step', 'completed')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)

  const currentOrg = organizations?.[0] as {
    id: string
    slug: string
    name: string
    profile_type: OrganizationProfile | null
    onboarding_step: OnboardingStep
    cnpj: string | null
    cnae_code: string | null
    cnae_description: string | null
    legal_nature: string | null
    capital_social: number | null
    founding_date: string | null
    phone: string | null
    website: string | null
    logo_url: string | null
    description: string | null
    address_full: Record<string, unknown> | null
    shareholders: Array<Record<string, unknown>> | null
    onboarding_data: OnboardingData | null
    settings: Record<string, unknown> | null
  } | undefined

  // For profile selection, don't require an existing org
  if (step === 'profile_selection') {
    return (
      <OnboardingWizard
        initialStep={step}
        organizationId={currentOrg?.id}
        profileType={currentOrg?.profile_type as OrganizationProfile | undefined}
        organizationSlug={currentOrg?.slug}
      />
    )
  }

  // For other steps, require an organization
  if (!currentOrg) {
    redirect('/onboarding')
  }

  // Legacy-only path: users without profile must select it first
  if (!currentOrg.profile_type) {
    redirect('/onboarding/profile-selection')
  }

  // Validate that user can access this step (cannot jump ahead / cannot access skipped steps)
  const profileType = currentOrg.profile_type as OrganizationProfile
  const skippableSet = new Set<OnboardingStep>(SKIPPABLE_STEPS[profileType] || [])
  const applicableSteps = STEP_ORDER.filter(s => !skippableSet.has(s))
  const firstApplicableStep = applicableSteps.find((s) => s !== 'profile_selection') || applicableSteps[0]
  const suggestedStepFromCurrent = getNextStep(currentOrg.onboarding_step, profileType)
  const effectiveCurrentStep: OnboardingStep =
    applicableSteps.includes(currentOrg.onboarding_step)
      ? currentOrg.onboarding_step
      : (suggestedStepFromCurrent && applicableSteps.includes(suggestedStepFromCurrent)
        ? suggestedStepFromCurrent
        : firstApplicableStep)

  // If requested step does not belong to this profile flow, redirect to current applicable step
  if (!applicableSteps.includes(step)) {
    const fallbackStep = effectiveCurrentStep
    const fallbackSlug = Object.entries(STEP_SLUG_MAP).find(([, value]) => value === fallbackStep)?.[0]
    if (fallbackSlug) {
      redirect(`/onboarding/${fallbackSlug}`)
    }
  }

  const currentStepIndex = applicableSteps.indexOf(effectiveCurrentStep)
  const requestedStepIndex = applicableSteps.indexOf(step)

  if (requestedStepIndex > currentStepIndex + 1) {
    const currentStepSlug = Object.entries(STEP_SLUG_MAP).find(
      ([, value]) => value === effectiveCurrentStep
    )?.[0]
    if (currentStepSlug) {
      redirect(`/onboarding/${currentStepSlug}`)
    }
  }

  // Reconstruct enriched data from organization data
  const enrichedData = reconstructEnrichedData(currentOrg)

  // Reconstruct form data for ProfileDetailsForm (when navigating back)
  const formData = reconstructFormData({
    ...currentOrg,
    responsibleNameFallback,
  })

  // Reconstruct completed steps so the step indicator is correct
  const completedSteps = getCompletedSteps(currentOrg)

  // Extract linkedinUrl from settings for DataConfirmation restoration
  const linkedinUrl = (currentOrg.settings?.linkedin_url as string) || undefined

  return (
    <OnboardingWizard
      initialStep={step}
      organizationId={currentOrg.id}
      profileType={currentOrg.profile_type}
      organizationSlug={currentOrg.slug}
      initialEnrichedData={enrichedData}
      initialFormData={formData}
      initialCompletedSteps={completedSteps}
      initialLinkedinUrl={linkedinUrl}
    />
  )
}

// Generate static params for known steps
export function generateStaticParams() {
  return Object.keys(STEP_SLUG_MAP).map((step) => ({
    step,
  }))
}

// Metadata
export async function generateMetadata({ params }: OnboardingStepPageProps) {
  const { step } = await params
  
  const stepTitles: Record<string, string> = {
    'profile-selection': 'Escolha seu Perfil',
    'cnpj-input': 'Informe o CNPJ',
    'data-enrichment': 'Enriquecendo Dados',
    'data-confirmation': 'Confirme os Dados',
    'asset-company-data': 'Dados da Empresa',
    'asset-matching-data': 'Dados de Matching',
    'asset-team': 'Equipe',
    'asset-codename': 'Codinome',
    'profile-details': 'Detalhes do Perfil',
    'eligibility-check': 'Verificação de Elegibilidade',
    'terms-acceptance': 'Termos e Condições',
    'mfa-setup': 'Configurar MFA',
    'pending-review': 'Revisão Pendente',
    'completed': 'Cadastro Completo',
  }

  return {
    title: `${stepTitles[step] || 'Onboarding'} | Mary`,
    description: 'Complete seu cadastro na plataforma Mary M&A',
  }
}
