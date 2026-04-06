import { updateProjectReadiness } from '@/lib/actions/readiness'

export async function triggerReadinessRecalc(projectId: string) {
  const result = await updateProjectReadiness(projectId)
  if (!result.success) {
    console.error('Erro ao recalcular readiness após evento VDR:', projectId, result.error)
  }
}
