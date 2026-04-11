import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageHeader, SectionHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Users, 
  Bell, 
  CreditCard, 
  Shield, 
  Trash2,
  Plus,
  Mail,
} from 'lucide-react'

// ============================================
// Settings Page (All Profiles)
// ============================================

interface SettingsPageProps {
  params: Promise<{ orgSlug: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgSlug } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    notFound()
  }

  // Get organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, profile_type, verification_status')
    .eq('slug', orgSlug)
    .is('deleted_at', null)
    .single()

  if (orgError || !org) {
    notFound()
  }

  // Get membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single()

  const isOwnerOrAdmin = membership?.role === 'owner' || membership?.role === 'admin'
  const isOwner = membership?.role === 'owner'
  const readOnlyMode = org.verification_status === 'pending'

  // Get members count
  const { count: membersCount } = await supabase
    .from('organization_members')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', org.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da sua organização"
      />

      {/* Members Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Membros</CardTitle>
            </div>
            <Badge variant="secondary">{membersCount || 0} membros</Badge>
          </div>
          <CardDescription>
            Gerencie os membros da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Member List Placeholder */}
          <div className="border border-border rounded-lg divide-y divide-border">
            <MemberRow
              name={user.email || 'Você'}
              email={user.email || ''}
              role={membership?.role || 'member'}
              isCurrentUser
            />
          </div>

          {isOwnerOrAdmin && (
            <Button variant="outline" disabled={readOnlyMode}>
              <Plus className="h-4 w-4 mr-2" />
              Convidar Membro
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Notificações</CardTitle>
          </div>
          <CardDescription>
            Configure como você recebe notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationSetting
            title="Notificações por Email"
            description="Receba atualizações importantes por email"
            enabled={true}
            disabled
          />
          <NotificationSetting
            title="Notificações de Oportunidades"
            description="Seja notificado quando houver novas oportunidades"
            enabled={true}
            disabled
          />
          <NotificationSetting
            title="Resumo Semanal"
            description="Receba um resumo semanal das atividades"
            enabled={false}
            disabled
          />
        </CardContent>
      </Card>

      {/* Billing Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Faturamento</CardTitle>
          </div>
          <CardDescription>
            Gerencie seu plano e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Plano Atual</p>
              <p className="text-sm text-muted-foreground">Free</p>
            </div>
            <Button variant="outline" disabled>
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Segurança</CardTitle>
          </div>
          <CardDescription>
            Configurações de segurança da conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Autenticação em Duas Etapas</p>
              <p className="text-xs text-muted-foreground">
                Adicione uma camada extra de segurança
              </p>
            </div>
            <Badge variant="secondary">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Sessões Ativas</p>
              <p className="text-xs text-muted-foreground">
                Gerencie dispositivos conectados
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg text-destructive">Zona de Perigo</CardTitle>
            </div>
            <CardDescription>
              Ações irreversíveis para sua organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <div>
                <p className="font-medium text-sm">Excluir Organização</p>
                <p className="text-xs text-muted-foreground">
                  Esta ação é permanente e não pode ser desfeita
                </p>
              </div>
              <Button variant="destructive" size="sm" disabled={readOnlyMode}>
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Member Row Component
// ============================================

interface MemberRowProps {
  name: string
  email: string
  role: string
  isCurrentUser?: boolean
}

function MemberRow({ name, email, role, isCurrentUser = false }: MemberRowProps) {
  const roleLabels: Record<string, string> = {
    owner: 'Proprietário',
    admin: 'Administrador',
    member: 'Membro',
    viewer: 'Visualizador',
  }

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
          <span className="text-sm font-medium">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium text-sm">
            {name}
            {isCurrentUser && <span className="text-muted-foreground"> (você)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <Badge variant="secondary">{roleLabels[role] || role}</Badge>
    </div>
  )
}

// ============================================
// Notification Setting Component
// ============================================

interface NotificationSettingProps {
  title: string
  description: string
  enabled: boolean
  disabled?: boolean
}

function NotificationSetting({ title, description, enabled, disabled = false }: NotificationSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${enabled ? 'bg-primary' : 'bg-muted'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        disabled={disabled}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }: SettingsPageProps) {
  const { orgSlug } = await params
  return {
    title: `Configurações | ${orgSlug}`,
  }
}
