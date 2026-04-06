import { Metadata } from 'next'
import { validatePublicSharedLink } from '@/lib/actions/vdr'
import { PasswordPrompt } from './_components/PasswordPrompt'
import { SharedDocumentView } from './_components/SharedDocumentView'
import { SharedLinkError } from './_components/SharedLinkError'

interface PageProps {
  params: Promise<{ token: string }>
}

export const metadata: Metadata = {
  title: 'Documento Compartilhado | Mary',
  robots: 'noindex, nofollow', // Don't index shared links
}

export default async function SharedLinkPage({ params }: PageProps) {
  const { token } = await params
  const result = await validatePublicSharedLink(token)

  // Error: invalid, expired, revoked, or limit reached
  if (!result.success && !result.requiresPassword) {
    return <SharedLinkError error={result.error || 'Link inválido'} />
  }

  // Requires password: show prompt
  if (result.requiresPassword) {
    return (
      <PasswordPrompt 
        token={token} 
        documentName={result.data?.document?.name} 
      />
    )
  }

  // Success: show document
  return <SharedDocumentView link={result.data!} />
}
