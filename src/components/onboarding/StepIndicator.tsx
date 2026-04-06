'use client'

/**
 * StepIndicator Component
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Displays a visual progress indicator showing completed, current, and pending steps.
 * Supports both horizontal (desktop) and vertical (mobile) layouts.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { OnboardingStep } from '@/types/database'

export interface StepConfig<TStep extends string = OnboardingStep> {
  id: TStep
  label: string
  description?: string
}

export interface StepIndicatorProps<TStep extends string = OnboardingStep> {
  /** Configuration for each step */
  steps: StepConfig<TStep>[]
  /** The current active step */
  currentStep: TStep
  /** List of completed step IDs */
  completedSteps: TStep[]
  /** Optional callback when a step is clicked (for navigation) */
  onStepClick?: (step: TStep) => void
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Additional CSS classes */
  className?: string
}

export function StepIndicator<TStep extends string = OnboardingStep>({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  orientation = 'horizontal',
  className,
}: StepIndicatorProps<TStep>) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  const completedVisibleCount = steps.filter((step) => completedSteps.includes(step.id)).length

  const getStepStatus = (stepId: TStep, stepIndex: number): 'completed' | 'current' | 'pending' => {
    // Step is completed if it's in completedSteps OR if it comes before the current step
    if (completedSteps.includes(stepId) || (currentIndex >= 0 && stepIndex < currentIndex)) return 'completed'
    if (stepId === currentStep) return 'current'
    return 'pending'
  }
  const progress = currentIndex >= 0 
    ? Math.round(((currentIndex + 1) / steps.length) * 100) 
    : Math.round((completedVisibleCount / Math.max(steps.length, 1)) * 100)

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col space-y-4', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index)
          const isClickable = onStepClick && (status === 'completed' || status === 'current')

          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* Step Number/Check */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                    status === 'completed' && 'border-green-500 bg-green-500 text-white',
                    status === 'current' && 'border-primary bg-primary text-primary-foreground animate-pulse',
                    status === 'pending' && 'border-muted-foreground/30 bg-background text-muted-foreground',
                    isClickable && 'cursor-pointer hover:scale-110',
                    !isClickable && 'cursor-default'
                  )}
                  aria-current={status === 'current' ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.label} - ${status}`}
                >
                  {status === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 h-8 mt-1 transition-colors duration-300',
                      status === 'completed' ? 'bg-green-500' : 'bg-muted-foreground/20'
                    )}
                  />
                )}
              </div>
              
              {/* Step Info */}
              <div className="flex-1 pt-1">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors duration-300',
                    status === 'completed' && 'text-green-600',
                    status === 'current' && 'text-foreground',
                    status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal layout (default)
  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right mt-1">
          {progress}% concluído
        </p>
      </div>

      {/* Step Circles */}
      <div className="relative flex justify-between items-start">
        {/* Connector Lines - positioned behind circles */}
        <div className="absolute top-5 left-0 right-0 flex items-center px-[20px]">
          {steps.slice(0, -1).map((step, index) => {
            const stepStatus = getStepStatus(step.id, index)
            return (
              <div
                key={`connector-${step.id}`}
                className={cn(
                  'h-0.5 flex-1 transition-colors duration-300',
                  stepStatus === 'completed' ? 'bg-green-500' : 'bg-muted'
                )}
              />
            )
          })}
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index)
          const isClickable = onStepClick && (status === 'completed' || status === 'current')

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1"
            >
              {/* Step Circle - centered in column */}
              <div className="flex justify-center mb-2">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 z-10 bg-background',
                    status === 'completed' && 'border-green-500 bg-green-500 text-white',
                    status === 'current' && 'border-primary bg-primary text-primary-foreground shadow-md',
                    status === 'pending' && 'border-muted-foreground/30 bg-background text-muted-foreground',
                    isClickable && 'cursor-pointer hover:scale-110 hover:shadow-lg',
                    !isClickable && 'cursor-default'
                  )}
                  aria-current={status === 'current' ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.label} - ${status}`}
                >
                  {status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </button>
              </div>

              {/* Step Label - centered under circle */}
              <div className="text-center w-full">
                <p
                  className={cn(
                    'text-xs font-medium transition-colors duration-300',
                    status === 'completed' && 'text-green-600',
                    status === 'current' && 'text-foreground',
                    status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepIndicator
