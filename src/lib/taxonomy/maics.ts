/**
 * Lógica de domínio para Taxonomia MAICS
 *
 * Funções para manipulação da hierarquia de setores,
 * construção de árvore e mapeamento CNAE.
 */

import type { TaxonomyMaics } from '@/types/database'
import type { TaxonomyNode, TaxonomyTree } from '@/types/projects'

// ============================================
// Tree Building
// ============================================

/**
 * Constrói árvore hierárquica a partir de lista plana de nós
 */
export function buildTaxonomyTree(nodes: TaxonomyMaics[]): TaxonomyTree {
  // Separa por nível
  const l1Nodes = nodes.filter(n => n.level === 1)
  const l2Nodes = nodes.filter(n => n.level === 2)
  const l3Nodes = nodes.filter(n => n.level === 3)

  // Mapeia L3 para seus pais L2
  const l3ByParent = new Map<string, TaxonomyNode[]>()
  for (const node of l3Nodes) {
    if (!node.parent_code) continue
    const children = l3ByParent.get(node.parent_code) || []
    children.push(mapToNode(node))
    l3ByParent.set(node.parent_code, children)
  }

  // Mapeia L2 para seus pais L1, anexando L3
  const l2ByParent = new Map<string, TaxonomyNode[]>()
  for (const node of l2Nodes) {
    if (!node.parent_code) continue
    const l2Node = mapToNode(node)
    l2Node.children = l3ByParent.get(node.code) || []
    const children = l2ByParent.get(node.parent_code) || []
    children.push(l2Node)
    l2ByParent.set(node.parent_code, children)
  }

  // Constrói L1 com L2 anexados
  const sectors: TaxonomyNode[] = l1Nodes.map(node => {
    const l1Node = mapToNode(node)
    l1Node.children = l2ByParent.get(node.code) || []
    return l1Node
  })

  return {
    sectors,
    totalNodes: nodes.length,
    loadedAt: new Date().toISOString(),
  }
}

/**
 * Mapeia registro do banco para TaxonomyNode
 */
function mapToNode(row: TaxonomyMaics): TaxonomyNode {
  return {
    code: row.code,
    level: row.level as 1 | 2 | 3,
    parentCode: row.parent_code,
    label: row.label,
    description: row.description,
    keywords: row.keywords || [],
    cnaeCodes: row.cnae_codes || [],
  }
}

// ============================================
// Code Helpers
// ============================================

/**
 * Extrai o nível do código pelo tamanho
 * - 2 caracteres = L1 (ex: '02')
 * - 4 caracteres = L2 (ex: '0201')
 * - 6 caracteres = L3 (ex: '020101')
 */
export function getLevelFromCode(code: string): 1 | 2 | 3 {
  if (code.length === 2) return 1
  if (code.length === 4) return 2
  return 3
}

/**
 * Retorna os códigos dos pais em ordem (L1, L2)
 * Ex: '020103' -> ['02', '0201']
 */
export function getParentCodes(code: string): string[] {
  const parents: string[] = []
  if (code.length >= 4) {
    parents.push(code.substring(0, 2)) // L1
  }
  if (code.length >= 6) {
    parents.push(code.substring(0, 4)) // L2
  }
  return parents
}

/**
 * Formata o caminho da taxonomia para exibição
 * Ex: formatTaxonomyPath('Tecnologia', 'SaaS', 'Vertical SaaS') -> 'Tecnologia > SaaS > Vertical SaaS'
 */
export function formatTaxonomyPath(
  l1Label?: string | null,
  l2Label?: string | null,
  l3Label?: string | null
): string {
  const parts = [l1Label, l2Label, l3Label].filter(Boolean) as string[]
  return parts.join(' > ')
}

/**
 * Valida se um código é válido
 */
export function isValidTaxonomyCode(code: string): boolean {
  if (!code) return false
  if (![2, 4, 6].includes(code.length)) return false
  return /^\d+$/.test(code)
}

// ============================================
// Search
// ============================================

/**
 * Busca nós por palavra-chave
 * Busca em: label, description, keywords
 */
