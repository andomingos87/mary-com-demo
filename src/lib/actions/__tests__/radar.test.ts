import { computeRadarScore } from '@/lib/radar/score'
import type { Tables } from '@/types/database'

function makeProject(overrides: Partial<Tables<'projects'>> = {}): Tables<'projects'> {
  return {
    id: 'proj-1',
    organization_id: 'asset-org-1',
    codename: 'ALPHA',
    sector_l1: 'fintech',
    sector_l2: null,
    sector_l3: null,
    revenue_annual_usd: 5000000,
    value_min_usd: 3000000,
    value_max_usd: 7000000,
    status: 'nda',
    updated_at: '2026-03-26T10:00:00.000Z',
    description: 'Resumo teaser',
    extra_data: {
      geo: ['brazil'],
      businessModel: ['B2B'],
      ebitdaPercent: 25,
      rob12Months: 5000000,
      projectObjective: { type: 'sale' },
    },
    advisor_email: null,
    advisor_preference: null,
    contacts: null,
    contacts_migrated: null,
    created_at: '2026-03-26T10:00:00.000Z',
    created_by: null,
    deleted_at: null,
    ebitda_annual_usd: null,
    equity_max_pct: null,
    equity_min_pct: null,
    field_metadata: null,
    name: 'Projeto Alpha',
    objective: 'sale',
    readiness_data: null,
    readiness_score: null,
    reason: null,
    updated_by: null,
    visibility: 'public',
    ...overrides,
  }
}

describe('computeRadarScore', () => {
  it('soma score completo quando todos critérios aderem', () => {
    const project = makeProject()
    const result = computeRadarScore(project, {
      sectors: ['fintech'],
      targetAudience: ['b2b'],
      geo: ['brazil'],
      robMin: 1000000,
      robMax: 10000000,
      ebitdaPercentMin: 10,
      stage: ['nda'],
      operationType: ['sale'],
      ticketMin: 1000000,
      ticketMax: 10000000,
    })

    expect(result.score).toBe(100)
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        'Setor aderente',
        'Faixa de ROB aderente',
        'Faixa de tamanho/receita aderente',
        'Geografia aderente',
        'Estágio aderente',
        'EBITDA aderente',
        'Público-alvo aderente',
        'Tipo de operação aderente',
      ])
    )
  })

  it('retorna score parcial quando só setor combina', () => {
    const project = makeProject({
      extra_data: { geo: ['usa'] },
      status: 'teaser',
      revenue_annual_usd: 30000000,
      value_min_usd: 20000000,
      value_max_usd: 25000000,
    })

    const result = computeRadarScore(project, {
      sectors: ['fintech'],
      targetAudience: ['b2b'],
      geo: ['brazil'],
      robMin: 1000000,
      robMax: 5000000,
      ebitdaPercentMin: 30,
      stage: ['nda'],
      operationType: ['fundraising'],
      ticketMin: 1000000,
      ticketMax: 5000000,
    })

    expect(result.score).toBe(40)
    expect(result.reasons).toEqual(['Setor aderente'])
  })

  it('mapeia operationType full_sale para objective sale', () => {
    const project = makeProject({
      objective: 'sale',
    })

    const result = computeRadarScore(project, {
      sectors: [],
      targetAudience: [],
      geo: [],
      robMin: null,
      robMax: null,
      ebitdaPercentMin: null,
      stage: [],
      operationType: ['full_sale'],
      ticketMin: null,
      ticketMax: null,
    })

    expect(result.score).toBe(10)
    expect(result.reasons).toEqual(['Tipo de operação aderente'])
  })

  it('mapeia operationType minority para objective fundraising', () => {
    const project = makeProject({
      objective: 'fundraising',
    })

    const result = computeRadarScore(project, {
      sectors: [],
      targetAudience: [],
      geo: [],
      robMin: null,
      robMax: null,
      ebitdaPercentMin: null,
      stage: [],
      operationType: ['minority'],
      ticketMin: null,
      ticketMax: null,
    })

    expect(result.score).toBe(10)
    expect(result.reasons).toEqual(['Tipo de operação aderente'])
  })

  it('retorna zero quando não há aderência', () => {
    const project = makeProject({
      sector_l1: 'healthcare',
      extra_data: { geo: ['canada'] },
      status: 'dd_spa',
      revenue_annual_usd: 30000000,
      value_min_usd: 30000000,
      value_max_usd: 50000000,
    })

    const result = computeRadarScore(project, {
      sectors: ['fintech'],
      targetAudience: ['b2c'],
      geo: ['brazil'],
      robMin: 1000000,
      robMax: 5000000,
      ebitdaPercentMin: 10,
      stage: ['nda'],
      operationType: ['fundraising'],
      ticketMin: 1000000,
      ticketMax: 5000000,
    })

    expect(result.score).toBe(0)
    expect(result.reasons).toEqual([])
  })
})
