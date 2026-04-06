'use client'

/**
 * ProfileSelector Component
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Step 1: Allows users to select their organization profile type.
 * Displays three selectable cards for Investor, Asset (Company), and Advisor.
 * Includes modal for resuming incomplete onboarding.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { 
  Button, 
  Card, 
  Spinner,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import { Building2, TrendingUp, Users, ArrowRight, RefreshCw, Plus } from 'lucide-react'
import type { OrganizationProfile, OnboardingStep } from '@/types/database'
import type { ExistingOrgData } from '@/types/onboarding'
import { startOnboarding, checkExistingOnboarding } from '@/lib/actions/onboarding'

// ============================================
// Types
// ============================================

export interface ProfileSelectorProps {
  /** Callback when profile is selected and organization is created */
  onSelect: (orgId: string, profileType: OrganizationProfile) => void
  /** Loading state from parent */
  isLoading?: boolean
  /** Additional CSS classes */
  className?: string
}

interface ProfileOption {
  type: OrganizationProfile
  title: string
  description: string
  features: string[]
  icon: React.ReactNode
}

// ============================================
// Profile Options Configuration
// ============================================

const PROFILE_OPTIONS: ProfileOption[] = [
  {
    type: 'investor',
    title: 'Investidor',
    description: 'Private Equity, Venture Capital, Family Office ou investidor institucional buscando oportunidades de M&A.',
    features: [
      'Radar de oportunidades por tese',
      'Matching inteligente (0-100)',
      'Pipeline de deals',
      'Mary AI para análises',
    ],
    icon: <TrendingUp className="h-8 w-8" />,
  },
  {
    type: 'asset',
    title: 'Empresa / Ativo',
    description: 'Empresa buscando vender participação, captar investimento, fusão ou parceria estratégica.',
    features: [
      'Virtual Data Room seguro',
      'Gestão de projetos',
      'Controle de acesso granular',
      'Documentos automatizados',
    ],
    icon: <Building2 className="h-8 w-8" />,
  },
  {
    type: 'advisor',
    title: 'Advisor',
    description: 'Boutique de M&A, Investment Bank, consultoria ou profissional assessorando transações.',
    features: [
      'Gestão de múltiplos projetos',
      'Visão sell-side ou buy-side',
      'Colaboração com clientes',
      'Relatórios e analytics',
    ],
    icon: <Users className="h-8 w-8" />,
  },
]

// Step labels for display
const STEP_LABELS: Record<OnboardingStep, string> = {
  profile_selection: 'Seleção de Perfil',
  cnpj_input: 'Informar CNPJ',
  data_enrichment: 'Enriquecimento de Dados',
  data_confirmation: 'Confirmação de Dados',
  asset_company_data: 'Dados da Empresa',
  asset_matching_data: 'Dados de Matching',
  asset_team: 'Equipe',
  asset_codename: 'Codinome',
  profile_details: 'Detalhes do Perfil',
  eligibility_check: 'Verificação de Elegibilidade',
  terms_acceptance: 'Aceite de Termos',
  mfa_setup: 'Configuração MFA',
  pending_review: 'Aguardando Revisão',
  completed: 'Concluído',
}

// Profile type labels
const PROFILE_LABELS: Record<OrganizationProfile, string> = {
  investor: 'Investidor',
  asset: 'Empresa / Ativo',
  advisor: 'Advisor',
}

// ============================================
// Component
// ============================================

