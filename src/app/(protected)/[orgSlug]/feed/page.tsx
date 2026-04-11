import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rss, Bell, Clock3 } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      <PageHeader title="Feed" description={description} />

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
    </div>
  )
}
