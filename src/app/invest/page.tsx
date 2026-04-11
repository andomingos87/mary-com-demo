import { ProfileLandingPage } from '@/components/landing/ProfileLandingPage'
import { investLandingData } from '@/components/landing/profileLandingData'

export default async function InvestLandingPage() {
  return <ProfileLandingPage data={investLandingData} />
}
