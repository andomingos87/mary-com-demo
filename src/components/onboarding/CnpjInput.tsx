'use client'

/**
 * CnpjInput Component
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Step 2: CNPJ input with mask, validation, and data enrichment.
 * Integrates with BrasilAPI to fetch company data.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { 
  Button, 
  Input, 
  Label, 
  Spinner,
  Alert,
  AlertDescription,
  Skeleton,
} from '@/components/ui'
import { ArrowLeft, ArrowRight, Search, Building2, AlertCircle } from 'lucide-react'
import type { EnrichedCnpjData } from '@/types/onboarding'
import { enrichFromCnpjAction } from '@/lib/actions/onboarding'

// ============================================
// Types
// ============================================

export interface CnpjInputProps {
  /** Organization ID for the current onboarding */
  organizationId: string
  /** Callback when CNPJ data is enriched */
  onEnriched: (data: EnrichedCnpjData) => void
  /** Callback to go back to previous step */
  onBack: () => void
  /** Additional CSS classes */
  className?: string
}

// ============================================
// CNPJ Utilities
// ============================================

function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

function validateCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return false
  
  // Check for known invalid patterns
  if (/^(\d)\1{13}$/.test(digits)) return false
  
  // Validate check digits
  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (parseInt(digits[12]) !== checkDigit) return false
  
  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (parseInt(digits[13]) !== checkDigit) return false
  
  return true
}

// ============================================
// Component
// ============================================

export function CnpjInput({
  organizationId,
  onEnriched,
  onBack,
  className,
}: CnpjInputProps) {
  const [cnpj, setCnpj] = React.useState('')
  const [isSearching, setIsSearching] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [previewData, setPreviewData] = React.useState<EnrichedCnpjData | null>(null)
  
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const cleanCnpj = cnpj.replace(/\D/g, '')
  const isValidFormat = cleanCnpj.length === 14
  const isValid = isValidFormat && validateCnpj(cnpj)

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpj(e.target.value)
    setCnpj(formatted)
    setError(null)
    setPreviewData(null)
  }

  const handleSearch = async () => {
    if (!isValid || isSearching) return

    setIsSearching(true)
    setError(null)
    setPreviewData(null)

    try {
      const result = await enrichFromCnpjAction(organizationId, cleanCnpj)
      
      if (result.success && result.data) {
        setPreviewData(result.data)
      } else {
        setError(result.error || 'CNPJ não encontrado. Verifique o número e tente novamente.')
      }
    } catch (err) {
      console.error('Error enriching CNPJ:', err)
      setError('Erro ao buscar dados. Por favor, tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleContinue = () => {
    if (previewData) {
      onEnriched(previewData)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !isSearching) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          Informe seu CNPJ
        </h2>
        <p className="text-muted-foreground">
          Vamos buscar automaticamente os dados da Receita Federal
        </p>
      </div>

      {/* CNPJ Input */}
      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <div className="relative">
            <Input
              ref={inputRef}
              id="cnpj"
              type="text"
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={handleCnpjChange}
              onKeyDown={handleKeyDown}
              disabled={isSearching}
              className={cn(
                'pr-12 text-lg font-mono',
                isValidFormat && !isValid && 'border-destructive focus:ring-destructive'
              )}
              aria-describedby="cnpj-hint"
            />
            {isValidFormat && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValid ? (
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            )}
          </div>
          <p id="cnpj-hint" className="text-xs text-muted-foreground">
            {isValidFormat && !isValid 
              ? 'CNPJ inválido. Verifique os dígitos.'
              : 'Digite o CNPJ da empresa (14 dígitos)'
            }
          </p>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={!isValid || isSearching}
          className="w-full"
          variant={previewData ? 'secondary' : 'default'}
        >
          {isSearching ? (
            <>
              <Spinner size="sm" variant="white" className="mr-2" />
              Buscando dados...
            </>
          ) : previewData ? (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar novamente
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar dados
            </>
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview Data */}
      {isSearching && (
        <div className="max-w-md mx-auto space-y-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      )}

      {previewData && !isSearching && (
        <div className="max-w-md mx-auto p-4 bg-muted/50 rounded-lg border space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {previewData.nomeFantasia || previewData.razaoSocial}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {previewData.razaoSocial}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">CNAE</p>
              <p className="font-medium">{previewData.cnaeCode}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Situação</p>
              <p className="font-medium">{previewData.situacaoCadastral}</p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {previewData.cnaeDescription}
          </p>

          {previewData.cvm?.isRegistered && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Registrado na CVM como {previewData.cvm.participantType}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isSearching}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={!previewData || isSearching}
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default CnpjInput
