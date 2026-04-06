'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { File, Folder, Users, Eye } from 'lucide-react'
import type { VdrStats } from '@/types/vdr'

interface VdrStatsCardsProps {
  stats?: VdrStats
}

export function VdrStatsCards({ stats }: VdrStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Documentos"
        value={stats?.totalDocuments ?? 0}
        icon={File}
      />
      <StatsCard
        title="Pastas"
        value={stats?.totalFolders ?? 0}
        icon={Folder}
      />
      <StatsCard
        title="Links Ativos"
        value={stats?.totalSharedLinks ?? 0}
        icon={Users}
      />
      <StatsCard
        title="Visualizações"
        value={stats?.totalViews ?? 0}
        icon={Eye}
      />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  icon: React.ElementType
}

function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
