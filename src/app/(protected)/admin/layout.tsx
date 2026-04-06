import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ============================================
// Admin Layout
// Requires owner role for access
// ============================================

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check if user is owner of any organization (admin access)
  const { data: ownerMemberships, error: ownerError } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .limit(1)

  if (ownerError || !ownerMemberships || ownerMemberships.length === 0) {
    // Not an owner - redirect to dashboard
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}

// ============================================
// Metadata
// ============================================

export const metadata = {
  title: 'Admin | Mary',
}
