'use client'

import * as React from 'react'
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  FileText,
  Info,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { MrsItem, MrsPriority, MrsStatus, MrsStep } from '@/types/projects'
import {
  defaultExpandedMrsItemIds,
  formatMrsDateOnly,
  mrsThemeProgress,
} from '@/components/mrs/mrs-step-helpers'

export type MrsItemDraft = {
  ownerUserId?: string
  comments?: string
  fileName?: string
  fileUrl?: string
}

function ensureDraft(base?: MrsItemDraft): MrsItemDraft {
  return {
    ownerUserId: base?.ownerUserId ?? '',
    comments: base?.comments ?? '',
    fileName: base?.fileName ?? '',
    fileUrl: base?.fileUrl ?? '',
  }
}

export function MrsStatusPill({ status }: { status: MrsStatus }) {
  const base = 'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold'
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
  if (status === 'na') {
    return <span className={cn(base, 'border-border bg-muted text-muted-foreground')}>N/A</span>
  }
  return <span className={cn(base, 'border-destructive/40 bg-destructive/15 text-destructive')}>Pendente</span>
}

type MrsStepItemsPanelProps = {
  step: MrsStep
  mode: 'interactive' | 'demo'
  drafts?: Record<string, MrsItemDraft>
  onDraftChange?: (itemId: string, partial: Partial<MrsItemDraft>) => void
  onStatusChange?: (itemId: string, status: MrsStatus) => void
  onPriorityChange?: (itemId: string, priority: MrsPriority) => void
  onSaveMetadata?: (itemId: string) => void
  onRegisterUpload?: (itemId: string) => void
  disabled?: boolean
}

