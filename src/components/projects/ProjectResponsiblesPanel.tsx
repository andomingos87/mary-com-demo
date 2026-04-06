'use client'

import * as React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, Phone, Briefcase, Mail, Loader2 } from 'lucide-react'
import { removeProjectResponsible } from '@/lib/actions/project-members'
import type { ResponsibleItem } from '@/lib/actions/project-members'

interface ProjectResponsiblesPanelProps {
  projectId: string
  responsibles: ResponsibleItem[]
  canManage: boolean
  onResponsiblesChange: () => void
}

export function ProjectResponsiblesPanel({
  projectId,
  responsibles,
  canManage,
  onResponsiblesChange,
}: ProjectResponsiblesPanelProps) {
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<{ id: string; name: string; type: 'member' | 'invite' } | null>(null)

  const handleRemove = async () => {
    if (!confirmRemove) return
    setRemovingId(confirmRemove.id)

    try {
      const result = await removeProjectResponsible(projectId, confirmRemove.id, confirmRemove.type)
      if (result.success) {
        onResponsiblesChange()
      }
    } catch (error) {
      console.error('Error removing responsible:', error)
    } finally {
      setRemovingId(null)
      setConfirmRemove(null)
    }
  }

  const getDisplayName = (item: ResponsibleItem): string => {
    if (item.status === 'active' && item.user) {
      return item.user.user_metadata?.full_name || item.user.email
    }
    if (item.status === 'pending') {
      return item.email
    }
    return 'Desconhecido'
  }

  const getEmail = (item: ResponsibleItem): string => {
    if (item.status === 'active' && item.user) {
      return item.user.email
    }
    if (item.status === 'pending') {
      return item.email
    }
    return ''
  }

  if (responsibles.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Nenhum responsável adicionado ainda.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione responsáveis para vincular pessoas ao projeto.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Responsáveis ({responsibles.length})</CardTitle>
          <CardDescription>
            Pessoas vinculadas como responsáveis pelo projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {responsibles.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {getDisplayName(item)}
                    </span>
                    {item.status === 'active' ? (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Convite pendente
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {item.metadata?.cargo && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {item.metadata.cargo}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {getEmail(item)}
                    </span>
                    {item.metadata?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {item.metadata.phone}
                      </span>
                    )}
                  </div>
                </div>

                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    disabled={removingId === item.id}
                    onClick={() =>
                      setConfirmRemove({
                        id: item.id,
                        name: getDisplayName(item),
                        type: item.status === 'active' ? 'member' : 'invite',
                      })
                    }
                  >
                    {removingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Responsável</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{confirmRemove?.name}</strong> como responsável do projeto?
              {confirmRemove?.type === 'invite'
                ? ' O convite pendente será cancelado.'
                : ' O acesso ao projeto será revogado.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
