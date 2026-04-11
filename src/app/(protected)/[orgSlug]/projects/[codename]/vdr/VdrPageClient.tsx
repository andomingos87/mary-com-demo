'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/navigation/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Eye,
  Shield,
  Lock,
  FileText,
  Users,
  Link as LinkIcon,
  BarChart3,
  Info,
} from 'lucide-react'
import {
  VdrAccordionTable,
  VdrSearchBar,
  VdrFiltersPanel,
  VdrBulkActionsBar,
  AddDocumentDialog,
  EditDocumentDialog,
  VdrStatsCards,
  VdrPermissionsPanel,
  VdrLinksPanel,
  VdrConfirmDialog,
  VdrAddLinkDialog,
  VdrFileUploadDialog,
  VdrDocumentDetailDrawer,
  VdrQaPanel,
  VdrEngagementDashboard,
} from '@/components/vdr'
import { 
  validateDocument, 
  unvalidateDocument, 
  bulkUpdateDocuments,
  listDocumentsWithCounts,
  deleteDocument,
  duplicateDocument,
  updateDocument,
} from '@/lib/actions/vdr'
import { toast } from 'sonner'
import type { 
  VdrFolderWithCounts, 
  VdrDocumentWithCounts, 
  VdrStats,
  VdrDocumentFilters,
  VdrDocumentSort,
  VdrValidationLevel,
  VdrBulkUpdateInput,
} from '@/types/vdr'
import type { DocumentAction } from '@/components/vdr/VdrDocumentRow'
import { TOOLTIPS } from '@/lib/constants/tooltips'

interface ResponsibleOption {
  id: string
  name: string
}

interface VdrPageClientProps {
  orgSlug: string
  codename: string
  projectId: string
  folders: VdrFolderWithCounts[]
  documents: VdrDocumentWithCounts[]
  stats?: VdrStats | null
  responsibles: ResponsibleOption[]
  businessUnits: string[]
  availableTags: string[]
  userProfile: 'asset' | 'advisor' | 'investor' | null
  userRole: 'owner' | 'admin' | 'member' | 'viewer' | null
  readOnlyMode: boolean
  isExternalAccess: boolean
}

