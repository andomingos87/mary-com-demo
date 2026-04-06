import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { InvestorDashboard } from '@/components/dashboard/InvestorDashboard'
import { AssetDashboard } from '@/components/dashboard/AssetDashboard'
import type { OrganizationProfile } from '@/types/database'

// ============================================
// Dashboard Page
// Renders profile-specific dashboard
// ============================================

interface DashboardPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Get organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, profile_type, verification_status, onboarding_step')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  const profileType = org.profile_type as OrganizationProfile
  const readOnlyMode = org.verification_status === 'pending'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Bem-vindo ao painel da ${org.name}`}
      />

      {/* Profile-specific dashboard */}
      {profileType === 'investor' && (
        <InvestorDashboard
          orgId={org.id}
          orgName={org.name}
          readOnlyMode={readOnlyMode}
        />
      )}

      {profileType === 'asset' && (
        <AssetDashboard
          orgId={org.id}
          orgName={org.name}
          readOnlyMode={readOnlyMode}
        />
      )}

      {profileType === 'advisor' && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Dashboard do Advisor em construção.</p>
          <p className="text-sm mt-2">Acesse /advisor/dashboard para o painel de advisor.</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }: DashboardPageProps) {
  const { orgSlug } = await params
  return {
    title: `Dashboard | ${orgSlug}`,
  }
}
