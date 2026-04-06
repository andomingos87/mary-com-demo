'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  useNavigation, 
  useSidebarCollapsed 
} from '@/components/providers/NavigationProvider'
import { useOrganization } from '@/components/providers/OrganizationProvider'
import { OrgSwitcher } from './OrgSwitcher'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { UserMenu } from '@/components/navigation/UserMenu'

// ============================================
// Sidebar Component
// ============================================

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { items, activeItem } = useNavigation()
  const { isCollapsed, toggleCollapsed } = useSidebarCollapsed()
  const { organization, readOnlyMode } = useOrganization()

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
      aria-label="Navegação principal"
    >
      {/* Logo & Org Switcher */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <Image
              src="/logotipo.png"
              alt="Mary"
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Org Switcher */}
      {!isCollapsed && organization && (
        <div className="p-4 border-b border-sidebar-border">
          <OrgSwitcher />
        </div>
      )}

      {/* Read-Only Banner */}
      {readOnlyMode && !isCollapsed && (
        <div className="mx-4 mt-4 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md">
          <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
            Conta em análise
          </p>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto" role="navigation">
        {items.map((item) => {
          const isActive = activeItem === item.id
          const Icon = item.icon

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                item.disabled && 'opacity-50 pointer-events-none',
                isCollapsed && 'justify-center'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={item.disabled}
            >
              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        <UserMenu variant={isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} />
      </div>
    </aside>
  )
}

// ============================================
// Mobile Sidebar
// ============================================

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { items, activeItem } = useNavigation()
  const { organization, readOnlyMode } = useOrganization()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 lg:hidden flex flex-col"
        aria-label="Navegação principal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">Mary</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-sidebar-foreground"
            aria-label="Fechar menu"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Org Switcher */}
        {organization && (
          <div className="p-4 border-b border-sidebar-border">
            <OrgSwitcher />
          </div>
        )}

        {/* Read-Only Banner */}
        {readOnlyMode && (
          <div className="mx-4 mt-4 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
              Conta em análise
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto" role="navigation">
          {items.map((item) => {
            const isActive = activeItem === item.id
            const Icon = item.icon

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                  item.disabled && 'opacity-50 pointer-events-none'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border">
          <UserMenu variant="sidebar-expanded" />
        </div>
      </aside>
    </>
  )
}

// ============================================
// Mobile Menu Button
// ============================================

interface MobileMenuButtonProps {
  onClick: () => void
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden"
      aria-label="Abrir menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
