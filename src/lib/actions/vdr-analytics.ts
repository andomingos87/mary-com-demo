'use server'

import { createClient } from '@/lib/supabase/server'
import { DEFAULT_VDR_DOCUMENTS } from '@/types/vdr'
import type {
  VdrStats,
  VdrInvestorEngagement,
  VdrDocumentPriority,
} from '@/types/vdr'

type AnalyticsPeriod = '7d' | '30d' | 'all'

function getPeriodStartDate(period: AnalyticsPeriod): string | null {
  if (period === 'all') return null
  const days = period === '7d' ? 7 : 30
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

// =====================================================
// INVESTOR ACCESS ACTIONS
// =====================================================

/**
 * List VDRs that the current user has access to (as an investor)
 * Returns projects where the user has been granted VDR access
 */
export async function listAccessibleVdrs(): Promise<{
  success: boolean
  data?: Array<{
    project_id: string
    project_codename: string
    project_status: string
    owner_org_name: string
    owner_org_slug: string
    permission_type: 'view' | 'download' | 'share'
    granted_at: string
    expires_at: string | null
    document_count: number
  }>
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Get user's organization
  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return { success: false, error: 'Usuário não pertence a uma organização' }
  }

  // Get all active permissions for this user/org
  const { data: permissions, error: permError } = await supabase
    .from('vdr_access_permissions')
    .select(`
      id,
      project_id,
      permission_type,
      granted_at,
      expires_at
    `)
    .or(`grantee_user_id.eq.${user.id},grantee_org_id.eq.${member.organization_id}`)
    .is('revoked_at', null)
    .or('expires_at.is.null,expires_at.gt.now()')

  if (permError) {
    console.error('Error listing accessible VDRs:', permError)
    return { success: false, error: permError.message }
  }

  if (!permissions || permissions.length === 0) {
    return { success: true, data: [] }
  }

  // Get unique project IDs
  const projectIds = Array.from(new Set(permissions.map(p => p.project_id)))

  // Get project details with owner org info
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select(`
      id,
      codename,
      status,
      organization:organizations!organization_id(name, slug)
    `)
    .in('id', projectIds)
    .is('deleted_at', null)

  if (projError) {
    console.error('Error getting project details:', projError)
    return { success: false, error: projError.message }
  }

  // Get document counts for each project
  const docCountPromises = projectIds.map(async (projectId) => {
    const { count } = await supabase
      .from('vdr_documents')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'active')
      .is('deleted_at', null)
    return { projectId, count: count || 0 }
  })

  const docCounts = await Promise.all(docCountPromises)
  const docCountMap = Object.fromEntries(docCounts.map(d => [d.projectId, d.count]))

  // Build result combining permissions with project info
  const result = permissions
    .map(perm => {
      const project = projects?.find(p => p.id === perm.project_id)
      if (!project) return null

      const org = project.organization as { name: string; slug: string } | null

      return {
        project_id: project.id,
        project_codename: project.codename,
        project_status: project.status,
        owner_org_name: org?.name || 'Organização',
        owner_org_slug: org?.slug || '',
        permission_type: perm.permission_type as 'view' | 'download' | 'share',
        granted_at: perm.granted_at,
        expires_at: perm.expires_at,
        document_count: docCountMap[project.id] || 0,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return { success: true, data: result }
}

// =====================================================
// STATS ACTIONS
// =====================================================

/**
 * Get VDR stats for a project
 */
export async function getVdrStats(projectId: string): Promise<{
  success: boolean
  data?: VdrStats
  error?: string
}> {
  const supabase = await createClient()

  // Get counts in parallel
  const [foldersResult, documentsResult, linksResult, logsResult, allDocsResult] = await Promise.all([
    supabase
      .from('vdr_folders')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId),
    supabase
      .from('vdr_documents')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'active'),
    supabase
      .from('vdr_shared_links')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('is_active', true),
    supabase
      .from('vdr_access_logs')
      .select('*')
      .eq('project_id', projectId)
      .eq('action', 'view_start')
      .order('started_at', { ascending: false })
      .limit(10),
    // Get all documents for validation and status counts
    supabase
      .from('vdr_documents')
      .select('validation_n1, validation_n2, validation_n3, priority, status')
      .eq('project_id', projectId),
  ])

  // Count total views
  const { count: viewCount } = await supabase
    .from('vdr_access_logs')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('action', 'view_start')

  // Calculate validation counts
  const docs = allDocsResult.data || []
  const documentsWithN1 = docs.filter(d => d.validation_n1).length
  const documentsWithN2 = docs.filter(d => d.validation_n2).length
  const documentsWithN3 = docs.filter(d => d.validation_n3).length

  // Calculate priority counts
  const documentsByPriority: Record<VdrDocumentPriority, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }
  docs.forEach(d => {
    if (d.priority && documentsByPriority[d.priority as VdrDocumentPriority] !== undefined) {
      documentsByPriority[d.priority as VdrDocumentPriority]++
    }
  })

  // Calculate status counts
  const documentsByStatus: Record<string, number> = {}
  docs.forEach(d => {
    const status = d.status || 'pending'
    documentsByStatus[status] = (documentsByStatus[status] || 0) + 1
  })

  return {
    success: true,
    data: {
      totalFolders: foldersResult.count || 0,
      totalDocuments: documentsResult.count || 0,
      totalSharedLinks: linksResult.count || 0,
      totalViews: viewCount || 0,
      recentActivity: logsResult.data || [],
      documentsWithN1,
      documentsWithN2,
      documentsWithN3,
      documentsByPriority,
      documentsByStatus,
    },
  }
}

