'use client'

/**
 * AgentsWaitlistCard Component
 * Landing page card for upcoming "Rede de Profissionais" (partners/affiliates) with email waitlist signup.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
} from '@/components/ui'
import { Handshake, Sparkles, Mail, CheckCircle2, Loader2 } from 'lucide-react'

export function AgentsWaitlistCard({ className }: { className?: string }) {
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setErrorMessage('Por favor, insira um email válido.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      // For now, just simulate a successful signup
      // TODO: Integrate with actual waitlist API (e.g., Supabase table, Mailchimp, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
      setErrorMessage('Erro ao cadastrar. Tente novamente.')
    }
  }

  const features = [
    'Indicar negócios para o ecossistema Mary',
    'Comissão por deals qualificados',
    'Acesso a oportunidades de M&A',
    'Rede exclusiva de profissionais de mercado',
  ]

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-dashed border-2 bg-gradient-to-br from-background to-muted/50',
        className
      )}
    >
      {/* Coming Soon Badge */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3 w-3" />
          Em breve
        </span>
      </div>

      <CardHeader className="text-center pb-4 pt-8">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary">
          <Handshake className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl">Rede de Profissionais</CardTitle>
        <CardDescription className="text-sm">
          Profissionais de mercado que indicam negócios para a Mary e fazem parte do ecossistema M&A
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary/60 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Waitlist Form */}
        <div className="pt-4 border-t border-border/50">
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <p className="text-sm font-medium text-green-700">
                Você está na lista!
              </p>
              <p className="text-xs text-muted-foreground">
                Avisaremos quando a rede de parceiros estiver disponível.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs text-center text-muted-foreground">
                Entre na lista de espera para acesso antecipado
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    className="pl-9"
                    disabled={status === 'loading'}
                  />
                </div>
                <Button
                  type="submit"
                  size="default"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </div>
              {status === 'error' && errorMessage && (
                <p className="text-xs text-destructive text-center">
                  {errorMessage}
                </p>
              )}
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AgentsWaitlistCard
