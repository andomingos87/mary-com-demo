'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  TrendingUp,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit2,
  X,
  User,
  Plus,
  Trash2,
  Mail,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  autoSaveProjectFields,
  changeProjectStatus,
  getProjectByCodename,
  updateProject,
} from '@/lib/actions/projects'
import { formatPhoneInput } from '@/lib/utils/phone'
import { isValidEmailFormat } from '@/lib/validation/email'
import { ReadinessIndicator } from '@/components/projects/ReadinessIndicator'
import { TaxonomySelector } from '@/components/projects/TaxonomySelector'
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator'
import { useAutoSave } from '@/hooks/useAutoSave'
import type { ProjectWithDetails, TaxonomySelection, UpdateProjectInput, ProjectContact } from '@/types/projects'
import type { ProjectObjective, ProjectStatus } from '@/types/database'
import { PROJECT_OBJECTIVE_LABELS, PROJECT_STATUS_LABELS } from '@/types/database'
import { formatCurrencyUSD, formatWithSymbol } from '@/lib/format/currency'
import {
  ALLOWED_STATUS_TRANSITIONS,
  PIPELINE_EXIT_STATUSES,
  PIPELINE_PHASE_ORDER,
  isRollbackTransition,
} from '@/lib/projects/status-flow'

const ALL_PROJECT_STATUSES: ProjectStatus[] = [...PIPELINE_PHASE_ORDER, ...PIPELINE_EXIT_STATUSES]

// ============================================
// Project Overview Page
// ============================================

