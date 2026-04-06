import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Clock3, Rss } from 'lucide-react'

export default async function AdvisorFeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feed"
        description="Atualizações de projetos, leads e eventos relevantes"
      />

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
        </CardContent>
      </Card>
    </div>
  )
}

export const metadata = {
  title: 'Feed | Advisor',
}
