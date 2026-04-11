import { ProfileLandingPage } from '@/components/landing/ProfileLandingPage'
import { sellRaiseLandingData } from '@/components/landing/profileLandingData'

export default async function SellRaiseLandingPage() {
  return <ProfileLandingPage data={sellRaiseLandingData} />
}
