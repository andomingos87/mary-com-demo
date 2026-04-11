import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface LandingHeroProps {
  eyebrow?: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
}

export function LandingHero({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-4xl text-center">
        {eyebrow ? (
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="min-w-[220px] shadow-elegant transition-elegant" asChild>
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {secondaryCtaLabel && secondaryCtaHref ? (
            <Button size="lg" variant="outline" className="min-w-[220px]" asChild>
              <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
