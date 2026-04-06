import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNavigationContext, getUserOrganizationsList } from '@/lib/actions/navigation'
import { OrganizationProvider } from '@/components/providers/OrganizationProvider'
import { NavigationProvider } from '@/components/providers/NavigationProvider'
import { MaryAiProvider } from '@/components/providers/MaryAiProvider'
import { ProtectedLayoutClient } from './ProtectedLayoutClient'

// ============================================
// Protected Layout
// Server Component that handles auth and data fetching
// ============================================

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user's organizations
  const orgsResult = await getUserOrganizationsList()
  const organizations = orgsResult.success ? orgsResult.data || [] : []

  // If no organizations, redirect to onboarding
  if (organizations.length === 0) {
    redirect('/onboarding')
  }

  // Get first organization's context for initial render
  const firstOrg = organizations[0]
  const navContextResult = await getNavigationContext(firstOrg.organization_slug)
  const navContext = navContextResult.success ? navContextResult.data : null

  // Check if onboarding is complete
  if (navContext && !navContext.onboardingComplete && navContext.organization.onboardingStep !== 'pending_review') {
    redirect('/onboarding')
  }

  return (
    <OrganizationProvider
      initialContext={navContext}
      initialOrganizations={organizations}
      initialUser={user}
    >
      <NavigationProvider
        profileType={navContext?.organization.profileType || null}
        orgSlug={navContext?.organization.slug || null}
      >
        <MaryAiProvider>
          <ProtectedLayoutClient>
            {children}
          </ProtectedLayoutClient>
        </MaryAiProvider>
      </NavigationProvider>
    </OrganizationProvider>
  )
}
