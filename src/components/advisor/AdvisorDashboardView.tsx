'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, Flame, LineChart, Sparkles } from 'lucide-react'
import Link from 'next/link'

const MOCK_STATS = {
  mandatesActive: 3,
  mandatesInactive: 1,
  ddOpen: 1,
  closedYtd: 5,
}

const MOCK_OPPORTUNITIES = [
  {
    id: '1',
    name: 'Empresa Anônima · Fintech B2B',
    rob: 'R$ 8M',
    mrs: 52,
    ticket: 'R$ 5–15M',
    sector: 'Match com sua especialidade',
  },
  {
    id: '2',
    name: 'Projeto Neblina · Healthtech',
    rob: 'R$ 14M',
    mrs: 61,
    ticket: 'R$ 10–30M',
    sector: 'Demanda de assessoria',
  },
]

/**
 * Dashboard advisor com métricas e oportunidades de exemplo (demo).
 */
export function AdvisorDashboardView({ basePath = '/advisor' }: { basePath?: string }) {
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-border bg-card p-6 shadow-card">
        <p className="text-sm text-muted-foreground">
          Boas-vindas. Abaixo há <span className="font-medium text-foreground">dados de demonstração</span> para
          alinhar a UI à jornada (mandatos, oportunidades, performance).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardDescription>Mandatos ativos</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{MOCK_STATS.mandatesActive}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <Briefcase className="mb-1 inline h-4 w-4" /> Inclui sell-side e buy-side
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardDescription>Inativos / pausados</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{MOCK_STATS.mandatesInactive}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardDescription>Deals em DD</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{MOCK_STATS.ddOpen}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardDescription>Fechados (YTD)</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{MOCK_STATS.closedYtd}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <LineChart className="mb-1 inline h-4 w-4" /> Tombstones públicos alimentam reputação
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Novas oportunidades de mandato (demo)</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {MOCK_OPPORTUNITIES.map((op) => (
            <Card key={op.id} className="shadow-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{op.name}</CardTitle>
                  <Badge variant="secondary">MRS {op.mrs}</Badge>
                </div>
                <CardDescription>
                  ROB {op.rob} · {op.sector}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Captação alvo: <span className="font-medium text-foreground">{op.ticket}</span>
                </p>
                <Button size="sm" variant="outline" type="button" disabled>
                  Ver detalhes (demo)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-primary/20 bg-muted/10 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Mary AI — fila de trabalho (exemplo)</CardTitle>
          </div>
          <CardDescription>
            Rascunhos e sugestões aparecerão aqui; publicação sempre com revisão humana.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Gerar CIM do Projeto Aurora — revisão pendente</p>
          <p>• Responder Q&A do Fundo Beta — rascunho disponível</p>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`${basePath}/radar`}>Ir ao Radar</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
