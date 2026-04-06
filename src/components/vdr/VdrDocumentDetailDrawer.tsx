'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Download,
  Edit,
  Upload,
  MessageSquare,
  Calendar,
  User,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Trash2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { VdrPriorityBadge } from './VdrPriorityBadge'
import { VdrStatusBadge } from './VdrStatusBadge'
import { VdrRiskBadge } from './VdrRiskBadge'
import {
  listDocumentFiles,
  listDocumentLinks,
  removeDocumentFile,
  removeDocumentLink,
  getDocumentValidationHistory,
} from '@/lib/actions/vdr'
import type { VdrDocumentWithCounts, VdrDocumentFile, VdrDocumentLink } from '@/types/vdr'
import { toast } from 'sonner'

interface VdrDocumentDetailDrawerProps {
  document: VdrDocumentWithCounts | null
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
  onAddFile?: () => void
  onAddLink?: () => void
  onComment?: () => void
  canManage?: boolean
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function VdrDocumentDetailDrawer({
  document,
  isOpen,
  onClose,
  onEdit,
  onAddFile,
  onAddLink,
  onComment,
  canManage = false,
}: VdrDocumentDetailDrawerProps) {
  const [files, setFiles] = useState<VdrDocumentFile[]>([])
  const [links, setLinks] = useState<VdrDocumentLink[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)
  const [isLoadingValidationHistory, setIsLoadingValidationHistory] = useState(false)
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)
  const [validationHistory, setValidationHistory] = useState<Array<{
    id: string
    validationLevel: 'N1' | 'N2' | 'N3'
    approved: boolean
    validatedAt: string
    validatedBy: string
    metadata: unknown
  }>>([])
  const [hasMoreValidationHistory, setHasMoreValidationHistory] = useState(false)
  const [isLoadingMoreValidationHistory, setIsLoadingMoreValidationHistory] = useState(false)

  useEffect(() => {
    if (isOpen && document) {
      loadFiles()
      loadLinks()
      loadValidationHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, document?.id])

  const loadFiles = async () => {
    if (!document) return
    setIsLoadingFiles(true)
    const result = await listDocumentFiles(document.id)
    if (result.success && result.data) {
      setFiles(result.data)
    }
    setIsLoadingFiles(false)
  }

  const loadLinks = async () => {
    if (!document) return
    setIsLoadingLinks(true)
    const result = await listDocumentLinks(document.id)
    if (result.success && result.data) {
      setLinks(result.data)
    }
    setIsLoadingLinks(false)
  }

  const loadValidationHistory = async () => {
    if (!document) return
    setIsLoadingValidationHistory(true)
    const result = await getDocumentValidationHistory(document.id, { limit: 20, offset: 0 })
    if (result.success && result.data) {
      setValidationHistory(result.data)
      setHasMoreValidationHistory(result.hasMore ?? false)
    } else {
      setValidationHistory([])
      setHasMoreValidationHistory(false)
    }
    setIsLoadingValidationHistory(false)
  }

  const loadMoreValidationHistory = async () => {
    if (!document || !hasMoreValidationHistory) return
    setIsLoadingMoreValidationHistory(true)
    const result = await getDocumentValidationHistory(document.id, {
      limit: 20,
      offset: validationHistory.length,
    })
    if (result.success && result.data) {
      setValidationHistory((prev) => [...prev, ...result.data!])
      setHasMoreValidationHistory(result.hasMore ?? false)
    }
    setIsLoadingMoreValidationHistory(false)
  }

  const handleDeleteFile = async (fileId: string) => {
    setDeletingFileId(fileId)
    const result = await removeDocumentFile(fileId)
    if (result.success) {
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      toast.success('Arquivo removido')
    } else {
      toast.error(result.error || 'Erro ao remover arquivo')
    }
    setDeletingFileId(null)
  }

  const handleDeleteLink = async (linkId: string) => {
    setDeletingLinkId(linkId)
    const result = await removeDocumentLink(linkId)
    if (result.success) {
      setLinks((prev) => prev.filter((l) => l.id !== linkId))
      toast.success('Link removido')
    } else {
      toast.error(result.error || 'Erro ao remover link')
    }
    setDeletingLinkId(null)
  }

  if (!document) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg">{document.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs">{document.code || '-'}</span>
                <VdrStatusBadge status={document.status as any} />
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Quick Actions */}
            {canManage && (
              <div className="flex flex-wrap gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
                {onAddFile && (
                  <Button variant="outline" size="sm" onClick={onAddFile}>
                    <Upload className="h-4 w-4 mr-2" />
                    Arquivo
                  </Button>
                )}
                {onAddLink && (
                  <Button variant="outline" size="sm" onClick={onAddLink}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link
                  </Button>
                )}
                {onComment && (
                  <Button variant="outline" size="sm" onClick={onComment}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comentar
                  </Button>
                )}
              </div>
            )}

