import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent } from '@/components/ui/card'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { listRadarOpportunities } from '@/lib/actions/radar'
import { OpportunitiesList } from '@/components/radar/OpportunitiesList'
import { Radar, Building2, TrendingUp, Filter, Search, Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RadarPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function RadarPage({ params }: RadarPageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, profile_type')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  if (org.profile_type === 'investor') {
    const radarResult = await listRadarOpportunities(org.id)
    if (!radarResult.success || !radarResult.data) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="Radar"
            description="Empresas que correspondem as suas teses de investimento"
          />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Radar className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Nao foi possivel carregar o Radar agora
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Tente atualizar a pagina em alguns instantes. Se o problema persistir, entre em contato com o suporte.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    const hasActiveThesis = radarResult.data.state !== 'no_active_thesis'
    const hasMatches = radarResult.data.state === 'matches_found'

    return (
      <div className="space-y-6">
        <PageHeader
          title="Radar"
          description="Empresas que correspondem as suas teses de investimento"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          }
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar oportunidades..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm"
              disabled
            />
          </div>
          <select
            className="px-4 py-2 border border-input rounded-md bg-background text-sm"
            disabled
          >
            <option>Todas as teses</option>
          </select>
          <select
            className="px-4 py-2 border border-input rounded-md bg-background text-sm"
            disabled
          >
            <option>Maior score</option>
            <option>Mais recentes</option>
          </select>
        </div>

        {!hasActiveThesis && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Crie uma tese primeiro
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Para ver oportunidades relevantes, voce precisa criar pelo menos uma tese
                de investimento definindo seus criterios de busca.
              </p>
              <Button asChild>
                <Link href={`/${orgSlug}/thesis`}>
                  <Target className="h-4 w-4 mr-2" />
                  Criar Tese
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {hasActiveThesis && !hasMatches && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Radar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma oportunidade encontrada
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Nao encontramos empresas que correspondam as suas teses no momento.
                Novas oportunidades sao adicionadas diariamente.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/${orgSlug}/thesis`}>
                    Ajustar Teses
                  </Link>
                </Button>
                <Button disabled>
                  Ativar Alertas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasMatches && (
          <OpportunitiesList
            organizationId={org.id}
            opportunities={radarResult.data.opportunities}
            readOnlyMode={radarResult.data.readOnlyMode}
            fallbackUsed={radarResult.data.fallbackUsed}
          />
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit mb-2">Passo 1</Badge>
              <CardTitle className="text-sm font-medium">Defina suas Teses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crie teses com criterios como setor, faturamento, localizacao e estagio da empresa.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit mb-2">Passo 2</Badge>
              <CardTitle className="text-sm font-medium">Receba Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A Mary AI analisa empresas e gera um score de compatibilidade para cada oportunidade.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit mb-2">Passo 3</Badge>
              <CardTitle className="text-sm font-medium">Inicie Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Demonstre interesse e inicie o processo de due diligence com empresas selecionadas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (org.profile_type !== 'asset') {
    redirect(`/${orgSlug}/dashboard`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Radar"
        description="Monitore investidores aderentes ao perfil do seu ativo."
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Radar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Radar do Ativo em preparação
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Esta visão consolidará investidores aderentes, sinais de interesse e evolução por etapa.
            Enquanto finalizamos esta entrega, acompanhe seus dados no módulo de Projeto.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="gap-1">
              <Building2 className="h-3.5 w-3.5" />
              Match por perfil
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Sinais de interesse
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
