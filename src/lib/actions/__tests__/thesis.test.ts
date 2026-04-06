const mockGetUser = jest.fn()
const mockCreateClient = jest.fn()

type MockResponse = { data: any; error: any }

const responseQueue: MockResponse[] = []
const inserts: Array<{ table: string; payload: unknown }> = []
const updates: Array<{ table: string; payload: unknown }> = []

function enqueueResponses(...responses: MockResponse[]) {
  responseQueue.push(...responses)
}

function nextResponse(): MockResponse {
  return responseQueue.shift() || { data: null, error: null }
}

function createQueryBuilder(table: string) {
  const chain: any = {
    select: jest.fn(() => chain),
    insert: jest.fn((payload: unknown) => {
      inserts.push({ table, payload })
      return chain
    }),
    update: jest.fn((payload: unknown) => {
      updates.push({ table, payload })
      return chain
    }),
    eq: jest.fn(() => chain),
    is: jest.fn(() => chain),
    neq: jest.fn(() => chain),
    order: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    single: jest.fn(async () => nextResponse()),
    then: (resolve: (value: MockResponse) => void) => {
      resolve(nextResponse())
      return { catch: () => ({}) }
    },
  }

  return chain
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockCreateClient(),
}))

import {
  activateThesis,
  autoSaveThesisField,
  createThesis,
  getActiveThesis,
  listTheses,
  updateThesis,
} from '@/lib/actions/thesis'

beforeEach(() => {
  jest.clearAllMocks()
  responseQueue.length = 0
  inserts.length = 0
  updates.length = 0

  mockGetUser.mockResolvedValue({
    data: { user: { id: 'user-1' } },
    error: null,
  })

  mockCreateClient.mockImplementation(() => ({
    auth: { getUser: mockGetUser },
    from: (table: string) => createQueryBuilder(table),
  }))
})

