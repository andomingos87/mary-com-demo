'use client'

/**
 * TermsAcceptance Component
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Step 6: Final step for accepting terms and completing onboarding.
 * Requires acceptance of Terms of Service, Privacy Policy, and Data Processing Agreement.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Button,
  Spinner,
  Checkbox,
  Card,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import {
  ArrowLeft,
  Check,
  FileText,
  Shield,
  Database,
  ExternalLink,
  PartyPopper,
} from 'lucide-react'
import { acceptTerms, completeOnboarding } from '@/lib/actions/onboarding'

// ============================================
// Types
// ============================================

export interface TermsAcceptanceProps {
  /** Organization ID */
  organizationId: string
  /** Callback when onboarding is completed */
  onComplete: () => void
  /** Callback to go back */
  onBack: () => void
  /** Additional CSS classes */
  className?: string
}

interface TermItem {
  id: 'termsOfService' | 'privacyPolicy' | 'dataProcessing'
  title: string
  description: string
  icon: React.ReactNode
  link: string
}

// ============================================
// Constants
// ============================================

const TERMS: TermItem[] = [
  {
    id: 'termsOfService',
    title: 'Termos de Serviço',
    description: 'Li e concordo com os termos de uso da plataforma Mary',
    icon: <FileText className="h-5 w-5" />,
    link: '/terms',
  },
  {
    id: 'privacyPolicy',
    title: 'Política de Privacidade',
    description: 'Li e concordo com a política de privacidade',
    icon: <Shield className="h-5 w-5" />,
    link: '/privacy',
  },
  {
    id: 'dataProcessing',
    title: 'Tratamento de Dados (LGPD)',
    description: 'Autorizo o tratamento dos meus dados conforme a LGPD',
    icon: <Database className="h-5 w-5" />,
    link: '/privacy#tratamento-dados',
  },
]

// ============================================
// Component
// ============================================

export function TermsAcceptance({
  organizationId,
  onComplete,
  onBack,
  className,
}: TermsAcceptanceProps) {
  const [acceptedTerms, setAcceptedTerms] = React.useState({
    termsOfService: false,
    privacyPolicy: false,
    dataProcessing: false,
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isCompletingFinal, setIsCompletingFinal] = React.useState(false)
  const [showCompletionModal, setShowCompletionModal] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const allAccepted = Object.values(acceptedTerms).every(Boolean)

  const toggleTerm = (termId: keyof typeof acceptedTerms) => {
    setAcceptedTerms(prev => ({
      ...prev,
      [termId]: !prev[termId],
    }))
    setError(null)
  }

  const handleSubmit = async () => {
    if (!allAccepted) {
      setError('Você precisa aceitar todos os termos para continuar.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Primeiro registra o aceite dos termos.
      // A conclusao final do onboarding e disparada apenas no CTA do modal.
      const termsResult = await acceptTerms(organizationId, acceptedTerms)
      
      if (!termsResult.success) {
        setError(termsResult.error || 'Erro ao aceitar termos.')
        setIsSubmitting(false)
        return
      }
      setShowCompletionModal(true)
    } catch (err) {
      console.error('Error completing onboarding:', err)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewMRS = async () => {
    setIsCompletingFinal(true)
    setError(null)

    try {
      const completeResult = await completeOnboarding(organizationId)
      if (!completeResult.success) {
        setError(completeResult.error || 'Erro ao finalizar cadastro.')
        return
      }
      onComplete()
    } catch (err) {
      console.error('Error finalizing onboarding after terms acceptance:', err)
      setError('Erro inesperado ao concluir onboarding.')
    } finally {
      setIsCompletingFinal(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          Termos e Condições
        </h2>
        <p className="text-muted-foreground">
          Por favor, leia e aceite os termos para finalizar seu cadastro
        </p>
      </div>

      {/* Terms List */}
      <div className="space-y-4 max-w-lg mx-auto">
        {TERMS.map((term) => {
          const isAccepted = acceptedTerms[term.id]
          
          return (
            <Card
              key={term.id}
              className={cn(
                'p-4 transition-all duration-200 cursor-pointer',
                isAccepted && 'ring-2 ring-primary bg-primary/5'
              )}
              onClick={() => toggleTerm(term.id)}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'p-2 rounded-lg transition-colors',
                  isAccepted ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  {term.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{term.title}</h3>
                    <a
                      href={term.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary hover:underline"
                      aria-label={`Abrir ${term.title} em nova aba`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {term.description}
                  </p>
                </div>

                <div
                  className="flex-shrink-0 pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isAccepted}
                    onCheckedChange={() => toggleTerm(term.id)}
                    aria-label={`Aceitar ${term.title}`}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Accept All */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setAcceptedTerms({
              termsOfService: true,
              privacyPolicy: true,
              dataProcessing: true,
            })
          }}
          disabled={allAccepted}
        >
          <Check className="h-4 w-4 mr-2" />
          Aceitar todos
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info */}
      <p className="text-xs text-center text-muted-foreground max-w-md mx-auto">
        Ao aceitar os termos, você concorda com as condições de uso da plataforma 
        e autoriza o tratamento dos seus dados conforme nossa política de privacidade.
      </p>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!allAccepted || isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" variant="white" className="mr-2" />
              Finalizando...
            </>
          ) : (
            <>
              Finalizar Cadastro
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto mb-2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <PartyPopper className="h-7 w-7 text-primary animate-bounce" />
            </div>
            <DialogTitle className="text-center">Parabéns! Cadastro finalizado</DialogTitle>
            <DialogDescription className="text-center">
              Cadastro finalizado com sucesso. Seu projeto foi configurado e protegido na Mary. Agora você já pode acessar e ver seu Market Readiness Score (MRS).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" className="w-full" onClick={handleViewMRS} disabled={isCompletingFinal}>
              {isCompletingFinal ? 'Finalizando...' : 'Ver meu MRS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TermsAcceptance
