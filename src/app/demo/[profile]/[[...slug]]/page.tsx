import { notFound, redirect } from 'next/navigation'
import { PlatformDemo } from '@/components/demo/PlatformDemo'
import { DemoProfileLandingPage } from '@/components/demo/DemoProfileLandingPage'
import { adviseLandingData, investLandingData, sellRaiseLandingData } from '@/components/landing/profileLandingData'
import { DEMO_PLATFORM, type DemoProfileKey } from '@/lib/demo/platform-data'

const PROFILE_LANDING_DATA = {
  investor: investLandingData,
  asset: sellRaiseLandingData,
  advisor: adviseLandingData,
} satisfies Record<DemoProfileKey, typeof investLandingData>

const PROFILE_LANDING_PATH = {
  investor: '/demo/investor',
  asset: '/demo/asset',
  advisor: '/demo/advisor',
} as const satisfies Record<DemoProfileKey, '/demo/investor' | '/demo/asset' | '/demo/advisor'>

const PROFILE_LOGIN_HREF = {
  investor: '/demo/investor/dashboard',
  asset: '/demo/asset/dashboard',
  advisor: '/demo/advisor/dashboard',
}

export default function DemoProfilePage({
  params,
}: {
  params: { profile: string; slug?: string[] }
}) {
  const profile = params.profile as DemoProfileKey

  if (!Object.prototype.hasOwnProperty.call(DEMO_PLATFORM, profile)) {
    notFound()
  }

  /** Kanban mock consolidado em Projetos; pipeline legado redireciona. */
  if (profile === 'investor' && params.slug?.[0] === 'pipeline') {
    redirect('/demo/investor/projects')
  }

  if (!params.slug?.length) {
    return (
      <DemoProfileLandingPage
        data={PROFILE_LANDING_DATA[profile]}
        currentPath={PROFILE_LANDING_PATH[profile]}
        loginHref={PROFILE_LOGIN_HREF[profile]}
      />
    )
  }

  return <PlatformDemo profile={profile} segments={params.slug ?? []} />
}
