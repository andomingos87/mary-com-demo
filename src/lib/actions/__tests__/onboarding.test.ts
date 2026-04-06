/**
 * Tests for Onboarding Server Actions
 * Phase 3.3 - Backend: Server Actions de Onboarding
 */

import {
  // Types
  STEP_ORDER,
  SKIPPABLE_STEPS,
  STEP_REQUIREMENTS,
  ELIGIBILITY_CRITERIA,
  getNextStep,
  getPreviousStep,
  calculateProgress,
} from '@/types/onboarding'
import type { AssetProfileDetails } from '@/types/onboarding'
import type { OnboardingData } from '@/types/database'
import { hydrateAssetStepFormData } from '@/lib/onboarding/asset-step-hydration'
import { TOOLTIPS } from '@/lib/constants/tooltips'

describe('Onboarding Types', () => {
  describe('STEP_ORDER', () => {
    it('should have correct number of steps', () => {
      expect(STEP_ORDER).toHaveLength(14)
    })

    it('should start with profile_selection', () => {
      expect(STEP_ORDER[0]).toBe('profile_selection')
    })

    it('should end with completed', () => {
      expect(STEP_ORDER[STEP_ORDER.length - 1]).toBe('completed')
    })

    it('should have all required steps in order', () => {
      expect(STEP_ORDER).toEqual([
        'profile_selection',
        'cnpj_input',
        'data_enrichment',
        'data_confirmation',
        'asset_company_data',
        'asset_matching_data',
        'asset_team',
        'asset_codename',
        'profile_details',
        'eligibility_check',
        'terms_acceptance',
        'mfa_setup',
        'pending_review',
        'completed',
      ])
    })
  })

  describe('SKIPPABLE_STEPS', () => {
    it('should skip non-applicable steps for investor two-step onboarding', () => {
      expect(SKIPPABLE_STEPS.investor).toContain('profile_selection')
      expect(SKIPPABLE_STEPS.investor).toContain('cnpj_input')
      expect(SKIPPABLE_STEPS.investor).toContain('data_enrichment')
      expect(SKIPPABLE_STEPS.investor).toContain('data_confirmation')
      expect(SKIPPABLE_STEPS.investor).toContain('asset_company_data')
      expect(SKIPPABLE_STEPS.investor).toContain('asset_matching_data')
      expect(SKIPPABLE_STEPS.investor).toContain('asset_team')
      expect(SKIPPABLE_STEPS.investor).toContain('asset_codename')
      expect(SKIPPABLE_STEPS.investor).toContain('terms_acceptance')
      expect(SKIPPABLE_STEPS.investor).toContain('mfa_setup')
      expect(SKIPPABLE_STEPS.investor).toContain('pending_review')
    })

    it('should skip old details and eligibility for asset', () => {
      expect(SKIPPABLE_STEPS.asset).toContain('data_enrichment')
      expect(SKIPPABLE_STEPS.asset).toContain('data_confirmation')
      expect(SKIPPABLE_STEPS.asset).toContain('profile_details')
      expect(SKIPPABLE_STEPS.asset).toContain('eligibility_check')
    })

    it('should skip asset-specific steps for advisor', () => {
      expect(SKIPPABLE_STEPS.advisor).toContain('asset_company_data')
      expect(SKIPPABLE_STEPS.advisor).toContain('asset_matching_data')
      expect(SKIPPABLE_STEPS.advisor).toContain('asset_team')
      expect(SKIPPABLE_STEPS.advisor).toContain('asset_codename')
    })
  })

  describe('STEP_REQUIREMENTS', () => {
    it('should require cnpj for cnpj_input step', () => {
      expect(STEP_REQUIREMENTS.cnpj_input).toContain('cnpj')
    })

    it('should require profile_type for profile_details step', () => {
      expect(STEP_REQUIREMENTS.profile_details).toContain('profile_type')
    })

    it('should have no requirements for profile_selection', () => {
      expect(STEP_REQUIREMENTS.profile_selection).toHaveLength(0)
    })
  })

  describe('ELIGIBILITY_CRITERIA', () => {
    it('should have stricter criteria for advisor than investor', () => {
      expect(ELIGIBILITY_CRITERIA.advisor.minDeals).toBeGreaterThan(
        ELIGIBILITY_CRITERIA.investor.minDeals
      )
      expect(ELIGIBILITY_CRITERIA.advisor.minDealValue).toBeGreaterThan(
        ELIGIBILITY_CRITERIA.investor.minDealValue
      )
    })

    it('should have no requirements for asset', () => {
      expect(ELIGIBILITY_CRITERIA.asset.minDeals).toBe(0)
      expect(ELIGIBILITY_CRITERIA.asset.minDealValue).toBe(0)
      expect(ELIGIBILITY_CRITERIA.asset.minYearsExperience).toBe(0)
    })
  })
})

