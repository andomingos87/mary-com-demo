'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FolderKanban,
  FileBox,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  Shield,
} from 'lucide-react'

// ============================================
// Asset Dashboard Component
// ============================================

interface AssetDashboardProps {
  orgId: string
  orgName: string
  readOnlyMode?: boolean
}

export function AssetDashboard({ orgId, orgName, readOnlyMode = false }: AssetDashboardProps) {
  // In a real implementation, this would fetch data from the server
  // For now, we show placeholder data

  return (
    <div className="space-y-6">
      {/* Mary Readiness Score */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Mary Readiness Score®
              </CardTitle>
              <CardDescription>
                Sua pontuação de prontidão para transações de M&A
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">--</div>
              <div className="text-xs text-muted-foreground">de 100 pontos</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={0} className="h-2" />
          <p className="text-sm text-muted-foreground mt-3">
            Complete seu perfil e adicione documentos ao VDR para aumentar sua pontuação.
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Projetos Ativos"
          value="0"
          description="Nenhum projeto"
          icon={FolderKanban}
          status="neutral"
        />
        <StatsCard
          title="Documentos no VDR"
          value="0"
          description="Nenhum documento"
          icon={FileBox}
          status="neutral"
        />
        <StatsCard
          title="Investidores Interessados"
          value="0"
          description="Aguardando projeto"
          icon={TrendingUp}
          status="neutral"
        />
        <StatsCard
          title="Tarefas Pendentes"
          value="3"
          description="Ações recomendadas"
          icon={Clock}
          status="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          title="Criar Projeto"
          description="Inicie um projeto de venda, captação ou fusão"
          icon={FolderKanban}
          href={`#`}
          disabled={readOnlyMode}
          buttonText="Novo Projeto"
        />
        <QuickActionCard
          title="Configurar VDR"
          description="Organize seus documentos no Virtual Data Room"
          icon={FileBox}
          href={`#`}
          disabled={readOnlyMode}
          buttonText="Acessar VDR"
        />
        <QuickActionCard
          title="Completar Perfil"
          description="Adicione informações para melhorar seu Readiness Score"
          icon={CheckCircle2}
          href={`#`}
          disabled={readOnlyMode}
          buttonText="Editar Perfil"
        />
      </div>

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Recomendadas</CardTitle>
          <CardDescription>Complete estas tarefas para aumentar sua visibilidade</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ActionItem
            title="Adicionar demonstrações financeiras"
            description="Upload dos últimos 3 anos de balanços e DRE"
            status="pending"
            priority="high"
          />
          <ActionItem
            title="Completar informações societárias"
            description="Adicione contrato social e quadro de sócios"
            status="pending"
            priority="medium"
          />
          <ActionItem
            title="Definir objetivo de transação"
            description="Especifique se busca venda, captação ou fusão"
            status="pending"
            priority="medium"
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
  status: 'success' | 'warning' | 'neutral'
}

function StatsCard({ title, value, description, icon: Icon, status }: StatsCardProps) {
  const statusColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    neutral: 'text-muted-foreground',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${statusColors[status]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
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
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  disabled = false,
  buttonText,
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
        <Button disabled={disabled} asChild={!disabled} className="w-full">
          {disabled ? (
            buttonText
          ) : (
            <Link href={href}>
              <Plus className="h-4 w-4 mr-2" />
              {buttonText}
            </Link>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================
// Action Item Component
// ============================================

interface ActionItemProps {
  title: string
  description: string
  status: 'pending' | 'completed'
  priority: 'high' | 'medium' | 'low'
}

function ActionItem({ title, description, status, priority }: ActionItemProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  }

  const priorityLabels = {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className="mt-0.5">
        {status === 'completed' ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <Clock className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{title}</span>
          <Badge variant="secondary" className={`text-xs ${priorityColors[priority]}`}>
            {priorityLabels[priority]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Button variant="ghost" size="sm" className="flex-shrink-0">
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ============================================
// Loading Skeleton
// ============================================

export function AssetDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-2 w-full mb-3" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
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
    </div>
  )
}
