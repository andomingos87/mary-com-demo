/**
 * ViaCEP Client
 * Consulta dados de endereço por CEP
 * 
 * @see https://viacep.com.br/
 */

import {
  ViaCepResponse,
  EnrichedCepData,
  EnrichmentResult,
  EnrichmentError,
  API_TIMEOUTS,
  API_URLS,
} from './types'

/**
 * Remove caracteres não numéricos do CEP
 */
export function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '')
}

/**
 * Formata CEP para exibição (XXXXX-XXX)
 */
export function formatCep(cep: string): string {
  const clean = cleanCep(cep)
  if (clean.length !== 8) return cep
  return clean.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

/**
 * Valida formato do CEP (8 dígitos)
 */
export function isValidCepFormat(cep: string): boolean {
  const clean = cleanCep(cep)
  return clean.length === 8 && /^\d+$/.test(clean)
}

/**
 * Busca dados de CEP na ViaCEP
 */
export async function fetchCepData(
  cep: string
): Promise<EnrichmentResult<EnrichedCepData>> {
  const startTime = Date.now()
  const cleanedCep = cleanCep(cep)

  // Validação básica
  if (!isValidCepFormat(cleanedCep)) {
    return {
      status: 'error',
      data: null,
      error: 'CEP inválido: deve conter 8 dígitos numéricos',
      duration: Date.now() - startTime,
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.VIACEP)

    const response = await fetch(
      `${API_URLS.VIACEP}/${cleanedCep}/json/`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new EnrichmentError(
        `ViaCEP retornou status ${response.status}`,
        'viacep',
        response.status
      )
    }

    const rawData: ViaCepResponse = await response.json()

    // ViaCEP retorna { erro: true } quando CEP não existe
    if (rawData.erro) {
      return {
        status: 'not_found',
        data: null,
        error: 'CEP não encontrado',
        duration: Date.now() - startTime,
      }
    }

    const enrichedData = normalizeCepData(rawData)

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
        error: 'Timeout ao consultar ViaCEP',
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
 * Normaliza dados da ViaCEP para formato interno
 */
function normalizeCepData(raw: ViaCepResponse): EnrichedCepData {
  return {
    cep: cleanCep(raw.cep),
    logradouro: raw.logradouro || '',
    bairro: raw.bairro || '',
    cidade: raw.localidade,
    uf: raw.uf,
    estado: raw.estado || getEstadoByUf(raw.uf),
    regiao: raw.regiao || getRegiaoByUf(raw.uf),
    ibge: raw.ibge,
    ddd: raw.ddd,
    fetchedAt: new Date().toISOString(),
    source: 'viacep',
  }
}

/**
 * Retorna nome do estado pela UF
 */
function getEstadoByUf(uf: string): string {
  const estados: Record<string, string> = {
    AC: 'Acre',
    AL: 'Alagoas',
    AP: 'Amapá',
    AM: 'Amazonas',
    BA: 'Bahia',
    CE: 'Ceará',
    DF: 'Distrito Federal',
    ES: 'Espírito Santo',
    GO: 'Goiás',
    MA: 'Maranhão',
    MT: 'Mato Grosso',
    MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais',
    PA: 'Pará',
    PB: 'Paraíba',
    PR: 'Paraná',
    PE: 'Pernambuco',
    PI: 'Piauí',
    RJ: 'Rio de Janeiro',
    RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul',
    RO: 'Rondônia',
    RR: 'Roraima',
    SC: 'Santa Catarina',
    SP: 'São Paulo',
    SE: 'Sergipe',
    TO: 'Tocantins',
  }
  return estados[uf.toUpperCase()] || uf
}

/**
 * Retorna região pela UF
 */
function getRegiaoByUf(uf: string): string {
  const regioes: Record<string, string> = {
    // Norte
    AC: 'Norte', AM: 'Norte', AP: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
    // Nordeste
    AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
    PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
    // Centro-Oeste
    DF: 'Centro-Oeste', GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste',
    // Sudeste
    ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
    // Sul
    PR: 'Sul', RS: 'Sul', SC: 'Sul',
  }
  return regioes[uf.toUpperCase()] || ''
}

/**
 * Formata endereço completo
 */
export function formatFullAddress(data: EnrichedCepData, numero?: string, complemento?: string): string {
  const parts = [
    data.logradouro,
    numero || 'S/N',
    complemento,
    data.bairro,
    `${data.cidade} - ${data.uf}`,
    formatCep(data.cep),
  ].filter(Boolean)
  
  return parts.join(', ')
}
