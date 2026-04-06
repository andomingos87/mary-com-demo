import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has any organizations
  const adminSupabase = await createAdminClient();
  
  const { data: memberships } = await adminSupabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      organizations (
        id,
        slug,
        name,
        profile_type,
        onboarding_step,
        verification_status,
        created_at
      )
    `)
    .eq('user_id', user.id);

  // If user has organizations, redirect to the appropriate dashboard
  if (memberships && memberships.length > 0) {
    // Filter and sort organizations: prioritize completed onboarding, then most recent
    const orgsWithData = memberships
      .filter(m => m.organizations)
      .map(m => m.organizations as {
        id: string;
        slug: string;
        name: string;
        profile_type: string;
        onboarding_step: string;
        verification_status: string;
        created_at: string;
      })
      .sort((a, b) => {
        // Prioritize completed orgs
        const aComplete = a.onboarding_step === 'completed' || a.onboarding_step === 'pending_review';
        const bComplete = b.onboarding_step === 'completed' || b.onboarding_step === 'pending_review';
        
        if (aComplete && !bComplete) return -1;
        if (!aComplete && bComplete) return 1;
        
        // Then sort by most recent
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

    const primaryOrg = orgsWithData[0];
    
    if (primaryOrg) {
      // Check if onboarding is complete
      const onboardingComplete = primaryOrg.onboarding_step === 'completed' || primaryOrg.onboarding_step === 'pending_review';
      
      if (!onboardingComplete) {
        // Redirect to onboarding
        redirect('/onboarding');
      }
      
      // Redirect to organization dashboard
      if (primaryOrg.profile_type === 'advisor') {
        redirect('/advisor/dashboard');
      } else {
        redirect(`/${primaryOrg.slug}/dashboard`);
      }
    }
  }

  // No organizations - redirect to onboarding to create one
  redirect('/onboarding');
  
  // Note: This return is technically unreachable due to redirect() above
  // but TypeScript requires it. The JSX below will never be rendered.
}
