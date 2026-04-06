'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { VdrDocumentWithCounts, VdrValidationLevel } from '@/types/vdr'

interface ValidationInfo {
  validated: boolean
  validatedAt: string | null
  validatedByName: string | null
}

interface VdrValidationCheckboxesProps {
  document: Pick<VdrDocumentWithCounts, 
    'id' | 
    'validation_n1' | 'validation_n1_at' | 'validation_n1_by_name' |
    'validation_n2' | 'validation_n2_at' | 'validation_n2_by_name' |
    'validation_n3' | 'validation_n3_at' | 'validation_n3_by_name'
  >
  userProfile: 'asset' | 'advisor' | 'investor' | null
  userRole?: 'owner' | 'admin' | 'member' | 'viewer' | null
  onValidate?: (documentId: string, level: VdrValidationLevel, checked: boolean) => Promise<void>
  disabled?: boolean
  className?: string
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ValidationCheckbox({
  level,
  label,
  info,
  canValidate,
  disabled,
  onToggle,
}: {
  level: VdrValidationLevel
  label: string
  info: ValidationInfo
  canValidate: boolean
  disabled?: boolean
  onToggle: (checked: boolean) => void
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = async (checked: boolean) => {
    setIsLoading(true)
    try {
      await onToggle(checked)
    } finally {
      setIsLoading(false)
    }
  }

  const checkboxContent = (
    <div className="flex items-center gap-1">
      <Checkbox
        checked={info.validated}
        onCheckedChange={handleChange}
        disabled={disabled || !canValidate || isLoading}
        className={cn(
          'h-4 w-4',
          info.validated && 'bg-green-500 border-green-500 data-[state=checked]:bg-green-500',
          !canValidate && 'opacity-50 cursor-not-allowed'
        )}
      />
      <span className={cn(
        'text-xs',
        info.validated ? 'text-green-700 font-medium' : 'text-gray-500'
      )}>
        {label}
      </span>
    </div>
  )

  // Show tooltip only if validated
  if (info.validated && (info.validatedAt || info.validatedByName)) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {checkboxContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            {info.validatedByName && (
              <div>Validado por: <strong>{info.validatedByName}</strong></div>
            )}
            {info.validatedAt && (
              <div>Em: {formatDate(info.validatedAt)}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  // Show tooltip for permission info if user can't validate
  if (!canValidate) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {checkboxContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {level === 'n1' && 'Apenas membros do asset podem validar N1'}
          {level === 'n2' && 'Apenas advisors podem validar N2'}
          {level === 'n3' && 'Apenas owner/admin da organização podem validar N3'}
        </TooltipContent>
      </Tooltip>
    )
  }

  return checkboxContent
}

export function VdrValidationCheckboxes({
  document,
  userProfile,
  userRole,
  onValidate,
  disabled,
  className,
}: VdrValidationCheckboxesProps) {
  // Determine which levels the user can validate based on their profile and role
  const canValidateN1 = userProfile === 'asset'
  const canValidateN2 = userProfile === 'advisor'
  const canValidateN3 = userRole === 'owner' || userRole === 'admin'

  const handleToggle = async (level: VdrValidationLevel, checked: boolean) => {
    if (onValidate) {
      await onValidate(document.id, level, checked)
    }
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ValidationCheckbox
        level="n1"
        label="N1"
        info={{
          validated: document.validation_n1 ?? false,
          validatedAt: document.validation_n1_at ?? null,
          validatedByName: document.validation_n1_by_name ?? null,
        }}
        canValidate={canValidateN1}
        disabled={disabled}
        onToggle={(checked) => handleToggle('n1', checked)}
      />
      <ValidationCheckbox
        level="n2"
        label="N2"
        info={{
          validated: document.validation_n2 ?? false,
          validatedAt: document.validation_n2_at ?? null,
          validatedByName: document.validation_n2_by_name ?? null,
        }}
        canValidate={canValidateN2}
        disabled={disabled}
        onToggle={(checked) => handleToggle('n2', checked)}
      />
      <ValidationCheckbox
        level="n3"
        label="N3"
        info={{
          validated: document.validation_n3 ?? false,
          validatedAt: document.validation_n3_at ?? null,
          validatedByName: document.validation_n3_by_name ?? null,
        }}
        canValidate={canValidateN3}
        disabled={disabled}
        onToggle={(checked) => handleToggle('n3', checked)}
      />
    </div>
  )
}
