'use client'

/**
 * CreateProjectDialog Component
 * Enhanced project creation dialog with:
 * - Project name + auto-generated slug (codename)
 * - AI codename generation (mock)
 * - Objective selection
 * - Responsible contacts (add multiple)
 * - Advisor preference
 */

import * as React from 'react'
import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Sparkles,
  Plus,
  Trash2,
  User,
  CheckCircle2,
} from 'lucide-react'
import type { Project, ProjectObjective } from '@/types/database'
import { PROJECT_OBJECTIVE_LABELS } from '@/types/database'
import type { ProjectContact, AdvisorPreference } from '@/types/projects'
import { PROJECT_OBJECTIVE_DESCRIPTIONS, ADVISOR_PREFERENCE_LABELS, SALE_REASONS, FUNDRAISING_REASONS } from '@/types/projects'
import { createProject, checkCodenameAvailability, lookupUserByEmail } from '@/lib/actions/projects'
import { createProjectInvite } from '@/lib/actions/project-invites'
import { addProjectResponsible } from '@/lib/actions/project-members'
import { generateSlug, generateAICodename } from '@/lib/projects/slug'
import { formatPhoneInput } from '@/lib/utils/phone'
import { formatCurrencyUSD, handleCurrencyChangeUSD, parseCurrency } from '@/lib/format/currency'
import { isValidEmailFormat } from '@/lib/validation/email'

export interface CreateProjectDialogProps {
  /** Organization ID */
  organizationId: string
  /** Whether the dialog is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Callback when project is created successfully */
  onSuccess?: (project: Project) => void
}

const OBJECTIVE_OPTIONS: { value: ProjectObjective; icon: React.ElementType }[] = [
  { value: 'sale', icon: DollarSign },
  { value: 'fundraising', icon: TrendingUp },
]

const EMPTY_CONTACT: ProjectContact = { name: '', role: '', email: '', phone: '' }

