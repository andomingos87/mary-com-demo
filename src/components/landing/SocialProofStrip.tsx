import { Card, CardContent } from '@/components/ui/card'

interface StatItem {
  label: string
  value: string
  hint?: string
}

interface SocialProofStripProps {
  title: string
  stats: StatItem[]
  disclaimer?: string
}

/** Métricas de exemplo (placeholders) até haver dados reais da API. */
export function SocialProofStrip({ title, stats, disclaimer }: SocialProofStripProps) {
  return (
    <section className="border-y border-border bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center text-lg font-semibold text-foreground">{title}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className="border-border/60 shadow-card">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{s.label}</p>
                {s.hint ? <p className="mt-2 text-xs text-muted-foreground">{s.hint}</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
        {disclaimer ? (
          <p className="mt-6 text-center text-xs text-muted-foreground">{disclaimer}</p>
        ) : null}
      </div>
    </section>
  )
}
