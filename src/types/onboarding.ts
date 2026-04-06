/**
 * Types específicos para Onboarding Server Actions
 * Phase 3.3 - Backend: Server Actions de Onboarding
 */

import type {
  OrganizationProfile,
  OnboardingStep,
  Organization,
  OnboardingData,
  OnboardingProgress,
  CvmParticipantType,
} from './database'

import type {
  EnrichedCompanyData,
  EnrichedWebsiteData,
  ClearbitLogoResult,
  CvmValidationResult,
  GeneratedDescription,
} from '@/lib/enrichment/types'

// ============================================
// Action Result Types
// ============================================

/** Resultado padrão de uma action */
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// Start Onboarding Types
// ============================================

/** Resultado do início do onboarding */
export interface StartOnboardingResult {
  orgId: string
  step: OnboardingStep
  /** Indica se está retomando um onboarding existente */
  isResumed?: boolean
}

/** Opções para iniciar onboarding */
export interface StartOnboardingOptions {
  /** Força criação de nova org mesmo se existir uma incompleta */
  forceNew?: boolean
}

// ============================================
// Existing Onboarding Check Types
// ============================================

/** Dados da organização existente com onboarding incompleto */
export interface ExistingOrgData {
  id: string
  name: string
  cnpj: string | null
  onboarding_step: OnboardingStep
  profile_type: OrganizationProfile
}

/** Resultado da verificação de onboarding existente */
export interface ExistingOrgCheck {
  hasIncompleteOrg: boolean
  organization?: ExistingOrgData
}

// ============================================
// CNPJ Enrichment Types
// ============================================

/** Dados enriquecidos do CNPJ para a action */
export interface EnrichedCnpjData {
  // Dados da empresa
  razaoSocial: string
  nomeFantasia: string | null
  cnpj: string
  
  // Atividade
  cnaeCode: string
  cnaeDescription: string
  
  // Dados jurídicos
  naturezaJuridica: string
  capitalSocial: number
  porte: string
  situacaoCadastral: string
  dataInicioAtividade: string
  
  // Endereço
  address: {
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    uf: string
    cep: string
  }
  
  // Contato
  telefone: string | null
  email: string | null
  
  // Sócios
  shareholders: Array<{
    nome: string
    cpfCnpj: string
    qualificacao: string
  }>
  
  // CVM (se aplicável)
  cvm?: {
    isRegistered: boolean
    participantType: CvmParticipantType | null
    participantName: string | null
  }
  
  // Metadados
  confidence: 'high' | 'medium' | 'low'
  fetchedAt: string
}

// ============================================
// Website Enrichment Types
// ============================================

/** Dados enriquecidos do website para a action */
export interface EnrichedWebsiteDataResult {
  url: string
  title: string | null
  description: string | null
  logoUrl: string | null
  logoExists: boolean
  confidence: 'high' | 'medium' | 'low'
  fetchedAt: string
}

// ============================================
// Description Generation Types
// ============================================

/** Resultado da geração de descrição */
export interface GeneratedDescriptionResult {
  description: string
  confidence: 'high' | 'medium' | 'low'
  model: string
  generatedAt: string
}

// ============================================
// Profile Details Types
// ============================================

/** Input base para detalhes do perfil */
export interface ProfileDetailsInputBase {
  // Campos comuns
  description?: string
  website?: string
  phone?: string
  /** URL do perfil da empresa no LinkedIn */
  linkedinUrl?: string
}

/** Input para perfil de Investidor */
export interface InvestorProfileDetails extends ProfileDetailsInputBase {
  investorType:
    | 'accelerator'
    | 'angel'
    | 'cvc'
    | 'corporate_strategic'
    | 'family_office'
    | 'incubator'
    | 'pension_fund'
    | 'pe'
    | 'search_fund'
    | 'sovereign'
    | 'venture_builder'
    | 'vc'
  ticketMin: number
  ticketMax: number
  sectorsOfInterest: string[] // MAICS codes
  geographyFocus: string[]
  investmentStage?: string[]
}

/** Input para perfil de Ativo/Empresa */
export interface AssetProfileDetails extends ProfileDetailsInputBase {
  sector: string // MAICS code
  /** Faturamento bruto anual aproximado em USD */
  revenueAnnualUsd: number
  objective: 'sale' | 'fundraising' | 'merger' | 'partnership' | 'other'
  stage?: 'ideation' | 'mvp' | 'growth' | 'scale' | 'mature' | 'consolidated'
  /** EBITDA anual em USD (Earnings Before Interest, Taxes, Depreciation and Amortization) */
  ebitdaAnnualUsd?: number
}

