/**
 * Logo API Client
 * Obtém logos de empresas baseado no domínio
 * Usa múltiplas fontes com fallback automático
 */

import {
  ClearbitLogoResult,
  EnrichmentResult,
  API_TIMEOUTS,
} from './types'
import { extractDomain } from './jina-reader'

// APIs de logo disponíveis (em ordem de preferência)
const LOGO_APIS = {
  // DuckDuckGo Icons API - gratuita e confiável
  DUCKDUCKGO: (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  // Google Favicon Service - sempre retorna algo
  GOOGLE: (domain: string, size: number = 128) => `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`,
  // Favicon direto do site
  DIRECT: (domain: string) => `https://${domain}/favicon.ico`,
}

/**
 * Gera URL do logo via DuckDuckGo (principal)
 */
export function getLogoUrl(domain: string, size: number = 128): string {
  const cleanDomain = extractDomain(domain)
  // DuckDuckGo não suporta size, mas retorna ícones de boa qualidade
  return LOGO_APIS.DUCKDUCKGO(cleanDomain)
}

/**
 * Verifica se o logo existe em uma URL
 */
async function checkUrlExists(url: string, timeout: number): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Verifica se o logo existe (tenta múltiplas fontes)
 */
export async function checkLogoExists(
  domain: string
): Promise<EnrichmentResult<ClearbitLogoResult>> {
  const startTime = Date.now()
  const cleanDomain = extractDomain(domain)

  if (!cleanDomain) {
    return {
      status: 'error',
      data: null,
      error: 'Domínio inválido',
      duration: Date.now() - startTime,
    }
  }

  // Tenta DuckDuckGo primeiro
  const duckduckgoUrl = LOGO_APIS.DUCKDUCKGO(cleanDomain)
  const duckduckgoExists = await checkUrlExists(duckduckgoUrl, API_TIMEOUTS.CLEARBIT)

  if (duckduckgoExists) {
    return {
      status: 'success',
      data: {
        domain: cleanDomain,
        logoUrl: duckduckgoUrl,
        exists: true,
        fetchedAt: new Date().toISOString(),
        source: 'clearbit', // Mantém source para compatibilidade
      },
      duration: Date.now() - startTime,
    }
  }

  // Fallback: favicon direto
  const directUrl = LOGO_APIS.DIRECT(cleanDomain)
  const directExists = await checkUrlExists(directUrl, API_TIMEOUTS.CLEARBIT)

  if (directExists) {
    return {
      status: 'success',
      data: {
        domain: cleanDomain,
        logoUrl: directUrl,
        exists: true,
        fetchedAt: new Date().toISOString(),
        source: 'clearbit',
      },
      duration: Date.now() - startTime,
    }
  }

  // Último fallback: Google (sempre retorna algo)
  return {
    status: 'success',
    data: {
      domain: cleanDomain,
      logoUrl: LOGO_APIS.GOOGLE(cleanDomain, 128),
      exists: true,
      fetchedAt: new Date().toISOString(),
      source: 'clearbit',
    },
    duration: Date.now() - startTime,
  }
}

/**
 * Busca logo com fallback automático
 */
export async function fetchLogo(
  domain: string
): Promise<EnrichmentResult<ClearbitLogoResult>> {
  return checkLogoExists(domain)
}

/**
 * Gera URL de placeholder para quando não há logo
 */
export function getPlaceholderLogoUrl(name: string): string {
  // Usa UI Avatars para gerar um placeholder com as iniciais
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6F1822&color=fff&size=128&bold=true`
}
