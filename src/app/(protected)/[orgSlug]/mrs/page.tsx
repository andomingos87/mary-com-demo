import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { listMrsProjectsByOrgSlug } from '@/lib/actions/readiness'
import { MrsWorkspace } from '@/components/mrs/MrsWorkspace'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MRSPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function MRSPage({ params }: MRSPageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('profile_type')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  if (org.profile_type !== 'asset') {
    redirect(`/${orgSlug}/dashboard`)
  }

  const mrsResult = await listMrsProjectsByOrgSlug(orgSlug)
  const projects = mrsResult.success && mrsResult.data ? mrsResult.data : []

  return (
    <div className="space-y-6">
      <Card className="border-primary/15 shadow-card">
        <CardHeader>
          <CardTitle>Market Readiness Score (MRS)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Roadmap de preparação em passos com score normativo, upload de documentos e gates de NDA/NBO
          conforme a jornada do ativo. Use os cartões abaixo para acompanhar o progresso do seu projeto.
        </CardContent>
      </Card>
      <MrsWorkspace orgSlug={orgSlug} initialProjects={projects} />
    </div>
  )
}
