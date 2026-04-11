'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  CreditCard,
  Shield,
  Trash2,
  Plus,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingsTab = 'conta' | 'faturamento' | 'equipe'

const TAB_VALUES: SettingsTab[] = ['conta', 'faturamento', 'equipe']

function parseTab(value: string | null | undefined): SettingsTab {
  if (value && TAB_VALUES.includes(value as SettingsTab)) {
    return value as SettingsTab
  }
  return 'conta'
}

export type OrgSettingsWorkspaceProps = {
  variant: 'org'
  orgDisplayName: string
  membersCount: number
  currentUserEmail: string
  membershipRole: string
  isOwnerOrAdmin: boolean
  isOwner: boolean
  readOnlyMode: boolean
  defaultTab?: string | null
}

export type AdvisorSettingsWorkspaceProps = {
  variant: 'advisor'
  defaultTab?: string | null
}

export type SettingsWorkspaceProps = OrgSettingsWorkspaceProps | AdvisorSettingsWorkspaceProps

function NotificationSetting({
  title,
  description,
  enabled,
  disabled = false,
}: {
  title: string
  description: string
  enabled: boolean
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-muted',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        )}
        disabled={disabled}
        aria-disabled={disabled}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-background transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  )
}

function MemberRow({
  name,
  email,
  role,
  isCurrentUser = false,
}: {
  name: string
  email: string
  role: string
  isCurrentUser?: boolean
}) {
  const roleLabels: Record<string, string> = {
    owner: 'Proprietário',
    admin: 'Administrador',
    member: 'Membro',
    viewer: 'Visualizador',
  }

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <span className="text-sm font-medium">{name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="text-sm font-medium">
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

export function SettingsWorkspace(props: SettingsWorkspaceProps) {
  const initialTab = parseTab(props.defaultTab ?? undefined)

  if (props.variant === 'advisor') {
    return (
      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="conta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da conta</CardTitle>
              <CardDescription>
                Preferências de notificações, conflitos de interesse e segurança da sua conta de
                assessor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Bell className="h-4 w-4 text-muted-foreground" aria-hidden />
                  Notificações
                </div>
                <div className="space-y-4 border-t border-border pt-4">
                  <NotificationSetting
                    title="Novos projetos"
                    description="Seja notificado quando for atribuído a um novo projeto"
                    enabled
                    disabled
                  />
                  <NotificationSetting
                    title="Atualizações de projetos"
                    description="Receba atualizações sobre o progresso dos projetos"
                    enabled
                    disabled
                  />
                  <NotificationSetting
                    title="Alertas de conflito"
                    description="Seja alertado sobre possíveis conflitos de interesse"
                    enabled
                    disabled
                  />
                  <NotificationSetting
                    title="Resumo semanal"
                    description="Receba um resumo semanal das atividades"
                    enabled={false}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" aria-hidden />
                  Conflitos de interesse
                </div>
                <p className="text-sm text-muted-foreground">
                  O sistema pode alertar quando um mandato envolver partes relacionadas ou setores
                  concorrentes. Você revisa antes de aceitar novos projetos.
                </p>
                <div className="space-y-4">
                  <NotificationSetting
                    title="Verificação automática"
                    description="Verificar conflitos ao receber novos projetos"
                    enabled
                    disabled
                  />
                  <NotificationSetting
                    title="Bloqueio automático"
                    description="Bloquear projetos com conflito detectado"
                    enabled={false}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
                  Segurança
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Autenticação em duas etapas</p>
                    <p className="text-xs text-muted-foreground">Camada extra de segurança</p>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Sessões ativas</p>
                    <p className="text-xs text-muted-foreground">Dispositivos conectados</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Gerenciar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturamento">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" aria-hidden />
                <CardTitle className="text-lg">Faturamento</CardTitle>
              </div>
              <CardDescription>Plano e pagamentos do seu escritório na Mary.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">Plano atual</p>
                  <p className="text-sm text-muted-foreground">Free — detalhes de faturamento em breve</p>
                </div>
                <Button variant="outline" disabled>
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipe">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" aria-hidden />
                <CardTitle className="text-lg">Equipe</CardTitle>
              </div>
              <CardDescription>
                Convites e papéis do escritório serão integrados aqui nas próximas entregas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Enquanto isso, use a Mary AI no canto superior para tirar dúvidas sobre fluxo de
                mandatos e governança.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    )
  }

  const {
    orgDisplayName,
    membersCount,
    currentUserEmail,
    membershipRole,
    isOwnerOrAdmin,
    isOwner,
    readOnlyMode,
  } = props

  return (
    <Tabs defaultValue={initialTab} className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="conta">Conta</TabsTrigger>
        <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
        <TabsTrigger value="equipe">Equipe</TabsTrigger>
      </TabsList>

      <TabsContent value="conta" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações da conta</CardTitle>
            <CardDescription>
              Gerencie suas informações de conta, configurações de segurança, notificações e
              preferências da organização.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-4 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Organização
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">{orgDisplayName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Bell className="h-4 w-4 text-muted-foreground" aria-hidden />
                Notificações
              </div>
              <div className="space-y-4 border-t border-border pt-4">
                <NotificationSetting
                  title="Notificações por email"
                  description="Receba atualizações importantes por email"
                  enabled
                  disabled
                />
                <NotificationSetting
                  title="Notificações de oportunidades"
                  description="Seja notificado quando houver novas oportunidades"
                  enabled
                  disabled
                />
                <NotificationSetting
                  title="Resumo semanal"
                  description="Receba um resumo semanal das atividades"
                  enabled={false}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="h-4 w-4 text-muted-foreground" aria-hidden />
                Segurança
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Autenticação em duas etapas</p>
                  <p className="text-xs text-muted-foreground">Camada extra de segurança</p>
                </div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Sessões ativas</p>
                  <p className="text-xs text-muted-foreground">Gerencie dispositivos conectados</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Gerenciar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faturamento">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" aria-hidden />
              <CardTitle className="text-lg">Faturamento</CardTitle>
            </div>
            <CardDescription>Gerencie seu plano e pagamentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">Plano atual</p>
                <p className="text-sm text-muted-foreground">Free</p>
              </div>
              <Button variant="outline" disabled>
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="equipe">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" aria-hidden />
                <CardTitle className="text-lg">Equipe</CardTitle>
              </div>
              <Badge variant="secondary">{membersCount} membros</Badge>
            </div>
            <CardDescription>Gerencie os membros da sua organização.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y divide-border rounded-lg border border-border">
              <MemberRow
                name={currentUserEmail || 'Você'}
                email={currentUserEmail || ''}
                role={membershipRole}
                isCurrentUser
              />
            </div>

            {isOwnerOrAdmin && (
              <Button variant="outline" disabled={readOnlyMode}>
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Convidar membro
              </Button>
            )}
          </CardContent>
        </Card>

        {isOwner && (
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" aria-hidden />
                <CardTitle className="text-lg text-destructive">Zona de perigo</CardTitle>
              </div>
              <CardDescription>Ações irreversíveis para sua organização.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Excluir organização</p>
                  <p className="text-xs text-muted-foreground">Permanente e sem desfazer</p>
                </div>
                <Button variant="destructive" size="sm" disabled={readOnlyMode}>
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
