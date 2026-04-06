'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpDown, Eye, Clock, FileText, Calendar, Download, Activity } from 'lucide-react'
import {
  getEngagementByInvestor,
  getFolderInterest,
  getAccessTimeline,
  getActivityAlerts,
  getFolderCompleteness,
  exportEngagementReport,
} from '@/lib/actions/vdr'
import { toast } from 'sonner'
import type { VdrInvestorEngagement } from '@/types/vdr'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface VdrEngagementDashboardProps {
  projectId: string
}

type SortField = 'views' | 'duration' | 'documents'
type AnalyticsPeriod = '7d' | '30d' | 'all'

export function VdrEngagementDashboard({ projectId }: VdrEngagementDashboardProps) {
  const [engagement, setEngagement] = useState<VdrInvestorEngagement[]>([])
  const [folderInterest, setFolderInterest] = useState<Array<{ folderName: string; views: number; accessedDocuments: number; totalDurationSeconds: number }>>([])
  const [timeline, setTimeline] = useState<Array<{ bucketDate: string; views: number; uniqueInvestors: number }>>([])
  const [alerts, setAlerts] = useState<Array<{ message: string; severity: 'info' | 'warning' }>>([])
  const [folderCompleteness, setFolderCompleteness] = useState<Array<{ folderName: string; completionPercent: number; actual: number; expected: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortField>('views')
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')
  const [isExporting, setIsExporting] = useState(false)

  const loadEngagement = useCallback(async () => {
    setIsLoading(true)
    const [engagementResult, folderResult, timelineResult, alertsResult, completenessResult] = await Promise.all([
      getEngagementByInvestor(projectId, period),
      getFolderInterest(projectId, period),
      getAccessTimeline(projectId, period, 'day'),
      getActivityAlerts(projectId, period),
      getFolderCompleteness(projectId),
    ])

    if (engagementResult.success && engagementResult.data) {
      setEngagement(engagementResult.data)
    } else {
      toast.error(engagementResult.error || 'Erro ao carregar engajamento')
      setEngagement([])
    }
    setFolderInterest(folderResult.success ? (folderResult.data || []) : [])
    setTimeline(timelineResult.success ? (timelineResult.data || []) : [])
    setAlerts(alertsResult.success ? (alertsResult.data || []) : [])
    setFolderCompleteness(completenessResult.success ? (completenessResult.data || []) : [])
    setIsLoading(false)
  }, [projectId, period])

  useEffect(() => {
    loadEngagement()
  }, [loadEngagement])

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    const result = await exportEngagementReport(projectId, { period, format: 'csv' })
    if (!result.success || !result.data) {
      toast.error(result.error || 'Erro ao exportar relatório')
      setIsExporting(false)
      return
    }

    const blob = new Blob([result.data.content], { type: result.data.mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.data.fileName
    link.click()
    URL.revokeObjectURL(url)
    setIsExporting(false)
  }, [period, projectId])

  const sortedEngagement = useMemo(() => {
    const sorted = [...engagement]

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.totalViews - a.totalViews
        case 'duration':
          return b.totalDurationSeconds - a.totalDurationSeconds
        case 'documents':
          return b.uniqueDocuments - a.uniqueDocuments
        default:
          return b.totalViews - a.totalViews
      }
    })

    return sorted
  }, [engagement, sortBy])

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const formatLastAccess = (dateString: string | null): string => {
    if (!dateString) return 'Nunca'
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return 'Data inválida'
    }
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  const handleSort = (field: SortField) => {
    setSortBy(field)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engajamento por Investidor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sortedEngagement.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engajamento por Investidor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de engajamento disponível ainda.</p>
            <p className="text-sm mt-2">Os dados aparecerão quando investidores começarem a visualizar documentos.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Engajamento por Investidor</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Ranking, interesse por pasta, timeline e alertas de atividade
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border p-1">
              {(['7d', '30d', 'all'] as AnalyticsPeriod[]).map(option => (
                <Button
                  key={option}
                  variant={period === option ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ranking" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="folders">Pastas</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>
          <TabsContent value="ranking">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground w-[50px]">#</th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">Investidor</th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-8 -ml-2" onClick={() => handleSort('views')}>
                        <Eye className="h-4 w-4 mr-2" />Visualizações
                        {sortBy === 'views' && <ArrowUpDown className="h-3 w-3 ml-1" />}
                      </Button>
                    </th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-8 -ml-2" onClick={() => handleSort('duration')}>
                        <Clock className="h-4 w-4 mr-2" />Tempo Total
                        {sortBy === 'duration' && <ArrowUpDown className="h-3 w-3 ml-1" />}
                      </Button>
                    </th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="h-8 -ml-2" onClick={() => handleSort('documents')}>
                        <FileText className="h-4 w-4 mr-2" />Docs Únicos
                        {sortBy === 'documents' && <ArrowUpDown className="h-3 w-3 ml-1" />}
                      </Button>
                    </th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />Último Acesso</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEngagement.map((item, index) => (
                    <tr key={item.organizationId} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3"><Badge variant="outline" className="font-mono">{index + 1}</Badge></td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{getInitials(item.organizationName)}</AvatarFallback></Avatar>
                          <div>
                            <div className="font-medium">{item.organizationName}</div>
                            <div className="text-xs text-muted-foreground">{item.organizationSlug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3"><div className="font-medium">{item.totalViews}</div></td>
                      <td className="p-3"><div className="font-medium">{item.totalDurationSeconds > 0 ? formatDuration(item.totalDurationSeconds) : '-'}</div></td>
                      <td className="p-3"><div className="font-medium">{item.uniqueDocuments}</div></td>
                      <td className="p-3"><div className="text-sm text-muted-foreground">{formatLastAccess(item.lastAccessAt)}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="folders">
            <div className="space-y-3">
              {folderInterest.map(folder => (
                <div key={folder.folderName} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{folder.folderName}</p>
                      <p className="text-xs text-muted-foreground">{folder.views} views · {folder.accessedDocuments} docs acessados</p>
                    </div>
                    <Badge variant="secondary">{formatDuration(folder.totalDurationSeconds)}</Badge>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-2">Completude por pasta</p>
                <div className="space-y-2">
                  {folderCompleteness.map(item => (
                    <div key={item.folderName}>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.folderName}</span>
                        <span>{item.actual}/{item.expected || item.actual} ({item.completionPercent}%)</span>
                      </div>
                      <div className="h-2 rounded bg-muted mt-1">
                        <div className="h-2 rounded bg-primary" style={{ width: `${item.completionPercent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="timeline">
            <div className="space-y-2">
              {timeline.map(item => (
                <div key={item.bucketDate} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">{item.bucketDate}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.views} views · {item.uniqueInvestors} investidores
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="alerts">
            <div className="space-y-2">
              {alerts.length === 0 && (
                <div className="text-sm text-muted-foreground">Nenhum alerta relevante no período.</div>
              )}
              {alerts.map((alert, idx) => (
                <div key={`${alert.message}-${idx}`} className="flex items-start gap-2 rounded-md border p-3">
                  <Activity className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.severity === 'warning' ? 'Atenção' : 'Informativo'}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
