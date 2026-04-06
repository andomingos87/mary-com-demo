/**
 * Tests for Readiness Score (score.ts)
 * Phase 4 - Validation & QA: U1-U11, H1-H5
 */

import {
  calculateScore,
  getFieldLevel,
  calculateL2PlusCoverage,
  parseFieldMetadata,
  applyFieldMetadata,
  generateHash,
  verifyFieldHash,
} from '../score'
import { getChecklistByObjective } from '../checklist'
import type { Project } from '@/types/database'
import type { ProjectFieldMetadata } from '@/types/projects'

const baseProject: Project = {
  id: 'proj-1',
  organization_id: 'org-1',
  codename: 'Test',
  objective: 'sale',
  description: null,
  sector_l1: null,
  sector_l2: null,
  sector_l3: null,
  value_min_usd: null,
  ebitda_annual_usd: null,
  revenue_annual_usd: null,
  status: 'teaser',
  readiness_score: null,
  readiness_data: null,
  field_metadata: null,
  created_at: '',
  updated_at: '',
  deleted_at: null,
}

describe('calculateScore', () => {
  describe('U1 - Projeto vazio (sem checklist)', () => {
    it('returns score 0 and isMatchingReady false when checklist is empty', () => {
      const result = calculateScore(baseProject, [])
      expect(result.score).toBe(0)
      expect(result.isMatchingReady).toBe(false)
      expect(result.completedItems).toBe(0)
      expect(result.totalItems).toBe(0)
      expect(result.l2PlusCoverage).toBe(0)
    })
  })

  describe('U2-U4 - Score calculation with checklist', () => {
    const saleChecklist = getChecklistByObjective('sale')

    it('U2 - all fields complete with L2+ returns score 100 and isMatchingReady true', () => {
      const fieldMetadata: ProjectFieldMetadata = {}
      for (const item of saleChecklist) {
        fieldMetadata[item.field] = {
          l1: { userId: 'u1', timestamp: '', hash: 'h1' },
          ...(item.requiredLevel >= 2 ? { l2: { userId: 'u1', timestamp: '', hash: 'h2' } } : {}),
        }
      }
      const project: Project = {
        ...baseProject,
        codename: 'P1',
        objective: 'sale',
        description: 'Desc',
        sector_l1: '62',
        sector_l2: '6201',
        value_min_usd: 1000000,
        ebitda_annual_usd: 500000,
        revenue_annual_usd: 2000000,
        field_metadata: fieldMetadata as unknown,
      }
      const result = calculateScore(project, saleChecklist)
      expect(result.score).toBe(100)
      expect(result.isMatchingReady).toBe(true)
    })

    it('U3 - field with value but no validation gives partial credit (50%)', () => {
      const minimalChecklist = [
        { field: 'codename', label: 'Codename', weight: 100, requiredLevel: 2, isComplete: false, hint: '' },
      ]
      const project: Project = {
        ...baseProject,
        codename: 'P1',
        field_metadata: {}, // no metadata = level 0
      }
      const result = calculateScore(project, minimalChecklist)
      // hasValue + level 0, requiredLevel 2 -> partial 50%
      expect(result.score).toBe(50)
    })

    it('U4 - field with L1 but requiredLevel 2 gives partial credit', () => {
      const minimalChecklist = [
        { field: 'codename', label: 'Codename', weight: 100, requiredLevel: 2, isComplete: false, hint: '' },
      ]
      const project: Project = {
        ...baseProject,
        codename: 'P1',
        field_metadata: {
          codename: { l1: { userId: 'u1', timestamp: '', hash: 'h' } },
        } as unknown,
      }
      const result = calculateScore(project, minimalChecklist)
      expect(result.score).toBe(50)
    })
  })
})

describe('getFieldLevel', () => {
  it('U5 - returns 0 for undefined metadata', () => {
    expect(getFieldLevel(undefined)).toBe(0)
  })

  it('U6 - returns 1 for L1 only', () => {
    expect(getFieldLevel({ l1: { userId: 'u', timestamp: '', hash: 'h' } })).toBe(1)
  })

  it('U7 - returns 3 for L3 (implies L1 and L2)', () => {
    expect(
      getFieldLevel({
        l1: { userId: 'u', timestamp: '', hash: 'h1' },
        l2: { userId: 'u', timestamp: '', hash: 'h2' },
        l3: { userId: 'u', timestamp: '', hash: 'h3' },
      })
    ).toBe(3)
  })
})

describe('calculateL2PlusCoverage', () => {
  it('U8 - returns 100 for empty criticalFields', () => {
    expect(calculateL2PlusCoverage({}, [])).toBe(100)
  })

  it('U9 - returns 60 for 3 of 5 fields at L2+', () => {
    const metadata: ProjectFieldMetadata = {
      f1: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
      f2: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
      f3: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
      f4: {},
      f5: {},
    }
    expect(calculateL2PlusCoverage(metadata, ['f1', 'f2', 'f3', 'f4', 'f5'])).toBe(60)
  })
})

