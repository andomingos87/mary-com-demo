import type { OrganizationProfile } from '@/types/database'

export interface ResolvedBreadcrumb {
  label: string
  href?: string
}

interface ResolveBreadcrumbsInput {
  pathname: string
  orgSlug: string | null
  profileType: OrganizationProfile | null
  projectLabel?: string | null
}

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Admin',
  assetvdr: 'VDR',
  dashboard: 'Início',
  documents: 'Documentos',
  feed: 'Feed',
  investorvdr: 'Data Rooms',
  mary_ai: 'Mary AI',
  'mary-ai-private': 'Mary AI',
  members: 'Membros',
  mrs: 'MRS',
  opportunities: 'Radar',
  pipeline: 'Pipeline',
  profile: 'Perfil',
  projeto: 'Projeto',
  projects: 'Pipeline',
  projetos: 'Pipeline',
  radar: 'Radar',
  readiness: 'Readiness',
  settings: 'Configurações',
  thesis: 'Tese',
}

function getHomeHref(profileType: OrganizationProfile | null, orgSlug: string | null) {
  if (!profileType) return '/dashboard'
  if (profileType === 'advisor') return '/advisor/dashboard'
  if (orgSlug) return `/${orgSlug}/dashboard`
  return '/dashboard'
}

function getRouteLabel(segment: string) {
  return ROUTE_LABELS[segment] || segment
}

function getPathContext(pathname: string, orgSlug: string | null) {
  const segments = pathname.split('/').filter(Boolean)

  if (orgSlug && segments[0] === orgSlug) {
    return {
      kind: 'org' as const,
      baseIndex: 1,
      segments,
    }
  }

  if (segments[0] === 'advisor') {
    return {
      kind: 'advisor' as const,
      baseIndex: 1,
      segments,
    }
  }

  if (segments[0] === 'admin') {
    return {
      kind: 'admin' as const,
      baseIndex: 1,
      segments,
    }
  }

  return {
    kind: 'unknown' as const,
    baseIndex: 0,
    segments,
  }
}

export function resolveBreadcrumbs({
  pathname,
  orgSlug,
  profileType,
  projectLabel,
}: ResolveBreadcrumbsInput): ResolvedBreadcrumb[] {
  const homeHref = getHomeHref(profileType, orgSlug)
  const { kind, baseIndex, segments } = getPathContext(pathname, orgSlug)

  const section = segments[baseIndex]

  if (!section || section === 'dashboard') {
    return [{ label: 'Início' }]
  }

  const breadcrumbs: ResolvedBreadcrumb[] = [{ label: 'Início', href: homeHref }]

  const isProjectDetailRoute =
    (section === 'projects' || section === 'pipeline' || section === 'projetos') &&
    segments.length > baseIndex + 1

  if (!isProjectDetailRoute) {
    breadcrumbs.push({ label: getRouteLabel(section) })
    return breadcrumbs
  }

  const codename = segments[baseIndex + 1]
  const projectBaseHref =
    kind === 'org' && orgSlug
      ? `/${orgSlug}/projects/${codename}`
      : `/${segments[0]}/projects/${codename}`

  const pipelineHref =
    kind === 'org' && orgSlug
      ? `/${orgSlug}/pipeline`
      : `/${segments[0]}/projects`

  const safeProjectLabel = projectLabel || codename

  breadcrumbs.push({ label: 'Pipeline', href: pipelineHref })

  const subPage = segments[baseIndex + 2]
  if (!subPage) {
    breadcrumbs.push({ label: safeProjectLabel })
    return breadcrumbs
  }

  breadcrumbs.push({ label: safeProjectLabel, href: projectBaseHref })
  breadcrumbs.push({ label: getRouteLabel(subPage) })

  return breadcrumbs
}
