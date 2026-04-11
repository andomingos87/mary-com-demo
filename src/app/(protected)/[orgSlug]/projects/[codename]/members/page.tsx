'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/navigation/Header'
import { Button } from '@/components/ui/button'
import { UserPlus, Loader2 } from 'lucide-react'
import { ProjectMembersPanel } from '@/components/projects/ProjectMembersPanel'
import { ProjectInvitesList } from '@/components/projects/ProjectInvitesList'
import { InviteMemberDialog } from '@/components/projects/InviteMemberDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectVisibilityToggle } from '@/components/projects/ProjectVisibilityToggle'
import { normalizeProjectVisibility, PROJECT_SHARING_LOGIN_NOTICE } from '@/lib/constants/project-sharing'
import { listProjectMembers } from '@/lib/actions/project-members'
import { listProjectInvites } from '@/lib/actions/project-invites'
import { checkProjectAccess } from '@/lib/actions/project-members'
import { getProjectByCodename } from '@/lib/actions/projects'
import type { ProjectMemberWithUser, ProjectInvite, ProjectVisibility } from '@/types/projects'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProjectMembersPage() {
  const params = useParams<{ orgSlug: string; codename: string }>()
  const [members, setMembers] = useState<ProjectMemberWithUser[]>([])
  const [invites, setInvites] = useState<ProjectInvite[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<ProjectVisibility>('private')
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')

  const loadData = useCallback(async () => {
    if (!params.orgSlug || !params.codename) return

    // Get current user
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || ''
    setCurrentUserId(userId)

    // Get project
    const projectResult = await getProjectByCodename(params.orgSlug, params.codename)
    if (!projectResult.success || !projectResult.data) return

    const project = projectResult.data
    setProjectId(project.id)
    setVisibility(normalizeProjectVisibility((project as { visibility?: string }).visibility))

    // Check access
    const accessResult = await checkProjectAccess(project.id, userId)
    const hasManageAccess = accessResult.success && accessResult.data &&
      (accessResult.data.role === 'manager' || accessResult.data.role === 'admin')
    setCanManage(!!hasManageAccess)

    // Load members and invites
    const [membersResult, invitesResult] = await Promise.all([
      listProjectMembers(project.id),
      hasManageAccess ? listProjectInvites(project.id) : Promise.resolve({ success: true, data: [] }),
    ])

    if (membersResult.success) setMembers(membersResult.data || [])
    if (invitesResult.success) setInvites((invitesResult.data || []) as ProjectInvite[])

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
        title="Membros do Projeto"
        description="Gerencie quem tem acesso a este projeto"
        actions={
          <div className="flex items-center gap-2">
            {canManage && projectId && (
              <>
                <ProjectVisibilityToggle
                  projectId={projectId}
                  visibility={visibility}
                  onVisibilityChange={setVisibility}
                />
                <Button onClick={() => setInviteOpen(true)} size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar
                </Button>
              </>
            )}
          </div>
        }
      />

      <Card className="border-border bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Compartilhamento na Mary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong className="text-foreground">Privado:</strong> não aparece no Radar; acesso só para quem você
              autorizar (equipe e advisors).
            </li>
            <li>
              <strong className="text-foreground">Restrito:</strong> não aparece no Radar geral; use convites na Mary
              para investidores específicos.
            </li>
            <li>
              <strong className="text-foreground">Radar Mary:</strong> publicado no Radar da Mary; o deal não fica
              disponível fora da plataforma.
            </li>
          </ul>
          <p className="text-[11px] leading-snug">{PROJECT_SHARING_LOGIN_NOTICE}</p>
        </CardContent>
      </Card>

      <ProjectMembersPanel
        projectId={projectId || ''}
        members={members}
        currentUserId={currentUserId}
        canManage={canManage}
        onMembersChange={loadData}
      />

      {canManage && invites.length > 0 && (
        <ProjectInvitesList
          invites={invites}
          canManage={canManage}
          onInvitesChange={loadData}
        />
      )}

      {projectId && (
        <InviteMemberDialog
          projectId={projectId}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
