'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DEMO_RADAR_OPPORTUNITIES } from '@/lib/demo/radar-mock-data'
import type { RadarOpportunity } from '@/types/radar'
import { FileText, Heart, Info } from 'lucide-react'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

/**
 * Oportunidades de exemplo (sem chamadas ao servidor) para estados vazios ou onboarding.
 */
export function RadarDemoShowcase() {
  const [items] = useState<RadarOpportunity[]>(DEMO_RADAR_OPPORTUNITIES)
  const [teaserOpenId, setTeaserOpenId] = useState<string | null>(null)
  const teaserItem = useMemo(
    () => items.find((item) => item.projectId === teaserOpenId) || null,
    [items, teaserOpenId]
  )

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-primary/30 bg-muted/20">
        <CardContent className="flex flex-wrap items-start gap-3 py-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden />
          <p>
            <span className="font-medium text-foreground">Visual de referência.</span> Estes cartões usam dados
            fictícios para mostrar como o Radar aparece após matches reais. Ações de NDA e follow permanecem
            desativadas nesta camada de demo.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((opportunity) => (
          <Card key={opportunity.projectId} className="opacity-95">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{opportunity.codename}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Demo
                    </Badge>
                  </div>
                  <CardDescription>Atualizado em {formatDate(opportunity.updatedAt)}</CardDescription>
                </div>
                <Badge>Score {opportunity.matchScore}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {opportunity.sector ? <Badge variant="outline">{opportunity.sector}</Badge> : null}
                {opportunity.matchReasons.map((reason) => (
                  <Badge key={reason} variant="secondary">
                    {reason}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setTeaserOpenId(opportunity.projectId)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Teaser
                </Button>
                <Button size="sm" variant="outline" type="button" disabled>
                  Solicitar NDA
                </Button>
                <Button size="sm" variant="outline" type="button" disabled>
                  <Heart className="mr-2 h-4 w-4" />
                  Seguir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!teaserItem} onOpenChange={() => setTeaserOpenId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{teaserItem?.codename || 'Teaser'}</DialogTitle>
            <DialogDescription>Conteúdo de demonstração — anonimizado.</DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {teaserItem?.teaserSummary}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
