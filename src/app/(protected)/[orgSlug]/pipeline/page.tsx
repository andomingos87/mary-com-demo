import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { PipelineBoard } from '@/components/projects/PipelineBoard'
import type { ProjectStatus } from '@/types/database'

// ============================================
// Pipeline Page (Investor Only)
// ============================================

interface PipelinePageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function PipelinePage({ params }: PipelinePageProps) {
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
  const { data: projects } = await supabase
    .from('projects')
    .select('id, codename, status')
    .eq('organization_id', org.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  const normalizedProjects = (projects ?? []).map((project) => ({
    id: project.id,
    codename: project.codename,
    status: project.status as ProjectStatus,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Pipeline" description="Acompanhe o progresso dos seus projetos de M&A" />
      <PipelineBoard orgSlug={orgSlug} initialProjects={normalizedProjects} readOnlyMode={readOnlyMode} />
    </div>
  )
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }: PipelinePageProps) {
  const { orgSlug } = await params
  return {
    title: `Pipeline | ${orgSlug}`,
  }
}
