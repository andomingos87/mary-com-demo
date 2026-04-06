/**
 * Checklists de Readiness por Objetivo
 *
 * Define os campos obrigatórios e pesos para cada tipo de projeto.
 * Os pesos somam 100 para cada objetivo.
 */

import type { ProjectObjective } from '@/types/database'
import type { ReadinessChecklistItem } from '@/types/projects'

// ============================================
// Checklist: Venda (Sale)
// ============================================

const SALE_CHECKLIST: ReadinessChecklistItem[] = [
  // Dados Básicos (20%)
  {
    field: 'codename',
    label: 'Codename do Projeto',
    weight: 5,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Nome interno único para identificação',
  },
  {
    field: 'objective',
    label: 'Objetivo',
    weight: 5,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Tipo de transação desejada',
  },
  {
    field: 'description',
    label: 'Descrição do Projeto',
    weight: 10,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Resumo do negócio e proposta de valor',
  },

  // Taxonomia (15%)
  {
    field: 'sector_l1',
    label: 'Setor (MAICS L1)',
    weight: 10,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Macrosetor principal da empresa',
  },
  {
    field: 'sector_l2',
    label: 'Subsetor (MAICS L2)',
    weight: 5,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Subsetor específico',
  },

  // Financeiro (50%) - Requer validação L2
  {
    field: 'value_min_usd',
    label: 'Valor Alvo (USD)',
    weight: 20,
    requiredLevel: 2,
    isComplete: false,
    hint: 'Valor esperado da transação em USD',
  },
  {
    field: 'ebitda_annual_usd',
    label: 'EBITDA Anual (USD)',
    weight: 15,
    requiredLevel: 2,
    isComplete: false,
    hint: 'EBITDA do último exercício em USD',
  },
  {
    field: 'revenue_annual_usd',
    label: 'Receita Anual (USD)',
    weight: 15,
    requiredLevel: 2,
    isComplete: false,
    hint: 'Receita do último exercício em USD',
  },

  // Documentação (15%) - Preparar para futuras fases
  // Estes campos serão adicionados em fases posteriores (VDR, Teaser)
]

// ============================================
// Checklist: Captação (Fundraising)
// ============================================

const FUNDRAISING_CHECKLIST: ReadinessChecklistItem[] = [
  // Dados Básicos (25%)
  {
    field: 'codename',
    label: 'Codename do Projeto',
    weight: 5,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Nome interno único para identificação',
  },
  {
    field: 'objective',
    label: 'Objetivo',
    weight: 5,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Tipo de transação desejada',
  },
  {
    field: 'description',
    label: 'Descrição do Projeto',
    weight: 15,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Resumo do negócio e proposta de valor',
  },

  // Taxonomia (15%)
  {
    field: 'sector_l1',
    label: 'Setor (MAICS L1)',
    weight: 10,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Macrosetor principal da empresa',
  },
  {
    field: 'sector_l2',
    label: 'Subsetor (MAICS L2)',
    weight: 5,
    requiredLevel: 1,
    isComplete: false,
    hint: 'Subsetor específico',
  },

  // Financeiro (45%) - Requer validação L2
  {
    field: 'value_min_usd',
    label: 'Valor do Round (USD)',
    weight: 20,
    requiredLevel: 2,
    isComplete: false,
    hint: 'Valor alvo de captação em USD',
  },
  {
    field: 'revenue_annual_usd',
    label: 'Receita Anual (USD)',
    weight: 15,
    requiredLevel: 2,
    isComplete: false,
    hint: 'ARR ou MRR*12 em USD',
  },
  {
    field: 'ebitda_annual_usd',
    label: 'EBITDA/Burn Rate (USD)',
    weight: 10,
    requiredLevel: 2,
    isComplete: false,
    hint: 'EBITDA ou burn rate mensal em USD',
  },

  // Preparação (15%)
  // Campos futuros: pitch_deck, data_room, term_sheet
]

// ============================================
// Exported Checklist Map
// ============================================

/**
 * Mapa de checklists por objetivo
 * Cada checklist tem pesos que somam ~100 (campos disponíveis)
 */
export const READINESS_CHECKLISTS: Record<ProjectObjective, ReadinessChecklistItem[]> = {
  sale: SALE_CHECKLIST,
  fundraising: FUNDRAISING_CHECKLIST,
}

// ============================================
// Helper Functions
// ============================================

/**
 * Retorna o checklist para um objetivo específico
 * Retorna cópia para evitar mutação
 */
export function getChecklistByObjective(
  objective: ProjectObjective
): ReadinessChecklistItem[] {
  const checklist = READINESS_CHECKLISTS[objective]
  if (!checklist) {
    return []
  }
  // Retorna cópia profunda
  return checklist.map(item => ({ ...item }))
}

/**
 * Retorna apenas campos que requerem validação L2+
 */
export function getCriticalFields(objective: ProjectObjective): string[] {
  const checklist = READINESS_CHECKLISTS[objective]
  if (!checklist) return []
  return checklist
    .filter(item => item.requiredLevel >= 2)
    .map(item => item.field)
}

/**
 * Calcula o peso total dos campos L2+
 */
export function getL2PlusWeight(objective: ProjectObjective): number {
  const checklist = READINESS_CHECKLISTS[objective]
  if (!checklist) return 0
  return checklist
    .filter(item => item.requiredLevel >= 2)
    .reduce((sum, item) => sum + item.weight, 0)
}

/**
 * Retorna campos obrigatórios para criação mínima
 * (apenas campos L1 required)
 */
export function getRequiredFields(objective: ProjectObjective): string[] {
  const checklist = READINESS_CHECKLISTS[objective]
  if (!checklist) return []
  return checklist
    .filter(item => item.requiredLevel === 1)
    .map(item => item.field)
}
