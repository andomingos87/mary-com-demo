/**
 * Jina.ai Reader Client
 * Extrai conteúdo de websites em formato Markdown
 * 
 * @see https://jina.ai/reader/
 */

import {
  EnrichedWebsiteData,
  EnrichmentResult,
  EnrichmentError,
  API_TIMEOUTS,
  API_URLS,
} from './types'

/**
 * Normaliza URL para formato válido
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim()
  
  // Adiciona protocolo se não existir
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`
  }
  
  // Remove trailing slash
  normalized = normalized.replace(/\/+$/, '')
  
  return normalized
}

/**
 * Extrai domínio de uma URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(normalizeUrl(url))
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * Valida se é uma URL válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(normalizeUrl(url))
    return true
  } catch {
    return false
  }
}

/**
 * Faz scraping de um website via Jina Reader
 */
export async function scrapeWebsite(
  url: string
): Promise<EnrichmentResult<EnrichedWebsiteData>> {
  const startTime = Date.now()
  const normalizedUrl = normalizeUrl(url)

  // Validação
  if (!isValidUrl(normalizedUrl)) {
    return {
      status: 'error',
      data: null,
      error: 'URL inválida',
      duration: Date.now() - startTime,
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.JINA_READER)

    // Jina Reader: basta prefixar a URL com r.jina.ai/
    const response = await fetch(
      `${API_URLS.JINA_READER}/${normalizedUrl}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'text/markdown',
          'X-Return-Format': 'markdown',
        },
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        return {
          status: 'not_found',
          data: null,
          error: 'Website não encontrado ou inacessível',
          duration: Date.now() - startTime,
        }
      }

      throw new EnrichmentError(
        `Jina Reader retornou status ${response.status}`,
        'jina_reader',
        response.status
      )
    }

    const markdownContent = await response.text()
    
    // Extrai título do markdown (primeira linha com #)
    const titleMatch = markdownContent.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : null

    // Extrai uma descrição curta (primeiros parágrafos)
    const extractedDescription = extractDescription(markdownContent)

    const enrichedData: EnrichedWebsiteData = {
      url: normalizedUrl,
      title,
      markdownContent,
      extractedDescription,
      fetchedAt: new Date().toISOString(),
      source: 'jina_reader',
    }

    return {
      status: 'success',
      data: enrichedData,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'timeout',
        data: null,
        error: 'Timeout ao acessar website via Jina Reader',
        duration: Date.now() - startTime,
      }
    }

    if (error instanceof EnrichmentError) {
      return {
        status: 'error',
        data: null,
        error: error.message,
        duration: Date.now() - startTime,
      }
    }

    return {
      status: 'error',
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Extrai descrição curta do conteúdo markdown
 * Pega os primeiros parágrafos até ~500 caracteres
 */
function extractDescription(markdown: string): string | null {
  // Remove headers, links, imagens e formatação
  const cleaned = markdown
    .replace(/^#+\s+.+$/gm, '') // Remove headers
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove imagens
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Converte links para texto
    .replace(/[*_`~]/g, '') // Remove formatação
    .replace(/\n{3,}/g, '\n\n') // Normaliza quebras de linha
    .trim()

  // Pega os primeiros parágrafos
  const paragraphs = cleaned.split(/\n\n+/)
  let description = ''
  
  for (const para of paragraphs) {
    const trimmed = para.trim()
    if (trimmed.length < 20) continue // Ignora parágrafos muito curtos
    
    if (description.length + trimmed.length > 500) {
      if (description.length === 0) {
        description = trimmed.substring(0, 500) + '...'
      }
      break
    }
    
    description += (description ? ' ' : '') + trimmed
  }

  return description || null
}

/**
 * Limpa e trunca conteúdo para uso com IA
 * Remove excesso de formatação e limita tamanho
 */
export function prepareContentForAI(
  markdown: string,
  maxLength: number = 2000
): string {
  // Remove elementos que não agregam para descrição
  const cleaned = markdown
    .replace(/^#+\s+/gm, '') // Remove marcadores de header mas mantém texto
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove imagens
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Converte links para texto
    .replace(/```[\s\S]*?```/g, '') // Remove blocos de código
    .replace(/`[^`]+`/g, '') // Remove código inline
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove bold/italic
    .replace(/\|.*\|/g, '') // Remove tabelas
    .replace(/-{3,}/g, '') // Remove separadores
    .replace(/\n{3,}/g, '\n\n') // Normaliza quebras
    .trim()

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  // Trunca no último espaço antes do limite
  const truncated = cleaned.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...'
}
