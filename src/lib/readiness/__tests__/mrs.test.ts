import type { MrsStep } from '@/types/projects'
import {
  addMrsItemFile,
  calculateMrsGates,
  calculateMrsScore,
  createDefaultMrsSteps,
  createMrsReadinessData,
  resolveMrsReadinessData,
  updateMrsItem,
} from '../mrs'

function setOtherStepItemsToNa(step: MrsStep, exceptIds: string[]) {
  for (const theme of step.themes) {
    for (const sub of theme.subthemes) {
      for (const item of sub.items) {
        if (!exceptIds.includes(item.id)) {
          item.status = 'na'
        }
      }
    }
  }
}

/** Zera contribuição ao score nos passos indicados (todos os itens N/A). */
function naAllItemsInSteps(steps: MrsStep[], fromStepIndex: number) {
  for (let i = fromStepIndex; i < steps.length; i++) {
    setOtherStepItemsToNa(steps[i], [])
  }
}

describe('mrs canonical score', () => {
  it('calcula score por passo e total usando pesos oficiais', () => {
    const steps = createDefaultMrsSteps()
    const step1 = steps[0]
    const itemA = step1.themes[0].subthemes[0].items[0] // critica
    const itemB = step1.themes[0].subthemes[0].items[1] // alta

    itemA.status = 'completo'
    itemB.status = 'parcial'
    setOtherStepItemsToNa(step1, [itemA.id, itemB.id])
    naAllItemsInSteps(steps, 1)

    const score = calculateMrsScore(steps)
    expect(score.stepScores[1]).toBe(80)
    expect(score.stepScores[2]).toBe(0)
    expect(score.stepScores[3]).toBe(0)
    expect(score.stepScores[4]).toBe(0)
    expect(score.totalScore).toBe(16)
  })

  it('ignora item NA do denominador', () => {
    const steps = createDefaultMrsSteps()
    const step1 = steps[0]
    const criticalItem = step1.themes[0].subthemes[0].items[0]
    const highItem = step1.themes[0].subthemes[0].items[1]

    criticalItem.status = 'na'
    highItem.status = 'completo'
    setOtherStepItemsToNa(step1, [highItem.id])

    const score = calculateMrsScore(steps)
    expect(score.stepScores[1]).toBe(100)
  })
})

describe('mrs canonical gates', () => {
  it('bloqueia NDA quando score p1 ou p2 < 70', () => {
    const data = createMrsReadinessData()
    const gates = calculateMrsGates(data.steps, data.score)

    expect(gates.ndaEligible).toBe(false)
    expect(gates.ndaReasons.length).toBeGreaterThan(0)
  })

  it('libera NDA e NBO quando todos criterios forem atendidos', () => {
    let data = createMrsReadinessData()
    const allItemIds = data.steps.flatMap((step) =>
      step.themes.flatMap((theme) =>
        theme.subthemes.flatMap((subtheme) => subtheme.items.map((item) => item.id))
      )
    )

    for (const itemId of allItemIds) {
      data = updateMrsItem(data, itemId, { status: 'completo' })
    }

    expect(data.gates.ndaEligible).toBe(true)
    expect(data.gates.nboEligible).toBe(true)
    expect(data.score.totalScore).toBe(100)
  })
})

describe('mrs item mutations', () => {
  it('atualiza owner e comentarios de item', () => {
    const data = createMrsReadinessData()
    const itemId = data.steps[0].themes[0].subthemes[0].items[0].id
    const updated = updateMrsItem(data, itemId, {
      ownerUserId: 'user-123',
      comments: 'Documento em revisão',
    })

    const item = updated.steps[0].themes[0].subthemes[0].items[0]
    expect(item.ownerUserId).toBe('user-123')
    expect(item.comments).toBe('Documento em revisão')
  })

  it('registra upload e atualiza metadados operacionais', () => {
    const data = createMrsReadinessData()
    const itemId = data.steps[0].themes[0].subthemes[0].items[0].id
    const updated = addMrsItemFile(data, itemId, {
      fileName: 'balanco-2025.pdf',
      fileUrl: 'https://example.com/balanco-2025.pdf',
      uploadedBy: 'user-123',
    })

    const item = updated.steps[0].themes[0].subthemes[0].items[0]
    expect(item.filesCount).toBe(1)
    expect(item.files[0]?.fileName).toBe('balanco-2025.pdf')
    expect(item.lastUploadAt).toBeDefined()
  })
})

describe('mrs contract resolve', () => {
  it('gera estrutura default quando readiness_data não tem mrs', () => {
    const data = resolveMrsReadinessData({})
    expect(data.steps).toHaveLength(4)
    expect(data.version).toBe(1)
  })

  it('normaliza readiness_data.mrs quando presente', () => {
    const current = createMrsReadinessData()
    const raw = { mrs: { steps: current.steps } }
    const resolved = resolveMrsReadinessData(raw)

    expect(resolved.steps).toHaveLength(4)
    expect(resolved.score.totalScore).toBe(current.score.totalScore)
  })
})
