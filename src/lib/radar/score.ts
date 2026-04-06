import type { Json } from '@/types/database'

export interface RadarScoreProjectLike {
  sector_l1: string | null
  sector_l2: string | null
  sector_l3: string | null
  revenue_annual_usd: number | null
  value_min_usd: number | null
  value_max_usd: number | null
  objective?: string | null
  status: string
  extra_data: Json | null
}

export interface ScoreContext {
  sectors: string[]
  targetAudience: string[]
  geo: string[]
  robMin: number | null
  robMax: number | null
  ebitdaPercentMin: number | null
  stage: string[]
  operationType: string[]
  ticketMin: number | null
  ticketMax: number | null
}

export interface ScoreResult {
  score: number
  reasons: string[]
}

type CanonicalOperationType = 'sale' | 'fundraising' | 'other'

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => normalizeText(item))
    .filter((item) => item.length > 0)
}

function toOptionalNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return value
}

function extractGeographyTags(extraData: Json | null): string[] {
  if (!extraData || typeof extraData !== 'object' || Array.isArray(extraData)) {
    return []
  }

  const payload = extraData as Record<string, unknown>
  const candidates: unknown[] = [
    payload.geo,
    payload.geography,
    payload.geographies,
    payload.country,
    payload.countries,
    payload.region,
    payload.state,
  ]

  const tags: string[] = []
  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const normalized = normalizeText(candidate)
      if (normalized) tags.push(normalized)
      continue
    }
    if (Array.isArray(candidate)) {
      tags.push(...toStringArray(candidate))
    }
  }

  return Array.from(new Set(tags))
}

function rangesOverlap(
  desiredMin: number | null,
  desiredMax: number | null,
  actualMin: number | null,
  actualMax: number | null
) {
  if (actualMin === null && actualMax === null) return false

  const aMin = actualMin ?? actualMax
  const aMax = actualMax ?? actualMin
  if (aMin === null || aMax === null) return false

  const dMin = desiredMin ?? Number.NEGATIVE_INFINITY
  const dMax = desiredMax ?? Number.POSITIVE_INFINITY

  return aMin <= dMax && aMax >= dMin
}

function extractRobValue(project: RadarScoreProjectLike): number | null {
  if (typeof project.revenue_annual_usd === 'number' && Number.isFinite(project.revenue_annual_usd)) {
    return project.revenue_annual_usd
  }

  if (!project.extra_data || typeof project.extra_data !== 'object' || Array.isArray(project.extra_data)) {
    return null
  }

  const payload = project.extra_data as Record<string, unknown>
  const robCandidate = payload.rob12Months ?? payload.rob
  return toOptionalNumber(robCandidate)
}

function extractEbitdaPercent(project: RadarScoreProjectLike): number | null {
  if (!project.extra_data || typeof project.extra_data !== 'object' || Array.isArray(project.extra_data)) {
    return null
  }

  const payload = project.extra_data as Record<string, unknown>
  return toOptionalNumber(payload.ebitdaPercent)
}

function extractBusinessModels(project: RadarScoreProjectLike): string[] {
  if (!project.extra_data || typeof project.extra_data !== 'object' || Array.isArray(project.extra_data)) {
    return []
  }

  const payload = project.extra_data as Record<string, unknown>
  return toStringArray(payload.businessModel)
}

function extractOperationType(project: RadarScoreProjectLike): string {
  if (project.objective) {
    return normalizeText(project.objective)
  }

  if (!project.extra_data || typeof project.extra_data !== 'object' || Array.isArray(project.extra_data)) {
    return ''
  }

  const payload = project.extra_data as Record<string, unknown>
  if (
    payload.projectObjective &&
    typeof payload.projectObjective === 'object' &&
    !Array.isArray(payload.projectObjective)
  ) {
    const objectivePayload = payload.projectObjective as Record<string, unknown>
    return normalizeText(objectivePayload.type)
  }

  return ''
}

function normalizeOperationToken(value: string): CanonicalOperationType | null {
  if (!value) return null

  const token = normalizeText(value)

  const saleTokens = new Set(['sale', 'full_sale', 'buyout', 'majority', 'majoritaria'])
  if (saleTokens.has(token)) return 'sale'

  const fundraisingTokens = new Set([
    'fundraising',
    'investment',
    'minority',
    'minoritaria',
    'growth_equity',
    'venture_capital',
    'vc',
  ])
  if (fundraisingTokens.has(token)) return 'fundraising'

  if (token === 'other' || token === 'outro') return 'other'

  return null
}

export function computeRadarScore(project: RadarScoreProjectLike, context: ScoreContext): ScoreResult {
  let score = 0
  const reasons: string[] = []

  const projectSectors = [
    normalizeText(project.sector_l1),
    normalizeText(project.sector_l2),
    normalizeText(project.sector_l3),
  ].filter(Boolean)

  if (
    context.sectors.length > 0 &&
    projectSectors.some((sector) => context.sectors.includes(sector))
  ) {
    score += 40
    reasons.push('Setor aderente')
  }

  const projectRangeMin = toOptionalNumber(project.value_min_usd) ?? toOptionalNumber(project.revenue_annual_usd)
  const projectRangeMax = toOptionalNumber(project.value_max_usd) ?? toOptionalNumber(project.revenue_annual_usd)

  const projectRob = extractRobValue(project)
  if (
    projectRob !== null &&
    (context.robMin !== null || context.robMax !== null) &&
    rangesOverlap(context.robMin, context.robMax, projectRob, projectRob)
  ) {
    score += 20
    reasons.push('Faixa de ROB aderente')
  }

  if (
    (context.ticketMin !== null || context.ticketMax !== null) &&
    rangesOverlap(context.ticketMin, context.ticketMax, projectRangeMin, projectRangeMax)
  ) {
    score += 30
    reasons.push('Faixa de tamanho/receita aderente')
  }

  const geoTags = extractGeographyTags(project.extra_data)
  if (context.geo.length > 0 && geoTags.some((geo) => context.geo.includes(geo))) {
    score += 20
    reasons.push('Geografia aderente')
  }

  const projectStage = normalizeText(project.status)
  if (context.stage.length > 0 && projectStage && context.stage.includes(projectStage)) {
    score += 10
    reasons.push('Estágio aderente')
  }

  const projectEbitdaPercent = extractEbitdaPercent(project)
  if (
    context.ebitdaPercentMin !== null &&
    projectEbitdaPercent !== null &&
    projectEbitdaPercent >= context.ebitdaPercentMin
  ) {
    score += 10
    reasons.push('EBITDA aderente')
  }

  const businessModels = extractBusinessModels(project)
  if (
    context.targetAudience.length > 0 &&
    businessModels.length > 0 &&
    businessModels.some((model) => context.targetAudience.includes(model))
  ) {
    score += 10
    reasons.push('Público-alvo aderente')
  }

  const operationType = extractOperationType(project)
  const canonicalProjectOperation = normalizeOperationToken(operationType)
  const canonicalThesisOperations = Array.from(
    new Set(context.operationType.map((item) => normalizeOperationToken(item)).filter(Boolean))
  ) as CanonicalOperationType[]

  if (
    canonicalThesisOperations.length > 0 &&
    canonicalProjectOperation &&
    canonicalThesisOperations.includes(canonicalProjectOperation)
  ) {
    score += 10
    reasons.push('Tipo de operação aderente')
  }

  const clampedScore = Math.min(score, 100)
  return { score: clampedScore, reasons }
}
