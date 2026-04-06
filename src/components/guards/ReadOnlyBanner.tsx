'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useReadOnlyMode } from '@/components/providers/OrganizationProvider'
import { Clock, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ============================================
// Read Only Banner Component
// Shows when organization is pending verification
// ============================================

interface ReadOnlyBannerProps {
  className?: string
  dismissible?: boolean
}

export function ReadOnlyBanner({ className, dismissible = false }: ReadOnlyBannerProps) {
  const readOnlyMode = useReadOnlyMode()
  const [dismissed, setDismissed] = React.useState(false)

  if (!readOnlyMode || dismissed) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-yellow-100 dark:bg-yellow-900/20 border-b border-yellow-300 dark:border-yellow-700',
        className
      )}
      role="alert"
    >
      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Conta em análise
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          Sua conta está sendo verificada. Algumas ações estão temporariamente desabilitadas.
        </p>
      </div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 dark:text-yellow-400 dark:hover:text-yellow-200 dark:hover:bg-yellow-800/30"
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// ============================================
// Feature Gate Component
// Disables children when in read-only mode
// ============================================

interface FeatureGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showTooltip?: boolean
  tooltipMessage?: string
}

export function FeatureGate({
  children,
  fallback,
  showTooltip = true,
  tooltipMessage = 'Esta ação está desabilitada enquanto sua conta está em análise',
}: FeatureGateProps) {
  const readOnlyMode = useReadOnlyMode()

  if (!readOnlyMode) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  // Wrap children in a disabled state
  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {tooltipMessage}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  )
}

// ============================================
// Inline Read Only Indicator
// Small indicator for specific elements
// ============================================

interface ReadOnlyIndicatorProps {
  className?: string
}

export function ReadOnlyIndicator({ className }: ReadOnlyIndicatorProps) {
  const readOnlyMode = useReadOnlyMode()

  if (!readOnlyMode) {
    return null
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/30 rounded-full',
        className
      )}
    >
      <AlertCircle className="h-3 w-3" />
      Em análise
    </span>
  )
}
