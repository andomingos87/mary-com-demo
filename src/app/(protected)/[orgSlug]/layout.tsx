import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNavigationContext, getUserOrganizationsList } from '@/lib/actions/navigation'
import { OrganizationProvider } from '@/components/providers/OrganizationProvider'
import { NavigationProvider } from '@/components/providers/NavigationProvider'

// ============================================
// Dynamic Organization Layout
// Handles org-specific context and validation
// ============================================

interface OrgLayoutProps {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Get full navigation context
  const navContextResult = await getNavigationContext(orgSlug)
  if (!navContextResult.success || !navContextResult.data) {
    if (navContextResult.error === 'Não autenticado') {
      redirect('/login')
    }
    notFound()
  }

  const navContext = navContextResult.data

  // Gate onboarding outside middleware using shared navigation context.
  if (!navContext.onboardingComplete && navContext.organization.onboardingStep !== 'pending_review') {
    redirect('/onboarding')
  }

  // Get all organizations for switcher
  const orgsResult = await getUserOrganizationsList()
  const organizations = orgsResult.success ? orgsResult.data || [] : []

  return (
    <OrganizationProvider
      initialContext={navContext}
      initialOrganizations={organizations}
      initialUser={user}
    >
      <NavigationProvider
        profileType={navContext.organization.profileType}
        orgSlug={orgSlug}
      >
        {children}
      </NavigationProvider>
    </OrganizationProvider>
  )
}

// ============================================
// Generate Metadata
// ============================================

export async function generateMetadata({ params }: OrgLayoutProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('slug', orgSlug)
    .single()

  return {
    title: org?.name ? `${org.name} | Mary` : 'Mary',
  }
}
