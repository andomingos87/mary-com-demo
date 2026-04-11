import { redirect } from 'next/navigation'

export default function RegisterAdvisorPage() {
  redirect('/signup?profile=advisor')
}
