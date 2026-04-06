/**
 * Tests for Enrichment Services
 * Phase 3.2 - Onboarding data enrichment
 */

import {
  // BrasilAPI
  cleanCnpj,
  formatCnpj,
  isValidCnpjFormat,
  getCnaeDivision,
  
  // Jina Reader
  normalizeUrl,
  extractDomain,
  isValidUrl,
  prepareContentForAI,
  
  // Clearbit
  getLogoUrl,
  getPlaceholderLogoUrl,
  
  // ViaCEP
  cleanCep,
  formatCep,
  isValidCepFormat,
  
  // OpenAI
  isDescriptionValid,
  generateFallbackDescription,
  
  // CVM
  isCvmParticipantRelevant,
  getCvmParticipantTypeLabel,
  
  // Types
  API_TIMEOUTS,
  API_URLS,
} from '../index'

describe('BrasilAPI Utils', () => {
  describe('cleanCnpj', () => {
    it('should remove non-numeric characters', () => {
      expect(cleanCnpj('19.131.243/0001-97')).toBe('19131243000197')
      expect(cleanCnpj('19131243000197')).toBe('19131243000197')
      expect(cleanCnpj('19 131 243 0001 97')).toBe('19131243000197')
    })
  })

  describe('formatCnpj', () => {
    it('should format CNPJ correctly', () => {
      expect(formatCnpj('19131243000197')).toBe('19.131.243/0001-97')
    })

    it('should return original if invalid length', () => {
      expect(formatCnpj('123')).toBe('123')
    })
  })

  describe('isValidCnpjFormat', () => {
    it('should validate 14-digit CNPJs', () => {
      expect(isValidCnpjFormat('19131243000197')).toBe(true)
      expect(isValidCnpjFormat('19.131.243/0001-97')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(isValidCnpjFormat('123')).toBe(false)
      expect(isValidCnpjFormat('1234567890123456')).toBe(false)
      expect(isValidCnpjFormat('abcdefghijklmn')).toBe(false)
    })
  })

  describe('getCnaeDivision', () => {
    it('should extract first 4 digits', () => {
      expect(getCnaeDivision('6462000')).toBe('6462')
      expect(getCnaeDivision('8542200')).toBe('8542')
    })
  })
})

describe('Jina Reader Utils', () => {
  describe('normalizeUrl', () => {
    it('should add https if missing', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com')
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com')
    })

    it('should preserve existing protocol', () => {
      expect(normalizeUrl('http://example.com')).toBe('http://example.com')
      expect(normalizeUrl('https://example.com')).toBe('https://example.com')
    })

    it('should remove trailing slash', () => {
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com')
      expect(normalizeUrl('https://example.com///')).toBe('https://example.com')
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(extractDomain('https://www.example.com/path')).toBe('example.com')
      expect(extractDomain('https://example.com')).toBe('example.com')
      expect(extractDomain('example.com')).toBe('example.com')
    })
  })

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
    })
  })

  describe('prepareContentForAI', () => {
    it('should clean markdown formatting', () => {
      const markdown = '# Title\n\n**Bold** and *italic* text\n\n[Link](http://example.com)'
      const cleaned = prepareContentForAI(markdown)
      
      expect(cleaned).not.toContain('#')
      expect(cleaned).not.toContain('**')
      expect(cleaned).not.toContain('*')
      expect(cleaned).toContain('Link')
    })

    it('should truncate long content', () => {
      const longContent = 'a'.repeat(3000)
      const cleaned = prepareContentForAI(longContent, 100)
      
      expect(cleaned.length).toBeLessThanOrEqual(103) // 100 + '...'
    })
  })
})

describe('Logo Utils', () => {
  describe('getLogoUrl', () => {
    it('should generate correct URL', () => {
      expect(getLogoUrl('example.com')).toBe('https://icons.duckduckgo.com/ip3/example.com.ico')
    })
  })

  describe('getPlaceholderLogoUrl', () => {
    it('should generate placeholder with initials', () => {
      const url = getPlaceholderLogoUrl('Acme Corporation')
      expect(url).toContain('ui-avatars.com')
      expect(url).toContain('AC')
    })
  })
})