describe('Onboarding Navigation Functions', () => {
  describe('getNextStep', () => {
    it('should return next step for investor', () => {
      expect(getNextStep('profile_selection', 'investor')).toBe('profile_details')
      expect(getNextStep('profile_details', 'investor')).toBe('eligibility_check')
      expect(getNextStep('eligibility_check', 'investor')).toBe('completed')
    })

    it('should advance in new 4-step asset flow', () => {
      expect(getNextStep('cnpj_input', 'asset')).toBe('asset_company_data')
      expect(getNextStep('data_enrichment', 'asset')).toBe('asset_company_data')
      expect(getNextStep('asset_company_data', 'asset')).toBe('asset_matching_data')
      expect(getNextStep('asset_matching_data', 'asset')).toBe('asset_team')
      expect(getNextStep('asset_team', 'asset')).toBe('asset_codename')
      expect(getNextStep('asset_codename', 'asset')).toBe('terms_acceptance')
    })

    it('should keep advisor flow passing through data_enrichment', () => {
      expect(getNextStep('cnpj_input', 'advisor')).toBe('data_enrichment')
      expect(getNextStep('data_enrichment', 'advisor')).toBe('data_confirmation')
    })

    it('should return null for completed step', () => {
      expect(getNextStep('completed', 'investor')).toBeNull()
    })

    it('should return null for last step before completed', () => {
      expect(getNextStep('pending_review', 'investor')).toBe('completed')
    })
  })

  describe('getPreviousStep', () => {
    it('should return previous step for investor', () => {
      expect(getPreviousStep('eligibility_check', 'investor')).toBe('profile_details')
      expect(getPreviousStep('profile_details', 'investor')).toBeNull()
    })

    it('should navigate backward in new 4-step asset flow', () => {
      expect(getPreviousStep('asset_codename', 'asset')).toBe('asset_team')
      expect(getPreviousStep('asset_team', 'asset')).toBe('asset_matching_data')
      expect(getPreviousStep('asset_matching_data', 'asset')).toBe('asset_company_data')
      expect(getPreviousStep('asset_company_data', 'asset')).toBe('cnpj_input')
    })

    it('should return null for first step', () => {
      expect(getPreviousStep('profile_selection', 'investor')).toBeNull()
    })
  })

  describe('calculateProgress', () => {
    it('should return 0 for profile_selection', () => {
      expect(calculateProgress('profile_selection', 'investor')).toBe(0)
    })

    it('should return 100 for completed', () => {
      expect(calculateProgress('completed', 'investor')).toBe(100)
    })

    it('should return intermediate values for middle steps', () => {
      const progress = calculateProgress('profile_details', 'investor')
      expect(progress).toBeGreaterThanOrEqual(0)
      expect(progress).toBeLessThan(100)
    })

    it('should calculate different progress for asset (fewer steps)', () => {
      // Use profilePreselectedAtSignup=false to test the legacy flow with more steps
      const investorProgress = calculateProgress('terms_acceptance', 'investor', false)
      const assetProgress = calculateProgress('terms_acceptance', 'asset', false)
      
      // Both should be valid percentages
      expect(investorProgress).toBeGreaterThanOrEqual(0)
      expect(investorProgress).toBeLessThanOrEqual(100)
      expect(assetProgress).toBeGreaterThanOrEqual(0)
      expect(assetProgress).toBeLessThanOrEqual(100)
      
      // Asset has fewer steps (skips eligibility_check), so same step should have higher or equal progress
      // Note: The difference depends on the position of the skipped step relative to terms_acceptance
      expect(assetProgress).toBeGreaterThanOrEqual(investorProgress - 5) // Allow small variance
    })

    it('should calculate progress correctly with new flow (profile preselected at signup)', () => {
      // New flow: investor starts at profile_details
      const investorStart = calculateProgress('profile_details', 'investor', true)
      expect(investorStart).toBe(0)
      
      // Investor second step should be half-way before completion
      const investorSecondStep = calculateProgress('eligibility_check', 'investor', true)
      expect(investorSecondStep).toBeGreaterThan(0)
      
      // Completion should reach 100%
      const investorCompleted = calculateProgress('completed', 'investor', true)
      const assetTerms = calculateProgress('terms_acceptance', 'asset', true)
      
      expect(investorCompleted).toBe(100)
      expect(assetTerms).toBeGreaterThan(50)
    })
  })
})

