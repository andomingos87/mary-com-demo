'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { validatePublicSharedLink } from '@/lib/actions/vdr'
import { SharedLinkLayout } from './SharedLinkLayout'

interface PasswordPromptProps {
  token: string
  documentName?: string
}

export function PasswordPrompt({ token, documentName }: PasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await validatePublicSharedLink(token, password)

      if (!result.success) {
        setError(result.error || 'Senha incorreta')
        return
      }

      // Reload the page to show the document
      // The server component will now have the validated access
      router.refresh()
    })
  }

  return (
    <SharedLinkLayout>
      <div className="bg-card border rounded-lg p-8 shadow-sm max-w-md w-full">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Documento protegido</h1>
          {documentName && (
            <p className="text-sm text-muted-foreground mt-1">
              {documentName}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Este documento requer uma senha para acesso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              autoFocus
              disabled={isPending}
              className={cn(error && 'border-destructive')}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!password || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              'Acessar documento'
            )}
          </Button>
        </form>
      </div>
    </SharedLinkLayout>
  )
}