describe('ViaCEP Utils', () => {
  describe('cleanCep', () => {
    it('should remove non-numeric characters', () => {
      expect(cleanCep('01310-100')).toBe('01310100')
      expect(cleanCep('01310100')).toBe('01310100')
    })
  })

  describe('formatCep', () => {
    it('should format CEP correctly', () => {
      expect(formatCep('01310100')).toBe('01310-100')
    })

    it('should return original if invalid length', () => {
      expect(formatCep('123')).toBe('123')
    })
  })

  describe('isValidCepFormat', () => {
    it('should validate 8-digit CEPs', () => {
      expect(isValidCepFormat('01310100')).toBe(true)
      expect(isValidCepFormat('01310-100')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(isValidCepFormat('123')).toBe(false)
      expect(isValidCepFormat('123456789')).toBe(false)
    })
  })
})

describe('OpenAI Utils', () => {
  describe('isDescriptionValid', () => {
    it('should validate proper descriptions', () => {
      const validDesc = 'A Empresa XYZ é uma companhia brasileira especializada em tecnologia da informação, oferecendo soluções inovadoras para o mercado corporativo.'
      expect(isDescriptionValid(validDesc)).toBe(true)
    })

    it('should reject short descriptions', () => {
      expect(isDescriptionValid('Muito curto')).toBe(false)
    })

    it('should reject descriptions with placeholders', () => {
      expect(isDescriptionValid('A empresa [NOME] atua no setor de [SETOR] com foco em [FOCO].')).toBe(false)
    })
  })

  describe('generateFallbackDescription', () => {
    it('should generate fallback description', () => {
      const desc = generateFallbackDescription({
        razaoSocial: 'Empresa Teste LTDA',
        nomeFantasia: 'Teste',
        cnaeDescription: 'Desenvolvimento de software',
      })
      
      expect(desc).toContain('Teste')
      expect(desc).toContain('desenvolvimento de software')
    })
  })
})

describe('CVM Utils', () => {
  describe('isCvmParticipantRelevant', () => {
    it('should identify relevant participant types', () => {
      expect(isCvmParticipantRelevant('cia_aberta')).toBe(true)
      expect(isCvmParticipantRelevant('gestor')).toBe(true)
      expect(isCvmParticipantRelevant('fundo_investimento')).toBe(true)
    })

    it('should reject non-relevant types', () => {
      expect(isCvmParticipantRelevant('auditor')).toBe(false)
      expect(isCvmParticipantRelevant(null)).toBe(false)
    })
  })

  describe('getCvmParticipantTypeLabel', () => {
    it('should return correct labels', () => {
      expect(getCvmParticipantTypeLabel('cia_aberta')).toBe('Companhia Aberta')
      expect(getCvmParticipantTypeLabel('gestor')).toBe('Gestor de Recursos')
      expect(getCvmParticipantTypeLabel(null)).toBe('Não registrado')
    })
  })
})

describe('Constants', () => {
  it('should have correct API timeouts', () => {
    expect(API_TIMEOUTS.BRASIL_API).toBe(10000)
    expect(API_TIMEOUTS.JINA_READER).toBe(15000)
    expect(API_TIMEOUTS.OPENAI).toBe(30000)
  })

  it('should have correct API URLs', () => {
    expect(API_URLS.BRASIL_API).toBe('https://brasilapi.com.br/api')
    expect(API_URLS.JINA_READER).toBe('https://r.jina.ai')
    expect(API_URLS.DUCKDUCKGO_ICONS).toBe('https://icons.duckduckgo.com/ip3')
    expect(API_URLS.GOOGLE_FAVICON).toBe('https://www.google.com/s2/favicons')
    expect(API_URLS.VIACEP).toBe('https://viacep.com.br/ws')
  })
})