export function VdrPageClient({
  orgSlug,
  codename,
  projectId,
  folders: initialFolders,
  documents: initialDocuments,
  stats,
  responsibles,
  businessUnits,
  availableTags,
  userProfile,
  userRole,
  readOnlyMode,
  isExternalAccess,
}: VdrPageClientProps) {
  const router = useRouter()
  
  // State
  const [documents, setDocuments] = useState(initialDocuments)
  const [folders] = useState(initialFolders)
  const [filters, setFilters] = useState<VdrDocumentFilters>({})
  const [sort, setSort] = useState<VdrDocumentSort | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  
  // Document action states
  const [editingDocument, setEditingDocument] = useState<VdrDocumentWithCounts | null>(null)
  const [viewingDocument, setViewingDocument] = useState<VdrDocumentWithCounts | null>(null)
  const [uploadingDocument, setUploadingDocument] = useState<VdrDocumentWithCounts | null>(null)
  const [addingLinkDocument, setAddingLinkDocument] = useState<VdrDocumentWithCounts | null>(null)
  const [commentingDocument, setCommentingDocument] = useState<VdrDocumentWithCounts | null>(null)
  const [deletingDocument, setDeletingDocument] = useState<VdrDocumentWithCounts | null>(null)
  const [archivingDocument, setArchivingDocument] = useState<VdrDocumentWithCounts | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  // Refresh documents
  const refreshDocuments = useCallback(async () => {
    setIsLoading(true)
    const result = await listDocumentsWithCounts(projectId, filters, sort)
    if (result.success && result.data) {
      setDocuments(result.data)
    }
    setIsLoading(false)
  }, [projectId, filters, sort])

  // Handle search
  const handleSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }))
  }, [])

  // Handle validation
  const handleValidate = useCallback(async (
    documentId: string, 
    level: VdrValidationLevel, 
    checked: boolean
  ) => {
    if (checked) {
      await validateDocument(documentId, level)
    } else {
      await unvalidateDocument(documentId, level)
    }
    await refreshDocuments()
  }, [refreshDocuments])

  // Handle document action
  const handleDocumentAction = useCallback(async (documentId: string, action: DocumentAction) => {
    const doc = documents.find(d => d.id === documentId)
    if (!doc) return

    switch (action) {
      case 'view':
        setViewingDocument(doc)
        break
      case 'edit':
        setEditingDocument(doc)
        break
      case 'add_file':
        setUploadingDocument(doc)
        break
      case 'add_link':
        setAddingLinkDocument(doc)
        break
      case 'comment':
        setCommentingDocument(doc)
        break
      case 'duplicate':
        const result = await duplicateDocument(documentId)
        if (result.success) {
          toast.success('Documento duplicado com sucesso')
          await refreshDocuments()
          // Open edit dialog for the new document
          if (result.data) {
            const newDoc = { ...result.data, files_count: 0, links_count: 0, comments_count: 0 } as VdrDocumentWithCounts
            setEditingDocument(newDoc)
          }
        } else {
          toast.error(result.error || 'Erro ao duplicar documento')
        }
        break
      case 'archive':
        setArchivingDocument(doc)
        break
      case 'delete':
        setDeletingDocument(doc)
        break
      default:
        break
    }
  }, [documents, refreshDocuments])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingDocument) return
    setIsDeleting(true)
    const result = await deleteDocument(deletingDocument.id)
    if (result.success) {
      toast.success('Documento excluído com sucesso')
      setDeletingDocument(null)
      await refreshDocuments()
    } else {
      toast.error(result.error || 'Erro ao excluir documento')
    }
    setIsDeleting(false)
  }, [deletingDocument, refreshDocuments])

  // Handle archive confirmation
  const handleArchiveConfirm = useCallback(async () => {
    if (!archivingDocument) return
    setIsArchiving(true)
    const result = await updateDocument(archivingDocument.id, { status: 'archived' })
    if (result.success) {
      toast.success('Documento arquivado com sucesso')
      setArchivingDocument(null)
      await refreshDocuments()
    } else {
      toast.error(result.error || 'Erro ao arquivar documento')
    }
    setIsArchiving(false)
  }, [archivingDocument, refreshDocuments])

  // Handle bulk update
  const handleBulkUpdate = useCallback(async (input: VdrBulkUpdateInput) => {
    await bulkUpdateDocuments(input)
    await refreshDocuments()
    setSelectedIds(new Set())
  }, [refreshDocuments])

  // Handle add document success
  const handleAddSuccess = useCallback(() => {
    refreshDocuments()
  }, [refreshDocuments])

  // Apply filters effect
  const filteredDocuments = documents.filter(doc => {
    // Apply client-side search filter immediately
    if (filters.search) {
      const search = filters.search.toLowerCase()
      const matchesName = doc.name.toLowerCase().includes(search)
      const matchesCode = doc.code?.toLowerCase().includes(search)
      if (!matchesName && !matchesCode) return false
    }
    return true
  })

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title="Asset VDR"
          description={`Documentos do projeto ${codename}`}
          actions={
            !readOnlyMode && (
              <div className="flex gap-2">
                <AddDocumentDialog
                  projectId={projectId}
                  folders={folders}
                  responsibles={responsibles}
                  onSuccess={handleAddSuccess}
                />
              </div>
            )
          }
        />

        {/* Investor Access Banner */}
        {isExternalAccess && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Acesso de Visualização
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Você tem acesso de leitura a este VDR. Pode visualizar documentos e fazer perguntas via Q&A.
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Read-Only
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* VDR Stats - only show for managers */}
        {!readOnlyMode && stats && <VdrStatsCards stats={stats} />}

        {/* Search and Filters Bar */}
        <div className="flex items-center gap-4">
          <VdrSearchBar
            value={filters.search || ''}
            onChange={handleSearch}
            className="flex-1 max-w-md"
          />
          <VdrFiltersPanel
            filters={filters}
            onChange={setFilters}
            folders={folders}
            responsibles={responsibles}
            businessUnits={businessUnits}
            availableTags={availableTags}
          />
        </div>

        {/* Main Accordion Table */}
        <Card>
          <CardContent className="p-0">
            <VdrAccordionTable
              folders={folders}
              documents={filteredDocuments}
              sort={sort}
              onSortChange={setSort}
              selectedDocumentIds={selectedIds}
              onSelectionChange={setSelectedIds}
              userProfile={userProfile}
              userRole={userRole}
              onValidate={handleValidate}
              onDocumentAction={handleDocumentAction}
              onAddDocument={() => {
                // Could open the add dialog programmatically
              }}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        <VdrBulkActionsBar
          selectedCount={selectedIds.size}
          selectedIds={Array.from(selectedIds)}
          onClearSelection={() => setSelectedIds(new Set())}
          onBulkUpdate={handleBulkUpdate}
          responsibles={responsibles}
        />

        {/* Tabs for Permissions, Links, and Engagement (managers only) */}
        {!readOnlyMode && (
          <Tabs defaultValue="permissions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="permissions" className="gap-2">
                <Users className="h-4 w-4" />
                Permissões
              </TabsTrigger>
              <TabsTrigger value="links" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                Links Compartilhados
              </TabsTrigger>
              <TabsTrigger value="engagement" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Engajamento
              </TabsTrigger>
            </TabsList>
            <TabsContent value="permissions">
              <VdrPermissionsPanel projectId={projectId} />
            </TabsContent>
            <TabsContent value="links">
              <VdrLinksPanel projectId={projectId} />
            </TabsContent>
            <TabsContent value="engagement">
              <VdrEngagementDashboard projectId={projectId} />
            </TabsContent>
          </Tabs>
        )}

        {/* Security Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Segurança do VDR</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label="O que é o VDR complementar (Mais Infos)"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm text-left text-xs">
                  {TOOLTIPS.vdr.complementaryDataRoom}
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              {readOnlyMode ? (
                // Investor view
                <>
                  <div>
                    <p className="font-medium">Acesso Controlado</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Seu acesso foi concedido pelo gestor do projeto
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Atividade Registrada</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Todas as visualizações são auditadas
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Q&A Disponível</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Faça perguntas sobre os documentos
                    </p>
                  </div>
                </>
              ) : (
                // Manager view
                <>
                  <div>
                    <p className="font-medium">Validação N1/N2/N3</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Asset → Advisor → Owner/Admin
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Auditoria Completa</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Rastreie todas as visualizações
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Links Temporários</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Compartilhe com expiração automática
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Document Dialog */}
        {editingDocument && (
          <EditDocumentDialog
            open={!!editingDocument}
            onOpenChange={(open) => !open && setEditingDocument(null)}
            document={editingDocument}
            folders={folders}
            responsibles={responsibles}
            onSuccess={() => {
              setEditingDocument(null)
              refreshDocuments()
            }}
          />
        )}

        {/* View Document Detail Drawer */}
        <VdrDocumentDetailDrawer
          document={viewingDocument}
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          onEdit={() => {
            if (viewingDocument) {
              setEditingDocument(viewingDocument)
              setViewingDocument(null)
            }
          }}
          onAddFile={() => {
            if (viewingDocument) {
              setUploadingDocument(viewingDocument)
            }
          }}
          onAddLink={() => {
            if (viewingDocument) {
              setAddingLinkDocument(viewingDocument)
            }
          }}
          onComment={() => {
            if (viewingDocument) {
              setCommentingDocument(viewingDocument)
              setViewingDocument(null)
            }
          }}
          canManage={!readOnlyMode}
        />

        {/* File Upload Dialog */}
        {uploadingDocument && (
          <VdrFileUploadDialog
            documentId={uploadingDocument.id}
            projectId={projectId}
            isOpen={!!uploadingDocument}
            onClose={() => setUploadingDocument(null)}
            onSuccess={() => {
              refreshDocuments()
            }}
          />
        )}

        {/* Add Link Dialog */}
        {addingLinkDocument && (
          <VdrAddLinkDialog
            documentId={addingLinkDocument.id}
            isOpen={!!addingLinkDocument}
            onClose={() => setAddingLinkDocument(null)}
            onSuccess={() => {
              refreshDocuments()
            }}
          />
        )}

        {/* Comments/Q&A Sheet */}
        <Sheet 
          open={!!commentingDocument} 
          onOpenChange={(open) => !open && setCommentingDocument(null)}
        >
          <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
            <SheetHeader>
              <SheetTitle>Comentários / Q&A</SheetTitle>
            </SheetHeader>
            {commentingDocument && (
              <div className="flex-1 overflow-hidden -mx-6 px-6">
                <VdrQaPanel
                  documentId={commentingDocument.id}
                  projectId={projectId}
                  canManage={!readOnlyMode}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <VdrConfirmDialog
          isOpen={!!deletingDocument}
          onClose={() => setDeletingDocument(null)}
          onConfirm={handleDeleteConfirm}
          title="Excluir documento"
          description={`Tem certeza que deseja excluir "${deletingDocument?.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          variant="destructive"
          isLoading={isDeleting}
        />

        {/* Archive Confirmation Dialog */}
        <VdrConfirmDialog
          isOpen={!!archivingDocument}
          onClose={() => setArchivingDocument(null)}
          onConfirm={handleArchiveConfirm}
          title="Arquivar documento"
          description={`Tem certeza que deseja arquivar "${archivingDocument?.name}"? O documento não aparecerá mais na listagem padrão.`}
          confirmLabel="Arquivar"
          cancelLabel="Cancelar"
          variant="default"
          isLoading={isArchiving}
        />
      </div>
    </TooltipProvider>
  )
}
