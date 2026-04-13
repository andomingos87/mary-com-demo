'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { MoreVertical, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RadarInviteAssetCta } from '@/components/radar/RadarInviteAssetCta'
import { cn } from '@/lib/utils'
import {
  INVESTOR_KANBAN_COLUMNS,
  filterInvestorKanbanCards,
} from '@/lib/demo/demo-investor-kanban'
import type { DemoInvestorKanbanCard, DemoInvestorKanbanColumnId } from '@/lib/demo/platform-data'
import { toast } from 'sonner'

type ColumnFilter = 'all' | DemoInvestorKanbanColumnId

export function DemoInvestorProjectsKanban({
  profileSlug,
  title,
  summary,
  cards,
}: {
  profileSlug: DemoProfileKeyForProjects
  title: string
  summary: string
  cards: DemoInvestorKanbanCard[]
}) {
  const [query, setQuery] = useState('')
  const [columnFilter, setColumnFilter] = useState<ColumnFilter>('all')

  const filtered = useMemo(
    () => filterInvestorKanbanCards(cards, query, columnFilter),
    [cards, query, columnFilter]
  )

  const byColumn = useMemo(() => {
    const map = new Map<DemoInvestorKanbanColumnId, DemoInvestorKanbanCard[]>()
    for (const col of INVESTOR_KANBAN_COLUMNS) {
      map.set(col.id, [])
    }
    for (const card of filtered) {
      const list = map.get(card.column)
      if (list) list.push(card)
    }
    return map
  }, [filtered])

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-base leading-7">{summary}</CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={columnFilter}
            onValueChange={(v) => setColumnFilter(v as ColumnFilter)}
          >
            <SelectTrigger className="h-10 w-full rounded-lg border-border sm:w-[200px]" aria-label="Filtrar por fase">
              <SelectValue placeholder="Fase" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="all" className="rounded-lg">
                Todos
              </SelectItem>
              {INVESTOR_KANBAN_COLUMNS.map((col) => (
                <SelectItem key={col.id} value={col.id} className="rounded-lg">
                  {col.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por empresa, projeto, segmento…"
              className="rounded-lg border-border pl-9"
              aria-label="Busca simulada na demo"
            />
          </div>
        </div>

        <RadarInviteAssetCta demoMode variant="button" />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          Nenhum projeto encontrado para os filtros atuais (demo).
        </p>
      ) : null}

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[1100px] gap-3 lg:min-w-0 lg:grid lg:grid-cols-6">
          {INVESTOR_KANBAN_COLUMNS.map((col) => {
            const columnCards = byColumn.get(col.id) ?? []
            return (
              <div
                key={col.id}
                className="flex w-[min(100%,280px)] shrink-0 flex-col rounded-lg border border-border bg-muted/30 lg:w-auto lg:min-w-0"
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <p className="text-xs font-semibold text-foreground">{col.label}</p>
                  <Badge variant="secondary" className="tabular-nums">
                    {columnCards.length}
                  </Badge>
                </div>
                <div className="flex min-h-[200px] flex-col gap-2 p-2">
                  {columnCards.map((card) => (
                    <KanbanCard key={card.id} card={card} profileSlug={profileSlug} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Perfil permitido na rota de projetos Kanban (investidor). */
export type DemoProfileKeyForProjects = 'investor'

function KanbanCard({
  card,
  profileSlug,
}: {
  card: DemoInvestorKanbanCard
  profileSlug: DemoProfileKeyForProjects
}) {
  const href = `/demo/${profileSlug}/projects/${card.codename}`

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card text-card-foreground shadow-card transition-smooth',
        'hover:border-primary/35 hover:shadow-elegant'
      )}
    >
      <Link
        href={href}
        className="block rounded-lg p-3 pr-10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <p className="text-sm font-semibold leading-snug text-foreground">{card.name}</p>

        <Badge variant="outline" className="mt-2 w-fit rounded-full px-2.5 py-0.5 text-xs font-normal">
          {card.typeLabel}
        </Badge>

        <div className="mt-3 flex items-end justify-between gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">ROB</p>
            <p className="tabular-nums font-semibold text-success">{card.rob}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">MRS</p>
            <p className="tabular-nums font-semibold text-amber-700 dark:text-amber-200">{card.mrs}</p>
          </div>
        </div>
      </Link>

      <div className="absolute right-1 top-1 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
              aria-label="Ações do projeto (demo)"
            >
              <MoreVertical className="h-4 w-4 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-lg">
            <DropdownMenuItem
              className="rounded-md"
              onSelect={() =>
                toast.message('Demo', { description: 'Ações do card são simuladas nesta demonstração.' })
              }
            >
              Abrir resumo
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-md"
              onSelect={() =>
                toast.message('Demo', { description: 'Mover fase estaria disponível no produto.' })
              }
            >
              Mover de fase
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
