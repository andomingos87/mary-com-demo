'use client'

/**
 * ProfileDetailsForm Component
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Step 4: Dynamic form for profile-specific details.
 * Renders different fields based on profile type (investor/asset/advisor).
 */

import * as React from 'react'
import {
  Button,
  Input,
  Label,
  Spinner,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator'
import type { OrganizationProfile } from '@/types/database'
import type { ProfileDetailsInput } from '@/types/onboarding'
import type { GeographySelection } from '@/types/geography'
import { saveProfileDetails } from '@/lib/actions/onboarding'
import { autoSaveOnboardingFields } from '@/lib/actions/onboarding'
import { formatCurrency } from '@/lib/format/currency'
import { getSectorsForSelect } from '@/lib/constants/sectors'
import { INVESTMENT_STAGE_OPTIONS } from '@/lib/constants/investment-stages'
import { cn } from '@/lib/utils'
import { GeographySelector } from './GeographySelector'
import { SectorMultiSelect } from '@/components/shared/SectorMultiSelect'
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown'
import { UsdCurrencyInput } from '@/components/shared/UsdCurrencyInput'

// ============================================
// Types
// ============================================

export interface ProfileDetailsFormProps {
  /** Organization ID */
  organizationId: string
  /** Profile type to render form for */
  profileType: OrganizationProfile
  /** Initial form data */
  initialData?: Partial<ProfileDetailsInput>
  /** Callback when form is saved */
  onSave: (data: Partial<ProfileDetailsInput>) => void
  /** Callback to go back */
  onBack: () => void
  /** Additional CSS classes */
  className?: string
}

// ============================================
// Constants
// ============================================

const INVESTOR_TYPES = [
  { value: 'accelerator', label: 'Accelerator' },
  { value: 'angel', label: 'Angel' },
  { value: 'cvc', label: 'Corporate Venture Capital (CVC)' },
  { value: 'corporate_strategic', label: 'Corporate/Strategic' },
  { value: 'family_office', label: 'Family Office (FO)' },
  { value: 'incubator', label: 'Incubator' },
  { value: 'pension_fund', label: 'Pension Fund' },
  { value: 'pe', label: 'Private Equity (PE)' },
  { value: 'search_fund', label: 'Search Fund' },
  { value: 'sovereign', label: 'Sovereign' },
  { value: 'venture_builder', label: 'Venture Builder (VB)' },
  { value: 'vc', label: 'Venture Capital (VC)' },
] as const

const ADVISOR_TYPES = [
  { value: 'investment_bank', label: 'Banco de investimento (IB)' },
  { value: 'boutique_ma', label: 'Boutique de M&A' },
  { value: 'law_firm', label: 'Advocacia' },
  { value: 'accounting', label: 'Contabilidade' },
  { value: 'auditing', label: 'Auditorias' },
  { value: 'other', label: 'Outros' },
] as const

const OBJECTIVES = [
  { value: 'sale', label: 'Venda Total' },
  { value: 'fundraising', label: 'Captação / Investimento' },
  { value: 'merger', label: 'Fusão' },
  { value: 'partnership', label: 'Parceria Estratégica' },
  { value: 'other', label: 'Outro' },
] as const

const PREFERRED_SIDES = [
  { value: 'sell_side', label: 'Sell-side (Vendedor)' },
  { value: 'buy_side', label: 'Buy-side (Comprador)' },
  { value: 'both', label: 'Ambos' },
] as const

const SECTORS = getSectorsForSelect()

// GEOGRAPHIES constant removed - now using database-driven GeographySelector (TASK-012)

// ============================================
// Component
// ============================================

export function ProfileDetailsForm({
  organizationId,
  profileType,
  initialData,
  onSave,
  onBack,
  className,
}: ProfileDetailsFormProps) {
  const investorTypeRef = React.useRef<HTMLDivElement>(null)
  const ticketMinRef = React.useRef<HTMLDivElement>(null)
  const ticketMaxRef = React.useRef<HTMLDivElement>(null)
  const sectorsRef = React.useRef<HTMLDivElement>(null)
  const geographiesRef = React.useRef<HTMLDivElement>(null)
  const assetSectorRef = React.useRef<HTMLDivElement>(null)
  const revenueRef = React.useRef<HTMLDivElement>(null)
  const objectiveRef = React.useRef<HTMLDivElement>(null)
  const advisorTypeRef = React.useRef<HTMLDivElement>(null)
  const preferredSideRef = React.useRef<HTMLDivElement>(null)

  const [formData, setFormData] = React.useState<Record<string, unknown>>(
    initialData || {}
  )

  // Initialize selectedSectors from initialData based on profile type
  // For investors: sectorsOfInterest, for advisors: sectorSpecialization
  const getInitialSectors = (): string[] => {
    if (!initialData) return []
    const data = initialData as Record<string, unknown>
    if (profileType === 'investor' && Array.isArray(data.sectorsOfInterest)) {
      return data.sectorsOfInterest as string[]
    }
    if (profileType === 'advisor' && Array.isArray(data.sectorSpecialization)) {
      return data.sectorSpecialization as string[]
    }
    return []
  }

  const [selectedSectors, setSelectedSectors] = React.useState<string[]>(getInitialSectors)
  const [selectedInvestmentStages, setSelectedInvestmentStages] = React.useState<string[]>(
    Array.isArray((initialData as Record<string, unknown> | undefined)?.investmentStage)
      ? ((initialData as Record<string, unknown>).investmentStage as string[])
      : []
  )

  // TASK-012: Using structured geography selection
  // Initialize from initialData.geographyFocus if available (for investors)
  // Known continent codes for categorization
  const CONTINENT_CODES = ['AF', 'AN', 'AS', 'EU', 'NA', 'OC', 'SA', 'GLOBAL']

  const getInitialGeography = (): GeographySelection => {
    if (!initialData || profileType !== 'investor') {
      return { continents: [], countries: [], states: [] }
    }
    const data = initialData as Record<string, unknown>
    const geographyFocus = data.geographyFocus as string[] | undefined
    if (!Array.isArray(geographyFocus) || geographyFocus.length === 0) {
      return { continents: [], countries: [], states: [] }
    }
    // Categorize codes based on format:
    // - Codes with '-' are states (e.g., 'BR-SP')
    // - Codes in CONTINENT_CODES are continents
    // - Everything else is a country
    const continents: string[] = []
    const countries: string[] = []
    const states: string[] = []

    geographyFocus.forEach(code => {
      if (code.includes('-')) {
        states.push(code)
      } else if (CONTINENT_CODES.includes(code)) {
        continents.push(code)
      } else {
        countries.push(code)
      }
    })

    return { continents, countries, states }
  }

  const [geographySelection, setGeographySelection] = React.useState<GeographySelection>(getInitialGeography)
  const [isSaving, setIsSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const autoSave = useAutoSave({
    entityId: organizationId,
    entityType: 'organization',
    onSave: async (_field, value) => {
      const result = await autoSaveOnboardingFields(organizationId, {
        profileDetailsDraft: value as Record<string, unknown>,
      })

      if (result.success) return
      if (typeof window !== 'undefined') {
        localStorage.setItem(`mary_h06_profile_details_${organizationId}`, JSON.stringify(value))
      }
    },
  })
  const registeredFieldsRef = React.useRef<Record<string, ReturnType<typeof autoSave.registerField>>>({})

  // Currency display states for formatted inputs (investor profile only)
  const initialTicketMin = (initialData as Record<string, unknown> | undefined)?.ticketMin as number | undefined
  const initialTicketMax = (initialData as Record<string, unknown> | undefined)?.ticketMax as number | undefined
  const [ticketMinDisplay, setTicketMinDisplay] = React.useState(
    formatCurrency(initialTicketMin)
  )
  const [ticketMaxDisplay, setTicketMaxDisplay] = React.useState(
    formatCurrency(initialTicketMax)
  )
  const initialRevenueAnnualUsd = (initialData as Record<string, unknown> | undefined)?.revenueAnnualUsd as number | undefined
  const [revenueAnnualDisplay, setRevenueAnnualDisplay] = React.useState(
    formatCurrency(initialRevenueAnnualUsd)
  )

  // TASK-025: EBITDA display state (asset profile only)
  const initialEbitda = (initialData as Record<string, unknown> | undefined)?.ebitdaAnnualUsd as number | undefined
  const [ebitdaDisplay, setEbitdaDisplay] = React.useState(
    formatCurrency(initialEbitda)
  )

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      if (!registeredFieldsRef.current[field]) {
        registeredFieldsRef.current[field] = autoSave.registerField(field)
      }
      registeredFieldsRef.current[field].onChange(next)
      return next
    })
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  React.useEffect(() => {
    if (!registeredFieldsRef.current.sectorsOfInterest) {
      registeredFieldsRef.current.sectorsOfInterest = autoSave.registerField('sectorsOfInterest')
    }
    registeredFieldsRef.current.sectorsOfInterest.onChange(selectedSectors)
  }, [autoSave, selectedSectors])

  React.useEffect(() => {
    if (!registeredFieldsRef.current.investmentStage) {
      registeredFieldsRef.current.investmentStage = autoSave.registerField('investmentStage')
    }
    registeredFieldsRef.current.investmentStage.onChange(selectedInvestmentStages)
  }, [autoSave, selectedInvestmentStages])

  React.useEffect(() => {
    if (!registeredFieldsRef.current.geographyFocus) {
      registeredFieldsRef.current.geographyFocus = autoSave.registerField('geographyFocus')
    }
    registeredFieldsRef.current.geographyFocus.onChange(geographySelection)
  }, [autoSave, geographySelection])

  // toggleGeography removed - GeographySelector handles its own state (TASK-012)

  const scrollToFirstError = React.useCallback(
    (errorKeys: string[]) => {
      const fieldOrderByProfile: Record<OrganizationProfile, string[]> = {
        investor: ['investorType', 'ticketMin', 'ticketMax', 'sectors', 'geographies'],
        asset: ['sector', 'revenueAnnualUsd', 'objective'],
        advisor: ['advisorType', 'sectors', 'preferredSide'],
      }

      const refsByField: Record<string, React.RefObject<HTMLDivElement | null>> = {
        investorType: investorTypeRef,
        ticketMin: ticketMinRef,
        ticketMax: ticketMaxRef,
        sectors: sectorsRef,
        geographies: geographiesRef,
        sector: assetSectorRef,
        revenueAnnualUsd: revenueRef,
        objective: objectiveRef,
        advisorType: advisorTypeRef,
        preferredSide: preferredSideRef,
      }

      const orderedKeys = fieldOrderByProfile[profileType]
      const firstErrorKey = orderedKeys.find((key) => errorKeys.includes(key))
      if (!firstErrorKey) return

      const target = refsByField[firstErrorKey]?.current
      if (!target) return

      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const focusable = target.querySelector<HTMLElement>(
        'input, button, [role="combobox"], [tabindex]:not([tabindex="-1"])'
      )
      if (focusable) {
        focusable.focus({ preventScroll: true })
      } else {
        target.focus({ preventScroll: true })
      }
    },
    [profileType]
  )

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (profileType === 'investor') {
      if (!formData.investorType) newErrors.investorType = 'Selecione o tipo'
      if (!formData.ticketMin) newErrors.ticketMin = 'Informe o ticket mínimo'
      if (!formData.ticketMax) newErrors.ticketMax = 'Informe o ticket máximo'
      if (selectedSectors.length === 0) newErrors.sectors = 'Selecione ao menos um setor'
      // TASK-012: Validate geography selection (any level counts)
      const hasGeographySelection =
        geographySelection.continents.length > 0 ||
        geographySelection.countries.length > 0 ||
        geographySelection.states.length > 0
      if (!hasGeographySelection) newErrors.geographies = 'Selecione ao menos uma região'
    } else if (profileType === 'asset') {
      if (!formData.sector) newErrors.sector = 'Selecione o setor'
      if (!formData.revenueAnnualUsd) newErrors.revenueAnnualUsd = 'Informe o faturamento bruto anual'
      if (!formData.objective) newErrors.objective = 'Selecione o objetivo'
    } else if (profileType === 'advisor') {
      if (!formData.advisorType) newErrors.advisorType = 'Selecione o tipo'
      if (selectedSectors.length === 0) newErrors.sectors = 'Selecione ao menos um setor'
      if (!formData.preferredSide) newErrors.preferredSide = 'Selecione o lado'
    }

    const errorKeys = Object.keys(newErrors)
    setErrors(newErrors)

    if (errorKeys.length > 0) {
      requestAnimationFrame(() => {
        scrollToFirstError(errorKeys)
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      // TASK-012: Flatten geography selection to array of codes for backward compatibility
      const flatGeographyFocus = [
        ...geographySelection.continents,
        ...geographySelection.countries,
        ...geographySelection.states,
      ]

      const data: Partial<ProfileDetailsInput> = {
        profileType,
        ...formData,
        ...(profileType !== 'asset' && { sectorsOfInterest: selectedSectors }),
        ...(profileType === 'investor' && {
          geographyFocus: flatGeographyFocus,
          investmentStage: selectedInvestmentStages,
        }),
        ...(profileType === 'advisor' && { sectorSpecialization: selectedSectors }),
      } as Partial<ProfileDetailsInput>

      const result = await saveProfileDetails(organizationId, data as ProfileDetailsInput)
      
      if (result.success) {
        onSave(data)
      } else {
        setErrors({ submit: result.error || 'Erro ao salvar. Tente novamente.' })
      }
    } catch (err) {
      console.error('Error saving profile details:', err)
      setErrors({ submit: 'Erro inesperado. Tente novamente.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Render form based on profile type
  const renderForm = () => {
    switch (profileType) {
      case 'investor':
        return renderInvestorForm()
      case 'asset':
        return renderAssetForm()
      case 'advisor':
        return renderAdvisorForm()
      default:
        return null
    }
  }

  const renderInvestorForm = () => (
    <div className="space-y-6">
      {/* Investor Type */}
      <div className="space-y-2" ref={investorTypeRef} tabIndex={-1}>
        <Label htmlFor="investorType">Tipo de Investidor *</Label>
        <Select
          value={formData.investorType as string}
          onValueChange={(value) => updateField('investorType', value)}
        >
          <SelectTrigger id="investorType">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {INVESTOR_TYPES.map(type => (
              <SelectItem
                key={type.value}
                value={type.value}
                className="cursor-pointer transition-colors hover:bg-primary/10"
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.investorType && (
          <p className="text-xs text-destructive">{errors.investorType}</p>
        )}
      </div>

      {/* Ticket Range */}
      <div className="grid grid-cols-2 gap-4">
        <div ref={ticketMinRef} tabIndex={-1}>
          <UsdCurrencyInput
            id="ticketMin"
            label="Ticket Mínimo"
            placeholder="100,000"
            value={ticketMinDisplay}
            required
            error={errors.ticketMin}
            disabled={isSaving}
            onValueChange={(displayValue, numericValue) => {
              updateField('ticketMin', numericValue)
              setTicketMinDisplay(displayValue)
            }}
          />
        </div>
        <div ref={ticketMaxRef} tabIndex={-1}>
          <UsdCurrencyInput
            id="ticketMax"
            label="Ticket Máximo"
            placeholder="10,000,000"
            value={ticketMaxDisplay}
            required
            error={errors.ticketMax}
            disabled={isSaving}
            onValueChange={(displayValue, numericValue) => {
              updateField('ticketMax', numericValue)
              setTicketMaxDisplay(displayValue)
            }}
          />
        </div>
      </div>

      {/* Sectors of Interest */}
      <div ref={sectorsRef} tabIndex={-1}>
        <SectorMultiSelect
          selectedValues={selectedSectors}
          onChange={setSelectedSectors}
          label="Setores de Interesse"
          required
          disabled={isSaving}
          error={errors.sectors}
        />
      </div>

      {/* Geography Focus - TASK-012: Database-driven cascading selector */}
      <div className="space-y-2" ref={geographiesRef} tabIndex={-1}>
        <Label>Geografia de Atuação *</Label>
        <GeographySelector
          value={geographySelection}
          onChange={setGeographySelection}
          disabled={isSaving}
        />
        {errors.geographies && (
          <p className="text-xs text-destructive">{errors.geographies}</p>
        )}
      </div>

      <MultiSelectDropdown
        label="Estágios de Interesse"
        options={INVESTMENT_STAGE_OPTIONS}
        values={selectedInvestmentStages}
        onChange={setSelectedInvestmentStages}
        placeholder="Selecione os estágios"
        disabled={isSaving}
      />
    </div>
  )

  const renderAssetForm = () => (
    <div className="space-y-6">
      {/* Sector */}
      <div className="space-y-2" ref={assetSectorRef} tabIndex={-1}>
        <Label htmlFor="sector">Setor Principal *</Label>
        <Select
          value={formData.sector as string}
          onValueChange={(value) => updateField('sector', value)}
        >
          <SelectTrigger id="sector">
            <SelectValue placeholder="Selecione o setor" />
          </SelectTrigger>
          <SelectContent>
            {SECTORS.map(sector => (
              <SelectItem
                key={sector.value}
                value={sector.value}
                className="cursor-pointer transition-colors hover:bg-primary/10"
              >
                {sector.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.sector && (
          <p className="text-xs text-destructive">{errors.sector}</p>
        )}
      </div>

      {/* Revenue - Faturamento Bruto Anual */}
      <div className="space-y-2" ref={revenueRef} tabIndex={-1}>
        <Label htmlFor="revenueAnnualUsd">Faturamento Bruto Anual (USD) *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            USD
          </span>
          <Input
            id="revenueAnnualUsd"
            type="text"
            inputMode="numeric"
            placeholder="1.000.000"
            className="pl-12"
            value={revenueAnnualDisplay}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, '')
              const numValue = rawValue ? parseInt(rawValue, 10) : undefined
              updateField('revenueAnnualUsd', numValue)
              setRevenueAnnualDisplay(numValue !== undefined ? formatCurrency(numValue) : '')
            }}
          />
        </div>
        {errors.revenueAnnualUsd && (
          <p className="text-xs text-destructive">{errors.revenueAnnualUsd}</p>
        )}
      </div>

      {/* EBITDA - TASK-025 */}
      <div className="space-y-2">
        <Label htmlFor="ebitdaAnnualUsd">EBITDA Anual (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            USD
          </span>
          <Input
            id="ebitdaAnnualUsd"
            type="text"
            inputMode="numeric"
            placeholder="1.000.000"
            className="pl-12"
            value={ebitdaDisplay}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, '')
              const numValue = rawValue ? parseInt(rawValue, 10) : undefined
              updateField('ebitdaAnnualUsd', numValue)
              setEbitdaDisplay(numValue !== undefined ? formatCurrency(numValue) : '')
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Resultado operacional antes de juros, impostos, depreciação e amortização (opcional)
        </p>
      </div>

      {/* Objective */}
      <div className="space-y-2" ref={objectiveRef} tabIndex={-1}>
        <Label htmlFor="objective">Objetivo Principal *</Label>
        <Select
          value={formData.objective as string}
          onValueChange={(value) => updateField('objective', value)}
        >
          <SelectTrigger id="objective">
            <SelectValue placeholder="Selecione o objetivo" />
          </SelectTrigger>
          <SelectContent>
            {OBJECTIVES.map(obj => (
              <SelectItem
                key={obj.value}
                value={obj.value}
                className="cursor-pointer transition-colors hover:bg-primary/10"
              >
                {obj.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.objective && (
          <p className="text-xs text-destructive">{errors.objective}</p>
        )}
        {/* Show description input when "Other" is selected */}
        {formData.objective === 'other' && (
          <div className="mt-2">
            <Input
              id="objectiveOther"
              placeholder="Descreva seu objetivo"
              value={formData.objectiveOther as string || ''}
              onChange={(e) => updateField('objectiveOther', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  )

  const renderAdvisorForm = () => (
    <div className="space-y-6">
      {/* Advisor Type */}
      <div className="space-y-2" ref={advisorTypeRef} tabIndex={-1}>
        <Label htmlFor="advisorType">Tipo de Advisor *</Label>
        <Select
          value={formData.advisorType as string}
          onValueChange={(value) => updateField('advisorType', value)}
        >
          <SelectTrigger id="advisorType">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {ADVISOR_TYPES.map(type => (
              <SelectItem
                key={type.value}
                value={type.value}
                className="cursor-pointer transition-colors hover:bg-primary/10"
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.advisorType && (
          <p className="text-xs text-destructive">{errors.advisorType}</p>
        )}
        {/* Show description input when "Other" is selected */}
        {formData.advisorType === 'other' && (
          <div className="mt-2">
            <Input
              id="advisorTypeOther"
              placeholder="Descreva o tipo de advisor"
              value={formData.advisorTypeOther as string || ''}
              onChange={(e) => updateField('advisorTypeOther', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* CVM Registry */}
      <div className="space-y-2">
        <Label htmlFor="cvmRegistry">Registro CVM (opcional)</Label>
        <Input
          id="cvmRegistry"
          placeholder="Número do registro"
          value={formData.cvmRegistry as string || ''}
          onChange={(e) => updateField('cvmRegistry', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Se aplicável, informe o número de registro na CVM
        </p>
      </div>

      {/* Sector Specialization */}
      <div>
        <SectorMultiSelect
          selectedValues={selectedSectors}
          onChange={setSelectedSectors}
          label="Especialização Setorial"
          required
          disabled={isSaving}
          error={errors.sectors}
        />
      </div>

      {/* Preferred Side */}
      <div className="space-y-2" ref={preferredSideRef} tabIndex={-1}>
        <Label htmlFor="preferredSide">Lado Preferencial *</Label>
        <Select
          value={formData.preferredSide as string}
          onValueChange={(value) => updateField('preferredSide', value)}
        >
          <SelectTrigger id="preferredSide">
            <SelectValue placeholder="Selecione o lado" />
          </SelectTrigger>
          <SelectContent>
            {PREFERRED_SIDES.map(side => (
              <SelectItem
                key={side.value}
                value={side.value}
                className="cursor-pointer transition-colors hover:bg-primary/10"
              >
                {side.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.preferredSide && (
          <p className="text-xs text-destructive">{errors.preferredSide}</p>
        )}
      </div>
    </div>
  )

  const getTitle = () => {
    switch (profileType) {
      case 'investor':
        return 'Detalhes do Investidor'
      case 'asset':
        return 'Detalhes da Empresa'
      case 'advisor':
        return 'Detalhes do Advisor'
      default:
        return 'Detalhes do Perfil'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{getTitle()}</h2>
        <p className="text-muted-foreground">
          Preencha as informações específicas do seu perfil
        </p>
        <div className="mt-2">
          <AutoSaveIndicator status={autoSave.isSaving ? 'saving' : autoSave.lastSaved ? 'saved' : 'idle'} />
        </div>
      </div>

      {/* Form */}
      {renderForm()}

      {/* Submit Error */}
      {errors.submit && (
        <p className="text-sm text-destructive text-center">{errors.submit}</p>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" onClick={onBack} disabled={isSaving}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <>
              <Spinner size="sm" variant="white" className="mr-2" />
              Salvando...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default ProfileDetailsForm