export function CreateProjectDialog({
  organizationId,
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectDialogProps) {
  // Form state
  const [name, setName] = useState('')
  const [codename, setCodename] = useState('')
  const [codenameManuallyEdited, setCodenameManuallyEdited] = useState(false)
  const [objective, setObjective] = useState<ProjectObjective | ''>('')
  const [contacts, setContacts] = useState<ProjectContact[]>([{ ...EMPTY_CONTACT }])
  const [advisorPreference, setAdvisorPreference] = useState<AdvisorPreference | ''>('')
  const [valueMinUsd, setValueMinUsd] = useState<number | undefined>(undefined)
  const [valueMaxUsd, setValueMaxUsd] = useState<number | undefined>(undefined)
  const [valueMinDisplay, setValueMinDisplay] = useState('')
  const [valueMaxDisplay, setValueMaxDisplay] = useState('')
  const [equityMinPct, setEquityMinPct] = useState<string>('')
  const [equityMaxPct, setEquityMaxPct] = useState<string>('')
  const [reason, setReason] = useState<string>('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingCodename, setIsCheckingCodename] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [codenameStatus, setCodenameStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle')
  const [codenameSuggestion, setCodenameSuggestion] = useState<string | null>(null)
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({})
  const [advisorEmail, setAdvisorEmail] = useState('')
  const [advisorLookupStatus, setAdvisorLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle')
  const [advisorDisplayName, setAdvisorDisplayName] = useState<string | undefined>(undefined)

  // Reset form
  const resetForm = useCallback(() => {
    setName('')
    setCodename('')
    setCodenameManuallyEdited(false)
    setObjective('')
    setContacts([{ ...EMPTY_CONTACT }])
    setAdvisorPreference('')
    setValueMinUsd(undefined)
    setValueMaxUsd(undefined)
    setValueMinDisplay('')
    setValueMaxDisplay('')
    setEquityMinPct('')
    setEquityMaxPct('')
    setReason('')
    setError(null)
    setCodenameStatus('idle')
    setCodenameSuggestion(null)
    setEmailErrors({})
    setAdvisorEmail('')
    setAdvisorLookupStatus('idle')
    setAdvisorDisplayName(undefined)
  }, [])

  // Handle close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm()
      onOpenChange(false)
    }
  }, [isSubmitting, resetForm, onOpenChange])

  // Auto-generate slug from name
  useEffect(() => {
    if (!codenameManuallyEdited && name.trim()) {
      const slug = generateSlug(name)
      setCodename(slug)
    }
  }, [name, codenameManuallyEdited])

  // Check codename availability with debounce
  useEffect(() => {
    if (!codename || codename.length < 3) {
      setCodenameStatus('idle')
      setCodenameSuggestion(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsCheckingCodename(true)
      const result = await checkCodenameAvailability(organizationId, codename)
      setIsCheckingCodename(false)

      if (result.success && result.data) {
        if (result.data.available) {
          setCodenameStatus('available')
          setCodenameSuggestion(null)
        } else {
          setCodenameStatus('taken')
          setCodenameSuggestion(result.data.suggestion || null)
        }
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [codename, organizationId])

  // Debounced advisor email lookup
  useEffect(() => {
    if (advisorPreference !== 'has_advisor' || !advisorEmail.trim()) {
      setAdvisorLookupStatus('idle')
      setAdvisorDisplayName(undefined)
      return
    }

    if (!isValidEmailFormat(advisorEmail.trim())) {
      setAdvisorLookupStatus('idle')
      return
    }

    const timer = setTimeout(async () => {
      setAdvisorLookupStatus('loading')
      const result = await lookupUserByEmail(advisorEmail.trim())
      if (result.success && result.data) {
        if (result.data.exists) {
          setAdvisorLookupStatus('found')
          setAdvisorDisplayName(result.data.displayName)
        } else {
          setAdvisorLookupStatus('not_found')
          setAdvisorDisplayName(undefined)
        }
      } else {
        setAdvisorLookupStatus('idle')
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [advisorEmail, advisorPreference])

  // Generate AI project name (codename auto-derives from name)
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true)
    try {
      const aiName = await generateAICodename(name || 'project')
      setName(aiName)
      setCodenameManuallyEdited(false)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Handle codename manual edit
  const handleCodenameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-_]/g, '')
    setCodename(sanitized)
    setCodenameManuallyEdited(true)
  }

  // Contact management
  const addContact = () => {
    setContacts(prev => [...prev, { ...EMPTY_CONTACT }])
  }

  const removeContact = (index: number) => {
    setContacts(prev => prev.filter((_, i) => i !== index))
  }

  const updateContact = (index: number, field: keyof ProjectContact, value: string) => {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  // Apply suggestion
  const applySuggestion = () => {
    if (codenameSuggestion) {
      setCodename(codenameSuggestion)
      setCodenameManuallyEdited(true)
      setCodenameStatus('idle')
      setCodenameSuggestion(null)
    }
  }

  // Validate contacts (at least the first must have name and email)
  const validateContacts = (): boolean => {
    const validContacts = contacts.filter(c => c.name.trim() && c.email.trim())
    return validContacts.length > 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validations
    if (!name.trim()) {
      setError('Nome do projeto é obrigatório')
      return
    }
    if (!codename.trim() || codename.length < 3) {
      setError('Codename é obrigatório (mínimo 3 caracteres)')
      return
    }
    if (!objective) {
      setError('Selecione um objetivo')
      return
    }
    if (codenameStatus === 'taken') {
      setError('Codename já está em uso. Escolha outro ou use a sugestão.')
      return
    }
    // Validate value range
    const parsedMinUsd = valueMinUsd
    const parsedMaxUsd = valueMaxUsd
    if (parsedMinUsd && parsedMaxUsd && parsedMinUsd > parsedMaxUsd) {
      setError('Valor mínimo não pode ser maior que o valor máximo')
      return
    }
    // Validate equity range (fundraising only)
    const parsedEquityMin = equityMinPct ? Number(equityMinPct) : undefined
    const parsedEquityMax = equityMaxPct ? Number(equityMaxPct) : undefined
    if (parsedEquityMin && parsedEquityMax && parsedEquityMin > parsedEquityMax) {
      setError('Equity mínimo não pode ser maior que o equity máximo')
      return
    }
    if (!validateContacts()) {
      setError('Adicione pelo menos um responsável com nome e email')
      return
    }
    if (!advisorPreference) {
      setError('Selecione uma opção de advisor')
      return
    }

    // Validate email format for contacts
    const newEmailErrors: Record<number, string> = {}
    contacts.forEach((c, i) => {
      if (c.email.trim() && !isValidEmailFormat(c.email.trim())) {
        newEmailErrors[i] = 'Formato de email inválido'
      }
    })
    setEmailErrors(newEmailErrors)
    if (Object.keys(newEmailErrors).length > 0) {
      setError('Corrija os emails inválidos antes de continuar')
      return
    }

    setIsSubmitting(true)

    // Filter out empty contacts
    const validContacts = contacts.filter(c => c.name.trim() || c.email.trim())

    const result = await createProject({
      organizationId,
      name: name.trim(),
      codename: codename.trim(),
      objective,
      contacts: validContacts,
      advisorPreference: advisorPreference as AdvisorPreference,
      advisorEmail: advisorPreference === 'has_advisor' && advisorEmail.trim() ? advisorEmail.trim() : undefined,
      valueMinUsd: parsedMinUsd,
      valueMaxUsd: parsedMaxUsd,
      equityMinPct: objective === 'fundraising' ? parsedEquityMin : undefined,
      equityMaxPct: objective === 'fundraising' ? parsedEquityMax : undefined,
      reason: reason || undefined,
    })

    setIsSubmitting(false)

    if (result.success && result.data) {
      // Auto-add contacts as project responsibles (non-blocking)
      for (const c of validContacts) {
        if (c.email.trim()) {
          addProjectResponsible(
            result.data.id,
            c.email.trim(),
            c.role.trim() || undefined,  // cargo
            c.phone.replace(/\D/g, '') || undefined  // telefone (remove formatação)
          ).catch((err) =>
            console.error('Failed to add responsible:', err)
          )
        }
      }
      // Invite advisor if email provided
      if (advisorPreference === 'has_advisor' && advisorEmail.trim()) {
        createProjectInvite(result.data.id, advisorEmail.trim(), 'manager').catch((err) =>
          console.error('Failed to invite advisor:', err)
        )
      }
      onSuccess?.(result.data)
      resetForm()
      onOpenChange(false)
    } else {
      setError(result.error || 'Erro ao criar projeto')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto M&A para sua organização.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ================================================ */}
          {/* 1. Project Name */}
          {/* ================================================ */}
          <div className="space-y-2">
            <Label htmlFor="project-name">
              Nome do Projeto <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="project-name"
                placeholder="Ex: Venda da TechCorp Brasil"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                maxLength={200}
                autoFocus
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleGenerateAI}
                disabled={isSubmitting || isGeneratingAI}
                className="shrink-0"
                title="Gerar nome com IA"
              >
                {isGeneratingAI ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Gerar com IA
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Nome real do projeto. Um codename será gerado automaticamente para uso na URL.
            </p>
          </div>

          {/* ================================================ */}
          {/* 2. Codename (auto-generated slug + AI option) */}
          {/* ================================================ */}
          <div className="space-y-2">
            <Label htmlFor="codename">
              Codename <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="codename"
                placeholder="gerado-automaticamente"
                value={codename}
                onChange={(e) => handleCodenameChange(e.target.value)}
                disabled={isSubmitting}
                className={cn(
                  codenameStatus === 'taken' && 'border-destructive',
                  codenameStatus === 'available' && 'border-green-500'
                )}
                maxLength={50}
              />
              {isCheckingCodename && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {codenameStatus === 'available' && !isCheckingCodename && (
                <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
              )}
            </div>

            {codenameStatus === 'taken' && (
              <p className="text-sm text-destructive">
                Este codename já está em uso.
                {codenameSuggestion && (
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="ml-2 text-primary underline hover:no-underline"
                  >
                    Usar {codenameSuggestion}
                  </button>
                )}
              </p>
            )}
            {codenameStatus === 'available' && (
              <p className="text-sm text-green-600">Codename disponível</p>
            )}
            <p className="text-xs text-muted-foreground">
              Identificador único usado na URL. Letras minúsculas, números e hifens.
            </p>
          </div>

          <Separator />

          {/* ================================================ */}
          {/* 3. Objective */}
          {/* ================================================ */}
          <div className="space-y-2">
            <Label htmlFor="objective">
              Objetivo do Projeto <span className="text-destructive">*</span>
            </Label>
            <Select
              value={objective}
              onValueChange={(value) => {
                setObjective(value as ProjectObjective)
                setReason('')
                if (value !== 'fundraising') {
                  setEquityMinPct('')
                  setEquityMaxPct('')
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="objective">
                <SelectValue placeholder="Selecione o objetivo" />
              </SelectTrigger>
              <SelectContent>
                {OBJECTIVE_OPTIONS.map(({ value, icon: Icon }) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div>
                        <span className="font-medium">{PROJECT_OBJECTIVE_LABELS[value]}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {PROJECT_OBJECTIVE_DESCRIPTIONS[value]}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ================================================ */}
          {/* 3b. Dynamic fields based on objective */}
          {/* ================================================ */}
          {objective && (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              {/* Value range (both objectives) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="value-min" className="text-xs">Valor Mínimo (USD)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USD</span>
                    <Input
                      id="value-min"
                      type="text"
                      inputMode="numeric"
                      value={valueMinDisplay}
                      onChange={(e) => {
                        const display = handleCurrencyChangeUSD(e.target.value, setValueMinUsd)
                        setValueMinDisplay(display)
                      }}
                      disabled={isSubmitting}
                      className="pl-12 h-9"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="value-max" className="text-xs">Valor Máximo (USD)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USD</span>
                    <Input
                      id="value-max"
                      type="text"
                      inputMode="numeric"
                      value={valueMaxDisplay}
                      onChange={(e) => {
                        const display = handleCurrencyChangeUSD(e.target.value, setValueMaxUsd)
                        setValueMaxDisplay(display)
                      }}
                      disabled={isSubmitting}
                      className="pl-12 h-9"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Equity range (fundraising only) */}
              {objective === 'fundraising' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="equity-min" className="text-xs">Equity Mínimo (%)</Label>
                    <div className="relative">
                      <Input
                        id="equity-min"
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={equityMinPct}
                        onChange={(e) => setEquityMinPct(e.target.value)}
                        disabled={isSubmitting}
                        className="pr-8 h-9"
                        placeholder="0"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="equity-max" className="text-xs">Equity Máximo (%)</Label>
                    <div className="relative">
                      <Input
                        id="equity-max"
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={equityMaxPct}
                        onChange={(e) => setEquityMaxPct(e.target.value)}
                        disabled={isSubmitting}
                        className="pr-8 h-9"
                        placeholder="0"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason select */}
              <div className="space-y-1.5">
                <Label htmlFor="reason" className="text-xs">Motivo</Label>
                <Select
                  value={reason}
                  onValueChange={setReason}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="reason" className="h-9">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(objective === 'sale' ? SALE_REASONS : FUNDRAISING_REASONS).map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Separator />

          {/* ================================================ */}
          {/* 4. Responsible Contacts */}
          {/* ================================================ */}
          <div className="space-y-3">
            <Label>
              Responsável <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Adicione os contatos responsáveis pelo projeto.
            </p>

            {contacts.map((contact, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    Responsável {contacts.length > 1 ? `#${index + 1}` : ''}
                  </div>
                  {contacts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContact(index)}
                      disabled={isSubmitting}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`contact-name-${index}`} className="text-xs">
                      Nome <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`contact-name-${index}`}
                      placeholder="Nome completo"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      disabled={isSubmitting}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`contact-role-${index}`} className="text-xs">
                      Cargo
                    </Label>
                    <Input
                      id={`contact-role-${index}`}
                      placeholder="Ex: CEO, CFO, Diretor"
                      value={contact.role}
                      onChange={(e) => updateContact(index, 'role', e.target.value)}
                      disabled={isSubmitting}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`contact-email-${index}`} className="text-xs">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`contact-email-${index}`}
                      type="email"
                      placeholder="email@empresa.com"
                      value={contact.email}
                      onChange={(e) => {
                        updateContact(index, 'email', e.target.value)
                        if (emailErrors[index]) {
                          setEmailErrors(prev => { const next = { ...prev }; delete next[index]; return next })
                        }
                      }}
                      disabled={isSubmitting}
                      className={cn('h-9', emailErrors[index] && 'border-destructive')}
                    />
                    {emailErrors[index] && (
                      <p className="text-xs text-destructive">{emailErrors[index]}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`contact-phone-${index}`} className="text-xs">
                      Telefone
                    </Label>
                    <Input
                      id={`contact-phone-${index}`}
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', formatPhoneInput(e.target.value))}
                      disabled={isSubmitting}
                      className="h-9"
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addContact}
              disabled={isSubmitting}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar mais um responsável
            </Button>
          </div>

          <Separator />

          {/* ================================================ */}
          {/* 5. Advisor Preference */}
          {/* ================================================ */}
          <div className="space-y-3">
            <Label>
              Advisor <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={advisorPreference}
              onValueChange={(value) => setAdvisorPreference(value as AdvisorPreference)}
              disabled={isSubmitting}
              className="space-y-2"
            >
              {(Object.entries(ADVISOR_PREFERENCE_LABELS) as [AdvisorPreference, string][]).map(
                ([value, label]) => (
                  <label
                    key={value}
                    htmlFor={`advisor-${value}`}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors',
                      advisorPreference === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <RadioGroupItem value={value} id={`advisor-${value}`} />
                    <span className="text-sm">{label}</span>
                  </label>
                )
              )}
            </RadioGroup>

            {/* Advisor email field (conditional) */}
            {advisorPreference === 'has_advisor' && (
              <div className="mt-3 space-y-2 rounded-lg border bg-muted/30 p-4">
                <Label htmlFor="advisor-email" className="text-xs">
                  Email do Advisor
                </Label>
                <div className="relative">
                  <Input
                    id="advisor-email"
                    type="email"
                    placeholder="advisor@empresa.com"
                    value={advisorEmail}
                    onChange={(e) => setAdvisorEmail(e.target.value)}
                    disabled={isSubmitting}
                    className={cn(
                      'h-9',
                      advisorLookupStatus === 'found' && 'border-green-500',
                    )}
                  />
                  {advisorLookupStatus === 'loading' && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                  {advisorLookupStatus === 'found' && (
                    <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                  )}
                </div>
                {advisorLookupStatus === 'found' && (
                  <p className="text-xs text-green-600">
                    Usuário encontrado{advisorDisplayName ? `: ${advisorDisplayName}` : ''}. Será convidado como gerente do projeto.
                  </p>
                )}
                {advisorLookupStatus === 'not_found' && advisorEmail.trim() && isValidEmailFormat(advisorEmail.trim()) && (
                  <p className="text-xs text-muted-foreground">
                    Usuário não encontrado na plataforma. Um convite externo será enviado por email.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ================================================ */}
          {/* Footer */}
          {/* ================================================ */}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || codenameStatus === 'taken'}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Projeto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateProjectDialog
