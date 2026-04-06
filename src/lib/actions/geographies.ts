'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  Geography,
  GeographyType,
  GeographyNode,
  GeographyHierarchy,
} from '@/types/geography'
import type { ActionResult } from './organizations'

// ============================================
// Helper: Map DB row to Geography type
// ============================================

function mapToGeography(row: Record<string, unknown>): Geography {
  return {
    id: row.id as string,
    code: row.code as string,
    type: row.type as GeographyType,
    parentId: row.parent_id as string | null,
    nameEn: row.name_en as string,
    namePt: row.name_pt as string | null,
    flagEmoji: row.flag_emoji as string | null,
    isoCode: row.iso_code as string | null,
    sortOrder: (row.sort_order as number) ?? 0,
    isActive: row.is_active as boolean,
  }
}

// ============================================
// Helper: Build hierarchy tree from flat list
// ============================================

function buildGeographyTree(geographies: Geography[]): GeographyNode[] {
  const nodeMap = new Map<string, GeographyNode>()
  const roots: GeographyNode[] = []

  // Create nodes
  for (const geo of geographies) {
    nodeMap.set(geo.id, { ...geo, children: [] })
  }

  // Build tree
  for (const geo of geographies) {
    const node = nodeMap.get(geo.id)!
    if (geo.parentId) {
      const parent = nodeMap.get(geo.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  // Sort children by sort_order
  const sortChildren = (nodes: GeographyNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder)
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children)
      }
    }
  }

  sortChildren(roots)
  return roots
}

// ============================================
// Get All Geographies (Flat List)
// ============================================

/**
 * Fetches all active geographies as a flat list
 * Cache-friendly - data doesn't change frequently
 */
export async function getGeographies(): Promise<ActionResult<Geography[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('geographies')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Error fetching geographies:', error)
      return { success: false, error: 'Erro ao carregar geografias' }
    }

    const geographies = (data || []).map(mapToGeography)
    return { success: true, data: geographies }
  } catch (error) {
    console.error('Unexpected error in getGeographies:', error)
    return { success: false, error: 'Erro inesperado ao carregar geografias' }
  }
}

// ============================================
// Get Geographies by Type
// ============================================

/**
 * Fetches geographies filtered by type
 * @param type - 'continent', 'country', 'state', or 'region'
 */
export async function getGeographiesByType(
  type: GeographyType
): Promise<ActionResult<Geography[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('geographies')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Error fetching geographies by type:', error)
      return { success: false, error: 'Erro ao carregar geografias' }
    }

    const geographies = (data || []).map(mapToGeography)
    return { success: true, data: geographies }
  } catch (error) {
    console.error('Unexpected error in getGeographiesByType:', error)
    return { success: false, error: 'Erro inesperado ao carregar geografias' }
  }
}

// ============================================
// Get Children of a Geography
// ============================================

/**
 * Fetches direct children of a geography by parent code
 * @param parentCode - Code of the parent geography (e.g., 'BR', 'AMERICAS')
 */
export async function getGeographyChildren(
  parentCode: string
): Promise<ActionResult<Geography[]>> {
  try {
    if (!parentCode) {
      return { success: false, error: 'Código do pai obrigatório' }
    }

    const supabase = await createClient()

    // First get the parent ID
    const { data: parent, error: parentError } = await supabase
      .from('geographies')
      .select('id')
      .eq('code', parentCode)
      .eq('is_active', true)
      .single()

    if (parentError || !parent) {
      if (parentError?.code === 'PGRST116') {
        return { success: false, error: 'Geografia pai não encontrada' }
      }
      console.error('Error fetching parent geography:', parentError)
      return { success: false, error: 'Erro ao buscar geografia pai' }
    }

    // Then get children
    const { data, error } = await supabase
      .from('geographies')
      .select('*')
      .eq('parent_id', parent.id)
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Error fetching geography children:', error)
      return { success: false, error: 'Erro ao carregar sub-regiões' }
    }

    const geographies = (data || []).map(mapToGeography)
    return { success: true, data: geographies }
  } catch (error) {
    console.error('Unexpected error in getGeographyChildren:', error)
    return { success: false, error: 'Erro inesperado ao carregar sub-regiões' }
  }
}

