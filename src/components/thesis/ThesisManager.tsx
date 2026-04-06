'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Target,
  Plus,
  Search,
  Pencil,
  CheckCircle2,
  Trash2,
  CircleHelp,
} from 'lucide-react'
import { activateThesis, createThesis, deleteThesis, listTheses, updateThesis } from '@/lib/actions/thesis'
import type { InvestmentThesis } from '@/types/database'
import type { ThesisCriteria } from '@/types/thesis'
import type { GeographySelection } from '@/types/geography'
import { GeographySelector } from '@/components/onboarding/GeographySelector'
import { SectorMultiSelect } from '@/components/shared/SectorMultiSelect'
import { MultiSelectDropdown } from '@/components/shared/MultiSelectDropdown'
import { UsdCurrencyInput } from '@/components/shared/UsdCurrencyInput'
import { PercentInput } from '@/components/onboarding/components/PercentInput'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { INVESTMENT_STAGE_OPTIONS } from '@/lib/constants/investment-stages'
import { THESIS_TOOLTIPS } from '@/lib/constants/tooltips-thesis'
import { formatCurrencyUSD } from '@/lib/format/currency'

interface ThesisManagerProps {
  organizationId: string
  readOnlyMode: boolean
  initialTheses: InvestmentThesis[]
}

interface ThesisFormState {
  name: string
  summary: string
  sectors: string[]
  targetAudience: string[]
  geography: GeographySelection
  robMinDisplay: string
  robMaxDisplay: string
  robMinValue?: number
  robMaxValue?: number
  ebitdaPercentMin?: number
  stage: string[]
  operationType: string[]
  exclusionCriteria: string
  additionalInfo: string
  ticketMinDisplay: string
  ticketMaxDisplay: string
  ticketMinValue?: number
  ticketMaxValue?: number
  setActive: boolean
}

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const CONTINENT_CODES = ['AF', 'AN', 'AS', 'EU', 'NA', 'OC', 'SA', 'GLOBAL']

const EMPTY_FORM: ThesisFormState = {
  name: '',
  summary: '',
  sectors: [],
  targetAudience: [],
  geography: { continents: [], countries: [], states: [] },
  robMinDisplay: '',
  robMaxDisplay: '',
  robMinValue: undefined,
  robMaxValue: undefined,
  ebitdaPercentMin: undefined,
  stage: [],
  operationType: [],
  exclusionCriteria: '',
  additionalInfo: '',
  ticketMinDisplay: '',
  ticketMaxDisplay: '',
  ticketMinValue: undefined,
  ticketMaxValue: undefined,
  setActive: false,
}

const TARGET_AUDIENCE_OPTIONS = [
  { value: 'b2b', label: 'B2B' },
  { value: 'b2c', label: 'B2C' },
  { value: 'b2b2c', label: 'B2B2C' },
  { value: 'b2g', label: 'B2G' },
]

const OPERATION_TYPE_OPTIONS = [
  { value: 'minority', label: 'Participacao minoritaria' },
  { value: 'majority', label: 'Participacao majoritaria' },
  { value: 'full_sale', label: 'Venda integral (100%)' },
  { value: 'buyout', label: 'Buyout' },
  { value: 'growth_equity', label: 'Growth equity' },
  { value: 'venture_capital', label: 'Venture capital' },
  { value: 'other', label: 'Outro' },
]

type ThesisStepId = 'define_thesis' | 'financial_geo' | 'refine_thesis'

const THESIS_STEPS: { id: ThesisStepId; title: string; description: string }[] = [
  { id: 'define_thesis', title: 'Defina sua tese', description: 'Nome, descricao, setores e publico-alvo' },
  { id: 'financial_geo', title: 'Criterios financeiros e geograficos', description: 'Regioes, ROB, EBITDA% e cheque' },
  { id: 'refine_thesis', title: 'Refine sua tese', description: 'Estagio, operacao e criterios adicionais' },
] as const

const STEP_TWO_PRIVACY_NOTE =
  'Nao se preocupe! Esses dados nunca sao exibidos publicamente. Apenas usuarios cadastrados na Mary, apos NDA assinado e autorizados, poderao visualizar os detalhes completos.'

