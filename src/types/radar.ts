import type { InvestmentThesis } from '@/types/database'

export interface RadarCtaState {
  canViewTeaser: boolean
  canRequestNda: boolean
  isFollowing: boolean
  hasNdaRequest: boolean
}

export interface RadarOpportunity {
  projectId: string
  assetOrganizationId: string
  codename: string
  sector: string | null
  matchScore: number
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
