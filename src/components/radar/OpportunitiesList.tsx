'use client'

import { useMemo, useState, useTransition } from 'react'
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
import { Building2, Eye, FileText, Heart, MapPin, ShieldCheck, TrendingUp } from 'lucide-react'
import { DemoInvestorMatchSheet } from '@/components/demo/DemoInvestorMatchSheet'
import { RadarInviteAssetCta } from '@/components/radar/RadarInviteAssetCta'
import { requestNdaForOpportunity, toggleFollowOpportunity } from '@/lib/actions/radar'
import {
  demoRadarMatchBadgeClass,
  getDemoRadarCardScenarioInfo,
  resolveRadarDemoDisplay,
} from '@/lib/demo/radar-demo-display'
import type { RadarOpportunity } from '@/types/radar'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface OpportunitiesListProps {
  organizationId: string
  opportunities: RadarOpportunity[]
  readOnlyMode: boolean
  fallbackUsed: boolean
  /** Interações apenas no cliente (modo NEXT_PUBLIC_FRONTEND_DEMO). */
  demoMode?: boolean
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function OpportunitiesList({
  organizationId,
  opportunities,
  readOnlyMode,
  fallbackUsed,
  demoMode = false,
}: OpportunitiesListProps) {
  const [items, setItems] = useState(opportunities)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [teaserOpenId, setTeaserOpenId] = useState<string | null>(null)
  const [detailSheetId, setDetailSheetId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const teaserItem = useMemo(
    () => items.find((item) => item.projectId === teaserOpenId) || null,
    [items, teaserOpenId]
  )

  const handleToggleFollow = (projectId: string) => {
    if (demoMode) {
      setGlobalError(null)
      setItems((prev) =>
        prev.map((item) =>
          item.projectId === projectId
            ? {
                ...item,
                ctaState: {
                  ...item.ctaState,
                  isFollowing: !item.ctaState.isFollowing,
                },
              }
            : item
        )
      )
      return
    }
    startTransition(async () => {
      setGlobalError(null)
      const result = await toggleFollowOpportunity({ organizationId, projectId })
      if (!result.success || !result.data) {
        setGlobalError(result.error || 'Erro ao atualizar follow.')
        return
      }
      const followData = result.data

      setItems((prev) =>
        prev.map((item) =>
          item.projectId === projectId
            ? {
                ...item,
                ctaState: { ...item.ctaState, isFollowing: followData.isFollowing },
              }
            : item
        )
      )
    })
  }

  const handleRequestNda = (projectId: string) => {
    if (demoMode) {
      setGlobalError(null)
      setItems((prev) =>
        prev.map((item) =>
          item.projectId === projectId
            ? {
                ...item,
                ctaState: {
                  ...item.ctaState,
                  hasNdaRequest: true,
                  canRequestNda: false,
                },
              }
            : item
        )
      )
      return
    }
    startTransition(async () => {
      setGlobalError(null)
      const result = await requestNdaForOpportunity({ organizationId, projectId })
      if (!result.success || !result.data) {
        setGlobalError(result.error || 'Erro ao solicitar NDA.')
        return
      }
      const ndaData = result.data

      setItems((prev) =>
        prev.map((item) =>
          item.projectId === projectId
            ? {
                ...item,
                ctaState: {
                  ...item.ctaState,
                  hasNdaRequest: ndaData.created || item.ctaState.hasNdaRequest,
                  canRequestNda: false,
                },
              }
            : item
        )
      )
    })
  }

  return (
    <div className="space-y-4">
      {demoMode && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Modo demonstração</span> — oportunidades e ações
            (seguir / NDA) são simuladas; nada é gravado no banco. Desative com{' '}
            <code className="rounded bg-muted px-1 text-xs">NEXT_PUBLIC_FRONTEND_DEMO=false</code>.
          </CardContent>
        </Card>
      )}

      {fallbackUsed && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            Não encontramos oportunidades acima do threshold inicial. Exibindo melhores opções atuais para
            calibrar sua tese.
          </CardContent>
        </Card>
      )}

      {readOnlyMode && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            Sua organização está em análise. Você pode visualizar oportunidades, mas CTAs de relacionamento
            ficam indisponíveis até aprovação.
          </CardContent>
        </Card>
      )}

      {globalError && (
        <Card className="border-destructive/40">
          <CardContent className="py-3 text-sm text-destructive">{globalError}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((opportunity) => {
          if (demoMode) {
            const d = resolveRadarDemoDisplay(opportunity)
            const scenario = getDemoRadarCardScenarioInfo(opportunity)
            return (
              <div
                key={opportunity.projectId}
                className="flex flex-col rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug text-foreground">{opportunity.codename}</p>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums',
                          demoRadarMatchBadgeClass(d.matchPct)
                        )}
                      >
                        {d.matchPct}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">{d.sectorLabel}</span>
                      <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-normal">
                        {d.sectorTag}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          scenario.badgeClassName
                        )}
                      >
                        {scenario.badgeLabel}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{d.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{d.stage}</span>
                    </div>

                    {scenario.readinessForCard === null ? (
                      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-muted-foreground">Readiness Score</span>
                          <span className="text-xs font-medium text-foreground">Não calculado</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          Pré-cadastro — teaser básico (Mary AI, dados públicos).
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-background/80 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-muted-foreground">Readiness Score</span>
                          <span className="tabular-nums font-medium text-foreground">
                            {scenario.readinessForCard}/100
                          </span>
                        </div>
                        <Progress value={scenario.readinessForCard} className="mt-2 h-2 bg-secondary" />
                      </div>
                    )}

                    <div className="rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                      <p className="text-xs text-muted-foreground">{d.arrLabel}</p>
                      <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-foreground">
                        {d.arrValue}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-lg border-border bg-background font-medium shadow-none transition-smooth hover:bg-muted/50"
                    onClick={() =>
                      opportunity.ctaState.canViewTeaser ? setDetailSheetId(opportunity.projectId) : undefined
                    }
                    disabled={!opportunity.ctaState.canViewTeaser}
                  >
                    <Eye className="mr-2 h-4 w-4" aria-hidden />
                    Ver detalhes
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <Card key={opportunity.projectId}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{opportunity.codename}</CardTitle>
                    <CardDescription>Atualizado em {formatDate(opportunity.updatedAt)}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Badge>Score {opportunity.matchScore}</Badge>
                    {opportunity.mrsScore != null ? (
                      <Badge variant="secondary">MRS {opportunity.mrsScore}</Badge>
                    ) : null}
                  </div>
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
                  {opportunity.matchReasons.length === 0 ? (
                    <Badge variant="outline">Sem critérios aderentes mapeados</Badge>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTeaserOpenId(opportunity.projectId)}
                    disabled={!opportunity.ctaState.canViewTeaser}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {opportunity.ctaState.canViewTeaser ? 'Ver Teaser' : 'Teaser indisponível'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleRequestNda(opportunity.projectId)}
                    disabled={
                      (!demoMode && isPending) ||
                      readOnlyMode ||
                      !opportunity.ctaState.canRequestNda ||
                      opportunity.ctaState.hasNdaRequest
                    }
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {opportunity.ctaState.hasNdaRequest ? 'NDA solicitado' : 'Solicitar NDA'}
                  </Button>

                  <Button
                    size="sm"
                    variant={opportunity.ctaState.isFollowing ? 'default' : 'outline'}
                    onClick={() => handleToggleFollow(opportunity.projectId)}
                    disabled={(!demoMode && isPending) || readOnlyMode}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {opportunity.ctaState.isFollowing ? 'Seguindo' : 'Seguir'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        <RadarInviteAssetCta demoMode={demoMode} />
      </div>

      {demoMode ? (
        <DemoInvestorMatchSheet
          open={detailSheetId !== null}
          opportunity={
            detailSheetId ? items.find((o) => o.projectId === detailSheetId) ?? null : null
          }
          onOpenChange={(next) => {
            if (!next) setDetailSheetId(null)
          }}
          onToggleFollow={handleToggleFollow}
        />
      ) : null}

      {!demoMode ? (
        <Dialog open={!!teaserItem} onOpenChange={() => setTeaserOpenId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{teaserItem?.codename || 'Teaser'}</DialogTitle>
              <DialogDescription>
                Preview do teaser com dados permitidos antes do fluxo de NDA.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {teaserItem?.teaserSummary || 'Teaser indisponível para esta oportunidade.'}
            </p>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
