import type { InvestmentThesis } from '@/types/database'

export interface ThesisCriteria {
  sectors?: string[]
  targetAudience?: string[]
  geo?: string[]
  robMin?: number | null
  robMax?: number | null
  ebitdaPercentMin?: number | null
  ticketMin?: number | null
  ticketMax?: number | null
  stage?: string[]
  operationType?: string[]
  exclusionCriteria?: string
  additionalInfo?: string
  [key: string]: unknown
}

export interface CreateThesisInput {
  organizationId: string
  name: string
  summary?: string
  criteria?: ThesisCriteria
}

export interface UpdateThesisInput {
  name?: string
  summary?: string
  criteria?: ThesisCriteria
}

export interface ThesisMutationOptions {
  setActive?: boolean
}

export type ThesisListItem = InvestmentThesis

export type ActiveThesisState = 'active_found' | 'no_active_thesis'

export interface ActiveThesisMetadata {
  organizationId: string
  profileType: string
  readOnlyMode: boolean
}

export interface ActiveThesisResponse {
  thesis: InvestmentThesis | null
  state: ActiveThesisState
  metadata: ActiveThesisMetadata
}
