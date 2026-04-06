import type { ProjectStatus } from '@/types/database'
import {
  ALLOWED_STATUS_TRANSITIONS,
  PIPELINE_EXIT_STATUSES,
  PIPELINE_PHASE_ORDER,
  canTransitionProjectStatus,
  isTerminalProjectStatus,
} from '@/lib/projects/status-flow'

describe('project status transition matrix (H0.3)', () => {
  it('não expõe status legados no contrato operacional', () => {
    const legacyStatuses = ['draft', 'active', 'paused', 'closed', 'archived', 'spa']
    const operationalStatuses = [...PIPELINE_PHASE_ORDER, ...PIPELINE_EXIT_STATUSES]
    const matrixKeys = Object.keys(ALLOWED_STATUS_TRANSITIONS)

    for (const legacy of legacyStatuses) {
      expect(operationalStatuses).not.toContain(legacy as ProjectStatus)
      expect(matrixKeys).not.toContain(legacy)
    }
  })

  it('define a trilha principal com 12 fases', () => {
    expect(PIPELINE_PHASE_ORDER).toHaveLength(12)
    expect(PIPELINE_PHASE_ORDER[0]).toBe('screening')
    expect(PIPELINE_PHASE_ORDER[PIPELINE_PHASE_ORDER.length - 1]).toBe('disclosure')
  })

  it('define os status de saída laterais', () => {
    expect(PIPELINE_EXIT_STATUSES).toEqual(['closed_won', 'closed_lost'])
    expect(isTerminalProjectStatus('closed_won')).toBe(true)
    expect(isTerminalProjectStatus('closed_lost')).toBe(true)
    expect(isTerminalProjectStatus('nda')).toBe(false)
  })

  it('permite apenas transições previstas na matriz', () => {
    const shouldAllow: Array<[ProjectStatus, ProjectStatus]> = [
      ['screening', 'teaser'],
      ['teaser', 'nda'],
      ['nda', 'cim_dfs'],
      ['cim_dfs', 'ioi'],
      ['ioi', 'management_meetings'],
      ['management_meetings', 'nbo'],
      ['nbo', 'dd_spa'],
      ['dd_spa', 'signing'],
      ['signing', 'cps'],
      ['cps', 'closing'],
      ['closing', 'disclosure'],
      ['closing', 'closed_won'],
      ['disclosure', 'closed_won'],
      ['disclosure', 'closed_lost'],
      ['screening', 'closed_lost'],
    ]

    for (const [from, to] of shouldAllow) {
      expect(canTransitionProjectStatus(from, to)).toBe(true)
    }
  })

  it('bloqueia transições fora da matriz', () => {
    const shouldBlock: Array<[ProjectStatus, ProjectStatus]> = [
      ['screening', 'nda'],
      ['teaser', 'nbo'],
      ['nbo', 'signing'],
      ['dd_spa', 'closing'],
      ['closed_lost', 'screening'],
      ['closed_won', 'disclosure'],
    ]

    for (const [from, to] of shouldBlock) {
      expect(canTransitionProjectStatus(from, to)).toBe(false)
    }
  })

  it('mantém status sem transição quando terminal', () => {
    for (const terminal of PIPELINE_EXIT_STATUSES) {
      expect(ALLOWED_STATUS_TRANSITIONS[terminal]).toEqual([])
    }
  })
})
