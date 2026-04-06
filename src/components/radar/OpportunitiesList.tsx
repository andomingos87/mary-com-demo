'use client'

import { useMemo, useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Heart, FileText, ShieldCheck } from 'lucide-react'
import { requestNdaForOpportunity, toggleFollowOpportunity } from '@/lib/actions/radar'
import type { RadarOpportunity } from '@/types/radar'

interface OpportunitiesListProps {
  organizationId: string
  opportunities: RadarOpportunity[]
  readOnlyMode: boolean
  fallbackUsed: boolean
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function OpportunitiesList({
  organizationId,
  opportunities,
  readOnlyMode,
  fallbackUsed,
}: OpportunitiesListProps) {
  const [items, setItems] = useState(opportunities)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [teaserOpenId, setTeaserOpenId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const teaserItem = useMemo(
    () => items.find((item) => item.projectId === teaserOpenId) || null,
    [items, teaserOpenId]
  )

  const handleToggleFollow = (projectId: string) =>
    startTransition(async () => {
      setGlobalError(null)
      const result = await toggleFollowOpportunity({ organizationId, projectId })
      if (!result.success || !result.data) {
        setGlobalError(result.error || 'Erro ao atualizar follow.')
        return
      }
      const followData = result.data

      setItems((prev) =>
        prev.map((item) =>
          item.projectId === projectId
            ? {
                ...item,
                ctaState: { ...item.ctaState, isFollowing: followData.isFollowing },
              }
            : item
        )
      )
    })

  const handleRequestNda = (projectId: string) =>
    startTransition(async () => {
      setGlobalError(null)
      const result = await requestNdaForOpportunity({ organizationId, projectId })
      if (!result.success || !result.data) {
        setGlobalError(result.error || 'Erro ao solicitar NDA.')
        return
      }
      const ndaData = result.data

      setItems((prev) =>
        prev.map((item) =>
          item.projectId === projectId
            ? {
                ...item,
                ctaState: {
                  ...item.ctaState,
                  hasNdaRequest: ndaData.created || item.ctaState.hasNdaRequest,
                  canRequestNda: false,
                },
              }
            : item
        )
      )
    })

  return (
    <div className="space-y-4">
      {fallbackUsed && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            Não encontramos oportunidades acima do threshold inicial. Exibindo melhores opções atuais para
            calibrar sua tese.
          </CardContent>
        </Card>
      )}

      {readOnlyMode && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            Sua organização está em análise. Você pode visualizar oportunidades, mas CTAs de relacionamento
            ficam indisponíveis até aprovação.
          </CardContent>
        </Card>
      )}

      {globalError && (
        <Card className="border-destructive/40">
          <CardContent className="py-3 text-sm text-destructive">{globalError}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((opportunity) => (
          <Card key={opportunity.projectId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">{opportunity.codename}</CardTitle>
                  <CardDescription>
                    Atualizado em {formatDate(opportunity.updatedAt)}
                  </CardDescription>
                </div>
                <Badge>Score {opportunity.matchScore}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {opportunity.sector ? <Badge variant="outline">{opportunity.sector}</Badge> : null}
                {opportunity.matchReasons.map((reason) => (
                  <Badge key={reason} variant="secondary">
                    {reason}
                  </Badge>
                ))}
                {opportunity.matchReasons.length === 0 ? (
                  <Badge variant="outline">Sem critérios aderentes mapeados</Badge>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTeaserOpenId(opportunity.projectId)}
                  disabled={!opportunity.ctaState.canViewTeaser}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {opportunity.ctaState.canViewTeaser ? 'Ver Teaser' : 'Teaser indisponível'}
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleRequestNda(opportunity.projectId)}
                  disabled={
                    isPending ||
                    readOnlyMode ||
                    !opportunity.ctaState.canRequestNda ||
                    opportunity.ctaState.hasNdaRequest
                  }
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {opportunity.ctaState.hasNdaRequest ? 'NDA solicitado' : 'Solicitar NDA'}
                </Button>

                <Button
                  size="sm"
                  variant={opportunity.ctaState.isFollowing ? 'default' : 'outline'}
                  onClick={() => handleToggleFollow(opportunity.projectId)}
                  disabled={isPending || readOnlyMode}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {opportunity.ctaState.isFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!teaserItem} onOpenChange={() => setTeaserOpenId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{teaserItem?.codename || 'Teaser'}</DialogTitle>
            <DialogDescription>
              Preview do teaser com dados permitidos antes do fluxo de NDA.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {teaserItem?.teaserSummary || 'Teaser indisponível para esta oportunidade.'}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
