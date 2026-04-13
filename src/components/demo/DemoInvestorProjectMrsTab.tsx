'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MrsRadarChart } from '@/components/mrs/MrsRadarChart'
import { MrsStepItemsPanel } from '@/components/mrs/MrsStepItemsPanel'
import { mrsStepNavButtonClass } from '@/components/mrs/mrs-step-helpers'
import { createDefaultMrsSteps } from '@/lib/readiness'
import { cn } from '@/lib/utils'
import type { DemoProfileExperience } from '@/lib/demo/platform-data'
import type { MrsStepId } from '@/types/projects'

export type DemoInvestorMrsSlice = NonNullable<DemoProfileExperience['mrs']>

type DemoInvestorProjectMrsTabProps = {
  mrs: DemoInvestorMrsSlice
  /** Alinha o KPI ao card do Kanban quando o projeto veio do placeholder. */
  kpiScoreOverride?: number
}

/**
 * Aba MRS no detalhe do projeto (demo investidor). Reutiliza o mesmo conjunto
 * de dados que `/demo/investor/mrs`, sem lista extra de docs nem fila Mary AI
 * (foco na navegação por passo e checklist).
 */
export function DemoInvestorProjectMrsTab({ mrs, kpiScoreOverride }: DemoInvestorProjectMrsTabProps) {
  const displayScore = kpiScoreOverride ?? mrs.score
  const radarAxes = mrs.radarAxes
  const hasRadar = Boolean(radarAxes && radarAxes.length >= 3)
  const canonicalSteps = useMemo(() => createDefaultMrsSteps(), [])
  const [activeStepIdx, setActiveStepIdx] = useState(0)
  const maxIdx = Math.min(mrs.steps.length, canonicalSteps.length) - 1
  const safeIdx = Math.min(Math.max(0, activeStepIdx), Math.max(0, maxIdx))
  const activeCanonical = canonicalSteps[safeIdx]!
  const narrative = mrs.steps[safeIdx]

  const stepButtonRow = (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {mrs.steps.map((step, idx) => {
        const stepId = (idx + 1) as MrsStepId
        return (
          <button
            key={step.title}
            type="button"
            onClick={() => setActiveStepIdx(idx)}
            aria-pressed={safeIdx === idx}
            className={mrsStepNavButtonClass(stepId, safeIdx === idx)}
          >
            Passo {idx + 1}
          </button>
        )
      })}
    </div>
  )

  const narrativeAndChecklist = (
    <div className="space-y-4 scroll-mt-28" id="demo-project-mrs-step-detail">
      {narrative ? (
        <div
          className="rounded-lg border border-border bg-card px-3 py-2 shadow-none"
          title={narrative.body}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Regras do passo</p>
          <p className="text-sm font-medium leading-tight text-card-foreground">{narrative.title}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{narrative.body}</p>
          {narrative.bullets?.length ? (
            <ul className="mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
              {narrative.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium leading-none text-foreground"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">{activeCanonical.name}</p>
        <MrsStepItemsPanel step={activeCanonical} mode="demo" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-elegant">
        <CardHeader>
          <CardTitle>{mrs.title}</CardTitle>
          <CardDescription className="text-base leading-7">{mrs.summary}</CardDescription>
        </CardHeader>
        {!hasRadar ? (
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Score atual</p>
                <p className="text-5xl font-semibold">{displayScore}</p>
              </div>
              <Badge className="rounded-full bg-primary px-4 py-2 text-primary-foreground">
                Market Readiness Score
              </Badge>
            </div>
            <Progress value={displayScore} className="h-2" />
          </CardContent>
        ) : null}
      </Card>

      {hasRadar && radarAxes ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
              <CardHeader className="pb-2">
                <CardDescription>Score Total Mary</CardDescription>
                <CardTitle className="text-4xl">
                  {displayScore}
                  <span className="text-lg font-normal text-muted-foreground">/100</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={displayScore} className="h-2" />
              </CardContent>
            </Card>
            <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardDescription>Benchmark do setor</CardDescription>
                  <CardTitle
                    className={cn('text-4xl', mrs.benchmarkScore == null && 'text-muted-foreground')}
                  >
                    {mrs.benchmarkScore != null ? (
                      <>
                        {mrs.benchmarkScore}
                        <span className="text-lg font-normal text-muted-foreground">/100</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </CardTitle>
                </div>
                {mrs.benchmarkScore == null ? (
                  <Badge variant="secondary" className="rounded-full">
                    Em breve
                  </Badge>
                ) : null}
              </CardHeader>
              <CardContent>
                <Progress
                  value={mrs.benchmarkScore ?? 0}
                  className={cn('h-2', mrs.benchmarkScore == null && 'opacity-40')}
                />
              </CardContent>
            </Card>
            <Card className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
              <CardHeader className="pb-2">
                <CardDescription>Status global</CardDescription>
                <div className="flex items-center gap-2 pt-1">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <CardTitle className="text-xl">{mrs.globalStatus?.label ?? '—'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {mrs.globalStatus?.detail ?? ''}
              </CardContent>
            </Card>
          </div>
          <MrsRadarChart
            axes={radarAxes}
            className="rounded-[32px] border-white/80 bg-white/90 shadow-card"
          />
          {stepButtonRow}
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mrs.dimensions.map((d) => (
              <Card key={d.label} className="rounded-[32px] border-white/80 bg-white/90 shadow-card">
                <CardHeader className="pb-2">
                  <CardDescription>{d.label}</CardDescription>
                  <CardTitle className="text-2xl">{d.value}</CardTitle>
                </CardHeader>
                {d.helper ? (
                  <CardContent className="text-xs text-muted-foreground">{d.helper}</CardContent>
                ) : null}
              </Card>
            ))}
          </div>
          {stepButtonRow}
        </>
      )}

      {narrativeAndChecklist}
    </div>
  )
}