export default function ProjectOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string
  const codename = params.codename as string

  // State
  const [project, setProject] = useState<ProjectWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Form state
  const [formData, setFormData] = useState<UpdateProjectInput>({})
  const [taxonomyValue, setTaxonomyValue] = useState<TaxonomySelection>({})

  // Contacts state
  const [contacts, setContacts] = useState<ProjectContact[]>([])
  const [editingContacts, setEditingContacts] = useState(false)
  const [savingContacts, setSavingContacts] = useState(false)
  const [contactEmailErrors, setContactEmailErrors] = useState<Record<number, string>>({})
  const [statusTarget, setStatusTarget] = useState<ProjectStatus | null>(null)
  const [statusReasonCode, setStatusReasonCode] = useState('')
  const [statusReasonText, setStatusReasonText] = useState('')
  const [statusChanging, setStatusChanging] = useState(false)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)
  const autoSave = useAutoSave({
    entityId: project?.id ?? codename,
    entityType: 'project',
    onSave: async (_field, value) => {
      if (!project) return
      const result = await autoSaveProjectFields(project.id, value as UpdateProjectInput)
      if (!result.success) {
        setError(result.error || 'Falha no auto-save do projeto')
      }
    },
  })
  const basicsAutoSaveField = autoSave.registerField('basics')
  const contactsAutoSaveField = autoSave.registerField('contacts')
  const basicsAutoSaveStatus = autoSave.getFieldStatus('basics')
  const contactsAutoSaveStatus = autoSave.getFieldStatus('contacts')

  const parseUsdInput = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits ? Number(digits) : undefined
  }

  const getSafePercentage = (value: unknown): number => {
    if (typeof value !== 'number' || Number.isNaN(value)) return 0
    if (value < 0) return 0
    if (value > 100) return 100
    return value
  }

  // Load project
  useEffect(() => {
    async function loadProject() {
      setLoading(true)
      setError(null)

      const result = await getProjectByCodename(orgSlug, codename)

      if (result.success && result.data) {
        setProject(result.data)
        setFormData({
          description: result.data.description || '',
          valueMinUsd: (result.data as any).value_min_usd || undefined,
          valueMaxUsd: (result.data as any).value_max_usd || undefined,
          equityMinPct: (result.data as any).equity_min_pct || undefined,
          equityMaxPct: (result.data as any).equity_max_pct || undefined,
          reason: (result.data as any).reason || undefined,
          ebitdaAnnualUsd: result.data.ebitda_annual_usd || undefined,
          revenueAnnualUsd: result.data.revenue_annual_usd || undefined,
        })
        setTaxonomyValue({
          l1: result.data.sector_l1 || undefined,
          l2: result.data.sector_l2 || undefined,
          l3: result.data.sector_l3 || undefined,
        })
        setContacts((result.data.contacts as unknown as ProjectContact[]) || [])
      } else {
        setError(result.error || 'Erro ao carregar projeto')
      }

      setLoading(false)
    }

    if (orgSlug && codename) {
      loadProject()
    }
  }, [orgSlug, codename])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!project) return

    setSaving(true)
    setSaveSuccess(false)
    setError(null)

    const updateData: UpdateProjectInput = {
      ...formData,
      sectorL1: taxonomyValue.l1,
      sectorL2: taxonomyValue.l2,
      sectorL3: taxonomyValue.l3,
    }

    const result = await updateProject(project.id, updateData)

    if (result.success && result.data) {
      // Reload project to get updated data
      const reloadResult = await getProjectByCodename(orgSlug, codename)
      if (reloadResult.success && reloadResult.data) {
        setProject(reloadResult.data)
      }
      setSaveSuccess(true)
      setEditMode(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setError(result.error || 'Erro ao salvar projeto')
    }

    setSaving(false)
  }, [project, formData, taxonomyValue, orgSlug, codename])

  // Cancel edit
  const handleCancel = useCallback(() => {
    if (project) {
      setFormData({
        description: project.description || '',
        valueMinUsd: (project as any).value_min_usd || undefined,
        valueMaxUsd: (project as any).value_max_usd || undefined,
        equityMinPct: (project as any).equity_min_pct || undefined,
        equityMaxPct: (project as any).equity_max_pct || undefined,
        reason: (project as any).reason || undefined,
        ebitdaAnnualUsd: project.ebitda_annual_usd || undefined,
        revenueAnnualUsd: project.revenue_annual_usd || undefined,
      })
      setTaxonomyValue({
        l1: project.sector_l1 || undefined,
        l2: project.sector_l2 || undefined,
        l3: project.sector_l3 || undefined,
      })
    }
    setEditMode(false)
    setError(null)
  }, [project])

  // Handle contacts save
  const handleSaveContacts = useCallback(async () => {
    if (!project) return

    // Validate email format
    const emailErrs: Record<number, string> = {}
    contacts.forEach((c, i) => {
      if (c.email.trim() && !isValidEmailFormat(c.email.trim())) {
        emailErrs[i] = 'Formato de email inválido'
      }
    })
    setContactEmailErrors(emailErrs)
    if (Object.keys(emailErrs).length > 0) {
      setError('Corrija os emails inválidos antes de continuar')
      return
    }

    setSavingContacts(true)
    setError(null)

    const result = await updateProject(project.id, { contacts })
    if (result.success) {
      const reloadResult = await getProjectByCodename(orgSlug, codename)
      if (reloadResult.success && reloadResult.data) {
        setProject(reloadResult.data)
        setContacts((reloadResult.data.contacts as unknown as ProjectContact[]) || [])
      }
      setEditingContacts(false)
    } else {
      setError(result.error || 'Erro ao salvar responsáveis')
    }
    setSavingContacts(false)
  }, [project, contacts, orgSlug, codename])

  const handleCancelContacts = useCallback(() => {
    if (project) {
      setContacts((project.contacts as unknown as ProjectContact[]) || [])
    }
    setEditingContacts(false)
  }, [project])

  useEffect(() => {
    if (!project || !editMode) return
    basicsAutoSaveField.onChange({
      ...formData,
      sectorL1: taxonomyValue.l1,
      sectorL2: taxonomyValue.l2,
      sectorL3: taxonomyValue.l3,
    })
  }, [project, editMode, formData, taxonomyValue, basicsAutoSaveField])

  useEffect(() => {
    if (!project || !editingContacts) return
    contactsAutoSaveField.onChange({ contacts })
  }, [project, editingContacts, contacts, contactsAutoSaveField])

  const handleChangeStatus = useCallback(async () => {
    if (!project || !statusTarget || statusTarget === project.status) return

    const rollback = isRollbackTransition(project.status, statusTarget)
    if (rollback && (!statusReasonCode.trim() || !statusReasonText.trim())) {
      setError('Rollback exige código e descrição do motivo')
      return
    }

    setStatusChanging(true)
    setStatusFeedback(null)
    setError(null)

    const result = await changeProjectStatus(project.id, statusTarget, rollback
      ? { reasonCode: statusReasonCode.trim(), reasonText: statusReasonText.trim() }
      : undefined)

    if (result.success) {
      const reloadResult = await getProjectByCodename(orgSlug, codename)
      if (reloadResult.success && reloadResult.data) {
        setProject(reloadResult.data)
      }
      setStatusFeedback(`Status alterado para ${PROJECT_STATUS_LABELS[statusTarget]}`)
      setStatusReasonCode('')
      setStatusReasonText('')
    } else {
      setError(result.error || 'Erro ao alterar status')
    }

    setStatusChanging(false)
  }, [project, statusTarget, statusReasonCode, statusReasonText, orgSlug, codename])

  const addContact = () => {
    setContacts([...contacts, { name: '', role: '', email: '', phone: '' }])
  }

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index))
  }

  const updateContact = (index: number, field: keyof ProjectContact, value: string) => {
    const updated = [...contacts]
    updated[index] = { ...updated[index], [field]: value }
    setContacts(updated)
  }

  // Loading state
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[300px]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[250px]" />
        </div>
      </div>
    )
  }

  // Error state
  if (error && !project) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!project) return null

  const readinessScore = getSafePercentage(project.readiness_score)
  const readinessCoverage = getSafePercentage(project.readinessResult?.l2PlusCoverage)
  const readinessChecklist = Array.isArray(project.readinessResult?.checklist)
    ? project.readinessResult?.checklist
    : []
  const hasReadinessDetails = Boolean(project.readinessResult)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        {/* Success/Error Messages */}
        {saveSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Projeto atualizado com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informacoes Basicas</CardTitle>
              <CardDescription>
                Dados principais do projeto
              </CardDescription>
            </div>
            {!editMode ? (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <AutoSaveIndicator status={basicsAutoSaveStatus} />
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Aplicar alteracoes
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objective */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Objetivo</Label>
                <p className="font-medium">{PROJECT_OBJECTIVE_LABELS[project.objective]}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="font-medium">{PROJECT_STATUS_LABELS[project.status]}</p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              {editMode ? (
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o projeto e seus objetivos..."
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {project.description || 'Nenhuma descricao adicionada.'}
                </p>
              )}
            </div>

            <Separator />

            {/* Taxonomy */}
            <div className="space-y-2">
              <Label>Setor (Taxonomia MAICS)</Label>
              {editMode ? (
                <TaxonomySelector
                  value={taxonomyValue}
                  onChange={setTaxonomyValue}
                />
              ) : (
                <p className="text-sm">
                  {project.taxonomyL1?.label || 'Nao selecionado'}
                  {project.taxonomyL2 && ` > ${project.taxonomyL2.label}`}
                  {project.taxonomyL3 && ` > ${project.taxonomyL3.label}`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stage Transition Card */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentacao de Estagio</CardTitle>
            <CardDescription>
              Transições seguem as regras do pipeline operacional (H0.3)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status atual</Label>
              <p className="font-medium">{PROJECT_STATUS_LABELS[project.status]}</p>
            </div>

            <div className="space-y-2">
              <Label>Proximo status</Label>
              <Select
                value={statusTarget ?? ''}
                onValueChange={(value) => {
                  setStatusTarget(value as ProjectStatus)
                  setStatusFeedback(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PROJECT_STATUSES.filter((status) => status !== project.status).map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className={cn(
                        !(ALLOWED_STATUS_TRANSITIONS[project.status] || []).includes(status) &&
                          'text-destructive'
                      )}
                    >
                      {PROJECT_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Status em vermelho representam transições inválidas e devem retornar bloqueio.
              </p>
            </div>

            {statusTarget && isRollbackTransition(project.status, statusTarget) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rollbackReasonCode">Motivo (codigo)</Label>
                  <Input
                    id="rollbackReasonCode"
                    value={statusReasonCode}
                    onChange={(e) => setStatusReasonCode(e.target.value)}
                    placeholder="ex.: rollback_due_diligence"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollbackReasonText">Motivo (descricao)</Label>
                  <Textarea
                    id="rollbackReasonText"
                    value={statusReasonText}
                    onChange={(e) => setStatusReasonText(e.target.value)}
                    placeholder="Descreva o motivo do rollback"
                    rows={3}
                  />
                </div>
              </>
            )}

            <Button
              onClick={handleChangeStatus}
              disabled={statusChanging || !statusTarget || statusTarget === project.status}
            >
              {statusChanging ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Aplicar transicao
            </Button>

            {statusFeedback && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{statusFeedback}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Financial Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dados Financeiros
            </CardTitle>
            <CardDescription>
              Informacoes financeiras do projeto (requerem validacao L2)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Value Min */}
              <div className="space-y-2">
                <Label htmlFor="valueMin">Valor Mínimo (USD)</Label>
                {editMode ? (
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      USD
                    </span>
                    <Input
                      id="valueMin"
                      type="text"
                      inputMode="numeric"
                      value={formatCurrencyUSD(formData.valueMinUsd)}
                      onChange={(e) => setFormData({
                        ...formData,
                        valueMinUsd: parseUsdInput(e.target.value),
                      })}
                      className="pl-12"
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <p className="text-lg font-semibold">
                    {(project as any).value_min_usd
                      ? formatWithSymbol((project as any).value_min_usd, 'USD')
                      : '-'}
                  </p>
                )}
              </div>

              {/* Value Max */}
              <div className="space-y-2">
                <Label htmlFor="valueMax">Valor Máximo (USD)</Label>
                {editMode ? (
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      USD
                    </span>
                    <Input
                      id="valueMax"
                      type="text"
                      inputMode="numeric"
                      value={formatCurrencyUSD(formData.valueMaxUsd)}
                      onChange={(e) => setFormData({
                        ...formData,
                        valueMaxUsd: parseUsdInput(e.target.value),
                      })}
                      className="pl-12"
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <p className="text-lg font-semibold">
                    {(project as any).value_max_usd
                      ? formatWithSymbol((project as any).value_max_usd, 'USD')
                      : '-'}
                  </p>
                )}
              </div>
            </div>

            {/* Equity (fundraising only) */}
            {project.objective === 'fundraising' && (
              <div className="grid gap-6 sm:grid-cols-2 mt-6">
                <div className="space-y-2">
                  <Label>Equity Mínimo (%)</Label>
                  {editMode ? (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={formData.equityMinPct ?? ''}
                      onChange={(e) => setFormData({ ...formData, equityMinPct: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="0"
                    />
                  ) : (
                    <p className="text-lg font-semibold">
                      {(project as any).equity_min_pct != null ? `${(project as any).equity_min_pct}%` : '-'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Equity Máximo (%)</Label>
                  {editMode ? (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={formData.equityMaxPct ?? ''}
                      onChange={(e) => setFormData({ ...formData, equityMaxPct: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="0"
                    />
                  ) : (
                    <p className="text-lg font-semibold">
                      {(project as any).equity_max_pct != null ? `${(project as any).equity_max_pct}%` : '-'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Reason */}
            {(project as any).reason && (
              <div className="mt-6 space-y-2">
                <Label>Motivo</Label>
                <p className="text-sm">{(project as any).reason}</p>
              </div>
            )}

            <Separator className="my-6" />

            <div className="grid gap-6 sm:grid-cols-2">
              {/* EBITDA */}
              <div className="space-y-2">
                <Label htmlFor="ebitda">EBITDA Anual (USD)</Label>
                {editMode ? (
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      USD
                    </span>
                    <Input
                      id="ebitda"
                      type="text"
                      inputMode="numeric"
                      value={formatCurrencyUSD(formData.ebitdaAnnualUsd)}
                      onChange={(e) => setFormData({
                        ...formData,
                        ebitdaAnnualUsd: parseUsdInput(e.target.value),
                      })}
                      className="pl-12"
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <p className="text-lg font-semibold">
                    {project.ebitda_annual_usd
                      ? formatWithSymbol(project.ebitda_annual_usd, 'USD')
                      : '-'}
                  </p>
                )}
              </div>

              {/* Revenue */}
              <div className="space-y-2">
                <Label htmlFor="revenue">Receita Anual (USD)</Label>
                {editMode ? (
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      USD
                    </span>
                    <Input
                      id="revenue"
                      type="text"
                      inputMode="numeric"
                      value={formatCurrencyUSD(formData.revenueAnnualUsd)}
                      onChange={(e) => setFormData({
                        ...formData,
                        revenueAnnualUsd: parseUsdInput(e.target.value),
                      })}
                      className="pl-12"
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <p className="text-lg font-semibold">
                    {project.revenue_annual_usd
                      ? formatWithSymbol(project.revenue_annual_usd, 'USD')
                      : '-'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsáveis do Projeto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Responsáveis do Projeto
              </CardTitle>
              <CardDescription>
                Contatos responsáveis por este projeto
              </CardDescription>
            </div>
            {!editingContacts ? (
              <Button variant="outline" size="sm" onClick={() => setEditingContacts(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <AutoSaveIndicator status={contactsAutoSaveStatus} />
                <Button variant="outline" size="sm" onClick={handleCancelContacts} disabled={savingContacts}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSaveContacts} disabled={savingContacts}>
                  {savingContacts ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Atualizar contatos
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {editingContacts ? (
              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Responsável {index + 1}
                      </span>
                      {contacts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome *</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Cargo</Label>
                        <Input
                          value={contact.role}
                          onChange={(e) => updateContact(index, 'role', e.target.value)}
                          placeholder="Ex: CEO, CFO, Diretor"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email *</Label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => {
                            updateContact(index, 'email', e.target.value)
                            if (contactEmailErrors[index]) {
                              setContactEmailErrors(prev => { const next = { ...prev }; delete next[index]; return next })
                            }
                          }}
                          placeholder="email@empresa.com"
                          className={cn(contactEmailErrors[index] && 'border-destructive')}
                        />
                        {contactEmailErrors[index] && (
                          <p className="text-xs text-destructive">{contactEmailErrors[index]}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Telefone</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => updateContact(index, 'phone', formatPhoneInput(e.target.value))}
                          placeholder="(11) 99999-9999"
                          maxLength={15}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addContact} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar mais um responsável
                </Button>
              </div>
            ) : contacts.length > 0 ? (
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        {contact.role && (
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum responsável cadastrado.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Readiness Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasReadinessDetails && (
              <p className="mb-3 text-xs text-muted-foreground">
                Dados detalhados de readiness indisponíveis no momento. Exibindo score seguro para evitar quebra da tela.
              </p>
            )}
            <ReadinessIndicator
              score={readinessScore}
              l2PlusCoverage={readinessCoverage}
              checklist={readinessChecklist}
              showDetails
            />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Informacoes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Criado em</span>
              <span>{new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Atualizado em</span>
              <span>{new Date(project.updated_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono text-xs">{project.id.slice(0, 8)}...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
