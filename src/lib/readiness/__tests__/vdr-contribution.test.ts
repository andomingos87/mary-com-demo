/**
 * Tests for VDR Contribution (vdr-contribution.ts)
 * Phase 4 - Validation & QA: W1-W5, RI1-RI8
 */

import {
  calculateVdrContribution,
  computeIsMatchingReady,
  type VdrDocValidation,
} from '../vdr-contribution'

describe('calculateVdrContribution', () => {
  describe('W1-W5 - Pesos N1/N2/N3', () => {
    it('W1 - 1 doc com N1 validado: vdrSubScore 30, vdrN2PlusCoverage 0', () => {
      const docs: VdrDocValidation[] = [{ validation_n1: true }]
      const result = calculateVdrContribution(docs)
      expect(result.vdrSubScore).toBe(30)
      expect(result.vdrN2PlusCoverage).toBe(0)
    })

    it('W2 - 1 doc com N2 validado: vdrSubScore 70, vdrN2PlusCoverage 100', () => {
      const docs: VdrDocValidation[] = [{ validation_n2: true }]
      const result = calculateVdrContribution(docs)
      expect(result.vdrSubScore).toBe(70)
      expect(result.vdrN2PlusCoverage).toBe(100)
    })

    it('W3 - 1 doc com N3 validado: vdrSubScore 100, vdrN2PlusCoverage 100', () => {
      const docs: VdrDocValidation[] = [{ validation_n3: true }]
      const result = calculateVdrContribution(docs)
      expect(result.vdrSubScore).toBe(100)
      expect(result.vdrN2PlusCoverage).toBe(100)
    })

    it('W4 - lista vazia: vdrSubScore 0, vdrN2PlusCoverage 100', () => {
      const result = calculateVdrContribution([])
      expect(result.vdrSubScore).toBe(0)
      expect(result.vdrN2PlusCoverage).toBe(100)
    })

    it('W5 - mix 2 N1 + 3 N2 + 5 N3 (10 docs)', () => {
      const docs: VdrDocValidation[] = [
        ...Array(2).fill({ validation_n1: true }),
        ...Array(3).fill({ validation_n2: true }),
        ...Array(5).fill({ validation_n3: true }),
      ]
      const result = calculateVdrContribution(docs)
      // weightedTotal = 2*0.3 + 3*0.7 + 5*1.0 = 0.6 + 2.1 + 5 = 7.7
      // vdrSubScore = round(7.7/10 * 100) = 77
      // n2PlusCount = 3 + 5 = 8, vdrN2PlusCoverage = 80
      expect(result.vdrSubScore).toBe(77)
      expect(result.vdrN2PlusCoverage).toBe(80)
    })
  })

  describe('RI1-RI5 - Readiness integration scenarios', () => {
    it('RI1 - 5 docs todos N3: vdrSubScore 100, vdrN2PlusCoverage 100', () => {
      const docs: VdrDocValidation[] = Array(5).fill({ validation_n3: true })
      const result = calculateVdrContribution(docs)
      expect(result.vdrSubScore).toBe(100)
      expect(result.vdrN2PlusCoverage).toBe(100)
    })

    it('RI2 - 10 docs: 7 N2+, 3 N1: vdrN2PlusCoverage 70', () => {
      const docs: VdrDocValidation[] = [
        ...Array(7).fill({ validation_n2: true }),
        ...Array(3).fill({ validation_n1: true }),
      ]
      const result = calculateVdrContribution(docs)
      expect(result.vdrN2PlusCoverage).toBe(70)
    })

    it('RI3 - 1 doc N1: vdrSubScore 30', () => {
      const result = calculateVdrContribution([{ validation_n1: true }])
      expect(result.vdrSubScore).toBe(30)
    })

    it('RI4 - 1 doc N2: vdrSubScore 70', () => {
      const result = calculateVdrContribution([{ validation_n2: true }])
      expect(result.vdrSubScore).toBe(70)
    })

    it('RI5 - 1 doc N3: vdrSubScore 100', () => {
      const result = calculateVdrContribution([{ validation_n3: true }])
      expect(result.vdrSubScore).toBe(100)
    })
  })
})

describe('computeIsMatchingReady', () => {
  it('RI6 - both >= 70 returns true', () => {
    expect(computeIsMatchingReady(70, 70)).toBe(true)
    expect(computeIsMatchingReady(80, 80)).toBe(true)
  })

  it('RI7 - either < 70 returns false', () => {
    expect(computeIsMatchingReady(69, 80)).toBe(false)
    expect(computeIsMatchingReady(80, 69)).toBe(false)
    expect(computeIsMatchingReady(69, 69)).toBe(false)
  })

  it('RI8 - L2+ OK (80%), VDR N2+ fail (50%) returns false', () => {
    expect(computeIsMatchingReady(80, 50)).toBe(false)
  })
})
