'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProjectBreadcrumbLabel } from '@/lib/actions/projects'
import { useOrganization } from '@/components/providers/OrganizationProvider'
import { resolveBreadcrumbs } from '@/lib/breadcrumbs/resolveBreadcrumbs'
import type { 
  NavigationItem, 
  MenuConfig,
  NavKey,
} from '@/types/navigation'
import { 
  getMenuByProfile,
} from '@/types/navigation'
import type { OrganizationProfile } from '@/types/database'
import {
  LayoutDashboard,
  Target,
  Radar,
  Rss,
  Kanban,
  FolderKanban,
  FileBox,
  Bot,
  Building2,
  Settings,
  Briefcase,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react'

// ============================================
// Icon Map
// ============================================

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Target,
  Radar,
  Rss,
  Kanban,
  FolderKanban,
  FileBox,
  Bot,
  Building2,
  Settings,
  Briefcase,
  Shield,
  User,
}

// ============================================
// Context Types
// ============================================

interface NavigationProviderState {
  items: NavigationItem[]
  activeItem: string | null
  breadcrumbs: Array<{ label: string; href?: string }>
  breadcrumbsLoading: boolean
  canGoBack: boolean
  isCollapsed: boolean
  toggleCollapsed: () => void
  setActiveItem: (id: string | null) => void
}

const defaultState: NavigationProviderState = {
  items: [],
  activeItem: null,
  breadcrumbs: [],
  breadcrumbsLoading: false,
  canGoBack: false,
  isCollapsed: false,
  toggleCollapsed: () => {},
  setActiveItem: () => {},
}

// ============================================
// Context
// ============================================

const NavigationContext = createContext<NavigationProviderState>(defaultState)

// ============================================
// Provider Props
// ============================================

interface NavigationProviderProps {
  children: React.ReactNode
  profileType: OrganizationProfile | null
  orgSlug: string | null
  labels?: Record<NavKey, string>
}

// ============================================
// Helper Functions
// ============================================

function menuConfigToNavItem(
  config: MenuConfig,
  orgSlug: string,
  labels: Record<NavKey, string>
): NavigationItem {
  const Icon = ICON_MAP[config.iconName] || LayoutDashboard
  return {
    id: config.id,
    label: labels[config.id] || config.id,
    href: config.href(orgSlug),
    icon: Icon,
  }
}

function getActiveItemFromPath(pathname: string, items: NavigationItem[]): string | null {
  // Find the most specific match
  let bestMatch: NavigationItem | null = null
  let bestMatchLength = 0

  for (const item of items) {
    if (pathname.startsWith(item.href) && item.href.length > bestMatchLength) {
      bestMatch = item
      bestMatchLength = item.href.length
    }
  }

  return bestMatch?.id || null
}

// ============================================
// Default Labels (PT-BR)
// ============================================

