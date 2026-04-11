import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  Award,
  Edit,
  CheckCircle2,
  Clock,
} from 'lucide-react'

// ============================================
// Advisor Profile Page
// ============================================

export default async function AdvisorProfilePage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get advisor organization
  const { data: orgs } = await supabase.rpc('get_user_organizations', {
    p_user_id: user.id
  })

  const advisorOrg = orgs?.find((o: { profile_type: string }) => o.profile_type === 'advisor')
  if (!advisorOrg) {
    redirect('/dashboard')
  }

  // Get full organization data
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', advisorOrg.organization_id)
    .single()

  if (!org) {
    redirect('/dashboard')
  }

  const readOnlyMode = org.verification_status === 'pending'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil do Advisor"
        description="Suas informações profissionais. Use a Mary AI no topo para dúvidas sobre verificação e mandatos."
        actions={
          <Button variant="outline" disabled={readOnlyMode}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        }
      />

      <div
        className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground shadow-card"
        role="note"
      >
        Nesta área, a Mary AI sugere atalhos contextuais (ex.: equipe e segurança) ao abrir o painel
        no canto superior da tela.
      </div>

      {/* Status Banner */}
      {org.verification_status === 'pending' && (
        <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md">
          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            Perfil em análise - Aguardando verificação
          </span>
        </div>
      )}

      {org.verification_status === 'completed' && (
        <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-800 dark:text-green-200">
            Perfil verificado
          </span>
        </div>
      )}

      {/* Main Info */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-start gap-4">
              {org.logo_url ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={org.logo_url}
                    alt={org.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{org.name}</CardTitle>
                  <Badge variant="secondary">Advisor</Badge>
                </div>
                <CardDescription className="mt-1">
                  {org.description || 'Nenhuma descrição adicionada'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              {org.website && (
                <InfoItem
                  icon={Globe}
                  label="Website"
                  value={org.website}
                  href={org.website}
                />
              )}
              {org.phone && (
                <InfoItem
                  icon={Phone}
                  label="Telefone"
                  value={org.phone}
                />
              )}
              {org.cnpj && (
                <InfoItem
                  icon={Building2}
                  label="CNPJ"
                  value={formatCnpj(org.cnpj)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Credenciais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Registro CVM</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Especialização</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lado Preferido</span>
                <span className="font-medium">-</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projetos Ativos</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projetos Concluídos</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Na plataforma desde</span>
                <span className="font-medium">
                  {new Date(org.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Certificações e Credenciais</CardTitle>
          </div>
          <CardDescription>
            Adicione suas certificações para aumentar sua credibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Award className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium text-sm">Nenhuma certificação adicionada</p>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione certificações CVM, CFA, ou outras relevantes
            </p>
            <Button variant="outline" className="mt-4" disabled={readOnlyMode}>
              Adicionar Certificação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Info Item Component
// ============================================

interface InfoItemProps {
  icon: React.ElementType
  label: string
  value: string
  href?: string
}

function InfoItem({ icon: Icon, label, value, href }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm">{value}</p>
        )}
      </div>
    </div>
  )
}

// ============================================
// Helper Functions
// ============================================

function formatCnpj(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '')
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// ============================================
// Metadata
// ============================================

export const metadata = {
  title: 'Perfil | Advisor',
}
