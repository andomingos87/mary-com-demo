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

/** Passo 1 padrão: Fundamentos, Institucional e Comercial (contrato UX MRS ativo). */
function createDefaultMrsStep1(): MrsStep {
  return {
    id: 1,
    name: 'Fundamentos, institucional e comercial',
    themes: [
      {
        id: 'step1-fundamentos',
        name: 'Fundamentos',
        subthemes: [
          {
            id: 'step1-fundamentos-societario',
            name: 'Societário',
            items: [
              {
                ...createDefaultItem('s1_i1', 'Dossiê Completo', 'critica'),
                ownerUserId: 'Sócio',
              },
              {
                id: 's1_i2',
                title: 'Organograma Societário',
                status: 'parcial',
                priority: 'alta',
                comments: 'Aguardando consolidação',
                ownerUserId: 'Advogado',
                filesCount: 1,
                lastUploadAt: '2026-03-02T12:00:00.000Z',
                files: [
                  {
                    id: 's1_i2_f1',
                    fileName: 'Organograma societário.pdf',
                    uploadedAt: '2026-03-02T12:00:00.000Z',
                    uploadedBy: 'Advogado',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'step1-institucional',
        name: 'Institucional',
        subthemes: [
          {
            id: 'step1-institucional-sub',
            name: 'Institucional',
            items: [
              {
                id: 's1_i3',
                title: 'Apresentação Corporativa',
                status: 'completo',
                priority: 'alta',
                comments: '',
                ownerUserId: 'Sócio',
                filesCount: 1,
                lastUploadAt: '2026-02-28T10:00:00.000Z',
                files: [
                  {
                    id: 's1_i3_f1',
                    fileName: 'Apresentação corporativa.pdf',
                    uploadedAt: '2026-02-28T10:00:00.000Z',
                    uploadedBy: 'Sócio',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'step1-comercial',
        name: 'Comercial',
        subthemes: [
          {
            id: 'step1-comercial-sub',
            name: 'Comercial',
            items: [
              {
                ...createDefaultItem('s1_i4', 'Catálogo de Produtos/Serviços', 'media'),
                ownerUserId: 'Comercial',
              },
            ],
          },
        ],
      },
    ],
  }
}

/** Passo 2 padrão: Financeiro e Projeções (contrato UX MRS ativo). */
function createDefaultMrsStep2(): MrsStep {
  return {
    id: 2,
    name: 'Financeiro e projeções',
    themes: [
      {
        id: 'step2-financeiro',
        name: 'Financeiro',
        subthemes: [
          {
            id: 'step2-financeiro-contabil',
            name: 'Contábil',
            items: [
              {
                id: 's2_i1',
                title: 'DRE Últimos 3 Anos',
                status: 'parcial',
                priority: 'critica',
                comments: '2 de 3 anos enviados',
                ownerUserId: 'Contador',
                filesCount: 1,
                lastUploadAt: '2026-03-05T14:00:00.000Z',
                files: [
                  {
                    id: 's2_i1_f1',
                    fileName: 'DRE consolidada parcial.pdf',
                    uploadedAt: '2026-03-05T14:00:00.000Z',
                    uploadedBy: 'Contador',
                  },
                ],
              },
              {
                ...createDefaultItem('s2_i2', 'Balanço Patrimonial Auditado', 'critica'),
                ownerUserId: 'Contador',
              },
            ],
          },
          {
            id: 'step2-financeiro-indicadores',
            name: 'Indicadores',
            items: [
              {
                id: 's2_i3',
                title: 'EBITDA Normalizado (36m)',
                status: 'parcial',
                priority: 'alta',
                comments: 'Ajustes pendentes',
                ownerUserId: 'Contador',
                filesCount: 1,
                lastUploadAt: '2026-03-01T11:00:00.000Z',
                files: [
                  {
                    id: 's2_i3_f1',
                    fileName: 'EBITDA normalizado draft.xlsx',
                    uploadedAt: '2026-03-01T11:00:00.000Z',
                    uploadedBy: 'Contador',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'step2-projecoes',
        name: 'Projeções',
        subthemes: [
          {
            id: 'step2-projecoes-sub',
            name: 'Projeções',
            items: [
              {
                ...createDefaultItem('s2_i4', 'Projeções Financeiras (3-5 anos)', 'media'),
                ownerUserId: 'Mary AI',
              },
            ],
          },
        ],
      },
    ],
  }
}

/** Passo 3 padrão: Jurídicos (contrato UX MRS ativo). */
function createDefaultMrsStep3(): MrsStep {
  return {
    id: 3,
    name: 'Jurídicos',
    themes: [
      {
        id: 'step3-juridicos',
        name: 'Jurídicos',
        subthemes: [
          {
            id: 'step3-juridicos-regularidade',
            name: 'Regularidade',
            items: [
              {
                id: 's3_i1',
                title: 'Certidões de Regularidade',
                status: 'completo',
                priority: 'critica',
                comments: 'Todas atualizadas',
                ownerUserId: 'Advogado',
                filesCount: 1,
                lastUploadAt: '2026-02-20T10:00:00.000Z',
                files: [
                  {
                    id: 's3_i1_f1',
                    fileName: 'Certidões de regularidade.pdf',
                    uploadedAt: '2026-02-20T10:00:00.000Z',
                    uploadedBy: 'Advogado',
                  },
                ],
              },
              {
                id: 's3_i2',
                title: 'Licenças e Alvarás',
                status: 'completo',
                priority: 'alta',
                comments: '',
                ownerUserId: 'Advogado',
                filesCount: 1,
                lastUploadAt: '2026-02-22T15:00:00.000Z',
                files: [
                  {
                    id: 's3_i2_f1',
                    fileName: 'Licenças e alvarás.pdf',
                    uploadedAt: '2026-02-22T15:00:00.000Z',
                    uploadedBy: 'Advogado',
                  },
                ],
              },
            ],
          },
          {
            id: 'step3-juridicos-contratos',
            name: 'Contratos',
            items: [
              {
                ...createDefaultItem('s3_i3', 'Acordo de Sócios', 'alta'),
                ownerUserId: 'Advogado',
              },
              {
                ...createDefaultItem('s3_i4', 'Contrato Social Consolidado', 'critica'),
                ownerUserId: 'Advogado',
              },
            ],
          },
        ],
      },
    ],
  }
}

/** Passo 4 padrão: Operações, Planejamento e Adicionais (contrato UX MRS ativo). */
function createDefaultMrsStep4(): MrsStep {
  return {
    id: 4,
    name: 'Operações, planejamento e adicionais',
    themes: [
      {
        id: 'step4-operacoes',
        name: 'Operações',
        subthemes: [
          {
            id: 'step4-operacoes-clientes',
            name: 'Clientes',
            items: [
              {
                id: 's4_i1',
                title: 'Lista Top 20 Clientes',
                status: 'completo',
                priority: 'alta',
                comments: '',
                ownerUserId: 'Sócio',
                filesCount: 1,
                lastUploadAt: '2026-02-15T12:00:00.000Z',
                files: [
                  {
                    id: 's4_i1_f1',
                    fileName: 'Lista top 20 clientes.xlsx',
                    uploadedAt: '2026-02-15T12:00:00.000Z',
                    uploadedBy: 'Sócio',
                  },
                ],
              },
            ],
          },
          {
            id: 'step4-operacoes-processos',
            name: 'Processos',
            items: [
              {
                ...createDefaultItem('s4_i2', 'Processos Operacionais Documentados', 'alta'),
                ownerUserId: 'Sócio',
              },
            ],
          },
        ],
      },
      {
        id: 'step4-planejamento',
        name: 'Planejamento',
        subthemes: [
          {
            id: 'step4-planejamento-estrategico',
            name: 'Estratégico',
            items: [
              {
                ...createDefaultItem('s4_i3', 'Plano Estratégico', 'media'),
                ownerUserId: 'Sócio',
              },
            ],
          },
        ],
      },
      {
        id: 'step4-adicionais',
        name: 'Adicionais',
        subthemes: [
          {
            id: 'step4-adicionais-ma',
            name: 'M&A',
            items: [
              {
                ...createDefaultItem('s4_i4', 'Teaser Executivo', 'media'),
                ownerUserId: 'Mary AI',
              },
            ],
          },
        ],
      },
    ],
  }
}

export function createDefaultMrsSteps(): MrsStep[] {
  return [
    createDefaultMrsStep1(),
    createDefaultMrsStep2(),
    createDefaultMrsStep3(),
    createDefaultMrsStep4(),
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