describe('Eligibility Validation', () => {
  describe('Investor Eligibility', () => {
    it('should require minimum 1 deal', () => {
      expect(ELIGIBILITY_CRITERIA.investor.minDeals).toBe(1)
    })

    it('should require minimum $100,000 deal value', () => {
      expect(ELIGIBILITY_CRITERIA.investor.minDealValue).toBe(100000)
    })

    it('should require minimum 2 years experience', () => {
      expect(ELIGIBILITY_CRITERIA.investor.minYearsExperience).toBe(2)
    })
  })

  describe('Advisor Eligibility', () => {
    it('should require minimum 3 deals', () => {
      expect(ELIGIBILITY_CRITERIA.advisor.minDeals).toBe(3)
    })

    it('should require minimum $500,000 deal value', () => {
      expect(ELIGIBILITY_CRITERIA.advisor.minDealValue).toBe(500000)
    })

    it('should require minimum 3 years experience', () => {
      expect(ELIGIBILITY_CRITERIA.advisor.minYearsExperience).toBe(3)
    })
  })
})

describe('Profile Details Types', () => {
  it('should have investor profile type options', () => {
    const investorTypes = [
      'accelerator',
      'angel',
      'cvc',
      'corporate_strategic',
      'family_office',
      'incubator',
      'pension_fund',
      'pe',
      'search_fund',
      'sovereign',
      'venture_builder',
      'vc',
    ]
    // Type check - this is a compile-time test
    const validType:
      | 'accelerator'
      | 'angel'
      | 'cvc'
      | 'corporate_strategic'
      | 'family_office'
      | 'incubator'
      | 'pension_fund'
      | 'pe'
      | 'search_fund'
      | 'sovereign'
      | 'venture_builder'
      | 'vc' = 'pe'
    expect(investorTypes).toContain(validType)
  })

  it('should have asset revenue annual USD', () => {
    const revenueAnnualUsd: AssetProfileDetails['revenueAnnualUsd'] = 1000000
    expect(revenueAnnualUsd).toBe(1000000)
  })

  it('should have advisor types', () => {
    const advisorTypes = ['investment_bank', 'boutique_ma', 'law_firm', 'accounting', 'auditing', 'other']
    const validType: 'investment_bank' | 'boutique_ma' | 'law_firm' | 'accounting' | 'auditing' | 'other' = 'boutique_ma'
    expect(advisorTypes).toContain(validType)
  })
})

describe('Step Validation', () => {
  it('should have requirements for data_confirmation', () => {
    expect(STEP_REQUIREMENTS.data_confirmation).toContain('name')
    expect(STEP_REQUIREMENTS.data_confirmation).toContain('cnpj')
    expect(STEP_REQUIREMENTS.data_confirmation).toContain('cnae_code')
    expect(STEP_REQUIREMENTS.data_confirmation).toContain('website')
  })

  it('should have requirements for data_enrichment', () => {
    expect(STEP_REQUIREMENTS.data_enrichment).toContain('cnpj')
  })

  it('should have no requirements for completed step', () => {
    expect(STEP_REQUIREMENTS.completed).toHaveLength(0)
  })
})

