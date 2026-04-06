import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge'
import { ProjectSidebar } from '@/components/projects/ProjectSidebar'
import type { ProjectStatus } from '@/types/database'

// ============================================
// Project Detail Layout
// Provides navigation context for project pages
// ============================================

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ orgSlug: string; codename: string }>
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { orgSlug, codename } = await params
  const supabase = await createClient()

  // Get project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      codename,
      status,
      objective,
      description,
      organization:organizations!projects_organization_id_fkey (
        id,
        name,
        slug,
        profile_type
      )
    `)
    .eq('codename', codename)
    .is('deleted_at', null)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Verify org slug matches
  const org = project.organization as { id: string; name: string; slug: string; profile_type: string } | null
  if (!org || org.slug !== orgSlug) {
    notFound()
  }

  // Allow project detail for orgs operating E4 pipeline (asset + investor).
  if (org.profile_type !== 'asset' && org.profile_type !== 'investor') {
    redirect(`/${orgSlug}/dashboard`)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        {/* Project Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name || project.codename}</h1>
            {project.name && project.codename !== project.name && (
              <p className="text-sm text-muted-foreground font-mono mt-0.5">{project.codename}</p>
            )}
            {project.description && (
              <p className="text-muted-foreground mt-1 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
          <ProjectStatusBadge status={project.status as ProjectStatus} size="lg" />
        </div>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="flex gap-6">
        <ProjectSidebar orgSlug={orgSlug} codename={codename} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }: ProjectLayoutProps) {
  const { orgSlug, codename } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('codename', codename)
    .is('deleted_at', null)
    .single()
  const title = project?.name || codename
  return {
    title: `${title} | Projetos | ${orgSlug}`,
  }
}
