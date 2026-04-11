import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'

// ============================================
// Profile Page (All Profiles)
// ============================================

interface ProfilePageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Get organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  const readOnlyMode = org.verification_status === 'pending'

  // Parse address if available
  const address = org.address_full as { 
    logradouro?: string
    numero?: string
    bairro?: string
    cidade?: string
    uf?: string
    cep?: string
  } | null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil da Organização"
        description="Informações e configurações da sua organização"
        actions={
          <Button variant="outline" disabled={readOnlyMode}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        }
      />

      {/* Status Banner */}
      <StatusBanner status={org.verification_status} />

      {/* Main Info */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Organization Card */}
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
                  <ProfileTypeBadge type={org.profile_type} />
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
              {org.founding_date && (
                <InfoItem
                  icon={Calendar}
                  label="Fundação"
                  value={new Date(org.founding_date).toLocaleDateString('pt-BR')}
                />
              )}
            </div>

            {/* Address */}
            {address && (
              <div className="pt-4 border-t border-border">
                <InfoItem
                  icon={MapPin}
                  label="Endereço"
                  value={formatAddress(address)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Atividade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CNAE</span>
                <span className="font-medium">{org.cnae_code || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Natureza Jurídica</span>
                <span className="font-medium truncate max-w-[150px]">
                  {org.legal_nature || '-'}
                </span>
              </div>
              {org.capital_social && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capital Social</span>
                  <span className="font-medium">
                    {formatCurrency(org.capital_social)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plano</span>
                <Badge variant="secondary">{org.plan || 'Free'}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Criado em</span>
                <span className="font-medium">
                  {new Date(org.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Status Banner Component
// ============================================

interface StatusBannerProps {
  status: string
}

function StatusBanner({ status }: StatusBannerProps) {
  if (status === 'completed' || status === 'verified') {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-sm text-green-800 dark:text-green-200">
          Conta verificada
        </span>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md">
        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm text-yellow-800 dark:text-yellow-200">
          Conta em análise - Algumas ações estão temporariamente desabilitadas
        </span>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <span className="text-sm text-red-800 dark:text-red-200">
          Verificação rejeitada - Entre em contato com o suporte
        </span>
      </div>
    )
  }

  return null
}

// ============================================
// Profile Type Badge Component
// ============================================

interface ProfileTypeBadgeProps {
  type: string
}

function ProfileTypeBadge({ type }: ProfileTypeBadgeProps) {
  const labels: Record<string, string> = {
    investor: 'Investidor',
    asset: 'Empresa',
    advisor: 'Advisor',
  }

  return (
    <Badge variant="secondary">
      {labels[type] || type}
    </Badge>
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

function formatAddress(address: {
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  uf?: string
  cep?: string
}): string {
  const parts = []
  if (address.logradouro) parts.push(address.logradouro)
  if (address.numero) parts.push(address.numero)
  if (address.bairro) parts.push(address.bairro)
  if (address.cidade && address.uf) parts.push(`${address.cidade}/${address.uf}`)
  if (address.cep) parts.push(`CEP ${address.cep}`)
  return parts.join(', ') || 'Endereço não informado'
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }: ProfilePageProps) {
  const { orgSlug } = await params
  return {
    title: `Perfil | ${orgSlug}`,
  }
}
