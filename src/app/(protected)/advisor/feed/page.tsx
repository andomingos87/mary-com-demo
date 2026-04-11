import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Clock3, Rss } from 'lucide-react'
import { isFrontendDemo } from '@/lib/demo/frontend-demo'
import { feedTagLabel, MOCK_FEED_ITEMS_ADVISOR } from '@/lib/demo/mock-feed'

export default async function AdvisorFeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const demo = isFrontendDemo()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feed"
        description="Atualizações de projetos, leads e eventos relevantes"
      />

      {demo && (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Modo demo: eventos abaixo são fictícios para validar o layout.
        </p>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Timeline</Badge>
            <CardTitle className="text-base">Atividade recente</CardTitle>
          </div>
          <CardDescription>
            Eventos do ecossistema do Advisor em ordem cronológica
          </CardDescription>
        </CardHeader>
        <CardContent>
          {demo ? (
            <div className="space-y-2">
              {MOCK_FEED_ITEMS_ADVISOR.map((item) => (
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <Rss className="mb-3 h-8 w-8 text-muted-foreground" />
              <Bell className="mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Nenhuma atualização por enquanto</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Quando houver movimentação de leads e projetos, os eventos aparecerão aqui.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Última verificação: agora
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export const metadata = {
  title: 'Feed | Advisor',
}
