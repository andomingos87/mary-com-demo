import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Users, 
  Building2, 
  Activity,
  AlertTriangle,
  Construction,
} from 'lucide-react'

// ============================================
// Admin Dashboard Page
// ============================================

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get basic stats (using admin client would be better for real implementation)
  const { count: usersCount } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })

  const { count: orgsCount } = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)

  const { count: pendingCount } = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true })
    .eq('verification_status', 'pending')
    .is('deleted_at', null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Área Administrativa"
        description="Painel de controle da plataforma Mary"
      />

      {/* Under Construction Banner */}
      <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
            <Construction className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Área em Construção
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              O painel administrativo completo está sendo desenvolvido. 
              Por enquanto, você pode visualizar estatísticas básicas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Usuários"
          value={usersCount?.toString() || '0'}
          description="Usuários cadastrados"
          icon={Users}
        />
        <StatsCard
          title="Organizações"
          value={orgsCount?.toString() || '0'}
          description="Organizações ativas"
          icon={Building2}
        />
        <StatsCard
          title="Pendentes"
          value={pendingCount?.toString() || '0'}
          description="Aguardando verificação"
          icon={AlertTriangle}
          highlight={!!pendingCount && pendingCount > 0}
        />
        <StatsCard
          title="Status"
          value="Online"
          description="Sistema operacional"
          icon={Activity}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Verifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Verificações Pendentes</CardTitle>
              <Badge variant="secondary">{pendingCount || 0}</Badge>
            </div>
            <CardDescription>
              Organizações aguardando aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingCount && pendingCount > 0 ? (
              <p className="text-sm text-muted-foreground">
                Existem {pendingCount} organizações aguardando verificação.
                A funcionalidade de aprovação será implementada em breve.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma organização pendente de verificação.
              </p>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Sistema</CardTitle>
            <CardDescription>
              Status e configurações da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-medium">1.0.0-beta</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ambiente</span>
              <Badge variant="secondary">
                {process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento'}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium">Supabase</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planned Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funcionalidades Planejadas</CardTitle>
          <CardDescription>
            Recursos que serão adicionados ao painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PlannedFeature
              title="Gerenciamento de Usuários"
              description="Visualizar, editar e gerenciar contas de usuários"
            />
            <PlannedFeature
              title="Aprovação de Organizações"
              description="Revisar e aprovar novas organizações"
            />
            <PlannedFeature
              title="Logs de Auditoria"
              description="Visualizar logs de atividades da plataforma"
            />
            <PlannedFeature
              title="Configurações Globais"
              description="Gerenciar configurações da plataforma"
            />
            <PlannedFeature
              title="Relatórios"
              description="Gerar relatórios de uso e métricas"
            />
            <PlannedFeature
              title="Suporte"
              description="Gerenciar tickets de suporte"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Stats Card Component
// ============================================

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ElementType
  highlight?: boolean
}

function StatsCard({ title, value, description, icon: Icon, highlight = false }: StatsCardProps) {
  return (
    <Card className={highlight ? 'border-yellow-500/50' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${highlight ? 'text-yellow-500' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// ============================================
// Planned Feature Component
// ============================================

interface PlannedFeatureProps {
  title: string
  description: string
}

function PlannedFeature({ title, description }: PlannedFeatureProps) {
  return (
    <div className="p-4 border border-dashed border-border rounded-lg">
      <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
    </div>
  )
}

// ============================================
// Metadata
// ============================================

export const metadata = {
  title: 'Dashboard | Admin',
}
