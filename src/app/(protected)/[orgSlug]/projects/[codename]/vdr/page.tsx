import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { VdrPageClient } from './VdrPageClient'
import { 
  listFolders, 
  listDocumentsWithCounts, 
  getVdrStats, 
  initializeDefaultFolders,
  initializeDefaultDocuments,
} from '@/lib/actions/vdr'

interface VdrPageProps {
  params: Promise<{ orgSlug: string; codename: string }>
  searchParams: Promise<{ folder?: string }>
}

export default async function VdrPage({ params, searchParams }: VdrPageProps) {
  const { orgSlug, codename } = await params
  const { folder: selectedFolderSlug } = await searchParams
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get organization from URL (this is the user's current org context)
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, profile_type, verification_status')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  // Get project by codename - try org-owned first, then check for external access
  let project: { id: string; codename: string; status: string; organization_id: string } | null = null
  let isExternalAccess = false

  // First, try to find project owned by this org
  const { data: ownedProject } = await supabase
    .from('projects')
    .select('id, codename, status, organization_id')
    .eq('organization_id', org.id)
    .eq('codename', codename)
    .is('deleted_at', null)
    .single()

  if (ownedProject) {
    project = ownedProject
  } else {
    // Project not owned by this org - check if user has external VDR access
    // This handles investors who have been granted access to another org's project
    const { data: externalProject } = await supabase
      .from('projects')
      .select('id, codename, status, organization_id')
      .eq('codename', codename)
      .is('deleted_at', null)
      .single()

    if (externalProject) {
      // Check if user has VDR access to this project
      const { data: hasAccess } = await supabase.rpc('has_vdr_access', {
        p_user_id: user.id,
        p_project_id: externalProject.id,
      })

      if (hasAccess) {
        project = externalProject
        isExternalAccess = true
      }
    }
  }

  if (!project) {
    notFound()
  }

  // Get user's role in project's organization (for N3 validation)
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', project.organization_id)
    .eq('user_id', user.id)
    .single()

  const userRole = (membership?.role ?? null) as 'owner' | 'admin' | 'member' | 'viewer' | null

  // Check if user can manage VDR (owner/admin or sell-side advisor)
  const { data: canManage } = await supabase.rpc('can_manage_vdr', {
    p_user_id: user.id,
    p_project_id: project.id,
  })

  // Get folders
  let foldersResult = await listFolders(project.id)

  // Initialize default folders if none exist
  if (foldersResult.success && (!foldersResult.data || foldersResult.data.length === 0)) {
    await initializeDefaultFolders(project.id)
    foldersResult = await listFolders(project.id)
  }

  const folders = foldersResult.data || []

  // Initialize default documents if none exist (32 items template)
  const documentsResult = await listDocumentsWithCounts(project.id)
  let documents = documentsResult.data || []

  if (documents.length === 0 && folders.length > 0 && canManage) {
    await initializeDefaultDocuments(project.id)
    const newDocsResult = await listDocumentsWithCounts(project.id)
    documents = newDocsResult.data || []
  }

  // Get VDR stats
  const statsResult = await getVdrStats(project.id)
  const stats = statsResult.data

  // Get organization members for responsible dropdown
  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      user_id,
      user_profiles:user_id(id, full_name, email)
    `)
    .eq('organization_id', project.organization_id)

  const responsibles = (members || [])
    .filter(m => m.user_profiles)
    .map(m => {
      const profile = m.user_profiles as any
      return {
        id: profile.id,
        name: profile.full_name || profile.email || 'Usuário',
      }
    })

  // Get unique business units from existing documents
  const businessUnits = Array.from(new Set(
    documents
      .map(d => d.business_unit)
      .filter((bu): bu is string => !!bu)
  ))

  // Get unique tags from existing documents
  const availableTags = Array.from(new Set(
    documents.flatMap(d => d.tags || [])
  ))

  const readOnlyMode = !canManage

  // Determine user profile type
  const userProfile = org.profile_type as 'asset' | 'advisor' | 'investor' | null

  return (
    <VdrPageClient
      orgSlug={orgSlug}
      codename={codename}
      projectId={project.id}
      folders={folders}
      documents={documents}
      stats={stats}
      responsibles={responsibles}
      businessUnits={businessUnits}
      availableTags={availableTags}
      userProfile={userProfile}
      userRole={userRole}
      readOnlyMode={readOnlyMode}
      isExternalAccess={isExternalAccess}
    />
  )
}

export async function generateMetadata({ params }: VdrPageProps) {
  const { orgSlug, codename } = await params
  return {
    title: `VDR - ${codename} | ${orgSlug}`,
  }
}
