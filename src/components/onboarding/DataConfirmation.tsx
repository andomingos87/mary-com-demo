'use client'

/**
 * DataConfirmation Component
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Step 3: Display and confirm enriched company data.
 * Allows inline editing, website enrichment, and AI description generation.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Button,
  Input,
  Label,
  Textarea,
  Spinner,
  Skeleton,
  Card,
} from '@/components/ui'
import { ConfidenceIndicator, type ConfidenceLevel } from './ConfidenceIndicator'
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Sparkles,
  Edit2,
  Check,
  X,
  Building2,
  MapPin,
  Linkedin,
  AlertTriangle,
} from 'lucide-react'
import { ShareholderEditor, type Shareholder } from './ShareholderEditor'
import type {
  EnrichedCnpjData,
  EnrichedWebsiteDataResult,
  GeneratedDescriptionResult,
} from '@/types/onboarding'
import {
  enrichFromWebsiteAction,
  generateDescriptionAction,
  confirmOnboardingData,
} from '@/lib/actions/onboarding'
import { isValidUrl, normalizeUrl } from '@/lib/enrichment/jina-reader'

// ============================================
// Types
// ============================================

export interface DataConfirmationProps {
  /** Organization ID */
  organizationId: string
  /** CNPJ enriched data */
  cnpjData: EnrichedCnpjData
  /** Website enriched data (optional) */
  websiteData?: EnrichedWebsiteDataResult
  /** Generated description data (optional) */
  descriptionData?: GeneratedDescriptionResult
  /** Pre-loaded LinkedIn URL from settings (for back navigation restoration) */
  initialLinkedinUrl?: string
  /** Callback when website is enriched */
  onWebsiteEnriched: (data: EnrichedWebsiteDataResult) => void
  /** Callback when description is generated */
  onDescriptionGenerated: (data: GeneratedDescriptionResult) => void
  /** Callback to confirm and proceed */
  onConfirm: () => void
  /** Callback to go back */
  onBack: () => void
  /** Additional CSS classes */
  className?: string
}

interface EditableFieldProps {
  label: string
  value: string
  confidence: ConfidenceLevel
  onSave: (value: string) => void
  multiline?: boolean
}

// ============================================
// Editable Field Component
// ============================================