// ============================================
// Asset Excalidraw 4-step Types (H0.1)
// ============================================

export interface AssetCompanyData {
  responsibleName?: string
  companyName?: string
  companyDescription: string
  projectObjective: {
    type: 'investment' | 'full_sale'
    subReason: string
  }
  businessModel: Array<'B2B' | 'B2C' | 'B2B2C' | 'B2G'>
  sectors: string[]
  operatingRegions?: string[]
}

export interface AssetMatchingData {
  rob12Months: number
  ebitdaPercent: number
  employeeCount: number
  foundingYear: number
  headquarters: {
    city: string
    state: string
    country: string
  }
  equityOffered?: number
  targetValue?: number
}

export interface AssetTeamData {
  shareholders: Array<{
    name: string
    email: string
    role?: string
    ownershipPercent?: number
  }>
  advisors?: Array<{
    name: string
    email: string
    company?: string
    role?: string
  }>
  invitedMembers?: Array<{
    name: string
    email: string
  }>
}

export interface AssetCodenameData {
  codename: string
  codenameSource: 'manual' | 'ai'
}

/** Input para perfil de Advisor */
export interface AdvisorProfileDetails extends ProfileDetailsInputBase {
  advisorType: 'investment_bank' | 'boutique_ma' | 'law_firm' | 'accounting' | 'auditing' | 'other'
  sectorSpecialization: string[] // MAICS codes
  cvmRegistry?: string
  preferredSide: 'sell_side' | 'buy_side' | 'both'
}

/** Union type para todos os inputs de perfil */
export type ProfileDetailsInput = 
  | ({ profileType: 'investor' } & InvestorProfileDetails)
  | ({ profileType: 'asset' } & AssetProfileDetails)
  | ({ profileType: 'advisor' } & AdvisorProfileDetails)

// ============================================
// Eligibility Types
// ============================================

/** Input para verificação de elegibilidade */
export interface EligibilityInput {
  // Para Investidor e Advisor
  dealsLast3Years?: number
  totalDealValueUsd?: number
  yearsExperience?: number
  
  // Campos adicionais de verificação
  hasRequiredLicenses?: boolean
  acceptsTerms?: boolean
}

/** Resultado da verificação de elegibilidade */
export interface EligibilityResult {
  eligible: boolean
  score: number // 0-100
  reasons: string[]
  requirements: {
    met: string[]
    notMet: string[]
  }
  nextStep: OnboardingStep
  /** Redirect target after step completion (used by profile-specific flows) */
  redirectPath?: string
}

/** Critérios de elegibilidade por perfil */
export const ELIGIBILITY_CRITERIA = {
  investor: {
    minDeals: 1,
    minDealValue: 100000, // USD
    minYearsExperience: 2,
  },
  advisor: {
    minDeals: 3,
    minDealValue: 500000, // USD
    minYearsExperience: 3,
  },
  asset: {
    // Ativos não têm gate de elegibilidade
    minDeals: 0,
    minDealValue: 0,
    minYearsExperience: 0,
  },
} as const

// ============================================
// Onboarding Progress Types
// ============================================

/** Progresso detalhado do onboarding */
export interface OnboardingProgressResult extends OnboardingProgress {
  organization: {
    id: string
    name: string
    slug: string
    profileType: OrganizationProfile
  }
  enrichmentStatus: {
    cnpj: boolean
    website: boolean
    description: boolean
    cvm: boolean
  }
  canProceed: boolean
  missingFields: string[]
}

// ============================================
// Step Validation Types
// ============================================

/** Validação de step */
export interface StepValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/** Mapa de validações por step */
export type StepValidationMap = Record<OnboardingStep, StepValidation>

// ============================================
// Onboarding State Types
// ============================================

/** Estado completo do onboarding (para frontend) */
export interface OnboardingState {
  orgId: string
  currentStep: OnboardingStep
  profileType: OrganizationProfile
  progress: OnboardingProgressResult
  data: {
    cnpj?: EnrichedCnpjData
    website?: EnrichedWebsiteDataResult
    description?: GeneratedDescriptionResult
    profileDetails?: ProfileDetailsInput
    eligibility?: EligibilityResult
  }
  validation: StepValidationMap
}

// ============================================
// Constants
// ============================================

