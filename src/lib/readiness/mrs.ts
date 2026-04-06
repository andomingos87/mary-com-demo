import type {
  MrsGateStatus,
  MrsItem,
  MrsItemFile,
  MrsPriority,
  MrsReadinessData,
  MrsScoreBreakdown,
  MrsStatus,
  MrsStep,
  MrsStepId,
} from '@/types/projects'

const STATUS_POINTS: Record<MrsStatus, number> = {
  pendente: 0,
  parcial: 50,
  completo: 100,
  na: 0,
}

const PRIORITY_WEIGHTS: Record<MrsPriority, number> = {
  critica: 3,
  alta: 2,
  media: 1,
}

const STEP_TOTAL_WEIGHTS: Record<MrsStepId, number> = {
  1: 0.2,
  2: 0.3,
  3: 0.3,
  4: 0.2,
}

function createDefaultItem(id: string, title: string, priority: MrsPriority = 'media'): MrsItem {
  return {
    id,
    title,
    status: 'pendente',
    priority,
    comments: '',
    filesCount: 0,
    files: [],
  }
}

export function createDefaultMrsSteps(): MrsStep[] {
  return [
    {
      id: 1,
      name: 'Fundacao do ativo',
      themes: [
        {
          id: 'step1-governanca',
          name: 'Governanca e estrutura societaria',
          subthemes: [
            {
              id: 'step1-governanca-societario',
              name: 'Documentos societarios',
              items: [
                createDefaultItem('s1_i1', 'Contrato social e ultimas alteracoes', 'critica'),
                createDefaultItem('s1_i2', 'QSA e quadro societario atualizado', 'alta'),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Qualidade e conformidade',
      themes: [
        {
          id: 'step2-compliance',
          name: 'Fiscal, juridico e compliance',
          subthemes: [
            {
              id: 'step2-compliance-fiscal',
              name: 'Regularidade fiscal e legal',
              items: [
                createDefaultItem('s2_i1', 'Certidoes negativas e regularidade fiscal', 'critica'),
                createDefaultItem('s2_i2', 'Politicas de compliance e LGPD', 'alta'),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Operacao e tracao',
      themes: [
        {
          id: 'step3-operacao',
          name: 'Performance operacional',
          subthemes: [
            {
              id: 'step3-operacao-kpi',
              name: 'Indicadores e processos',
              items: [
                createDefaultItem('s3_i1', 'KPIs operacionais e historico de desempenho', 'alta'),
                createDefaultItem('s3_i2', 'Processos chave documentados', 'media'),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Preparacao para deal',
      themes: [
        {
          id: 'step4-deal',
          name: 'Narrativa de transacao',
          subthemes: [
            {
              id: 'step4-deal-readiness',
              name: 'Materiais de deal',
              items: [
                createDefaultItem('s4_i1', 'Premissas financeiras e plano de deal', 'alta'),
                createDefaultItem('s4_i2', 'Resumo executivo para diligencia', 'media'),
              ],
            },
          ],
        },
      ],
    },
  ]
}

function flattenItems(steps: MrsStep[]): Array<MrsItem & { stepId: MrsStepId }> {
  const entries: Array<MrsItem & { stepId: MrsStepId }> = []

  for (const step of steps) {
    for (const theme of step.themes) {
      for (const subtheme of theme.subthemes) {
        for (const item of subtheme.items) {
          entries.push({ ...item, stepId: step.id })
        }
      }
    }
  }

  return entries
}

export function calculateMrsScore(steps: MrsStep[]): MrsScoreBreakdown {
  const stepScores: Record<MrsStepId, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }

  for (const step of steps) {
    let numerator = 0
    let denominator = 0

    for (const theme of step.themes) {
      for (const subtheme of theme.subthemes) {
        for (const item of subtheme.items) {
          if (item.status === 'na') {
            continue
          }

          const itemWeight = PRIORITY_WEIGHTS[item.priority]
          numerator += STATUS_POINTS[item.status] * itemWeight
          denominator += 100 * itemWeight
        }
      }
    }

    stepScores[step.id] = denominator > 0 ? Math.round((numerator / denominator) * 100) : 0
  }

  const totalScore = Math.round(
    stepScores[1] * STEP_TOTAL_WEIGHTS[1] +
      stepScores[2] * STEP_TOTAL_WEIGHTS[2] +
      stepScores[3] * STEP_TOTAL_WEIGHTS[3] +
      stepScores[4] * STEP_TOTAL_WEIGHTS[4]
  )

  return { stepScores, totalScore }
}

export function calculateMrsGates(steps: MrsStep[], score: MrsScoreBreakdown): MrsGateStatus {
  const allItems = flattenItems(steps)
  const criticalPendingIn12 = allItems.some(
    (item) => item.priority === 'critica' && item.status === 'pendente' && (item.stepId === 1 || item.stepId === 2)
  )
  const criticalPendingAnywhere = allItems.some(
    (item) => item.priority === 'critica' && item.status === 'pendente'
  )

  const ndaReasons: string[] = []
  if (score.stepScores[1] < 70) ndaReasons.push('Score do passo 1 abaixo de 70.')
  if (score.stepScores[2] < 70) ndaReasons.push('Score do passo 2 abaixo de 70.')
  if (criticalPendingIn12) ndaReasons.push('Existe item critico pendente nos passos 1 ou 2.')

  const ndaEligible = ndaReasons.length === 0

  const nboReasons: string[] = []
  if (!ndaEligible) nboReasons.push('Gate NDA ainda nao atendido.')
  if (score.stepScores[3] < 70) nboReasons.push('Score do passo 3 abaixo de 70.')
  if (score.stepScores[4] < 70) nboReasons.push('Score do passo 4 abaixo de 70.')
  if (score.totalScore < 75) nboReasons.push('Score total abaixo de 75.')
  if (criticalPendingAnywhere) nboReasons.push('Existe item critico pendente em algum passo.')

  return {
    ndaEligible,
    nboEligible: nboReasons.length === 0,
    ndaReasons,
    nboReasons,
  }
}

export function createMrsReadinessData(steps?: MrsStep[]): MrsReadinessData {
  const resolvedSteps = steps && steps.length > 0 ? steps : createDefaultMrsSteps()
  const score = calculateMrsScore(resolvedSteps)
  const gates = calculateMrsGates(resolvedSteps, score)

  return {
    version: 1,
    steps: resolvedSteps,
    score,
    gates,
    updatedAt: new Date().toISOString(),
  }
}

function isMrsStatus(value: unknown): value is MrsStatus {
  return value === 'pendente' || value === 'parcial' || value === 'completo' || value === 'na'
}

function isMrsPriority(value: unknown): value is MrsPriority {
  return value === 'critica' || value === 'alta' || value === 'media'
}

function isMrsStepId(value: unknown): value is MrsStepId {
  return value === 1 || value === 2 || value === 3 || value === 4
}

function normalizeItem(item: Partial<MrsItem>): MrsItem | null {
  if (!item.id || !item.title || !isMrsStatus(item.status) || !isMrsPriority(item.priority)) {
    return null
  }

  const files = Array.isArray(item.files)
    ? item.files.filter((entry): entry is MrsItemFile => {
        return Boolean(
          entry &&
            typeof entry.id === 'string' &&
            typeof entry.fileName === 'string' &&
            typeof entry.uploadedAt === 'string' &&
            typeof entry.uploadedBy === 'string'
        )
      })
    : []

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status,
    priority: item.priority,
    ownerUserId: item.ownerUserId,
    comments: item.comments ?? '',
    lastUploadAt: item.lastUploadAt,
    filesCount: typeof item.filesCount === 'number' ? item.filesCount : files.length,
    files,
  }
}

function normalizeSteps(raw: unknown): MrsStep[] | null {
  if (!Array.isArray(raw)) {
    return null
  }

  const normalized: MrsStep[] = []

  for (const stepEntry of raw) {
    const step = stepEntry as Partial<MrsStep>
    if (!isMrsStepId(step.id) || typeof step.name !== 'string' || !Array.isArray(step.themes)) {
      return null
    }

    const themes = step.themes
      .map((theme) => {
        if (!theme || typeof theme.id !== 'string' || typeof theme.name !== 'string' || !Array.isArray(theme.subthemes)) {
          return null
        }

        const subthemes = theme.subthemes
          .map((subtheme) => {
            if (
              !subtheme ||
              typeof subtheme.id !== 'string' ||
              typeof subtheme.name !== 'string' ||
              !Array.isArray(subtheme.items)
            ) {
              return null
            }

            const items = subtheme.items
              .map((item) => normalizeItem(item as Partial<MrsItem>))
              .filter((item): item is MrsItem => item !== null)

            return {
              id: subtheme.id,
              name: subtheme.name,
              items,
            }
          })
          .filter((subtheme): subtheme is NonNullable<typeof subtheme> => subtheme !== null)

        return {
          id: theme.id,
          name: theme.name,
          subthemes,
        }
      })
      .filter((theme): theme is NonNullable<typeof theme> => theme !== null)

    normalized.push({
      id: step.id,
      name: step.name,
      themes,
    })
  }

  return normalized.length === 4 ? normalized : null
}

export function resolveMrsReadinessData(rawReadinessData: unknown): MrsReadinessData {
  if (!rawReadinessData || typeof rawReadinessData !== 'object') {
    return createMrsReadinessData()
  }

  const rawMrs = (rawReadinessData as { mrs?: unknown }).mrs
  if (!rawMrs || typeof rawMrs !== 'object') {
    return createMrsReadinessData()
  }

  const rawSteps = (rawMrs as { steps?: unknown }).steps
  const normalizedSteps = normalizeSteps(rawSteps)
  if (!normalizedSteps) {
    return createMrsReadinessData()
  }

  return createMrsReadinessData(normalizedSteps)
}

export function updateMrsItem(
  data: MrsReadinessData,
  itemId: string,
  updates: Partial<Pick<MrsItem, 'status' | 'priority' | 'ownerUserId' | 'comments'>>
): MrsReadinessData {
  const nextSteps = data.steps.map((step) => ({
    ...step,
    themes: step.themes.map((theme) => ({
      ...theme,
      subthemes: theme.subthemes.map((subtheme) => ({
        ...subtheme,
        items: subtheme.items.map((item) => {
          if (item.id !== itemId) {
            return item
          }

          return {
            ...item,
            status: updates.status ?? item.status,
            priority: updates.priority ?? item.priority,
            ownerUserId: updates.ownerUserId ?? item.ownerUserId,
            comments: updates.comments ?? item.comments,
          }
        }),
      })),
    })),
  }))

  return createMrsReadinessData(nextSteps)
}

export function addMrsItemFile(
  data: MrsReadinessData,
  itemId: string,
  file: Omit<MrsItemFile, 'id' | 'uploadedAt'> & { id?: string; uploadedAt?: string }
): MrsReadinessData {
  const fileEntry: MrsItemFile = {
    id: file.id ?? `file_${Date.now()}`,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    fileType: file.fileType,
    fileSizeBytes: file.fileSizeBytes,
    uploadedAt: file.uploadedAt ?? new Date().toISOString(),
    uploadedBy: file.uploadedBy,
  }

  const nextSteps = data.steps.map((step) => ({
    ...step,
    themes: step.themes.map((theme) => ({
      ...theme,
      subthemes: theme.subthemes.map((subtheme) => ({
        ...subtheme,
        items: subtheme.items.map((item) => {
          if (item.id !== itemId) {
            return item
          }

          const files = [...item.files, fileEntry]
          return {
            ...item,
            files,
            filesCount: files.length,
            lastUploadAt: fileEntry.uploadedAt,
          }
        }),
      })),
    })),
  }))

  return createMrsReadinessData(nextSteps)
}
