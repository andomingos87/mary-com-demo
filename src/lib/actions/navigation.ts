'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import type {
  OrganizationProfile,
  UserOrganization,
} from '@/types/database'
import type {
  FullNavigationContext,
  OrganizationContext,
  MembershipContext,
  CalculatedPermissions,
  RouteValidationResult,
} from '@/types/navigation'

// ============================================
// Types
// ============================================

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface ActiveOrganizationResult {
  organization: OrganizationContext
  membership: MembershipContext
}

// ============================================
// getActiveOrganization
// Returns the active organization for a user
// ============================================

export async function getActiveOrganization(
  preferredSlug?: string
): Promise<ActionResult<ActiveOrganizationResult>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get user's organizations
    const { data: orgs, error: orgsError } = await supabase.rpc('get_user_organizations', {
      p_user_id: user.id
    }) as { data: UserOrganization[] | null; error: Error | null }

    if (orgsError || !orgs || orgs.length === 0) {
      return { success: false, error: 'Nenhuma organização encontrada' }
    }

    // Find preferred org or use first one
    let selectedOrg = orgs[0]
    if (preferredSlug) {
      const preferred = orgs.find(o => o.organization_slug === preferredSlug)
      if (preferred) {
        selectedOrg = preferred
      } else {
        return { success: false, error: 'Organização não encontrada para este usuário' }
      }
    }

    // Get full organization data
    const { data: fullOrg, error: fullOrgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', selectedOrg.organization_id)
      .single()

    if (fullOrgError || !fullOrg) {
      return { success: false, error: 'Erro ao buscar organização' }
    }

    // Get membership data
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', selectedOrg.organization_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return { success: false, error: 'Erro ao buscar membership' }
    }

    const result: ActiveOrganizationResult = {
      organization: {
        id: fullOrg.id,
        name: fullOrg.name,
        slug: fullOrg.slug,
        profileType: fullOrg.profile_type,
        logoUrl: fullOrg.logo_url,
        verificationStatus: fullOrg.verification_status,
        onboardingStep: fullOrg.onboarding_step,
      },
      membership: {
        memberId: membership.id,
        role: membership.role,
        joinedAt: membership.joined_at,
      },
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Unexpected error in getActiveOrganization:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}

// ============================================
// validateRouteAccess
// Validates if user can access a specific route
// ============================================

