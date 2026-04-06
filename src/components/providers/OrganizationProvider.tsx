'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { 
  OrganizationContext, 
  MembershipContext, 
  CalculatedPermissions,
  FullNavigationContext 
} from '@/types/navigation'
import type { UserOrganization } from '@/types/database'

// ============================================
// Context Types
// ============================================

interface OrganizationProviderState {
  currentUser: CurrentUserContext | null
  organization: OrganizationContext | null
  membership: MembershipContext | null
  permissions: CalculatedPermissions | null
  readOnlyMode: boolean
  onboardingComplete: boolean
  isLoading: boolean
  error: string | null
  organizations: UserOrganization[]
  switchOrganization: (slug: string) => void
}

interface InitialUser {
  id: string
  email?: string | null
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  } | null
}

export interface CurrentUserContext {
  id: string
  email: string | null
  fullName: string | null
  avatarUrl: string | null
  profileTypeLabel: 'Investor' | 'Advisor' | 'Company' | null
}

const defaultPermissions: CalculatedPermissions = {
  canInviteMembers: false,
  canManageMembers: false,
  canEditOrganization: false,
  canDeleteOrganization: false,
  canViewAuditLogs: false,
  canManageProjects: false,
  canViewProjects: false,
  isAdmin: false,
}

const defaultState: OrganizationProviderState = {
  currentUser: null,
  organization: null,
  membership: null,
  permissions: defaultPermissions,
  readOnlyMode: false,
  onboardingComplete: false,
  isLoading: true,
  error: null,
  organizations: [],
  switchOrganization: () => {},
}

// ============================================
// Context
// ============================================

const OrganizationContext = createContext<OrganizationProviderState>(defaultState)

// ============================================
// Provider Props
// ============================================

interface OrganizationProviderProps {
  children: React.ReactNode
  initialContext?: FullNavigationContext | null
  initialOrganizations?: UserOrganization[]
  initialUser?: InitialUser | null
}

function getProfileTypeLabel(
  profileType: OrganizationContext['profileType'] | null | undefined
): CurrentUserContext['profileTypeLabel'] {
  if (profileType === 'investor') return 'Investor'
  if (profileType === 'advisor') return 'Advisor'
  if (profileType === 'asset') return 'Company'
  return null
}

function mapInitialUserToCurrentUser(
  initialUser: InitialUser | null | undefined,
  profileType: OrganizationContext['profileType'] | null | undefined
): CurrentUserContext | null {
  if (!initialUser) return null

  return {
    id: initialUser.id,
    email: initialUser.email || null,
    fullName: initialUser.user_metadata?.full_name || null,
    avatarUrl: initialUser.user_metadata?.avatar_url || null,
    profileTypeLabel: getProfileTypeLabel(profileType),
  }
}

// ============================================
// Provider Component
// ============================================

export function OrganizationProvider({
  children,
  initialContext,
  initialOrganizations = [],
  initialUser = null,
}: OrganizationProviderProps) {
  const [state, setState] = useState<Omit<OrganizationProviderState, 'switchOrganization'>>(() => {
    if (initialContext) {
      return {
        currentUser: mapInitialUserToCurrentUser(initialUser, initialContext.organization.profileType),
        organization: initialContext.organization,
        membership: initialContext.membership,
        permissions: initialContext.permissions,
        readOnlyMode: initialContext.readOnlyMode,
        onboardingComplete: initialContext.onboardingComplete,
        isLoading: false,
        error: null,
        organizations: initialOrganizations,
      }
    }
    return {
      ...defaultState,
      currentUser: mapInitialUserToCurrentUser(initialUser, null),
      organizations: initialOrganizations,
    }
  })

  const switchOrganization = useCallback((slug: string) => {
    // Navigate to the new organization's dashboard
    if (typeof window !== 'undefined') {
      window.location.href = `/${slug}/dashboard`
    }
  }, [])

  // Update state when initial context changes (server-side updates)
  useEffect(() => {
    if (initialContext) {
      setState(prev => ({
        ...prev,
        currentUser: mapInitialUserToCurrentUser(initialUser, initialContext.organization.profileType),
        organization: initialContext.organization,
        membership: initialContext.membership,
        permissions: initialContext.permissions,
        readOnlyMode: initialContext.readOnlyMode,
        onboardingComplete: initialContext.onboardingComplete,
        isLoading: false,
        error: null,
      }))
    }
  }, [initialContext, initialUser])

  // Update organizations list
  useEffect(() => {
    if (initialOrganizations.length > 0) {
      setState(prev => ({
        ...prev,
        organizations: initialOrganizations,
      }))
    }
  }, [initialOrganizations])

  useEffect(() => {
    if (!initialContext) {
      setState(prev => ({
        ...prev,
        currentUser: mapInitialUserToCurrentUser(initialUser, prev.organization?.profileType),
      }))
    }
  }, [initialUser, initialContext])

  const value: OrganizationProviderState = {
    ...state,
    switchOrganization,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

// ============================================
// Hook
// ============================================

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

// ============================================
// Utility Hooks
// ============================================

/** Hook to check if current user can perform an action */
export function useCanPerform(action: keyof CalculatedPermissions): boolean {
  const { permissions } = useOrganization()
  return permissions?.[action] ?? false
}

/** Hook to check if in read-only mode */
export function useReadOnlyMode(): boolean {
  const { readOnlyMode } = useOrganization()
  return readOnlyMode
}

/** Hook to get current organization profile type */
export function useProfileType() {
  const { organization } = useOrganization()
  return organization?.profileType ?? null
}

/** Hook to check if user has specific role or higher */
export function useHasRole(requiredRole: 'owner' | 'admin' | 'member' | 'viewer'): boolean {
  const { membership } = useOrganization()
  if (!membership) return false
  
  const roleHierarchy = { owner: 4, admin: 3, member: 2, viewer: 1 }
  const userLevel = roleHierarchy[membership.role] ?? 0
  const requiredLevel = roleHierarchy[requiredRole] ?? 0
  
  return userLevel >= requiredLevel
}
