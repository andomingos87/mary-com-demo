import { getGateBlockErrorForStatusTransition } from '@/lib/projects/status-gates'
import { createMrsReadinessData, updateMrsItem } from '@/lib/readiness/mrs'
import type { ProjectStatus } from '@/types/database'

function setAllItemsComplete() {
  let data = createMrsReadinessData()
  const ids = data.steps.flatMap((step) =>
    step.themes.flatMap((theme) =>
      theme.subthemes.flatMap((subtheme) => subtheme.items.map((item) => item.id))
    )
  )

  for (const itemId of ids) {
    data = updateMrsItem(data, itemId, { status: 'completo' })
  }

  return data
}

describe('project status gate enforcement', () => {
  it('bloqueia teaser -> nda quando gate NDA não está elegível', () => {
    const data = createMrsReadinessData()

    const error = getGateBlockErrorForStatusTransition(
      'teaser',
      'nda',
      { mrs: data } as unknown
    )

    expect(error).toContain('PROJECT_STATUS_GATE_BLOCKED_NDA')
    expect(error).toContain('Não foi possível avançar para NDA')
  })

  it('libera teaser -> nda quando gate NDA está elegível', () => {
    const data = setAllItemsComplete()

    const error = getGateBlockErrorForStatusTransition(
      'teaser',
      'nda',
      { mrs: data } as unknown
    )

    expect(error).toBeNull()
  })

  it('bloqueia nda -> nbo quando gate NBO não está elegível', () => {
    const data = createMrsReadinessData()

    const error = getGateBlockErrorForStatusTransition(
      'nda',
      'nbo',
      { mrs: data } as unknown
    )

    expect(error).toContain('PROJECT_STATUS_GATE_BLOCKED_NBO')
    expect(error).toContain('Não foi possível avançar para NBO')
  })

  it('libera nda -> nbo quando gate NBO está elegível', () => {
    const data = setAllItemsComplete()

    const error = getGateBlockErrorForStatusTransition(
      'nda',
      'nbo',
      { mrs: data } as unknown
    )

    expect(error).toBeNull()
  })

  it('ignora transições sem gate de MRS', () => {
    const transitions: Array<[ProjectStatus, ProjectStatus]> = [
      ['teaser', 'closed_lost'],
      ['closing', 'disclosure'],
    ]

    for (const [from, to] of transitions) {
      const error = getGateBlockErrorForStatusTransition(from, to, {})
      expect(error).toBeNull()
    }
  })

  it('bloqueia nbo -> dd_spa quando gate de VDR está explicitamente negado', () => {
    const error = getGateBlockErrorForStatusTransition(
      'nbo',
      'dd_spa',
      { vdrDueDiligenceReleased: false } as unknown
    )

    expect(error).toContain('PROJECT_STATUS_GATE_BLOCKED_DD_SPA')
  })

  it('bloqueia nbo -> dd_spa quando progressão MRS dos passos 3-4 não está elegível', () => {
    const incompleteMrs = createMrsReadinessData()
    const error = getGateBlockErrorForStatusTransition(
      'nbo',
      'dd_spa',
      { mrs: incompleteMrs } as unknown
    )

    expect(error).toContain('PROJECT_STATUS_GATE_BLOCKED_MRS_PROGRESS')
  })

  it('libera nbo -> dd_spa quando MRS está elegível e gate de VDR não bloqueia', () => {
    const completeMrs = setAllItemsComplete()
    const error = getGateBlockErrorForStatusTransition(
      'nbo',
      'dd_spa',
      { mrs: completeMrs, vdrDueDiligenceReleased: true } as unknown
    )

    expect(error).toBeNull()
  })

  it('bloqueia dd_spa -> signing quando documentos legais não estão finalizados', () => {
    const error = getGateBlockErrorForStatusTransition(
      'dd_spa',
      'signing',
      { legalDocsFinalized: false } as unknown
    )

    expect(error).toContain('PROJECT_STATUS_GATE_BLOCKED_SIGNING')
  })

  it('bloqueia transição para closed_won quando condições finais não foram cumpridas', () => {
    const error = getGateBlockErrorForStatusTransition(
      'disclosure',
      'closed_won',
      { spaSignedAndConditionsMet: false } as unknown
    )

    expect(error).toContain('PROJECT_STATUS_GATE_BLOCKED_CLOSED_WON')
  })

  it('ignora payload adicional de auto-save ao avaliar gates', () => {
    const completeMrs = setAllItemsComplete()
    const error = getGateBlockErrorForStatusTransition(
      'nbo',
      'dd_spa',
      {
        mrs: completeMrs,
        vdrDueDiligenceReleased: true,
        autoSaveDraft: { description: 'rascunho local' },
      } as unknown
    )

    expect(error).toBeNull()
  })

  it('mantém bloqueio de gate mesmo com payload incremental de auto-save', () => {
    const incompleteMrs = createMrsReadinessData()
    const error = getGateBlockErrorForStatusTransition(
      'nbo',
      'dd_spa',
      {
        mrs: incompleteMrs,
        autoSaveDraft: {
          contacts: [{ name: 'Ana', email: 'ana@corp.com' }],
          sectorL1: 'industria',
          taxonomy: { l1: 'industria', l2: 'metalurgia' },
        },
      } as unknown
    )

    expect(error).toContain('PROJECT_STATUS_GATE_BLOCKED_MRS_PROGRESS')
  })
})
