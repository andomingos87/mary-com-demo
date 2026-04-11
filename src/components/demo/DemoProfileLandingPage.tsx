import { getTranslations } from 'next-intl/server'
import { LandingHero } from '@/components/landing/LandingHero'
import { MarketingShell } from '@/components/landing/MarketingShell'
import { LandingBreadcrumb, ProfileLandingPageData, RenderProfileLandingSection } from '@/components/landing/ProfileLandingSections'
import { createDemoLandingData, DEMO_MARKETING_NAV, type DemoMarketingPath } from '@/components/demo/demoLandingRoutes'

export async function DemoProfileLandingPage({
  data,
  currentPath,
  loginHref,
}: {
  data: ProfileLandingPageData
  currentPath: DemoMarketingPath
  loginHref: string
}) {
  const common = await getTranslations('landingProfiles.common')
  const mappedData = createDemoLandingData(data, currentPath)

  return (
    <MarketingShell
      currentPath={currentPath}
      loginLabel={common('login_cta')}
      loginHref={loginHref}
      homeHref="/demo"
      navItems={DEMO_MARKETING_NAV}
      primaryCtaHref={mappedData.hero.ctaHref}
    >
      <div className="px-4">
        <LandingBreadcrumb currentLabel={mappedData.breadcrumbLabel} homeHref="/demo" />
      </div>

      <LandingHero
        eyebrow={mappedData.hero.eyebrow}
        title={mappedData.hero.title}
        subtitle={mappedData.hero.subtitle}
        ctaLabel={mappedData.hero.ctaLabel}
        ctaHref={mappedData.hero.ctaHref}
        secondaryCtaLabel={mappedData.hero.secondaryCtaLabel}
        secondaryCtaHref={mappedData.hero.secondaryCtaHref}
      />

      {mappedData.sections.map((section) => (
        <RenderProfileLandingSection key={`${section.kind}-${section.title}`} section={section} />
      ))}
    </MarketingShell>
  )
}
