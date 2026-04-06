'use client'

/**
 * OnboardingWizard Component
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Main container component that orchestrates the multi-step onboarding flow.
 * Manages state, navigation between steps, and integration with server actions.
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { 
  OnboardingStep, 
  OrganizationProfile 
} from '@/types/database'
import type {
  EnrichedCnpjData,
  EnrichedWebsiteDataResult,
  GeneratedDescriptionResult,
  ProfileDetailsInput,
  EligibilityInput,
  EligibilityResult,
} from '@/types/onboarding'
import { STEP_ORDER, SKIPPABLE_STEPS, calculateProgress, getNextStep } from '@/types/onboarding'
import { StepIndicator, type StepConfig } from './StepIndicator'
import { ProfileSelector } from './ProfileSelector'
import { CnpjInput } from './CnpjInput'
import { DataConfirmation } from './DataConfirmation'
import { ProfileDetailsForm } from './ProfileDetailsForm'
import { EligibilityForm } from './EligibilityForm'
import { TermsAcceptance } from './TermsAcceptance'
import {
  saveAssetCompanyData,
  saveAssetMatchingData,
  saveAssetTeamData,
  saveAssetCodename,
} from '@/lib/actions/onboarding'
import { AssetCompanyDataStep } from './steps/asset/AssetCompanyDataStep'
import { AssetMatchingDataStep } from './steps/asset/AssetMatchingDataStep'
import { AssetTeamStep } from './steps/asset/AssetTeamStep'
import { AssetCodenameStep } from './steps/asset/AssetCodenameStep'
import { MaryAiQuickChatSheet } from '@/components/mary-ai/MaryAiQuickChatSheet'
import { Alert, AlertDescription, Button, Card, Spinner } from '@/components/ui'
import { ArrowLeft, Clock, X } from 'lucide-react'

// ============================================
// Types
// ============================================

export interface WizardState {
  currentStep: OnboardingStep
  organizationId: string | null
  profileType: OrganizationProfile | null
  enrichedData: {
    cnpj?: EnrichedCnpjData
    website?: EnrichedWebsiteDataResult
    description?: GeneratedDescriptionResult
  }
  formData: Partial<ProfileDetailsInput>
  eligibilityInput?: EligibilityInput
  eligibilityResult?: EligibilityResult
  completedSteps: OnboardingStep[]
  isLoading: boolean
  error: string | null
}

export interface OnboardingWizardProps {
  /** Initial step to start from */
  initialStep?: OnboardingStep
  /** Existing organization ID (for resuming onboarding) */
  organizationId?: string
  /** Existing profile type (for resuming onboarding) */
  profileType?: OrganizationProfile
  /** Pre-loaded enriched data (from server) */
  initialEnrichedData?: {
    cnpj?: EnrichedCnpjData
    website?: EnrichedWebsiteDataResult
    description?: GeneratedDescriptionResult
  }
  /** Pre-loaded form data for ProfileDetailsForm (from server, for back navigation) */
  initialFormData?: Partial<ProfileDetailsInput>
  /** Pre-computed completed steps (from server, for step indicator) */
  initialCompletedSteps?: OnboardingStep[]
  /** LinkedIn URL from settings (for DataConfirmation restoration) */
  initialLinkedinUrl?: string
  /** Organization slug for post-onboarding redirects */
  organizationSlug?: string
  /** Additional CSS classes */
  className?: string
}

// ============================================
// Step Configuration
// ============================================

// VISIBLE_STEPS - Profile selection removed (now happens at signup)
// Ref: ADR-001 Profile Selection on Landing
const DEFAULT_VISIBLE_STEPS: StepConfig[] = [
  { id: 'cnpj_input', label: 'CNPJ', description: 'Dados da empresa' },
  { id: 'data_confirmation', label: 'Confirmar', description: 'Verifique os dados' },
  { id: 'profile_details', label: 'Detalhes', description: 'Informações adicionais' },
  { id: 'eligibility_check', label: 'Elegibilidade', description: 'Verificação' },
  { id: 'terms_acceptance', label: 'Termos', description: 'Aceite os termos' },
]

const INVESTOR_VISIBLE_STEPS: StepConfig[] = [
  { id: 'profile_details', label: 'Tese inicial', description: 'Defina seu foco de investimento' },
  { id: 'eligibility_check', label: 'Dados financeiros', description: 'Informe dados essenciais' },
]

