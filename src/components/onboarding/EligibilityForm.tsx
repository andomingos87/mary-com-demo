'use client'

/**
 * EligibilityForm Component
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Step 5: Gate de elegibilidade for investors and advisors.
 * Validates minimum requirements for accessing the platform.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Button,
  Input,
  Label,
  Spinner,
  Card,
  Alert,
  AlertDescription,
  Textarea,
} from '@/components/ui'
import { ArrowLeft, ArrowRight, Check, X, AlertTriangle, Trophy } from 'lucide-react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator'
import type { OrganizationProfile } from '@/types/database'
import type { EligibilityInput, EligibilityResult } from '@/types/onboarding'
import { submitEligibility } from '@/lib/actions/onboarding'
import { autoSaveOnboardingFields } from '@/lib/actions/onboarding'
import { submitManualReviewRequest } from '@/lib/actions/eligibility'
import { formatCurrency } from '@/lib/format/currency'

// ============================================
// Types
// ============================================

export interface EligibilityFormProps {
  /** Organization ID */
  organizationId: string
  /** Profile type */
  profileType: OrganizationProfile
  /** Initial data to populate the form (for preserving data on navigation) */
  initialData?: EligibilityInput
  /** Callback when eligibility is submitted */
  onSubmit: (result: EligibilityResult) => void
  /** Callback to go back (receives current form data to preserve state) */
  onBack: (currentData: EligibilityInput) => void
  /** Additional CSS classes */
  className?: string
}

// ============================================
// Constants
// ============================================

const ELIGIBILITY_CRITERIA = {
  investor: {
    minDeals: 1,
    minDealValue: 100000,
    minYearsExperience: 2,
    title: 'Elegibilidade do Investidor',
    description: 'Para garantirmos a qualidade da plataforma, precisamos validar sua experiência em investimentos.',
  },
  advisor: {
    minDeals: 3,
    minDealValue: 500000,
    minYearsExperience: 3,
    title: 'Elegibilidade do Advisor',
    description: 'Para garantirmos a qualidade da plataforma, precisamos validar sua experiência em assessoria.',
  },
  asset: {
    minDeals: 0,
    minDealValue: 0,
    minYearsExperience: 0,
    title: 'Elegibilidade',
    description: 'Empresas não precisam passar pelo gate de elegibilidade.',
  },
}

// ============================================
// Component
// ============================================

