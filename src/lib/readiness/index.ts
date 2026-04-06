/**
 * Readiness Score
 * Exports públicos do módulo de readiness
 */

export {
  calculateScore,
  calculateL2PlusCoverage,
  getFieldLevel,
  parseFieldMetadata,
  generateHash,
  applyFieldMetadata,
  applyBulkL1Metadata,
  verifyFieldHash,
} from './score'

export {
  READINESS_CHECKLISTS,
  getChecklistByObjective,
  getCriticalFields,
  getL2PlusWeight,
  getRequiredFields,
} from './checklist'

export {
  calculateVdrContribution,
  computeIsMatchingReady,
  type VdrDocValidation,
  type VdrContributionResult,
} from './vdr-contribution'

export {
  createDefaultMrsSteps,
  calculateMrsScore,
  calculateMrsGates,
  createMrsReadinessData,
  resolveMrsReadinessData,
  updateMrsItem,
  addMrsItemFile,
} from './mrs'