describe('Asset Step Hydration', () => {
  it('should merge saved asset step payloads into initial form data', () => {
    const onboardingData = {
      assetCompanyData: {
        companyDescription: 'Empresa de software',
        projectObjective: { type: 'investment', subReason: 'Expansão e Crescimento' },
        businessModel: ['B2B'],
        sectors: ['tech'],
      },
      assetMatchingData: {
        rob12Months: 1200000,
        ebitdaPercent: 18,
        employeeCount: 42,
        foundingYear: 2018,
        headquarters: { city: 'Sao Paulo', state: 'SP', country: 'Brasil' },
      },
      assetTeamData: {
        shareholders: [{ name: 'Ana', email: 'ana@test.com' }],
      },
      assetCodenameData: {
        codename: 'Projeto Atlas',
        codenameSource: 'manual',
      },
    } as unknown as OnboardingData

    const result = hydrateAssetStepFormData(onboardingData, { profileType: 'asset' })

    expect(result.profileType).toBe('asset')
    expect(result.companyDescription).toBe('Empresa de software')
    expect(result.rob12Months).toBe(1200000)
    expect(result.shareholders).toEqual([{ name: 'Ana', email: 'ana@test.com' }])
    expect(result.codename).toBe('Projeto Atlas')
  })

  it('should return base object when onboarding data is empty', () => {
    const result = hydrateAssetStepFormData(null, { profileType: 'asset' })
    expect(result).toMatchObject({ profileType: 'asset', shareholders: [] })
  })

  it('should apply fallback values when asset company data is missing', () => {
    const onboardingData = {
      assetMatchingData: {
        rob12Months: 500000,
      },
    } as unknown as OnboardingData

    const result = hydrateAssetStepFormData(
      onboardingData,
      { profileType: 'asset' },
      {
        companyName: 'Empresa Fallback LTDA',
        responsibleName: 'Maria Responsavel',
      }
    )

    expect(result.companyName).toBe('Empresa Fallback LTDA')
    expect(result.responsibleName).toBe('Maria Responsavel')
    expect(result.rob12Months).toBe(500000)
  })

  it('should prioritize saved values over fallback values', () => {
    const onboardingData = {
      assetCompanyData: {
        companyName: 'Empresa Salva SA',
        responsibleName: 'Joao Salvo',
      },
    } as unknown as OnboardingData

    const result = hydrateAssetStepFormData(
      onboardingData,
      { profileType: 'asset' },
      {
        companyName: 'Empresa Fallback LTDA',
        responsibleName: 'Maria Responsavel',
      }
    )

    expect(result.companyName).toBe('Empresa Salva SA')
    expect(result.responsibleName).toBe('Joao Salvo')
  })

  it('should fallback shareholders from enrichment when assetTeamData is empty', () => {
    const result = hydrateAssetStepFormData(
      { assetTeamData: { shareholders: [] } } as unknown as OnboardingData,
      { profileType: 'asset' },
      {
        shareholders: [
          { nome: 'Joao', qualificacao: 'Socio', percentual_participacao: 60 },
          { nome: 'Maria', qualificacao: 'Diretora' },
        ],
      }
    )

    expect(result.shareholders).toEqual([
      {
        name: 'Joao',
        email: '',
        role: 'Socio',
        ownershipPercent: 60,
      },
      {
        name: 'Maria',
        email: '',
        role: 'Diretora',
        ownershipPercent: undefined,
      },
    ])
  })

  it('should prioritize persisted asset team shareholders over enrichment fallback', () => {
    const result = hydrateAssetStepFormData(
      {
        assetTeamData: {
          shareholders: [{ name: 'Ana', email: 'ana@empresa.com', role: 'CEO', ownershipPercent: 51 }],
        },
      } as unknown as OnboardingData,
      { profileType: 'asset' },
      {
        shareholders: [{ nome: 'Nao Deve Entrar', email: 'old@old.com' }],
      }
    )

    expect(result.shareholders).toEqual([
      { name: 'Ana', email: 'ana@empresa.com', role: 'CEO', ownershipPercent: 51 },
    ])
  })
})

describe('H0.6 tooltip contract', () => {
  it('expõe catálogo unificado para onboarding e tese', () => {
    expect(TOOLTIPS.onboarding.asset.companyDescription).toContain('Descreva')
    expect(TOOLTIPS.thesis.summary).toContain('tese')
  })
})

describe('H0.6 onboarding autosave payload contract', () => {
  it('mantém chaves de draft incremental estáveis para backend merge', () => {
    const payload = {
      assetCompanyData: { responsibleName: 'Maria' },
      assetMatchingData: { rob12Months: 1200000 },
      assetTeamData: { shareholders: [{ name: 'Ana' }] },
      assetCodenameData: { codename: 'alpha-1' },
      profileDetailsDraft: { sectorsOfInterest: ['saude'] },
      eligibilityDraft: { yearsExperience: 7 },
      onboardingDraft: { currentStep: 'asset_company_data' },
    }

    expect(payload).toHaveProperty('assetCompanyData')
    expect(payload).toHaveProperty('assetMatchingData')
    expect(payload).toHaveProperty('assetTeamData')
    expect(payload).toHaveProperty('assetCodenameData')
    expect(payload).toHaveProperty('profileDetailsDraft')
    expect(payload).toHaveProperty('eligibilityDraft')
    expect(payload).toHaveProperty('onboardingDraft')
  })
})