function EditableField({
  label,
  value,
  confidence,
  onSave,
  multiline = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)

  const handleSave = () => {
    onSave(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            autoFocus
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
          />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            <Check className="h-3 w-3 mr-1" />
            Salvar
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="h-3 w-3 mr-1" />
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-1">
        <Label className="text-muted-foreground text-xs">{label}</Label>
        <ConfidenceIndicator confidence={confidence} size="sm" />
      </div>
      <div className="flex items-start gap-2">
        <p className="flex-1 text-sm">{value || '-'}</p>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
          aria-label={`Editar ${label}`}
        >
          <Edit2 className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}

// ============================================
// Component
// ============================================

export function DataConfirmation({
  organizationId,
  cnpjData,
  websiteData,
  descriptionData,
  initialLinkedinUrl,
  onWebsiteEnriched,
  onDescriptionGenerated,
  onConfirm,
  onBack,
  className,
}: DataConfirmationProps) {
  const [editedData, setEditedData] = React.useState({
    name: cnpjData.nomeFantasia || cnpjData.razaoSocial,
    description: descriptionData?.description || '',
    website: websiteData?.url || '',
    phone: cnpjData.telefone || '',
  })
  const [isEnrichingWebsite, setIsEnrichingWebsite] = React.useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = React.useState(false)
  const [isConfirming, setIsConfirming] = React.useState(false)
  const [websiteUrl, setWebsiteUrl] = React.useState(websiteData?.url || '')
  const [websiteError, setWebsiteError] = React.useState<string | null>(null)

  // TASK-008: LinkedIn URL (restore from settings when navigating back)
  const [linkedinUrl, setLinkedinUrl] = React.useState(initialLinkedinUrl || '')

  // TASK-022/023: Editable shareholders
  const [editedShareholders, setEditedShareholders] = React.useState<Shareholder[]>(
    () => cnpjData.shareholders?.map((s) => ({
      nome: s.nome,
      cpfCnpj: s.cpfCnpj,
      qualificacao: s.qualificacao,
      percentualParticipacao: (s as { percentualParticipacao?: number }).percentualParticipacao,
      dataEntrada: (s as { dataEntrada?: string }).dataEntrada,
      isFromApi: true,
    })) || []
  )

  // Erro de validação de participação societária
  const [shareholderError, setShareholderError] = React.useState<string | null>(null)

  const validateWebsite = () => {
    const trimmed = websiteUrl.trim()
    if (!trimmed) {
      setWebsiteError('Website é obrigatório')
      return false
    }
    if (!isValidUrl(trimmed)) {
      setWebsiteError('Informe um website válido')
      return false
    }
    setWebsiteError(null)
    return true
  }

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWebsiteUrl(value)
    setEditedData(prev => ({ ...prev, website: value }))
    if (websiteError) setWebsiteError(null)
  }

  const handleEnrichWebsite = async () => {
    const trimmed = websiteUrl.trim()
    if (!trimmed || isEnrichingWebsite) return
    if (!isValidUrl(trimmed)) {
      setWebsiteError('Informe um website válido')
      return
    }

    setIsEnrichingWebsite(true)
    try {
      const result = await enrichFromWebsiteAction(organizationId, trimmed)
      if (result.success && result.data) {
        onWebsiteEnriched(result.data)
        setEditedData(prev => ({
          ...prev,
          website: result.data!.url,
        }))
        setWebsiteUrl(result.data!.url)
        setWebsiteError(null)
      }
    } catch (err) {
      console.error('Error enriching website:', err)
    } finally {
      setIsEnrichingWebsite(false)
    }
  }

  const handleGenerateDescription = async () => {
    if (isGeneratingDescription) return

    setIsGeneratingDescription(true)
    try {
      const result = await generateDescriptionAction(organizationId)
      if (result.success && result.data) {
        onDescriptionGenerated(result.data)
        setEditedData(prev => ({
          ...prev,
          description: result.data!.description,
        }))
      }
    } catch (err) {
      console.error('Error generating description:', err)
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleConfirm = async () => {
    if (!validateWebsite()) return

    // Validar participação societária obrigatória para sócios da API
    const shareholdersWithMissingPercentage = editedShareholders.filter(
      (s) => s.isFromApi && (s.percentualParticipacao === undefined || s.percentualParticipacao === null)
    )
    if (shareholdersWithMissingPercentage.length > 0) {
      const count = shareholdersWithMissingPercentage.length
      setShareholderError(
        `Preencha o percentual de participação de ${count === 1 ? '1 sócio' : `${count} sócios`} antes de continuar.`
      )
      return
    }
    setShareholderError(null)

    setIsConfirming(true)
    try {
      const normalizedWebsite = normalizeUrl(websiteUrl.trim())
      const result = await confirmOnboardingData(organizationId, {
        ...editedData,
        website: normalizedWebsite,
        linkedinUrl: linkedinUrl || undefined,
        shareholders: editedShareholders.length > 0 ? editedShareholders : undefined,
      })
      if (result.success) {
        onConfirm()
      }
    } catch (err) {
      console.error('Error confirming data:', err)
    } finally {
      setIsConfirming(false)
    }
  }

  const updateField = (field: keyof typeof editedData) => (value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          Confirme seus dados
        </h2>
        <p className="text-muted-foreground">
          Verifique se as informações estão corretas. Você pode editar se necessário.
        </p>
      </div>

      {/* Company Logo & Name */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        {websiteData?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={websiteData.logoUrl}
            alt="Logo da empresa"
            className="h-16 w-16 rounded-lg object-contain bg-white p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <EditableField
            label="Nome da Empresa"
            value={editedData.name}
            confidence={cnpjData.confidence}
            onSave={updateField('name')}
          />
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Info Section */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Dados da Empresa
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">Razão Social</Label>
              <p className="text-sm">{cnpjData.razaoSocial}</p>
            </div>
            
            <div>
              <Label className="text-muted-foreground text-xs">CNPJ</Label>
              <p className="text-sm font-mono">{cnpjData.cnpj}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-muted-foreground text-xs">CNAE</Label>
                <p className="text-sm">{cnpjData.cnaeCode}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Situação</Label>
                <p className="text-sm">{cnpjData.situacaoCadastral}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">Atividade</Label>
              <p className="text-sm">{cnpjData.cnaeDescription}</p>
            </div>

            <EditableField
              label="Telefone"
              value={editedData.phone}
              confidence={cnpjData.telefone ? 'high' : 'low'}
              onSave={updateField('phone')}
            />
          </div>
        </Card>

        {/* Address Section */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Endereço
          </h3>
          
          <div className="space-y-3 text-sm">
            <p>{cnpjData.address.logradouro}, {cnpjData.address.numero}</p>
            {cnpjData.address.complemento && <p>{cnpjData.address.complemento}</p>}
            <p>{cnpjData.address.bairro}</p>
            <p>{cnpjData.address.cidade} - {cnpjData.address.uf}</p>
            <p>CEP: {cnpjData.address.cep}</p>
          </div>

          <ConfidenceIndicator confidence="high" showLabel size="sm" />
        </Card>

        {/* Shareholders Section - TASK-022/023: CRUD completo */}
        <div className="md:col-span-2">
          <ShareholderEditor
            shareholders={editedShareholders}
            onChange={(shareholders) => {
              setEditedShareholders(shareholders)
              if (shareholderError) setShareholderError(null)
            }}
          />
          {shareholderError && (
            <div className="flex items-center gap-2 text-sm text-destructive mt-2 bg-destructive/5 p-3 rounded-lg border border-destructive/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{shareholderError}</span>
            </div>
          )}
        </div>

        {/* LinkedIn - TASK-008 */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </h3>

          <div className="space-y-2">
            <Input
              placeholder="https://linkedin.com/company/sua-empresa"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Perfil oficial da empresa no LinkedIn (opcional)
            </p>
          </div>
        </Card>

        {/* Website Enrichment */}
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website *
          </h3>
          <p className="text-xs text-muted-foreground -mt-2">
            Informe o website oficial da empresa para concluir esta etapa.
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="https://www.empresa.com.br"
                value={websiteUrl}
                onChange={handleWebsiteChange}
                disabled={isEnrichingWebsite}
                aria-invalid={!!websiteError}
                className={cn(websiteError && 'border-destructive focus-visible:ring-destructive')}
              />
              <Button
                variant="outline"
                onClick={handleEnrichWebsite}
                disabled={!websiteUrl || isEnrichingWebsite}
              >
                {isEnrichingWebsite ? (
                  <Spinner size="sm" />
                ) : (
                  'Buscar'
                )}
              </Button>
            </div>
            {websiteError && (
              <p className="text-xs text-destructive">{websiteError}</p>
            )}

            {websiteData && (
              <div className="text-sm space-y-1">
                {websiteData.title && (
                  <p className="font-medium">{websiteData.title}</p>
                )}
                {websiteData.description && (
                  <p className="text-muted-foreground text-xs line-clamp-2">
                    {websiteData.description}
                  </p>
                )}
                <ConfidenceIndicator
                  confidence={websiteData.confidence}
                  showLabel
                  size="sm"
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Description Section */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Descrição da Empresa
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateDescription}
            disabled={isGeneratingDescription}
          >
            {isGeneratingDescription ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-2" />
                Gerar com IA
              </>
            )}
          </Button>
        </div>

        {isGeneratingDescription ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              placeholder="Descreva sua empresa em poucas palavras..."
              value={editedData.description}
              onChange={(e) => updateField('description')(e.target.value)}
              rows={4}
            />
            {descriptionData && (
              <ConfidenceIndicator
                confidence={descriptionData.confidence}
                showLabel
                size="sm"
              />
            )}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isConfirming}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? (
            <>
              <Spinner size="sm" variant="white" className="mr-2" />
              Confirmando...
            </>
          ) : (
            <>
              Confirmar e Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default DataConfirmation
