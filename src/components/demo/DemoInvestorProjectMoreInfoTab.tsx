'use client'

import { useMemo } from 'react'
import { ArrowUpDown, ChevronDown, Eye, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type {
  DemoProjectMoreInfoRow,
  DemoProjectMoreInfoSection,
} from '@/lib/demo/platform-data'

export type DemoInvestorMoreInfoVisibility = {
  /** `true` a partir da coluna NDA do Kanban (demo); libera linhas `all_with_nda`. */
  hasNda: boolean
}

function sharedWithLabel(sharedWith: DemoProjectMoreInfoRow['sharedWith']): string {
  if (sharedWith === 'all_with_nda') return 'Todos c/ NDA'
  return 'Somente solicitante'
}

/** Linha visível ao investidor: nunca `requester_only`; `all_with_nda` só com NDA mock ativo. */
export function filterMoreInfoRowForInvestor(
  row: DemoProjectMoreInfoRow,
  visibility: DemoInvestorMoreInfoVisibility
): boolean {
  if (row.sharedWith === 'requester_only') return false
  if (row.sharedWith === 'all_with_nda') return visibility.hasNda
  return true
}

function StatusBadge({ status }: { status: DemoProjectMoreInfoRow['status'] }) {
  const base = 'rounded-full border px-2.5 py-0.5 text-xs font-semibold'
  if (status === 'completo') {
    return <span className={cn(base, 'border-success/40 bg-success/15 text-success')}>Completo</span>
  }
  if (status === 'parcial') {
    return (
      <span className={cn(base, 'border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100')}>
        Parcial
      </span>
    )
  }
  return <span className={cn(base, 'border-destructive/40 bg-destructive/15 text-destructive')}>Pendente</span>
}

type DemoInvestorProjectMoreInfoTabProps = {
  sections: DemoProjectMoreInfoSection[]
  visibility: DemoInvestorMoreInfoVisibility
}

export function DemoInvestorProjectMoreInfoTab({ sections, visibility }: DemoInvestorProjectMoreInfoTabProps) {
  const filteredBySection = useMemo(() => {
    return sections.map((section) => ({
      section,
      rows: section.rows.filter((row) => filterMoreInfoRowForInvestor(row, visibility)),
    }))
  }, [sections, visibility])

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-4">
        {filteredBySection.map(({ section, rows }) => {
          const total = section.rows.length
          const visible = rows.length
          return (
            <Collapsible key={section.id} defaultOpen className="rounded-lg border border-border bg-card shadow-card">
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-smooth hover:bg-muted/50">
                <span className="flex min-w-0 items-center gap-2">
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=closed]:-rotate-90" aria-hidden />
                  <span className="truncate text-base font-semibold text-foreground">{section.title}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                  {visible} / {total}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="overflow-x-auto border-t border-border">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3">
                          <span className="inline-flex items-center gap-1">
                            Subtema
                            <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                          </span>
                        </th>
                        <th className="px-4 py-3">
                          <span className="inline-flex items-center gap-1">
                            Item / Documento
                            <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                          </span>
                        </th>
                        <th className="px-4 py-3">
                          <span className="inline-flex items-center gap-1">
                            Data de Upload
                            <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                          </span>
                        </th>
                        <th className="px-4 py-3">
                          <span className="inline-flex items-center gap-1">
                            Status
                            <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                          </span>
                        </th>
                        <th className="px-4 py-3">
                          <span className="inline-flex items-center gap-1">
                            Responsável
                            <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                          </span>
                        </th>
                        <th className="px-4 py-3">
                          <span className="inline-flex items-center gap-1">
                            Compartilhado com
                            <Eye className="h-3 w-3 opacity-60" aria-hidden />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                            {visibility.hasNda
                              ? 'Nenhum documento disponível para o seu perfil nesta seção.'
                              : 'Documentos liberados após NDA assinado aparecerão aqui.'}
                          </td>
                        </tr>
                      ) : (
                        rows.map((row) => (
                          <tr key={row.id} className="border-b border-border/60 last:border-0">
                            <td className="px-4 py-3 align-top text-foreground">{row.subtheme}</td>
                            <td className="px-4 py-3 align-top">
                              <span className="inline-flex items-center gap-1.5">
                                {row.itemDocument}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="inline-flex shrink-0 rounded-md text-muted-foreground hover:text-foreground"
                                      aria-label={`Sobre ${row.itemDocument}`}
                                    >
                                      <Info className="h-3.5 w-3.5" aria-hidden />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs text-left text-xs">
                                    Documento mock na demo; no produto viria do VDR.
                                  </TooltipContent>
                                </Tooltip>
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top tabular-nums text-muted-foreground">
                              {row.uploadDate ?? '—'}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <StatusBadge status={row.status} />
                            </td>
                            <td className="px-4 py-3 align-top text-foreground">{row.responsible}</td>
                            <td className="px-4 py-3 align-top text-muted-foreground">
                              {sharedWithLabel(row.sharedWith)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
