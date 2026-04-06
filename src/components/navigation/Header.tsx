'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/components/providers/OrganizationProvider'
import { useMaryAiToggle } from '@/components/providers/MaryAiProvider'
import { Bot, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
export { PageHeader } from '@/components/navigation/PageHeader'

// ============================================
// Header Component
// ============================================

interface HeaderProps {
  title?: string
  actions?: React.ReactNode
  className?: string
  mobileMenuButton?: React.ReactNode
}

export function Header({ title, actions, className, mobileMenuButton }: HeaderProps) {
  const { readOnlyMode } = useOrganization()
  const { isOpen, toggle } = useMaryAiToggle()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-background border-b border-border',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        {/* Mobile Menu Button */}
        {mobileMenuButton}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Read-Only Indicator (Mobile) */}
        {readOnlyMode && (
          <span className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/20 rounded-md">
            Em análise
          </span>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          onClick={toggle}
          aria-label={isOpen ? 'Fechar Mary AI' : 'Abrir Mary AI'}
          aria-expanded={isOpen}
        >
          <Bot className="h-4 w-4" aria-hidden="true" />
          Mary AI
          <ChevronDown className={cn('h-4 w-4 transition-smooth', isOpen && 'rotate-180')} aria-hidden="true" />
        </Button>

        {/* Custom Actions */}
        {actions}
      </div>
    </header>
  )
}

// ============================================
// Section Header Component
// ============================================

interface SectionHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions}
    </div>
  )
}
