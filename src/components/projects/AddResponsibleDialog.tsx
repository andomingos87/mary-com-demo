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
import { Badge } from '@/components/ui/badge'
import { Loader2, UserCheck, UserPlus, Mail } from 'lucide-react'
import { lookupUserByEmail } from '@/lib/actions/projects'
import { addProjectResponsible } from '@/lib/actions/project-members'

interface AddResponsibleDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddResponsibleDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: AddResponsibleDialogProps) {
  const [email, setEmail] = useState('')
  const [cargo, setCargo] = useState('')
  const [phone, setPhone] = useState('')
  const [lookupResult, setLookupResult] = useState<{
    checked: boolean
    exists: boolean
    displayName?: string
  }>({ checked: false, exists: false })
  const [lookupLoading, setLookupLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const resetForm = useCallback(() => {
    setEmail('')
    setCargo('')
    setPhone('')
    setLookupResult({ checked: false, exists: false })
    setError('')
  }, [])

  const handleLookup = useCallback(async () => {
    if (!email.trim()) return

    setLookupLoading(true)
    setError('')
    try {
      const result = await lookupUserByEmail(email.trim())
      if (result.success && result.data) {
        setLookupResult({
          checked: true,
          exists: result.data.exists,
          displayName: result.data.displayName,
        })
      }
    } catch {
      setError('Erro ao verificar email')
    } finally {
      setLookupLoading(false)
    }
  }, [email])

  const handleEmailBlur = useCallback(() => {
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      handleLookup()
    }
  }, [email, handleLookup])

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = await addProjectResponsible(
        projectId,
        email.trim(),
        cargo.trim() || undefined,
        phone.replace(/\D/g, '') || undefined
      )

      if (!result.success) {
        setError(result.error || 'Erro ao adicionar responsável')
        return
      }

      resetForm()
      onOpenChange(false)
      onSuccess()
    } catch {
      setError('Erro inesperado ao adicionar responsável')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm()
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Responsável</DialogTitle>
          <DialogDescription>
            Adicione um responsável pelo projeto. Se a pessoa não tiver conta, receberá um convite por email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="resp-email">Email *</Label>
            <div className="flex gap-2">
              <Input
                id="resp-email"
                type="email"
                placeholder="email@empresa.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setLookupResult({ checked: false, exists: false })
                }}
                onBlur={handleEmailBlur}
                required
                disabled={submitting}
              />
              {lookupLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-2" />}
            </div>
            {lookupResult.checked && (
              <div className="flex items-center gap-2 text-sm">
                {lookupResult.exists ? (
                  <>
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">
                      Usuário encontrado: {lookupResult.displayName}
                    </span>
                    <Badge variant="outline" className="text-xs">Será adicionado direto</Badge>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700">Usuário não cadastrado</span>
                    <Badge variant="outline" className="text-xs">Receberá convite</Badge>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <Label htmlFor="resp-cargo">Cargo</Label>
            <Input
              id="resp-cargo"
              placeholder="Ex: CFO, Diretor Financeiro"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="resp-phone">Telefone</Label>
            <Input
              id="resp-phone"
              placeholder="(11) 99999-0000"
              value={phone}
              onChange={handlePhoneChange}
              disabled={submitting}
              maxLength={16}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !email.trim()}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : lookupResult.exists ? (
                <UserPlus className="h-4 w-4 mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              {lookupResult.exists ? 'Adicionar' : 'Enviar Convite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