/** Steps que requerem dados específicos */
export const STEP_REQUIREMENTS: Record<OnboardingStep, string[]> = {
  profile_selection: [],
  cnpj_input: ['cnpj'],
  data_enrichment: ['cnpj'],
  data_confirmation: ['name', 'cnpj', 'cnae_code', 'website'],
  asset_company_data: ['companyDescription', 'projectObjective', 'businessModel', 'sectors'],
  asset_matching_data: ['rob12Months', 'ebitdaPercent', 'employeeCount', 'foundingYear', 'headquarters'],
  asset_team: ['shareholders'],
  asset_codename: ['codename'],
  profile_details: ['profile_type'],
  eligibility_check: ['profile_type'],
  terms_acceptance: [],
  mfa_setup: [],
  pending_review: [],
  completed: [],
}

/** Steps que podem ser pulados por perfil */
export const SKIPPABLE_STEPS: Record<OrganizationProfile, OnboardingStep[]> = {
  investor: [
    'profile_selection',
    'cnpj_input',
    'data_enrichment',
    'data_confirmation',
    'asset_company_data',
    'asset_matching_data',
    'asset_team',
    'asset_codename',
    'terms_acceptance',
    'mfa_setup',
    'pending_review',
  ], // Investor onboarding is intentionally reduced to 2 steps in MVP
  asset: ['data_enrichment', 'data_confirmation', 'profile_details', 'eligibility_check'], // H0.1 asset flow usa 4 novos passos
  advisor: ['asset_company_data', 'asset_matching_data', 'asset_team', 'asset_codename'],
}

/** 
 * Ordem dos steps para navegação
 * 
 * Note: profile_selection is kept for backward compatibility with legacy orgs
 * that don't have profile_type set. New signups set profile at landing page
 * and skip this step.
 * 
 * Ref: ADR-001 Profile Selection on Landing (2026-01-10)
 */
export const STEP_ORDER: OnboardingStep[] = [
  'profile_selection', // Legacy support only - new users skip this
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

/** 
 * Steps that are visible in the wizard UI (excludes profile_selection for new flow)
 * Used to calculate progress for users who selected profile at signup
 */
export const WIZARD_VISIBLE_STEPS: OnboardingStep[] = [
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

/** Calcula o próximo step baseado no perfil */
export function getNextStep(
  currentStep: OnboardingStep,
  profileType: OrganizationProfile
): OnboardingStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep)
  if (currentIndex === -1 || currentIndex >= STEP_ORDER.length - 1) {
    return null
  }
  
  let nextIndex = currentIndex + 1
  const skippable = SKIPPABLE_STEPS[profileType]
  
  // Pula steps que não se aplicam ao perfil
  while (nextIndex < STEP_ORDER.length && skippable.includes(STEP_ORDER[nextIndex])) {
    nextIndex++
  }
  
  return nextIndex < STEP_ORDER.length ? STEP_ORDER[nextIndex] : null
}

/** Calcula o step anterior */
export function getPreviousStep(
  currentStep: OnboardingStep,
  profileType: OrganizationProfile
): OnboardingStep | null {
  const currentIndex = STEP_ORDER.indexOf(currentStep)
  if (currentIndex <= 0) {
    return null
  }
  
  let prevIndex = currentIndex - 1
  const skippable = SKIPPABLE_STEPS[profileType]
  
  // Pula steps que não se aplicam ao perfil
  while (prevIndex >= 0 && skippable.includes(STEP_ORDER[prevIndex])) {
    prevIndex--
  }
  
  return prevIndex >= 0 ? STEP_ORDER[prevIndex] : null
}

/** 
 * Calcula percentual de progresso
 * 
 * For new users (who selected profile at signup), profile_selection is skipped
 * and progress starts at cnpj_input.
 * 
 * @param currentStep - Current onboarding step
 * @param profileType - Organization profile type
 * @param profilePreselectedAtSignup - If true, excludes profile_selection from count
 */
export function calculateProgress(
  currentStep: OnboardingStep,
  profileType: OrganizationProfile,
  profilePreselectedAtSignup: boolean = true
): number {
  const skippable = SKIPPABLE_STEPS[profileType]
  
  // For new flow, also skip profile_selection in progress calculation
  const stepsToSkip = profilePreselectedAtSignup 
    ? [...skippable, 'profile_selection'] 
    : skippable
  
  const applicableSteps = STEP_ORDER.filter(s => !stepsToSkip.includes(s))
  const currentIndex = applicableSteps.indexOf(currentStep)
  
  if (currentIndex === -1) return 0
  
  return Math.round((currentIndex / (applicableSteps.length - 1)) * 100)
}
