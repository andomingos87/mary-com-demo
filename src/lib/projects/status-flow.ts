import type { ProjectStatus } from '@/types/database'

export const PIPELINE_PHASE_ORDER: ProjectStatus[] = [
  'screening',
  'teaser',
  'nda',
  'cim_dfs',
  'ioi',
  'management_meetings',
  'nbo',
  'dd_spa',
  'signing',
  'cps',
  'closing',
  'disclosure',
]

export const PIPELINE_EXIT_STATUSES: ProjectStatus[] = ['closed_won', 'closed_lost']

export const ALLOWED_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  screening: ['teaser', 'closed_lost'],
  teaser: ['nda', 'closed_lost'],
  nda: ['cim_dfs', 'closed_lost'],
  cim_dfs: ['ioi', 'closed_lost'],
  ioi: ['management_meetings', 'closed_lost'],
  management_meetings: ['nbo', 'closed_lost'],
  nbo: ['dd_spa', 'closed_lost'],
  dd_spa: ['signing', 'closed_lost'],
  signing: ['cps', 'closed_lost'],
  cps: ['closing', 'closed_lost'],
  closing: ['disclosure', 'closed_won', 'closed_lost'],
  disclosure: ['closed_won', 'closed_lost'],
  closed_won: [],
  closed_lost: [],
}

export function canTransitionProjectStatus(from: ProjectStatus, to: ProjectStatus): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

export function isTerminalProjectStatus(status: ProjectStatus): boolean {
  return PIPELINE_EXIT_STATUSES.includes(status)
}

export function isRollbackTransition(_from: ProjectStatus, _to: ProjectStatus): boolean {
  return false
}