function sortTheses(items: InvestmentThesis[]) {
  return [...items].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatCriteriaCount(criteria: unknown) {
  if (!criteria || typeof criteria !== 'object') {
    return 0
  }

  return Object.entries(criteria as Record<string, unknown>).filter(([, value]) => {
    if (value === null || value === undefined) return false
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim().length > 0
    return true
  }).length
}

function flattenGeographySelection(selection: GeographySelection): string[] {
  return [...selection.continents, ...selection.countries, ...selection.states]
}

function toGeographySelection(geoCodes: unknown): GeographySelection {
  if (!Array.isArray(geoCodes)) {
    return { continents: [], countries: [], states: [] }
  }

  const continents: string[] = []
  const countries: string[] = []
  const states: string[] = []

  geoCodes.forEach((code) => {
    if (typeof code !== 'string') return
    if (code.includes('-')) {
      states.push(code)
      return
    }
    if (CONTINENT_CODES.includes(code)) {
      continents.push(code)
      return
    }
    countries.push(code)
  })

  return { continents, countries, states }
}

function FieldLabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <Label className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground transition-smooth hover:text-foreground"
              aria-label={`Ajuda: ${label}`}
            >
              <CircleHelp className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Label>
  )
}

function buildCriteriaOrError(form: ThesisFormState): { data?: ThesisCriteria; error?: string } {
  const robMin = form.robMinValue ?? null
  const robMax = form.robMaxValue ?? null
  const ticketMin = form.ticketMinValue ?? null
  const ticketMax = form.ticketMaxValue ?? null

  if (robMin !== null && robMax !== null && robMin > robMax) {
    return { error: 'ROB minimo nao pode ser maior que ROB maximo.' }
  }

  if (
    ticketMin !== null &&
    ticketMax !== null &&
    ticketMin > ticketMax
  ) {
    return { error: 'Cheque minimo nao pode ser maior que cheque maximo.' }
  }

  return {
    data: {
      sectors: form.sectors,
      targetAudience: form.targetAudience,
      geo: flattenGeographySelection(form.geography),
      robMin,
      robMax,
      ebitdaPercentMin: form.ebitdaPercentMin ?? null,
      stage: form.stage,
      operationType: form.operationType,
      exclusionCriteria: form.exclusionCriteria.trim(),
      additionalInfo: form.additionalInfo.trim(),
      ticketMin,
      ticketMax,
    },
  }
}

function buildUpdatePayloadOrError(form: ThesisFormState): {
  payload?: { name: string; summary: string; criteria: ThesisCriteria }
  error?: string
} {
  const parsed = buildCriteriaOrError(form)
  if (parsed.error || !parsed.data) {
    return { error: parsed.error || 'Critérios inválidos.' }
  }

  return {
    payload: {
      name: form.name,
      summary: form.summary,
      criteria: parsed.data,
    },
  }
}

function criteriaToFormState(item: InvestmentThesis): ThesisFormState {
  const criteria = (item.criteria || {}) as ThesisCriteria
  const sectors = Array.isArray(criteria.sectors) ? criteria.sectors : []
  const targetAudience = Array.isArray(criteria.targetAudience) ? criteria.targetAudience : []
  const geography = toGeographySelection(criteria.geo)
  const stage = Array.isArray(criteria.stage) ? criteria.stage : []
  const operationType = Array.isArray(criteria.operationType) ? criteria.operationType : []
  const exclusionCriteria = typeof criteria.exclusionCriteria === 'string' ? criteria.exclusionCriteria : ''
  const additionalInfo = typeof criteria.additionalInfo === 'string' ? criteria.additionalInfo : ''
  const robMinValue = typeof criteria.robMin === 'number' ? criteria.robMin : undefined
  const robMaxValue = typeof criteria.robMax === 'number' ? criteria.robMax : undefined
  const ebitdaPercentMin = typeof criteria.ebitdaPercentMin === 'number' ? criteria.ebitdaPercentMin : undefined
  const ticketMinValue = typeof criteria.ticketMin === 'number' ? criteria.ticketMin : undefined
  const ticketMaxValue = typeof criteria.ticketMax === 'number' ? criteria.ticketMax : undefined

  return {
    name: item.name,
    summary: item.summary || '',
    sectors,
    targetAudience,
    geography,
    robMinDisplay: formatCurrencyUSD(robMinValue),
    robMaxDisplay: formatCurrencyUSD(robMaxValue),
    robMinValue,
    robMaxValue,
    ebitdaPercentMin,
    stage,
    operationType,
    exclusionCriteria,
    additionalInfo,
    ticketMinDisplay: formatCurrencyUSD(ticketMinValue),
    ticketMaxDisplay: formatCurrencyUSD(ticketMaxValue),
    ticketMinValue,
    ticketMaxValue,
    setActive: item.is_active,
  }
}

