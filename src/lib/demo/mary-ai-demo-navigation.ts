import type { DemoProfileKey } from '@/lib/demo/platform-data'
import type { FullNavigationContext } from '@/types/navigation'

/** Contexto mínimo para Mary AI + OrganizationProvider na jornada `/demo/*` (sem Supabase). */
export function createDemoMaryAiNavigationContext(profile: DemoProfileKey): FullNavigationContext {
  return {
    organization: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Organização Demo',
      slug: `demo-${profile}`,
      profileType: profile,
      logoUrl: null,
      verificationStatus: 'verified',
      onboardingStep: null,
    },
    membership: {
      memberId: '00000000-0000-4000-8000-000000000002',
      role: 'owner',
      joinedAt: new Date().toISOString(),
    },
    permissions: {
      canInviteMembers: true,
      canManageMembers: true,
      canEditOrganization: true,
      canDeleteOrganization: false,
      canViewAuditLogs: true,
      canManageProjects: true,
      canViewProjects: true,
      isAdmin: true,
    },
    canAccess: {
      thesis: true,
      opportunities: true,
      pipeline: true,
      investorvdr: true,
      projects: true,
      assetvdr: true,
      admin: true,
      maryAi: true,
    },
    readOnlyMode: false,
    onboardingComplete: true,
  }
}