const ASSET_VISIBLE_STEPS: StepConfig[] = [
  { id: 'asset_company_data', label: 'Dados', description: 'Dados da empresa' },
  { id: 'asset_matching_data', label: 'Matching', description: 'Dados de matching' },
  { id: 'asset_team', label: 'Equipe', description: 'Sócios e advisors' },
  { id: 'asset_codename', label: 'Codinome', description: 'Nome do projeto' },
]

// ============================================
// Reducer
// ============================================

type WizardAction =
  | { type: 'SET_STEP'; step: OnboardingStep }
  | { type: 'SET_ORGANIZATION'; orgId: string; profileType: OrganizationProfile }
  | { type: 'SET_CNPJ_DATA'; data: EnrichedCnpjData }
  | { type: 'SET_WEBSITE_DATA'; data: EnrichedWebsiteDataResult }
  | { type: 'SET_DESCRIPTION'; data: GeneratedDescriptionResult }
  | { type: 'SET_FORM_DATA'; data: Partial<ProfileDetailsInput> }
  | { type: 'SET_ELIGIBILITY_INPUT'; data: EligibilityInput }
  | { type: 'SET_ELIGIBILITY'; result: EligibilityResult }
  | { type: 'COMPLETE_STEP'; step: OnboardingStep }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' }

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step, error: null }
    
    case 'SET_ORGANIZATION':
      return { 
        ...state, 
        organizationId: action.orgId, 
        profileType: action.profileType 
      }
    
    case 'SET_CNPJ_DATA':
      return { 
        ...state, 
        enrichedData: { ...state.enrichedData, cnpj: action.data } 
      }
    
    case 'SET_WEBSITE_DATA':
      return { 
        ...state, 
        enrichedData: { ...state.enrichedData, website: action.data } 
      }
    
    case 'SET_DESCRIPTION':
      return { 
        ...state, 
        enrichedData: { ...state.enrichedData, description: action.data } 
      }
    
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.data }
      }

    case 'SET_ELIGIBILITY_INPUT':
      return { ...state, eligibilityInput: action.data }

    case 'SET_ELIGIBILITY':
      return { ...state, eligibilityResult: action.result }
    
    case 'COMPLETE_STEP':
      if (state.completedSteps.includes(action.step)) {
        return state
      }
      return { 
        ...state, 
        completedSteps: [...state.completedSteps, action.step] 
      }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false }
    
    case 'RESET':
      return createInitialState()
    
    default:
      return state
  }
}

function createInitialState(
  initialStep?: OnboardingStep,
  organizationId?: string,
  profileType?: OrganizationProfile,
  initialEnrichedData?: {
    cnpj?: EnrichedCnpjData
    website?: EnrichedWebsiteDataResult
    description?: GeneratedDescriptionResult
  },
  initialFormData?: Partial<ProfileDetailsInput>,
  initialCompletedSteps?: OnboardingStep[],
): WizardState {
  // Default to cnpj_input since profile_selection now happens at signup
  // Ref: ADR-001 Profile Selection on Landing

  // Use server-reconstructed completed steps, or fallback to basic inference
  const completedSteps = initialCompletedSteps && initialCompletedSteps.length > 0
    ? initialCompletedSteps
    : profileType ? ['profile_selection' as OnboardingStep] : []

  const defaultStep: OnboardingStep =
    profileType === 'investor' ? 'profile_details' : 'cnpj_input'

  return {
    currentStep: initialStep || defaultStep,
    organizationId: organizationId || null,
    profileType: profileType || null,
    enrichedData: initialEnrichedData || {},
    formData: initialFormData || {},
    completedSteps,
    isLoading: false,
    error: null,
  }
}

// ============================================
// Component
// ============================================

