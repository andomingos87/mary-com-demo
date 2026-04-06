/**
 * Tipos específicos para Projetos M&A (Fase 4)
 *
 * Este arquivo contém interfaces de input/output, metadados L1/L2/L3,
 * tipos de taxonomia e readiness score.
 */

import type {
  Project,
  ProjectStatus,
  ProjectObjective,
  TaxonomyMaics,
  Organization,
  Json,
} from './database'

// ============================================
// Input Types (para Server Actions)
// ============================================

/**
 * Input para criar um novo projeto
 */
export type ProjectVisibility = 'public' | 'private'

export type ProjectMemberRole = 'viewer' | 'editor' | 'manager'

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: ProjectMemberRole
  added_by: string | null
  added_at: string
}

export interface ProjectMemberWithUser extends ProjectMember {
  user?: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
}

export interface ProjectInvite {
  id: string
  project_id: string
  email: string
  role: ProjectMemberRole
  token: string
  expires_at: string
  invited_by: string
  created_at: string
}

export interface ProjectInviteWithDetails extends ProjectInvite {
  project?: {
    id: string
    codename: string
    organization_id: string
  }
  inviter?: {
    email: string
    full_name?: string
  }
}

export const PROJECT_MEMBER_ROLE_LABELS: Record<ProjectMemberRole, string> = {
  viewer: 'Visualizador',
  editor: 'Editor',
  manager: 'Gerente',
}

export const PROJECT_MEMBER_ROLE_DESCRIPTIONS: Record<ProjectMemberRole, string> = {
  viewer: 'Pode visualizar o projeto e seus dados',
  editor: 'Pode editar dados e documentos do projeto',
  manager: 'Pode gerenciar membros e configurações do projeto',
}

/**
 * Contato responsável pelo projeto
 */
export interface ProjectContact {
  name: string
  role: string
  email: string
  phone: string
}

/**
 * Preferência de advisor
 */
export type AdvisorPreference = 'has_advisor' | 'wants_recommendations'

export const ADVISOR_PREFERENCE_LABELS: Record<AdvisorPreference, string> = {
  has_advisor: 'Já possuo advisor para este projeto',
  wants_recommendations: 'Gostaria de receber recomendações da Mary',
}

export interface CreateProjectInput {
  organizationId: string
  name: string
  codename: string
  objective: ProjectObjective
  sourceProjectId?: string
  ndaRequestId?: string
  description?: string
  sectorL1?: string
  sectorL2?: string
  sectorL3?: string
  visibility?: ProjectVisibility
  contacts?: ProjectContact[]
  advisorPreference?: AdvisorPreference
  advisorEmail?: string
  valueMinUsd?: number
  valueMaxUsd?: number
  equityMinPct?: number
  equityMaxPct?: number
  reason?: string
}

/**
 * Input para atualizar um projeto existente
 */
export interface UpdateProjectInput {
  codename?: string
  description?: string
  objective?: ProjectObjective
  sectorL1?: string
  sectorL2?: string
  sectorL3?: string
  valueMinUsd?: number
  valueMaxUsd?: number
  equityMinPct?: number
  equityMaxPct?: number
  reason?: string
  ebitdaAnnualUsd?: number
  revenueAnnualUsd?: number
  visibility?: ProjectVisibility
  contacts?: ProjectContact[]
}

/**
 * Filtros para listagem de projetos
 */
export interface ListProjectsFilters {
  status?: ProjectStatus | ProjectStatus[]
  objective?: ProjectObjective | ProjectObjective[]
  sectorL1?: string
  search?: string
  limit?: number
  offset?: number
}

// ============================================
// Field Metadata (Rastreabilidade L1/L2/L3)
// ============================================

/**
 * Fonte do dado
 */
export type FieldSource = 'manual' | 'enrichment' | 'import' | 'ai_generated'

/**
 * Metadados de um nível específico
 */
export interface FieldMetadataLevel {
  /** UUID do usuário que submeteu/validou/auditou */
  userId: string
  /** Timestamp ISO da ação */
  timestamp: string
  /** Hash SHA-256 do valor no momento da ação */
  hash: string
  /** Fonte do dado (apenas para L1) */
  source?: FieldSource
  /** Notas adicionais */
  notes?: string
}

/**
 * Metadados completos de um campo (L1/L2/L3)
 */
export interface FieldMetadata {
  /** Nível 1: Submetido pelo usuário/sistema */
  l1?: FieldMetadataLevel
  /** Nível 2: Validado por Advisor ou Admin */
  l2?: FieldMetadataLevel
  /** Nível 3: Auditado por terceiro certificado */
  l3?: FieldMetadataLevel
}

/**
 * Mapa de metadados por campo do projeto
 * Exemplo: { "description": { l1: {...} }, "value_min_usd": { l1: {...}, l2: {...} } }
 */
export type ProjectFieldMetadata = Record<string, FieldMetadata>

/**
 * Obtém o nível mais alto de validação de um campo
 */