export function EligibilityForm({
  organizationId,
  profileType,
  initialData,
  onSubmit,
  onBack,
  className,
}: EligibilityFormProps) {
  const dealsInputRef = React.useRef<HTMLInputElement>(null)
  const totalDealValueRef = React.useRef<HTMLInputElement>(null)
  const yearsExperienceRef = React.useRef<HTMLInputElement>(null)

  const [formData, setFormData] = React.useState<EligibilityInput>(
    initialData ?? {
      dealsLast3Years: undefined,
      totalDealValueUsd: undefined,
      yearsExperience: undefined,
    }
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false)
  const [result, setResult] = React.useState<EligibilityResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isAssetAutoSubmitted, setIsAssetAutoSubmitted] = React.useState(false)
  const [justification, setJustification] = React.useState('')
  const autoSave = useAutoSave({
    entityId: organizationId,
    entityType: 'organization',
    onSave: async (_field, value) => {
      const result = await autoSaveOnboardingFields(organizationId, {
        eligibilityDraft: value as Record<string, unknown>,
      })
      if (result.success) return
      if (typeof window !== 'undefined') {
        localStorage.setItem(`mary_h06_eligibility_${organizationId}`, JSON.stringify(value))
      }
    },
  })
  const dealsField = autoSave.registerField('dealsLast3Years')
  const dealValueField = autoSave.registerField('totalDealValueUsd')
  const experienceField = autoSave.registerField('yearsExperience')

  // Currency display state for formatted input
  const [dealValueDisplay, setDealValueDisplay] = React.useState(
    formatCurrency(initialData?.totalDealValueUsd)
  )

  const criteria = ELIGIBILITY_CRITERIA[profileType]
  const isAsset = profileType === 'asset'

  // Auto-submit for assets (they skip eligibility)
  React.useEffect(() => {
    if (!isAsset || isAssetAutoSubmitted) return
    
    const autoSubmit = async () => {
      setIsSubmitting(true)
      setIsAssetAutoSubmitted(true)
      try {
        const submitResult = await submitEligibility(organizationId, {})
        if (submitResult.success && submitResult.data) {
          onSubmit(submitResult.data)
        }
      } catch (err) {
        console.error('Error auto-submitting eligibility:', err)
      } finally {
        setIsSubmitting(false)
      }
    }
    autoSubmit()
  }, [isAsset, isAssetAutoSubmitted, organizationId, onSubmit])

  const updateField = (field: keyof EligibilityInput, value: number | undefined) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'dealsLast3Years') dealsField.onChange(next)
      if (field === 'totalDealValueUsd') dealValueField.onChange(next)
      if (field === 'yearsExperience') experienceField.onChange(next)
      return next
    })
    setResult(null)
    setError(null)
  }

  const scrollToFirstMissingField = React.useCallback((missingFields: Array<keyof EligibilityInput>) => {
    const refMap: Partial<Record<keyof EligibilityInput, React.RefObject<HTMLInputElement | null>>> = {
      dealsLast3Years: dealsInputRef,
      totalDealValueUsd: totalDealValueRef,
      yearsExperience: yearsExperienceRef,
    }

    const firstField = missingFields[0]
    const target = refMap[firstField]?.current
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.focus({ preventScroll: true })
  }, [])

  // Show loading state for assets
  if (isAsset) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Processando...</p>
      </div>
    )
  }

  const handleSubmit = async () => {
    const missingFields: Array<keyof EligibilityInput> = []
    if (formData.dealsLast3Years === undefined) missingFields.push('dealsLast3Years')
    if (formData.totalDealValueUsd === undefined) missingFields.push('totalDealValueUsd')
    if (formData.yearsExperience === undefined) missingFields.push('yearsExperience')

    if (missingFields.length > 0) {
      setError('Por favor, preencha todos os campos.')
      requestAnimationFrame(() => {
        scrollToFirstMissingField(missingFields)
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const submitResult = await submitEligibility(organizationId, formData)
      
      if (submitResult.success && submitResult.data) {
        setResult(submitResult.data)
      } else {
        setError(submitResult.error || 'Erro ao verificar elegibilidade.')
      }
    } catch (err) {
      console.error('Error submitting eligibility:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    if (result) {
      onSubmit(result)
    }
  }

  const handleSubmitReview = async () => {
    if (!result) return

    setIsSubmittingReview(true)
    setError(null)

    try {
      const reviewResult = await submitManualReviewRequest(
        organizationId,
        formData,
        justification
      )

      if (reviewResult.success) {
        // Update the result to reflect the review submission
        const updatedResult: EligibilityResult = {
          ...result,
          nextStep: 'pending_review',
        }
        onSubmit(updatedResult)
      } else {
        setError(reviewResult.error || 'Erro ao enviar solicitação de revisão.')
      }
    } catch (err) {
      console.error('Error submitting review request:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Check if each criterion is met
  const isDealsMetric = formData.dealsLast3Years !== undefined && 
    formData.dealsLast3Years >= criteria.minDeals
  const isValueMet = formData.totalDealValueUsd !== undefined && 
    formData.totalDealValueUsd >= criteria.minDealValue
  const isExperienceMet = formData.yearsExperience !== undefined && 
    formData.yearsExperience >= criteria.minYearsExperience

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{criteria.title}</h2>
        <p className="text-muted-foreground">{criteria.description}</p>
        <div className="mt-2">
          <AutoSaveIndicator status={autoSave.isSaving ? 'saving' : autoSave.lastSaved ? 'saved' : 'idle'} />
        </div>
      </div>

      {/* Requirements Info */}
      <Card className="p-4 bg-muted/50">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          Requisitos Mínimos
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            {isDealsMetric ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
            )}
            <span className={isDealsMetric ? 'text-green-600' : ''}>
              Mínimo de {criteria.minDeals} deal(s) nos últimos 3 anos
            </span>
          </li>
          <li className="flex items-center gap-2">
            {isValueMet ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
            )}
            <span className={isValueMet ? 'text-green-600' : ''}>
              Valor total de deals ≥ USD {criteria.minDealValue.toLocaleString()}
            </span>
          </li>
          <li className="flex items-center gap-2">
            {isExperienceMet ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
            )}
            <span className={isExperienceMet ? 'text-green-600' : ''}>
              Mínimo de {criteria.minYearsExperience} anos de experiência
            </span>
          </li>
        </ul>
      </Card>

      {/* Form */}
      {!result && (
        <div className="space-y-4 max-w-md mx-auto">
          <div className="space-y-2">
            <Label htmlFor="dealsLast3Years">
              Quantos deals você realizou nos últimos 3 anos?
            </Label>
            <Input
              id="dealsLast3Years"
              ref={dealsInputRef}
              type="number"
              min="0"
              placeholder="Ex: 5"
              value={formData.dealsLast3Years ?? ''}
              onChange={(e) => updateField(
                'dealsLast3Years', 
                e.target.value ? Number(e.target.value) : undefined
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalDealValueUsd">
              Qual o valor total acumulado desses deals (USD)?
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                USD
              </span>
              <Input
                id="totalDealValueUsd"
                ref={totalDealValueRef}
                type="text"
                inputMode="numeric"
                placeholder="Ex: 5.000.000"
                className="pl-12"
                value={dealValueDisplay}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '')
                  const numValue = rawValue ? parseInt(rawValue, 10) : undefined
                  updateField('totalDealValueUsd', numValue)
                  setDealValueDisplay(numValue !== undefined ? formatCurrency(numValue) : '')
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Informe em dólares americanos (USD)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsExperience">
              Anos de experiência no mercado de M&A
            </Label>
            <Input
              id="yearsExperience"
              ref={yearsExperienceRef}
              type="number"
              min="0"
              placeholder="Ex: 5"
              value={formData.yearsExperience ?? ''}
              onChange={(e) => updateField(
                'yearsExperience', 
                e.target.value ? Number(e.target.value) : undefined
              )}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" variant="white" className="mr-2" />
                Verificando...
              </>
            ) : (
              'Verificar Elegibilidade'
            )}
          </Button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="max-w-md mx-auto space-y-4">
          <Card className={cn(
            'p-6 text-center',
            result.eligible ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          )}>
            {result.eligible ? (
              <>
                <Trophy className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  Parabéns! Você é elegível
                </h3>
                <p className="text-sm text-green-600 mb-4">
                  Sua experiência atende aos requisitos da plataforma.
                </p>
                <div className="text-3xl font-bold text-green-700">
                  {result.score}%
                </div>
                <p className="text-xs text-green-600 mt-1">Score de elegibilidade</p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                <h3 className="text-lg font-semibold text-yellow-700 mb-2">
                  Revisão Pendente
                </h3>
                <p className="text-sm text-yellow-600 mb-4">
                  Algumas informações precisam ser verificadas manualmente.
                </p>

                {/* TASK-013: Justification textarea for manual review */}
                <div className="mt-4 text-left">
                  <Label htmlFor="justification" className="text-yellow-700">
                    Justificativa (opcional)
                  </Label>
                  <Textarea
                    id="justification"
                    placeholder="Explique por que você deveria ser aprovado..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={4}
                    className="mt-2 bg-white border-yellow-300 focus:border-yellow-500"
                  />
                  <p className="text-xs text-yellow-600 mt-1">
                    Descreva sua experiência ou contexto adicional que possa ajudar na avaliação.
                  </p>
                </div>
              </>
            )}
          </Card>

          {/* Criteria Status */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Critérios avaliados:</h4>
            {result.requirements.met.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                {req}
              </div>
            ))}
            {result.requirements.notMet.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                <X className="h-4 w-4" />
                {req}
              </div>
            ))}
          </div>

          {/* Reasons */}
          {result.reasons.length > 0 && (
            <Alert>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {result.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Error display for review submission */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" onClick={() => onBack(formData)} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {result && (
          <div className="flex items-center gap-3">
            {!result.eligible && (
              <p className="text-sm text-muted-foreground">
                Não se preocupe, nossa equipe analisará seu caso.
              </p>
            )}
            <Button
              onClick={result.eligible ? handleContinue : handleSubmitReview}
              variant="default"
              size={result.eligible ? 'default' : 'lg'}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : result.eligible ? (
                <>
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Enviar para Revisão
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EligibilityForm
