import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ProjectsPage from '../projects/page'

interface ProjetoPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function ProjetoPage({ params }: ProjetoPageProps) {
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

  return <ProjectsPage />
}
