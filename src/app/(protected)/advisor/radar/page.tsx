import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Radar, Users, Building2 } from 'lucide-react'

export default async function AdvisorRadarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Radar"
        description="Leads e oportunidades para atuação do Advisor"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Leads Sell-Side</Badge>
              <CardTitle className="text-base">Ativos em busca de assessoria</CardTitle>
            </div>
            <CardDescription>
              Empresas com potencial aderente ao seu perfil de atuação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyRadarState
              icon={Building2}
              message="Nenhum lead sell-side disponível"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Leads Buy-Side</Badge>
              <CardTitle className="text-base">Investidores em busca de advisor</CardTitle>
            </div>
            <CardDescription>
              Oportunidades de mandato para apoiar processos de aquisição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyRadarState
              icon={Users}
              message="Nenhum lead buy-side disponível"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface EmptyRadarStateProps {
  icon: React.ElementType
  message: string
}

function EmptyRadarState({ icon: Icon, message }: EmptyRadarStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
      <Radar className="mb-3 h-8 w-8 text-muted-foreground" />
      <Icon className="mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Novas oportunidades aparecerão aqui conforme matching e convites.
      </p>
    </div>
  )
}

export const metadata = {
  title: 'Radar | Advisor',
}
