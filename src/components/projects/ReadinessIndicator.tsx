'use client'

/**
 * ReadinessIndicator Component
 * Phase 4.4 - UI Components
 *
 * Displays the Readiness Score with progress bar and optional checklist.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import type { ReadinessChecklistItem } from '@/types/projects'
import { MATCHING_READY_THRESHOLD } from '@/types/projects'

export interface ReadinessIndicatorProps {
  /** Readiness score (0-100) */
  score: number
  /** L2+ coverage percentage */
  l2PlusCoverage: number
  /** Optional checklist items */
  checklist?: ReadinessChecklistItem[]
  /** Whether to show detailed checklist */
  showDetails?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

const SIZE_CONFIG = {
  sm: {
    progressHeight: 'h-1.5',
    textSize: 'text-xs',
    iconSize: 'h-3 w-3',
  },
  md: {
    progressHeight: 'h-2',
    textSize: 'text-sm',
    iconSize: 'h-4 w-4',
  },
  lg: {
    progressHeight: 'h-3',
    textSize: 'text-base',
    iconSize: 'h-5 w-5',
  },
} as const

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

export function ReadinessIndicator({
  score,
  l2PlusCoverage,
  checklist,
  showDetails = false,
  size = 'md',
  className,
}: ReadinessIndicatorProps) {
  const config = SIZE_CONFIG[size]
  const isMatchingReady = l2PlusCoverage >= MATCHING_READY_THRESHOLD
  const completedItems = checklist?.filter(item => item.isComplete).length ?? 0
  const totalItems = checklist?.length ?? 0

  const scoreDisplay = (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 min-w-[60px]">
        <div className={cn('relative', config.progressHeight, 'w-full overflow-hidden rounded-full bg-secondary')}>
          <div
            className={cn('h-full transition-all duration-300', getProgressColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <span className={cn('font-semibold tabular-nums', config.textSize, getScoreColor(score))}>
        {score}%
      </span>
    </div>
  )

  // Simple display without details
  if (!showDetails) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-default">{scoreDisplay}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">Readiness Score: {score}%</p>
              <p className="text-xs text-muted-foreground">
                Cobertura L2+: {l2PlusCoverage}%
                {isMatchingReady ? ' (Pronto para Matching)' : ''}
              </p>
              {totalItems > 0 && (
                <p className="text-xs text-muted-foreground">
                  {completedItems}/{totalItems} itens completos
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Detailed display with checklist
  return (
    <div className={cn('space-y-4', className)}>
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Readiness Score</h4>
          <p className="text-xs text-muted-foreground">
            {completedItems}/{totalItems} itens completos
          </p>
        </div>
        <div className="text-right">
          <span className={cn('text-2xl font-bold tabular-nums', getScoreColor(score))}>
            {score}%
          </span>
          {isMatchingReady ? (
            <p className="text-xs text-green-600 flex items-center justify-end gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Pronto para Matching
            </p>
          ) : (
            <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
              <AlertCircle className="h-3 w-3" />
              L2+ necessario: {MATCHING_READY_THRESHOLD}%
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn('h-full transition-all duration-500', getProgressColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>L2+ Coverage: {l2PlusCoverage}%</span>
          <span>{score >= 100 ? 'Completo' : `${100 - score}% restante`}</span>
        </div>
      </div>

      {/* Checklist */}
      {checklist && checklist.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">Checklist</h5>
          <ul className="space-y-1">
            {checklist.map((item) => (
              <li
                key={item.field}
                className={cn(
                  'flex items-center gap-2 text-sm py-1 px-2 rounded',
                  item.isComplete ? 'text-green-700 bg-green-50' : 'text-muted-foreground'
                )}
              >
                {item.isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <span className="flex-1">{item.label}</span>
                <span className="text-xs">
                  L{item.requiredLevel}
                  {item.currentLevel !== undefined && item.currentLevel > 0 && (
                    <span className="text-green-600 ml-1">(L{item.currentLevel})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ReadinessIndicator
