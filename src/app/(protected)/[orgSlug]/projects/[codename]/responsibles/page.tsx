'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/navigation/Header'
import { Button } from '@/components/ui/button'
import { UserPlus, Loader2 } from 'lucide-react'
import { ProjectResponsiblesPanel } from '@/components/projects/ProjectResponsiblesPanel'
import { AddResponsibleDialog } from '@/components/projects/AddResponsibleDialog'
import { listProjectResponsibles } from '@/lib/actions/project-members'
import { checkProjectAccess } from '@/lib/actions/project-members'
import { getProjectByCodename } from '@/lib/actions/projects'
import type { ResponsibleItem } from '@/lib/actions/project-members'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProjectResponsiblesPage() {
  const params = useParams<{ orgSlug: string; codename: string }>()
  const [responsibles, setResponsibles] = useState<ResponsibleItem[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!params.orgSlug || !params.codename) return

    // Get current user
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || ''

    // Get project
    const projectResult = await getProjectByCodename(params.orgSlug, params.codename)
    if (!projectResult.success || !projectResult.data) return

    const project = projectResult.data
    setProjectId(project.id)

    // Check access
    const accessResult = await checkProjectAccess(project.id, userId)
    const hasManageAccess = accessResult.success && accessResult.data &&
      (accessResult.data.role === 'manager' || accessResult.data.role === 'admin')
    setCanManage(!!hasManageAccess)

    // Load responsibles
    const responsiblesResult = await listProjectResponsibles(project.id)
    if (responsiblesResult.success) {
      setResponsibles(responsiblesResult.data || [])
    }

    setLoading(false)
  }, [params.orgSlug, params.codename])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Responsáveis do Projeto"
        description="Gerencie os responsáveis vinculados a este projeto"
        actions={
          canManage && projectId ? (
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Responsável
            </Button>
          ) : undefined
        }
      />

      <ProjectResponsiblesPanel
        projectId={projectId || ''}
        responsibles={responsibles}
        canManage={canManage}
        onResponsiblesChange={loadData}
      />

      {projectId && (
        <AddResponsibleDialog
          projectId={projectId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
