'use client'

import * as React from 'react'
import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { createProjectInvite } from '@/lib/actions/project-invites'
import type { ProjectMemberRole } from '@/types/projects'
import { PROJECT_MEMBER_ROLE_LABELS, PROJECT_MEMBER_ROLE_DESCRIPTIONS } from '@/types/projects'

interface InviteMemberDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function InviteMemberDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<ProjectMemberRole>('viewer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setEmail('')
    setRole('viewer')
    setError(null)
  }, [])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm()
      onOpenChange(false)
    }
  }, [isSubmitting, resetForm, onOpenChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Email e obrigatorio')
      return
    }

    setIsSubmitting(true)
    const result = await createProjectInvite(projectId, email.trim().toLowerCase(), role)
    setIsSubmitting(false)

    if (result.success) {
      onSuccess?.()
      resetForm()
      onOpenChange(false)
    } else {
      setError(result.error || 'Erro ao enviar convite')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Convidar Membro</DialogTitle>
          <DialogDescription>
            Envie um convite por email para adicionar um membro ao projeto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="invite-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Papel</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as ProjectMemberRole)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['viewer', 'editor', 'manager'] as ProjectMemberRole[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    <div>
                      <span className="font-medium">{PROJECT_MEMBER_ROLE_LABELS[r]}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {PROJECT_MEMBER_ROLE_DESCRIPTIONS[r]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
