/**
 * Tipos de investidor (jornada investidor — pré-cadastro).
 * Valores estáveis para persistência em signup_prefill / onboarding.
 */
export const INVESTOR_TYPE_OPTIONS = [
  { value: 'private_equity', label: 'Private Equity' },
  { value: 'venture_capital', label: 'Venture Capital' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'corporate_strategic', label: 'Corporate (Strategic)' },
  { value: 'angel', label: 'Angel' },
  { value: 'cvc', label: 'Corporate Venture Capital' },
  { value: 'venture_builder', label: 'Venture Builder' },
  { value: 'search_fund', label: 'Search Fund' },
  { value: 'accelerator', label: 'Aceleradora' },
  { value: 'incubator', label: 'Incubadora' },
  { value: 'sovereign_fund', label: 'Sovereign Fund' },
  { value: 'pension_fund', label: 'Pension Fund' },
  { value: 'other', label: 'Outro' },
] as const
