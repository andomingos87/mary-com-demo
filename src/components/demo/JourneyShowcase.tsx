import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Flame,
  Layers3,
  Sparkles,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DEMO_JOURNEYS, type DemoJourney, type DemoProfileKey } from '@/lib/demo/journey-data'

const PROFILE_ICON: Record<DemoProfileKey, typeof Briefcase> = {
  investor: Briefcase,
  asset: Building2,
  advisor: Users,
}

const PROFILE_BADGE: Record<DemoProfileKey, string> = {
  investor: 'Deal Flow',
  asset: 'MRS + Projeto',
  advisor: 'Operacao + IA',
}

interface JourneyShowcaseProps {
  journeys?: DemoJourney[]
}

export function JourneyShowcase({ journeys = DEMO_JOURNEYS }: JourneyShowcaseProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_40%),linear-gradient(180deg,#08111f_0%,#0d1728_42%,#f7f5ef_42%,#f7f5ef_100%)] text-foreground">
      <section className="border-b border-white/10 px-4 pb-16 pt-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-white/90">
                Demo Journey Mode
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-4xl font-serif text-4xl leading-none sm:text-5xl lg:text-6xl">
                  Jornadas demo da Mary com campos, fluxos e telas prontas para apresentacao.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-white/72 sm:text-lg">
                  Esta pagina concentra a narrativa completa de <span className="text-white">investidor</span>,{' '}
                  <span className="text-white">ativo</span> e <span className="text-white">advisor</span> com dados
                  mockados, sequencia de onboarding e modulos-chave para demonstracao sem depender do banco real.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {journeys.map((journey) => (
                  <Button
                    key={journey.profile}
                    asChild
                    variant="outline"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link href={`#${journey.profile}`}>
                      Ir para {journey.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <MetricTile label="Perfis cobertos" value="3" detail="Investidor, Ativo e Advisor" />
              <MetricTile label="Onboardings narrados" value="10" detail="Com todos os campos da jornada" />
              <MetricTile label="Modulos-chave" value="12+" detail="Radar, tese, MRS, projetos, feed e IA" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="grid gap-4 lg:grid-cols-3">
            {journeys.map((journey) => {
              const Icon = PROFILE_ICON[journey.profile]
              return (
                <Card key={journey.profile} className="border-border/60 bg-white/80 shadow-[0_18px_60px_rgba(8,17,31,0.10)] backdrop-blur">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                          {PROFILE_BADGE[journey.profile]}
                        </Badge>
                        <div>
                          <CardTitle className="text-2xl">{journey.label}</CardTitle>
                          <CardDescription className="pt-2 text-sm leading-6">
                            {journey.tagline}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-muted-foreground">{journey.summary}</p>
                    <div className="grid gap-2 text-sm">
                      <InlineMeta label="Landing" value={journey.landingRoute} />
                      <InlineMeta label="Cadastro" value={journey.registerRoute} />
                      <InlineMeta label="Telas chave" value={`${journey.keyScreens.length} modulos narrados`} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {journeys.map((journey) => (
            <ProfileSection key={journey.profile} journey={journey} />
          ))}

          <Card className="border-border/70 bg-white/90 shadow-[0_16px_48px_rgba(8,17,31,0.08)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <CardTitle>Como apresentar esta demo</CardTitle>
              </div>
              <CardDescription>
                Use a pagina como storyboard principal e, quando quiser mostrar telas reais do app, ative o modo demo do frontend.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <HighlightCard
                title="1. Storytelling"
                text="Passe pela jornada publica, onboarding e modulos-chave na ordem em que o usuario percebe valor."
              />
              <HighlightCard
                title="2. Tela real"
                text="Com `NEXT_PUBLIC_FRONTEND_DEMO=true`, radar, feed e pipeline ja passam a exibir dados ficticios nas telas protegidas."
              />
              <HighlightCard
                title="3. Fechamento"
                text="Use os blocos de efeito de rede para explicar como cada acao gera valor para outro ator da plataforma."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function ProfileSection({ journey }: { journey: DemoJourney }) {
  const Icon = PROFILE_ICON[journey.profile]

  return (
    <section
      id={journey.profile}
      className="scroll-mt-24 rounded-[32px] border border-border/60 bg-white/92 p-6 shadow-[0_22px_70px_rgba(8,17,31,0.10)] sm:p-8"
    >
      <div className={`rounded-[28px] bg-gradient-to-br ${journey.accent} p-6`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-border/60 bg-background/80 p-3 text-primary shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                Jornada {journey.label}
              </Badge>
            </div>
            <div className="space-y-3">
              <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">{journey.label}</h2>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{journey.summary}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <MiniStat label="Campos de cadastro" value={String(journey.signupFields.length)} />
            <MiniStat label="Etapas de onboarding" value={String(journey.onboardingSteps.length)} />
            <MiniStat label="Telas demo" value={String(journey.keyScreens.length)} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-8">
          <Card className="border-border/60 bg-background/75">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-primary" />
                <CardTitle>Entrada e cadastro</CardTitle>
              </div>
              <CardDescription>
                Abertura publica, CTA principal e formulario inicial com valores demo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <InlineMeta label="Landing" value={journey.landingRoute} />
                <InlineMeta label="Cadastro" value={journey.registerRoute} />
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                {journey.signupFields.map((field) => (
                  <FieldCard key={field.label} field={field} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/75">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Efeito de rede esperado</CardTitle>
              </div>
              <CardDescription>
                Como a jornada deste perfil cria valor para os demais atores do ecossistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {journey.networkEffects.map((item) => (
                <div key={item.action} className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.effect}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-border/60 bg-background/75">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <CardTitle>Onboarding encenado</CardTitle>
              </div>
              <CardDescription>
                Cada etapa abaixo lista campos, objetivo, retorno ao usuario e o ponto de apoio da Mary AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {journey.onboardingSteps.map((step, index) => (
                <div key={step.title} className="rounded-[24px] border border-border/60 bg-card p-5">
                  <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                        Etapa {index + 1}
                      </Badge>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{step.objective}</p>
                      </div>
                    </div>
                    <code className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                      {step.route}
                    </code>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {step.fields.map((field) => (
                      <FieldCard key={`${step.title}-${field.label}`} field={field} />
                    ))}
                  </div>

                  {(step.message || step.aiAssist) && (
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {step.message && (
                        <MessageCard title="Feedback ao usuario" text={step.message} tone="muted" />
                      )}
                      {step.aiAssist && (
                        <MessageCard title="Mary AI nesta etapa" text={step.aiAssist} tone="accent" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/75">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <CardTitle>Telas para demonstracao</CardTitle>
              </div>
              <CardDescription>
                Snapshot narrado das telas que fecham a jornada e sustentam a apresentacao comercial.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {journey.keyScreens.map((screen) => (
                <ScreenCard key={screen.title} screen={screen} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function ScreenCard({ screen }: { screen: DemoJourney['keyScreens'][number] }) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-card p-5">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{screen.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{screen.goal}</p>
        </div>
        <code className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          {screen.route}
        </code>
      </div>

      <div className="mt-4 space-y-4">
        <div className="grid gap-2">
          {screen.highlights.map((item) => (
            <div key={item} className="rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </div>

        {screen.metrics && (
          <div className="grid gap-3 sm:grid-cols-3">
            {screen.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
              </div>
            ))}
          </div>
        )}

        {screen.records && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {screen.records.map((record) => (
              <div key={`${record.title}-${record.subtitle}`} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{record.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{record.subtitle}</p>
                  </div>
                  {record.badge && <Badge variant="secondary">{record.badge}</Badge>}
                </div>
                {record.detail && <p className="mt-3 text-sm text-muted-foreground">{record.detail}</p>}
              </div>
            ))}
          </div>
        )}

        {screen.table && (
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <div className="grid bg-muted/40 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" style={{ gridTemplateColumns: `repeat(${screen.table.columns.length}, minmax(0, 1fr))` }}>
              {screen.table.columns.map((column) => (
                <div key={column} className="border-r border-border/60 px-3 py-3 last:border-r-0">
                  {column}
                </div>
              ))}
            </div>
            {screen.table.rows.map((row, index) => (
              <div
                key={`${screen.title}-row-${index}`}
                className="grid border-t border-border/60 bg-background/80 text-sm"
                style={{ gridTemplateColumns: `repeat(${screen.table!.columns.length}, minmax(0, 1fr))` }}
              >
                {row.map((cell, cellIndex) => (
                  <div key={`${screen.title}-cell-${index}-${cellIndex}`} className="border-r border-border/60 px-3 py-3 text-muted-foreground last:border-r-0">
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FieldCard({ field }: { field: DemoJourney['signupFields'][number] }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{field.label}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{field.type}</p>
        </div>
        <Badge variant="outline" className="rounded-full">
          Mock
        </Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{field.detail}</p>
      <div className="mt-4 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm font-medium text-foreground">
        {field.mockValue}
      </div>
    </div>
  )
}

function HighlightCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}

function MessageCard({
  title,
  text,
  tone,
}: {
  title: string
  text: string
  tone: 'muted' | 'accent'
}) {
  return (
    <div
      className={
        tone === 'accent'
          ? 'rounded-2xl border border-primary/20 bg-primary/5 p-4'
          : 'rounded-2xl border border-border/60 bg-background/80 p-4'
      }
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/8 p-5 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/70">{detail}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/75 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function InlineMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/80 px-3 py-2">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <code className="text-xs text-foreground">{value}</code>
    </div>
  )
}
