'use client'

import * as React from 'react'
import { Button, Input, Label, Textarea } from '@/components/ui'
import { Sparkles } from 'lucide-react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator'
import { FieldTooltip } from '@/components/shared/FieldTooltip'
import { autoSaveOnboardingFields } from '@/lib/actions/onboarding'
import { GeographySelector } from '@/components/onboarding/GeographySelector'
import { SectorMultiSelect } from '@/components/shared/SectorMultiSelect'
import { BusinessModelSelector, type BusinessModel } from '@/components/onboarding/components/BusinessModelSelector'
import {
  ProjectObjectiveSelector,
  type ProjectObjectiveValue,
} from '@/components/onboarding/components/ProjectObjectiveSelector'
import type { GeographySelection } from '@/types/geography'
import type { AssetCompanyData } from '@/types/onboarding'
import { TOOLTIPS } from '@/lib/constants/tooltips'

interface AssetCompanyDataStepProps {
  organizationId?: string
  initialData?: Partial<AssetCompanyData>
  onSave: (data: AssetCompanyData) => void
  onBack: () => void
  onAskMaryAi?: (context: string) => void
  onAutoSave?: (data: AssetCompanyData) => Promise<void>
}

const EMPTY_GEO: GeographySelection = {
  continents: [],
  countries: [],
  states: [],
}