export async function validateRouteAccess(
  orgSlug: string,
  routePath: string
): Promise<ActionResult<RouteValidationResult>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return {
        success: true,
        data: {
          allowed: false,
          reason: 'not_authenticated',
          redirectTo: '/login',
        },
      }
    }

    // Get organization by slug
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, profile_type, onboarding_step, verification_status')
      .eq('slug', orgSlug)
      .is('deleted_at', null)
      .single()

    if (orgError || !org) {
      return {
        success: true,
        data: {
          allowed: false,
          reason: 'not_member',
          redirectTo: '/dashboard',
        },
      }
    }

    // Check membership
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', org.id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return {
        success: true,
        data: {
          allowed: false,
          reason: 'not_member',
          redirectTo: '/dashboard',
        },
      }
    }

    // Check onboarding status
    if (org.onboarding_step !== 'completed' && org.onboarding_step !== 'pending_review') {
      return {
        success: true,
        data: {
          allowed: false,
          reason: 'onboarding_incomplete',
          redirectTo: '/onboarding',
        },
      }
    }

    // Check profile-specific routes
    const profileType = org.profile_type as OrganizationProfile
    
    // Investor-only routes
    const investorRoutes = ['/thesis', '/radar', '/feed', '/projetos', '/opportunities', '/pipeline', '/investorvdr']
    if (investorRoutes.some(r => routePath.includes(r)) && profileType !== 'investor') {
      return {
        success: true,
        data: {
          allowed: false,
          reason: 'wrong_profile',
          redirectTo: `/${orgSlug}/dashboard`,
        },
      }
    }

    // Asset-only routes
    const assetRoutes = ['/mrs', '/radar', '/feed', '/projeto', '/assetvdr']
    if (assetRoutes.some(r => routePath.includes(r)) && profileType !== 'asset') {
      return {
        success: true,
        data: {
          allowed: false,
          reason: 'wrong_profile',
          redirectTo: `/${orgSlug}/dashboard`,
        },
      }
    }

    return {
      success: true,
      data: { allowed: true },
    }
  } catch (error) {
    console.error('Unexpected error in validateRouteAccess:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}

// ============================================
// getNavigationContext
// Returns full navigation context for a user
// ============================================

export async function getNavigationContext(
  orgSlug?: string
): Promise<ActionResult<FullNavigationContext>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get active organization
    const activeOrgResult = await getActiveOrganization(orgSlug)
    if (!activeOrgResult.success || !activeOrgResult.data) {
      return { success: false, error: activeOrgResult.error || 'Organização não encontrada' }
    }

    const { organization, membership } = activeOrgResult.data
    const profileType = organization.profileType

    // Calculate permissions
    const isOwnerOrAdmin = membership.role === 'owner' || membership.role === 'admin'
    const isOwner = membership.role === 'owner'
    const isMemberOrHigher = ['owner', 'admin', 'member'].includes(membership.role)

    const permissions: CalculatedPermissions = {
      canInviteMembers: isOwnerOrAdmin,
      canManageMembers: isOwnerOrAdmin,
      canEditOrganization: isOwnerOrAdmin,
      canDeleteOrganization: isOwner,
      canViewAuditLogs: isOwnerOrAdmin,
      canManageProjects: isMemberOrHigher,
      canViewProjects: true,
      isAdmin: isOwner, // For now, only owners are considered admins
    }

    // Calculate route access
    const canAccess = {
      thesis: profileType === 'investor',
      opportunities: profileType === 'investor',
      pipeline: profileType === 'investor',
      investorvdr: profileType === 'investor',
      projects: profileType === 'asset' || profileType === 'advisor',
      assetvdr: profileType === 'asset',
      admin: permissions.isAdmin,
      maryAi: true, // All profiles can access Mary AI
    }

    // Check read-only mode
    const readOnlyMode = organization.verificationStatus === 'pending'

    // Check onboarding status
    const onboardingComplete = organization.onboardingStep === 'completed'

    const context: FullNavigationContext = {
      organization,
      membership,
      permissions,
      canAccess,
      readOnlyMode,
      onboardingComplete,
    }

    return { success: true, data: context }
  } catch (error) {
    console.error('Unexpected error in getNavigationContext:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}

// ============================================
// getUserOrganizationsList
// Returns list of all organizations for org switcher
// ============================================

export async function getUserOrganizationsList(): Promise<ActionResult<UserOrganization[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get user's organizations
    const { data: orgs, error: orgsError } = await supabase.rpc('get_user_organizations', {
      p_user_id: user.id
    }) as { data: UserOrganization[] | null; error: Error | null }

    if (orgsError) {
      console.error('Error fetching organizations:', orgsError)
      return { success: false, error: 'Erro ao buscar organizações' }
    }

    return { success: true, data: orgs || [] }
  } catch (error) {
    console.error('Unexpected error in getUserOrganizationsList:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}

// ============================================
// checkAdminAccess
// Checks if user has admin access
// ============================================

export async function checkAdminAccess(): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: true, data: false }
    }

    // Check if user is owner of any organization
    const { data: memberships, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'owner')

    if (memberError) {
      return { success: false, error: 'Erro ao verificar permissões' }
    }

    // For now, any owner has admin access
    // In the future, this could check a separate admin flag
    const isAdmin = memberships && memberships.length > 0

    return { success: true, data: isAdmin }
  } catch (error) {
    console.error('Unexpected error in checkAdminAccess:', error)
    return { success: false, error: 'Erro inesperado' }
  }
}
