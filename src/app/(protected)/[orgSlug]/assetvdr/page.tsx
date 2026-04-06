import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileBox, ArrowRight, FolderOpen } from 'lucide-react'
import Link from 'next/link'

interface AssetVdrPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function AssetVdrPage({ params }: AssetVdrPageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Get organization and verify it's an asset
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, profile_type, verification_status')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  // Verify this is an asset organization
  if (org.profile_type !== 'asset') {
    redirect(`/${orgSlug}/dashboard`)
  }

  // Get projects for this organization
  const { data: projects } = await supabase
    .from('projects')
    .select('id, codename, status, description')
    .eq('organization_id', org.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // If only one project, redirect directly to its VDR
  if (projects && projects.length === 1) {
    redirect(`/${orgSlug}/projects/${projects[0].codename}/vdr`)
  }

  // If no projects, show create project prompt
  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Virtual Data Room"
          description="Organize e compartilhe documentos de forma segura com investidores"
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <FileBox className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum projeto encontrado
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Crie um projeto para começar a organizar documentos no VDR.
            </p>
            <Button asChild>
              <Link href={`/${orgSlug}/projects`}>
                Criar Projeto
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Multiple projects - show selector
  return (
    <div className="space-y-6">
      <PageHeader
        title="Virtual Data Room"
        description="Selecione um projeto para acessar o VDR"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/${orgSlug}/projects/${project.codename}/vdr`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{project.codename}</CardTitle>
                    <CardDescription className="text-xs">
                      Status: {project.status}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {project.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: AssetVdrPageProps) {
  const { orgSlug } = await params
  return {
    title: `VDR | ${orgSlug}`,
  }
}
