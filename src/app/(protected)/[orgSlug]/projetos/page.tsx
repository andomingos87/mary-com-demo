import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PipelinePage from '../pipeline/page'
import ProjectsPage from '../projects/page'

interface ProjetosPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function ProjetosPage({ params }: ProjetosPageProps) {
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

  if (org.profile_type === 'investor') {
    return <PipelinePage params={params} />
  }

  if (org.profile_type === 'asset') {
    return <ProjectsPage />
  }

  redirect(`/${orgSlug}/dashboard`)
}
