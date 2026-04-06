/**
 * Onboarding Entry Page
 * Phase 3.4 - Frontend: Wizard de Onboarding
 *
 * Checks if user needs onboarding and redirects accordingly.
 * 
 * Updated for Profile Selection on Landing:
 * - New users have profile_type set at signup, start at cnpj_input
 * - Legacy users without profile_type go to profile-selection
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has any incomplete organizations
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, onboarding_step, profile_type')
    .eq('created_by', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (organizations && organizations.length > 0) {
    // Check if any org has incomplete onboarding
    const incompleteOrgs = organizations.filter(
      org => org.onboarding_step !== 'completed' && org.onboarding_step !== 'pending_review'
    )

    if (incompleteOrgs.length > 0) {
      // Prefer organizations with profile_type set (new flow) over legacy orgs
      const incompleteOrg = incompleteOrgs.find((org) => !!org.profile_type) || incompleteOrgs[0]
      const isInvestor = incompleteOrg.profile_type === 'investor'

      // Backward compatibility: if org doesn't have profile_type, go to profile-selection
      if (!incompleteOrg.profile_type) {
        redirect('/onboarding/profile-selection')
      }

      // Resume the incomplete onboarding at current step
      const stepSlugMap: Record<string, string> = {
        'profile_selection': 'profile-selection',
        'cnpj_input': 'cnpj-input',
        'data_enrichment': 'data-enrichment',
        'data_confirmation': 'data-confirmation',
        'asset_company_data': 'asset-company-data',
        'asset_matching_data': 'asset-matching-data',
        'asset_team': 'asset-team',
        'asset_codename': 'asset-codename',
        'profile_details': 'profile-details',
        'eligibility_check': 'eligibility-check',
        'terms_acceptance': 'terms-acceptance',
        'mfa_setup': 'mfa-setup',
        'pending_review': 'pending-review',
        'completed': 'completed',
      }
      const investorCurrentStep = incompleteOrg.onboarding_step
      const investorAllowedSteps = new Set(['profile_details', 'eligibility_check'])
      const investorStep = investorCurrentStep && investorAllowedSteps.has(investorCurrentStep)
        ? investorCurrentStep
        : 'profile_details'

      const effectiveStep = isInvestor
        ? investorStep
        : (incompleteOrg.onboarding_step || 'cnpj_input')

      const stepSlug = stepSlugMap[effectiveStep] || 'cnpj-input'
      redirect(`/onboarding/${stepSlug}`)
    }

    // All orgs have completed onboarding - go to dashboard
    redirect('/dashboard')
  }

  // No organizations - redirect to landing page to select profile
  // This is the new flow: users must select profile on landing before signing up
  redirect('/?error=profile-required')
}
