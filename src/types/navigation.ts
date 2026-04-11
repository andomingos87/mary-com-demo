/**
 * Types for Navigation System
 * Phase 3.5 - Rotas Base do PRD
 */

import type { LucideIcon } from 'lucide-react'
import type { OrganizationProfile, MemberRole, VerificationStatus, OnboardingStep } from './database'

// ============================================
// Navigation Item Types
// ============================================

/** Item de navegação */
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  badge?: number
  disabled?: boolean
  children?: NavigationItem[]
}

/** Contexto de navegação */
export interface NavigationContext {
  items: NavigationItem[]
  activeItem: string | null
  breadcrumbs: Array<{ label: string; href?: string }>
  canGoBack: boolean
}

// ============================================
// Route Permission Types
// ============================================

/** Permissão de rota por perfil */
export interface RoutePermission {
  pattern: string
  profiles?: OrganizationProfile[]
  requireAdmin?: boolean
  requireCompleteOnboarding?: boolean
}

/** Mapa de permissões de rotas */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Rotas do Investor
  { pattern: '/[orgSlug]/thesis', profiles: ['investor'] },
  { pattern: '/[orgSlug]/radar', profiles: ['investor'] },
  { pattern: '/[orgSlug]/feed', profiles: ['investor'] },
  { pattern: '/[orgSlug]/projetos', profiles: ['investor'] },
  { pattern: '/[orgSlug]/opportunities', profiles: ['investor'] },
  { pattern: '/[orgSlug]/pipeline', profiles: ['investor'] },

  // Rotas do Asset
  { pattern: '/[orgSlug]/mrs', profiles: ['asset'] },
  { pattern: '/[orgSlug]/radar', profiles: ['asset'] },
  { pattern: '/[orgSlug]/feed', profiles: ['asset'] },
  { pattern: '/[orgSlug]/projeto', profiles: ['asset'] },
  { pattern: '/[orgSlug]/projects', profiles: ['asset'] },
  { pattern: '/[orgSlug]/projects/[codename]', profiles: ['asset'] },
  { pattern: '/[orgSlug]/assetvdr', profiles: ['asset'] },

  // Rotas comuns (Investor e Asset)
  { pattern: '/[orgSlug]/dashboard', profiles: ['investor', 'asset'] },
  { pattern: '/[orgSlug]/profile', profiles: ['investor', 'asset'] },
  { pattern: '/[orgSlug]/settings', profiles: ['investor', 'asset'] },

  // Rotas do Advisor
  { pattern: '/advisor', profiles: ['advisor'] },

  // Rotas Admin
  { pattern: '/admin', requireAdmin: true },
]

// ============================================
// Organization Context Types
// ============================================

/** Contexto da organização ativa */
export interface OrganizationContext {
  id: string
  name: string
  slug: string
  profileType: OrganizationProfile
  logoUrl: string | null
  verificationStatus: VerificationStatus
  onboardingStep: OnboardingStep | null
}

/** Contexto de membership do usuário */
export interface MembershipContext {
  memberId: string
  role: MemberRole
  joinedAt: string
}

/** Permissões calculadas */
export interface CalculatedPermissions {
  canInviteMembers: boolean
  canManageMembers: boolean
  canEditOrganization: boolean
  canDeleteOrganization: boolean
  canViewAuditLogs: boolean
  canManageProjects: boolean
  canViewProjects: boolean
  isAdmin: boolean
}

/** Contexto completo para navegação */
export interface FullNavigationContext {
  organization: OrganizationContext
  membership: MembershipContext
  permissions: CalculatedPermissions
  canAccess: {
    thesis: boolean
    opportunities: boolean
    pipeline: boolean
    investorvdr: boolean
    projects: boolean
    assetvdr: boolean
    admin: boolean
    maryAi: boolean
  }
  readOnlyMode: boolean
  onboardingComplete: boolean
}

// ============================================
// Route Validation Types
// ============================================

/** Resultado da validação de rota */
export interface RouteValidationResult {
  allowed: boolean
  reason?: 'not_authenticated' | 'onboarding_incomplete' | 'wrong_profile' | 'not_admin' | 'not_member'
  redirectTo?: string
}

