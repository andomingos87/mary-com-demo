import { redirect } from 'next/navigation'

export default function AdvisorDashboardPage() {
  redirect('/advisor/radar')
}

export const metadata = {
  title: 'Dashboard | Advisor',
}
