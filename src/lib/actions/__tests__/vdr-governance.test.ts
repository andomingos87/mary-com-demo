/**
 * Tests for VDR Governance (N1/N2/N3 boundary)
 * Phase 4 - Validation & QA: G1-G9, AH1-AH3
 *
 * Permissões reais estão na SQL (log_vdr_document_validation).
 * Estes testes validam o boundary: action chama RPC corretamente e propaga erros.
 */

jest.mock('nanoid', () => ({ nanoid: () => 'mocked-nanoid' }))

const mockRpc = jest.fn()
const mockGetUser = jest.fn()
const mockFromSingle = jest.fn()
const mockFromRange = jest.fn()

function createChainableMock() {
  const chain: { eq: (...a: unknown[]) => unknown; order: (...a: unknown[]) => unknown } = {
    eq: () => ({
      single: () => mockFromSingle(),
      order: () => ({ range: () => mockFromRange() }),
    }),
    order: () => ({ range: () => mockFromRange() }),
  }
  return {
    select: () => chain,
  }
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: () => mockGetUser() },
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: () => createChainableMock(),
  }),
  createAdminClient: jest.fn(),
}))

jest.mock('@/lib/audit', () => ({
  logAuditEvent: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/actions/readiness', () => ({
  updateProjectReadiness: jest.fn().mockResolvedValue({ success: true }),
}))

import { validateDocument, unvalidateDocument, getDocumentValidationHistory } from '@/lib/actions/vdr'

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-1' } },
    error: null,
  })
  mockFromSingle.mockResolvedValue({
    data: { project_id: 'proj-1' },
    error: null,
  })
  mockFromRange.mockResolvedValue({
    data: [],
    error: null,
  })
})

describe('validateDocument', () => {
  it('G1 - without auth returns Não autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const result = await validateDocument('doc-1', 'n1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Não autenticado')
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('AH1 - calls validate_vdr_document RPC with p_level N1', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await validateDocument('doc-1', 'n1')
    expect(result.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('validate_vdr_document', {
      p_document_id: 'doc-1',
      p_level: 'n1',
      p_user_id: 'user-1',
    })
  })

  it('G2 - SQL permission error for N2 propagates to caller', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'Sem permissão para validar N2' },
    })
    const result = await validateDocument('doc-1', 'n2')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Sem permissão')
    expect(mockRpc).toHaveBeenCalledWith('validate_vdr_document', {
      p_document_id: 'doc-1',
      p_level: 'n2',
      p_user_id: 'user-1',
    })
  })

  it('G5 - success when RPC returns data (advisor N2)', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await validateDocument('doc-1', 'n2')
    expect(result.success).toBe(true)
  })

  it('G7 - success when RPC returns data (owner/admin N3)', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await validateDocument('doc-1', 'n3')
    expect(result.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('validate_vdr_document', {
      p_document_id: 'doc-1',
      p_level: 'n3',
      p_user_id: 'user-1',
    })
  })

  it('G8 - no permission when RPC returns null data', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const result = await validateDocument('doc-1', 'n3')
    expect(result.success).toBe(false)
    expect(result.error).toContain('permissão')
  })
})

describe('unvalidateDocument', () => {
  it('AH2 - calls unvalidate_vdr_document RPC with p_level N2', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })
    const result = await unvalidateDocument('doc-1', 'n2')
    expect(result.success).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('unvalidate_vdr_document', {
      p_document_id: 'doc-1',
      p_level: 'n2',
      p_user_id: 'user-1',
    })
  })

  it('without auth returns Não autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const result = await unvalidateDocument('doc-1', 'n1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Não autenticado')
  })
})

describe('getDocumentValidationHistory', () => {
  it('AH3 - returns list ordered by validated_at desc when mock provides data', async () => {
    mockFromRange.mockResolvedValueOnce({
      data: [
        {
          id: 'v1',
          validation_level: 'N2',
          approved: true,
          validated_at: '2026-02-15T12:00:00Z',
          validated_by: 'user-1',
          metadata: null,
        },
        {
          id: 'v2',
          validation_level: 'N1',
          approved: true,
          validated_at: '2026-02-15T11:00:00Z',
          validated_by: 'user-1',
          metadata: null,
        },
      ],
      error: null,
    })
    const result = await getDocumentValidationHistory('doc-1')
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data![0].validationLevel).toBe('N2')
    expect(result.data![0].validatedAt).toBe('2026-02-15T12:00:00Z')
    expect(result.data![1].validationLevel).toBe('N1')
  })
})
