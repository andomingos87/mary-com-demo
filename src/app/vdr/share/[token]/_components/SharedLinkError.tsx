import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { SharedLinkLayout } from './SharedLinkLayout'

interface SharedLinkErrorProps {
  error: string
}

export function SharedLinkError({ error }: SharedLinkErrorProps) {
  // Map errors to user-friendly messages
  const errorMessages: Record<string, { title: string; description: string }> = {
    'Link não encontrado': {
      title: 'Link não encontrado',
      description: 'Este link de compartilhamento não existe ou foi removido.',
    },
    'Link foi revogado': {
      title: 'Acesso revogado',
      description: 'O acesso a este documento foi revogado pelo proprietário.',
    },
    'Link expirado': {
      title: 'Link expirado',
      description: 'Este link de compartilhamento expirou. Solicite um novo link.',
    },
    'Limite de visualizações atingido': {
      title: 'Limite atingido',
      description: 'Este link atingiu o número máximo de visualizações permitidas.',
    },
  }

  const errorInfo = errorMessages[error] || {
    title: 'Erro ao acessar documento',
    description: error,
  }

  return (
    <SharedLinkLayout>
      <div className="bg-card border rounded-lg p-8 shadow-sm max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold mb-2">{errorInfo.title}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {errorInfo.description}
        </p>
        <Button asChild variant="outline">
          <Link href="/">Voltar para Mary</Link>
        </Button>
      </div>
    </SharedLinkLayout>
  )
}
