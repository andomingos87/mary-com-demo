'use client'

import React, { useLayoutEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar, MobileSidebar, MobileMenuButton } from '@/components/navigation/Sidebar'
import { Header } from '@/components/navigation/Header'
import { BreadcrumbBar } from '@/components/navigation/BreadcrumbBar'
import { MaryAiSidebar } from '@/components/mary-ai/MaryAiSidebar'
import { MaryAiQuickChatSheet } from '@/components/mary-ai/MaryAiQuickChatSheet'
import { MaryAiEntryFallback } from '@/components/mary-ai/MaryAiEntryFallback'
import { useMaryAiToggle } from '@/components/providers/MaryAiProvider'
import { cn } from '@/lib/utils'

// ============================================
// Protected Layout Client Component
// Handles the responsive layout with sidebar
// ============================================

interface ProtectedLayoutClientProps {
  children: React.ReactNode
}

export function ProtectedLayoutClient({ children }: ProtectedLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isOpen, setOpen } = useMaryAiToggle()
  const pathname = usePathname()
  const hideHeader = /\/validacao-epicos(?:\/|$)/.test(pathname)
  const [isPushMaryMode, setIsPushMaryMode] = useState(false)

  // useLayoutEffect: definir push/sheet antes da pintura para não montar MaryAiQuickChatSheet
  // no desktop (evita segunda instância de MaryAiChatContent gravando [welcome] no sessionStorage).
  useLayoutEffect(() => {
    const updateMode = () => {
      setIsPushMaryMode(window.innerWidth >= 1024)
    }

    updateMode()
    window.addEventListener('resize', updateMode)
    return () => window.removeEventListener('resize', updateMode)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className={cn('flex min-w-0 flex-1 flex-col overflow-hidden transition-smooth')}>
        {/* Header */}
        {!hideHeader && (
          <>
            <Header
              mobileMenuButton={
                <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
              }
            />
            <div className="border-b border-border px-4 py-2 lg:px-6">
              <BreadcrumbBar />
            </div>
          </>
        )}

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          role="main"
          aria-label="Conteúdo principal"
        >
          {/* Skip Link Target */}
          <a id="main-content" className="sr-only focus:not-sr-only" tabIndex={-1}>
            Início do conteúdo principal
          </a>

          {children}
        </main>
      </div>

      {/* Desktop Mary AI Sidebar (push layout) */}
      {isPushMaryMode && (
        <div
          className={cn(
            'flex h-full flex-shrink-0 overflow-hidden transition-smooth',
            isOpen ? 'w-96 border-l border-border' : 'w-0 border-l-0'
          )}
          aria-hidden={!isOpen}
        >
          <div className={cn('h-full w-96', !isOpen && 'pointer-events-none opacity-0')}>
            <MaryAiSidebar />
          </div>
        </div>
      )}

      {/* Mobile and tablet fallback */}
      {!isPushMaryMode && <MaryAiQuickChatSheet open={isOpen} onOpenChange={setOpen} />}

      {hideHeader && <MaryAiEntryFallback />}
    </div>
  )
}
