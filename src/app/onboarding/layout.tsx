/**
 * Onboarding Layout
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Clean layout without sidebar for the onboarding flow.
 */

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/LogoutButton'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logotipo.png"
              alt="Mary"
              width={80}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {user.email}
            </div>
            <LogoutButton
              iconOnly
              variant="ghost"
              useSidebarStyles={false}
              className="h-8 w-8"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Mary M&A. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/legal/terms" className="hover:underline">
              Termos de Uso
            </Link>
            <Link href="/legal/privacy" className="hover:underline">
              Privacidade
            </Link>
            <Link href="/support" className="hover:underline">
              Suporte
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
