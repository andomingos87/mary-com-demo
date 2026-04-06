/**
 * Tests for VDR Analytics actions
 * Phase 4 - Validation & QA: I1-I2, I7, EX5, R4-R5
 *
 * Cobre cenários principais com mocks de Supabase.
 */

jest.mock('nanoid', () => ({ nanoid: () => 'mocked-nanoid' }))

const mockGetUser = jest.fn()
const mockRpc = jest.fn()
const mockFromSingleResult = { data: { project_id: 'proj-123' }, error: null }

function createChain() {
  const result = { data: [] as unknown[], error: null as null }
  const chain = {
    select: () => chain,
    eq: () => ({ ...chain, single: () => Promise.resolve(mockFromSingleResult) }),
    not: () => chain,
    gte: () => chain,
    order: () => chain,
    range: () => Promise.resolve(result),
    then: (resolve: (v: typeof result) => void) => {
      queueMicrotask(() => resolve(result))
      return { catch: () => ({}) }
    },
  }
  return chain
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: () => mockGetUser() },
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: () => createChain(),
  }),
  createAdminClient: jest.fn(),
}))

jest.mock('@/lib/audit', () => ({ logAuditEvent: jest.fn().mockResolvedValue(undefined) }))

const mockUpdateProjectReadiness = jest.fn()
jest.mock('@/lib/actions/readiness', () => ({
  updateProjectReadiness: (...args: unknown[]) => mockUpdateProjectReadiness(...args),
}))

import {
  getEngagementByInvestor,
  exportEngagementReport,
  validateDocument,
  unvalidateDocument,
} from '@/lib/actions/vdr'

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  mockRpc.mockResolvedValue({ data: true, error: null })
  mockUpdateProjectReadiness.mockResolvedValue({ success: true })
})

describe('getEngagementByInvestor', () => {
  it('I1 - sem auth retorna Não autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const result = await getEngagementByInvestor('proj-1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Não autenticado')
  })

  it('I2 - sem permissão VDR retorna Sem permissão para visualizar analytics', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null })
    const result = await getEngagementByInvestor('proj-1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Sem permissão para visualizar analytics')
  })

  it('I3 - com permissão retorna success e data', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await getEngagementByInvestor('proj-1')
    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })
})

describe('exportEngagementReport', () => {
  it('EX5 - formato pdf retorna Formato não suportado', async () => {
    const result = await exportEngagementReport('proj-1', { format: 'pdf' as 'csv' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Formato não suportado nesta fase')
  })
})

describe('R4-R5 - updateProjectReadiness chamado após validate/unvalidate', () => {
  it('R4 - validateDocument chama updateProjectReadiness quando sucesso', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await validateDocument('doc-1', 'n1')
    expect(result.success).toBe(true)
    expect(mockUpdateProjectReadiness).toHaveBeenCalledWith('proj-123')
  })

  it('R5 - unvalidateDocument chama updateProjectReadiness quando sucesso', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await unvalidateDocument('doc-1', 'n2')
    expect(result.success).toBe(true)
    expect(mockUpdateProjectReadiness).toHaveBeenCalledWith('proj-123')
  })
})
