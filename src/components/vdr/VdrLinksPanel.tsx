'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Link as LinkIcon,
  Copy,
  Check,
  Trash2,
  Clock,
  Eye,
  Lock,
  FileText,
  Folder,
  Loader2,
  ExternalLink,
  AlertCircle,
  Filter,
} from 'lucide-react'
import { listSharedLinksWithDetails, revokeSharedLink } from '@/lib/actions/vdr'
import type { VdrSharedLink } from '@/types/vdr'

type LinkStatus = 'active' | 'expired' | 'revoked' | 'max_views_reached'
type FilterStatus = 'all' | LinkStatus

interface SharedLinkWithDetails extends VdrSharedLink {
  document: { id: string; name: string } | null
  folder: { id: string; name: string } | null
  status: LinkStatus
}

interface VdrLinksPanelProps {
  projectId: string
}

export function VdrLinksPanel({ projectId }: VdrLinksPanelProps) {
  const router = useRouter()
  const [links, setLinks] = useState<SharedLinkWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<SharedLinkWithDetails | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const loadLinks = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await listSharedLinksWithDetails(projectId)

    if (result.success && result.data) {
      setLinks(result.data)
    } else {
      setError(result.error || 'Erro ao carregar links')
    }

    setIsLoading(false)
  }, [projectId])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  const handleCopy = async (link: SharedLinkWithDetails) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const url = `${baseUrl}/vdr/share/${link.token}`
    
    await navigator.clipboard.writeText(url)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return

    setIsRevoking(true)
    const result = await revokeSharedLink(revokeTarget.id)

    if (result.success) {
      await loadLinks()
      router.refresh()
    } else {
      setError(result.error || 'Erro ao revogar link')
    }

    setIsRevoking(false)
    setRevokeTarget(null)
  }

  const getStatusBadge = (status: LinkStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>
      case 'expired':
        return <Badge variant="secondary">Expirado</Badge>
      case 'revoked':
        return <Badge variant="destructive">Revogado</Badge>
      case 'max_views_reached':
        return <Badge variant="outline">Limite atingido</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredLinks = filterStatus === 'all' 
    ? links 
    : links.filter(link => link.status === filterStatus)

  const activeCount = links.filter(l => l.status === 'active').length
  const expiredCount = links.filter(l => l.status === 'expired').length
  const revokedCount = links.filter(l => l.status === 'revoked').length

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Links Compartilhados</CardTitle>
                <CardDescription>
                  Gerencie links de compartilhamento de documentos e pastas
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {activeCount} ativos
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  {expiredCount} expirados
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {revokedCount} revogados
                </span>
              </div>
              {/* Filter */}
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({links.length})</SelectItem>
                  <SelectItem value="active">Ativos ({activeCount})</SelectItem>
                  <SelectItem value="expired">Expirados ({expiredCount})</SelectItem>
                  <SelectItem value="revoked">Revogados ({revokedCount})</SelectItem>
                  <SelectItem value="max_views_reached">Limite atingido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <LinkIcon className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">
                {filterStatus === 'all' 
                  ? 'Nenhum link compartilhado ainda'
                  : `Nenhum link ${filterStatus === 'active' ? 'ativo' : filterStatus === 'expired' ? 'expirado' : 'revogado'}`
                }
              </p>
              <p className="text-xs mt-1">
                Use o menu de contexto em um documento para gerar links
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link) => (
                <div
                  key={link.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    link.status === 'active' 
                      ? 'bg-card' 
                      : 'bg-muted/30 opacity-75'
                  }`}
                >
                  {/* Link Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${
                      link.folder ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {link.folder ? (
                        <Folder className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {link.folder?.name || link.document?.name || 'Projeto inteiro'}
                        </p>
                        {getStatusBadge(link.status)}
                        {link.password_hash && (
                          <span title="Protegido por senha">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Criado: {formatDate(link.created_at)}
                        </span>
                        {link.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expira: {formatDate(link.expires_at)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {link.view_count ?? 0}
                          {link.max_views ? ` / ${link.max_views}` : ''} visualizações
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {link.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(link)}
                          className="gap-1"
                        >
                          {copiedId === link.id ? (
                            <>
                              <Check className="h-4 w-4 text-green-600" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copiar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokeTarget(link)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {link.status !== 'active' && (
                      <span className="text-xs text-muted-foreground">
                        {link.status === 'revoked' && link.revoked_at && (
                          <>Revogado em {formatDate(link.revoked_at)}</>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar Link</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja revogar este link? Pessoas que possuem o link não poderão mais acessar o conteúdo.
              {revokeTarget && (
                <span className="block mt-2 font-medium text-foreground">
                  {revokeTarget.folder?.name || revokeTarget.document?.name || 'Projeto inteiro'}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
