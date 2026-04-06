/**
 * Mary Taxonomy - 12 Macrosetores
 * TASK-009: Setores padronizados para classificação de organizações
 *
 * Utilizado em múltiplos componentes:
 * - ProfileDetailsForm (seleção de setor)
 * - DataConfirmation (mapeamento CNAE)
 * - Filtros de busca
 */

export interface MaryTaxonomySector {
  /** Código único do setor (01-12) */
  code: string
  /** Nome do setor para exibição */
  label: string
  /** Descrição detalhada do setor */
  description: string
  /** Palavras-chave para mapeamento de CNAE */
  keywords?: string[]
}

/**
 * Lista oficial dos 12 macrosetores da Mary Taxonomy
 */
export const MARY_TAXONOMY_SECTORS: readonly MaryTaxonomySector[] = [
  {
    code: '01',
    label: 'Financial & Professional Services',
    description: 'Consultoria, serviços financeiros, seguros, contabilidade, jurídico e gestão corporativa.',
    keywords: ['banco', 'seguro', 'fintech', 'pagamento', 'crédito', 'investimento'],
  },
  {
    code: '02',
    label: 'Technology & Digital Infrastructure',
    description: 'Software, hardware, infraestrutura digital, dados e automação.',
    keywords: ['software', 'tecnologia', 'saas', 'computação', 'dados', 'cloud'],
  },
  {
    code: '03',
    label: 'Energy, Utilities & Sustainability',
    description: 'Energia, óleo & gás, saneamento, renováveis, gestão ambiental e ESG.',
    keywords: ['energia', 'elétrica', 'gás', 'solar', 'eólica', 'saneamento'],
  },
  {
    code: '04',
    label: 'Industrial, Manufacturing & Engineering',
    description: 'Produção industrial, engenharia, automação, manutenção.',
    keywords: ['indústria', 'manufatura', 'fábrica', 'químico', 'metalurgia'],
  },
  {
    code: '05',
    label: 'Logistics, Supply Chain & Mobility',
    description: 'Transporte, armazenagem, cadeias de suprimentos e mobilidade urbana.',
    keywords: ['logística', 'transporte', 'mobilidade', 'armazém', 'distribuição'],
  },
  {
    code: '06',
    label: 'Retail, Consumer & E-Commerce',
    description: 'Varejo físico e digital, marketplaces, bens de consumo e marcas D2C.',
    keywords: ['varejo', 'comércio', 'loja', 'ecommerce', 'marketplace'],
  },
  {
    code: '07',
    label: 'Healthcare, Pharma & Life Sciences',
    description: 'Hospitais, clínicas, biotecnologia, farma e dispositivos médicos.',
    keywords: ['saúde', 'hospital', 'clínica', 'farmácia', 'biotech', 'healthtech'],
  },
  {
    code: '08',
    label: 'Education, Training & Human Capital',
    description: 'Ensino, edtechs, recrutamento, gestão de talentos e produtividade.',
    keywords: ['educação', 'ensino', 'escola', 'universidade', 'edtech', 'curso'],
  },
  {
    code: '09',
    label: 'Real Estate, Construction & Infrastructure',
    description: 'Imóveis, engenharia civil, infraestrutura e gestão patrimonial.',
    keywords: ['imobiliário', 'construção', 'incorporação', 'proptech', 'imóvel'],
  },
  {
    code: '10',
    label: 'Media, Telecom & Entertainment',
    description: 'Comunicação, mídia, conteúdo, telecomunicações e streaming.',
    keywords: ['mídia', 'telecom', 'entretenimento', 'streaming', 'publicidade'],
  },
  {
    code: '11',
    label: 'Agriculture, Food & Agritech',
    description: 'Produção agrícola, insumos, tecnologia agro, alimentos e bebidas.',
    keywords: ['agro', 'alimentos', 'agronegócio', 'food', 'bebida', 'agtech'],
  },
  {
    code: '12',
    label: 'Public, Nonprofit & Impact',
    description: 'Governo, ONGs, impacto social, investimentos sustentáveis e fundações.',
    keywords: ['público', 'governo', 'ong', 'esg', 'impacto', 'sustentável'],
  },
] as const

/**
 * Tipo para código de setor válido
 */
export type SectorCode = typeof MARY_TAXONOMY_SECTORS[number]['code']

/**
 * Busca um setor pelo código
 */
export function getSectorByCode(code: string): MaryTaxonomySector | undefined {
  return MARY_TAXONOMY_SECTORS.find((s) => s.code === code)
}

/**
 * Busca setores que correspondem a uma palavra-chave
 */
export function findSectorsByKeyword(keyword: string): MaryTaxonomySector[] {
  const normalizedKeyword = keyword.toLowerCase().trim()
  return MARY_TAXONOMY_SECTORS.filter(
    (s) =>
      s.label.toLowerCase().includes(normalizedKeyword) ||
      s.description.toLowerCase().includes(normalizedKeyword) ||
      s.keywords?.some((k) => k.includes(normalizedKeyword))
  )
}

/**
 * Retorna setores formatados para uso em Select/Dropdown
 */
export function getSectorsForSelect(): Array<{ value: string; label: string }> {
  return MARY_TAXONOMY_SECTORS.map((s) => ({
    value: s.code,
    label: s.label,
  }))
}

/**
 * Valida se um código de setor é válido
 */
export function isValidSectorCode(code: string): code is SectorCode {
  return MARY_TAXONOMY_SECTORS.some((s) => s.code === code)
}