function getStepValidationError(step: number, form: ThesisFormState): string | null {
  if (step === 0) {
    if (!form.name.trim() || form.name.trim().length < 2) {
      return 'Informe um nome de tese com pelo menos 2 caracteres.'
    }
    if (form.sectors.length === 0) {
      return 'Selecione ao menos um setor.'
    }
    return null
  }

  if (step === 1) {
    const hasGeography =
      form.geography.continents.length > 0 ||
      form.geography.countries.length > 0 ||
      form.geography.states.length > 0

    if (!hasGeography) {
      return 'Selecione ao menos uma geografia.'
    }
    return null
  }

  if (step === 2) {
    if (form.stage.length === 0) {
      return 'Selecione ao menos um estagio de interesse.'
    }
    return null
  }

  return null
}

function getStepProgressLabel(step: number): string {
  return `${step + 1}/${THESIS_STEPS.length}`
}

export function ThesisManager({ organizationId, readOnlyMode, initialTheses }: ThesisManagerProps) {
  const [theses, setTheses] = useState<InvestmentThesis[]>(sortTheses(initialTheses))
  const [searchQuery, setSearchQuery] = useState('')
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [createStep, setCreateStep] = useState(0)
  const [editStep, setEditStep] = useState(0)
  const [createForm, setCreateForm] = useState<ThesisFormState>(EMPTY_FORM)
  const [editForm, setEditForm] = useState<ThesisFormState>(EMPTY_FORM)
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle')
  const [autoSaveMessage, setAutoSaveMessage] = useState<string | null>(null)
  const [editingThesis, setEditingThesis] = useState<InvestmentThesis | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedPayloadRef = useRef<string | null>(null)

  const filteredTheses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return theses
    return theses.filter((item) => {
      return item.name.toLowerCase().includes(query) || (item.summary || '').toLowerCase().includes(query)
    })
  }, [theses, searchQuery])

  const refreshTheses = () =>
    startTransition(async () => {
      const result = await listTheses(organizationId)
      if (!result.success || !result.data) {
        setGlobalError(result.error || 'Erro ao atualizar lista de teses.')
        return
      }
      setGlobalError(null)
      setTheses(sortTheses(result.data))
    })

  const handleCreate = () =>
    startTransition(async () => {
      setGlobalError(null)
      const parsed = buildCriteriaOrError(createForm)
      if (parsed.error || !parsed.data) {
        setGlobalError(parsed.error || 'Critérios inválidos.')
        return
      }

      const result = await createThesis(
        {
          organizationId,
          name: createForm.name,
          summary: createForm.summary,
          criteria: parsed.data,
        },
        { setActive: createForm.setActive }
      )

      if (!result.success) {
        setGlobalError(result.error || 'Erro ao criar tese.')
        return
      }

      setCreateOpen(false)
      setCreateStep(0)
      setCreateForm(EMPTY_FORM)
      refreshTheses()
    })

  const openEditDialog = (item: InvestmentThesis) => {
    const initialForm = criteriaToFormState(item)
    const initialPayloadResult = buildUpdatePayloadOrError(initialForm)

    setEditingThesis(item)
    setEditForm(initialForm)
    setEditStep(0)
    setAutoSaveStatus('idle')
    setAutoSaveMessage(null)
    lastSavedPayloadRef.current = initialPayloadResult.payload
      ? JSON.stringify(initialPayloadResult.payload)
      : null
    setEditOpen(true)
  }

  const goToNextCreateStep = () => {
    const error = getStepValidationError(createStep, createForm)
    if (error) {
      setGlobalError(error)
      return
    }
    setGlobalError(null)
    setCreateStep((prev) => Math.min(prev + 1, THESIS_STEPS.length - 1))
  }

  const goToNextEditStep = () => {
    const error = getStepValidationError(editStep, editForm)
    if (error) {
      setGlobalError(error)
      return
    }
    setGlobalError(null)
    setEditStep((prev) => Math.min(prev + 1, THESIS_STEPS.length - 1))
  }

  const handleCreateDialogChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) {
      setCreateStep(0)
      setCreateForm(EMPTY_FORM)
      setGlobalError(null)
    }
  }

  const handleEditDialogChange = (open: boolean) => {
    setEditOpen(open)
    if (!open) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
      setEditStep(0)
      setEditingThesis(null)
      setAutoSaveStatus('idle')
      setAutoSaveMessage(null)
      lastSavedPayloadRef.current = null
      setGlobalError(null)
    }
  }

  useEffect(() => {
    if (!editOpen || !editingThesis || readOnlyMode) {
      return
    }

    const payloadResult = buildUpdatePayloadOrError(editForm)
    if (payloadResult.error || !payloadResult.payload) {
      setAutoSaveStatus('error')
      setAutoSaveMessage(payloadResult.error || 'Erro ao preparar auto-save.')
      return
    }

    const nextPayloadSerialized = JSON.stringify(payloadResult.payload)
    if (lastSavedPayloadRef.current === nextPayloadSerialized) {
      return
    }

    setAutoSaveStatus('saving')
    setAutoSaveMessage('Salvando alterações automaticamente...')

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      const saveWithRetry = async (attempt = 0): Promise<Awaited<ReturnType<typeof updateThesis>>> => {
        const result = await updateThesis(editingThesis.id, payloadResult.payload as {
          name: string
          summary: string
          criteria: ThesisCriteria
        })
        if (result.success || attempt > 0) {
          return result
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
        return saveWithRetry(attempt + 1)
      }

      const result = await saveWithRetry()
      if (result.success) {
        lastSavedPayloadRef.current = nextPayloadSerialized
        setAutoSaveStatus('saved')
        setAutoSaveMessage('Alterações salvas automaticamente.')
        return
      }

      setAutoSaveStatus('error')
      setAutoSaveMessage(result.error || 'Falha no auto-save. Revise os campos e tente novamente.')
    }, 900)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
    }
  }, [editOpen, editForm, editingThesis, readOnlyMode])

  const renderStepHeader = (step: number) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Etapa {getStepProgressLabel(step)} - {THESIS_STEPS[step].description}
        </p>
      </div>
      <StepIndicator
        steps={THESIS_STEPS.map((item) => ({ id: item.id, label: item.title }))}
        currentStep={THESIS_STEPS[step].id}
        completedSteps={THESIS_STEPS.filter((_, index) => index < step).map((item) => item.id)}
      />
    </div>
  )

  const renderCreateStepContent = () => {
    if (createStep === 0) {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <FieldLabelWithTooltip label="Nome da tese" tooltip={THESIS_TOOLTIPS.name} />
            <Input
              placeholder="Nome da tese"
              value={createForm.name}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <FieldLabelWithTooltip label="Descricao da tese" tooltip={THESIS_TOOLTIPS.summary} />
            <Textarea
              placeholder="Resumo da tese"
              value={createForm.summary}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, summary: event.target.value }))}
            />
          </div>
          <SectorMultiSelect
            label="Setores de interesse"
            selectedValues={createForm.sectors}
            onChange={(values) => setCreateForm((prev) => ({ ...prev, sectors: values }))}
            disabled={isPending}
            tooltip={THESIS_TOOLTIPS.sectors}
          />
          <MultiSelectDropdown
            label="Publico-alvo da empresa-alvo"
            options={TARGET_AUDIENCE_OPTIONS}
            values={createForm.targetAudience}
            onChange={(values) => setCreateForm((prev) => ({ ...prev, targetAudience: values }))}
            placeholder="Selecione o publico-alvo"
            disabled={isPending}
            tooltip={THESIS_TOOLTIPS.targetAudience}
          />
        </div>
      )
    }

    if (createStep === 1) {
      return (
        <div className="space-y-4">
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {STEP_TWO_PRIVACY_NOTE}
          </p>
          <div className="space-y-2">
            <FieldLabelWithTooltip label="Regioes prioritarias" tooltip={THESIS_TOOLTIPS.geo} />
            <GeographySelector
              value={createForm.geography}
              onChange={(value) => setCreateForm((prev) => ({ ...prev, geography: value }))}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UsdCurrencyInput
              id="thesis-create-rob-min"
              label="ROB minimo"
              value={createForm.robMinDisplay}
              placeholder="1,000,000"
              disabled={isPending}
              tooltip={THESIS_TOOLTIPS.robMin}
              onValueChange={(displayValue, numericValue) =>
                setCreateForm((prev) => ({
                  ...prev,
                  robMinDisplay: displayValue,
                  robMinValue: numericValue,
                }))
              }
            />
            <UsdCurrencyInput
              id="thesis-create-rob-max"
              label="ROB maximo"
              value={createForm.robMaxDisplay}
              placeholder="50,000,000"
              disabled={isPending}
              tooltip={THESIS_TOOLTIPS.robMax}
              onValueChange={(displayValue, numericValue) =>
                setCreateForm((prev) => ({
                  ...prev,
                  robMaxDisplay: displayValue,
                  robMaxValue: numericValue,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <FieldLabelWithTooltip label="EBITDA % minimo" tooltip={THESIS_TOOLTIPS.ebitdaPercentMin} />
            <PercentInput
              value={createForm.ebitdaPercentMin}
              onChange={(value) => setCreateForm((prev) => ({ ...prev, ebitdaPercentMin: value }))}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UsdCurrencyInput
              id="thesis-create-ticket-min"
              label="Cheque minimo"
              value={createForm.ticketMinDisplay}
              placeholder="100,000"
              disabled={isPending}
              tooltip={THESIS_TOOLTIPS.ticketMin}
              onValueChange={(displayValue, numericValue) =>
                setCreateForm((prev) => ({
                  ...prev,
                  ticketMinDisplay: displayValue,
                  ticketMinValue: numericValue,
                }))
              }
            />
            <UsdCurrencyInput
              id="thesis-create-ticket-max"
              label="Cheque maximo"
              value={createForm.ticketMaxDisplay}
              placeholder="5,000,000"
              disabled={isPending}
              tooltip={THESIS_TOOLTIPS.ticketMax}
              onValueChange={(displayValue, numericValue) =>
                setCreateForm((prev) => ({
                  ...prev,
                  ticketMaxDisplay: displayValue,
                  ticketMaxValue: numericValue,
                }))
              }
            />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <MultiSelectDropdown
          label="Estagio da empresa-alvo"
          options={INVESTMENT_STAGE_OPTIONS}
          values={createForm.stage}
          onChange={(values) => setCreateForm((prev) => ({ ...prev, stage: values }))}
          placeholder="Selecione os estagios"
          disabled={isPending}
          tooltip={THESIS_TOOLTIPS.stage}
        />
        <MultiSelectDropdown
          label="Tipo de operacao preferida"
          options={OPERATION_TYPE_OPTIONS}
          values={createForm.operationType}
          onChange={(values) => setCreateForm((prev) => ({ ...prev, operationType: values }))}
          placeholder="Selecione os tipos de operacao"
          disabled={isPending}
          tooltip={THESIS_TOOLTIPS.operationType}
        />
        <div className="space-y-2">
          <FieldLabelWithTooltip label="Criterios de exclusao" tooltip={THESIS_TOOLTIPS.exclusionCriteria} />
          <Textarea
            placeholder="Descreva criterios de exclusao"
            value={createForm.exclusionCriteria}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, exclusionCriteria: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <FieldLabelWithTooltip label="Informacoes adicionais" tooltip={THESIS_TOOLTIPS.additionalInfo} />
          <Textarea
            placeholder="Informacoes adicionais para orientar o matching"
            value={createForm.additionalInfo}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, additionalInfo: event.target.value }))
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={createForm.setActive}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, setActive: event.target.checked }))
            }
          />
          Definir como tese ativa apos criar
        </label>
      </div>
    )
  }

  const renderEditStepContent = () => {
    if (editStep === 0) {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <FieldLabelWithTooltip label="Nome da tese" tooltip={THESIS_TOOLTIPS.name} />
            <Input
              placeholder="Nome da tese"
              value={editForm.name}
              onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <FieldLabelWithTooltip label="Descricao da tese" tooltip={THESIS_TOOLTIPS.summary} />
            <Textarea
              placeholder="Resumo da tese"
              value={editForm.summary}
              onChange={(event) => setEditForm((prev) => ({ ...prev, summary: event.target.value }))}
            />
          </div>
          <SectorMultiSelect
            label="Setores de interesse"
            selectedValues={editForm.sectors}
            onChange={(values) => setEditForm((prev) => ({ ...prev, sectors: values }))}
            disabled={isPending}
            tooltip={THESIS_TOOLTIPS.sectors}
          />
          <MultiSelectDropdown
            label="Publico-alvo da empresa-alvo"
            options={TARGET_AUDIENCE_OPTIONS}
            values={editForm.targetAudience}
            onChange={(values) => setEditForm((prev) => ({ ...prev, targetAudience: values }))}
            placeholder="Selecione o publico-alvo"
            disabled={isPending}
            tooltip={THESIS_TOOLTIPS.targetAudience}
          />
        </div>
      )
    }

    if (editStep === 1) {
      return (
        <div className="space-y-4">
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {STEP_TWO_PRIVACY_NOTE}
          </p>
          <div className="space-y-2">
            <FieldLabelWithTooltip label="Regioes prioritarias" tooltip={THESIS_TOOLTIPS.geo} />
            <GeographySelector
              value={editForm.geography}
              onChange={(value) => setEditForm((prev) => ({ ...prev, geography: value }))}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UsdCurrencyInput
              id="thesis-edit-rob-min"
              label="ROB minimo"
              value={editForm.robMinDisplay}
              placeholder="1,000,000"
              disabled={isPending}
              tooltip={THESIS_TOOLTIPS.robMin}
              onValueChange={(displayValue, numericValue) =>
                setEditForm((prev) => ({
                  ...prev,
                  robMinDisplay: displayValue,
                  robMinValue: numericValue,
                }))
              }
            />
            <UsdCurrencyInput
              id="thesis-edit-rob-max"
              label="ROB maximo"
              value={editForm.robMaxDisplay}
              placeholder="50,000,000"
              disabled={isPending}
              tooltip={THESIS_TOOLTIPS.robMax}
              onValueChange={(displayValue, numericValue) =>
                setEditForm((prev) => ({
                  ...prev,
                  robMaxDisplay: displayValue,
                  robMaxValue: numericValue,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <FieldLabelWithTooltip label="EBITDA % minimo" tooltip={THESIS_TOOLTIPS.ebitdaPercentMin} />
            <PercentInput
              value={editForm.ebitdaPercentMin}
              onChange={(value) => setEditForm((prev) => ({ ...prev, ebitdaPercentMin: value }))}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UsdCurrencyInput
              id="thesis-edit-ticket-min"
              label="Cheque minimo"
              value={editForm.ticketMinDisplay}
              placeholder="100,000"
              disabled={isPending}
              tooltip={THESIS_TOOLTIPS.ticketMin}
              onValueChange={(displayValue, numericValue) =>
                setEditForm((prev) => ({
                  ...prev,
                  ticketMinDisplay: displayValue,
                  ticketMinValue: numericValue,
                }))
              }
            />
            <UsdCurrencyInput
              id="thesis-edit-ticket-max"
              label="Cheque maximo"
              value={editForm.ticketMaxDisplay}
              placeholder="5,000,000"
              disabled={isPending}
              tooltip={THESIS_TOOLTIPS.ticketMax}
              onValueChange={(displayValue, numericValue) =>
                setEditForm((prev) => ({
                  ...prev,
                  ticketMaxDisplay: displayValue,
                  ticketMaxValue: numericValue,
                }))
              }
            />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <MultiSelectDropdown
          label="Estagio da empresa-alvo"
          options={INVESTMENT_STAGE_OPTIONS}
          values={editForm.stage}
          onChange={(values) => setEditForm((prev) => ({ ...prev, stage: values }))}
          placeholder="Selecione os estagios"
          disabled={isPending}
          tooltip={THESIS_TOOLTIPS.stage}
        />
        <MultiSelectDropdown
          label="Tipo de operacao preferida"
          options={OPERATION_TYPE_OPTIONS}
          values={editForm.operationType}
          onChange={(values) => setEditForm((prev) => ({ ...prev, operationType: values }))}
          placeholder="Selecione os tipos de operacao"
          disabled={isPending}
          tooltip={THESIS_TOOLTIPS.operationType}
        />
        <div className="space-y-2">
          <FieldLabelWithTooltip label="Criterios de exclusao" tooltip={THESIS_TOOLTIPS.exclusionCriteria} />
          <Textarea
            placeholder="Descreva criterios de exclusao"
            value={editForm.exclusionCriteria}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, exclusionCriteria: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <FieldLabelWithTooltip label="Informacoes adicionais" tooltip={THESIS_TOOLTIPS.additionalInfo} />
          <Textarea
            placeholder="Informacoes adicionais para orientar o matching"
            value={editForm.additionalInfo}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, additionalInfo: event.target.value }))
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={editForm.setActive}
            onChange={(event) => setEditForm((prev) => ({ ...prev, setActive: event.target.checked }))}
          />
          Marcar como tese ativa
        </label>
      </div>
    )
  }

  const handleEdit = () =>
    startTransition(async () => {
      if (!editingThesis) return

      setGlobalError(null)
      const parsed = buildCriteriaOrError(editForm)
      if (parsed.error || !parsed.data) {
        setGlobalError(parsed.error || 'Critérios inválidos.')
        return
      }

      const updateResult = await updateThesis(editingThesis.id, {
        name: editForm.name,
        summary: editForm.summary,
        criteria: parsed.data,
      })

      if (!updateResult.success) {
        setGlobalError(updateResult.error || 'Erro ao editar tese.')
        return
      }

      if (editForm.setActive && !editingThesis.is_active) {
        const activateResult = await activateThesis(editingThesis.id)
        if (!activateResult.success) {
          setGlobalError(activateResult.error || 'Erro ao ativar tese após edição.')
          return
        }
      }

      setEditOpen(false)
      setEditStep(0)
      setEditingThesis(null)
      refreshTheses()
    })

  const handleActivate = (id: string) =>
    startTransition(async () => {
      setGlobalError(null)
      const result = await activateThesis(id)
      if (!result.success) {
        setGlobalError(result.error || 'Erro ao ativar tese.')
        return
      }
      refreshTheses()
    })

  const handleDelete = (id: string) =>
    startTransition(async () => {
      setGlobalError(null)
      const result = await deleteThesis(id)
      if (!result.success) {
        setGlobalError(result.error || 'Erro ao remover tese.')
        return
      }
      refreshTheses()
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar teses..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={readOnlyMode || isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tese
        </Button>
      </div>

      {readOnlyMode && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            Sua conta está em análise. Você pode visualizar suas teses, mas não pode criar, editar ou ativar até a verificação.
          </CardContent>
        </Card>
      )}

      {globalError && (
        <Card className="border-destructive/40">
          <CardContent className="py-3 text-sm text-destructive">{globalError}</CardContent>
        </Card>
      )}

      {filteredTheses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTheses.map((thesis) => (
            <Card key={thesis.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{thesis.name}</CardTitle>
                    <CardDescription>
                      Atualizada em {formatDate(thesis.updated_at)}
                    </CardDescription>
                  </div>
                  {thesis.is_active ? <Badge>Ativa</Badge> : <Badge variant="outline">Inativa</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-10">
                  {thesis.summary || 'Sem resumo cadastrado.'}
                </p>
                <div className="text-xs text-muted-foreground">
                  Critérios preenchidos: {formatCriteriaCount(thesis.criteria)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!thesis.is_active && (
                    <Button
                      size="sm"
                      onClick={() => handleActivate(thesis.id)}
                      disabled={readOnlyMode || isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Ativar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(thesis)}
                    disabled={readOnlyMode || isPending}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(thesis.id)}
                    disabled={readOnlyMode || isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTheses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'Nenhuma tese encontrada' : 'Nenhuma tese criada'}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {searchQuery
                ? 'Tente ajustar o termo de busca.'
                : 'Crie sua primeira tese de investimento para começar a receber oportunidades aderentes ao seu perfil.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateOpen(true)} disabled={readOnlyMode || isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Tese
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="w-[96vw] max-w-4xl p-0 max-h-[92vh] overflow-hidden">
          <div className="flex h-full max-h-[92vh] flex-col">
            <DialogHeader className="px-4 sm:px-6 pt-6 pb-4 border-b gap-2">
              <DialogTitle>Nova Tese</DialogTitle>
              <DialogDescription>
                Defina sua tese em 3 etapas para orientar o Radar sem perder contexto.
              </DialogDescription>
              {renderStepHeader(createStep)}
            </DialogHeader>

            <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
              {renderCreateStepContent()}
            </ScrollArea>

            <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-background">
              <div className="w-full flex items-center justify-between gap-2">
                <Button variant="outline" onClick={() => handleCreateDialogChange(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <div className="flex items-center gap-2">
                  {createStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCreateStep((prev) => Math.max(prev - 1, 0))}
                      disabled={isPending}
                    >
                      Voltar
                    </Button>
                  )}
                  {createStep < THESIS_STEPS.length - 1 ? (
                    <Button onClick={goToNextCreateStep} disabled={isPending || readOnlyMode}>
                      Proximo
                    </Button>
                  ) : (
                    <Button onClick={handleCreate} disabled={isPending || readOnlyMode}>
                      Concluir tese
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="w-[96vw] max-w-4xl p-0 max-h-[92vh] overflow-hidden">
          <div className="flex h-full max-h-[92vh] flex-col">
            <DialogHeader className="px-4 sm:px-6 pt-6 pb-4 border-b gap-2">
              <DialogTitle>Editar Tese</DialogTitle>
              <DialogDescription>
                Atualize sua tese em 3 etapas e mantenha os dados preenchidos ao navegar.
              </DialogDescription>
              {renderStepHeader(editStep)}
              <p
                className={`text-xs ${
                  autoSaveStatus === 'error'
                    ? 'text-destructive'
                    : autoSaveStatus === 'saved'
                      ? 'text-success'
                      : 'text-muted-foreground'
                }`}
              >
                {autoSaveMessage || 'Auto-save inativo.'}
              </p>
            </DialogHeader>

            <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
              {renderEditStepContent()}
            </ScrollArea>

            <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-background">
              <div className="w-full flex items-center justify-between gap-2">
                <Button variant="outline" onClick={() => handleEditDialogChange(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <div className="flex items-center gap-2">
                  {editStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setEditStep((prev) => Math.max(prev - 1, 0))}
                      disabled={isPending}
                    >
                      Voltar
                    </Button>
                  )}
                  {editStep < THESIS_STEPS.length - 1 ? (
                    <Button onClick={goToNextEditStep} disabled={isPending || readOnlyMode}>
                      Proximo
                    </Button>
                  ) : (
                    <Button onClick={handleEdit} disabled={isPending || readOnlyMode}>
                      Aplicar alteracoes
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
