import { DemoProfileLandingPage } from '@/components/demo/DemoProfileLandingPage'
import { indicateLandingData } from '@/components/landing/profileLandingData'

export default async function DemoIndicarLandingPage() {
  return (
    <DemoProfileLandingPage
      data={indicateLandingData}
      currentPath="/demo/indicar"
      loginHref="/demo"
    />
  )
}