/**
 * Get engagement metrics by investor organization
 * Aggregates access logs by organization_id: total views, total duration, unique documents, last access
 */
export async function getEngagementByInvestor(
  projectId: string,
  period: AnalyticsPeriod = '30d'
): Promise<{
  success: boolean
  data?: VdrInvestorEngagement[]
  error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  const { data: hasAccess } = await supabase.rpc('can_manage_vdr', {
    p_user_id: user.id,
    p_project_id: projectId,
  })

  if (!hasAccess) {
    return { success: false, error: 'Sem permissão para visualizar analytics' }
  }

  let query = supabase
    .from('vdr_access_logs')
    .select(`
      organization_id,
      document_id,
      action,
      duration_seconds,
      started_at,
      organizations!organization_id(name, slug)
    `)
    .eq('project_id', projectId)
    .not('organization_id', 'is', null)

  const periodStart = getPeriodStartDate(period)
  if (periodStart) {
    query = query.gte('started_at', periodStart)
  }

  const { data: logs, error: logsError } = await query

  if (logsError) {
    console.error('Error getting engagement by investor:', logsError)
    return { success: false, error: logsError.message }
  }

  if (!logs || logs.length === 0) {
    return { success: true, data: [] }
  }

  const grouped = new Map<string, {
    organizationId: string
    organizationName: string
    organizationSlug: string
    totalViews: number
    totalDurationSeconds: number
    uniqueDocuments: Set<string>
    lastAccessAt: string | null
  }>()

  for (const row of logs) {
    const orgId = row.organization_id
    if (!orgId) continue
    const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations
    const current = grouped.get(orgId) || {
      organizationId: orgId,
      organizationName: (org as { name?: string } | null)?.name || 'Organização',
      organizationSlug: (org as { slug?: string } | null)?.slug || '',
      totalViews: 0,
      totalDurationSeconds: 0,
      uniqueDocuments: new Set<string>(),
      lastAccessAt: null,
    }

    if (row.action === 'view_start') current.totalViews += 1
    current.totalDurationSeconds += row.duration_seconds || 0
    if (row.document_id) current.uniqueDocuments.add(row.document_id)
    if (!current.lastAccessAt || new Date(row.started_at) > new Date(current.lastAccessAt)) {
      current.lastAccessAt = row.started_at
    }
    grouped.set(orgId, current)
  }

  const engagementList: VdrInvestorEngagement[] = Array.from(grouped.values())
    .map(item => ({
      organizationId: item.organizationId,
      organizationName: item.organizationName,
      organizationSlug: item.organizationSlug,
      totalViews: item.totalViews,
      totalDurationSeconds: item.totalDurationSeconds,
      uniqueDocuments: item.uniqueDocuments.size,
      lastAccessAt: item.lastAccessAt,
    }))
    .sort((a, b) => b.totalViews - a.totalViews)

  return { success: true, data: engagementList }
}