export function AssetCompanyDataStep({
  organizationId,
  initialData,
  onSave,
  onBack,
  onAskMaryAi,
}: AssetCompanyDataStepProps) {
  const [companyDescription, setCompanyDescription] = React.useState(initialData?.companyDescription || '')
  const [responsibleName, setResponsibleName] = React.useState(initialData?.responsibleName || '')
  const [companyName, setCompanyName] = React.useState(initialData?.companyName || '')
  const [projectObjective, setProjectObjective] = React.useState<ProjectObjectiveValue>(
    initialData?.projectObjective || { type: 'investment', subReason: 'Expansão e Crescimento' }
  )
  const [businessModel, setBusinessModel] = React.useState<BusinessModel[]>(
    (initialData?.businessModel as BusinessModel[]) || []
  )
  const [sectors, setSectors] = React.useState<string[]>(initialData?.sectors || [])
  const [operatingRegions, setOperatingRegions] = React.useState<GeographySelection>({
    ...EMPTY_GEO,
    countries: initialData?.operatingRegions || [],
  })
  const autoSave = useAutoSave({
    entityId: 'asset-company-data-step',
    entityType: 'onboarding',
    onSave: async (_field, value) => {
      if (organizationId) {
        const result = await autoSaveOnboardingFields(organizationId, {
          assetCompanyData: value as Record<string, unknown>,
        })
        if (result.success) return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('mary_h06_asset_company_data_draft', JSON.stringify(value))
      }
    },
  })

  const responsibleField = autoSave.registerField('responsibleName')
  const companyNameField = autoSave.registerField('companyName')
  const companyDescriptionField = autoSave.registerField('companyDescription')
  const projectObjectiveField = autoSave.registerField('projectObjective')
  const businessModelField = autoSave.registerField('businessModel')
  const sectorsField = autoSave.registerField('sectors')
  const operatingRegionsField = autoSave.registerField('operatingRegions')

  const isValid = companyDescription.trim().length > 0 && businessModel.length > 0 && sectors.length > 0
  const canAskMaryAi = companyDescription.trim().length > 0 && projectObjective.subReason.trim().length > 0 && sectors.length > 0

  const maryAiContext = React.useMemo(
    () =>
      [
        'Quero apoio no Passo 1 do onboarding (Dados da Empresa).',
        `Nome da empresa: ${companyName || 'Nao informado'}.`,
        `Nome responsavel: ${responsibleName || 'Nao informado'}.`,
        `Descricao da empresa: ${companyDescription || 'Nao informada'}.`,
        `Objetivo do projeto: ${projectObjective.type} / ${projectObjective.subReason}.`,
        `Modelo de negocio: ${businessModel.join(', ') || 'Nao informado'}.`,
        `Setores: ${sectors.join(', ') || 'Nao informado'}.`,
        `Regioes de atuacao: ${operatingRegions.countries.join(', ') || 'Nao informado'}.`,
        'Sugira melhorias objetivas para deixar esse perfil mais atrativo para investidores.',
      ].join('\n'),
    [businessModel, companyDescription, companyName, operatingRegions.countries, projectObjective, responsibleName, sectors]
  )

  const draftPayload = React.useMemo<AssetCompanyData>(
    () => ({
      responsibleName,
      companyName,
      companyDescription,
      projectObjective,
      businessModel,
      sectors,
      operatingRegions: operatingRegions.countries,
    }),
    [businessModel, companyDescription, companyName, operatingRegions.countries, projectObjective, responsibleName, sectors]
  )

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Dados da Empresa</h2>
      <AutoSaveIndicator status={autoSave.isSaving ? 'saving' : autoSave.lastSaved ? 'saved' : 'idle'} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="inline-flex items-center gap-1.5">
            Nome responsável
            <FieldTooltip label="Nome responsável" text={TOOLTIPS.onboarding.asset.responsibleName} />
          </Label>
          <Input
            value={responsibleName}
            onChange={(event) => {
              const value = event.target.value
              setResponsibleName(value)
              responsibleField.onChange({ ...draftPayload, responsibleName: value })
            }}
          />
          <AutoSaveIndicator status={responsibleField.saveStatus} errorMessage={autoSave.getFieldError('responsibleName')} />
        </div>
        <div className="space-y-2">
          <Label className="inline-flex items-center gap-1.5">
            Nome da empresa
            <FieldTooltip label="Nome da empresa" text={TOOLTIPS.onboarding.asset.companyName} />
          </Label>
          <Input
            value={companyName}
            onChange={(event) => {
              const value = event.target.value
              setCompanyName(value)
              companyNameField.onChange({ ...draftPayload, companyName: value })
            }}
          />
          <AutoSaveIndicator status={companyNameField.saveStatus} errorMessage={autoSave.getFieldError('companyName')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="inline-flex items-center gap-1.5">
          Descrição da empresa
          <FieldTooltip label="Descrição da empresa" text={TOOLTIPS.onboarding.asset.companyDescription} />
        </Label>
        <Textarea
          value={companyDescription}
          onChange={(event) => {
            const value = event.target.value
            setCompanyDescription(value)
            companyDescriptionField.onChange({ ...draftPayload, companyDescription: value })
          }}
          placeholder="Descreva a empresa, momento atual e contexto do projeto"
          rows={5}
        />
        <AutoSaveIndicator
          status={companyDescriptionField.saveStatus}
          errorMessage={autoSave.getFieldError('companyDescription')}
        />
      </div>

      <ProjectObjectiveSelector
        value={projectObjective}
        onChange={(value) => {
          setProjectObjective(value)
          projectObjectiveField.onChange({ ...draftPayload, projectObjective: value })
        }}
      />
      <AutoSaveIndicator status={projectObjectiveField.saveStatus} errorMessage={autoSave.getFieldError('projectObjective')} />
      <BusinessModelSelector
        value={businessModel}
        onChange={(value) => {
          setBusinessModel(value)
          businessModelField.onChange({ ...draftPayload, businessModel: value })
        }}
      />
      <AutoSaveIndicator status={businessModelField.saveStatus} errorMessage={autoSave.getFieldError('businessModel')} />
      <SectorMultiSelect
        selectedValues={sectors}
        onChange={(value) => {
          setSectors(value)
          sectorsField.onChange({ ...draftPayload, sectors: value })
        }}
        label="Setor de atuação"
        required
        tooltip={TOOLTIPS.onboarding.asset.sectors}
      />
      <AutoSaveIndicator status={sectorsField.saveStatus} errorMessage={autoSave.getFieldError('sectors')} />
      <GeographySelector
        value={operatingRegions}
        onChange={(value) => {
          setOperatingRegions(value)
          operatingRegionsField.onChange({ ...draftPayload, operatingRegions: value.countries })
        }}
        className="rounded-lg border border-border p-3"
      />
      <AutoSaveIndicator
        status={operatingRegionsField.saveStatus}
        errorMessage={autoSave.getFieldError('operatingRegions')}
      />

      {onAskMaryAi && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Mary AI contextual</p>
            <p className="text-sm text-muted-foreground">
              Preencha descrição, objetivo e setor para receber sugestões com contexto do Passo 1.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!canAskMaryAi}
            onClick={() => onAskMaryAi(maryAiContext)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Pedir sugestão com Mary AI
          </Button>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button
          type="button"
          disabled={!isValid}
          onClick={() =>
            onSave(draftPayload)
          }
        >
          Próximo passo
        </Button>
      </div>
    </div>
  )
}

export default AssetCompanyDataStep
