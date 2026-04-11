'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Filter, List, MoveHorizontal, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '@/types/database'
import { PROJECT_STATUS_COLORS } from '@/types/projects'
import {
  PIPELINE_EXIT_STATUSES,
  PIPELINE_PHASE_ORDER,
  canTransitionProjectStatus,
} from '@/lib/projects/status-flow'
import { changeProjectStatus } from '@/lib/actions/projects'

type PipelineProject = {
  id: string
  codename: string
  status: ProjectStatus
}

interface PipelineBoardProps {
  orgSlug: string
  initialProjects: PipelineProject[]
  readOnlyMode: boolean
  /** Movimentação apenas local (NEXT_PUBLIC_FRONTEND_DEMO). */
  demoMode?: boolean
}

const EXIT_ZONES: Array<{ status: ProjectStatus; label: string }> = [
  { status: 'closed_won', label: 'Fechado' },
  { status: 'closed_lost', label: 'Perdido' },
]

export function PipelineBoard({ orgSlug, initialProjects, readOnlyMode, demoMode = false }: PipelineBoardProps) {
  const router = useRouter()
  const [projects, setProjects] = useState(initialProjects)
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.codename.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, search, statusFilter])

  const projectsByStatus = useMemo(() => {
    return filteredProjects.reduce<Record<ProjectStatus, PipelineProject[]>>((acc, project) => {
      acc[project.status] = acc[project.status] ?? []
      acc[project.status].push(project)
      return acc
    }, {} as Record<ProjectStatus, PipelineProject[]>)
  }, [filteredProjects])

  function moveProject(projectId: string, toStatus: ProjectStatus) {
    const project = projects.find((candidate) => candidate.id === projectId)
    if (!project) return
    if (project.status === toStatus) return

    if (!canTransitionProjectStatus(project.status, toStatus)) {
      setError(`Transição inválida: ${PROJECT_STATUS_LABELS[project.status]} -> ${PROJECT_STATUS_LABELS[toStatus]}`)
      return
    }

    setError(null)
    setFeedback(null)

    if (demoMode) {
      setProjects((previous) =>
        previous.map((candidate) =>
          candidate.id === projectId ? { ...candidate, status: toStatus } : candidate
        )
      )
      setFeedback(`[Demo] Card movido para ${PROJECT_STATUS_LABELS[toStatus]}.`)
      return
    }

    startTransition(async () => {
      const result = await changeProjectStatus(projectId, toStatus)
      if (!result.success) {
        setError(result.error ?? 'Erro ao mover card')
        return
      }

      setProjects((previous) =>
        previous.map((candidate) =>
          candidate.id === projectId ? { ...candidate, status: toStatus } : candidate
        )
      )
      setFeedback(`Card movido para ${PROJECT_STATUS_LABELS[toStatus]}.`)
      router.refresh()
    })
  }

  const headerControls = (
    <div className="flex flex-wrap items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === 'pipeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('pipeline')}
          >
            <MoveHorizontal className="mr-2 h-4 w-4" />
            Pipeline
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualização por fases com drag-and-drop.</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="mr-2 h-4 w-4" />
            Lista
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualização linear para revisão rápida.</p>
        </TooltipContent>
      </Tooltip>
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por codinome"
          className="pl-8"
        />
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Filtre por fase para reduzir ambiguidade no board.</p>
          </TooltipContent>
        </Tooltip>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | ProjectStatus)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="all">Todas as fases</option>
          {[...PIPELINE_PHASE_ORDER, ...PIPELINE_EXIT_STATUSES].map((status) => (
            <option key={status} value={status}>
              {PROJECT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-4">
        {headerControls}

      {demoMode && (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Modo demo: dados são fictícios; arrastar cards não persiste no servidor.
        </p>
      )}

      {readOnlyMode && (
        <p className="text-xs text-muted-foreground">
          Organização em modo somente leitura. As movimentações de card ficam bloqueadas.
        </p>
      )}

      {feedback && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          {feedback}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

        {viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Lista de projetos ({filteredProjects.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredProjects.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum projeto encontrado para os filtros atuais.</p>
            )}
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <Link className="font-medium text-foreground hover:underline" href={`/${orgSlug}/projects/${project.codename}`}>
                  {project.codename}
                </Link>
                <Badge className={`${PROJECT_STATUS_COLORS[project.status].bg} ${PROJECT_STATUS_COLORS[project.status].text}`}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        ) : (
        <>
          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[2400px] grid-cols-12 gap-3">
              {PIPELINE_PHASE_ORDER.map((status) => {
                const projectsInColumn = projectsByStatus[status] ?? []
                return (
                  <div
                    key={status}
                    className="rounded-lg border border-border bg-muted/30"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      if (!draggingProjectId || readOnlyMode) return
                      moveProject(draggingProjectId, status)
                      setDraggingProjectId(null)
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <p className="text-xs font-semibold text-foreground">{PROJECT_STATUS_LABELS[status]}</p>
                      <Badge variant="secondary">{projectsInColumn.length}</Badge>
                    </div>
                    <div className="min-h-[260px] space-y-2 p-2">
                      {projectsInColumn.map((project) => (
                        <div
                          key={project.id}
                          draggable={!readOnlyMode && !isPending}
                          onDragStart={() => setDraggingProjectId(project.id)}
                          className="cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-smooth hover:shadow-card"
                        >
                          <Link
                            className="block text-sm font-medium text-foreground hover:underline"
                            href={`/${orgSlug}/projects/${project.codename}`}
                          >
                            {project.codename}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {EXIT_ZONES.map((zone) => {
              const projectsInZone = projectsByStatus[zone.status] ?? []
              return (
                <Card
                  key={zone.status}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    if (!draggingProjectId || readOnlyMode) return
                    moveProject(draggingProjectId, zone.status)
                    setDraggingProjectId(null)
                  }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{zone.label}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {zone.status === 'closed_won'
                              ? 'Fechado: transação concluída com sucesso.'
                              : 'Perdido: oportunidade encerrada sem fechamento.'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Arraste cards para marcar como {zone.label.toLowerCase()}.
                    </p>
                    {projectsInZone.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum card nesta saída.</p>
                    )}
                    {projectsInZone.map((project) => (
                      <div key={project.id} className="rounded-lg border border-border bg-card p-3">
                        <Link
                          className="block text-sm font-medium text-foreground hover:underline"
                          href={`/${orgSlug}/projects/${project.codename}`}
                        >
                          {project.codename}
                        </Link>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
        )}
      </div>
    </TooltipProvider>
  )
}
