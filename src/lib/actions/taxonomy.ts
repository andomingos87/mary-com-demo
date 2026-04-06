'use server'

import { createClient } from '@/lib/supabase/server'
import type { TaxonomyMaics } from '@/types/database'
import type { TaxonomyNode, TaxonomyTree, ActionResult } from '@/types/projects'
import {
  buildTaxonomyTree,
  searchTaxonomyNodes,
  filterByLevel,
  getChildren,
  getTaxonomyPath,
} from '@/lib/taxonomy'

// ============================================
// Get Full Taxonomy Tree
// ============================================

/**
 * Retorna a árvore hierárquica completa da taxonomia MAICS
 * Cache-friendly - dados não mudam frequentemente
 */
export async function getTaxonomyTree(): Promise<ActionResult<TaxonomyTree>> {
  try {
    const supabase = await createClient()

    // Get all active taxonomy nodes
    const { data: nodes, error } = await supabase
      .from('taxonomy_maics')
      .select('*')
      .eq('is_active', true)
      .order('code')

    if (error) {
      console.error('Error fetching taxonomy:', error)
      return { success: false, error: 'Erro ao carregar taxonomia' }
    }

    if (!nodes || nodes.length === 0) {
      return {
        success: true,
        data: {
          sectors: [],
          totalNodes: 0,
          loadedAt: new Date().toISOString(),
        },
      }
    }

    // Build hierarchical tree
    const tree = buildTaxonomyTree(nodes)

    return { success: true, data: tree }
  } catch (error) {
    console.error('Unexpected error in getTaxonomyTree:', error)
    return { success: false, error: 'Erro inesperado ao carregar taxonomia' }
  }
}

// ============================================
// Get Taxonomy by Level
// ============================================

/**
 * Retorna nós de um nível específico
 * @param level - 1 (L1), 2 (L2) ou 3 (L3)
 * @param parentCode - Opcional, filtra por código do pai
 */
export async function getTaxonomyByLevel(
  level: 1 | 2 | 3,
  parentCode?: string
): Promise<ActionResult<TaxonomyNode[]>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('taxonomy_maics')
      .select('*')
      .eq('level', level)
      .eq('is_active', true)
      .order('code')

    if (parentCode) {
      query = query.eq('parent_code', parentCode)
    }

    const { data: nodes, error } = await query

    if (error) {
      console.error('Error fetching taxonomy by level:', error)
      return { success: false, error: 'Erro ao carregar taxonomia' }
    }

    // Map to TaxonomyNode format
    const taxonomyNodes: TaxonomyNode[] = (nodes || []).map(node => ({
      code: node.code,
      level: node.level as 1 | 2 | 3,
      parentCode: node.parent_code,
      label: node.label,
      description: node.description,
      keywords: node.keywords || [],
      cnaeCodes: node.cnae_codes || [],
    }))

    return { success: true, data: taxonomyNodes }
  } catch (error) {
    console.error('Unexpected error in getTaxonomyByLevel:', error)
    return { success: false, error: 'Erro inesperado ao carregar taxonomia' }
  }
}

// ============================================
// Search Taxonomy
// ============================================

/**
 * Busca na taxonomia por palavra-chave
 * Busca em: label, description, keywords
 */
export async function searchTaxonomy(
  query: string
): Promise<ActionResult<TaxonomyNode[]>> {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] }
    }

    const supabase = await createClient()

    // Get all active nodes and filter in memory
    // For small datasets like taxonomy (~100 nodes), this is efficient
    const { data: nodes, error } = await supabase
      .from('taxonomy_maics')
      .select('*')
      .eq('is_active', true)
      .order('level')
      .order('code')

    if (error) {
      console.error('Error searching taxonomy:', error)
      return { success: false, error: 'Erro ao buscar taxonomia' }
    }

    if (!nodes || nodes.length === 0) {
      return { success: true, data: [] }
    }

    // Search using domain logic
    const matchedNodes = searchTaxonomyNodes(nodes, query)

    // Map to TaxonomyNode format
    const taxonomyNodes: TaxonomyNode[] = matchedNodes.map(node => ({
      code: node.code,
      level: node.level as 1 | 2 | 3,
      parentCode: node.parent_code,
      label: node.label,
      description: node.description,
      keywords: node.keywords || [],
      cnaeCodes: node.cnae_codes || [],
    }))

    return { success: true, data: taxonomyNodes }
  } catch (error) {
    console.error('Unexpected error in searchTaxonomy:', error)
    return { success: false, error: 'Erro inesperado ao buscar taxonomia' }
  }
}