            <Separator />

            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Informações</h4>
              
              {document.description && (
                <p className="text-sm text-muted-foreground">{document.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Prioridade</span>
                  <div className="mt-1">
                    <VdrPriorityBadge priority={document.priority as any} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Risco</span>
                  <div className="mt-1">
                    <VdrRiskBadge risk={document.risk as any} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Business Unit</span>
                  <p className="mt-1 font-medium">{document.business_unit || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Responsável</span>
                  <p className="mt-1 font-medium">{document.responsible_name || '-'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Datas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Início</span>
                    <p className="font-medium">{formatDate(document.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Prazo</span>
                    <p className="font-medium">{formatDate(document.due_date)}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Validations */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Validações</h4>
              <div className="space-y-2">
                <ValidationItem
                  level="N1"
                  label="Asset"
                  validated={document.validation_n1}
                  validatedAt={document.validation_n1_at}
                />
                <ValidationItem
                  level="N2"
                  label="Advisor"
                  validated={document.validation_n2}
                  validatedAt={document.validation_n2_at}
                />
                <ValidationItem
                  level="N3"
                  label="Owner/Admin"
                  validated={document.validation_n3}
                  validatedAt={document.validation_n3_at}
                />
              </div>
            </div>

            <Separator />

            {/* Validation History */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Histórico de validações</h4>
              {isLoadingValidationHistory ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : validationHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhum evento de validação registrado ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {validationHistory.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 p-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {event.validationLevel} · {event.approved ? 'Aprovado' : 'Removido'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(event.validatedAt)}
                        </p>
                      </div>
                      <Badge variant={event.approved ? 'default' : 'secondary'}>
                        {event.approved ? 'OK' : 'UNDO'}
                      </Badge>
                    </div>
                  ))}
                  {hasMoreValidationHistory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={loadMoreValidationHistory}
                      disabled={isLoadingMoreValidationHistory}
                    >
                      {isLoadingMoreValidationHistory ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Carregar mais'
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Files */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Arquivos ({files.length})
                </h4>
                {canManage && onAddFile && (
                  <Button variant="ghost" size="sm" onClick={onAddFile}>
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : files.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhum arquivo anexado
                </p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size_bytes)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(file.file_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFile(file.id)}
                            disabled={deletingFileId === file.id}
                          >
                            {deletingFileId === file.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Links ({links.length})
                </h4>
                {canManage && onAddLink && (
                  <Button variant="ghost" size="sm" onClick={onAddLink}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {isLoadingLinks ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : links.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhum link adicionado
                </p>
              ) : (
                <div className="space-y-2">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30"
                    >
                      <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {link.label || link.url}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {link.url}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLink(link.id)}
                            disabled={deletingLinkId === link.id}
                          >
                            {deletingLinkId === link.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Tags */}
            {(document.tags as string[] || []).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {(document.tags as string[]).map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Criado em {formatDateTime(document.created_at)}</p>
              <p>Atualizado em {formatDateTime(document.updated_at)}</p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function ValidationItem({
  level,
  label,
  validated,
  validatedAt,
}: {
  level: string
  label: string
  validated: boolean | null | undefined
  validatedAt: string | null | undefined
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        {validated ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-sm">
          <span className="font-medium">{level}</span>
          <span className="text-muted-foreground"> ({label})</span>
        </span>
      </div>
      {validated && validatedAt && (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(validatedAt), { addSuffix: true, locale: ptBR })}
        </span>
      )}
    </div>
  )
}