/** Dados de sessão para middleware */
export interface MiddlewareSessionData {
  userId: string
  organizations: Array<{
    id: string
    slug: string
    profileType: OrganizationProfile
    role: MemberRole
    verificationStatus: VerificationStatus
    onboardingStep: OnboardingStep | null
  }>
  isAdmin: boolean
}

// ============================================
// Navigation Keys for i18n
// ============================================

/** Chaves de navegação para i18n */
export type NavKey = 
  | 'dashboard'
  | 'mrs'
  | 'thesis'
  | 'radar'
  | 'feed'
  | 'project'
  | 'opportunities'
  | 'pipeline'
  | 'investorvdr'
  | 'projects'
  | 'assetvdr'
  | 'mary_ai'
  | 'profile'
  | 'settings'
  | 'admin'
  | 'logout'

/** Mapa de labels de navegação */
export const NAV_LABELS: Record<NavKey, string> = {
  dashboard: 'Dashboard',
  mrs: 'MRS',
  thesis: 'Tese',
  radar: 'Radar',
  feed: 'Feed',
  project: 'Projeto',
  opportunities: 'Oportunidades',
  pipeline: 'Pipeline',
  investorvdr: 'Data Rooms',
  projects: 'Projetos',
  assetvdr: 'VDR',
  mary_ai: 'Mary AI',
  profile: 'Perfil',
  settings: 'Configurações',
  admin: 'Admin',
  logout: 'Sair',
}

// ============================================
// Menu Configuration by Profile
// ============================================

/** Configuração de menu por perfil */
export interface MenuConfig {
  id: NavKey
  iconName: string
  href: (slug: string) => string
}

/** Menu do Investor */
export const INVESTOR_MENU: MenuConfig[] = [
  { id: 'radar', iconName: 'Radar', href: (slug) => `/${slug}/radar` },
  { id: 'thesis', iconName: 'Target', href: (slug) => `/${slug}/thesis` },
  { id: 'feed', iconName: 'Rss', href: (slug) => `/${slug}/feed` },
  { id: 'pipeline', iconName: 'Kanban', href: (slug) => `/${slug}/pipeline` },
  { id: 'profile', iconName: 'User', href: (slug) => `/${slug}/profile` },
  { id: 'settings', iconName: 'Settings', href: (slug) => `/${slug}/settings` },
]

/** Menu do Asset */
export const ASSET_MENU: MenuConfig[] = [
  { id: 'mrs', iconName: 'Shield', href: (slug) => `/${slug}/mrs` },
  { id: 'radar', iconName: 'Radar', href: (slug) => `/${slug}/radar` },
  { id: 'feed', iconName: 'Rss', href: (slug) => `/${slug}/feed` },
  { id: 'project', iconName: 'FolderKanban', href: (slug) => `/${slug}/projeto` },
  { id: 'profile', iconName: 'User', href: (slug) => `/${slug}/profile` },
  { id: 'settings', iconName: 'Settings', href: (slug) => `/${slug}/settings` },
]

/** Menu do Advisor */
export const ADVISOR_MENU: MenuConfig[] = [
  { id: 'dashboard', iconName: 'LayoutDashboard', href: () => '/advisor/dashboard' },
  { id: 'radar', iconName: 'Radar', href: () => '/advisor/radar' },
  { id: 'profile', iconName: 'User', href: () => '/advisor/profile' },
  { id: 'feed', iconName: 'Rss', href: () => '/advisor/feed' },
  { id: 'projects', iconName: 'Briefcase', href: () => '/advisor/projects' },
  { id: 'settings', iconName: 'Settings', href: () => '/advisor/settings' },
]

/** Obtém menu por tipo de perfil */
export function getMenuByProfile(profileType: OrganizationProfile): MenuConfig[] {
  switch (profileType) {
    case 'investor':
      return INVESTOR_MENU
    case 'asset':
      return ASSET_MENU
    case 'advisor':
      return ADVISOR_MENU
    default:
      return []
  }
}
