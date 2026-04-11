import { cn } from '@/lib/utils'
import type { MrsStepId, MrsTheme } from '@/types/projects'

/**
 * MRS — botões Passo 1–4: cores sólidas em `globals.css` (--mrs-step-nav-*), hex da referência UI.
 * Passo 4: contorno branco interno; passo ativo: anel branco externo + offset.
 */
const MRS_STEP_FILL_CLASS: Record<MrsStepId, string> = {
  1: 'mrs-step-nav-fill-1',
  2: 'mrs-step-nav-fill-2',
  3: 'mrs-step-nav-fill-3',
  4: 'mrs-step-nav-fill-4',
}

export function mrsStepNavButtonClass(stepId: MrsStepId, active: boolean): string {
  return cn(
    'mrs-step-nav-btn',
    MRS_STEP_FILL_CLASS[stepId],
    stepId === 4 && 'mrs-step-nav-step4-inner',
    active && 'mrs-step-nav-active'
  )
}

export function mrsThemeProgress(theme: MrsTheme): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const sub of theme.subthemes) {
    for (const item of sub.items) {
      if (item.status === 'na') continue
      total += 1
      if (item.status === 'completo') done += 1
    }
  }
  return { done, total }
}

export function defaultExpandedMrsItemIds(step: { themes: MrsTheme[] }): Set<string> {
  const ids = new Set<string>()
  for (const theme of step.themes) {
    for (const sub of theme.subthemes) {
      for (const item of sub.items) {
        if (item.filesCount === 0 && item.status !== 'na') ids.add(item.id)
      }
    }
  }
  return ids
}

export function formatMrsDateOnly(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}
