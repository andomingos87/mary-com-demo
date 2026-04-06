/**
 * VDR Contribution to Readiness Score
 *
 * Calcula o sub-score VDR baseado em documentos validados em N1/N2/N3.
 * Pesos: N1=0.3, N2=0.7, N3=1.0
 */

export interface VdrDocValidation {
  validation_n1?: boolean | null
  validation_n2?: boolean | null
  validation_n3?: boolean | null
}

export interface VdrContributionResult {
  vdrSubScore: number
  vdrN2PlusCoverage: number
}

/**
 * Calcula sub-score e cobertura N2+ dos documentos VDR
 */
export function calculateVdrContribution(
  vdrDocs: VdrDocValidation[]
): VdrContributionResult {
  const totalVdrDocs = vdrDocs?.length || 0
  if (totalVdrDocs === 0) {
    return { vdrSubScore: 0, vdrN2PlusCoverage: 100 }
  }

  let weightedTotal = 0
  let n2PlusCount = 0

  for (const doc of vdrDocs) {
    if (doc.validation_n3) {
      weightedTotal += 1.0
      n2PlusCount += 1
    } else if (doc.validation_n2) {
      weightedTotal += 0.7
      n2PlusCount += 1
    } else if (doc.validation_n1) {
      weightedTotal += 0.3
    }
  }

  const vdrSubScore = Math.round((weightedTotal / totalVdrDocs) * 100)
  const vdrN2PlusCoverage = Math.round((n2PlusCount / totalVdrDocs) * 100)

  return { vdrSubScore, vdrN2PlusCoverage }
}

/**
 * Regra de matching-ready: ambos critérios devem ser >= 70%
 */
export function computeIsMatchingReady(
  l2PlusCoverage: number,
  vdrN2PlusCoverage: number
): boolean {
  return l2PlusCoverage >= 70 && vdrN2PlusCoverage >= 70
}
