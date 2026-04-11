import { ProfileLandingPage } from '@/components/landing/ProfileLandingPage'
import { adviseLandingData } from '@/components/landing/profileLandingData'

export default async function AdviseLandingPage() {
  return <ProfileLandingPage data={adviseLandingData} />
}
