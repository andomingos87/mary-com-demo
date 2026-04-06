import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileBox,
  FolderOpen,
  Eye,
  Clock,
  Building2,
  ArrowRight,
  FileText,
  Shield,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { listAccessibleVdrs } from '@/lib/actions/vdr'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ============================================
// Investor VDR Page
// ============================================

interface InvestorVdrPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function InvestorVdrPage({ params }: InvestorVdrPageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Get organization and verify it's an investor
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, profile_type, verification_status')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  // Verify this is an investor organization
  if (org.profile_type !== 'investor') {
    redirect(`/${orgSlug}/dashboard`)
  }

  // Get accessible VDRs
  const vdrsResult = await listAccessibleVdrs()
  const accessibleVdrs = vdrsResult.data || []

  // Separate active and expired
  const activeVdrs = accessibleVdrs.filter(v => 
    v.project_status !== 'closed' && 
    (!v.expires_at || new Date(v.expires_at) > new Date())
  )
  const expiredVdrs = accessibleVdrs.filter(v => 
    v.project_status === 'closed' || 
    (v.expires_at && new Date(v.expires_at) <= new Date())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Rooms"
        description="Acesse os Virtual Data Rooms dos projetos em que você foi autorizado"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VDRs Ativos</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVdrs.length}</div>
            <p className="text-xs text-muted-foreground">
              Projetos com acesso ativo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Disponíveis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeVdrs.reduce((sum, v) => sum + v.document_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de documentos acessíveis
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Expirados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredVdrs.length}</div>
            <p className="text-xs text-muted-foreground">
              Projetos com acesso encerrado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active VDRs */}
      {activeVdrs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>VDRs com Acesso Ativo</CardTitle>
            <CardDescription>
              Clique em um projeto para acessar os documentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeVdrs.map((vdr) => (
                <Link
                  key={vdr.project_id}
                  href={`/${orgSlug}/projects/${vdr.project_codename}/vdr`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileBox className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{vdr.project_codename}</span>
                        <Badge variant="outline" className="text-xs">
                          {vdr.permission_type === 'view' && 'Visualização'}
                          {vdr.permission_type === 'download' && 'Download'}
                          {vdr.permission_type === 'share' && 'Compartilhar'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {vdr.owner_org_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {vdr.document_count} documento{vdr.document_count !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Acesso há {formatDistanceToNow(new Date(vdr.granted_at), { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {vdr.expires_at && (
                      <Badge variant="secondary" className="text-xs">
                        Expira {formatDistanceToNow(new Date(vdr.expires_at), { addSuffix: true, locale: ptBR })}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FileBox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Nenhum VDR disponível
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Você ainda não tem acesso a nenhum Virtual Data Room. 
              Quando uma empresa conceder acesso, os documentos aparecerão aqui.
            </p>
            <Button variant="outline" asChild>
              <Link href={`/${orgSlug}/radar`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Radar
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Expired VDRs */}
      {expiredVdrs.length > 0 && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-muted-foreground">Acessos Encerrados</CardTitle>
            <CardDescription>
              Projetos cujo acesso expirou ou foi revogado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiredVdrs.map((vdr) => (
                <div
                  key={vdr.project_id}
                  className="flex items-center justify-between p-3 rounded-lg border border-muted bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileBox className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">{vdr.project_codename}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {vdr.owner_org_name}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {vdr.project_status === 'closed' ? 'Projeto encerrado' : 'Acesso expirado'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Sobre o Acesso ao VDR</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <p className="font-medium">Acesso Controlado</p>
              <p className="text-muted-foreground text-xs mt-1">
                Cada acesso é concedido individualmente pelo gestor do projeto
              </p>
            </div>
            <div>
              <p className="font-medium">Atividade Auditada</p>
              <p className="text-muted-foreground text-xs mt-1">
                Todas as visualizações são registradas para segurança
              </p>
            </div>
            <div>
              <p className="font-medium">Q&A Disponível</p>
              <p className="text-muted-foreground text-xs mt-1">
                Faça perguntas diretamente sobre os documentos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }: InvestorVdrPageProps) {
  const { orgSlug } = await params
  return {
    title: `Data Rooms | ${orgSlug}`,
  }
}
