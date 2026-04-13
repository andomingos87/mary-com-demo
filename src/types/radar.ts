import type { InvestmentThesis } from '@/types/database'

export interface RadarCtaState {
  canViewTeaser: boolean
  canRequestNda: boolean
  isFollowing: boolean
  hasNdaRequest: boolean
}

/** Campos extras para o card estilo dashboard na demo do Radar (modo `demoMode`). */
export interface RadarOpportunityDemoCard {
  sectorLabel: string
  sectorTag: string
  location: string
  stage: string
  arrValue: string
  /** Rótulo do bloco financeiro (default: ARR). */
  arrLabel?: string
}

/** Conteúdo da sidebar de detalhes do match (demo). */
export interface RadarOpportunityDemoMatchSheet {
  /** Badge de foco / persona (ex.: SaaS B2B). */
  personaBadge: string
  breakdown: {
    segmento: number
    cheque: number
    geografia: number
    estagio: number
    estrategia: number
  }
  risks: string[]
}

/** Status de cadastro do ativo na demo (TeaserModal). */
export type DemoRegistrationStatus = 'pre_registration' | 'registered'

export interface RadarOpportunityDemoTeaserKeyMetric {
  label: string
  value: string
}

/** Corpo do teaser exibido no TeaserModal (demo). */
export interface RadarOpportunityDemoTeaserBody {
  description: string
  highlights: string[]
  key_metrics: RadarOpportunityDemoTeaserKeyMetric[]
  founded_year?: number
  employees_range?: string
}

/** Payload enriquecido para o modal “Ver Teaser” (demo). */
export interface RadarOpportunityDemoTeaserDetail {
  company_name: string
  sector: string
  segment: string
  location: string
  stage: string
  /** Ausente ou null em pré-cadastro / antes do cálculo do MRS. */
  readiness_score?: number | null
  registration_status: DemoRegistrationStatus
  has_advisor: boolean
  risks_attention: string[]
  teaser: RadarOpportunityDemoTeaserBody
}

export interface RadarOpportunity {
  projectId: string
  assetOrganizationId: string
  codename: string
  sector: string | null
  matchScore: number
  /** MRS agregado (0–100), ex.: readiness na demo. Opcional; UI pode usar `matchScore` como fallback. */
  mrsScore?: number
  /** IDs de tese (`InvestmentThesis` / demo) às quais o match se aplica; ausente = visível para qualquer tese selecionada na demo. */
  thesisIds?: string[]
  /** Dados do layout de card enriquecido (demo). */
  demoCard?: RadarOpportunityDemoCard
  /** Sidebar de detalhes do match (demo). */
  demoMatchSheet?: RadarOpportunityDemoMatchSheet
  /** Teaser completo para o modal “Ver Teaser” (demo). */
  demoTeaserDetail?: RadarOpportunityDemoTeaserDetail
  updatedAt: string
  teaserSummary: string | null
  matchReasons: string[]
  ctaState: RadarCtaState
}

export type RadarState = 'no_active_thesis' | 'no_matches' | 'matches_found'

export interface RadarResult {
  state: RadarState
  activeThesis: InvestmentThesis | null
  opportunities: RadarOpportunity[]
  fallbackUsed: boolean
  readOnlyMode: boolean
  /** Quando true, CTAs usam estado local (sem persistir NDA/follow no banco). */
  demoMode?: boolean
}

export interface RadarQueryOptions {
  threshold?: number
  limit?: number
}

export interface ToggleFollowInput {
  organizationId: string
  projectId: string
}

export interface ToggleFollowResult {
  isFollowing: boolean
}

export interface RequestNdaInput {
  organizationId: string
  projectId: string
}

export interface RequestNdaResult {
  requestId: string
  created: boolean
}
