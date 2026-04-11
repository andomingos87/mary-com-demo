import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { SettingsWorkspace } from '@/components/settings/SettingsWorkspace'

// ============================================
// Advisor Settings Page
// ============================================

interface AdvisorSettingsPageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdvisorSettingsPage({ searchParams }: AdvisorSettingsPageProps) {
  const { tab } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie conta, faturamento e equipe. A Mary AI no topo ajuda com dúvidas nesta área."
      />

      <SettingsWorkspace variant="advisor" defaultTab={tab} />
    </div>
  )
}

export const metadata = {
  title: 'Configurações | Advisor',
}
