import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Filter, 
  Search,
  ArrowRight,
} from 'lucide-react'

// ============================================
// Advisor Projects Page
// ============================================

export default async function AdvisorProjectsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projetos"
        description="Todos os projetos atribuídos a você"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar projetos..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm"
            disabled
          />
        </div>
        <select
          className="px-4 py-2 border border-input rounded-md bg-background text-sm"
          disabled
        >
          <option>Todos os lados</option>
          <option>Sell-Side</option>
          <option>Buy-Side</option>
        </select>
        <select
          className="px-4 py-2 border border-input rounded-md bg-background text-sm"
          disabled
        >
          <option>Todos os status</option>
          <option>Em andamento</option>
          <option>Concluídos</option>
        </select>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum projeto atribuído
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Quando você for atribuído a projetos de M&A como advisor, 
            eles aparecerão aqui para você gerenciar.
          </p>
        </CardContent>
      </Card>

      {/* How it Works */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <Badge variant="secondary" className="w-fit mb-2">Passo 1</Badge>
            <CardTitle className="text-sm font-medium">Atribuição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você é atribuído a um projeto como advisor sell-side ou buy-side.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Badge variant="secondary" className="w-fit mb-2">Passo 2</Badge>
            <CardTitle className="text-sm font-medium">Acesso ao VDR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receba acesso ao VDR do projeto com permissões específicas para seu lado.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Badge variant="secondary" className="w-fit mb-2">Passo 3</Badge>
            <CardTitle className="text-sm font-medium">Acompanhamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Acompanhe o progresso e comunique-se de forma segura através da plataforma.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// Metadata
// ============================================

export const metadata = {
  title: 'Projetos | Advisor',
}
