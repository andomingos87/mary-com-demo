import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThesisManager } from '@/components/thesis/ThesisManager'
import { listTheses } from '@/lib/actions/thesis'

// ============================================
// Thesis Page (Investor Only)
// ============================================

interface ThesisPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function ThesisPage({ params }: ThesisPageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Get organization and verify it's an investor
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, profile_type, verification_status')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  // Verify this is an investor organization
  if (org.profile_type !== 'investor') {
    redirect(`/${orgSlug}/dashboard`)
  }

  const readOnlyMode = org.verification_status === 'pending'
  const thesesResult = await listTheses(org.id)
  const initialTheses = thesesResult.success && thesesResult.data ? thesesResult.data : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tese"
        description="Defina seus critérios de investimento para encontrar oportunidades relevantes"
      />

      <ThesisManager
        organizationId={org.id}
        readOnlyMode={readOnlyMode}
        initialTheses={initialTheses}
      />

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="O que é uma Tese?"
          description="Uma tese de investimento define os critérios que você busca em uma empresa: setor, tamanho, localização, estágio, etc."
        />
        <InfoCard
          title="Como funciona o Matching?"
          description="A Mary AI analisa empresas cadastradas e identifica aquelas que correspondem às suas teses, gerando um score de compatibilidade."
        />
        <InfoCard
          title="Privacidade Garantida"
          description="Suas teses são confidenciais. Empresas só veem que há interesse quando você decide iniciar contato."
        />
      </div>
    </div>
  )
}

interface InfoCardProps {
  title: string
  description: string
}

function InfoCard({ title, description }: InfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }: ThesisPageProps) {
  const { orgSlug } = await params
  return {
    title: `Tese | ${orgSlug}`,
  }
}
