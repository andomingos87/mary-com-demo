import { redirect } from 'next/navigation'

/**
 * Rota legada dos CTAs "Nova Organização" em /dashboard/organizations.
 * Fluxo canônico de nova org: onboarding.
 */
export default function NewOrganizationRedirectPage() {
  redirect('/onboarding')
}
