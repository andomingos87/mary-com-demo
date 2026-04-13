'use client'

import {
  AlertTriangle,
  Building2,
  Calendar,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'
import type { TeaserModalViewModel } from '@/lib/demo/radar-demo-display'
import { cn } from '@/lib/utils'

export function TeaserModal({
  open,
  onOpenChange,
  model,
  isFollowing,
  onToggleFollow,
  onRequestContact,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  model: TeaserModalViewModel | null
  isFollowing: boolean
  onToggleFollow: () => void
  onRequestContact: () => void
}) {
  if (!model) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-lg border-border bg-card shadow-card sm:max-w-2xl">
          <p className="text-sm text-muted-foreground">Nenhum dado de teaser disponível.</p>
        </DialogContent>
      </Dialog>
    )
  }

  const isPre = model.registration_status === 'pre_registration'

  const contactLabel = model.has_advisor ? 'Contatar Advisor' : 'Contatar Empresa'
  const showContactCta = !isPre

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-lg border-border bg-card p-0 text-card-foreground shadow-card sm:max-w-2xl">
        <DialogHeader className="shrink-0 space-y-4 border-b border-border px-6 pb-4 pt-6 text-left">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-7 w-7 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1 space-y-3">
              <DialogTitle className="text-left text-xl font-semibold text-foreground">
                {model.company_name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Teaser e métricas do ativo para análise do investidor.
              </DialogDescription>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{model.sector}</Badge>
                <Badge variant="outline">{model.segment}</Badge>
                {isPre ? (
                  <Badge
                    variant="secondary"
                    className="border border-amber-500/40 bg-amber-500/10 font-normal text-amber-950 dark:text-amber-100"
                  >
                    Pré-cadastro
                  </Badge>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                  <span>{model.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                  <span>{model.stage}</span>
                </div>
                {model.teaser.founded_year != null ? (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                    <span>Fundada em {model.teaser.founded_year}</span>
                  </div>
                ) : null}
                {model.teaser.employees_range ? (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                    <span>{model.teaser.employees_range} funcionários</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 [max-height:85vh] sm:max-h-[85vh]">
          <div className="space-y-6">
            {isPre || model.readiness_score === null ? (
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400"
                    aria-hidden
                  />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">
                      Esta empresa ainda não possui Readiness Score calculado
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {isPre
                        ? 'Teaser básico gerado pela Mary AI com base em informações públicas.'
                        : 'Teaser gerado pela Mary AI com base em informações públicas.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Readiness Score</span>
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    {model.readiness_score}/100
                  </span>
                </div>
                <Progress value={model.readiness_score} className="h-2 bg-secondary" />
              </div>
            )}

            <section>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <h3 className="text-sm font-semibold text-foreground">Descrição</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{model.teaser.description}</p>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Destaques</h3>
              <ul className="space-y-2">
                {model.teaser.highlights.map((line) => (
                  <li key={line} className="flex gap-2 text-sm text-muted-foreground">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Métricas-chave</h3>
              <div className="grid grid-cols-2 gap-3">
                {model.teaser.key_metrics.map((m) => (
                  <div
                    key={`${m.label}-${m.value}`}
                    className="rounded-lg border border-border bg-secondary/30 p-3"
                  >
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-semibold text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle
                  className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400"
                  aria-hidden
                />
                <h3 className="text-sm font-semibold text-foreground">Riscos / Atenção</h3>
              </div>
              <ul className="space-y-2">
                {model.risks_attention.map((line) => (
                  <li key={line} className="flex gap-2 text-sm text-muted-foreground">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-stretch">
          <Button
            type="button"
            variant={isFollowing ? 'secondary' : 'outline'}
            className="rounded-lg sm:flex-1"
            onClick={onToggleFollow}
          >
            <Star
              className={cn('mr-2 h-4 w-4', isFollowing && 'fill-primary text-primary')}
              aria-hidden
            />
            {isFollowing ? 'Acompanhando esse ativo' : 'Acompanhar este ativo'}
          </Button>
          {showContactCta ? (
            <Button
              type="button"
              className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-1"
              onClick={onRequestContact}
            >
              {contactLabel}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
