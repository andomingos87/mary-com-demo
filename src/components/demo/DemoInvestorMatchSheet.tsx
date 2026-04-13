'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { AlertTriangle, Briefcase, Eye, MapPin, Star, Target } from 'lucide-react'
import { toast } from 'sonner'
import { TeaserModal } from '@/components/demo/TeaserModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  demoRadarMatchBadgeClass,
  getDemoMatchBreakdown,
  getDemoPersonaBadge,
  getDemoRadarCardScenarioInfo,
  resolveRadarDemoDisplay,
  resolveTeaserModalModel,
} from '@/lib/demo/radar-demo-display'
import { cn } from '@/lib/utils'
import type { RadarOpportunity } from '@/types/radar'

const BREAKDOWN_KEYS = [
  { key: 'segmento' as const, label: 'Segmento' },
  { key: 'cheque' as const, label: 'Cheque' },
  { key: 'geografia' as const, label: 'Geografia' },
  { key: 'estagio' as const, label: 'Estágio' },
  { key: 'estrategia' as const, label: 'Estratégia' },
]

export function DemoInvestorMatchSheet({
  opportunity,
  open,
  onOpenChange,
  onToggleFollow,
}: {
  opportunity: RadarOpportunity | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Atualiza follow na lista (demo). */
  onToggleFollow?: (projectId: string) => void
}) {
  const advisorMsgId = useId()
  const [teaserOpen, setTeaserOpen] = useState(false)
  const [advisorOpen, setAdvisorOpen] = useState(false)
  const [advisorMessage, setAdvisorMessage] = useState('')

  const teaserModel = useMemo(
    () => (opportunity ? resolveTeaserModalModel(opportunity) : null),
    [opportunity]
  )

  const scenario = useMemo(
    () => (opportunity ? getDemoRadarCardScenarioInfo(opportunity) : null),
    [opportunity]
  )

  useEffect(() => {
    if (!open) {
      setTeaserOpen(false)
      setAdvisorOpen(false)
      setAdvisorMessage('')
    }
  }, [open])

  const display = opportunity ? resolveRadarDemoDisplay(opportunity) : null
  const breakdown = opportunity ? getDemoMatchBreakdown(opportunity) : null
  const persona = opportunity ? getDemoPersonaBadge(opportunity) : ''

  const handleAdvisorSubmit = () => {
    const label = teaserModel?.has_advisor ? 'Advisor' : 'Empresa'
    toast.success(`Mensagem para ${label} simulada (demo)`, {
      description: advisorMessage.trim()
        ? 'Sua mensagem foi simulada — nada é enviado de verdade.'
        : 'Envio simulado sem mensagem adicional.',
    })
    setAdvisorOpen(false)
    setAdvisorMessage('')
  }

  const contactAdvisorLabel = teaserModel?.has_advisor ? 'Contatar Advisor' : 'Contatar Empresa'
  const showContactSheet = teaserModel?.registration_status !== 'pre_registration'

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
          {!opportunity || !display || !breakdown ? (
            <div className="p-6 text-sm text-muted-foreground">
              Oportunidade indisponível ou removida dos filtros.
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              <SheetHeader className="space-y-4 border-b border-border px-6 pb-4 pt-6 text-left">
                <div className="flex items-start gap-3 pr-8">
                  <Briefcase className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <SheetTitle className="text-left text-xl font-semibold leading-snug">
                        {opportunity.codename}
                      </SheetTitle>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums',
                          demoRadarMatchBadgeClass(opportunity.matchScore)
                        )}
                      >
                        {opportunity.matchScore}%
                      </span>
                    </div>
                    <SheetDescription className="sr-only">
                      Detalhes do match e critérios de aderência (demonstração).
                    </SheetDescription>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="border border-border bg-muted font-normal text-foreground"
                      >
                        {persona}
                      </Badge>
                      <Badge variant="outline" className="font-semibold">
                        Match: {opportunity.matchScore}%
                      </Badge>
                      {scenario ? (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            scenario.badgeClassName
                          )}
                        >
                          {scenario.badgeLabel}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                      <span>{display.location}</span>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
                {scenario?.readinessForCard === null ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Readiness Score</span>
                      <span className="text-xs font-medium text-foreground">Não calculado</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Pré-cadastro — teaser básico (Mary AI, dados públicos).
                    </p>
                  </div>
                ) : null}

                <section>
                  <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                    <Target className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <h3>Breakdown do Match</h3>
                  </div>
                  <div className="space-y-3">
                    {BREAKDOWN_KEYS.map(({ key, label }) => {
                      const value = breakdown[key]
                      return (
                        <div key={key}>
                          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="tabular-nums font-medium text-foreground">{value}%</span>
                          </div>
                          <Progress value={value} className="h-2 bg-secondary" />
                        </div>
                      )
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 font-semibold text-foreground">Por que este match?</h3>
                  <ul className="space-y-2">
                    {opportunity.matchReasons.map((reason) => (
                      <li key={reason} className="flex gap-2 text-sm text-muted-foreground">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground"
                          aria-hidden
                        />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <h3>Riscos/Atenção</h3>
                  </div>
                  <ul className="space-y-2">
                    {(teaserModel?.risks_attention ?? []).map((risk) => (
                      <li key={risk} className="flex gap-2 text-sm text-muted-foreground">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground"
                          aria-hidden
                        />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="border-t border-border px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-stretch">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg sm:flex-1"
                    onClick={() => setTeaserOpen(true)}
                    disabled={!opportunity.ctaState.canViewTeaser}
                  >
                    <Eye className="mr-2 h-4 w-4" aria-hidden />
                    Ver Teaser
                  </Button>
                  <Button
                    type="button"
                    variant={opportunity.ctaState.isFollowing ? 'secondary' : 'outline'}
                    className="rounded-lg sm:flex-1"
                    onClick={() => onToggleFollow?.(opportunity.projectId)}
                    disabled={!onToggleFollow}
                  >
                    <Star
                      className={cn(
                        'mr-2 h-4 w-4',
                        opportunity.ctaState.isFollowing && 'fill-primary text-primary'
                      )}
                      aria-hidden
                    />
                    {opportunity.ctaState.isFollowing ? 'Acompanhando esse ativo' : 'Acompanhar'}
                  </Button>
                  {showContactSheet ? (
                    <Button
                      type="button"
                      className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-1"
                      onClick={() => setAdvisorOpen(true)}
                    >
                      {contactAdvisorLabel}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <TeaserModal
        open={teaserOpen}
        onOpenChange={setTeaserOpen}
        model={teaserModel}
        isFollowing={opportunity?.ctaState.isFollowing ?? false}
        onToggleFollow={() => {
          if (opportunity) onToggleFollow?.(opportunity.projectId)
        }}
        onRequestContact={() => {
          setTeaserOpen(false)
          setAdvisorOpen(true)
        }}
      />

      <Dialog open={advisorOpen} onOpenChange={setAdvisorOpen}>
        <DialogContent className="rounded-lg border-border bg-card shadow-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{contactAdvisorLabel}</DialogTitle>
            <DialogDescription>
              Mensagem opcional (somente simulação na demo). Nada é enviado ao servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={advisorMsgId}>Mensagem</Label>
            <Textarea
              id={advisorMsgId}
              value={advisorMessage}
              onChange={(e) => setAdvisorMessage(e.target.value)}
              placeholder="Ex.: Gostaríamos de agendar uma call introdutória..."
              className="min-h-[100px] resize-none rounded-lg"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setAdvisorOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleAdvisorSubmit}
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