const DEFAULT_LABELS: Record<NavKey, string> = {
  dashboard: 'Dashboard',
  mrs: 'MRS',
  thesis: 'Tese',
  radar: 'Radar',
  feed: 'Feed',
  project: 'Projeto',
  opportunities: 'Radar',
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
// Provider Component
// ============================================

export function NavigationProvider({
  children,
  profileType,
  orgSlug,
  labels = DEFAULT_LABELS,
}: NavigationProviderProps) {
  const pathname = usePathname()
  const { organization } = useOrganization()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [assetProjectLabel, setAssetProjectLabel] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    if (profileType !== 'asset' || !organization?.id) {
      setAssetProjectLabel(null)
      return () => {
        isMounted = false
      }
    }

    const supabase = createClient()
    supabase
      .from('projects')
      .select('name, codename')
      .eq('organization_id', organization.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (!isMounted) return

        const projectLabel =
          !error && data
            ? (data.name?.trim() || data.codename || null)
            : null

        if (projectLabel) {
          setAssetProjectLabel(projectLabel)
          return
        }

        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('onboarding_data')
          .eq('id', organization.id)
          .is('deleted_at', null)
          .maybeSingle()

        if (orgError || !orgData?.onboarding_data || typeof orgData.onboarding_data !== 'object' || Array.isArray(orgData.onboarding_data)) {
          setAssetProjectLabel(null)
          return
        }

        const onboardingData = orgData.onboarding_data as Record<string, unknown>
        const codenameData = onboardingData.assetCodenameData
        const fallbackLabel =
          codenameData && typeof codenameData === 'object' && !Array.isArray(codenameData)
            ? (codenameData as Record<string, unknown>).codename
            : null

        setAssetProjectLabel(typeof fallbackLabel === 'string' ? fallbackLabel : null)
      })

    return () => {
      isMounted = false
    }
  }, [profileType, organization?.id])

  const effectiveLabels = useMemo(
    () => ({
      ...labels,
      project: profileType === 'asset' ? (assetProjectLabel ?? 'Novo Projeto') : labels.project,
    }),
    [labels, profileType, assetProjectLabel]
  )

  // Generate navigation items based on profile type
  const items = useMemo(() => {
    if (!profileType || !orgSlug) return []
    
    const menuConfig = getMenuByProfile(profileType)
    return menuConfig.map(config => menuConfigToNavItem(config, orgSlug, effectiveLabels))
  }, [profileType, orgSlug, effectiveLabels])

  // Update active item when pathname changes
  useEffect(() => {
    const newActiveItem = getActiveItemFromPath(pathname, items)
    setActiveItem(newActiveItem)
  }, [pathname, items])

  const [projectLabelCache, setProjectLabelCache] = useState<Record<string, string>>({})
  const [projectLabelLoading, setProjectLabelLoading] = useState(false)
  const [resolvedProjectLabel, setResolvedProjectLabel] = useState<string | null>(null)

  const projectRoute = useMemo(() => {
    if (!orgSlug || !pathname.startsWith(`/${orgSlug}/`)) return null
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length < 3) return null

    const section = segments[1]
    if (!['projects', 'pipeline', 'projetos'].includes(section)) return null

    return {
      codename: segments[2],
      cacheKey: `${orgSlug}:${segments[2]}`,
    }
  }, [pathname, orgSlug])

  useEffect(() => {
    let isMounted = true

    if (!projectRoute || !orgSlug) {
      setProjectLabelLoading(false)
      setResolvedProjectLabel(null)
      return () => {
        isMounted = false
      }
    }

    const cachedLabel = projectLabelCache[projectRoute.cacheKey]
    if (cachedLabel) {
      setResolvedProjectLabel(cachedLabel)
      setProjectLabelLoading(false)
      return () => {
        isMounted = false
      }
    }

    setProjectLabelLoading(true)
    setResolvedProjectLabel(null)

    getProjectBreadcrumbLabel(orgSlug, projectRoute.codename)
      .then((result) => {
        if (!isMounted) return
        const safeLabel = result.success && result.data?.label
          ? result.data.label
          : projectRoute.codename

        setProjectLabelCache((prev) => ({
          ...prev,
          [projectRoute.cacheKey]: safeLabel,
        }))
        setResolvedProjectLabel(safeLabel)
      })
      .finally(() => {
        if (isMounted) {
          setProjectLabelLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [orgSlug, projectRoute, projectLabelCache])

  const breadcrumbsLoading = Boolean(projectRoute && projectLabelLoading)
  const breadcrumbs = useMemo(
    () =>
      resolveBreadcrumbs({
        pathname,
        orgSlug,
        profileType,
        projectLabel: resolvedProjectLabel,
      }),
    [pathname, orgSlug, profileType, resolvedProjectLabel]
  )

  // Check if can go back
  const canGoBack = breadcrumbs.length > 1

  const toggleCollapsed = () => setIsCollapsed(prev => !prev)

  const value: NavigationProviderState = {
    items,
    activeItem,
    breadcrumbs,
    breadcrumbsLoading,
    canGoBack,
    isCollapsed,
    toggleCollapsed,
    setActiveItem,
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

// ============================================
// Hook
// ============================================

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

// ============================================
// Utility Hooks
// ============================================

/** Hook to get current breadcrumbs */
export function useBreadcrumbs() {
  const { breadcrumbs } = useNavigation()
  return breadcrumbs
}

/** Hook to check breadcrumb loading state */
export function useBreadcrumbLoading() {
  const { breadcrumbsLoading } = useNavigation()
  return breadcrumbsLoading
}

/** Hook to check if sidebar is collapsed */
export function useSidebarCollapsed() {
  const { isCollapsed, toggleCollapsed } = useNavigation()
  return { isCollapsed, toggleCollapsed }
}

/** Hook to get navigation items */
export function useNavigationItems() {
  const { items, activeItem } = useNavigation()
  return { items, activeItem }
}
