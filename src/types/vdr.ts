/**
 * VDR (Virtual Data Room) domain types
 */

import type { Tables, TablesInsert } from './database'

// =====================================================
// BASE TYPES (from database)
// =====================================================

export type VdrFolder = Tables<'vdr_folders'>
export type VdrDocument = Tables<'vdr_documents'>
export type VdrAccessPermission = Tables<'vdr_access_permissions'>
export type VdrSharedLink = Tables<'vdr_shared_links'>
export type VdrAccessLog = Tables<'vdr_access_logs'>
export type VdrQaMessage = Tables<'vdr_qa_messages'>

// =====================================================
// ENUM TYPES
// =====================================================

export type VdrDocumentPriority = 'critical' | 'high' | 'medium' | 'low'

export type VdrDocumentStatus = 
  | 'na' 
  | 'in_progress' 
  | 'stopped' 
  | 'completed' 
  | 'pending' 
  | 'active'
  | 'archived'
  | 'deleted'

export type VdrDocumentRisk = 'high' | 'medium' | 'low'

export type VdrValidationLevel = 'n1' | 'n2' | 'n3'

export type VdrLinkType = 'linkedin' | 'drive' | 'dropbox' | 'onedrive' | 'generic'

// =====================================================
// DOCUMENT FILE & LINK TYPES
// =====================================================

export interface VdrDocumentFile {
  id: string
  document_id: string
  file_name: string
  file_url: string
  file_type: string | null
  file_size_bytes: number | null
  uploaded_by: string | null
  uploaded_at: string
}

export interface VdrDocumentLink {
  id: string
  document_id: string
  url: string
  label: string | null
  link_type: VdrLinkType
  created_by: string | null
  created_at: string
}

// =====================================================
// INPUT TYPES
// =====================================================

export interface CreateFolderInput {
  projectId: string
  name: string
  slug: string
  code?: string
  description?: string
  icon?: string
  sortOrder?: number
}

export interface UpdateFolderInput {
  name?: string
  code?: string
  description?: string
  icon?: string
  sortOrder?: number
}

export interface CreateDocumentInput {
  projectId: string
  folderId: string
  name: string
  externalUrl: string
  description?: string
  fileType?: string
  fileSizeBytes?: number
  isConfidential?: boolean
  metadata?: Record<string, unknown>
  // New fields
  code?: string // If not provided, auto-generated
  priority?: VdrDocumentPriority
  businessUnit?: string
  responsibleId?: string
  startDate?: string
  dueDate?: string
  risk?: VdrDocumentRisk
  tags?: string[]
  flags?: string[]
  sortOrder?: number
}

export interface UpdateDocumentInput {
  name?: string
  description?: string
  externalUrl?: string
  fileType?: string
  fileSizeBytes?: number
  isConfidential?: boolean
  folderId?: string
  metadata?: Record<string, unknown>
  // New fields
  code?: string
  priority?: VdrDocumentPriority
  status?: VdrDocumentStatus
  businessUnit?: string
  responsibleId?: string | null
  startDate?: string | null
  dueDate?: string | null
  risk?: VdrDocumentRisk | null
  tags?: string[]
  flags?: string[]
  sortOrder?: number
}

export interface GrantAccessInput {
  projectId: string
  granteeOrgId?: string
  granteeUserId?: string
  permissionType: 'view' | 'download' | 'share'
  documentId?: string
  folderId?: string
  expiresAt?: string
}

export interface CreateSharedLinkInput {
  projectId: string
  documentId?: string
  folderId?: string
  expiresAt?: string
  maxViews?: number
  password?: string
}

export interface CreateQaMessageInput {
  projectId: string
  documentId: string
  content: string
  parentId?: string
  isConfidential?: boolean
}

export interface AddDocumentFileInput {
  documentId: string
  fileName: string
  fileUrl: string
  fileType?: string
  fileSizeBytes?: number
}

export interface AddDocumentLinkInput {
  documentId: string
  url: string
  label?: string
  linkType?: VdrLinkType
}

