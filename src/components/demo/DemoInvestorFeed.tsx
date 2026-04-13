'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ChevronRight, FileText, Globe, Sparkles, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatRelativeTimePtBr } from '@/lib/demo/feed-demo-utils'
import type {
  DemoFeedFilterTabKey,
  DemoFeedItem,
  DemoFeedItemKind,
  DemoProfileExperience,
} from '@/lib/demo/platform-data'
import { DemoAiQueueCard } from '@/components/demo/DemoAiQueueCard'

type FeedBlock = NonNullable<DemoProfileExperience['feed']>

function feedIcon(kind: DemoFeedItemKind | undefined) {
  switch (kind) {
    case 'vdr':
      return FileText
    case 'pipeline':
      return TrendingUp
    case 'mary_ai':
      return Sparkles
    case 'mercado':
      return Globe
    default:
      return FileText
  }
}

function matchesTab(item: DemoFeedItem, tab: DemoFeedFilterTabKey): boolean {
  if (tab === 'all') return true
  const k = item.kind ?? 'other'
  if (tab === 'vdr') return k === 'vdr'
  if (tab === 'pipeline') return k === 'pipeline'
  if (tab === 'mary_ai') return k === 'mary_ai'
  if (tab === 'mercado') return k === 'mercado'
  return false
}

function matchesProject(item: DemoFeedItem, projectValue: string): boolean {
  if (!projectValue || projectValue === 'all') return true
  if (!item.projectId) return true
  return item.projectId === projectValue
}

export function DemoInvestorFeed({ feed }: { feed: FeedBlock }) {
  const tabs = feed.filterTabs ?? [
    { key: 'all' as const, label: 'Todos' },
    { key: 'vdr' as const, label: 'VDR' },
    { key: 'pipeline' as const, label: 'Pipeline' },
    { key: 'mary_ai' as const, label: 'Mary AI' },
    { key: 'mercado' as const, label: 'Mercado' },
  ]
  const [activeTab, setActiveTab] = useState<DemoFeedFilterTabKey>('all')
  const [projectValue, setProjectValue] = useState('all')

  const filtered = useMemo(() => {
    return feed.items.filter((item) => matchesTab(item, activeTab) && matchesProject(item, projectValue))
  }, [feed.items, activeTab, projectValue])

  const projectLabel =
    feed.projectOptions?.find((o) => o.value === projectValue)?.label ?? 'Todos os projetos'

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-4">
        <nav aria-label="Trilha" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link href="/demo/investor/dashboard" className="transition-smooth hover:text-foreground">
            Início
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
          <span className="font-medium text-foreground">Feed</span>
        </nav>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
          <div className="space-y-6">
            <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
              <CardHeader className="space-y-4">
                <div>
                  <CardDescription className="text-base leading-7 text-foreground/90">{feed.summary}</CardDescription>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div
                    className="flex flex-wrap gap-2"
                    role="tablist"
                    aria-label="Filtrar por tipo de atualização"
                  >
                    {tabs.map((tab) => {
                      const selected = activeTab === tab.key
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          onClick={() => setActiveTab(tab.key)}
                          className={cn(
                            'rounded-full border px-4 py-2 text-sm font-medium transition-smooth',
                            selected
                              ? 'border-primary bg-primary text-primary-foreground shadow-card'
                              : 'border-border bg-card text-foreground hover:bg-muted/60'
                          )}
                        >
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
                    <div className="flex min-w-[200px] flex-1 flex-col gap-1.5 sm:max-w-xs">
                      <span className="sr-only" id="demo-feed-project-label">
                        Projeto
                      </span>
                      <Select value={projectValue} onValueChange={setProjectValue}>
                        <SelectTrigger
                          id="demo-feed-project"
                          aria-labelledby="demo-feed-project-label"
                          className="w-full rounded-lg"
                        >
                          <SelectValue placeholder="Selecione um projeto" />
                        </SelectTrigger>
                        <SelectContent>
                          {(feed.projectOptions ?? [
                            { value: 'all', label: 'Todos os projetos' },
                          ]).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          className="shrink-0 rounded-lg"
                          onClick={() =>
                            toast.info('Demo: convite de ativo seria enviado na plataforma real.', {
                              duration: 3500,
                            })
                          }
                        >
                          + Convidar Ativo
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">Ação mockada para a demo pública.</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground" aria-live="polite">
                  Exibindo {filtered.length} de {feed.items.length} atualizações
                  {projectLabel ? ` · ${projectLabel}` : ''}
                </p>
              </CardHeader>
            </Card>

            {filtered.length === 0 ? (
              <Card className="rounded-[28px] border-dashed border-border bg-muted/30 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Nenhum resultado</CardTitle>
                  <CardDescription>Ajuste os filtros ou selecione outro projeto.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              filtered.map((item) => {
                const Icon = feedIcon(item.kind)
                return (
                  <Card key={item.id} className="rounded-[28px] border-white/80 bg-white/90 shadow-card">
                    <CardHeader className="gap-3">
                      <div className="flex gap-4">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                          aria-hidden
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="rounded-full">
                              {item.tag}
                            </Badge>
                            {item.projectLabel ? (
                              <span className="text-sm font-medium text-foreground">{item.projectLabel}</span>
                            ) : null}
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTimePtBr(item.at)}
                            </span>
                          </div>
                          <CardTitle className="text-xl leading-snug">{item.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm leading-7 text-muted-foreground">{item.body}</CardContent>
                  </Card>
                )
              })
            )}
          </div>

          <DemoAiQueueCard prompts={feed.aiPrompts} />
        </div>
      </div>
    </TooltipProvider>
  )
}
