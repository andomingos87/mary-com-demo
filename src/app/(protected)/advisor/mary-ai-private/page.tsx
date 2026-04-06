import { redirect } from 'next/navigation'

export default async function AdvisorMaryAiPage() {
  redirect('/advisor/dashboard?from=legacy-mary-ai')
}

export const metadata = {
  title: 'Mary AI (Legado) | Advisor',
}
