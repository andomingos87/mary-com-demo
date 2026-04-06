export interface InvestmentStageOption {
  value: string
  label: string
}

export const INVESTMENT_STAGE_OPTIONS: InvestmentStageOption[] = [
  { value: 'pre_seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'series_c_plus', label: 'Series C+' },
  { value: 'growth', label: 'Growth' },
  { value: 'late_stage', label: 'Late Stage' },
  { value: 'profitable_mature', label: 'Lucrativa / Mature' },
  { value: 'consolidated', label: 'Consolidada' },
]
