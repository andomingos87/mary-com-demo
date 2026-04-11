import type { RadarOpportunity } from '@/types/radar'

/** Cartões apenas para demonstração de UI (sem persistência). */
export const DEMO_RADAR_OPPORTUNITIES: RadarOpportunity[] = [
  {
    projectId: 'demo-radar-1',
    assetOrganizationId: 'demo-asset',
    codename: 'Projeto Aurora',
    sector: 'B2B SaaS',
    matchScore: 87,
    updatedAt: new Date().toISOString(),
    teaserSummary:
      'Empresa de software vertical para supply chain, ARR em faixa compatível com sua tese. Dados anonimizados para demonstração.',
    matchReasons: ['Setor alinhado', 'Ticket compatível', 'Geografia prioritária'],
    ctaState: {
      canViewTeaser: true,
      canRequestNda: false,
      isFollowing: false,
      hasNdaRequest: false,
    },
  },
  {
    projectId: 'demo-radar-2',
    assetOrganizationId: 'demo-asset-2',
    codename: 'Codinome Vesper',
    sector: 'Fintech B2C',
    matchScore: 72,
    updatedAt: new Date().toISOString(),
    teaserSummary:
      'Negócio em escala com unit economics validados. Exemplo de teaser anonimizado.',
    matchReasons: ['Estágio growth', 'EBITDA dentro da faixa'],
    ctaState: {
      canViewTeaser: true,
      canRequestNda: false,
      isFollowing: false,
      hasNdaRequest: false,
    },
  },
]

export interface DemoAssetInvestor {
  id: string
  label: string
  thesis: string
  match: number
  ticket: string
}

export const DEMO_ASSET_INVESTORS: DemoAssetInvestor[] = [
  {
    id: 'demo-inv-1',
    label: 'Fundo Atlas (exemplo)',
    thesis: 'B2B SaaS, ticket USD 5–30M',
    match: 91,
    ticket: 'USD 8–25M',
  },
  {
    id: 'demo-inv-2',
    label: 'Family Office Horizonte (exemplo)',
    thesis: 'LatAm, growth equity',
    match: 76,
    ticket: 'USD 3–15M',
  },
  {
    id: 'demo-inv-3',
    label: 'VC Litoral (exemplo)',
    thesis: 'Fintech, early growth',
    match: 68,
    ticket: 'USD 2–10M',
  },
]