// ============================================
// Get Taxonomy Node
// ============================================

/**
 * Retorna um nó específico pelo código
 */
export async function getTaxonomyNode(
  code: string
): Promise<ActionResult<TaxonomyNode>> {
  try {
    if (!code) {
      return { success: false, error: 'Código obrigatório' }
    }

    const supabase = await createClient()

    const { data: node, error } = await supabase
      .from('taxonomy_maics')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (error || !node) {
      if (error?.code === 'PGRST116') {
        return { success: false, error: 'Nó de taxonomia não encontrado' }
      }
      console.error('Error fetching taxonomy node:', error)
      return { success: false, error: 'Erro ao buscar nó de taxonomia' }
    }

    const taxonomyNode: TaxonomyNode = {
      code: node.code,
      level: node.level as 1 | 2 | 3,
      parentCode: node.parent_code,
      label: node.label,
      description: node.description,
      keywords: node.keywords || [],
      cnaeCodes: node.cnae_codes || [],
    }

    return { success: true, data: taxonomyNode }
  } catch (error) {
    console.error('Unexpected error in getTaxonomyNode:', error)
    return { success: false, error: 'Erro inesperado ao buscar nó de taxonomia' }
  }
}

// ============================================
// Get Taxonomy Path
// ============================================

/**
 * Retorna o caminho completo de um código (L1 -> L2 -> L3)
 */
export async function getTaxonomyFullPath(
  code: string
): Promise<ActionResult<TaxonomyNode[]>> {
  try {
    if (!code) {
      return { success: false, error: 'Código obrigatório' }
    }

    const supabase = await createClient()

    // Get all nodes and build path
    const { data: nodes, error } = await supabase
      .from('taxonomy_maics')
      .select('*')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching taxonomy:', error)
      return { success: false, error: 'Erro ao carregar taxonomia' }
    }

    if (!nodes || nodes.length === 0) {
      return { success: true, data: [] }
    }

    // Get path using domain logic
    const path = getTaxonomyPath(code, nodes)

    // Map to TaxonomyNode format
    const taxonomyPath: TaxonomyNode[] = path.map(node => ({
      code: node.code,
      level: node.level as 1 | 2 | 3,
      parentCode: node.parent_code,
      label: node.label,
      description: node.description,
      keywords: node.keywords || [],
      cnaeCodes: node.cnae_codes || [],
    }))

    return { success: true, data: taxonomyPath }
  } catch (error) {
    console.error('Unexpected error in getTaxonomyFullPath:', error)
    return { success: false, error: 'Erro inesperado ao buscar caminho de taxonomia' }
  }
}

// ============================================
// Get L1 Sectors (Cached)
// ============================================

/**
 * Retorna apenas os macrosetores (L1)
 * Útil para dropdowns de seleção inicial
 */
export async function getL1Sectors(): Promise<ActionResult<TaxonomyNode[]>> {
  return getTaxonomyByLevel(1)
}

// ============================================
// Get Children
// ============================================

/**
 * Retorna os filhos diretos de um nó
 */
export async function getTaxonomyChildren(
  parentCode: string
): Promise<ActionResult<TaxonomyNode[]>> {
  try {
    if (!parentCode) {
      return { success: false, error: 'Código do pai obrigatório' }
    }

    const supabase = await createClient()

    const { data: nodes, error } = await supabase
      .from('taxonomy_maics')
      .select('*')
      .eq('parent_code', parentCode)
      .eq('is_active', true)
      .order('code')

    if (error) {
      console.error('Error fetching taxonomy children:', error)
      return { success: false, error: 'Erro ao carregar subsetores' }
    }

    // Map to TaxonomyNode format
    const taxonomyNodes: TaxonomyNode[] = (nodes || []).map(node => ({
      code: node.code,
      level: node.level as 1 | 2 | 3,
      parentCode: node.parent_code,
      label: node.label,
      description: node.description,
      keywords: node.keywords || [],
      cnaeCodes: node.cnae_codes || [],
    }))

    return { success: true, data: taxonomyNodes }
  } catch (error) {
    console.error('Unexpected error in getTaxonomyChildren:', error)
    return { success: false, error: 'Erro inesperado ao carregar subsetores' }
  }
}
