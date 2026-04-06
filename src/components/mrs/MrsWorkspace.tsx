'use client'

import { useMemo, useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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

type DraftValues = {
  ownerUserId?: string
  comments?: string
  fileName?: string
  fileUrl?: string
}

function ensureDraft(base?: DraftValues): DraftValues {
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
  const [drafts, setDrafts] = useState<Record<string, DraftValues>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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

      <Card>
        <CardHeader>
          <CardTitle>Navegação por passos</CardTitle>
          <CardDescription>Passos 1-4 conforme contrato oficial do MRS.</CardDescription>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {selectedProject.mrs.steps.map((step) => (
              <Button
                key={step.id}
                type="button"
                variant={activeStepId === step.id ? 'default' : 'outline'}
                onClick={() => setActiveStepId(step.id)}
                className="justify-between"
              >
                <span>{STEP_LABELS[step.id]}</span>
                <span>{selectedProject.mrs.score.stepScores[step.id]}%</span>
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {activeStep && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{activeStep.name}</CardTitle>
              <CardDescription>
                Score do passo: {selectedProject.mrs.score.stepScores[activeStep.id]}%
              </CardDescription>
            </CardHeader>
          </Card>

          {activeStep.themes.map((theme) => (
            <Card key={theme.id}>
              <CardHeader>
                <CardTitle className="text-base">{theme.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {theme.subthemes.map((subtheme) => (
                  <div key={subtheme.id} className="space-y-4">
                    <h4 className="text-sm font-semibold">{subtheme.name}</h4>
                    {subtheme.items.map((item) => {
                      const draft = ensureDraft({
                        ...drafts[item.id],
                        ownerUserId: drafts[item.id]?.ownerUserId ?? item.ownerUserId ?? '',
                        comments: drafts[item.id]?.comments ?? item.comments ?? '',
                      })

                      return (
                        <div key={item.id} className="rounded-lg border border-border p-4 space-y-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">Arquivos: {item.filesCount}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Select value={item.status} onValueChange={(value) => handleStatusChange(item.id, value as MrsStatus)}>
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                  <SelectItem value="parcial">Parcial</SelectItem>
                                  <SelectItem value="completo">Completo</SelectItem>
                                  <SelectItem value="na">N/A</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select value={item.priority} onValueChange={(value) => handlePriorityChange(item.id, value as MrsPriority)}>
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="critica">Crítica</SelectItem>
                                  <SelectItem value="alta">Alta</SelectItem>
                                  <SelectItem value="media">Média</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              placeholder="owner_user_id (responsável)"
                              value={draft.ownerUserId}
                              onChange={(event) =>
                                setDrafts((prev) => ({
                                  ...prev,
                                  [item.id]: {
                                    ...ensureDraft(prev[item.id]),
                                    ownerUserId: event.target.value,
                                  },
                                }))
                              }
                            />
                            <Input
                              placeholder="Nome do arquivo para registrar upload"
                              value={draft.fileName}
                              onChange={(event) =>
                                setDrafts((prev) => ({
                                  ...prev,
                                  [item.id]: {
                                    ...ensureDraft(prev[item.id]),
                                    fileName: event.target.value,
                                  },
                                }))
                              }
                            />
                          </div>

                          <Input
                            placeholder="URL do arquivo (opcional)"
                            value={draft.fileUrl}
                            onChange={(event) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...ensureDraft(prev[item.id]),
                                  fileUrl: event.target.value,
                                },
                              }))
                            }
                          />

                          <Textarea
                            placeholder="Comentários do item"
                            value={draft.comments}
                            onChange={(event) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...ensureDraft(prev[item.id]),
                                  comments: event.target.value,
                                },
                              }))
                            }
                          />

                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleSaveMetadata(item.id)}
                              disabled={isPending}
                            >
                              Atualizar metadados
                            </Button>
                            <Button
                              type="button"
                              onClick={() => handleRegisterUpload(item.id)}
                              disabled={isPending}
                            >
                              Registrar upload
                            </Button>
                          </div>

                          {item.lastUploadAt && (
                            <p className="text-xs text-muted-foreground">
                              Último upload: {new Date(item.lastUploadAt).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
