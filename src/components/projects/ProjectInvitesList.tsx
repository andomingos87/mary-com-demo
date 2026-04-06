'use client'

import * as React from 'react'
import { useState } from 'react'
import { Mail, RefreshCw, X, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cancelProjectInvite, resendProjectInvite } from '@/lib/actions/project-invites'
import type { ProjectInvite } from '@/types/projects'
import { PROJECT_MEMBER_ROLE_LABELS } from '@/types/projects'

interface ProjectInvitesListProps {
  invites: ProjectInvite[]
  canManage: boolean
  onInvitesChange?: () => void
}

export function ProjectInvitesList({
  invites,
  canManage,
  onInvitesChange,
}: ProjectInvitesListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleResend = async (inviteId: string) => {
    setLoadingId(inviteId)
    await resendProjectInvite(inviteId)
    setLoadingId(null)
    onInvitesChange?.()
  }

  const handleCancel = async (inviteId: string) => {
    setLoadingId(inviteId)
    await cancelProjectInvite(inviteId)
    setLoadingId(null)
    onInvitesChange?.()
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  if (invites.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Convites pendentes ({invites.length})
      </h3>

      {invites.map((invite) => {
        const expired = isExpired(invite.expires_at)
        return (
          <div
            key={invite.id}
            className="flex items-center justify-between p-3 rounded-lg border border-dashed"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{invite.email}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {PROJECT_MEMBER_ROLE_LABELS[invite.role]}
                  </Badge>
                  {expired && (
                    <span className="flex items-center gap-1 text-destructive">
                      <Clock className="h-3 w-3" />
                      Expirado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-1">
                {loadingId === invite.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleResend(invite.id)}
                      title="Reenviar convite"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleCancel(invite.id)}
                      title="Cancelar convite"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
