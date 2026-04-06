import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNavigationContext, getUserOrganizationsList } from '@/lib/actions/navigation'
import { OrganizationProvider } from '@/components/providers/OrganizationProvider'
import { NavigationProvider } from '@/components/providers/NavigationProvider'

// ============================================
// Advisor Layout
// Handles advisor-specific context and validation
// ============================================

interface AdvisorLayoutProps {
  children: React.ReactNode
}

export default async function AdvisorLayout({ children }: AdvisorLayoutProps) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user's organizations
  const orgsResult = await getUserOrganizationsList()
  const organizations = orgsResult.success ? orgsResult.data || [] : []

  // Find advisor organization
  const advisorOrg = organizations.find(org => org.profile_type === 'advisor')

  if (!advisorOrg) {
    // User doesn't have an advisor organization
    redirect('/dashboard')
  }

  // Get navigation context for advisor org
  const navContextResult = await getNavigationContext(advisorOrg.organization_slug)
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
        profileType="advisor"
        orgSlug={advisorOrg.organization_slug}
      >
        {children}
      </NavigationProvider>
    </OrganizationProvider>
  )
}

// ============================================
// Metadata
// ============================================

export const metadata = {
  title: 'Advisor | Mary',
}
