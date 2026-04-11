import { redirect } from 'next/navigation'

/** Alias da jornada: /register/investor → fluxo único de signup */
export default function RegisterInvestorPage() {
  redirect('/signup?profile=investor')
}