export async function getFolderInterest(
  projectId: string,
  period: AnalyticsPeriod = '30d'
): Promise<{
  success: boolean
  data?: Array<{
    folderId: string
    folderName: string
    views: number
    accessedDocuments: number
    totalDurationSeconds: number
  }>
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  let logsQuery = supabase
    .from('vdr_access_logs')
    .select('folder_id, document_id, action, duration_seconds, started_at')
    .eq('project_id', projectId)
    .not('folder_id', 'is', null)

  const periodStart = getPeriodStartDate(period)
  if (periodStart) logsQuery = logsQuery.gte('started_at', periodStart)

  const [{ data: logs, error: logsError }, { data: folders, error: folderError }] = await Promise.all([
    logsQuery,
    supabase.from('vdr_folders').select('id, name').eq('project_id', projectId),
  ])

  if (logsError || folderError) {
    return { success: false, error: logsError?.message || folderError?.message }
  }

  const folderMap = new Map((folders || []).map(f => [f.id, f.name]))
  const grouped = new Map<string, { views: number; docs: Set<string>; duration: number }>()

  for (const row of logs || []) {
    if (!row.folder_id) continue
    const current = grouped.get(row.folder_id) || { views: 0, docs: new Set<string>(), duration: 0 }
    if (row.action === 'view_start') current.views += 1
    if (row.document_id) current.docs.add(row.document_id)
    current.duration += row.duration_seconds || 0
    grouped.set(row.folder_id, current)
  }

  const data = Array.from(grouped.entries())
    .map(([folderId, metrics]) => ({
      folderId,
      folderName: folderMap.get(folderId) || 'Pasta',
      views: metrics.views,
      accessedDocuments: metrics.docs.size,
      totalDurationSeconds: metrics.duration,
    }))
    .sort((a, b) => b.views - a.views)

  return { success: true, data }
}

export async function getAccessTimeline(
  projectId: string,
  period: AnalyticsPeriod = '30d',
  granularity: 'day' | 'week' = 'day'
): Promise<{
  success: boolean
  data?: Array<{
    bucketDate: string
    views: number
    uniqueInvestors: number
    totalDurationSeconds: number
  }>
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  let query = supabase
    .from('vdr_access_logs')
    .select('started_at, action, duration_seconds, organization_id')
    .eq('project_id', projectId)
    .not('organization_id', 'is', null)

  const periodStart = getPeriodStartDate(period)
  if (periodStart) query = query.gte('started_at', periodStart)

  const { data: logs, error } = await query
  if (error) return { success: false, error: error.message }

  const grouped = new Map<string, { views: number; investors: Set<string>; duration: number }>()
  for (const row of logs || []) {
    const date = new Date(row.started_at)
    const bucket = granularity === 'week'
      ? new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()).toISOString().slice(0, 10)
      : date.toISOString().slice(0, 10)
    const current = grouped.get(bucket) || { views: 0, investors: new Set<string>(), duration: 0 }
    if (row.action === 'view_start') current.views += 1
    if (row.organization_id) current.investors.add(row.organization_id)
    current.duration += row.duration_seconds || 0
    grouped.set(bucket, current)
  }

  const data = Array.from(grouped.entries())
    .map(([bucketDate, metrics]) => ({
      bucketDate,
      views: metrics.views,
      uniqueInvestors: metrics.investors.size,
      totalDurationSeconds: metrics.duration,
    }))
    .sort((a, b) => a.bucketDate.localeCompare(b.bucketDate))

  return { success: true, data }
}

export async function getActivityAlerts(
  projectId: string,
  period: AnalyticsPeriod = '30d'
): Promise<{
  success: boolean
  data?: Array<{
    type: 'new_investor' | 'high_document_interest' | 'inactive_investor'
    severity: 'info' | 'warning'
    message: string
    createdAt: string
    investorId?: string
    documentId?: string
  }>
  error?: string
}> {
  const [engagementResult, timelineResult] = await Promise.all([
    getEngagementByInvestor(projectId, period),
    getAccessTimeline(projectId, period, 'day'),
  ])

  if (!engagementResult.success || !timelineResult.success) {
    return { success: false, error: engagementResult.error || timelineResult.error || 'Erro ao gerar alertas' }
  }

  const alerts: Array<{
    type: 'new_investor' | 'high_document_interest' | 'inactive_investor'
    severity: 'info' | 'warning'
    message: string
    createdAt: string
    investorId?: string
    documentId?: string
  }> = []

  const nowIso = new Date().toISOString()
  for (const investor of engagementResult.data || []) {
    if (investor.totalViews <= 2) {
      alerts.push({
        type: 'new_investor',
        severity: 'info',
        message: `${investor.organizationName} iniciou acompanhamento recente no VDR.`,
        createdAt: nowIso,
        investorId: investor.organizationId,
      })
    }

    if (investor.lastAccessAt) {
      const daysWithoutAccess = Math.floor((Date.now() - new Date(investor.lastAccessAt).getTime()) / 86400000)
      if (daysWithoutAccess >= 7) {
        alerts.push({
          type: 'inactive_investor',
          severity: 'warning',
          message: `${investor.organizationName} está sem acessar há ${daysWithoutAccess} dias.`,
          createdAt: nowIso,
          investorId: investor.organizationId,
        })
      }
    }
  }

  const peak = (timelineResult.data || []).reduce((max, item) => Math.max(max, item.views), 0)
  if (peak >= 20) {
    alerts.push({
      type: 'high_document_interest',
      severity: 'info',
      message: `Foi detectado pico de atividade (${peak} visualizações em um intervalo).`,
      createdAt: nowIso,
    })
  }

  return { success: true, data: alerts }
}

