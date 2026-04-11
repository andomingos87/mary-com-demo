import Link from 'next/link'
import { LucideIcon, ArrowRight, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { AgentsWaitlistCard } from '@/components/landing/AgentsWaitlistCard'

export type SectionTone = 'default' | 'danger' | 'warning' | 'success'
export type SectionBackground = 'default' | 'muted' | 'warm'

export interface LandingCardItem {
  title: string
  description: string
  icon: LucideIcon
}

export interface LandingStatItem {
  value: string
  label: string
  hint: string
}

export interface LandingStepItem {
  title: string
  description: string
}

export interface LandingPlan {
  eyebrow: string
  title: string
  price: string
  priceSuffix?: string
  featured?: boolean
  badge?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  ctaVariant?: 'default' | 'outline'
}

export interface LandingFaqItem {
  question: string
  answer: string
}

export interface HeroConfig {
  eyebrow: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
}

interface BaseSection {
  id?: string
  background?: SectionBackground
}

export interface CardsSection extends BaseSection {
  kind: 'cards'
  title: string
  subtitle?: string
  items: LandingCardItem[]
  tone?: SectionTone
  columns?: 2 | 3 | 4
  callout?: {
    title?: string
    description: string
  }
}

export interface ComparisonSection extends BaseSection {
  kind: 'comparison'
  title: string
  subtitle?: string
  columns: [string, string, string]
  rows: Array<{
    label: string
    before: string
    after: string
  }>
}

export interface StatsSection extends BaseSection {
  kind: 'stats'
  title: string
  subtitle?: string
  stats: LandingStatItem[]
}

export interface StepsSection extends BaseSection {
  kind: 'steps'
  title: string
  subtitle?: string
  steps: LandingStepItem[]
  ctaLabel?: string
  ctaHref?: string
}

export interface PricingSection extends BaseSection {
  kind: 'pricing'
  title: string
  subtitle?: string
  plans: LandingPlan[]
}

export interface FaqSection extends BaseSection {
  kind: 'faq'
  title: string
  subtitle?: string
  items: LandingFaqItem[]
}

export interface CtaSection extends BaseSection {
  kind: 'cta'
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
}

export interface WaitlistSection extends BaseSection {
  kind: 'waitlist'
  title: string
  subtitle?: string
}

export type ProfileLandingSection =
  | CardsSection
  | ComparisonSection
  | StatsSection
  | StepsSection
  | PricingSection
  | FaqSection
  | CtaSection
  | WaitlistSection

export interface ProfileLandingPageData {
  currentPath: string
  breadcrumbLabel: string
  hero: HeroConfig
  sections: ProfileLandingSection[]
}

const backgroundStyles: Record<SectionBackground, string> = {
  default: 'bg-background',
  muted: 'bg-muted/30',
  warm: 'bg-amber-50/60',
}

const toneStyles: Record<SectionTone, { card: string; icon: string }> = {
  default: {
    card: 'border-border/80 bg-background',
    icon: 'bg-primary/10 text-primary',
  },
  danger: {
    card: 'border-rose-200 bg-rose-50/90',
    icon: 'bg-rose-100 text-rose-600',
  },
  warning: {
    card: 'border-amber-200 bg-amber-50/85',
    icon: 'bg-amber-100 text-amber-600',
  },
  success: {
    card: 'border-emerald-200 bg-emerald-50/80',
    icon: 'bg-emerald-100 text-emerald-600',
  },
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

export function LandingBreadcrumb({
  currentLabel,
  homeHref = '/',
}: {
  currentLabel: string
  homeHref?: string
}) {
  return (
    <div className="mx-auto max-w-6xl py-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Link href={homeHref} className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{currentLabel}</span>
      </div>
    </div>
  )
}

function CardsGrid({ section }: { section: CardsSection }) {
  const tone = section.tone ?? 'default'
  const gridClass =
    section.columns === 4
      ? 'xl:grid-cols-4 md:grid-cols-2'
      : section.columns === 3
        ? 'xl:grid-cols-3 md:grid-cols-2'
        : 'md:grid-cols-2'

  return (
    <section id={section.id} className={cn('px-4 py-20 sm:py-24', backgroundStyles[section.background ?? 'default'])}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        <div className={cn('mt-12 grid gap-5', gridClass)}>
          {section.items.map((item) => {
            const Icon = item.icon

            return (
              <Card
                key={item.title}
                className={cn(
                  'h-full rounded-2xl shadow-sm transition-elegant hover:-translate-y-1 hover:shadow-elegant',
                  toneStyles[tone].card
                )}
              >
                <CardHeader className="space-y-4">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', toneStyles[tone].icon)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
                    <CardDescription className="text-sm leading-6">{item.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {section.callout ? (
          <Card className="mx-auto mt-8 max-w-5xl rounded-3xl border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,239,240,0.96))] shadow-sm">
            <CardContent className="px-8 py-10 text-center sm:px-14">
              {section.callout.title ? (
                <h3 className="text-2xl font-bold tracking-tight text-foreground">{section.callout.title}</h3>
              ) : null}
              <p className={cn('mx-auto max-w-4xl text-lg leading-8 text-muted-foreground', section.callout.title && 'mt-4')}>
                {section.callout.description}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  )
}

function ComparisonTableSection({ section }: { section: ComparisonSection }) {
  const [firstColumn, secondColumn, thirdColumn] = section.columns

  return (
    <section id={section.id} className={cn('px-4 py-20 sm:py-24', backgroundStyles[section.background ?? 'default'])}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        <div className="mt-12 overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm">
          <div className="grid grid-cols-3 border-b border-border/70 bg-muted/40 text-sm font-semibold text-muted-foreground">
            <div className="px-5 py-4">{firstColumn}</div>
            <div className="px-5 py-4">{secondColumn}</div>
            <div className="px-5 py-4">{thirdColumn}</div>
          </div>
          {section.rows.map((row) => (
            <div key={row.label} className="grid grid-cols-3 border-b border-border/60 last:border-b-0">
              <div className="px-5 py-5 font-semibold text-foreground">{row.label}</div>
              <div className="px-5 py-5 text-muted-foreground">{row.before}</div>
              <div className="px-5 py-5 text-foreground">{row.after}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSectionBlock({ section }: { section: StatsSection }) {
  return (
    <section id={section.id} className={cn('border-y border-border/60 px-4 py-20 sm:py-24', backgroundStyles[section.background ?? 'default'])}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {section.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/70 bg-background/90 px-6 py-5 text-center shadow-sm backdrop-blur">
              <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-base font-semibold text-foreground">{stat.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepsSectionBlock({ section }: { section: StepsSection }) {
  return (
    <section id={section.id} className={cn('px-4 py-20 sm:py-24', backgroundStyles[section.background ?? 'default'])}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        <div className="relative mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
          {section.steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-md">
                {index + 1}
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">{step.title}</h3>
              <p className="mt-3 text-base leading-7 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {section.ctaLabel && section.ctaHref ? (
          <div className="mt-10 text-center">
            <Button size="lg" asChild>
              <Link href={section.ctaHref}>
                {section.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function PricingSectionBlock({ section }: { section: PricingSection }) {
  return (
    <section id={section.id} className={cn('border-t border-border/60 px-4 py-20 sm:py-24', backgroundStyles[section.background ?? 'default'])}>
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {section.plans.map((plan) => (
            <Card
              key={plan.title}
              className={cn(
                'relative rounded-2xl border-border/80 shadow-sm',
                plan.featured && 'border-primary shadow-elegant'
              )}
            >
              {plan.badge ? (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="rounded-full px-3 py-1">{plan.badge}</Badge>
                </div>
              ) : null}

              <CardHeader className="space-y-3">
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {plan.eyebrow}
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {plan.price}
                  {plan.priceSuffix ? <span className="ml-1 text-lg font-medium text-muted-foreground">{plan.priceSuffix}</span> : null}
                </CardTitle>
                <CardDescription className="text-2xl font-semibold leading-tight text-foreground">
                  {plan.title}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                      <Check className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="mt-8 w-full" variant={plan.ctaVariant ?? (plan.featured ? 'default' : 'outline')} asChild>
                  <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSectionBlock({ section }: { section: FaqSection }) {
  return (
    <section id={section.id} className={cn('border-t border-border/60 px-4 py-20 sm:py-24', backgroundStyles[section.background ?? 'default'])}>
      <div className="mx-auto max-w-4xl">
        <SectionHeading title={section.title} subtitle={section.subtitle} />

        <div className="mt-12 divide-y divide-border rounded-2xl border border-border/70 bg-background shadow-sm">
          {section.items.map((item) => (
            <details key={item.question} className="group px-6 py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="pb-4 pr-8 text-base leading-7 text-muted-foreground">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSectionBlock({ section }: { section: CtaSection }) {
  return (
    <section id={section.id} className={cn('border-t border-border/60 px-4 py-20 sm:py-24', backgroundStyles[section.background ?? 'default'])}>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {section.title}
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
          {section.subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="min-w-[240px]" asChild>
            <Link href={section.ctaHref}>
              {section.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {section.secondaryCtaLabel && section.secondaryCtaHref ? (
            <Button size="lg" variant="outline" className="min-w-[240px]" asChild>
              <Link href={section.secondaryCtaHref}>{section.secondaryCtaLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function WaitlistSectionBlock({ section }: { section: WaitlistSection }) {
  return (
    <section id={section.id} className={cn('border-t border-border/60 px-4 py-20 sm:py-24', backgroundStyles[section.background ?? 'default'])}>
      <div className="mx-auto max-w-3xl">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <AgentsWaitlistCard className="mt-10 rounded-2xl border-primary/15 bg-background shadow-sm" />
      </div>
    </section>
  )
}

export function RenderProfileLandingSection({ section }: { section: ProfileLandingSection }) {
  switch (section.kind) {
    case 'cards':
      return <CardsGrid section={section} />
    case 'comparison':
      return <ComparisonTableSection section={section} />
    case 'stats':
      return <StatsSectionBlock section={section} />
    case 'steps':
      return <StepsSectionBlock section={section} />
    case 'pricing':
      return <PricingSectionBlock section={section} />
    case 'faq':
      return <FaqSectionBlock section={section} />
    case 'cta':
      return <CtaSectionBlock section={section} />
    case 'waitlist':
      return <WaitlistSectionBlock section={section} />
    default:
      return null
  }
}
