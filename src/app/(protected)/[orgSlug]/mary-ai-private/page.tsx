import { redirect } from 'next/navigation'

interface MaryAiPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function MaryAiPage({ params }: MaryAiPageProps) {
  const { orgSlug } = await params
  redirect(`/${orgSlug}/dashboard?from=legacy-mary-ai`)
}

export async function generateMetadata({ params }: MaryAiPageProps) {
  const { orgSlug } = await params
  return {
    title: `Mary AI (Legado) | ${orgSlug}`,
  }
}