export function ProfileSelector({
  onSelect,
  isLoading: parentLoading = false,
  className,
}: ProfileSelectorProps) {
  const [selectedType, setSelectedType] = React.useState<OrganizationProfile | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [isCheckingExisting, setIsCheckingExisting] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Resume modal state
  const [existingOrg, setExistingOrg] = React.useState<ExistingOrgData | null>(null)
  const [showResumeModal, setShowResumeModal] = React.useState(false)
  const [pendingProfileType, setPendingProfileType] = React.useState<OrganizationProfile | null>(null)

  const isLoading = parentLoading || isCreating || isCheckingExisting

  // Check for existing incomplete onboarding on mount
  React.useEffect(() => {
    const checkExisting = async () => {
      try {
        const result = await checkExistingOnboarding()
        if (result.success && result.data?.hasIncompleteOrg && result.data.organization) {
          setExistingOrg(result.data.organization)
        }
      } catch (err) {
        console.error('Error checking existing onboarding:', err)
      } finally {
        setIsCheckingExisting(false)
      }
    }
    checkExisting()
  }, [])

  const handleSelect = (type: OrganizationProfile) => {
    if (isLoading) return
    setSelectedType(type)
    setError(null)
  }

  const handleContinue = async () => {
    if (!selectedType || isLoading) return

    // If there's an existing incomplete org, show the resume modal
    if (existingOrg) {
      setPendingProfileType(selectedType)
      setShowResumeModal(true)
      return
    }

    // No existing org, proceed normally
    await proceedWithOnboarding(selectedType, false)
  }

  const proceedWithOnboarding = async (profileType: OrganizationProfile, forceNew: boolean) => {
    setIsCreating(true)
    setError(null)
    setShowResumeModal(false)

    try {
      const result = await startOnboarding(profileType, { forceNew })
      
      if (result.success && result.data) {
        onSelect(result.data.orgId, profileType)
      } else {
        setError(result.error || 'Erro ao criar organização. Tente novamente.')
      }
    } catch (err) {
      console.error('Error starting onboarding:', err)
      setError('Erro inesperado. Por favor, tente novamente.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleResumeExisting = () => {
    if (!existingOrg) return
    proceedWithOnboarding(existingOrg.profile_type, false)
  }

  const handleStartNew = () => {
    if (!pendingProfileType) return
    proceedWithOnboarding(pendingProfileType, true)
  }

  // Format CNPJ for display
  const formatCnpjDisplay = (cnpj: string | null): string => {
    if (!cnpj) return 'Não informado'
    const digits = cnpj.replace(/\D/g, '')
    if (digits.length !== 14) return cnpj
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          Qual é o seu perfil?
        </h2>
        <p className="text-muted-foreground">
          Selecione o tipo de conta que melhor descreve você ou sua organização
        </p>
      </div>

      {/* Loading state while checking existing */}
      {isCheckingExisting && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {/* Profile Cards */}
      {!isCheckingExisting && (
        <div className="grid gap-4 md:grid-cols-3">
          {PROFILE_OPTIONS.map((option) => {
            const isSelected = selectedType === option.type
            
            return (
              <button
                key={option.type}
                type="button"
                onClick={() => handleSelect(option.type)}
                disabled={isLoading}
                className={cn(
                  'relative p-6 text-left rounded-lg border-2 transition-all duration-200',
                  'hover:border-primary hover:shadow-md',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:bg-accent/50'
                )}
                aria-pressed={isSelected}
                aria-label={`Selecionar perfil ${option.title}`}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                  </div>
                )}

                {/* Icon */}
                <div 
                  className={cn(
                    'mb-4 p-3 rounded-lg inline-block transition-colors',
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {option.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {option.description}
                </p>

                {/* Features */}
                <ul className="space-y-1.5">
                  {option.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Continue Button */}
      {!isCheckingExisting && (
        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedType || isLoading}
            size="lg"
            className="min-w-[200px]"
          >
            {isCreating ? (
              <>
                <Spinner size="sm" variant="white" className="mr-2" />
                Criando conta...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Helper text */}
      {!isCheckingExisting && (
        <p className="text-center text-xs text-muted-foreground">
          Você poderá criar outras organizações com perfis diferentes no futuro
        </p>
      )}

      {/* Resume Modal */}
      <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Cadastro em andamento
            </DialogTitle>
            <DialogDescription>
              Encontramos um cadastro não finalizado. Deseja continuar de onde parou ou iniciar um novo?
            </DialogDescription>
          </DialogHeader>
          
          {existingOrg && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Organização:</span>
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {existingOrg.name || 'Nova Organização'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CNPJ:</span>
                  <span className="text-sm font-mono">
                    {formatCnpjDisplay(existingOrg.cnpj)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Perfil:</span>
                  <span className="text-sm font-medium">
                    {PROFILE_LABELS[existingOrg.profile_type]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Etapa:</span>
                  <span className="text-sm font-medium">
                    {STEP_LABELS[existingOrg.onboarding_step]}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleStartNew}
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Começar novo
            </Button>
            <Button
              onClick={handleResumeExisting}
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              {isCreating ? (
                <>
                  <Spinner size="sm" variant="white" className="mr-2" />
                  Carregando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Continuar cadastro
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProfileSelector
