/**
 * BrasilAPI Client
 * Consulta dados de CNPJ na Receita Federal via BrasilAPI
 * 
 * @see https://brasilapi.com.br/docs#tag/CNPJ
 */

import {
  BrasilApiCnpjResponse,
  EnrichedCompanyData,
  EnrichmentResult,
  EnrichmentError,
  API_TIMEOUTS,
  API_URLS,
} from './types'

/**
 * Remove caracteres não numéricos do CNPJ
 */
export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

/**
 * Formata CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
 */
export function formatCnpj(cnpj: string): string {
  const clean = cleanCnpj(cnpj)
  if (clean.length !== 14) return cnpj
  return clean.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  )
}

/**
 * Valida formato básico do CNPJ (14 dígitos)
 * Nota: Validação completa é feita pela função SQL validate_cnpj()
 */
export function isValidCnpjFormat(cnpj: string): boolean {
  const clean = cleanCnpj(cnpj)
  return clean.length === 14 && /^\d+$/.test(clean)
}

/**
 * Busca dados de CNPJ na BrasilAPI
 */
export async function fetchCnpjData(
  cnpj: string
): Promise<EnrichmentResult<EnrichedCompanyData>> {
  const startTime = Date.now()
  const cleanedCnpj = cleanCnpj(cnpj)

  // Validação básica
  if (!isValidCnpjFormat(cleanedCnpj)) {
    return {
      status: 'error',
      data: null,
      error: 'CNPJ inválido: deve conter 14 dígitos numéricos',
      duration: Date.now() - startTime,
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.BRASIL_API)

    const response = await fetch(
      `${API_URLS.BRASIL_API}/cnpj/v1/${cleanedCnpj}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ProjectMary/1.0 (https://github.com/project-mary; contact@projectmary.com)',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
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
          error: 'CNPJ não encontrado na base da Receita Federal',
          duration: Date.now() - startTime,
        }
      }

      if (response.status === 400) {
        return {
          status: 'error',
          data: null,
          error: 'CNPJ inválido',
          duration: Date.now() - startTime,
        }
      }

      throw new EnrichmentError(
        `BrasilAPI retornou status ${response.status}`,
        'brasil_api',
        response.status
      )
    }

    const rawData: BrasilApiCnpjResponse = await response.json()
    const enrichedData = normalizeCompanyData(rawData)

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
        error: 'Timeout ao consultar BrasilAPI',
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
 * Normaliza dados da BrasilAPI para formato interno
 */
function normalizeCompanyData(raw: BrasilApiCnpjResponse): EnrichedCompanyData {
  return {
    // Identificação
    cnpj: cleanCnpj(raw.cnpj),
    razaoSocial: raw.razao_social,
    nomeFantasia: raw.nome_fantasia || null,

    // Atividade
    cnaeCode: String(raw.cnae_fiscal),
    cnaeDescription: raw.cnae_fiscal_descricao,
    cnaesSecundarios: raw.cnaes_secundarios?.map((cnae) => ({
      codigo: String(cnae.codigo),
      descricao: cnae.descricao,
    })),

    // Dados jurídicos
    naturezaJuridica: raw.natureza_juridica,
    capitalSocial: raw.capital_social,
    porte: raw.descricao_porte || raw.porte,
    situacaoCadastral: raw.descricao_situacao_cadastral,
    dataInicioAtividade: raw.data_inicio_atividade,

    // Endereço
    address: {
      logradouro: [raw.descricao_tipo_logradouro, raw.logradouro]
        .filter(Boolean)
        .join(' '),
      numero: raw.numero || 'S/N',
      complemento: raw.complemento || '',
      bairro: raw.bairro,
      cidade: raw.municipio,
      uf: raw.uf,
      cep: raw.cep,
    },

    // Contato
    telefone: raw.ddd_telefone_1 || null,
    email: raw.email || null,

    // Sócios (QSA - Quadro de Sócios e Administradores)
    shareholders: raw.qsa?.map((socio) => ({
      nome: socio.nome_socio,
      cpfCnpj: socio.cnpj_cpf_do_socio,
      qualificacao: socio.qualificacao_socio,
      percentualParticipacao: socio.percentual_capital_social ?? undefined,
      dataEntrada: socio.data_entrada_sociedade ?? undefined,
    })) || [],

    // Metadados
    fetchedAt: new Date().toISOString(),
    source: 'brasil_api',
  }
}

/**
 * Verifica se a empresa está ativa
 */
export function isCompanyActive(data: EnrichedCompanyData): boolean {
  return data.situacaoCadastral.toLowerCase().includes('ativa')
}

/**
 * Extrai o código CNAE principal (primeiros 4 dígitos = divisão)
 */
export function getCnaeDivision(cnaeCode: string): string {
  return cnaeCode.substring(0, 4)
}
