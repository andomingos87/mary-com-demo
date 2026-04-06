'use client'

import * as React from 'react'
import { Button, Input, Label } from '@/components/ui'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator'
import { FieldTooltip } from '@/components/shared/FieldTooltip'
import { autoSaveOnboardingFields } from '@/lib/actions/onboarding'
import { UsdCurrencyInput } from '@/components/shared/UsdCurrencyInput'
import { PercentInput } from '@/components/onboarding/components/PercentInput'
import { HeadquartersSelector, type HeadquartersValue } from '@/components/onboarding/components/HeadquartersSelector'
import type { AssetMatchingData } from '@/types/onboarding'
import { TOOLTIPS } from '@/lib/constants/tooltips'

interface AssetMatchingDataStepProps {
  organizationId?: string
  initialData?: Partial<AssetMatchingData>
  onSave: (data: AssetMatchingData) => void
  onBack: () => void
  onAutoSave?: (data: AssetMatchingData) => Promise<void>
}

const EMPTY_HEADQUARTERS: HeadquartersValue = { city: '', state: '', country: '' }

export function AssetMatchingDataStep({
  organizationId,
  initialData,
  onSave,
  onBack,
}: AssetMatchingDataStepProps) {
  const [rob12Months, setRob12Months] = React.useState<number | undefined>(initialData?.rob12Months)
  const [robDisplay, setRobDisplay] = React.useState('')
  const [ebitdaPercent, setEbitdaPercent] = React.useState<number | undefined>(initialData?.ebitdaPercent)
  const [employeeCount, setEmployeeCount] = React.useState<number | undefined>(initialData?.employeeCount)
  const [foundingYear, setFoundingYear] = React.useState<number | undefined>(initialData?.foundingYear)
  const [headquarters, setHeadquarters] = React.useState<HeadquartersValue>(
    initialData?.headquarters || EMPTY_HEADQUARTERS
  )
  const [equityOffered, setEquityOffered] = React.useState<number | undefined>(initialData?.equityOffered)
  const [targetValue, setTargetValue] = React.useState<number | undefined>(initialData?.targetValue)
  const [targetDisplay, setTargetDisplay] = React.useState('')
  const autoSave = useAutoSave({
    entityId: 'asset-matching-data-step',
    entityType: 'onboarding',
    onSave: async (_field, value) => {
      if (organizationId) {
        const result = await autoSaveOnboardingFields(organizationId, {
          assetMatchingData: value as Record<string, unknown>,
        })
        if (result.success) return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('mary_h06_asset_matching_data_draft', JSON.stringify(value))
      }
    },
  })

  const robField = autoSave.registerField('rob12Months')
  const ebitdaField = autoSave.registerField('ebitdaPercent')
  const employeesField = autoSave.registerField('employeeCount')
  const foundingYearField = autoSave.registerField('foundingYear')
  const headquartersField = autoSave.registerField('headquarters')
  const equityField = autoSave.registerField('equityOffered')
  const targetField = autoSave.registerField('targetValue')

  const draftPayload = React.useMemo<AssetMatchingData>(
    () => ({
      rob12Months: rob12Months || 0,
      ebitdaPercent: ebitdaPercent || 0,
      employeeCount: employeeCount || 0,
      foundingYear: foundingYear || 0,
      headquarters,
      equityOffered,
      targetValue,
    }),
    [ebitdaPercent, employeeCount, equityOffered, foundingYear, headquarters, rob12Months, targetValue]
  )

  const isValid =
    typeof rob12Months === 'number' &&
    typeof ebitdaPercent === 'number' &&
    typeof employeeCount === 'number' &&
    typeof foundingYear === 'number' &&
    headquarters.city.trim().length > 0 &&
    headquarters.state.trim().length > 0 &&
    headquarters.country.trim().length > 0

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Dados de Matching</h2>
      <AutoSaveIndicator status={autoSave.isSaving ? 'saving' : autoSave.lastSaved ? 'saved' : 'idle'} />
      <p className="rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
        Não se preocupe! Esses dados nunca são exibidos publicamente. Eles são usados exclusivamente pelo
        algoritmo de matching para encontrar investidores compatíveis.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <UsdCurrencyInput
          id="rob-12-months"
          label="ROB (últimos 12m)"
          value={robDisplay}
          onValueChange={(displayValue, numericValue) => {
            setRobDisplay(displayValue)
            setRob12Months(numericValue)
            robField.onChange({ ...draftPayload, rob12Months: numericValue || 0 })
          }}
          required
          tooltip={TOOLTIPS.onboarding.asset.ticket}
        />
        <AutoSaveIndicator status={robField.saveStatus} errorMessage={autoSave.getFieldError('rob12Months')} />
        <div className="space-y-2">
          <Label className="inline-flex items-center gap-1.5">
            EBITDA (%)
            <FieldTooltip label="EBITDA" text={TOOLTIPS.thesis.ebitdaPercentMin} />
          </Label>
          <PercentInput
            value={ebitdaPercent}
            onChange={(value) => {
              setEbitdaPercent(value)
              ebitdaField.onChange({ ...draftPayload, ebitdaPercent: value || 0 })
            }}
          />
          <AutoSaveIndicator status={ebitdaField.saveStatus} errorMessage={autoSave.getFieldError('ebitdaPercent')} />
        </div>

        <div className="space-y-2">
          <Label className="inline-flex items-center gap-1.5">
            Número de funcionários
            <FieldTooltip label="Número de funcionários" text={TOOLTIPS.onboarding.asset.readinessHighlights} />
          </Label>
          <Input
            type="number"
            value={employeeCount ?? ''}
            onChange={(event) => {
              const value = event.target.value ? Number(event.target.value) : undefined
              setEmployeeCount(value)
              employeesField.onChange({ ...draftPayload, employeeCount: value || 0 })
            }}
          />
          <AutoSaveIndicator status={employeesField.saveStatus} errorMessage={autoSave.getFieldError('employeeCount')} />
        </div>
        <div className="space-y-2">
          <Label className="inline-flex items-center gap-1.5">
            Ano de fundação
            <FieldTooltip label="Ano de fundação" text={TOOLTIPS.onboarding.asset.companyDescription} />
          </Label>
          <Input
            type="number"
            value={foundingYear ?? ''}
            onChange={(event) => {
              const value = event.target.value ? Number(event.target.value) : undefined
              setFoundingYear(value)
              foundingYearField.onChange({ ...draftPayload, foundingYear: value || 0 })
            }}
          />
          <AutoSaveIndicator status={foundingYearField.saveStatus} errorMessage={autoSave.getFieldError('foundingYear')} />
        </div>
      </div>

      <HeadquartersSelector
        value={headquarters}
        onChange={(value) => {
          setHeadquarters(value)
          headquartersField.onChange({ ...draftPayload, headquarters: value })
        }}
      />
      <AutoSaveIndicator status={headquartersField.saveStatus} errorMessage={autoSave.getFieldError('headquarters')} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="inline-flex items-center gap-1.5">
            Participação ofertada (%)
            <FieldTooltip label="Participação ofertada" text={TOOLTIPS.onboarding.asset.ticket} />
          </Label>
          <PercentInput
            value={equityOffered}
            onChange={(value) => {
              setEquityOffered(value)
              equityField.onChange({ ...draftPayload, equityOffered: value })
            }}
          />
          <AutoSaveIndicator status={equityField.saveStatus} errorMessage={autoSave.getFieldError('equityOffered')} />
        </div>
        <UsdCurrencyInput
          id="target-value"
          label="Valor alvo"
          value={targetDisplay}
          onValueChange={(displayValue, numericValue) => {
            setTargetDisplay(displayValue)
            setTargetValue(numericValue)
            targetField.onChange({ ...draftPayload, targetValue: numericValue })
          }}
          tooltip={TOOLTIPS.onboarding.asset.ticket}
        />
        <AutoSaveIndicator status={targetField.saveStatus} errorMessage={autoSave.getFieldError('targetValue')} />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button
          type="button"
          disabled={!isValid}
          onClick={() => onSave(draftPayload)}
        >
          Próximo passo
        </Button>
      </div>
    </div>
  )
}

export default AssetMatchingDataStep