export async function getFolderCompleteness(
  projectId: string
): Promise<{
  success: boolean
  data?: Array<{
    folderId: string
    folderName: string
    expected: number
    actual: number
    completionPercent: number
  }>
  error?: string
}> {
  const supabase = await createClient()
  const { data: folders, error: folderError } = await supabase
    .from('vdr_folders')
    .select('id, name, code')
    .eq('project_id', projectId)

  if (folderError) return { success: false, error: folderError.message }

  const { data: docs, error: docError } = await supabase
    .from('vdr_documents')
    .select('folder_id')
    .eq('project_id', projectId)
    .neq('status', 'deleted')
    .is('deleted_at', null)

  if (docError) return { success: false, error: docError.message }

  const expectedByCode = DEFAULT_VDR_DOCUMENTS.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.folderCode] = (acc[doc.folderCode] || 0) + 1
    return acc
  }, {})

  const actualByFolder = (docs || []).reduce<Record<string, number>>((acc, doc) => {
    acc[doc.folder_id] = (acc[doc.folder_id] || 0) + 1
    return acc
  }, {})

  const data = (folders || []).map(folder => {
    const expected = expectedByCode[folder.code || ''] || 0
    const actual = actualByFolder[folder.id] || 0
    const completionPercent = expected > 0 ? Math.min(100, Math.round((actual / expected) * 100)) : 100
    return {
      folderId: folder.id,
      folderName: folder.name,
      expected,
      actual,
      completionPercent,
    }
  })

  return { success: true, data }
}

export async function exportEngagementReport(
  projectId: string,
  options?: { period?: AnalyticsPeriod; format?: 'csv' }
): Promise<{
  success: boolean
  data?: { fileName: string; mimeType: string; content: string }
  error?: string
}> {
  const period = options?.period || '30d'
  const format = options?.format || 'csv'
  if (format !== 'csv') {
    return { success: false, error: 'Formato não suportado nesta fase' }
  }

  const [engagement, folderInterest, timeline] = await Promise.all([
    getEngagementByInvestor(projectId, period),
    getFolderInterest(projectId, period),
    getAccessTimeline(projectId, period, 'day'),
  ])

  if (!engagement.success || !folderInterest.success || !timeline.success) {
    return { success: false, error: 'Falha ao consolidar dados do relatório' }
  }

  const csvLines: string[] = []
  csvLines.push(`Relatorio de Engajamento VDR;Projeto;${projectId};Periodo;${period};GeradoEm;${new Date().toISOString()}`)
  csvLines.push('')
  csvLines.push('Ranking de Investidores')
  csvLines.push('Organizacao;Visualizacoes;TempoTotalSegundos;DocumentosUnicos;UltimoAcesso')
  for (const row of engagement.data || []) {
    csvLines.push(`${row.organizationName};${row.totalViews};${row.totalDurationSeconds};${row.uniqueDocuments};${row.lastAccessAt || ''}`)
  }

  csvLines.push('')
  csvLines.push('Interesse por Pasta')
  csvLines.push('Pasta;Visualizacoes;DocumentosAcessados;TempoTotalSegundos')
  for (const row of folderInterest.data || []) {
    csvLines.push(`${row.folderName};${row.views};${row.accessedDocuments};${row.totalDurationSeconds}`)
  }

  csvLines.push('')
  csvLines.push('Timeline de Acesso')
  csvLines.push('Data;Visualizacoes;InvestidoresUnicos;TempoTotalSegundos')
  for (const row of timeline.data || []) {
    csvLines.push(`${row.bucketDate};${row.views};${row.uniqueInvestors};${row.totalDurationSeconds}`)
  }

  return {
    success: true,
    data: {
      fileName: `vdr-engagement-${projectId}-${period}.csv`,
      mimeType: 'text/csv;charset=utf-8',
      content: csvLines.join('\n'),
    },
  }
}