export function MrsStepItemsPanel({
  step,
  mode,
  drafts = {},
  onDraftChange,
  onStatusChange,
  onPriorityChange,
  onSaveMetadata,
  onRegisterUpload,
  disabled,
}: MrsStepItemsPanelProps) {
  const [openRows, setOpenRows] = React.useState<Set<string>>(() => defaultExpandedMrsItemIds(step))

  React.useEffect(() => {
    setOpenRows(defaultExpandedMrsItemIds(step))
  }, [step])

  const toggleRow = (itemId: string) => {
    setOpenRows((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const setDraft = (itemId: string, partial: Partial<MrsItemDraft>) => {
    if (mode !== 'interactive' || !onDraftChange) return
    onDraftChange(itemId, partial)
  }

  const handleDrop = (itemId: string, event: React.DragEvent) => {
    event.preventDefault()
    if (mode !== 'interactive' || disabled) return
    const file = event.dataTransfer.files?.[0]
    if (file) setDraft(itemId, { fileName: file.name })
  }

  const interactive = mode === 'interactive'

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">
        {step.themes.map((theme) => {
          const { done, total } = mrsThemeProgress(theme)
          return (
            <Collapsible key={theme.id} defaultOpen className="rounded-lg border border-border bg-card shadow-card">
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-smooth hover:bg-muted/50">
                <div className="flex min-w-0 items-center gap-2">
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                  <span className="truncate text-base font-semibold text-foreground">{theme.name}</span>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                  {done} / {total}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="overflow-x-auto border-t border-border">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3 w-10" aria-hidden />
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
                            Comentários
                            <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {theme.subthemes.flatMap((sub) =>
                        sub.items.map((item) => {
                          const open = openRows.has(item.id)
                          const draft = ensureDraft({
                            ...drafts[item.id],
                            ownerUserId: drafts[item.id]?.ownerUserId ?? item.ownerUserId ?? '',
                            comments: drafts[item.id]?.comments ?? item.comments ?? '',
                          })
                          return (
                            <MrsItemRows
                              key={item.id}
                              item={item}
                              subthemeName={sub.name}
                              open={open}
                              onToggle={() => toggleRow(item.id)}
                              draft={draft}
                              interactive={interactive}
                              disabled={!!disabled}
                              onDraftChange={(partial) => setDraft(item.id, partial)}
                              onStatusChange={onStatusChange ? (s) => onStatusChange(item.id, s) : undefined}
                              onPriorityChange={onPriorityChange ? (p) => onPriorityChange(item.id, p) : undefined}
                              onSaveMetadata={onSaveMetadata ? () => onSaveMetadata(item.id) : undefined}
                              onRegisterUpload={onRegisterUpload ? () => onRegisterUpload(item.id) : undefined}
                              onDrop={(e) => handleDrop(item.id, e)}
                            />
                          )
                        })
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

type MrsItemRowsProps = {
  item: MrsItem
  subthemeName: string
  open: boolean
  onToggle: () => void
  draft: MrsItemDraft
  interactive: boolean
  disabled: boolean
  onDraftChange: (partial: Partial<MrsItemDraft>) => void
  onStatusChange?: (status: MrsStatus) => void
  onPriorityChange?: (priority: MrsPriority) => void
  onSaveMetadata?: () => void
  onRegisterUpload?: () => void
  onDrop: (e: React.DragEvent) => void
}

function MrsItemRows({
  item,
  subthemeName,
  open,
  onToggle,
  draft,
  interactive,
  disabled,
  onDraftChange,
  onStatusChange,
  onPriorityChange,
  onSaveMetadata,
  onRegisterUpload,
  onDrop,
}: MrsItemRowsProps) {
  const hasFiles = item.files.length > 0

  return (
    <>
      <tr className="border-b border-border/60 last:border-0">
        <td className="px-2 py-3 align-top">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={open ? 'Recolher detalhes do item' : 'Expandir detalhes do item'}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </td>
        <td className="px-2 py-3 align-top text-foreground">{subthemeName}</td>
        <td className="px-4 py-3 align-top">
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">{item.title}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="mt-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Sobre este documento"
                >
                  <Info className="h-4 w-4 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs text-xs">
                {item.description?.trim()
                  ? item.description
                  : 'Documento esperado neste passo do MRS. Envie arquivos para análise e registro de prontidão.'}
              </TooltipContent>
            </Tooltip>
          </div>
        </td>
        <td className="px-4 py-3 align-top text-muted-foreground">{formatMrsDateOnly(item.lastUploadAt)}</td>
        <td className="px-4 py-3 align-top">
          <MrsStatusPill status={item.status} />
        </td>
        <td className="px-4 py-3 align-top text-foreground">
          {item.ownerUserId?.trim() ? item.ownerUserId : '—'}
        </td>
        <td className="px-4 py-3 align-top text-muted-foreground">
          {item.comments?.trim() ? item.comments : '—'}
        </td>
      </tr>
      {open ? (
        <tr className="border-b border-border/60 bg-muted/25 last:border-0">
          <td colSpan={7} className="px-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0" />
                {hasFiles ? (
                  <ul className="space-y-1">
                    {item.files.map((f) => (
                      <li key={f.id} className="text-foreground">
                        <span className="font-medium">{f.fileName}</span>
                        <span className="text-muted-foreground">
                          {' '}
                          · {formatMrsDateOnly(f.uploadedAt)}
                          {f.uploadedBy ? ` · ${f.uploadedBy}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>Nenhum arquivo enviado ainda</span>
                )}
              </div>

              <div
                className={cn(
                  'flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center transition-smooth',
                  interactive && !disabled && 'hover:border-primary/40 hover:bg-muted/30'
                )}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = interactive ? 'copy' : 'none'
                }}
                onDrop={onDrop}
              >
                <Upload className="h-6 w-6 text-muted-foreground" aria-hidden />
                <p className="text-sm font-medium text-foreground">
                  Arraste um arquivo aqui para análise da Mary AI
                </p>
                {!interactive && (
                  <p className="max-w-md text-xs text-muted-foreground">
                    Na demonstração o upload é apenas visual. Na área logada do MRS você registra o arquivo após
                    soltar ou preencher os dados abaixo.
                  </p>
                )}
              </div>

              {interactive ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                    <Select
                      value={item.status}
                      onValueChange={(v) => onStatusChange?.(v as MrsStatus)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="parcial">Parcial</SelectItem>
                        <SelectItem value="completo">Completo</SelectItem>
                        <SelectItem value="na">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Prioridade</p>
                    <Select
                      value={item.priority}
                      onValueChange={(v) => onPriorityChange?.(v as MrsPriority)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critica">Crítica</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Responsável (ex.: Sócio)"
                    value={draft.ownerUserId ?? ''}
                    onChange={(e) => onDraftChange({ ownerUserId: e.target.value })}
                    disabled={disabled}
                  />
                  <Input
                    placeholder="Nome do arquivo (ou use arrastar e soltar)"
                    value={draft.fileName ?? ''}
                    onChange={(e) => onDraftChange({ fileName: e.target.value })}
                    disabled={disabled}
                  />
                  <Input
                    className="md:col-span-2"
                    placeholder="URL do arquivo (opcional)"
                    value={draft.fileUrl ?? ''}
                    onChange={(e) => onDraftChange({ fileUrl: e.target.value })}
                    disabled={disabled}
                  />
                  <Textarea
                    className="md:col-span-2"
                    placeholder="Comentários do item"
                    value={draft.comments ?? ''}
                    onChange={(e) => onDraftChange({ comments: e.target.value })}
                    disabled={disabled}
                    rows={3}
                  />
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onSaveMetadata}
                      disabled={disabled}
                    >
                      Atualizar metadados
                    </Button>
                    <Button type="button" size="sm" onClick={onRegisterUpload} disabled={disabled}>
                      Registrar upload
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}