export function OnboardingWizard({
  initialStep,
  organizationId,
  profileType,
  initialEnrichedData,
  initialFormData,
  initialCompletedSteps,
  initialLinkedinUrl,
  organizationSlug,
  className,
}: OnboardingWizardProps) {
  const router = useRouter()
  const [isMaryAiOpen, setIsMaryAiOpen] = React.useState(false)
  const [maryAiInitialMessage, setMaryAiInitialMessage] = React.useState('')
  const [state, dispatch] = React.useReducer(
    wizardReducer,
    createInitialState(initialStep, organizationId, profileType, initialEnrichedData, initialFormData, initialCompletedSteps)
  )

  // Get visible steps based on profile type
  const visibleSteps = React.useMemo(() => {
    if (state.profileType === 'investor') return INVESTOR_VISIBLE_STEPS
    if (state.profileType === 'asset') return ASSET_VISIBLE_STEPS
    if (!state.profileType) return DEFAULT_VISIBLE_STEPS
    const skippable = SKIPPABLE_STEPS[state.profileType]
    return DEFAULT_VISIBLE_STEPS.filter(step => !skippable.includes(step.id))
  }, [state.profileType])

  // Calculate progress
  const progress = React.useMemo(() => {
    if (!state.profileType) return 0
    return calculateProgress(state.currentStep, state.profileType)
  }, [state.currentStep, state.profileType])

  // Navigation helpers
  const goToStep = React.useCallback((step: OnboardingStep) => {
    dispatch({ type: 'SET_STEP', step })
    router.push(`/onboarding/${step.replace(/_/g, '-')}`, { scroll: false })
  }, [router])

  const goToNextStep = React.useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep)
    if (currentIndex < 0) return
    
    let nextIndex = currentIndex + 1
    const skippable = state.profileType ? SKIPPABLE_STEPS[state.profileType] : []
    
    // Skip steps that don't apply to profile
    while (nextIndex < STEP_ORDER.length && skippable.includes(STEP_ORDER[nextIndex])) {
      nextIndex++
    }
    
    if (nextIndex < STEP_ORDER.length) {
      dispatch({ type: 'COMPLETE_STEP', step: state.currentStep })
      goToStep(STEP_ORDER[nextIndex])
    }
  }, [state.currentStep, state.profileType, goToStep])

  const goToPreviousStep = React.useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep)
    if (currentIndex <= 0) return
    
    let prevIndex = currentIndex - 1
    const skippable = state.profileType ? SKIPPABLE_STEPS[state.profileType] : []
    
    // Skip steps that don't apply to profile
    while (prevIndex >= 0 && skippable.includes(STEP_ORDER[prevIndex])) {
      prevIndex--
    }
    
    if (prevIndex >= 0) {
      goToStep(STEP_ORDER[prevIndex])
    }
  }, [state.currentStep, state.profileType, goToStep])

  // Action handlers
  const handleProfileSelect = React.useCallback((orgId: string, profile: OrganizationProfile) => {
    dispatch({ type: 'SET_ORGANIZATION', orgId, profileType: profile })
    dispatch({ type: 'COMPLETE_STEP', step: 'profile_selection' })
    goToStep('cnpj_input')
  }, [goToStep])

  const handleCnpjEnriched = React.useCallback((data: EnrichedCnpjData) => {
    dispatch({ type: 'SET_CNPJ_DATA', data })
    dispatch({ type: 'COMPLETE_STEP', step: 'cnpj_input' })
    if (state.profileType) {
      const nextStep = getNextStep('cnpj_input', state.profileType)
      goToStep(nextStep ?? 'data_confirmation')
      return
    }
    goToStep('data_confirmation')
  }, [goToStep, state.profileType])

  const handleWebsiteEnriched = React.useCallback((data: EnrichedWebsiteDataResult) => {
    dispatch({ type: 'SET_WEBSITE_DATA', data })
  }, [])

  const handleDescriptionGenerated = React.useCallback((data: GeneratedDescriptionResult) => {
    dispatch({ type: 'SET_DESCRIPTION', data })
  }, [])

  const handleDataConfirmed = React.useCallback(() => {
    dispatch({ type: 'COMPLETE_STEP', step: 'data_confirmation' })
    if (state.profileType === 'asset') {
      goToStep('asset_company_data')
      return
    }
    goToStep('profile_details')
  }, [state.profileType, goToStep])

  const handleProfileDetailsSaved = React.useCallback((data: Partial<ProfileDetailsInput>) => {
    dispatch({ type: 'SET_FORM_DATA', data })
    dispatch({ type: 'COMPLETE_STEP', step: 'profile_details' })
    
    // Assets skip eligibility
    if (state.profileType === 'asset') {
      goToStep('terms_acceptance')
    } else {
      goToStep('eligibility_check')
    }
  }, [state.profileType, goToStep])

  const handleEligibilitySubmitted = React.useCallback((result: EligibilityResult) => {
    dispatch({ type: 'SET_ELIGIBILITY', result })
    dispatch({ type: 'COMPLETE_STEP', step: 'eligibility_check' })
    if (result.redirectPath) {
      window.location.href = result.redirectPath
      return
    }
    // Use the nextStep from the eligibility result (terms_acceptance or pending_review)
    goToStep(result.nextStep)
  }, [goToStep])

  const handleEligibilityBack = React.useCallback((currentData: EligibilityInput) => {
    // Save current form data before navigating back
    dispatch({ type: 'SET_ELIGIBILITY_INPUT', data: currentData })
    goToPreviousStep()
  }, [goToPreviousStep])

  const handleOnboardingComplete = React.useCallback(() => {
    dispatch({ type: 'COMPLETE_STEP', step: 'terms_acceptance' })
    // Use full page reload to ensure fresh data after onboarding completion
    // router.push() can use cached RSC data where onboarding_step is still incomplete
    const shouldGoToMRS = state.profileType === 'asset' && organizationSlug
    window.location.href = shouldGoToMRS ? `/${organizationSlug}/mrs` : '/dashboard'
  }, [organizationSlug, state.profileType])

  const handleExit = React.useCallback(() => {
    if (confirm('Tem certeza que deseja sair? Seu progresso será salvo.')) {
      router.push('/dashboard')
    }
  }, [router])

  const openMaryAiWithStepContext = React.useCallback((context: string) => {
    setMaryAiInitialMessage(context)
    setIsMaryAiOpen(true)
  }, [])

  // Render current step content
  // Note: profile_selection removed from wizard (now happens at signup)
  // Ref: ADR-001 Profile Selection on Landing
  const renderStepContent = () => {
    if (state.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      )
    }

    switch (state.currentStep) {
      // profile_selection case removed - now handled at signup
      // Legacy orgs without profile_type are redirected to profile-selection page
      case 'profile_selection':
        // Fallback for legacy orgs - show ProfileSelector
        return (
          <ProfileSelector
            onSelect={handleProfileSelect}
            isLoading={state.isLoading}
          />
        )
      
      case 'cnpj_input':
        return (
          <CnpjInput
            organizationId={state.organizationId!}
            onEnriched={handleCnpjEnriched}
            onBack={goToPreviousStep}
          />
        )
      
      case 'data_enrichment':
        // data_enrichment é um step intermediário sem UI própria.
        // Para assets, pula para asset_company_data; para outros perfis, pula para data_confirmation.
        if (state.profileType === 'asset') {
          goToStep('asset_company_data')
        } else {
          goToStep('data_confirmation')
        }
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Redirecionando...</p>
          </div>
        )

      case 'data_confirmation':
        // If cnpjData is not available, redirect back to cnpj_input
        if (!state.enrichedData.cnpj) {
          return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-muted-foreground">Dados do CNPJ não encontrados.</p>
              <Button onClick={() => goToStep('cnpj_input')}>
                Voltar para buscar CNPJ
              </Button>
            </div>
          )
        }
        return (
          <DataConfirmation
            organizationId={state.organizationId!}
            cnpjData={state.enrichedData.cnpj}
            websiteData={state.enrichedData.website}
            descriptionData={state.enrichedData.description}
            initialLinkedinUrl={initialLinkedinUrl}
            onWebsiteEnriched={handleWebsiteEnriched}
            onDescriptionGenerated={handleDescriptionGenerated}
            onConfirm={handleDataConfirmed}
            onBack={goToPreviousStep}
          />
        )
      
      case 'profile_details':
        return (
          <ProfileDetailsForm
            organizationId={state.organizationId!}
            profileType={state.profileType!}
            initialData={state.formData}
            onSave={handleProfileDetailsSaved}
            onBack={goToPreviousStep}
          />
        )

      case 'asset_company_data':
        return (
          <AssetCompanyDataStep
            organizationId={state.organizationId ?? undefined}
            initialData={state.formData as unknown as Record<string, unknown>}
            onBack={goToPreviousStep}
            onAskMaryAi={openMaryAiWithStepContext}
            onAutoSave={async (data) => {
              if (!state.organizationId) return
              const result = await saveAssetCompanyData(state.organizationId, data)
              if (result.success) {
                dispatch({ type: 'SET_FORM_DATA', data: data as unknown as Partial<ProfileDetailsInput> })
                dispatch({ type: 'SET_ERROR', error: null })
                return
              }

              if (result.error && !result.error.toLowerCase().includes('obrigat')) {
                dispatch({ type: 'SET_ERROR', error: result.error })
              }
            }}
            onSave={async (data) => {
              if (!state.organizationId) {
                dispatch({ type: 'SET_ERROR', error: 'Organização não encontrada' })
                return
              }
              try {
                dispatch({ type: 'SET_LOADING', isLoading: true })
                const result = await saveAssetCompanyData(state.organizationId, data)
                if (!result.success) {
                  dispatch({ type: 'SET_ERROR', error: result.error || 'Erro ao salvar dados da empresa' })
                  return
                }
                dispatch({ type: 'SET_FORM_DATA', data: data as unknown as Partial<ProfileDetailsInput> })
                dispatch({ type: 'COMPLETE_STEP', step: 'asset_company_data' })
                dispatch({ type: 'SET_LOADING', isLoading: false })
                goToStep('asset_matching_data')
              } catch {
                dispatch({ type: 'SET_ERROR', error: 'Erro inesperado ao salvar dados da empresa' })
              }
            }}
          />
        )

      case 'asset_matching_data':
        return (
          <AssetMatchingDataStep
            organizationId={state.organizationId ?? undefined}
            initialData={state.formData as unknown as Record<string, unknown>}
            onBack={goToPreviousStep}
            onAutoSave={async (data) => {
              if (!state.organizationId) return
              const result = await saveAssetMatchingData(state.organizationId, data)
              if (result.success) {
                dispatch({ type: 'SET_FORM_DATA', data: data as unknown as Partial<ProfileDetailsInput> })
                dispatch({ type: 'SET_ERROR', error: null })
                return
              }

              if (result.error) {
                dispatch({ type: 'SET_ERROR', error: result.error })
              }
            }}
            onSave={async (data) => {
              if (!state.organizationId) {
                dispatch({ type: 'SET_ERROR', error: 'Organização não encontrada' })
                return
              }
              try {
                dispatch({ type: 'SET_LOADING', isLoading: true })
                const result = await saveAssetMatchingData(state.organizationId, data)
                if (!result.success) {
                  dispatch({ type: 'SET_ERROR', error: result.error || 'Erro ao salvar dados de matching' })
                  return
                }
                dispatch({ type: 'SET_FORM_DATA', data: data as unknown as Partial<ProfileDetailsInput> })
                dispatch({ type: 'COMPLETE_STEP', step: 'asset_matching_data' })
                dispatch({ type: 'SET_LOADING', isLoading: false })
                goToStep('asset_team')
              } catch {
                dispatch({ type: 'SET_ERROR', error: 'Erro inesperado ao salvar dados de matching' })
              }
            }}
          />
        )

      case 'asset_team':
        return (
          <AssetTeamStep
            organizationId={state.organizationId ?? undefined}
            initialData={state.formData as unknown as Record<string, unknown>}
            onBack={goToPreviousStep}
            onAutoSave={async (data) => {
              if (!state.organizationId) return
              const result = await saveAssetTeamData(state.organizationId, data)
              if (result.success) {
                dispatch({ type: 'SET_FORM_DATA', data: data as unknown as Partial<ProfileDetailsInput> })
                dispatch({ type: 'SET_ERROR', error: null })
                return
              }

              if (result.error && !result.error.toLowerCase().includes('obrigat')) {
                dispatch({ type: 'SET_ERROR', error: result.error })
              }
            }}
            onSave={async (data) => {
              if (!state.organizationId) {
                dispatch({ type: 'SET_ERROR', error: 'Organização não encontrada' })
                return
              }
              try {
                dispatch({ type: 'SET_LOADING', isLoading: true })
                const result = await saveAssetTeamData(state.organizationId, data)
                if (!result.success) {
                  dispatch({ type: 'SET_ERROR', error: result.error || 'Erro ao salvar equipe' })
                  return
                }
                dispatch({ type: 'SET_FORM_DATA', data: data as unknown as Partial<ProfileDetailsInput> })
                dispatch({ type: 'COMPLETE_STEP', step: 'asset_team' })
                dispatch({ type: 'SET_LOADING', isLoading: false })
                goToStep('asset_codename')
              } catch {
                dispatch({ type: 'SET_ERROR', error: 'Erro inesperado ao salvar equipe' })
              }
            }}
          />
        )

      case 'asset_codename':
        return (
          <AssetCodenameStep
            organizationId={state.organizationId ?? undefined}
            initialData={state.formData as unknown as Record<string, unknown>}
            onBack={goToPreviousStep}
            onAutoSave={async (data) => {
              if (!state.organizationId) return
              const result = await saveAssetCodename(state.organizationId, data)
              if (result.success) {
                dispatch({ type: 'SET_FORM_DATA', data: data as unknown as Partial<ProfileDetailsInput> })
                dispatch({ type: 'SET_ERROR', error: null })
                return
              }

              if (result.error && !result.error.toLowerCase().includes('obrigat')) {
                dispatch({ type: 'SET_ERROR', error: result.error })
              }
            }}
            onSave={async (data) => {
              if (!state.organizationId) {
                dispatch({ type: 'SET_ERROR', error: 'Organização não encontrada' })
                return
              }
              try {
                dispatch({ type: 'SET_LOADING', isLoading: true })
                const result = await saveAssetCodename(state.organizationId, data)
                if (!result.success) {
                  dispatch({ type: 'SET_ERROR', error: result.error || 'Erro ao salvar codinome' })
                  return
                }
                dispatch({ type: 'SET_FORM_DATA', data: data as unknown as Partial<ProfileDetailsInput> })
                dispatch({ type: 'COMPLETE_STEP', step: 'asset_codename' })
                dispatch({ type: 'SET_LOADING', isLoading: false })
                goToStep('terms_acceptance')
              } catch {
                dispatch({ type: 'SET_ERROR', error: 'Erro inesperado ao salvar codinome' })
              }
            }}
          />
        )
      
      case 'eligibility_check':
        return (
          <EligibilityForm
            organizationId={state.organizationId!}
            profileType={state.profileType!}
            initialData={state.eligibilityInput}
            onSubmit={handleEligibilitySubmitted}
            onBack={handleEligibilityBack}
          />
        )
      
      case 'terms_acceptance':
        return (
          <TermsAcceptance
            organizationId={state.organizationId!}
            onComplete={handleOnboardingComplete}
            onBack={goToPreviousStep}
          />
        )

      case 'pending_review':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
            <div className="rounded-full bg-yellow-100 p-4">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Solicitação enviada!</h2>
              <p className="text-muted-foreground max-w-md">
                Sua solicitação de revisão foi enviada com sucesso.
                Nossa equipe analisará seu perfil e entraremos em contato em breve.
              </p>
            </div>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Ir para o Dashboard
            </Button>
          </div>
        )
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Step não encontrado</p>
          </div>
        )
    }
  }

  const canGoBack = React.useMemo(() => {
    if (!state.profileType) return STEP_ORDER.indexOf(state.currentStep) > 0
    const applicableSteps = STEP_ORDER.filter((step) => !SKIPPABLE_STEPS[state.profileType!].includes(step))
    return applicableSteps.indexOf(state.currentStep) > 0
  }, [state.currentStep, state.profileType])

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {canGoBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousStep}
              aria-label="Voltar para o passo anterior"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Configure sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete as etapas abaixo para começar
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExit}
          aria-label="Sair do onboarding"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator
          steps={visibleSteps}
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
          onStepClick={goToStep}
        />
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card className="p-6 md:p-8">
        {renderStepContent()}
      </Card>

      <MaryAiQuickChatSheet
        open={isMaryAiOpen}
        onOpenChange={setIsMaryAiOpen}
        initialMessage={maryAiInitialMessage}
      />

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-muted rounded-lg text-xs">
          <p><strong>Debug:</strong></p>
          <p>Step: {state.currentStep}</p>
          <p>OrgId: {state.organizationId || 'null'}</p>
          <p>Profile: {state.profileType || 'null'}</p>
          <p>Progress: {progress}%</p>
          <p>Completed: {state.completedSteps.join(', ') || 'none'}</p>
        </div>
      )}
    </div>
  )
}

export default OnboardingWizard
