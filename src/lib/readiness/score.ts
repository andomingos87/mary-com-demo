/**
 * Motor de Cálculo de Readiness Score
 *
 * Calcula score baseado em:
 * - Completude dos campos (tem valor ou não)
 * - Nível de validação L1/L2/L3 de cada campo
 * - Pesos definidos no checklist por objetivo
 */

import { createHash } from 'crypto'
import type { Project } from '@/types/database'
import type {
  ReadinessChecklistItem,
  ReadinessResult,
  FieldMetadata,
  FieldMetadataLevel,
  ProjectFieldMetadata,
} from '@/types/projects'
import { getChecklistByObjective, getCriticalFields } from './checklist'

// ============================================
// Score Calculation
// ============================================

/**
 * Calcula o Readiness Score de um projeto
 */
export function calculateScore(
  project: Project,
  checklist?: ReadinessChecklistItem[]
): ReadinessResult {
  // Obtém checklist do objetivo se não fornecido
  const items = checklist || getChecklistByObjective(project.objective)
  if (!items || items.length === 0) {
    return {
      score: 0,
      completedItems: 0,
      totalItems: 0,
      l2PlusCoverage: 0,
      checklist: [],
      isMatchingReady: false,
      calculatedAt: new Date().toISOString(),
    }
  }

  // Parse field_metadata do projeto
  const fieldMetadata = parseFieldMetadata(project.field_metadata)

  // Avalia cada item do checklist
  let totalWeight = 0
  let earnedWeight = 0
  let completedItems = 0
  let l2PlusFields = 0
  let l2PlusComplete = 0

  const evaluatedChecklist = items.map(item => {
    const value = getProjectFieldValue(project, item.field)
    const metadata = fieldMetadata[item.field]
    const currentLevel = getFieldLevel(metadata)
    const hasValue = value !== null && value !== undefined && value !== ''
    const meetsLevelRequirement = currentLevel >= item.requiredLevel
    const isComplete = hasValue && meetsLevelRequirement

    totalWeight += item.weight

    if (isComplete) {
      earnedWeight += item.weight
      completedItems++
    } else if (hasValue && !meetsLevelRequirement) {
      // Tem valor mas não tem validação suficiente
      // Dá crédito parcial (50% do peso)
      earnedWeight += item.weight * 0.5
    }

    // Rastreia cobertura L2+
    if (item.requiredLevel >= 2) {
      l2PlusFields++
      if (currentLevel >= 2) {
        l2PlusComplete++
      }
    }

    return {
      ...item,
      currentLevel,
      isComplete,
    }
  })

  // Calcula score (0-100)
  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0

  // Calcula cobertura L2+
  const l2PlusCoverage = l2PlusFields > 0
    ? Math.round((l2PlusComplete / l2PlusFields) * 100)
    : 100 // Se não há campos L2+, considera 100%

  return {
    score,
    completedItems,
    totalItems: items.length,
    l2PlusCoverage,
    checklist: evaluatedChecklist,
    isMatchingReady: l2PlusCoverage >= 70,
    calculatedAt: new Date().toISOString(),
  }
}

/**
 * Calcula a cobertura L2+ de campos críticos
 */
export function calculateL2PlusCoverage(
  fieldMetadata: ProjectFieldMetadata,
  criticalFields: string[]
): number {
  if (!criticalFields || criticalFields.length === 0) return 100

  let l2PlusCount = 0
  for (const field of criticalFields) {
    const metadata = fieldMetadata[field]
    if (getFieldLevel(metadata) >= 2) {
      l2PlusCount++
    }
  }

  return Math.round((l2PlusCount / criticalFields.length) * 100)
}

// ============================================
// Field Level Helpers
// ============================================

/**
 * Obtém o nível de validação mais alto de um campo
 * 0 = sem dados, 1 = submetido, 2 = validado, 3 = auditado
 */
export function getFieldLevel(metadata?: FieldMetadata): 0 | 1 | 2 | 3 {
  if (!metadata) return 0
  if (metadata.l3) return 3
  if (metadata.l2) return 2
  if (metadata.l1) return 1
  return 0
}

/**
 * Parse field_metadata do formato JSONB
 */
