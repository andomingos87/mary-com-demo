import type {
  CtaSection,
  FaqSection,
  PricingSection,
  ProfileLandingPageData,
  ProfileLandingSection,
  StatsSection,
  StepsSection,
  WaitlistSection,
  CardsSection,
  ComparisonSection,
} from '@/components/landing/ProfileLandingSections'

export const DEMO_MARKETING_NAV = [
  { href: '/demo/investor', label: 'Investir' },
  { href: '/demo/asset', label: 'Vender ou Captar' },
  { href: '/demo/advisor', label: 'Assessorar' },
  { href: '/demo/indicar', label: 'Indicar' },
] as const

export type DemoMarketingPath = (typeof DEMO_MARKETING_NAV)[number]['href'] | '/demo'

export const DEMO_APP_ENTRY: Record<Exclude<DemoMarketingPath, '/demo' | '/demo/indicar'>, string> = {
  '/demo/investor': '/demo/investor/dashboard',
  '/demo/asset': '/demo/asset/dashboard',
  '/demo/advisor': '/demo/advisor/dashboard',
}

export function mapMarketingHrefToDemo(href: string): string {
  if (href.startsWith('#')) return href

  switch (href) {
    case '/':
      return '/demo'
    case '/invest':
      return '/demo/investor'
    case '/sell-raise':
      return '/demo/asset'
    case '/advise':
      return '/demo/advisor'
    case '/indicar':
      return '/demo/indicar'
    case '/signup?profile=investor':
      return '/demo/investor/signup'
    case '/signup?profile=asset':
      return '/demo/asset/signup'
    case '/signup?profile=advisor':
      return '/demo/advisor/signup'
    case '/login':
      return '/demo'
    default:
      return href
  }
}

function mapSection(section: ProfileLandingSection): ProfileLandingSection {
  switch (section.kind) {
    case 'cards':
      return { ...section } satisfies CardsSection
    case 'comparison':
      return { ...section } satisfies ComparisonSection
    case 'stats':
      return { ...section } satisfies StatsSection
    case 'steps':
      return {
        ...section,
        ctaHref: section.ctaHref ? mapMarketingHrefToDemo(section.ctaHref) : undefined,
      } satisfies StepsSection
    case 'pricing':
      return {
        ...section,
        plans: section.plans.map((plan) => ({
          ...plan,
          ctaHref: mapMarketingHrefToDemo(plan.ctaHref),
        })),
      } satisfies PricingSection
    case 'faq':
      return { ...section } satisfies FaqSection
    case 'cta':
      return {
        ...section,
        ctaHref: mapMarketingHrefToDemo(section.ctaHref),
        secondaryCtaHref: section.secondaryCtaHref ? mapMarketingHrefToDemo(section.secondaryCtaHref) : undefined,
      } satisfies CtaSection
    case 'waitlist':
      return { ...section } satisfies WaitlistSection
    default:
      return section
  }
}

export function createDemoLandingData(
  data: ProfileLandingPageData,
  currentPath: DemoMarketingPath
): ProfileLandingPageData {
  return {
    ...data,
    currentPath,
    hero: {
      ...data.hero,
      ctaHref: mapMarketingHrefToDemo(data.hero.ctaHref),
      secondaryCtaHref: data.hero.secondaryCtaHref ? mapMarketingHrefToDemo(data.hero.secondaryCtaHref) : undefined,
    },
    sections: data.sections.map(mapSection),
  }
}
