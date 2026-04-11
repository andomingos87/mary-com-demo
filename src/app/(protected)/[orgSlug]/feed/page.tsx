import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rss, Bell, Clock3 } from 'lucide-react'
import { isFrontendDemo } from '@/lib/demo/frontend-demo'
import {
  feedTagLabel,
  MOCK_FEED_ITEMS_ASSET,
  MOCK_FEED_ITEMS_INVESTOR,
} from '@/lib/demo/mock-feed'

interface FeedPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function FeedPage({ params }: FeedPageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('profile_type')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  if (!['investor', 'asset'].includes(org.profile_type)) {
    redirect(`/${orgSlug}/dashboard`)
  }

  const description =
    org.profile_type === 'investor'
      ? 'Acompanhe atualizações dos ativos que você segue.'
      : 'Acompanhe sinais de interesse e movimentações dos investidores.'

  const demo = isFrontendDemo()
  const mockItems =
    org.profile_type === 'investor' ? MOCK_FEED_ITEMS_INVESTOR : MOCK_FEED_ITEMS_ASSET

  return (
    <div className="space-y-6">
      <PageHeader title="Feed" description={description} />

      {demo && (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Modo demo: eventos abaixo são fictícios para validar o layout.
        </p>
      )}

      {demo ? (
        <Card>
          <CardContent className="space-y-2 pt-6">
            {mockItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4 shadow-card transition-smooth hover:border-primary/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {feedTagLabel(item.tag)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Rss className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Sem atualizações no momento
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Este espaço exibirá eventos relevantes da sua jornada, incluindo alertas,
              lembretes e mudanças de status em tempo real.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="gap-1">
                <Bell className="h-3.5 w-3.5" />
                Alertas
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                Lembretes
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