export function parseFieldMetadata(
  raw: unknown
): ProjectFieldMetadata {
  if (!raw || typeof raw !== 'object') return {}
  return raw as ProjectFieldMetadata
}

/**
 * Obtém valor de um campo do projeto
 */
function getProjectFieldValue(project: Project, field: string): unknown {
  // Mapeia nomes de campos para propriedades do projeto
  const fieldMap: Record<string, keyof Project> = {
    codename: 'codename',
    objective: 'objective',
    description: 'description',
    sector_l1: 'sector_l1',
    sector_l2: 'sector_l2',
    sector_l3: 'sector_l3',
    value_min_usd: 'value_min_usd' as keyof Project,
    ebitda_annual_usd: 'ebitda_annual_usd',
    revenue_annual_usd: 'revenue_annual_usd',
  }

  const key = fieldMap[field]
  if (!key) return null

  return project[key]
}

// ============================================
// Field Metadata Management
// ============================================

/**
 * Gera hash SHA-256 de um valor
 * Usado para rastreabilidade L1/L2/L3
 */
export function generateHash(value: unknown): string {
  const stringValue = typeof value === 'string'
    ? value
    : JSON.stringify(value)

  return createHash('sha256')
    .update(stringValue)
    .digest('hex')
}

/**
 * Aplica metadados de nível a um campo
 * Retorna o objeto field_metadata atualizado
 */
export function applyFieldMetadata(
  currentMetadata: ProjectFieldMetadata,
  field: string,
  level: 1 | 2 | 3,
  userId: string,
  value: unknown,
  options?: {
    source?: 'manual' | 'enrichment' | 'import' | 'ai_generated'
    notes?: string
  }
): ProjectFieldMetadata {
  const timestamp = new Date().toISOString()
  const hash = generateHash(value)

  const levelData: FieldMetadataLevel = {
    userId,
    timestamp,
    hash,
    source: level === 1 ? (options?.source || 'manual') : undefined,
    notes: options?.notes,
  }

  const existingFieldMeta = currentMetadata[field] || {}
  const updatedFieldMeta: FieldMetadata = { ...existingFieldMeta }

  // Aplica o nível apropriado
  if (level === 1) {
    updatedFieldMeta.l1 = levelData
  } else if (level === 2) {
    // L2 requer que L1 exista
    if (!updatedFieldMeta.l1) {
      throw new Error(`Cannot apply L2 validation without L1 for field: ${field}`)
    }
    updatedFieldMeta.l2 = levelData
  } else if (level === 3) {
    // L3 requer que L2 exista
    if (!updatedFieldMeta.l2) {
      throw new Error(`Cannot apply L3 audit without L2 for field: ${field}`)
    }
    updatedFieldMeta.l3 = levelData
  }

  return {
    ...currentMetadata,
    [field]: updatedFieldMeta,
  }
}

/**
 * Aplica metadados L1 para múltiplos campos (bulk)
 * Útil ao criar/atualizar projeto
 */
export function applyBulkL1Metadata(
  currentMetadata: ProjectFieldMetadata,
  fields: Record<string, unknown>,
  userId: string,
  source: 'manual' | 'enrichment' | 'import' | 'ai_generated' = 'manual'
): ProjectFieldMetadata {
  let updated = { ...currentMetadata }

  for (const [field, value] of Object.entries(fields)) {
    // Só aplica se o campo tem valor
    if (value !== null && value !== undefined && value !== '') {
      updated = applyFieldMetadata(updated, field, 1, userId, value, { source })
    }
  }

  return updated
}

/**
 * Verifica se o hash atual corresponde ao hash armazenado
 * Útil para detectar alterações não rastreadas
 */
export function verifyFieldHash(
  metadata: FieldMetadata | undefined,
  currentValue: unknown
): { valid: boolean; level: 0 | 1 | 2 | 3 } {
  if (!metadata) {
    return { valid: false, level: 0 }
  }

  const currentHash = generateHash(currentValue)
  const level = getFieldLevel(metadata)

  // Verifica hash do nível mais alto
  let storedHash: string | undefined
  if (metadata.l3) storedHash = metadata.l3.hash
  else if (metadata.l2) storedHash = metadata.l2.hash
  else if (metadata.l1) storedHash = metadata.l1.hash

  return {
    valid: storedHash === currentHash,
    level,
  }
}
