'use client'

import * as React from 'react'
import { useState } from 'react'
import { MoreHorizontal, UserMinus, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { removeProjectMember, updateProjectMemberRole } from '@/lib/actions/project-members'
import type { ProjectMemberWithUser, ProjectMemberRole } from '@/types/projects'
import { PROJECT_MEMBER_ROLE_LABELS } from '@/types/projects'

interface ProjectMembersPanelProps {
  projectId: string
  members: ProjectMemberWithUser[]
  currentUserId: string
  canManage: boolean
  onMembersChange?: () => void
}

const ROLE_COLORS: Record<ProjectMemberRole, string> = {
  viewer: 'bg-slate-100 text-slate-700',
  editor: 'bg-blue-100 text-blue-700',
  manager: 'bg-purple-100 text-purple-700',
}

export function ProjectMembersPanel({
  projectId,
  members,
  currentUserId,
  canManage,
  onMembersChange,
}: ProjectMembersPanelProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: ProjectMemberRole) => {
    setLoadingId(userId)
    await updateProjectMemberRole(projectId, userId, newRole)
    setLoadingId(null)
    onMembersChange?.()
  }

  const handleRemove = async (userId: string) => {
    setLoadingId(userId)
    await removeProjectMember(projectId, userId)
    setLoadingId(null)
    onMembersChange?.()
  }

  const getInitials = (member: ProjectMemberWithUser): string => {
    const name = member.user?.user_metadata?.full_name
    if (name) {
      return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    }
    return (member.user?.email || '?')[0].toUpperCase()
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">{getInitials(member)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {member.user?.user_metadata?.full_name || member.user?.email || 'Usuario'}
                {member.user_id === currentUserId && (
                  <span className="text-muted-foreground ml-1">(voce)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{member.user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={ROLE_COLORS[member.role]}>
              {PROJECT_MEMBER_ROLE_LABELS[member.role]}
            </Badge>

            {canManage && member.user_id !== currentUserId && (
              <>
                {loadingId === member.user_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(['viewer', 'editor', 'manager'] as ProjectMemberRole[])
                        .filter(r => r !== member.role)
                        .map(role => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleRoleChange(member.user_id, role)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Alterar para {PROJECT_MEMBER_ROLE_LABELS[role]}
                          </DropdownMenuItem>
                        ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemove(member.user_id)}
                        className="text-destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remover do projeto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>
      ))}

      {members.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum membro neste projeto
        </p>
      )}
    </div>
  )
}
