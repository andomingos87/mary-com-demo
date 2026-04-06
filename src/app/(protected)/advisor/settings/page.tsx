import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Bell, 
  Shield, 
  AlertTriangle,
} from 'lucide-react'

// ============================================
// Advisor Settings Page
// ============================================

export default async function AdvisorSettingsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie suas preferências e configurações"
      />

      {/* Notifications */}
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
            title="Novos Projetos"
            description="Seja notificado quando for atribuído a um novo projeto"
            enabled={true}
            disabled
          />
          <NotificationSetting
            title="Atualizações de Projetos"
            description="Receba atualizações sobre o progresso dos projetos"
            enabled={true}
            disabled
          />
          <NotificationSetting
            title="Alertas de Conflito"
            description="Seja alertado sobre possíveis conflitos de interesse"
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

      {/* Conflict Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Conflitos de Interesse</CardTitle>
          </div>
          <CardDescription>
            Configure as regras de detecção de conflitos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              O sistema detecta automaticamente conflitos quando você é atribuído a projetos 
              que envolvem partes relacionadas ou setores concorrentes. Você será alertado 
              antes de aceitar qualquer projeto que possa gerar conflito.
            </p>
          </div>
          <NotificationSetting
            title="Verificação Automática"
            description="Verificar conflitos automaticamente ao receber novos projetos"
            enabled={true}
            disabled
          />
          <NotificationSetting
            title="Bloqueio Automático"
            description="Bloquear automaticamente projetos com conflito detectado"
            enabled={false}
            disabled
          />
        </CardContent>
      </Card>

      {/* Security */}
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

export const metadata = {
  title: 'Configurações | Advisor',
}