export function getFieldValidationLevel(metadata?: FieldMetadata): 0 | 1 | 2 | 3 {
  if (!metadata) return 0
  if (metadata.l3) return 3
  if (metadata.l2) return 2
  if (metadata.l1) return 1
  return 0
}

// ============================================
// Readiness Score Types
// ============================================

/**
 * Item do checklist de readiness
 */
export interface ReadinessChecklistItem {
  /** Nome do campo no banco */
  field: string
  /** Label para exibição (PT-BR) */
  label: string
  /** Peso no cálculo do score (0-100, soma de todos = 100) */
  weight: number
  /** Nível mínimo de validação requerido */
  requiredLevel: 1 | 2 | 3
  /** Nível atual do campo */
  currentLevel?: 0 | 1 | 2 | 3
  /** Se o campo está completo (tem valor e nível >= requiredLevel) */
  isComplete: boolean
  /** Descrição/dica para o usuário */
  hint?: string
}

/**
 * Resultado do cálculo de readiness
 */
export interface ReadinessResult {
  /** Score final (0-100) */
  score: number
  /** Número de itens completos */
  completedItems: number
  /** Número total de itens */
  totalItems: number
  /** Percentual de campos com validação L2 ou superior */
  l2PlusCoverage: number
  /** Checklist detalhado */
  checklist: ReadinessChecklistItem[]
  /** Se o projeto está pronto para matching (>= 70% L2+) */
  isMatchingReady: boolean
  /** Timestamp do cálculo */
  calculatedAt: string
}

/**
 * Dados de readiness armazenados no projeto
 */
export interface ReadinessData {
  /** Último score calculado */
  lastScore?: number
  /** Último cálculo */
  lastCalculatedAt?: string
  /** Checklist completo */
  checklist?: ReadinessChecklistItem[]
  /** Histórico de scores (opcional) */
  history?: Array<{ score: number; calculatedAt: string }>
}

// ============================================
// MRS Canonical Types (E3/H3.1/H3.2/H3.3)
// ============================================

export type MrsStatus = 'pendente' | 'parcial' | 'completo' | 'na'
export type MrsPriority = 'critica' | 'alta' | 'media'
export type MrsStepId = 1 | 2 | 3 | 4

export interface MrsItemFile {
  id: string
  fileName: string
  fileUrl?: string
  fileType?: string
  fileSizeBytes?: number
  uploadedAt: string
  uploadedBy: string
}

export interface MrsItem {
  id: string
  title: string
  description?: string
  status: MrsStatus
  priority: MrsPriority
  ownerUserId?: string
  comments?: string
  lastUploadAt?: string
  filesCount: number
  files: MrsItemFile[]
}

export interface MrsSubtheme {
  id: string
  name: string
  items: MrsItem[]
}

export interface MrsTheme {
  id: string
  name: string
  subthemes: MrsSubtheme[]
}

export interface MrsStep {
  id: MrsStepId
  name: string
  themes: MrsTheme[]
}

export interface MrsScoreBreakdown {
  stepScores: Record<MrsStepId, number>
  totalScore: number
}

export interface MrsGateStatus {
  ndaEligible: boolean
  nboEligible: boolean
  ndaReasons: string[]
  nboReasons: string[]
}

export interface MrsReadinessData {
  version: number
  steps: MrsStep[]
  score: MrsScoreBreakdown
  gates: MrsGateStatus
  updatedAt: string
}

// ============================================
// Taxonomy Types
// ============================================

/**
 * Nó da árvore de taxonomia
 */
export interface TaxonomyNode {
  /** Código do nó (ex: '02', '0201', '020101') */
  code: string
  /** Nível na hierarquia (1, 2 ou 3) */
  level: 1 | 2 | 3
  /** Código do pai (null para L1) */
  parentCode: string | null
  /** Nome do setor/subsetor/segmento */
  label: string
  /** Descrição detalhada */
  description: string | null
  /** Palavras-chave para busca */
  keywords: string[]
  /** Códigos CNAE mapeados */
  cnaeCodes: string[]
  /** Filhos (para árvore montada) */
  children?: TaxonomyNode[]
}

/**
 * Árvore completa de taxonomia
 */
export interface TaxonomyTree {
  /** Setores L1 (raiz) */
  sectors: TaxonomyNode[]
  /** Total de nós */
  totalNodes: number
  /** Data de carregamento */
  loadedAt: string
}

/**
 * Seleção de taxonomia (valor do componente)
 */
export interface TaxonomySelection {
  l1?: string
  l2?: string
  l3?: string
}

/**
 * Formata o caminho da taxonomia para exibição
 * Ex: "Tecnologia > SaaS > Vertical SaaS"
 */
export function formatTaxonomyPath(
  l1Label?: string,
  l2Label?: string,
  l3Label?: string
): string {
  const parts = [l1Label, l2Label, l3Label].filter(Boolean)
  return parts.join(' > ')
}

