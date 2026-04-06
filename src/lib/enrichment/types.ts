/**
 * Types for enrichment services
 * Phase 3.2 - Onboarding data enrichment
 */

// ============================================
// BrasilAPI Types
// ============================================

/** Sócio/Acionista retornado pela BrasilAPI */
export interface BrasilApiShareholder {
  nome_socio: string
  cnpj_cpf_do_socio: string
  codigo_qualificacao_socio: number
  qualificacao_socio: string
  data_entrada_sociedade?: string
  percentual_capital_social?: number
}

/** Atividade econômica (CNAE) */
export interface BrasilApiCnae {
  codigo: number
  descricao: string
}

/** Resposta completa da BrasilAPI para CNPJ */
export interface BrasilApiCnpjResponse {
  cnpj: string
  razao_social: string
  nome_fantasia: string | null
  data_inicio_atividade: string
  cnae_fiscal: number
  cnae_fiscal_descricao: string
  cnaes_secundarios?: BrasilApiCnae[]
  natureza_juridica: string
  situacao_cadastral: number
  descricao_situacao_cadastral: string
  data_situacao_cadastral: string
  motivo_situacao_cadastral?: number
  descricao_motivo_situacao_cadastral?: string
  capital_social: number
  porte: string
  descricao_porte: string
  opcao_pelo_simples: boolean | null
  data_opcao_pelo_simples?: string | null
  opcao_pelo_mei: boolean | null
  descricao_tipo_logradouro: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  uf: string
  codigo_municipio: number
  municipio: string
  ddd_telefone_1: string
  ddd_telefone_2?: string
  ddd_fax?: string
  email?: string
  qsa: BrasilApiShareholder[]
}

/** Dados normalizados da empresa */
export interface EnrichedCompanyData {
  // Identificação
  cnpj: string
  razaoSocial: string
  nomeFantasia: string | null
  
  // Atividade
  cnaeCode: string
  cnaeDescription: string
  cnaesSecundarios?: Array<{ codigo: string; descricao: string }>
  
  // Dados jurídicos
  naturezaJuridica: string
  capitalSocial: number
  porte: string
  situacaoCadastral: string
  dataInicioAtividade: string
  
  // Endereço
  address: {
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    uf: string
    cep: string
  }
  
  // Contato
  telefone: string | null
  email: string | null
  
  // Sócios (QSA - Quadro de Sócios e Administradores)
  shareholders: Array<{
    nome: string
    cpfCnpj: string
    qualificacao: string
    /** Percentual de participação no capital social (0-100) */
    percentualParticipacao?: number
    /** Data de entrada na sociedade (ISO string) */
    dataEntrada?: string
  }>
  
  // Metadados
  fetchedAt: string
  source: 'brasil_api'
}

// ============================================
// Jina.ai Reader Types
// ============================================

/** Resultado do scraping via Jina Reader */
export interface JinaReaderResult {
  url: string
  title: string | null
  content: string
  fetchedAt: string
  source: 'jina_reader'
}

/** Dados extraídos do website */
export interface EnrichedWebsiteData {
  url: string
  title: string | null
  markdownContent: string
  extractedDescription: string | null
  fetchedAt: string
  source: 'jina_reader'
}

// ============================================
// Clearbit Logo Types
// ============================================

/** Resultado da busca de logo */
export interface ClearbitLogoResult {
  domain: string
  logoUrl: string | null
  exists: boolean
  fetchedAt: string
  source: 'clearbit'
}

// ============================================
// ViaCEP Types
// ============================================

/** Resposta da API ViaCEP */
export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  unidade: string
  bairro: string
  localidade: string
  uf: string
  estado: string
  regiao: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

/** Dados normalizados do CEP */
export interface EnrichedCepData {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
  estado: string
  regiao: string
  ibge: string
  ddd: string
  fetchedAt: string
  source: 'viacep'
}

// ============================================
// OpenAI Description Types
// ============================================

/** Contexto para geração de descrição */
export interface DescriptionContext {
  razaoSocial: string
  nomeFantasia?: string | null
  cnaeDescription: string
  websiteContent?: string | null
  setor?: string | null
}

/** Resultado da geração de descrição */
export interface GeneratedDescription {
  text: string
  model: string
  tokensUsed: number
  generatedAt: string
  source: 'openai'
  confidence: 'high' | 'medium' | 'low'
}

// ============================================
// CVM Validation Types
// ============================================

/** Tipos de participante CVM */
export type CvmParticipantType = 
  | 'cia_aberta'
  | 'fundo_investimento'
  | 'gestor'
  | 'administrador'
  | 'consultor'
  | 'auditor'
  | 'agente_autonomo'

/** Resultado da validação CVM */
export interface CvmValidationResult {
  cnpj: string
  isRegistered: boolean
  participantType: CvmParticipantType | null
  participantName: string | null
  participantStatus: string | null
  registryDate: string | null
  checkedAt: string
  source: 'cvm_cache'
}

// ============================================
// Enrichment Result Types
// ============================================

/** Status de uma operação de enriquecimento */
export type EnrichmentStatus = 'success' | 'error' | 'not_found' | 'timeout'

/** Resultado genérico de enriquecimento */
export interface EnrichmentResult<T> {
  status: EnrichmentStatus
  data: T | null
  error?: string
  duration: number // ms
}

/** Resultado completo do enriquecimento de onboarding */
export interface OnboardingEnrichmentResult {
  cnpj: EnrichmentResult<EnrichedCompanyData> | null
  website: EnrichmentResult<EnrichedWebsiteData> | null
  logo: EnrichmentResult<ClearbitLogoResult> | null
  cvm: EnrichmentResult<CvmValidationResult> | null
  description: EnrichmentResult<GeneratedDescription> | null
}

// ============================================
// Error Types
// ============================================

/** Erro de enriquecimento */
export class EnrichmentError extends Error {
  constructor(
    message: string,
    public readonly source: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'EnrichmentError'
  }
}

// ============================================
// Constants
// ============================================

/** Timeouts padrão para APIs (em ms) */
export const API_TIMEOUTS = {
  BRASIL_API: 10000,
  JINA_READER: 15000,
  CLEARBIT: 5000,
  VIACEP: 5000,
  OPENAI: 30000,
  CVM: 5000,
} as const

/** URLs base das APIs */
export const API_URLS = {
  BRASIL_API: 'https://brasilapi.com.br/api',
  JINA_READER: 'https://r.jina.ai',
  DUCKDUCKGO_ICONS: 'https://icons.duckduckgo.com/ip3',
  GOOGLE_FAVICON: 'https://www.google.com/s2/favicons',
  VIACEP: 'https://viacep.com.br/ws',
} as const
