import type { DemoRegistrationStatus, RadarOpportunity } from '@/types/radar'

export interface ResolvedRadarDemoDisplay {
  sectorLabel: string
  sectorTag: string
  location: string
  stage: string
  arrLabel: string
  arrValue: string
  readiness: number
  matchPct: number
}

export function demoRadarMatchBadgeClass(score: number) {
  if (score >= 82) {
    return 'border-success/45 bg-success/15 text-success'
  }
  return 'border-amber-500/50 bg-amber-500/12 text-amber-950 dark:text-amber-100'
}

export function resolveRadarDemoDisplay(opp: RadarOpportunity): ResolvedRadarDemoDisplay {
  const readiness = Math.min(100, Math.max(0, opp.mrsScore ?? Math.round(opp.matchScore * 0.85)))
  const dc = opp.demoCard
  if (dc) {
    return {
      sectorLabel: dc.sectorLabel,
      sectorTag: dc.sectorTag,
      location: dc.location,
      stage: dc.stage,
      arrLabel: dc.arrLabel ?? 'ARR',
      arrValue: dc.arrValue,
      readiness,
      matchPct: opp.matchScore,
    }
  }
  return {
    sectorLabel: 'Setor',
    sectorTag: opp.sector || '—',
    location: 'Brasil',
    stage: 'Growth',
    arrLabel: 'ARR',
    arrValue: '—',
    readiness,
    matchPct: opp.matchScore,
  }
}

export function getDemoMatchBreakdown(opp: RadarOpportunity) {
  if (opp.demoMatchSheet?.breakdown) {
    return opp.demoMatchSheet.breakdown
  }
  const m = Math.min(100, Math.max(0, opp.matchScore))
  return {
    segmento: Math.min(100, m + 4),
    cheque: Math.min(100, m - 2),
    geografia: Math.min(100, m + 1),
    estagio: Math.min(100, m - 3),
    estrategia: m,
  }
}

export function getDemoMatchRisks(opp: RadarOpportunity): string[] {
  if (opp.demoMatchSheet?.risks?.length) {
    return opp.demoMatchSheet.risks
  }
  return [
    'Cheque mínimo acima do ticket médio do setor (análise preliminar).',
    'Documentação em evolução — validar na diligência.',
  ]
}

export function getDemoPersonaBadge(opp: RadarOpportunity): string {
  return opp.demoMatchSheet?.personaBadge ?? opp.demoCard?.sectorTag ?? opp.sector ?? 'Ativo'
}

/** View model estável para o TeaserModal (demo). */
export interface TeaserModalViewModel {
  company_name: string
  sector: string
  segment: string
  location: string
  stage: string
  readiness_score: number | null
  registration_status: DemoRegistrationStatus
  has_advisor: boolean
  risks_attention: string[]
  teaser: {
    description: string
    highlights: string[]
    key_metrics: { label: string; value: string }[]
    founded_year?: number
    employees_range?: string
  }
}

export function resolveTeaserModalModel(opp: RadarOpportunity): TeaserModalViewModel {
  const d = resolveRadarDemoDisplay(opp)
  const detail = opp.demoTeaserDetail
  const fallbackRisks = getDemoMatchRisks(opp)

  const registration_status: DemoRegistrationStatus =
    detail?.registration_status ??
    (opp.mrsScore != null && opp.mrsScore > 0 ? 'registered' : 'pre_registration')

  let readiness_score: number | null
  if (detail?.readiness_score !== undefined && detail.readiness_score !== null) {
    readiness_score = Math.min(100, Math.max(0, detail.readiness_score))
  } else if (registration_status === 'pre_registration') {
    readiness_score = null
  } else {
    readiness_score = d.readiness
  }

  const description =
    detail?.teaser.description ?? opp.teaserSummary ?? 'Descrição em elaboração para esta oportunidade.'

  const highlights =
    detail?.teaser.highlights?.length ? detail.teaser.highlights : opp.matchReasons.length ? opp.matchReasons : ['Aderência parcial aos critérios da tese.']

  const rawMetrics = detail?.teaser.key_metrics
  const key_metrics =
    rawMetrics && rawMetrics.length > 0
      ? rawMetrics
      : [
          { label: d.arrLabel, value: d.arrValue },
          { label: 'Match', value: `${opp.matchScore}%` },
        ]

  return {
    company_name: detail?.company_name ?? opp.codename,
    sector: detail?.sector ?? d.sectorLabel,
    segment: detail?.segment ?? d.sectorTag,
    location: detail?.location ?? d.location,
    stage: detail?.stage ?? d.stage,
    readiness_score,
    registration_status,
    has_advisor: detail?.has_advisor ?? true,
    risks_attention: detail?.risks_attention?.length ? detail.risks_attention : fallbackRisks,
    teaser: {
      description,
      highlights,
      key_metrics,
      founded_year: detail?.teaser.founded_year,
      employees_range: detail?.teaser.employees_range,
    },
  }
}

/** Cenários de UI do card do Radar (demo): 1 pré-cadastro, 2.1 cadastrado com advisor, 2.2 sem advisor. */
export type DemoRadarCardScenarioId = '1' | '2.1' | '2.2'

export interface DemoRadarCardScenarioInfo {
  id: DemoRadarCardScenarioId
  badgeLabel: string
  badgeClassName: string
  /** `null` quando pré-cadastro — não exibir barra de readiness. */
  readinessForCard: number | null
}

export function getDemoRadarCardScenarioInfo(opp: RadarOpportunity): DemoRadarCardScenarioInfo {
  const m = resolveTeaserModalModel(opp)
  const isPre = m.registration_status === 'pre_registration'
  if (isPre) {
    return {
      id: '1',
      badgeLabel: 'Cenário 1 · Pré-cadastro',
      badgeClassName:
        'border-amber-500/40 bg-amber-500/10 font-normal text-amber-950 dark:text-amber-100',
      readinessForCard: null,
    }
  }
  if (m.has_advisor) {
    return {
      id: '2.1',
      badgeLabel: 'Cenário 2.1 · Com advisor',
      badgeClassName: 'border-primary/35 bg-primary/10 font-normal text-foreground',
      readinessForCard: m.readiness_score,
    }
  }
  return {
    id: '2.2',
    badgeLabel: 'Cenário 2.2 · Sem advisor',
    badgeClassName: 'border-border bg-muted/80 font-normal text-foreground',
    readinessForCard: m.readiness_score,
  }
}