// =====================================================
// BULK ACTION TYPES
// =====================================================

export interface VdrBulkUpdateInput {
  documentIds: string[]
  updates: {
    status?: VdrDocumentStatus
    priority?: VdrDocumentPriority
    responsibleId?: string | null
    risk?: VdrDocumentRisk | null
    businessUnit?: string | null
    tagsToAdd?: string[]
    tagsToRemove?: string[]
  }
}

// =====================================================
// FILTER & SORT TYPES
// =====================================================

export interface VdrDocumentFilters {
  folderIds?: string[]
  priorities?: VdrDocumentPriority[]
  statuses?: VdrDocumentStatus[]
  responsibleIds?: string[]
  businessUnits?: string[]
  risks?: VdrDocumentRisk[]
  tags?: string[]
  validationLevels?: VdrValidationLevel[]
  startDateFrom?: string
  startDateTo?: string
  dueDateFrom?: string
  dueDateTo?: string
  search?: string
  isConfidential?: boolean
}

export type VdrSortColumn = 
  | 'code' 
  | 'name'
  | 'priority' 
  | 'status' 
  | 'responsible' 
  | 'due_date' 
  | 'updated_at' 
  | 'risk'
  | 'start_date'
  | 'sort_order'

export interface VdrDocumentSort {
  column: VdrSortColumn
  direction: 'asc' | 'desc'
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface VdrFolderWithCounts extends VdrFolder {
  documentCount: number
  code: string | null
}

export interface VdrDocumentWithFolder extends VdrDocument {
  folder: Pick<VdrFolder, 'id' | 'name' | 'slug' | 'icon'> & { code: string | null }
}

export interface VdrDocumentWithCounts extends VdrDocument {
  folder: Pick<VdrFolder, 'id' | 'name' | 'slug' | 'icon'> & { code: string | null }
  files_count: number
  links_count: number
  comments_count: number
  responsible_name?: string | null
  responsible_email?: string | null
  // Extended validation info
  validation_n1_by_name?: string | null
  validation_n2_by_name?: string | null
  validation_n3_by_name?: string | null
}

export interface VdrQaMessageWithAuthor extends VdrQaMessage {
  author?: {
    email: string
    name?: string
  }
  authorOrg?: {
    name: string
    profileType: string
  }
  replies?: VdrQaMessageWithAuthor[]
}

export interface VdrAccessLogWithDetails extends VdrAccessLog {
  document?: Pick<VdrDocument, 'id' | 'name'>
  folder?: Pick<VdrFolder, 'id' | 'name'>
  user?: {
    email: string
    name?: string
  }
  organization?: {
    name: string
  }
}

export interface VdrStats {
  totalDocuments: number
  totalFolders: number
  totalViews: number
  totalSharedLinks: number
  recentActivity: VdrAccessLogWithDetails[]
  // Extended stats
  documentsWithN1: number
  documentsWithN2: number
  documentsWithN3: number
  documentsByPriority: Record<VdrDocumentPriority, number>
  documentsByStatus: Record<string, number>
}

export interface VdrInvestorEngagement {
  organizationId: string
  organizationName: string
  organizationSlug: string
  totalViews: number
  totalDurationSeconds: number
  uniqueDocuments: number
  lastAccessAt: string | null
}

// =====================================================
// DEFAULT FOLDERS (Updated with codes)
// =====================================================

export const DEFAULT_VDR_FOLDERS = [
  { slug: 'estrategia', name: 'Estratégia', code: 'EST', icon: 'target', sortOrder: 0 },
  { slug: 'comercial', name: 'Comercial', code: 'COM', icon: 'briefcase', sortOrder: 1 },
  { slug: 'financeiro', name: 'Financeiro', code: 'FIN', icon: 'wallet', sortOrder: 2 },
  { slug: 'operacional', name: 'Operacional', code: 'OPE', icon: 'cog', sortOrder: 3 },
  { slug: 'tecnologia', name: 'Tecnologia', code: 'TEC', icon: 'cpu', sortOrder: 4 },
  { slug: 'rh', name: 'Recursos Humanos', code: 'RH', icon: 'users', sortOrder: 5 },
  { slug: 'juridico', name: 'Jurídico', code: 'JUR', icon: 'scale', sortOrder: 6 },
  { slug: 'outros', name: 'Outros', code: 'OUT', icon: 'folder', sortOrder: 7 },
] as const

export type DefaultFolderSlug = typeof DEFAULT_VDR_FOLDERS[number]['slug']
export type DefaultFolderCode = typeof DEFAULT_VDR_FOLDERS[number]['code']

// =====================================================
// DEFAULT DOCUMENTS (32 items template)
// =====================================================

export interface DefaultVdrDocument {
  code: string
  title: string
  folderCode: DefaultFolderCode
  priority: VdrDocumentPriority
  description: string
}

export const DEFAULT_VDR_DOCUMENTS: DefaultVdrDocument[] = [
  // Estratégia (5 items)
  { code: 'EST-01', title: 'Plano Estratégico de 3-5 anos (aprovado)', folderCode: 'EST', priority: 'critical', description: 'Documento detalhando a visão estratégica de médio/longo prazo da empresa, incluindo objetivos, metas e iniciativas aprovadas pelo conselho.' },
  { code: 'EST-02', title: 'Análise de Mercado (TAM/SAM/SOM)', folderCode: 'EST', priority: 'high', description: 'Estudo de dimensionamento de mercado: Total Addressable Market, Serviceable Available Market e Serviceable Obtainable Market.' },
  { code: 'EST-03', title: 'Mapa Competitivo e Diferenciais', folderCode: 'EST', priority: 'medium', description: 'Análise da concorrência, posicionamento de mercado e principais diferenciais competitivos.' },
  { code: 'EST-04', title: 'Roadmap de Produto/Tecnologia', folderCode: 'EST', priority: 'medium', description: 'Planejamento de evolução do produto e tecnologia para os próximos 12-24 meses.' },
  { code: 'EST-05', title: 'Análise de ESG e Sustentabilidade', folderCode: 'EST', priority: 'low', description: 'Relatório de práticas ambientais, sociais e de governança corporativa.' },
  
  // Comercial (5 items)
  { code: 'COM-01', title: 'Pipeline e Previsão de Vendas', folderCode: 'COM', priority: 'high', description: 'Funil de vendas atual, oportunidades em aberto e projeções de fechamento.' },
  { code: 'COM-02', title: 'Contratos e Acordos Comerciais', folderCode: 'COM', priority: 'high', description: 'Principais contratos com clientes, acordos comerciais vigentes e condições especiais.' },
  { code: 'COM-03', title: 'Análise de Customer Success', folderCode: 'COM', priority: 'medium', description: 'Métricas de satisfação, NPS, churn rate e estratégias de retenção de clientes.' },
  { code: 'COM-04', title: 'Políticas de Preços e Descontos', folderCode: 'COM', priority: 'medium', description: 'Estrutura de preços, política de descontos e margens praticadas.' },
  { code: 'COM-05', title: 'Canais de Distribuição', folderCode: 'COM', priority: 'low', description: 'Estratégia de go-to-market, canais de venda e parcerias de distribuição.' },
  
  // Financeiro (5 items)
  { code: 'FIN-01', title: 'Demonstrações Financeiras Auditadas', folderCode: 'FIN', priority: 'critical', description: 'Balanço patrimonial, DRE e fluxo de caixa dos últimos 3 anos, auditados por firma independente.' },
  { code: 'FIN-02', title: 'Orçamento e Projeções Financeiras', folderCode: 'FIN', priority: 'high', description: 'Budget anual aprovado e projeções financeiras para os próximos 3-5 anos.' },
  { code: 'FIN-03', title: 'Controles Internos e Compliance', folderCode: 'FIN', priority: 'medium', description: 'Descrição dos controles internos, políticas de compliance e governança financeira.' },
  { code: 'FIN-04', title: 'Gestão de Caixa e Liquidez', folderCode: 'FIN', priority: 'medium', description: 'Posição de caixa atual, política de gestão de liquidez e capital de giro.' },
  { code: 'FIN-05', title: 'Estrutura de Capital e Endividamento', folderCode: 'FIN', priority: 'high', description: 'Detalhamento de dívidas, financiamentos, debêntures e estrutura de capital.' },
  
  // Operacional (5 items)
  { code: 'OPE-01', title: 'Manuais de Processos e Procedimentos', folderCode: 'OPE', priority: 'medium', description: 'Documentação de processos operacionais, SOPs e fluxos de trabalho.' },
  { code: 'OPE-02', title: 'Indicadores de Performance (KPIs)', folderCode: 'OPE', priority: 'high', description: 'Dashboard de KPIs operacionais, metas e histórico de performance.' },
  { code: 'OPE-03', title: 'Gestão da Cadeia de Suprimentos', folderCode: 'OPE', priority: 'medium', description: 'Fornecedores críticos, contratos de supply chain e gestão de estoque.' },
  { code: 'OPE-04', title: 'Qualidade e Certificações', folderCode: 'OPE', priority: 'medium', description: 'Certificações (ISO, etc.), políticas de qualidade e métricas de defeitos.' },
  { code: 'OPE-05', title: 'Gestão de Riscos Operacionais', folderCode: 'OPE', priority: 'low', description: 'Matriz de riscos operacionais, planos de contingência e BCM.' },
  
  // Tecnologia (4 items)
  { code: 'TEC-01', title: 'Arquitetura de Sistemas e TI', folderCode: 'TEC', priority: 'high', description: 'Diagrama de arquitetura, stack tecnológica e infraestrutura de TI.' },
  { code: 'TEC-02', title: 'Segurança da Informação', folderCode: 'TEC', priority: 'high', description: 'Políticas de segurança, relatórios de pentest e compliance com LGPD.' },
  { code: 'TEC-03', title: 'Gestão de Dados e Analytics', folderCode: 'TEC', priority: 'medium', description: 'Estratégia de dados, ferramentas de BI e governança de dados.' },
  { code: 'TEC-04', title: 'Inovação e P&D', folderCode: 'TEC', priority: 'low', description: 'Investimentos em R&D, projetos de inovação e patentes.' },
  
  // Recursos Humanos (4 items)
  { code: 'RH-01', title: 'Organograma e Estrutura Organizacional', folderCode: 'RH', priority: 'high', description: 'Organograma atualizado, headcount por área e estrutura hierárquica.' },
  { code: 'RH-02', title: 'Políticas de RH e Benefícios', folderCode: 'RH', priority: 'medium', description: 'Políticas de remuneração, benefícios, PLR e equity.' },
  { code: 'RH-03', title: 'Gestão de Performance e Sucessão', folderCode: 'RH', priority: 'medium', description: 'Processos de avaliação, planos de sucessão e desenvolvimento de lideranças.' },
  { code: 'RH-04', title: 'Compliance Trabalhista', folderCode: 'RH', priority: 'high', description: 'Passivos trabalhistas, ações em andamento e conformidade com legislação.' },
  
  // Jurídico (4 items)
  { code: 'JUR-01', title: 'Contratos e Documentos Societários', folderCode: 'JUR', priority: 'critical', description: 'Estatuto/contrato social, atas de assembleias e acordos de acionistas.' },
  { code: 'JUR-02', title: 'Compliance Regulatório', folderCode: 'JUR', priority: 'high', description: 'Licenças, alvarás, conformidade setorial e relacionamento com reguladores.' },
  { code: 'JUR-03', title: 'Litígios e Contingências', folderCode: 'JUR', priority: 'high', description: 'Processos judiciais, administrativos, arbitragens e provisões para contingências.' },
  { code: 'JUR-04', title: 'Propriedade Intelectual', folderCode: 'JUR', priority: 'medium', description: 'Marcas, patentes, softwares registrados e trade secrets.' },
] as const

// =====================================================
// PERMISSION TYPES
// =====================================================

export type VdrPermissionType = 'view' | 'download' | 'share'

export type VdrAccessAction = 'view_start' | 'view_end' | 'download' | 'print_attempt'

// =====================================================
// AUDIT ACTIONS
// =====================================================

export type VdrAuditAction =
  | 'vdr.folder_created'
  | 'vdr.folder_updated'
  | 'vdr.folder_deleted'
  | 'vdr.document_created'
  | 'vdr.document_updated'
  | 'vdr.document_deleted'
  | 'vdr.document_validated'
  | 'vdr.document_unvalidated'
  | 'vdr.document_bulk_updated'
  | 'vdr.link_created'
  | 'vdr.link_revoked'
  | 'vdr.file_added'
  | 'vdr.file_removed'
  | 'vdr.external_link_added'
  | 'vdr.external_link_removed'
  | 'vdr.access_granted'
  | 'vdr.access_revoked'
  | 'vdr.view_started'
  | 'vdr.view_ended'
  | 'vdr.print_attempt'
  | 'vdr.qa_message_sent'
  | 'vdr.qa_resolved'

// =====================================================
// UI HELPER TYPES
// =====================================================

export interface VdrColumnDefinition {
  id: string
  label: string
  width?: string
  sortable: boolean
  visible: boolean
  priority: number // For responsive hiding: 1 = always visible, higher = hide first
}

export const VDR_COLUMNS: VdrColumnDefinition[] = [
  { id: 'checkbox', label: '', width: '40px', sortable: false, visible: true, priority: 1 },
  { id: 'code', label: 'ID_Solicitação', width: '300px', sortable: true, visible: true, priority: 1 },
  { id: 'priority', label: 'Prioridade', width: '100px', sortable: true, visible: true, priority: 2 },
  { id: 'business_unit', label: 'Business Unit', width: '100px', sortable: true, visible: true, priority: 5 },
  { id: 'status', label: 'Status', width: '120px', sortable: true, visible: true, priority: 2 },
  { id: 'responsible', label: 'Responsável', width: '140px', sortable: true, visible: true, priority: 3 },
  { id: 'files_links', label: 'Link/Arquivos', width: '120px', sortable: false, visible: true, priority: 3 },
  { id: 'comments', label: 'Comentários', width: '100px', sortable: true, visible: true, priority: 4 },
  { id: 'validation', label: 'N1/N2/N3', width: '120px', sortable: false, visible: true, priority: 2 },
  { id: 'tags', label: 'Tags', width: '100px', sortable: false, visible: true, priority: 5 },
  { id: 'risk', label: 'Risco', width: '80px', sortable: true, visible: true, priority: 4 },
  { id: 'flags', label: 'Flags', width: '60px', sortable: false, visible: true, priority: 6 },
  { id: 'start_date', label: 'Data Início', width: '110px', sortable: true, visible: true, priority: 5 },
  { id: 'due_date', label: 'Prazo', width: '110px', sortable: true, visible: true, priority: 3 },
  { id: 'updated_at', label: 'Última Atualização', width: '140px', sortable: true, visible: true, priority: 4 },
  { id: 'actions', label: 'Ações', width: '50px', sortable: false, visible: true, priority: 1 },
]

// Priority badge colors
export const PRIORITY_COLORS: Record<VdrDocumentPriority, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
}

export const PRIORITY_LABELS: Record<VdrDocumentPriority, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

// Status badge colors
export const STATUS_COLORS: Record<VdrDocumentStatus, { bg: string; text: string; border: string }> = {
  na: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  stopped: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  pending: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  active: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  archived: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  deleted: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100' },
}

export const STATUS_LABELS: Record<VdrDocumentStatus, string> = {
  na: 'N/A',
  in_progress: 'Em andamento',
  stopped: 'Parado',
  completed: 'Concluído',
  pending: 'Pendente',
  active: 'Ativo',
  archived: 'Arquivado',
  deleted: 'Excluído',
}

// Risk badge colors
export const RISK_COLORS: Record<VdrDocumentRisk, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
}

export const RISK_LABELS: Record<VdrDocumentRisk, string> = {
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
}