export function searchByKeyword(
  nodes: TaxonomyNode[],
  keyword: string
): TaxonomyNode[] {
  const normalizedKeyword = keyword.toLowerCase().trim()
  if (!normalizedKeyword) return []

  const results: TaxonomyNode[] = []

  function searchNode(node: TaxonomyNode): boolean {
    const labelMatch = node.label.toLowerCase().includes(normalizedKeyword)
    const descMatch = node.description?.toLowerCase().includes(normalizedKeyword) || false
    const keywordMatch = node.keywords.some(k => k.toLowerCase().includes(normalizedKeyword))

    if (labelMatch || descMatch || keywordMatch) {
      return true
    }

    return false
  }

  function traverse(nodes: TaxonomyNode[]) {
    for (const node of nodes) {
      if (searchNode(node)) {
        results.push(node)
      }
      if (node.children) {
        traverse(node.children)
      }
    }
  }

  traverse(nodes)
  return results
}

/**
 * Busca nós em lista plana por palavra-chave
 */
export function searchTaxonomyNodes(
  nodes: TaxonomyMaics[],
  keyword: string
): TaxonomyMaics[] {
  const normalizedKeyword = keyword.toLowerCase().trim()
  if (!normalizedKeyword) return []

  return nodes.filter(node => {
    const labelMatch = node.label.toLowerCase().includes(normalizedKeyword)
    const descMatch = node.description?.toLowerCase().includes(normalizedKeyword) || false
    const keywordMatch = node.keywords?.some(k => k.toLowerCase().includes(normalizedKeyword)) || false
    return labelMatch || descMatch || keywordMatch
  })
}

// ============================================
// CNAE Mapping
// ============================================

/**
 * Mapeia código CNAE para código MAICS
 * Retorna o código MAICS mais específico encontrado
 */
export function mapCnaeToMaics(
  cnaeCode: string,
  nodes: TaxonomyMaics[]
): string | null {
  if (!cnaeCode) return null

  // Normaliza CNAE (remove pontos e hífens)
  const normalizedCnae = cnaeCode.replace(/[.-]/g, '')

  // Ordena por nível descendente (L3 primeiro, depois L2, depois L1)
  const sortedNodes = [...nodes].sort((a, b) => b.level - a.level)

  for (const node of sortedNodes) {
    if (!node.cnae_codes) continue
    for (const cnaeMapped of node.cnae_codes) {
      const normalizedMapped = cnaeMapped.replace(/[.-]/g, '')
      // Match exato ou por prefixo
      if (normalizedCnae === normalizedMapped || normalizedCnae.startsWith(normalizedMapped)) {
        return node.code
      }
    }
  }

  return null
}

/**
 * Encontra todos os códigos CNAE mapeados para um setor
 */
export function getCnaeCodesForSector(
  sectorCode: string,
  nodes: TaxonomyMaics[]
): string[] {
  const sector = nodes.find(n => n.code === sectorCode)
  if (!sector) return []

  const cnaeCodes: string[] = [...(sector.cnae_codes || [])]

  // Inclui CNAEs dos filhos
  const childNodes = nodes.filter(n => n.parent_code === sectorCode)
  for (const child of childNodes) {
    cnaeCodes.push(...(child.cnae_codes || []))
    // Netos (L3)
    const grandchildren = nodes.filter(n => n.parent_code === child.code)
    for (const gc of grandchildren) {
      cnaeCodes.push(...(gc.cnae_codes || []))
    }
  }

  const uniqueCodes: string[] = []
  const seen = new Set<string>()
  for (const code of cnaeCodes) {
    if (!seen.has(code)) {
      seen.add(code)
      uniqueCodes.push(code)
    }
  }

  return uniqueCodes // Remove duplicatas
}

// ============================================
// Filtering
// ============================================

/**
 * Filtra nós por nível
 */
export function filterByLevel(
  nodes: TaxonomyMaics[],
  level: 1 | 2 | 3
): TaxonomyMaics[] {
  return nodes.filter(n => n.level === level)
}

/**
 * Obtém filhos de um nó pai
 */
export function getChildren(
  nodes: TaxonomyMaics[],
  parentCode: string
): TaxonomyMaics[] {
  return nodes.filter(n => n.parent_code === parentCode)
}

/**
 * Obtém caminho completo de um código (L1 -> L2 -> L3)
 */
export function getTaxonomyPath(
  code: string,
  nodes: TaxonomyMaics[]
): TaxonomyMaics[] {
  const path: TaxonomyMaics[] = []
  const nodeMap = new Map(nodes.map(n => [n.code, n]))

  // Encontra o nó atual
  let current = nodeMap.get(code)

  // Sobe a hierarquia
  while (current) {
    path.unshift(current)
    if (current.parent_code) {
      current = nodeMap.get(current.parent_code)
    } else {
      break
    }
  }

  return path
}
