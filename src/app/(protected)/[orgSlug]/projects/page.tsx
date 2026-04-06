'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FolderKanban, Plus, Search, RefreshCw } from 'lucide-react'
import { listProjects } from '@/lib/actions/projects'
import { getL1Sectors } from '@/lib/actions/taxonomy'
import { getOrganization } from '@/lib/actions/organizations'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import type { Project, ProjectStatus, ProjectObjective } from '@/types/database'
import { PROJECT_OBJECTIVE_LABELS, PROJECT_STATUS_LABELS } from '@/types/database'
import type { TaxonomyNode } from '@/types/projects'

// ============================================
// Projects Hub Page (Asset Only)
// ============================================

export default function ProjectsPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string

  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [l1Sectors, setL1Sectors] = useState<TaxonomyNode[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [objectiveFilter, setObjectiveFilter] = useState<ProjectObjective | 'all'>('all')

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Load organization ID and projects
  useEffect(() => {
    async function loadData() {
      setLoading(true)

      // First, get organization from slug using server action
      const orgResult = await getOrganization(orgSlug)
      if (orgResult.success && orgResult.data) {
        setOrganizationId(orgResult.data.id)

        // Load projects
        const result = await listProjects(orgResult.data.id, {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          objective: objectiveFilter !== 'all' ? objectiveFilter : undefined,
          search: searchQuery || undefined,
        })

        if (result.success && result.data) {
          setProjects(result.data)
        }
      }

      // Load L1 sectors for labels
      const sectorsResult = await getL1Sectors()
      if (sectorsResult.success && sectorsResult.data) {
        setL1Sectors(sectorsResult.data)
      }

      setLoading(false)
    }

    loadData()
  }, [orgSlug, statusFilter, objectiveFilter, searchQuery])

  // Refresh projects
  const refreshProjects = useCallback(async () => {
    if (!organizationId) return

    setLoading(true)
    const result = await listProjects(organizationId, {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      objective: objectiveFilter !== 'all' ? objectiveFilter : undefined,
      search: searchQuery || undefined,
    })

    if (result.success && result.data) {
      setProjects(result.data)
    }
    setLoading(false)
  }, [organizationId, statusFilter, objectiveFilter, searchQuery])

  // Handle project created
  const handleProjectCreated = useCallback((project: Project) => {
    setProjects((prev) => [project, ...prev])
  }, [])

  // Get sector label
  const getSectorLabel = (code: string | null): string | undefined => {
    if (!code) return undefined
    return l1Sectors.find((s) => s.code === code)?.label
  }

  // Filter projects locally for search (debounced server search could be added)
  const filteredProjects = projects

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projetos"
        description="Gerencie seus projetos de venda ou captação"
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou codename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={objectiveFilter}
          onValueChange={(v) => setObjectiveFilter(v as ProjectObjective | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Objetivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer transition-colors hover:bg-primary/10">
              Todos os objetivos
            </SelectItem>
            {(Object.keys(PROJECT_OBJECTIVE_LABELS) as ProjectObjective[]).map((obj) => (
              <SelectItem
                key={obj}
                value={obj}
                className="cursor-pointer transition-colors hover:bg-primary/10"
              >
                {PROJECT_OBJECTIVE_LABELS[obj]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ProjectStatus | 'all')}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer transition-colors hover:bg-primary/10">
              Todos os status
            </SelectItem>
            {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="cursor-pointer transition-colors hover:bg-primary/10"
              >
                {PROJECT_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={refreshProjects} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {!loading && filteredProjects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              orgSlug={orgSlug}
              sectorL1Label={getSectorLabel(project.sector_l1)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== 'all' || objectiveFilter !== 'all'
                ? 'Nenhum projeto encontrado'
                : 'Nenhum projeto criado'}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {searchQuery || statusFilter !== 'all' || objectiveFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Crie seu primeiro projeto para comecar a receber propostas de investidores interessados na sua empresa.'}
            </p>
            {!(searchQuery || statusFilter !== 'all' || objectiveFilter !== 'all') && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Projeto
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Project Dialog */}
      {organizationId && (
        <CreateProjectDialog
          organizationId={organizationId}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleProjectCreated}
        />
      )}
    </div>
  )
}
