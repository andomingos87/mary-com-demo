'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Target,
  Radar,
  Kanban,
  TrendingUp,
  ArrowRight,
  Plus,
  FileText,
  Users,
} from 'lucide-react'

// ============================================
// Investor Dashboard Component
// ============================================

interface InvestorDashboardProps {
  orgId: string
  orgName: string
  readOnlyMode?: boolean
}

export function InvestorDashboard({ orgId, orgName, readOnlyMode = false }: InvestorDashboardProps) {
  // In a real implementation, this would fetch data from the server
  // For now, we show placeholder data

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Teses Ativas"
          value="0"
          description="Nenhuma tese criada"
          icon={Target}
          trend={null}
        />
        <StatsCard
          title="Radar"
          value="0"
          description="Aguardando teses"
          icon={Radar}
          trend={null}
        />
        <StatsCard
          title="Projetos"
          value="0"
          description="Nenhum projeto"
          icon={Kanban}
          trend={null}
        />
        <StatsCard
          title="Deal Flow"
          value="0"
          description="Este mês"
          icon={TrendingUp}
          trend={null}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          title="Criar Tese de Investimento"
          description="Defina seus critérios de investimento para receber oportunidades relevantes"
          icon={Target}
          href={`#`}
          disabled={readOnlyMode}
          buttonText="Nova Tese"
        />
        <QuickActionCard
          title="Explorar Radar"
          description="Veja empresas que correspondem às suas teses de investimento"
          icon={Radar}
          href={`#`}
          disabled={true}
          buttonText="Ver Radar"
          disabledReason="Crie uma tese primeiro"
        />
        <QuickActionCard
          title="Gerenciar Projetos"
          description="Acompanhe o progresso dos seus projetos de M&A"
          icon={Kanban}
          href={`#`}
          disabled={true}
          buttonText="Ver Projetos"
          disabledReason="Nenhum projeto ativo"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
          <CardDescription>Últimas atualizações da sua organização</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="Nenhuma atividade"
            description="Comece criando sua primeira tese de investimento"
          />
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
  trend: { value: number; isPositive: boolean } | null
}

function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% vs. mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Quick Action Card Component
// ============================================

interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ElementType
  href: string
  disabled?: boolean
  buttonText: string
  disabledReason?: string
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  disabled = false,
  buttonText,
  disabledReason,
}: QuickActionCardProps) {
  return (
    <Card className={disabled ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <div className="space-y-2">
            <Button disabled className="w-full">
              {buttonText}
            </Button>
            {disabledReason && (
              <p className="text-xs text-muted-foreground text-center">{disabledReason}</p>
            )}
          </div>
        ) : (
          <Button asChild className="w-full">
            <Link href={href}>
              <Plus className="h-4 w-4 mr-2" />
              {buttonText}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Empty State Component
// ============================================

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 bg-muted rounded-full mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && (
        <Button asChild variant="outline" className="mt-4">
          <Link href={action.href}>
            {action.label}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
    </div>
  )
}

// ============================================
// Loading Skeleton
// ============================================

export function InvestorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
