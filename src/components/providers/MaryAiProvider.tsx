'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useOrganization } from '@/components/providers/OrganizationProvider'
import type { OrganizationProfile } from '@/types/database'

interface MaryAiContextValue {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
  currentPage: string
  currentProfile: OrganizationProfile | null
  projectCodename?: string
  showFirstGreeting: boolean
  consumeFirstGreeting: () => void
}

const MaryAiContext = createContext<MaryAiContextValue | null>(null)

interface MaryAiProviderProps {
  children: React.ReactNode
}

function extractProjectCodename(pathname: string): string | undefined {
  const match = pathname.match(/^\/[^/]+\/projects\/([^/?#]+)/)
  if (!match) return undefined

  const codename = match[1]?.trim()
  if (!codename) return undefined

  return decodeURIComponent(codename)
}

function extractOrganizationScopeFromPathname(pathname: string): string | undefined {
  const [, orgSlug] = pathname.split('/')
  const trimmed = orgSlug?.trim()
  if (!trimmed) return undefined
  return decodeURIComponent(trimmed)
}

export function MaryAiProvider({ children }: MaryAiProviderProps) {
  const pathname = usePathname()
  const { organization } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)
  const [showFirstGreeting, setShowFirstGreeting] = useState(false)

  const organizationScope = extractOrganizationScopeFromPathname(pathname) || organization?.id || organization?.slug || 'global'
  const greetingStorageKey = `mary_ai_first_greeting_seen:${organizationScope}`

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasSeenGreeting = window.sessionStorage.getItem(greetingStorageKey) === '1'
    setShowFirstGreeting(!hasSeenGreeting)
  }, [greetingStorageKey])

  const consumeFirstGreeting = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(greetingStorageKey, '1')
    }
    setShowFirstGreeting(false)
  }, [greetingStorageKey])

  const value = useMemo<MaryAiContextValue>(() => {
    return {
      isOpen,
      toggle: () => setIsOpen((prev) => !prev),
      setOpen: (open) => setIsOpen(open),
      currentPage: pathname,
      currentProfile: organization?.profileType ?? null,
      projectCodename: extractProjectCodename(pathname),
      showFirstGreeting,
      consumeFirstGreeting,
    }
  }, [isOpen, organization?.profileType, pathname, showFirstGreeting, consumeFirstGreeting])

  return <MaryAiContext.Provider value={value}>{children}</MaryAiContext.Provider>
}

export function useMaryAi(): MaryAiContextValue {
  const context = useContext(MaryAiContext)

  if (!context) {
    throw new Error('useMaryAi must be used within a MaryAiProvider')
  }

  return context
}

export function useMaryAiToggle() {
  const { isOpen, toggle, setOpen } = useMaryAi()
  return { isOpen, toggle, setOpen }
}