describe('thesis actions', () => {
  it('createThesis cria com is_active=false por padrão', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      {
        data: {
          id: 'th-1',
          organization_id: 'org-1',
          name: 'Tese 1',
          is_active: false,
          summary: null,
          criteria: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: 'user-1',
          updated_by: 'user-1',
        },
        error: null,
      }
    )

    const result = await createThesis({
      organizationId: 'org-1',
      name: 'Tese 1',
      criteria: {},
    })

    expect(result.success).toBe(true)
    expect(result.data?.is_active).toBe(false)
    expect(inserts[0]?.table).toBe('investment_theses')
    expect((inserts[0]?.payload as Record<string, unknown>).is_active).toBe(false)
  })

  it('createThesis com setActive=true ativa tese criada', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      {
        data: {
          id: 'th-2',
          organization_id: 'org-1',
          name: 'Tese 2',
          is_active: false,
          summary: null,
          criteria: {},
          created_at: '2026-03-25T10:00:00.000Z',
          updated_at: '2026-03-25T10:00:00.000Z',
          deleted_at: null,
          created_by: 'user-1',
          updated_by: 'user-1',
        },
        error: null,
      },
      {
        data: {
          id: 'th-2',
          organization_id: 'org-1',
          is_active: false,
          deleted_at: null,
        },
        error: null,
      },
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      { data: [], error: null },
      {
        data: {
          id: 'th-2',
          organization_id: 'org-1',
          name: 'Tese 2',
          is_active: true,
          summary: null,
          criteria: {},
          created_at: '2026-03-25T10:00:00.000Z',
          updated_at: '2026-03-25T10:01:00.000Z',
          deleted_at: null,
          created_by: 'user-1',
          updated_by: 'user-1',
        },
        error: null,
      }
    )

    const result = await createThesis(
      {
        organizationId: 'org-1',
        name: 'Tese 2',
        criteria: {},
      },
      { setActive: true }
    )

    expect(result.success).toBe(true)
    expect(result.data?.is_active).toBe(true)
  })

  it('updateThesis bloqueia tese removida (soft delete)', async () => {
    enqueueResponses({
      data: {
        id: 'th-deleted',
        organization_id: 'org-1',
        deleted_at: '2026-03-25T09:00:00.000Z',
      },
      error: null,
    })

    const result = await updateThesis('th-deleted', { name: 'Novo Nome' })

    expect(result.success).toBe(false)
    expect(result.error).toContain('não encontrada')
  })

  it('updateThesis sem mudanças retorna sucesso com tese atual', async () => {
    enqueueResponses(
      {
        data: {
          id: 'th-unchanged',
          organization_id: 'org-1',
          name: 'Tese Atual',
          summary: 'Resumo',
          criteria: {},
          is_active: false,
          created_at: '2026-03-25T10:00:00.000Z',
          updated_at: '2026-03-25T10:00:00.000Z',
          deleted_at: null,
          created_by: 'user-1',
          updated_by: 'user-1',
        },
        error: null,
      },
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null }
    )

    const result = await updateThesis('th-unchanged', {})

    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('th-unchanged')
  })

  it('activateThesis troca ativa anterior e ativa a tese alvo', async () => {
    enqueueResponses(
      {
        data: {
          id: 'th-target',
          organization_id: 'org-1',
          is_active: false,
          deleted_at: null,
        },
        error: null,
      },
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      { data: [], error: null },
      {
        data: {
          id: 'th-target',
          organization_id: 'org-1',
          is_active: true,
          deleted_at: null,
          name: 'Target',
          summary: null,
          criteria: {},
          created_at: '2026-03-25T10:00:00.000Z',
          updated_at: '2026-03-25T10:02:00.000Z',
          created_by: 'user-1',
          updated_by: 'user-1',
        },
        error: null,
      }
    )

    const result = await activateThesis('th-target')

    expect(result.success).toBe(true)
    expect(result.data?.is_active).toBe(true)
    expect(updates.some((item) => item.table === 'investment_theses')).toBe(true)
  })

  it('listTheses retorna lista ordenada pela query sem erro', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      {
        data: [
          { id: 'a', is_active: true, updated_at: '2026-03-25T10:00:00.000Z' },
          { id: 'b', is_active: false, updated_at: '2026-03-25T09:00:00.000Z' },
        ],
        error: null,
      }
    )

    const result = await listTheses('org-1')

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data?.[0].id).toBe('a')
  })

  it('getActiveThesis retorna active_found com metadata quando há tese ativa', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      {
        data: [
          {
            id: 'th-active',
            organization_id: 'org-1',
            name: 'Tese Ativa',
            summary: null,
            criteria: {},
            is_active: true,
            created_at: '2026-03-25T10:00:00.000Z',
            updated_at: '2026-03-25T10:05:00.000Z',
            deleted_at: null,
            created_by: 'user-1',
            updated_by: 'user-1',
          },
        ],
        error: null,
      }
    )

    const result = await getActiveThesis('org-1')

    expect(result.success).toBe(true)
    expect(result.data?.state).toBe('active_found')
    expect(result.data?.thesis?.id).toBe('th-active')
    expect(result.data?.metadata).toEqual({
      organizationId: 'org-1',
      profileType: 'investor',
      readOnlyMode: false,
    })
  })

  it('getActiveThesis retorna no_active_thesis sem erro técnico', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      { data: [], error: null }
    )

    const result = await getActiveThesis('org-1')

    expect(result.success).toBe(true)
    expect(result.data?.state).toBe('no_active_thesis')
    expect(result.data?.thesis).toBeNull()
  })

  it('fluxo create -> activate -> getActiveThesis retorna active_found', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      {
        data: {
          id: 'th-flow',
          organization_id: 'org-1',
          name: 'Tese Fluxo',
          is_active: false,
          summary: null,
          criteria: {},
          created_at: '2026-03-25T10:00:00.000Z',
          updated_at: '2026-03-25T10:00:00.000Z',
          deleted_at: null,
          created_by: 'user-1',
          updated_by: 'user-1',
        },
        error: null,
      },
      {
        data: {
          id: 'th-flow',
          organization_id: 'org-1',
          is_active: false,
          deleted_at: null,
        },
        error: null,
      },
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      { data: [], error: null },
      {
        data: {
          id: 'th-flow',
          organization_id: 'org-1',
          name: 'Tese Fluxo',
          is_active: true,
          summary: null,
          criteria: {},
          created_at: '2026-03-25T10:00:00.000Z',
          updated_at: '2026-03-25T10:01:00.000Z',
          deleted_at: null,
          created_by: 'user-1',
          updated_by: 'user-1',
        },
        error: null,
      },
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      {
        data: [
          {
            id: 'th-flow',
            organization_id: 'org-1',
            name: 'Tese Fluxo',
            is_active: true,
            summary: null,
            criteria: {},
            created_at: '2026-03-25T10:00:00.000Z',
            updated_at: '2026-03-25T10:01:00.000Z',
            deleted_at: null,
            created_by: 'user-1',
            updated_by: 'user-1',
          },
        ],
        error: null,
      }
    )

    const created = await createThesis(
      {
        organizationId: 'org-1',
        name: 'Tese Fluxo',
        criteria: {},
      },
      { setActive: true }
    )
    expect(created.success).toBe(true)

    const activeResult = await getActiveThesis('org-1')
    expect(activeResult.success).toBe(true)
    expect(activeResult.data?.state).toBe('active_found')
    expect(activeResult.data?.thesis?.id).toBe('th-flow')
  })

  it('retorna erro quando organização não é investor', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'asset', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null }
    )

    const result = await listTheses('org-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('investidor')
  })

  it('getActiveThesis retorna erro quando usuário não é membro da organização', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: null, error: { message: 'not found' } }
    )

    const result = await getActiveThesis('org-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('acesso')
  })

  it('getActiveThesis permite leitura em organização pending', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'pending' }, error: null },
      { data: { id: 'member-1' }, error: null },
      { data: [], error: null }
    )

    const result = await getActiveThesis('org-1')

    expect(result.success).toBe(true)
    expect(result.data?.state).toBe('no_active_thesis')
    expect(result.data?.metadata.readOnlyMode).toBe(true)
  })

  it('retorna erro quando usuário não é membro da organização', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: null, error: { message: 'not found' } }
    )

    const result = await createThesis({ organizationId: 'org-1', name: 'Tese', criteria: {} })

    expect(result.success).toBe(false)
    expect(result.error).toContain('acesso')
  })

  it('bloqueia mutação quando organização está pending', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'pending' }, error: null },
      { data: { id: 'member-1' }, error: null }
    )

    const result = await createThesis({ organizationId: 'org-1', name: 'Tese', criteria: {} })

    expect(result.success).toBe(false)
    expect(result.error).toContain('análise')
  })

  it('createThesis retorna erro amigavel quando cheque minimo nao e numero', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null }
    )

    const result = await createThesis({
      organizationId: 'org-1',
      name: 'Tese Ticket',
      criteria: {
        ticketMin: 'abc' as unknown as number,
      },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Cheque minimo')
  })

  it('createThesis bloqueia quando cheque minimo e maior que cheque maximo', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null }
    )

    const result = await createThesis({
      organizationId: 'org-1',
      name: 'Tese Faixa',
      criteria: {
        ticketMin: 10,
        ticketMax: 5,
      },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Cheque minimo nao pode ser maior')
  })

  it('createThesis bloqueia quando robMin e maior que robMax', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null }
    )

    const result = await createThesis({
      organizationId: 'org-1',
      name: 'Tese ROB',
      criteria: {
        robMin: 20000000,
        robMax: 10000000,
      },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('ROB minimo nao pode ser maior')
  })

  it('createThesis bloqueia ebitdaPercentMin fora da faixa', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null }
    )

    const result = await createThesis({
      organizationId: 'org-1',
      name: 'Tese EBITDA',
      criteria: {
        ebitdaPercentMin: 150,
      },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('EBITDA % minimo deve estar entre 0 e 100')
  })

  it('createThesis bloqueia targetAudience quando nao for lista', async () => {
    enqueueResponses(
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null }
    )

    const result = await createThesis({
      organizationId: 'org-1',
      name: 'Tese Publico',
      criteria: {
        targetAudience: 'b2b' as unknown as string[],
      },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Publico-alvo deve ser uma lista')
  })

  it('autoSaveThesisField delega para updateThesis em campos válidos', async () => {
    enqueueResponses(
      {
        data: {
          id: 'th-auto',
          organization_id: 'org-1',
          name: 'Tese antiga',
          summary: 'Resumo',
          criteria: {},
          is_active: false,
          created_at: '2026-03-25T10:00:00.000Z',
          updated_at: '2026-03-25T10:00:00.000Z',
          deleted_at: null,
          created_by: 'user-1',
          updated_by: 'user-1',
        },
        error: null,
      },
      { data: { id: 'org-1', profile_type: 'investor', verification_status: 'approved' }, error: null },
      { data: { id: 'member-1' }, error: null },
      {
        data: {
          id: 'th-auto',
          organization_id: 'org-1',
          name: 'Tese atualizada',
          summary: 'Resumo',
          criteria: {},
          is_active: false,
          created_at: '2026-03-25T10:00:00.000Z',
          updated_at: '2026-03-25T10:05:00.000Z',
          deleted_at: null,
          created_by: 'user-1',
          updated_by: 'user-1',
        },
        error: null,
      }
    )

    const result = await autoSaveThesisField('th-auto', 'name', 'Tese atualizada')
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Tese atualizada')
  })

  it('autoSaveThesisField rejeita campo inválido e evita update', async () => {
    enqueueResponses({
      data: null,
      error: { message: 'not found' },
    })

    const result = await autoSaveThesisField('th-auto', 'invalid_field' as never, 'valor')
    expect(result.success).toBe(false)
    expect(result.error).toContain('não encontrada')
    expect(updates).toHaveLength(0)
  })
})
