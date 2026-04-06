'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { getProjectInviteByToken, acceptProjectInvite } from '@/lib/actions/project-invites'
import { createClient } from '@/lib/supabase/client'
import type { ProjectInviteWithDetails } from '@/types/projects'
import { PROJECT_MEMBER_ROLE_LABELS } from '@/types/projects'

export default function ProjectInvitePage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()

  const [invite, setInvite] = useState<ProjectInviteWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function load() {
      // Check auth
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      // Load invite
      const result = await getProjectInviteByToken(params.token)
      if (result.success && result.data) {
        setInvite(result.data)

        // Check expiry
        if (new Date(result.data.expires_at) < new Date()) {
          setError('Este convite expirou')
        }
      } else {
        setError(result.error || 'Convite nao encontrado')
      }
      setLoading(false)
    }
    load()
  }, [params.token])

  const handleAccept = async () => {
    setAccepting(true)
    setError(null)

    const result = await acceptProjectInvite(params.token)

    if (result.success && result.data) {
      setSuccess(true)
      setTimeout(() => {
        router.push(`/${result.data!.orgSlug}/projects/${result.data!.codename}`)
      }, 1500)
    } else {
      setError(result.error || 'Erro ao aceitar convite')
    }
    setAccepting(false)
  }

  const handleLogin = () => {
    router.push(`/auth/login?redirectTo=/invite/project/${params.token}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Convite para Projeto</CardTitle>
          <CardDescription>
            {invite
              ? `Voce foi convidado para o projeto ${invite.project?.codename}`
              : 'Convite de projeto'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Convite aceito! Redirecionando...
              </AlertDescription>
            </Alert>
          )}

          {invite && !success && (
            <>
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projeto</span>
                  <span className="font-medium">{invite.project?.codename}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Convidado por</span>
                  <span className="font-medium">
                    {invite.inviter?.full_name || invite.inviter?.email || 'Um membro'}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Papel</span>
                  <Badge variant="secondary">
                    {PROJECT_MEMBER_ROLE_LABELS[invite.role]}
                  </Badge>
                </div>
              </div>

              {isLoggedIn ? (
                <Button
                  onClick={handleAccept}
                  disabled={accepting || !!error}
                  className="w-full"
                >
                  {accepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Aceitar Convite
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button onClick={handleLogin} className="w-full">
                    Entrar para aceitar
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Voce precisa estar logado para aceitar este convite
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
