/**
 * Enrichment Services
 * APIs de enriquecimento de dados para onboarding
 * 
 * Phase 3.2 - Onboarding automatizado
 */

// Types
export * from './types'

// BrasilAPI - Dados da Receita Federal
export {
  fetchCnpjData,
  cleanCnpj,
  formatCnpj,
  isValidCnpjFormat,
  isCompanyActive,
  getCnaeDivision,
} from './brasil-api'

// Jina.ai Reader - Scraping de websites
export {
  scrapeWebsite,
  normalizeUrl,
  extractDomain,
  isValidUrl,
  prepareContentForAI,
} from './jina-reader'

// Clearbit - Logo da empresa
export {
  fetchLogo,
  checkLogoExists,
  getLogoUrl,
  getPlaceholderLogoUrl,
} from './clearbit-logo'

// ViaCEP - Dados de endereço
export {
  fetchCepData,
  cleanCep,
  formatCep,
  isValidCepFormat,
  formatFullAddress,
} from './viacep'

// OpenAI - Geração de descrição
export {
  generateDescription,
  generateFallbackDescription,
  isDescriptionValid,
} from './openai-description'

// CVM - Validação de participantes
export {
  checkCvmRegistration,
  getCvmParticipant,
  isCvmParticipantRelevant,
  getCvmParticipantTypeLabel,
  getCvmCacheStatus,
} from './cvm-validator'

// ============================================
// Orchestration Functions
// ============================================

import { EnrichedCompanyData, EnrichedWebsiteData, ClearbitLogoResult, CvmValidationResult, GeneratedDescription, OnboardingEnrichmentResult } from './types'
import { fetchCnpjData } from './brasil-api'
import { scrapeWebsite, prepareContentForAI, extractDomain } from './jina-reader'
import { fetchLogo } from './clearbit-logo'
import { checkCvmRegistration } from './cvm-validator'
import { generateDescription, generateFallbackDescription } from './openai-description'

/**
 * Enriquece dados de uma empresa a partir do CNPJ
 * Orquestra chamadas para BrasilAPI + ViaCEP
 */
export async function enrichFromCnpj(cnpj: string) {
  return fetchCnpjData(cnpj)
}

/**
 * Enriquece dados a partir do website
 * Orquestra chamadas para Jina.ai + Clearbit
 */
export async function enrichFromWebsite(url: string) {
  const [websiteResult, logoResult] = await Promise.all([
    scrapeWebsite(url),
    fetchLogo(url),
  ])

  return {
    website: websiteResult,
    logo: logoResult,
  }
}

/**
 * Executa enriquecimento completo para onboarding
 * Orquestra todas as APIs em paralelo onde possível
 */
export async function enrichOnboardingData(
  cnpj: string,
  websiteUrl?: string
): Promise<OnboardingEnrichmentResult> {
  // Fase 1: Dados básicos (CNPJ + CVM em paralelo)
  const [cnpjResult, cvmResult] = await Promise.all([
    fetchCnpjData(cnpj),
    checkCvmRegistration(cnpj),
  ])

  // Fase 2: Website e logo (se URL fornecida)
  let websiteResult = null
  let logoResult = null

  if (websiteUrl) {
    const websiteData = await enrichFromWebsite(websiteUrl)
    websiteResult = websiteData.website
    logoResult = websiteData.logo
  } else if (cnpjResult.status === 'success' && cnpjResult.data) {
    // Tenta inferir domínio do email ou nome fantasia
    // Por enquanto, apenas busca logo se tiver domínio explícito
  }

  // Fase 3: Geração de descrição (se tiver dados suficientes)
  let descriptionResult = null

  if (cnpjResult.status === 'success' && cnpjResult.data) {
    const context = {
      razaoSocial: cnpjResult.data.razaoSocial,
      nomeFantasia: cnpjResult.data.nomeFantasia,
      cnaeDescription: cnpjResult.data.cnaeDescription,
      websiteContent: websiteResult?.data?.markdownContent
        ? prepareContentForAI(websiteResult.data.markdownContent)
        : null,
    }

    descriptionResult = await generateDescription(context)

    // Fallback se OpenAI falhar
    if (descriptionResult.status !== 'success') {
      descriptionResult = {
        status: 'success' as const,
        data: {
          text: generateFallbackDescription(context),
          model: 'fallback',
          tokensUsed: 0,
          generatedAt: new Date().toISOString(),
          source: 'openai' as const,
          confidence: 'low' as const,
        },
        duration: 0,
      }
    }
  }

  return {
    cnpj: cnpjResult,
    website: websiteResult,
    logo: logoResult,
    cvm: cvmResult,
    description: descriptionResult,
  }
}

/**
 * Calcula nível de confiança geral do enriquecimento
 */
export function calculateOverallConfidence(
  result: OnboardingEnrichmentResult
): 'high' | 'medium' | 'low' {
  let score = 0
  let total = 0

  // CNPJ (peso 3)
  if (result.cnpj?.status === 'success') {
    score += 3
  }
  total += 3

  // Website (peso 2)
  if (result.website?.status === 'success') {
    score += 2
  }
  total += 2

  // Logo (peso 1)
  if (result.logo?.status === 'success' && result.logo.data?.exists) {
    score += 1
  }
  total += 1

  // CVM (peso 1 - bônus se registrado)
  if (result.cvm?.status === 'success' && result.cvm.data?.isRegistered) {
    score += 1
  }
  // Não conta no total pois é opcional

  // Descrição (peso 2)
  if (result.description?.status === 'success') {
    const confidence = result.description.data?.confidence
    if (confidence === 'high') score += 2
    else if (confidence === 'medium') score += 1
  }
  total += 2

  const percentage = (score / total) * 100

  if (percentage >= 80) return 'high'
  if (percentage >= 50) return 'medium'
  return 'low'
}
