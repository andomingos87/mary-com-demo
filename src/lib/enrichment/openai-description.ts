/**
 * OpenAI Description Generator
 * Gera descrições de empresas usando GPT
 * 
 * @see https://platform.openai.com/docs/api-reference/chat
 */

import {
  DescriptionContext,
  GeneratedDescription,
  EnrichmentResult,
  EnrichmentError,
  API_TIMEOUTS,
} from './types'

// Modelo padrão (custo-benefício)
const DEFAULT_MODEL = 'gpt-4o-mini'

// Prompt do sistema para geração de descrições
const SYSTEM_PROMPT = `Você é um especialista em M&A (Fusões e Aquisições) brasileiro.
Sua tarefa é gerar descrições concisas e profissionais de empresas para um marketplace de investimentos.

Regras:
- Escreva em português brasileiro formal
- Use 2-3 frases no máximo (50-100 palavras)
- Seja objetivo e factual
- Destaque o setor de atuação e diferenciais
- Não use superlativos exagerados
- Não invente informações que não foram fornecidas
- Se houver pouca informação, seja genérico mas profissional`

/**
 * Gera descrição da empresa usando OpenAI
 */
export async function generateDescription(
  context: DescriptionContext,
  apiKey?: string
): Promise<EnrichmentResult<GeneratedDescription>> {
  const startTime = Date.now()

  // Usa variável de ambiente se não fornecida
  const key = apiKey || process.env.OPENAI_API_KEY

  if (!key) {
    return {
      status: 'error',
      data: null,
      error: 'OPENAI_API_KEY não configurada',
      duration: Date.now() - startTime,
    }
  }

  // Monta o prompt do usuário
  const userPrompt = buildUserPrompt(context)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.OPENAI)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
        top_p: 1,
        n: 1,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new EnrichmentError(
        `OpenAI retornou status ${response.status}: ${errorData.error?.message || 'Erro desconhecido'}`,
        'openai',
        response.status
      )
    }

    const data = await response.json()
    
    const generatedText = data.choices?.[0]?.message?.content?.trim()
    
    if (!generatedText) {
      return {
        status: 'error',
        data: null,
        error: 'OpenAI não retornou conteúdo',
        duration: Date.now() - startTime,
      }
    }

    // Calcula confiança baseado na quantidade de contexto fornecido
    const confidence = calculateConfidence(context)

    const result: GeneratedDescription = {
      text: generatedText,
      model: data.model || DEFAULT_MODEL,
      tokensUsed: data.usage?.total_tokens || 0,
      generatedAt: new Date().toISOString(),
      source: 'openai',
      confidence,
    }

    return {
      status: 'success',
      data: result,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'timeout',
        data: null,
        error: 'Timeout ao gerar descrição com OpenAI',
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
 * Constrói o prompt do usuário com o contexto disponível
 */
function buildUserPrompt(context: DescriptionContext): string {
  const parts: string[] = []

  parts.push(`Gere uma descrição profissional para a seguinte empresa:`)
  parts.push('')
  parts.push(`**Razão Social:** ${context.razaoSocial}`)

  if (context.nomeFantasia) {
    parts.push(`**Nome Fantasia:** ${context.nomeFantasia}`)
  }

  parts.push(`**Atividade Principal (CNAE):** ${context.cnaeDescription}`)

  if (context.setor) {
    parts.push(`**Setor:** ${context.setor}`)
  }

  if (context.websiteContent) {
    // Limita o conteúdo do website para não estourar tokens
    const truncatedContent = context.websiteContent.substring(0, 1000)
    parts.push('')
    parts.push(`**Informações do website:**`)
    parts.push(truncatedContent)
  }

  return parts.join('\n')
}

/**
 * Calcula nível de confiança baseado no contexto disponível
 */
function calculateConfidence(context: DescriptionContext): 'high' | 'medium' | 'low' {
  let score = 0

  // Dados básicos sempre presentes
  if (context.razaoSocial) score += 1
  if (context.cnaeDescription) score += 1

  // Dados opcionais que aumentam confiança
  if (context.nomeFantasia) score += 1
  if (context.setor) score += 1
  if (context.websiteContent && context.websiteContent.length > 200) score += 2

  if (score >= 5) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

/**
 * Gera descrição fallback quando OpenAI não está disponível
 */
export function generateFallbackDescription(context: DescriptionContext): string {
  const { razaoSocial, nomeFantasia, cnaeDescription } = context
  
  const name = nomeFantasia || razaoSocial
  
  return `${name} é uma empresa brasileira que atua no segmento de ${cnaeDescription.toLowerCase()}. A organização está registrada na Receita Federal e opera no mercado nacional.`
}

/**
 * Valida se a descrição gerada é adequada
 */
export function isDescriptionValid(description: string): boolean {
  // Verifica tamanho mínimo e máximo
  if (description.length < 50 || description.length > 500) {
    return false
  }

  // Verifica se não contém placeholders ou erros comuns
  const invalidPatterns = [
    /\[.*?\]/g, // Placeholders [algo]
    /TODO/i,
    /INSERIR/i,
    /COMPLETAR/i,
    /não foi possível/i,
    /erro/i,
  ]

  return !invalidPatterns.some(pattern => pattern.test(description))
}
