'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MrsRadarChart } from '@/components/mrs/MrsRadarChart'
import { MrsStepItemsPanel, type MrsItemDraft } from '@/components/mrs/MrsStepItemsPanel'
import { mrsStepNavButtonClass } from '@/components/mrs/mrs-step-helpers'
import { AutoSaveIndicator } from '@/components/shared/AutoSaveIndicator'
import {
  addMrsItemFileAction,
  listMrsProjectsByOrgSlug,
  updateMrsItemAction,
  type MrsProjectSummary,
} from '@/lib/actions/readiness'
import type { MrsPriority, MrsStatus, MrsStepId } from '@/types/projects'

interface MrsWorkspaceProps {
  orgSlug: string
  initialProjects: MrsProjectSummary[]
}

const STEP_LABELS: Record<MrsStepId, string> = {
  1: 'Passo 1',
  2: 'Passo 2',
  3: 'Passo 3',
  4: 'Passo 4',
}

function ensureDraft(base?: MrsItemDraft): MrsItemDraft {
  return {
    ownerUserId: base?.ownerUserId ?? '',
    comments: base?.comments ?? '',
    fileName: base?.fileName ?? '',
    fileUrl: base?.fileUrl ?? '',
  }
}

export function MrsWorkspace({ orgSlug, initialProjects }: MrsWorkspaceProps) {
  const [projects, setProjects] = useState<MrsProjectSummary[]>(initialProjects)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjects[0]?.id ?? '')
  const [activeStepId, setActiveStepId] = useState<MrsStepId>(1)
  const [drafts, setDrafts] = useState<Record<string, MrsItemDraft>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const stepContentRef = useRef<HTMLDivElement>(null)
  const skipStepScrollOnMount = useRef(true)

  useEffect(() => {
    if (skipStepScrollOnMount.current) {
      skipStepScrollOnMount.current = false
      return
    }
    stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeStepId])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )
  const activeStep = selectedProject?.mrs.steps.find((step) => step.id === activeStepId) ?? null
  const indicatorStatus: 'idle' | 'saving' | 'saved' | 'error' = globalError
    ? 'error'
    : isPending
      ? 'saving'
      : globalSuccess
        ? 'saved'
        : 'idle'

  const refreshProjects = async () => {
    const result = await listMrsProjectsByOrgSlug(orgSlug)
    if (!result.success || !result.data) {
      setGlobalError(result.error || 'Erro ao atualizar dados do MRS.')
      return
    }

    setProjects(result.data)
    if (!selectedProjectId && result.data[0]) {
      setSelectedProjectId(result.data[0].id)
    }
  }

  const handleStatusChange = (itemId: string, status: MrsStatus) =>
    startTransition(async () => {
      if (!selectedProject) return
      setGlobalError(null)
      setGlobalSuccess(null)

      const result = await updateMrsItemAction({
        orgSlug,
        projectId: selectedProject.id,
        itemId,
        status,
      })

      if (!result.success) {
        setGlobalError(result.error || 'Erro ao atualizar status do item.')
        return
      }

      await refreshProjects()
      setGlobalSuccess('Status atualizado com sucesso.')
    })

  const handlePriorityChange = (itemId: string, priority: MrsPriority) =>
    startTransition(async () => {
      if (!selectedProject) return
      setGlobalError(null)
      setGlobalSuccess(null)

      const result = await updateMrsItemAction({
        orgSlug,
        projectId: selectedProject.id,
        itemId,
        priority,
      })

      if (!result.success) {
        setGlobalError(result.error || 'Erro ao atualizar prioridade do item.')
        return
      }

      await refreshProjects()
      setGlobalSuccess('Prioridade atualizada com sucesso.')
    })

  const handleSaveMetadata = (itemId: string) =>
    startTransition(async () => {
      if (!selectedProject) return
      setGlobalError(null)
      setGlobalSuccess(null)

      const draft = ensureDraft(drafts[itemId])
      const result = await updateMrsItemAction({
        orgSlug,
        projectId: selectedProject.id,
        itemId,
        ownerUserId: draft.ownerUserId?.trim() || undefined,
        comments: draft.comments?.trim() || '',
      })

      if (!result.success) {
        setGlobalError(result.error || 'Erro ao atualizar metadados do item.')
        return
      }

      await refreshProjects()
      setGlobalSuccess('Metadados atualizados com sucesso.')
    })

  const handleRegisterUpload = (itemId: string) =>
    startTransition(async () => {
      if (!selectedProject) return
      setGlobalError(null)
      setGlobalSuccess(null)

      const draft = ensureDraft(drafts[itemId])
      if (!draft.fileName?.trim()) {
        setGlobalError('Informe ao menos o nome do arquivo para registrar upload.')
        return
      }

      const result = await addMrsItemFileAction({
        orgSlug,
        projectId: selectedProject.id,
        itemId,
        fileName: draft.fileName.trim(),
        fileUrl: draft.fileUrl?.trim() || undefined,
      })

      if (!result.success) {
        setGlobalError(result.error || 'Erro ao registrar upload.')
        return
      }

      setDrafts((prev) => ({
        ...prev,
        [itemId]: {
          ...ensureDraft(prev[itemId]),
          fileName: '',
          fileUrl: '',
        },
      }))
      await refreshProjects()
      setGlobalSuccess('Upload registrado com sucesso.')
    })

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Nenhum projeto encontrado para o módulo MRS.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>MRS Canônico</CardTitle>
          <CardDescription>
            Gerencie status, prioridade, score e gates de NDA/NBO por projeto.
          </CardDescription>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Projeto</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.codename})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Score total</p>
              <div className="flex items-center gap-3">
                <Progress value={selectedProject.mrs.score.totalScore} className="h-2" />
                <span className="text-sm font-semibold">{selectedProject.mrs.score.totalScore}%</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={selectedProject.mrs.gates.ndaEligible ? 'default' : 'secondary'}>
              NDA: {selectedProject.mrs.gates.ndaEligible ? 'Liberado' : 'Bloqueado'}
            </Badge>
            <Badge variant={selectedProject.mrs.gates.nboEligible ? 'default' : 'secondary'}>
              NBO: {selectedProject.mrs.gates.nboEligible ? 'Liberado' : 'Bloqueado'}
            </Badge>
          </div>
          {!selectedProject.mrs.gates.ndaEligible && selectedProject.mrs.gates.ndaReasons.length > 0 && (
            <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs font-semibold text-muted-foreground">Motivos do bloqueio de NDA</p>
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {selectedProject.mrs.gates.ndaReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
          {!selectedProject.mrs.gates.nboEligible && selectedProject.mrs.gates.nboReasons.length > 0 && (
            <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs font-semibold text-muted-foreground">Motivos do bloqueio de NBO</p>
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {selectedProject.mrs.gates.nboReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
          <AutoSaveIndicator status={indicatorStatus} />
          {globalError && <p className="text-sm text-destructive">{globalError}</p>}
          {globalSuccess && <p className="text-sm text-success">{globalSuccess}</p>}
        </CardHeader>
      </Card>

      <MrsRadarChart
        axes={selectedProject.mrs.steps.map((step) => ({
          label: `Passo ${step.id}`,
          value: Math.min(
            5,
            Math.max(0, Number(((selectedProject.mrs.score.stepScores[step.id] / 100) * 5).toFixed(1)))
          ),
        }))}
      />

      <Card>
        <CardHeader>
          <CardTitle>Navegação por passos</CardTitle>
          <CardDescription>Passos 1-4 conforme contrato oficial do MRS.</CardDescription>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {selectedProject.mrs.steps.map((step) => (
              <button
                key={step.id}
                type="button"
                aria-pressed={activeStepId === step.id}
                onClick={() => setActiveStepId(step.id)}
                className={mrsStepNavButtonClass(step.id, activeStepId === step.id)}
              >
                <span className="flex w-full min-w-0 items-center justify-between gap-2 text-left">
                  <span>{STEP_LABELS[step.id]}</span>
                  <span className="tabular-nums opacity-95">{selectedProject.mrs.score.stepScores[step.id]}%</span>
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {activeStep && (
        <div ref={stepContentRef} className="space-y-4 scroll-mt-24">
          <Card>
            <CardHeader>
              <CardTitle>{activeStep.name}</CardTitle>
              <CardDescription>
                Score do passo: {selectedProject.mrs.score.stepScores[activeStep.id]}%
              </CardDescription>
            </CardHeader>
          </Card>

          <MrsStepItemsPanel
            step={activeStep}
            mode="interactive"
            drafts={drafts}
            onDraftChange={(itemId, partial) =>
              setDrafts((prev) => ({
                ...prev,
                [itemId]: { ...ensureDraft(prev[itemId]), ...partial },
              }))
            }
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onSaveMetadata={handleSaveMetadata}
            onRegisterUpload={handleRegisterUpload}
            disabled={isPending}
          />
        </div>
      )}
    </div>
  )
}