// ============================================
// Get Full Hierarchy
// ============================================

/**
 * Returns the complete geography hierarchy as a tree
 * Continents → Countries → States
 */
export async function getGeographyHierarchy(): Promise<
  ActionResult<GeographyHierarchy>
> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('geographies')
      .select('*')
      .eq('is_active', true)
      .order('type')
      .order('sort_order')

    if (error) {
      console.error('Error fetching geography hierarchy:', error)
      return { success: false, error: 'Erro ao carregar hierarquia' }
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        data: {
          continents: [],
          totalNodes: 0,
          loadedAt: new Date().toISOString(),
        },
      }
    }

    const geographies = data.map(mapToGeography)
    const tree = buildGeographyTree(geographies)

    // Filter to only top-level continents
    const continents = tree.filter((node) => node.type === 'continent')

    return {
      success: true,
      data: {
        continents,
        totalNodes: geographies.length,
        loadedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('Unexpected error in getGeographyHierarchy:', error)
    return { success: false, error: 'Erro inesperado ao carregar hierarquia' }
  }
}

// ============================================
// Get Geography by Code
// ============================================

/**
 * Fetches a single geography by its code
 * @param code - Geography code (e.g., 'BR', 'BR-SP', 'AMERICAS')
 */
export async function getGeographyByCode(
  code: string
): Promise<ActionResult<Geography>> {
  try {
    if (!code) {
      return { success: false, error: 'Código obrigatório' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('geographies')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        return { success: false, error: 'Geografia não encontrada' }
      }
      console.error('Error fetching geography:', error)
      return { success: false, error: 'Erro ao buscar geografia' }
    }

    return { success: true, data: mapToGeography(data) }
  } catch (error) {
    console.error('Unexpected error in getGeographyByCode:', error)
    return { success: false, error: 'Erro inesperado ao buscar geografia' }
  }
}

// ============================================
// Get Continents (Convenience)
// ============================================

/**
 * Fetches only continents (top-level geographies)
 * Useful for initial dropdown population
 */
export async function getContinents(): Promise<ActionResult<Geography[]>> {
  return getGeographiesByType('continent')
}

// ============================================
// Get Countries (Convenience)
// ============================================

/**
 * Fetches all countries, optionally filtered by continent
 * @param continentCode - Optional continent code to filter by
 */
export async function getCountries(
  continentCode?: string
): Promise<ActionResult<Geography[]>> {
  if (continentCode) {
    return getGeographyChildren(continentCode)
  }
  return getGeographiesByType('country')
}

// ============================================
// Get States (Convenience)
// ============================================

/**
 * Fetches states for a specific country
 * @param countryCode - Country code (e.g., 'BR')
 */
export async function getStates(
  countryCode: string
): Promise<ActionResult<Geography[]>> {
  return getGeographyChildren(countryCode)
}

// ============================================
// Check if Country Has States
// ============================================

/**
 * Checks if a country has state-level subdivisions
 * @param countryCode - Country code (e.g., 'BR')
 */
export async function countryHasStates(
  countryCode: string
): Promise<ActionResult<boolean>> {
  try {
    if (!countryCode) {
      return { success: false, error: 'Código do país obrigatório' }
    }

    const result = await getGeographyChildren(countryCode)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    const hasStates =
      result.data !== undefined &&
      result.data.length > 0 &&
      result.data.some((g) => g.type === 'state')

    return { success: true, data: hasStates }
  } catch (error) {
    console.error('Unexpected error in countryHasStates:', error)
    return { success: false, error: 'Erro ao verificar estados' }
  }
}