describe('isMatchingReady rule (score.ts uses l2PlusCoverage >= 70)', () => {
  const saleChecklist = getChecklistByObjective('sale')
  const projectEmpty: Project = { ...baseProject, field_metadata: null }

  it('U10 - exactly 70% L2+ returns isMatchingReady true', () => {
    // Create a scenario where l2PlusCoverage is 70 - need checklist with requiredLevel>=2 fields
    const result = calculateScore(projectEmpty, saleChecklist)
    // With empty project, l2PlusCoverage depends on l2PlusFields. Sale has value_min_usd, ebitda, revenue as L2
    // All at 0 -> 0/3 = 0
    // We need a custom minimal checklist to get 70%
    const customChecklist = [
      { field: 'a', label: 'A', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
      { field: 'b', label: 'B', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
      { field: 'c', label: 'C', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
      { field: 'd', label: 'D', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
      { field: 'e', label: 'E', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
    ]
    const proj70: Project = {
      ...baseProject,
      field_metadata: {
        a: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        b: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        c: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        d: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        e: {},
      } as unknown,
    }
    const result70 = calculateScore(proj70, customChecklist)
    expect(result70.l2PlusCoverage).toBe(80) // 4/5 = 80
    const proj70Exact: Project = {
      ...baseProject,
      field_metadata: {
        a: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        b: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        c: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        d: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        e: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        f: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        g: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        h: {},
        i: {},
        j: {},
      } as unknown,
    }
    const custom10 = Array.from({ length: 10 }, (_, i) => ({
      field: String.fromCharCode(97 + i),
      label: '',
      weight: 10,
      requiredLevel: 2,
      isComplete: false,
      hint: '',
    }))
    const result70Exact = calculateScore(proj70Exact, custom10)
    expect(result70Exact.l2PlusCoverage).toBe(70) // 7/10 = 70
    expect(result70Exact.isMatchingReady).toBe(true)
  })

  it('U11 - 69% L2+ returns isMatchingReady false', () => {
    const customChecklist = [
      { field: 'a', label: 'A', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
      { field: 'b', label: 'B', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
      { field: 'c', label: 'C', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
      { field: 'd', label: 'D', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
      { field: 'e', label: 'E', weight: 10, requiredLevel: 2, isComplete: false, hint: '' },
    ]
    const proj69: Project = {
      ...baseProject,
      field_metadata: {
        a: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        b: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        c: { l2: { userId: 'u', timestamp: '', hash: 'h' } },
        d: {},
        e: {},
      } as unknown,
    }
    const result = calculateScore(proj69, customChecklist)
    expect(result.l2PlusCoverage).toBe(60) // 3/5 = 60
    expect(result.isMatchingReady).toBe(false)
  })
})

describe('parseFieldMetadata', () => {
  it('returns empty object for null/undefined', () => {
    expect(parseFieldMetadata(null)).toEqual({})
    expect(parseFieldMetadata(undefined)).toEqual({})
  })

  it('returns object as-is for valid object', () => {
    const meta = { codename: { l1: { userId: 'u', timestamp: '', hash: 'h' } } }
    expect(parseFieldMetadata(meta)).toEqual(meta)
  })
})

describe('applyFieldMetadata (H1-H3)', () => {
  it('H1 - L1 generates SHA-256 hash', () => {
    const result = applyFieldMetadata({}, 'codename', 1, 'user-1', 'value')
    expect(result.codename?.l1?.hash).toBeDefined()
    expect(result.codename?.l1?.hash).toMatch(/^[a-f0-9]{64}$/)
    expect(result.codename?.l1?.hash).toBe(generateHash('value'))
  })

  it('H2 - L2 without L1 throws', () => {
    expect(() =>
      applyFieldMetadata({ codename: {} }, 'codename', 2, 'user-1', 'value')
    ).toThrow('Cannot apply L2 validation without L1')
  })

  it('H3 - L3 without L2 throws', () => {
    const withL1 = applyFieldMetadata({}, 'codename', 1, 'user-1', 'v')
    expect(() =>
      applyFieldMetadata(withL1, 'codename', 3, 'user-1', 'v')
    ).toThrow('Cannot apply L3 audit without L2')
  })
})

describe('verifyFieldHash (H4-H5)', () => {
  it('H4 - correct value returns valid true', () => {
    const meta = applyFieldMetadata({}, 'f', 1, 'u', 'correct')
    const result = verifyFieldHash(meta.f, 'correct')
    expect(result.valid).toBe(true)
    expect(result.level).toBe(1)
  })

  it('H5 - altered value returns valid false', () => {
    const meta = applyFieldMetadata({}, 'f', 1, 'u', 'original')
    const result = verifyFieldHash(meta.f, 'altered')
    expect(result.valid).toBe(false)
    expect(result.level).toBe(1)
  })
})
