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
      <Card>
        <CardHeader>
          <CardTitle>Modulo MRS</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Jornada canônica em 4 passos com score e gates de NDA/NBO.
        </CardContent>
      </Card>
      <MrsWorkspace orgSlug={orgSlug} initialProjects={projects} />
    </div>
  )
}
