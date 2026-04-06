import { resolveMrsReadinessData } from '@/lib/readiness'
import type { ProjectStatus } from '@/types/database'

const PROJECT_STATUS_GATE_BLOCKED_NDA = 'PROJECT_STATUS_GATE_BLOCKED_NDA'
const PROJECT_STATUS_GATE_BLOCKED_NBO = 'PROJECT_STATUS_GATE_BLOCKED_NBO'
const PROJECT_STATUS_GATE_BLOCKED_DD_SPA = 'PROJECT_STATUS_GATE_BLOCKED_DD_SPA'
const PROJECT_STATUS_GATE_BLOCKED_SIGNING = 'PROJECT_STATUS_GATE_BLOCKED_SIGNING'
const PROJECT_STATUS_GATE_BLOCKED_CLOSED_WON = 'PROJECT_STATUS_GATE_BLOCKED_CLOSED_WON'
const PROJECT_STATUS_GATE_BLOCKED_MRS_PROGRESS = 'PROJECT_STATUS_GATE_BLOCKED_MRS_PROGRESS'

function formatGateReasons(reasons: string[]): string {
  if (reasons.length === 0) return 'Sem motivos detalhados.'
  return reasons.join(' ')
}

export function getGateBlockErrorForStatusTransition(
  previousStatus: ProjectStatus,
  nextStatus: ProjectStatus,
  readinessData: unknown
): string | null {
  if (
    !(previousStatus === 'teaser' && nextStatus === 'nda') &&
    !(previousStatus === 'nda' && nextStatus === 'nbo') &&
    !(previousStatus === 'nbo' && nextStatus === 'dd_spa') &&
    !(previousStatus === 'dd_spa' && nextStatus === 'signing') &&
    !(nextStatus === 'closed_won')
  ) {
    return null
  }

  const mrs = resolveMrsReadinessData(readinessData)

  const postNboStatuses: ProjectStatus[] = [
    'dd_spa',
    'signing',
    'cps',
    'closing',
    'disclosure',
    'closed_won',
  ]

  if (previousStatus === 'teaser' && nextStatus === 'nda' && !mrs.gates.ndaEligible) {
    return `${PROJECT_STATUS_GATE_BLOCKED_NDA}: Não foi possível avançar para NDA. Motivos: ${formatGateReasons(
      mrs.gates.ndaReasons
    )}`
  }

  if (previousStatus === 'nda' && nextStatus === 'nbo' && !mrs.gates.nboEligible) {
    return `${PROJECT_STATUS_GATE_BLOCKED_NBO}: Não foi possível avançar para NBO. Motivos: ${formatGateReasons(
      mrs.gates.nboReasons
    )}`
  }

  const readiness = (readinessData && typeof readinessData === 'object'
    ? (readinessData as Record<string, unknown>)
    : {}) as Record<string, unknown>

  // Optional gates for H0.3 transitions.
  // They only block when explicitly set to false in readiness_data.
  if (previousStatus === 'nbo' && nextStatus === 'dd_spa' && readiness.vdrDueDiligenceReleased === false) {
    return `${PROJECT_STATUS_GATE_BLOCKED_DD_SPA}: Não foi possível avançar para DD / SPA. Acesso de Due Diligence ainda não foi liberado.`
  }

  if (previousStatus === 'dd_spa' && nextStatus === 'signing' && readiness.legalDocsFinalized === false) {
    return `${PROJECT_STATUS_GATE_BLOCKED_SIGNING}: Não foi possível avançar para Signing. Documentos legais ainda não foram finalizados.`
  }

  if (
    nextStatus === 'closed_won' &&
    (readiness.spaSignedAndConditionsMet === false || readiness.closingConditionsMet === false)
  ) {
    return `${PROJECT_STATUS_GATE_BLOCKED_CLOSED_WON}: Não foi possível fechar como ganho. SPA/condições ainda não estão concluídas.`
  }

  // H0.3 progression rule:
  // post-NBO phases require the full MRS gate (steps 1-4) to be eligible.
  if (postNboStatuses.includes(nextStatus) && !mrs.gates.nboEligible) {
    return `${PROJECT_STATUS_GATE_BLOCKED_MRS_PROGRESS}: Não foi possível avançar para ${nextStatus}. Motivos: ${formatGateReasons(
      mrs.gates.nboReasons
    )}`
  }

  return null
}
