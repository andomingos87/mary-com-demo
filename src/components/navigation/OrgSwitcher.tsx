'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/components/providers/OrganizationProvider'
import { Button } from '@/components/ui/button'
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Briefcase,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { OrganizationProfile } from '@/types/database'

// ============================================
// Profile Icons
// ============================================

const PROFILE_ICONS: Record<OrganizationProfile, React.ElementType> = {
  investor: TrendingUp,
  asset: Building2,
  advisor: Briefcase,
}

const PROFILE_LABELS: Record<OrganizationProfile, string> = {
  investor: 'Investidor',
  asset: 'Empresa',
  advisor: 'Advisor',
}

// ============================================
// OrgSwitcher Component
// ============================================

interface OrgSwitcherProps {
  className?: string
}

export function OrgSwitcher({ className }: OrgSwitcherProps) {
  const { organization, organizations, switchOrganization } = useOrganization()
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape
  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  if (!organization) return null

  const ProfileIcon = PROFILE_ICONS[organization.profileType]
  const hasMultipleOrgs = organizations.length > 1

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-between px-3 py-2 h-auto',
          'text-sidebar-foreground hover:bg-sidebar-accent'
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3 min-w-0">
          {organization.logoUrl ? (
            <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={organization.logoUrl}
                alt={organization.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-sidebar-accent rounded-md flex items-center justify-center">
              <ProfileIcon className="h-4 w-4 text-sidebar-foreground" />
            </div>
          )}
          <div className="flex flex-col items-start min-w-0">
            <span className="font-medium text-sm truncate max-w-[140px]">
              {organization.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {PROFILE_LABELS[organization.profileType]}
            </span>
          </div>
        </div>
        {hasMultipleOrgs && (
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && hasMultipleOrgs && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md z-50 py-1"
          role="listbox"
          aria-label="Selecionar organização"
        >
          {organizations.map((org) => {
            const OrgIcon = PROFILE_ICONS[org.profile_type as OrganizationProfile] || Building2
            const isSelected = org.organization_slug === organization.slug

            return (
              <button
                key={org.organization_id}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left',
                  'hover:bg-accent transition-colors',
                  isSelected && 'bg-accent'
                )}
                onClick={() => {
                  if (!isSelected) {
                    switchOrganization(org.organization_slug)
                  }
                  setIsOpen(false)
                }}
                role="option"
                aria-selected={isSelected}
              >
                <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                  <OrgIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">
                    {org.organization_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {PROFILE_LABELS[org.profile_type as OrganizationProfile] || org.profile_type}
                  </span>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>
            )
          })}

          {/* Create New Org */}
          <div className="border-t border-border mt-1 pt-1">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors text-muted-foreground"
              onClick={() => {
                setIsOpen(false)
                // Navigate to create org page
                window.location.href = '/onboarding'
              }}
            >
              <div className="w-8 h-8 border border-dashed border-muted-foreground rounded-md flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-sm">Nova organização</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Compact Org Badge
// ============================================

interface OrgBadgeProps {
  className?: string
}

export function OrgBadge({ className }: OrgBadgeProps) {
  const { organization } = useOrganization()

  if (!organization) return null

  const ProfileIcon = PROFILE_ICONS[organization.profileType]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {organization.logoUrl ? (
        <div className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0">
          <Image
            src={organization.logoUrl}
            alt={organization.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
          <ProfileIcon className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
      <span className="text-sm font-medium truncate max-w-[120px]">
        {organization.name}
      </span>
    </div>
  )
}
