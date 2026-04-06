'use client'

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutoSaveStatus } from '@/hooks/useAutoSave'

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus
  className?: string
  errorMessage?: string | null
}

export function AutoSaveIndicator({ status, className, errorMessage }: AutoSaveIndicatorProps) {
  if (status === 'idle') return null

  if (status === 'saving') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Salvando...
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-success', className)}>
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Salvo
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-xs text-destructive', className)}
      role="status"
      aria-live="polite"
      title={errorMessage || 'Falha ao salvar automaticamente'}
    >
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      Erro ao salvar
    </span>
  )
}

export default AutoSaveIndicator
