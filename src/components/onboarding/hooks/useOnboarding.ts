'use client'

/**
 * useOnboarding Hook
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Central state management hook for the onboarding wizard.
 * Combines auto-save, navigation, and action orchestration.
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { OnboardingStep, OrganizationProfile } from '@/types/database'
import { useAutoSave as useGlobalAutoSave } from '@/hooks/useAutoSave'
import { autoSaveOnboardingFields } from '@/lib/actions/onboarding'
import type {
  EnrichedCnpjData,
  EnrichedWebsiteDataResult,
  GeneratedDescriptionResult,
  ProfileDetailsInput,
  EligibilityResult,
} from '@/types/onboarding'
import { STEP_ORDER, SKIPPABLE_STEPS, calculateProgress } from '@/types/onboarding'
import type { OnboardingDraft } from './useAutoSave'

// ============================================
// Types
// ============================================

export interface OnboardingState {
  currentStep: OnboardingStep
  organizationId: string | null
  profileType: OrganizationProfile | null
  enrichedData: {
    cnpj?: EnrichedCnpjData
    website?: EnrichedWebsiteDataResult
    description?: GeneratedDescriptionResult
  }
  formData: Partial<ProfileDetailsInput>
  eligibilityResult?: EligibilityResult
  completedSteps: OnboardingStep[]
  isLoading: boolean
  error: string | null
}

export interface UseOnboardingOptions {
  initialStep?: OnboardingStep
  organizationId?: string
  profileType?: OrganizationProfile
  enableAutoSave?: boolean
}

export interface UseOnboardingReturn {
  state: OnboardingState
  progress: number
  visibleSteps: Array<{ id: OnboardingStep; label: string }>
  
  // Navigation
  goToStep: (step: OnboardingStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  canGoBack: boolean
  canGoForward: boolean
  
  // State updates
  setOrganization: (orgId: string, profileType: OrganizationProfile) => void
  setCnpjData: (data: EnrichedCnpjData) => void
  setWebsiteData: (data: EnrichedWebsiteDataResult) => void
  setDescription: (data: GeneratedDescriptionResult) => void
  setFormData: (data: Partial<ProfileDetailsInput>) => void
  setEligibility: (result: EligibilityResult) => void
  completeStep: (step: OnboardingStep) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  
  // Auto-save
  autoSave: {
    save: (data: Partial<OnboardingDraft>) => void
    load: () => OnboardingDraft | null
    clear: () => void
    hasDraft: boolean
    lastSavedAt: Date | null
    isSaving: boolean
  }
}

// ============================================
// Step Configuration
// ============================================

const STEP_LABELS: Record<OnboardingStep, string> = {
  profile_selection: 'Perfil',
  cnpj_input: 'CNPJ',
  data_enrichment: 'Enriquecimento',
  data_confirmation: 'Confirmar',
  asset_company_data: 'Dados da Empresa',
  asset_matching_data: 'Dados de Matching',
  asset_team: 'Equipe',
  asset_codename: 'Codinome',
  profile_details: 'Detalhes',
  eligibility_check: 'Elegibilidade',
  terms_acceptance: 'Termos',
  mfa_setup: 'MFA',
  pending_review: 'Revisão',
  completed: 'Concluído',
}

const ASSET_VISIBLE_STEPS: OnboardingStep[] = [
  'asset_company_data',
  'asset_matching_data',
  'asset_team',
  'asset_codename',
]

const DRAFT_STORAGE_KEY = 'mary_onboarding_draft'

// ============================================
// Reducer
// ============================================

type OnboardingAction =
  | { type: 'SET_STEP'; step: OnboardingStep }
  | { type: 'SET_ORGANIZATION'; orgId: string; profileType: OrganizationProfile }
  | { type: 'SET_CNPJ_DATA'; data: EnrichedCnpjData }
  | { type: 'SET_WEBSITE_DATA'; data: EnrichedWebsiteDataResult }
  | { type: 'SET_DESCRIPTION'; data: GeneratedDescriptionResult }
  | { type: 'SET_FORM_DATA'; data: Partial<ProfileDetailsInput> }
  | { type: 'SET_ELIGIBILITY'; result: EligibilityResult }
  | { type: 'COMPLETE_STEP'; step: OnboardingStep }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESTORE'; draft: OnboardingDraft }
  | { type: 'RESET' }

function createInitialState(options: UseOnboardingOptions): OnboardingState {
  const defaultStep: OnboardingStep =
    options.initialStep ||
    (options.profileType === 'investor'
      ? 'profile_details'
      : options.profileType === 'asset'
      ? 'cnpj_input'
      : 'profile_selection')

  return {
    currentStep: defaultStep,
    organizationId: options.organizationId || null,
    profileType: options.profileType || null,
    enrichedData: {},
    formData: {},
    completedSteps: [],
    isLoading: false,
    error: null,
  }
}

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
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
    
    case 'RESTORE':
      return {
        ...state,
        organizationId: action.draft.organizationId,
        profileType: action.draft.profileType,
        currentStep: action.draft.currentStep,
        formData: action.draft.formData as Partial<ProfileDetailsInput>,
      }
    
    case 'RESET':
      return createInitialState({})
    
    default:
      return state
  }
}

// ============================================
// Hook
// ============================================

export function useOnboarding(options: UseOnboardingOptions = {}): UseOnboardingReturn {
  const router = useRouter()
  const [state, dispatch] = React.useReducer(
    onboardingReducer,
    options,
    createInitialState
  )

  const [hasDraft, setHasDraft] = React.useState(false)

  const autoSave = useGlobalAutoSave({
    entityId: state.organizationId ?? 'pending-onboarding-org',
    entityType: 'organization',
    debounceMs: 2000,
    onSave: async (_field, value) => {
      if (typeof window === 'undefined' || options.enableAutoSave === false) return
      if (state.organizationId) {
        const result = await autoSaveOnboardingFields(state.organizationId, {
          onboardingDraft: value as Record<string, unknown>,
        })
        if (!result.success) {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value))
        }
      } else {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value))
      }
      setHasDraft(true)
    },
  })

  const saveStateField = React.useMemo(() => autoSave.registerField('onboarding_draft'), [autoSave])

  const loadDraft = React.useCallback((): OnboardingDraft | null => {
    if (typeof window === 'undefined' || options.enableAutoSave === false) return null
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
      return stored ? (JSON.parse(stored) as OnboardingDraft) : null
    } catch {
      return null
    }
  }, [options.enableAutoSave])

  const clearDraft = React.useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(DRAFT_STORAGE_KEY)
    setHasDraft(false)
  }, [])

  React.useEffect(() => {
    if (options.enableAutoSave === false || typeof window === 'undefined') return
    setHasDraft(Boolean(localStorage.getItem(DRAFT_STORAGE_KEY)))
  }, [options.enableAutoSave])

  // Restore from auto-save on mount
  React.useEffect(() => {
    if (!options.organizationId && hasDraft) {
      const draft = loadDraft()
      if (draft) {
        dispatch({ type: 'RESTORE', draft })
      }
    }
  }, [hasDraft, loadDraft, options.organizationId])

  // Auto-save on state changes
  React.useEffect(() => {
    if (state.organizationId) {
      saveStateField.onChange({
        organizationId: state.organizationId,
        profileType: state.profileType,
        currentStep: state.currentStep,
        formData: state.formData as Record<string, unknown>,
        lastSavedAt: new Date().toISOString(),
      })
    }
  }, [saveStateField, state.organizationId, state.profileType, state.currentStep, state.formData])

  // Calculate visible steps
  const visibleSteps = React.useMemo(() => {
    if (state.profileType === 'asset') {
      return ASSET_VISIBLE_STEPS.map((step) => ({
        id: step,
        label: STEP_LABELS[step],
      }))
    }

    const skippable = state.profileType ? SKIPPABLE_STEPS[state.profileType] : []
    return STEP_ORDER
      .filter(step => !skippable.includes(step) && step !== 'completed')
      .map(step => ({
        id: step,
        label: STEP_LABELS[step],
      }))
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
    
    while (prevIndex >= 0 && skippable.includes(STEP_ORDER[prevIndex])) {
      prevIndex--
    }
    
    if (prevIndex >= 0) {
      goToStep(STEP_ORDER[prevIndex])
    }
  }, [state.currentStep, state.profileType, goToStep])

  const currentIndex = STEP_ORDER.indexOf(state.currentStep)
  const canGoBack = currentIndex > 0
  const canGoForward = currentIndex < STEP_ORDER.length - 1 && 
    state.completedSteps.includes(state.currentStep)

  // State update functions
  const setOrganization = React.useCallback((orgId: string, profileType: OrganizationProfile) => {
    dispatch({ type: 'SET_ORGANIZATION', orgId, profileType })
  }, [])

  const setCnpjData = React.useCallback((data: EnrichedCnpjData) => {
    dispatch({ type: 'SET_CNPJ_DATA', data })
  }, [])

  const setWebsiteData = React.useCallback((data: EnrichedWebsiteDataResult) => {
    dispatch({ type: 'SET_WEBSITE_DATA', data })
  }, [])

  const setDescription = React.useCallback((data: GeneratedDescriptionResult) => {
    dispatch({ type: 'SET_DESCRIPTION', data })
  }, [])

  const setFormData = React.useCallback((data: Partial<ProfileDetailsInput>) => {
    dispatch({ type: 'SET_FORM_DATA', data })
  }, [])

  const setEligibility = React.useCallback((result: EligibilityResult) => {
    dispatch({ type: 'SET_ELIGIBILITY', result })
  }, [])

  const completeStep = React.useCallback((step: OnboardingStep) => {
    dispatch({ type: 'COMPLETE_STEP', step })
  }, [])

  const setLoading = React.useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', isLoading })
  }, [])

  const setError = React.useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', error })
  }, [])

  const reset = React.useCallback(() => {
    dispatch({ type: 'RESET' })
    clearDraft()
  }, [clearDraft])

  return {
    state,
    progress,
    visibleSteps,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    canGoForward,
    setOrganization,
    setCnpjData,
    setWebsiteData,
    setDescription,
    setFormData,
    setEligibility,
    completeStep,
    setLoading,
    setError,
    reset,
    autoSave: {
      save: (data: Partial<OnboardingDraft>) => {
        saveStateField.onChange({
          ...data,
          lastSavedAt: new Date().toISOString(),
        })
      },
      load: loadDraft,
      clear: clearDraft,
      hasDraft,
      lastSavedAt: autoSave.lastSaved,
      isSaving: autoSave.isSaving,
    },
  }
}

export default useOnboarding
