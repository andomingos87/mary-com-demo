import { getTranslations } from 'next-intl/server'
import { LandingHero } from '@/components/landing/LandingHero'
import { MarketingShell } from '@/components/landing/MarketingShell'
import { LandingBreadcrumb, ProfileLandingPageData, RenderProfileLandingSection } from '@/components/landing/ProfileLandingSections'

export async function ProfileLandingPage({
  data,
}: {
  data: ProfileLandingPageData
}) {
  const common = await getTranslations('landingProfiles.common')

  return (
    <MarketingShell
      currentPath={data.currentPath}
      loginLabel={common('login_cta')}
      primaryCtaHref={data.hero.ctaHref}
    >
      <div className="px-4">
        <LandingBreadcrumb currentLabel={data.breadcrumbLabel} />
      </div>

      <LandingHero
        eyebrow={data.hero.eyebrow}
        title={data.hero.title}
        subtitle={data.hero.subtitle}
        ctaLabel={data.hero.ctaLabel}
        ctaHref={data.hero.ctaHref}
        secondaryCtaLabel={data.hero.secondaryCtaLabel}
        secondaryCtaHref={data.hero.secondaryCtaHref}
      />

      {data.sections.map((section) => (
        <RenderProfileLandingSection key={`${section.kind}-${section.title}`} section={section} />
      ))}
    </MarketingShell>
  )
}
