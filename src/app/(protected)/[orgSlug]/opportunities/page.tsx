import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

// ============================================
// Opportunities Page (Investor Only)
// ============================================

interface OpportunitiesPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function OpportunitiesPage({ params }: OpportunitiesPageProps) {
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

  redirect(`/${orgSlug}/radar`)
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }: OpportunitiesPageProps) {
  const { orgSlug } = await params
  return {
    title: `Redirecionando para Radar | ${orgSlug}`,
  }
}
