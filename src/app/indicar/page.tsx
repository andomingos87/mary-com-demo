import { ProfileLandingPage } from '@/components/landing/ProfileLandingPage'
import { indicateLandingData } from '@/components/landing/profileLandingData'

export default async function IndicarLandingPage() {
  return <ProfileLandingPage data={indicateLandingData} />
}
