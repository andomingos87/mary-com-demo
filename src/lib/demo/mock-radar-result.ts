import type { InvestmentThesis } from '@/types/database'
import type { RadarOpportunity, RadarResult } from '@/types/radar'

const DEMO_ORG_ASSET = '00000000-0000-4000-8000-0000000000a1'
const DEMO_ORG_ASSET_2 = '00000000-0000-4000-8000-0000000000a2'

const MOCK_THESIS_ROW: InvestmentThesis = {
  id: '00000000-0000-4000-8000-0000000000e1',
  organization_id: '00000000-0000-4000-8000-0000000000b1',
  name: 'Tese Demo — Growth B2B',
  summary: 'Foco em SaaS B2B, ticket médio e geografia alinhados ao radar fictício.',
  criteria: {
    sectors: ['software'],
    targetAudience: ['b2b'],
    robMin: 1,
    robMax: 50,
  },
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: '00000000-0000-4000-8000-0000000000c1',
  updated_by: null,
  deleted_at: null,
}

const now = new Date().toISOString()

export const MOCK_RADAR_OPPORTUNITIES: RadarOpportunity[] = [
  {
    projectId: '00000000-0000-4000-8000-000000000101',
    assetOrganizationId: DEMO_ORG_ASSET,
    codename: 'Projeto Aurora',
    sector: 'B2B SaaS',
    matchScore: 89,
    updatedAt: now,
    teaserSummary:
      'Empresa de software vertical para supply chain. Dados anonimizados — modo demonstração.',
    matchReasons: ['Setor alinhado', 'Ticket compatível', 'Geografia prioritária'],
    ctaState: {
      canViewTeaser: true,
      canRequestNda: true,
      isFollowing: false,
      hasNdaRequest: false,
    },
  },
  {
    projectId: '00000000-0000-4000-8000-000000000102',
    assetOrganizationId: DEMO_ORG_ASSET_2,
    codename: 'Codinome Vesper',
    sector: 'Fintech',
    matchScore: 74,
    updatedAt: now,
    teaserSummary: 'Negócio em escala com unit economics validados. Modo demonstração.',
    matchReasons: ['Estágio growth', 'EBITDA dentro da faixa'],
    ctaState: {
      canViewTeaser: true,
      canRequestNda: true,
      isFollowing: true,
      hasNdaRequest: false,
    },
  },
  {
    projectId: '00000000-0000-4000-8000-000000000103',
    assetOrganizationId: DEMO_ORG_ASSET,
    codename: 'Projeto Neblina',
    sector: 'Healthtech',
    matchScore: 61,
    updatedAt: now,
    teaserSummary: null,
    matchReasons: [],
    ctaState: {
      canViewTeaser: false,
      canRequestNda: true,
      isFollowing: false,
      hasNdaRequest: false,
    },
  },
]

export function getMockRadarResult(readOnlyMode: boolean): RadarResult {
  return {
    state: 'matches_found',
    activeThesis: MOCK_THESIS_ROW,
    opportunities: MOCK_RADAR_OPPORTUNITIES.map((o) => ({
      ...o,
      ctaState: {
        ...o.ctaState,
        canRequestNda: o.ctaState.canRequestNda && !readOnlyMode,
      },
    })),
    fallbackUsed: false,
    readOnlyMode,
    demoMode: true,
  }
}
