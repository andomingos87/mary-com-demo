import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { SettingsWorkspace } from '@/components/settings/SettingsWorkspace'

// ============================================
// Settings Page (All Profiles)
// ============================================

interface SettingsPageProps {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ tab?: string }>
}

type SettingsMetadataProps = {
  params: Promise<{ orgSlug: string }>
}

export default async function SettingsPage({ params, searchParams }: SettingsPageProps) {
  const { orgSlug } = await params
  const { tab } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    notFound()
  }

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, profile_type, verification_status')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single()

  const isOwnerOrAdmin = membership?.role === 'owner' || membership?.role === 'admin'
  const isOwner = membership?.role === 'owner'
  const readOnlyMode = org.verification_status === 'pending'

  const { count: membersCount } = await supabase
    .from('organization_members')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', org.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie conta, faturamento e equipe da organização. A Mary AI no topo ajuda com dúvidas nesta área."
      />

      <SettingsWorkspace
        variant="org"
        orgDisplayName={org.name}
        membersCount={membersCount || 0}
        currentUserEmail={user.email || ''}
        membershipRole={membership?.role || 'member'}
        isOwnerOrAdmin={isOwnerOrAdmin}
        isOwner={isOwner}
        readOnlyMode={readOnlyMode}
        defaultTab={tab}
      />
    </div>
  )
}

export async function generateMetadata({ params }: SettingsMetadataProps) {
  const { orgSlug } = await params
  return {
    title: `Configurações | ${orgSlug}`,
  }
}
