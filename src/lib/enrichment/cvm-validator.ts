/**
 * CVM Validator
 * Consulta cache local de participantes da CVM
 * 
 * @see https://dados.cvm.gov.br/dados/
 */

import { createClient } from '@/lib/supabase/server'
import {
  CvmValidationResult,
  EnrichmentResult,
  API_TIMEOUTS,
  CvmParticipantType,
} from './types'
import { cleanCnpj } from './brasil-api'

/** Resultado da função check_cvm_registration */
interface CvmCheckResult {
  is_registered: boolean
  participant_name: string | null
  participant_status: string | null
  participant_type: CvmParticipantType | null
  registry_date: string | null
}

/**
 * Verifica se CNPJ está registrado na CVM (cache local)
 */
export async function checkCvmRegistration(
  cnpj: string
): Promise<EnrichmentResult<CvmValidationResult>> {
  const startTime = Date.now()
  const cleanedCnpj = cleanCnpj(cnpj)

  if (cleanedCnpj.length !== 14) {
    return {
      status: 'error',
      data: null,
      error: 'CNPJ inválido',
      duration: Date.now() - startTime,
    }
  }

  try {
    const supabase = await createClient()

    // Usa a função SQL que criamos na migration
    // Type assertion needed due to Supabase client type inference issues
    type RpcFn = (args: { cnpj_input: string }) => Promise<{ data: CvmCheckResult[] | null; error: Error | null }>
    const { data, error } = await (supabase.rpc as unknown as (name: string, args: { cnpj_input: string }) => ReturnType<RpcFn>)('check_cvm_registration', { cnpj_input: cleanedCnpj })

    if (error) {
      console.error('Erro ao consultar CVM:', error)
      return {
        status: 'error',
        data: null,
        error: `Erro ao consultar CVM: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }

    // A função retorna um array com um registro
    const result = data?.[0]

    if (!result) {
      return {
        status: 'not_found',
        data: {
          cnpj: cleanedCnpj,
          isRegistered: false,
          participantType: null,
          participantName: null,
          participantStatus: null,
          registryDate: null,
          checkedAt: new Date().toISOString(),
          source: 'cvm_cache',
        },
        duration: Date.now() - startTime,
      }
    }

    return {
      status: result.is_registered ? 'success' : 'not_found',
      data: {
        cnpj: cleanedCnpj,
        isRegistered: result.is_registered,
        participantType: result.participant_type,
        participantName: result.participant_name,
        participantStatus: result.participant_status,
        registryDate: result.registry_date,
        checkedAt: new Date().toISOString(),
        source: 'cvm_cache',
      },
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      status: 'error',
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Busca participante CVM diretamente na tabela (para admin)
 */
export async function getCvmParticipant(
  cnpj: string,
  type?: string
): Promise<EnrichmentResult<CvmValidationResult>> {
  const startTime = Date.now()
  const cleanedCnpj = cleanCnpj(cnpj)

  try {
    const supabase = await createClient()

    let query = supabase
      .from('cvm_participants')
      .select('*')
      .eq('cnpj', cleanedCnpj)

    if (type) {
      query = query.eq('type', type as CvmParticipantType)
    }

    interface CvmParticipantRow {
      cnpj: string
      name: string
      type: CvmParticipantType
      status: string | null
      registry_date: string | null
    }
    const { data, error } = await query.limit(1).single() as { data: CvmParticipantRow | null; error: { code?: string; message: string } | null }

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        return {
          status: 'not_found',
          data: {
            cnpj: cleanedCnpj,
            isRegistered: false,
            participantType: null,
            participantName: null,
            participantStatus: null,
            registryDate: null,
            checkedAt: new Date().toISOString(),
            source: 'cvm_cache',
          },
          duration: Date.now() - startTime,
        }
      }

      return {
        status: 'error',
        data: null,
        error: error.message,
        duration: Date.now() - startTime,
      }
    }

    if (!data) {
      return {
        status: 'not_found',
        data: {
          cnpj: cleanedCnpj,
          isRegistered: false,
          participantType: null,
          participantName: null,
          participantStatus: null,
          registryDate: null,
          checkedAt: new Date().toISOString(),
          source: 'cvm_cache',
        },
        duration: Date.now() - startTime,
      }
    }

    return {
      status: 'success',
      data: {
        cnpj: data.cnpj,
        isRegistered: true,
        participantType: data.type,
        participantName: data.name,
        participantStatus: data.status,
        registryDate: data.registry_date,
        checkedAt: new Date().toISOString(),
        source: 'cvm_cache',
      },
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      status: 'error',
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Verifica se o tipo de participante CVM é relevante para M&A
 */
export function isCvmParticipantRelevant(type: string | null): boolean {
  if (!type) return false
  
  const relevantTypes = [
    'cia_aberta',
    'fundo_investimento',
    'gestor',
    'administrador',
    'consultor',
  ]
  
  return relevantTypes.includes(type)
}

/**
 * Retorna descrição amigável do tipo de participante CVM
 */
export function getCvmParticipantTypeLabel(type: string | null): string {
  if (!type) return 'Não registrado'
  
  const labels: Record<string, string> = {
    cia_aberta: 'Companhia Aberta',
    fundo_investimento: 'Fundo de Investimento',
    gestor: 'Gestor de Recursos',
    administrador: 'Administrador Fiduciário',
    consultor: 'Consultor de Valores Mobiliários',
    auditor: 'Auditor Independente',
    agente_autonomo: 'Agente Autônomo de Investimento',
  }
  
  return labels[type] || type
}

/**
 * Verifica última sincronização do cache CVM
 */
export async function getCvmCacheStatus(): Promise<{
  lastSync: string | null
  totalRecords: number
}> {
  try {
    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('cvm_participants')
      .select('synced_at', { count: 'exact' })
      .order('synced_at', { ascending: false })
      .limit(1) as { data: { synced_at: string }[] | null; error: Error | null; count: number | null }

    if (error) {
      return { lastSync: null, totalRecords: 0 }
    }

    return {
      lastSync: data?.[0]?.synced_at || null,
      totalRecords: count || 0,
    }
  } catch {
    return { lastSync: null, totalRecords: 0 }
  }
}
