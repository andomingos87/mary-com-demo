'use client'

/**
 * ConfidenceIndicator Component
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Displays a visual indicator of data confidence level (high/medium/low)
 * with optional label and tooltip explanation.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
import { Check, AlertCircle, HelpCircle } from 'lucide-react'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ConfidenceIndicatorProps {
  /** The confidence level to display */
  confidence: ConfidenceLevel
  /** Whether to show the text label alongside the icon */
  showLabel?: boolean
  /** Size variant */
  size?: 'sm' | 'md'
  /** Additional CSS classes */
  className?: string
}

const CONFIDENCE_CONFIG = {
  high: {
    label: 'Alta confiança',
    description: 'Dado verificado automaticamente',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
  },
  medium: {
    label: 'Média confiança',
    description: 'Verifique se os dados estão corretos',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
  },
  low: {
    label: 'Confirmar dados',
    description: 'Este dado precisa de confirmação manual',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-400',
  },
} as const

const CONFIDENCE_ICONS = {
  high: Check,
  medium: AlertCircle,
  low: HelpCircle,
} as const

export function ConfidenceIndicator({
  confidence,
  showLabel = false,
  size = 'sm',
  className,
}: ConfidenceIndicatorProps) {
  const config = CONFIDENCE_CONFIG[confidence]
  const Icon = CONFIDENCE_ICONS[confidence]

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
  }

  const iconSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
  }

  const content = (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 border',
        config.bgColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={`${config.label}: ${config.description}`}
    >
      <Icon className={cn(iconSizeClasses[size], config.iconColor)} aria-hidden="true" />
      {showLabel && (
        <span className={cn('font-medium', config.color)}>
          {config.label}
        </span>
      )}
    </span>
  )

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className={cn('font-medium', config.color)}>{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ConfidenceIndicator
