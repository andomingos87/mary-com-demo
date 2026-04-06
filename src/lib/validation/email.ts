/**
 * Email Validation Utilities
 *
 * TASK-004: Restrição de Emails Genéricos
 *
 * Bloqueia cadastro com emails de provedores genéricos.
 * Apenas emails corporativos devem ser aceitos.
 */

/**
 * Lista de domínios de email genéricos bloqueados
 *
 * Inclui provedores gratuitos populares no Brasil e internacionalmente.
 * Esta lista pode ser expandida conforme necessário.
 */
export const BLOCKED_EMAIL_DOMAINS = [
  // Gmail / Google
  'gmail.com',
  'googlemail.com',

  // Microsoft
  'hotmail.com',
  'hotmail.com.br',
  'outlook.com',
  'outlook.com.br',
  'live.com',
  'live.com.br',
  'msn.com',
  'msn.com.br',

  // Yahoo
  'yahoo.com',
  'yahoo.com.br',
  'ymail.com',
  'rocketmail.com',

  // Apple
  'icloud.com',
  'me.com',
  'mac.com',

  // Provedores internacionais
  'protonmail.com',
  'proton.me',
  'protonmail.ch',
  'zoho.com',
  'zohomail.com',
  'aol.com',
  'mail.com',
  'email.com',
  'gmx.com',
  'gmx.net',
  'gmx.de',
  'yandex.com',
  'yandex.ru',
  'mail.ru',
  'inbox.com',
  'fastmail.com',
  'tutanota.com',
  'tutanota.de',

  // Provedores brasileiros
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'ig.com.br',
  'globo.com',
  'globomail.com',
  'r7.com',
  'oi.com.br',
  'zipmail.com.br',
  'pop.com.br',

  // Provedores temporários / descartáveis (alguns exemplos)
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'sharklasers.com',
  'trashmail.com',
] as const

/**
 * Mensagem de erro padrão para emails genéricos
 */
export const GENERIC_EMAIL_ERROR_MESSAGE =
  'Por favor, utilize seu email corporativo para cadastro.'

/**
 * Verifica se um email é de um provedor genérico (bloqueado)
 *
 * @param email - Endereço de email a ser verificado
 * @returns true se o email for de um provedor genérico, false caso contrário
 *
 * @example
 * isGenericEmail('user@gmail.com') // true
 * isGenericEmail('user@empresa.com.br') // false
 */
export function isGenericEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const parts = email.toLowerCase().trim().split('@')

  if (parts.length !== 2) {
    return false
  }

  const domain = parts[1]

  return BLOCKED_EMAIL_DOMAINS.includes(domain as typeof BLOCKED_EMAIL_DOMAINS[number])
}

/**
 * Verifica se um email é corporativo (não bloqueado)
 *
 * @param email - Endereço de email a ser verificado
 * @returns true se o email for corporativo, false caso contrário
 *
 * @example
 * isCorporateEmail('user@empresa.com.br') // true
 * isCorporateEmail('user@gmail.com') // false
 */
export function isCorporateEmail(email: string): boolean {
  return !isGenericEmail(email)
}

/**
 * Extrai o domínio de um email
 *
 * @param email - Endereço de email
 * @returns O domínio do email ou null se inválido
 *
 * @example
 * getEmailDomain('user@empresa.com.br') // 'empresa.com.br'
 */
export function getEmailDomain(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null
  }

  const parts = email.toLowerCase().trim().split('@')

  if (parts.length !== 2) {
    return null
  }

  return parts[1]
}

/**
 * Valida o formato básico de um email
 *
 * @param email - Endereço de email a ser validado
 * @returns true se o formato for válido
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // Regex básico para validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}
