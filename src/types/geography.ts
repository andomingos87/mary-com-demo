/**
 * Geography Types
 *
 * Types for the hierarchical geography selector (TASK-012)
 * Supports: Continents → Countries → States
 */

// ============================================
// Database Types
// ============================================

export type GeographyType = 'continent' | 'country' | 'state' | 'region'

export interface Geography {
  id: string
  code: string
  type: GeographyType
  parentId: string | null
  nameEn: string
  namePt: string | null
  flagEmoji: string | null
  isoCode: string | null
  sortOrder: number
  isActive: boolean
}

// ============================================
// Hierarchy Types
// ============================================

export interface GeographyNode extends Geography {
  children?: GeographyNode[]
}

export interface GeographyHierarchy {
  continents: GeographyNode[]
  totalNodes: number
  loadedAt: string
}

// ============================================
// Selection Types (for forms)
// ============================================

export interface GeographySelection {
  /** Selected continent codes: ['SOUTH_AMERICA', 'CENTRAL_AMERICA', 'NORTH_AMERICA', 'EUROPE'] */
  continents: string[]
  /** Selected country codes: ['BR', 'AR', 'DE'] */
  countries: string[]
  /** Selected state codes: ['BR-SP', 'BR-RJ'] */
  states: string[]
}

/** Flat list of all selected geography codes */
export type GeographySelectionFlat = string[]

// ============================================
// Component Props Types
// ============================================

export interface GeographySelectorProps {
  value: GeographySelection
  onChange: (selection: GeographySelection) => void
  disabled?: boolean
  className?: string
  /** Show only specific types */
  allowedTypes?: GeographyType[]
  /** Countries that should show state-level selection */
  countriesWithStates?: string[]
}

// ============================================
// API Response Types
// ============================================

export interface GeographyListResponse {
  geographies: Geography[]
  total: number
}

export interface GeographyChildrenResponse {
  parent: Geography | null
  children: Geography[]
}