/**
 * Extrai o nível do código pelo tamanho
 */
export function getLevelFromCode(code: string): 1 | 2 | 3 {
  if (code.length === 2) return 1
  if (code.length === 4) return 2
  return 3
}

// ============================================
// Project with Relations
// ============================================

/**
 * Projeto com dados expandidos
 */
export interface ProjectWithDetails extends Project {
  /** Organização dona do projeto */
  organization?: Pick<Organization, 'id' | 'name' | 'slug' | 'profile_type'>
  /** Usuário que criou */
  createdByUser?: {
    id: string
    email: string
  }
  /** Taxonomia L1 expandida */
  taxonomyL1?: TaxonomyMaics | null
  /** Taxonomia L2 expandida */
  taxonomyL2?: TaxonomyMaics | null
  /** Taxonomia L3 expandida */
  taxonomyL3?: TaxonomyMaics | null
  /** Resultado do readiness (calculado) */
  readinessResult?: ReadinessResult
  /** Metadados parseados */
  parsedFieldMetadata?: ProjectFieldMetadata
}

/**
 * Resumo de projeto para listagem
 */
export interface ProjectSummary {
  id: string
  codename: string
  status: ProjectStatus
  objective: ProjectObjective
  sectorL1Label?: string
  readinessScore: number
  createdAt: string
  updatedAt: string
}

// ============================================
// Constants
// ============================================

/**
 * Cores para status de projeto (Tailwind classes)
 */
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
  screening: { bg: 'bg-muted', text: 'text-muted-foreground' },
  teaser: { bg: 'bg-secondary', text: 'text-secondary-foreground' },
  nda: { bg: 'bg-accent', text: 'text-accent-foreground' },
  cim_dfs: { bg: 'bg-card', text: 'text-card-foreground' },
  ioi: { bg: 'bg-primary/10', text: 'text-primary' },
  management_meetings: { bg: 'bg-primary/15', text: 'text-primary' },
  nbo: { bg: 'bg-primary/20', text: 'text-primary' },
  dd_spa: { bg: 'bg-primary/25', text: 'text-primary' },
  signing: { bg: 'bg-primary/30', text: 'text-primary' },
  cps: { bg: 'bg-primary/35', text: 'text-primary' },
  closing: { bg: 'bg-primary/40', text: 'text-primary' },
  disclosure: { bg: 'bg-primary/45', text: 'text-primary' },
  closed_won: { bg: 'bg-primary', text: 'text-primary-foreground' },
  closed_lost: { bg: 'bg-destructive', text: 'text-destructive-foreground' },
}

/**
 * Ícones para objetivo de projeto (Lucide icon names)
 */
export const PROJECT_OBJECTIVE_ICONS: Record<ProjectObjective, string> = {
  sale: 'DollarSign',
  fundraising: 'TrendingUp',
}

/**
 * Descrições curtas para objetivo
 */
export const PROJECT_OBJECTIVE_DESCRIPTIONS: Record<ProjectObjective, string> = {
  sale: 'Venda total ou parcial da empresa',
  fundraising: 'Captação de investimento',
}

/**
 * Motivos para venda
 */
export const SALE_REASONS = [
  { value: 'retirement', label: 'Aposentadoria dos sócios' },
  { value: 'succession', label: 'Sucessão familiar' },
  { value: 'diversification', label: 'Diversificação de investimentos' },
  { value: 'liquidity', label: 'Necessidade de liquidez' },
  { value: 'strategic_partnership', label: 'Parceria estratégica' },
  { value: 'valuation', label: 'Valorização do ativo' },
] as const

/**
 * Motivos para fundraising
 */
export const FUNDRAISING_REASONS = [
  { value: 'growth', label: 'Crescimento da empresa' },
  { value: 'new_products', label: 'Nova linha de produtos' },
  { value: 'geographic_expansion', label: 'Expansão geográfica' },
  { value: 'tech_investment', label: 'Investimento em tecnologia' },
  { value: 'working_capital', label: 'Capital de giro' },
  { value: 'strategic_acquisitions', label: 'Aquisições estratégicas' },
] as const

/**
 * Regex para validação de codename
 * Permite: letras, números, hífen e underscore
 * Deve começar com letra ou número
 */
export const CODENAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/

/**
 * Tamanho mínimo e máximo do codename
 */
export const CODENAME_MIN_LENGTH = 3
export const CODENAME_MAX_LENGTH = 50

/**
 * Valida um codename
 */
export function isValidCodename(codename: string): boolean {
  if (!codename) return false
  if (codename.length < CODENAME_MIN_LENGTH) return false
  if (codename.length > CODENAME_MAX_LENGTH) return false
  return CODENAME_REGEX.test(codename)
}

/**
 * Threshold de L2+ coverage para matching
 */
export const MATCHING_READY_THRESHOLD = 70

// ============================================
// Action Result Types
// ============================================

/**
 * Resultado padrão de server action
 */
export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
