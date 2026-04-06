/**
 * Currency Formatting Utilities
 * TASK-006: Pontuação automática em campos monetários
 * TASK-025: Formatação USD para campo EBITDA
 *
 * Provides formatting functions for displaying monetary values with
 * thousand separators while maintaining numeric values for backend storage.
 */

export type CurrencyCode = 'BRL' | 'USD'
export const USD_CURRENCY_INPUT_REGEX = /^[0-9,]*$/

/**
 * Formats a number for display with thousand separators (pt-BR format)
 * Ex: 50000000 → "50.000.000"
 *
 * @param value - The numeric value to format
 * @returns Formatted string with thousand separators
 */
export function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return ''

  const numValue = typeof value === 'string'
    ? parseFloat(value.replace(/\D/g, ''))
    : value

  if (isNaN(numValue)) return ''

  return numValue.toLocaleString('pt-BR')
}

/**
 * Parses a formatted currency string back to a number
 * Ex: "50.000.000" → 50000000
 *
 * @param value - The formatted string to parse
 * @returns The numeric value, or undefined if invalid
 */
export function parseCurrency(value: string | undefined | null): number | undefined {
  if (!value) return undefined
  const cleaned = value.replace(/\D/g, '')
  if (!cleaned) return undefined
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? undefined : num
}

/**
 * Handler for currency input changes
 * Updates the numeric value while returning the formatted display string
 *
 * @param inputValue - The raw input value from the onChange event
 * @param onChange - Callback to update the numeric value in state
 * @returns The formatted display string
 */
export function handleCurrencyChange(
  inputValue: string,
  onChange: (value: number | undefined) => void
): string {
  const rawValue = inputValue.replace(/\D/g, '')
  const numValue = rawValue ? parseInt(rawValue, 10) : undefined
  onChange(numValue)
  return numValue !== undefined ? formatCurrency(numValue) : ''
}

/**
 * Hook-like helper to manage currency input state
 * Returns display value and change handler
 */
export function createCurrencyHandler(
  initialValue: number | undefined,
  onChange: (value: number | undefined) => void
) {
  let displayValue = formatCurrency(initialValue)

  const handleChange = (inputValue: string) => {
    displayValue = handleCurrencyChange(inputValue, onChange)
    return displayValue
  }

  return {
    getDisplayValue: () => displayValue,
    handleChange,
  }
}

// ============================================
// USD Formatting (TASK-025)
// ============================================

/**
 * Formats a number for display with USD format (en-US with comma separators)
 * Ex: 50000000 → "50,000,000"
 *
 * @param value - The numeric value to format
 * @returns Formatted string with thousand separators (US format)
 */
export function formatCurrencyUSD(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return ''

  const numValue = typeof value === 'string'
    ? parseFloat(value.replace(/\D/g, ''))
    : value

  if (isNaN(numValue)) return ''

  return numValue.toLocaleString('en-US')
}

/**
 * Formats a number with currency symbol prefix
 * Ex: formatWithSymbol(50000000, 'USD') → "USD 50,000,000"
 * Ex: formatWithSymbol(50000000, 'BRL') → "R$ 50.000.000"
 *
 * @param value - The numeric value to format
 * @param currency - The currency code (BRL or USD)
 * @returns Formatted string with currency symbol
 */
export function formatWithSymbol(
  value: number | string | undefined | null,
  currency: CurrencyCode = 'BRL'
): string {
  if (value === undefined || value === null || value === '') return ''

  const numValue = typeof value === 'string'
    ? parseFloat(value.replace(/\D/g, ''))
    : value

  if (isNaN(numValue)) return ''

  if (currency === 'USD') {
    return `USD ${numValue.toLocaleString('en-US')}`
  }

  return `R$ ${numValue.toLocaleString('pt-BR')}`
}

/**
 * Handler for USD currency input changes
 * Updates the numeric value while returning the formatted display string
 *
 * @param inputValue - The raw input value from the onChange event
 * @param onChange - Callback to update the numeric value in state
 * @returns The formatted display string (US format)
 */
export function handleCurrencyChangeUSD(
  inputValue: string,
  onChange: (value: number | undefined) => void
): string {
  const sanitizedInput = USD_CURRENCY_INPUT_REGEX.test(inputValue)
    ? inputValue
    : inputValue.replace(/[^0-9,]/g, '')
  const rawValue = sanitizedInput.replace(/\D/g, '')
  const numValue = rawValue ? parseInt(rawValue, 10) : undefined
  onChange(numValue)
  return numValue !== undefined ? formatCurrencyUSD(numValue) : ''
}
