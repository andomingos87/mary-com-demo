'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  ExternalLink,
  MoreVertical,
  Share2,
  Trash2,
  Edit,
  Eye,
  Lock,
  FolderInput,
  Search,
  X,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { VdrDocumentWithFolder, VdrFolderWithCounts } from '@/types/vdr'
import { deleteDocument, updateDocument } from '@/lib/actions/vdr'
import { useRouter } from 'next/navigation'
import { ShareDocumentDialog } from './ShareDocumentDialog'
import { DocumentViewerDialog } from './DocumentViewerDialog'
import { EditDocumentDialog } from './EditDocumentDialog'
import { MoveDocumentDialog } from './MoveDocumentDialog'
import { FileTypeIcon, getFileTypeConfig } from './FileTypeIcon'

// Filter and sort types
type FileTypeFilter = 'all' | 'pdf' | 'excel' | 'word' | 'image' | 'video' | 'other'
type ConfidentialFilter = 'all' | 'confidential' | 'public'
type SortOption = 'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest'

const FILE_TYPE_GROUPS: Record<FileTypeFilter, string[]> = {
  all: [],
  pdf: ['pdf'],
  excel: ['xls', 'xlsx', 'csv'],
  word: ['doc', 'docx'],
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  other: [], // Will match anything not in other groups
}

interface VdrDocumentListProps {
  documents: VdrDocumentWithFolder[]
  canManage: boolean
  projectId: string
  orgSlug: string
  codename: string
  folders?: VdrFolderWithCounts[]
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return 'Tamanho desconhecido'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Helper to get file extension from document
function getDocumentExtension(doc: VdrDocumentWithFolder): string {
  const fileType = doc.file_type || doc.external_url
  if (!fileType) return ''
  
  // If it's already an extension
  if (!fileType.includes('.') && !fileType.includes('/')) {
    return fileType.toLowerCase()
  }
  
  // Try to extract from URL
  try {
    const url = new URL(fileType)
    const pathname = url.pathname
    const lastDot = pathname.lastIndexOf('.')
    if (lastDot !== -1) {
      return pathname.slice(lastDot + 1).toLowerCase()
    }
  } catch {
    const lastDot = fileType.lastIndexOf('.')
    if (lastDot !== -1) {
      return fileType.slice(lastDot + 1).toLowerCase()
    }
  }
  
  return ''
}

// Check if extension belongs to a file type group
function matchesFileTypeGroup(ext: string, group: FileTypeFilter): boolean {
  if (group === 'all') return true
  if (group === 'other') {
    // Match if not in any other group
    const allKnownExtensions = Object.entries(FILE_TYPE_GROUPS)
      .filter(([key]) => key !== 'all' && key !== 'other')
      .flatMap(([, exts]) => exts)
    return !allKnownExtensions.includes(ext)
  }
  return FILE_TYPE_GROUPS[group].includes(ext)
}

export function VdrDocumentList({
  documents,
  canManage,
  projectId,
  orgSlug,
  codename,
  folders = [],
}: VdrDocumentListProps) {
  const router = useRouter()
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [documentToShare, setDocumentToShare] = useState<VdrDocumentWithFolder | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [documentToView, setDocumentToView] = useState<VdrDocumentWithFolder | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [documentToEdit, setDocumentToEdit] = useState<VdrDocumentWithFolder | null>(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [documentToMove, setDocumentToMove] = useState<VdrDocumentWithFolder | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>('all')
  const [confidentialFilter, setConfidentialFilter] = useState<ConfidentialFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('date-newest')
  
  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isBulkMoving, setIsBulkMoving] = useState(false)
  const [bulkMoveTargetFolder, setBulkMoveTargetFolder] = useState<string>('')
  
  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents]
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.folder?.name.toLowerCase().includes(query)
      )
    }
    
    // Apply file type filter
    if (fileTypeFilter !== 'all') {
      result = result.filter(doc => {
        const ext = getDocumentExtension(doc)
        return matchesFileTypeGroup(ext, fileTypeFilter)
      })
    }
    
    // Apply confidential filter
    if (confidentialFilter === 'confidential') {
      result = result.filter(doc => doc.is_confidential)
    } else if (confidentialFilter === 'public') {
      result = result.filter(doc => !doc.is_confidential)
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'pt-BR')
        case 'name-desc':
          return b.name.localeCompare(a.name, 'pt-BR')
        case 'date-newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'date-oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default:
          return 0
      }
    })
    
    return result
  }, [documents, searchQuery, fileTypeFilter, confidentialFilter, sortOption])
  
  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || fileTypeFilter !== 'all' || confidentialFilter !== 'all'
  
  // Bulk selection helpers
  const allSelected = filteredAndSortedDocuments.length > 0 && 
    filteredAndSortedDocuments.every(doc => selectedIds.has(doc.id))
  const someSelected = selectedIds.size > 0
  
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredAndSortedDocuments.map(doc => doc.id)))
    }
  }
  
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }
  
  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleDelete = async () => {
    if (!documentToDelete) return

    setIsDeleting(true)
    const result = await deleteDocument(documentToDelete)
    setIsDeleting(false)

    if (result.success) {
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
      router.refresh()
    }
  }
  
  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    
    setIsBulkDeleting(true)
    
    // Delete all selected documents
    const deletePromises = Array.from(selectedIds).map(id => deleteDocument(id))
    await Promise.all(deletePromises)
    
    setIsBulkDeleting(false)
    setBulkDeleteDialogOpen(false)
    setSelectedIds(new Set())
    router.refresh()
  }
  
  // Bulk move handler
  const handleBulkMove = async () => {
    if (selectedIds.size === 0 || !bulkMoveTargetFolder) return
    
    setIsBulkMoving(true)
    
    // Move all selected documents
    const movePromises = Array.from(selectedIds).map(id => 
      updateDocument(id, { folderId: bulkMoveTargetFolder })
    )
    await Promise.all(movePromises)
    
    setIsBulkMoving(false)
    setBulkMoveDialogOpen(false)
    setBulkMoveTargetFolder('')
    setSelectedIds(new Set())
    router.refresh()
  }

  const openShareDialog = (doc: VdrDocumentWithFolder) => {
    setDocumentToShare(doc)
    setShareDialogOpen(true)
  }

  const openViewer = (doc: VdrDocumentWithFolder) => {
    setDocumentToView(doc)
    setViewerOpen(true)
  }

  const openEditDialog = (doc: VdrDocumentWithFolder) => {
    setDocumentToEdit(doc)
    setEditDialogOpen(true)
  }

  const openMoveDialog = (doc: VdrDocumentWithFolder) => {
    setDocumentToMove(doc)
    setMoveDialogOpen(true)
  }
  
  const clearFilters = () => {
    setSearchQuery('')
    setFileTypeFilter('all')
    setConfidentialFilter('all')
    setSortOption('date-newest')
  }

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="space-y-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File Type Filter */}
          <Select value={fileTypeFilter} onValueChange={(v) => setFileTypeFilter(v as FileTypeFilter)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel/CSV</SelectItem>
              <SelectItem value="word">Word</SelectItem>
              <SelectItem value="image">Imagens</SelectItem>
              <SelectItem value="video">Vídeos</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Confidential Filter */}
          <Select value={confidentialFilter} onValueChange={(v) => setConfidentialFilter(v as ConfidentialFilter)}>
            <SelectTrigger className="w-[160px]">
              <Lock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Confidencial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="confidential">Confidenciais</SelectItem>
              <SelectItem value="public">Públicos</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Sort */}
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-newest">Mais recentes</SelectItem>
              <SelectItem value="date-oldest">Mais antigos</SelectItem>
              <SelectItem value="name-asc">Nome A-Z</SelectItem>
              <SelectItem value="name-desc">Nome Z-A</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          )}
          
          {/* Results count */}
          <span className="text-sm text-muted-foreground ml-auto">
            {filteredAndSortedDocuments.length} de {documents.length} documentos
          </span>
        </div>
      </div>
      
      {/* Bulk Actions Bar */}
      {canManage && someSelected && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-muted rounded-lg border">
          <span className="text-sm font-medium">
            {selectedIds.size} documento{selectedIds.size > 1 ? 's' : ''} selecionado{selectedIds.size > 1 ? 's' : ''}
          </span>
          
          <div className="flex items-center gap-2 ml-auto">
            {folders.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkMoveDialogOpen(true)}
              >
                <FolderInput className="h-4 w-4 mr-2" />
                Mover para...
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4 mr-1" />
              Limpar seleção
            </Button>
          </div>
        </div>
      )}
      
      {/* Document List */}
      <div className="space-y-2">
        {/* Select All Header (only when canManage) */}
        {canManage && filteredAndSortedDocuments.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleSelectAll}
              aria-label="Selecionar todos"
            />
            <span className="text-xs">
              {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
            </span>
          </div>
        )}
        
        {filteredAndSortedDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {hasActiveFilters ? (
              <>
                <p>Nenhum documento encontrado com os filtros aplicados.</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Limpar filtros
                </Button>
              </>
            ) : (
              <p>Nenhum documento nesta pasta.</p>
            )}
          </div>
        ) : (
          filteredAndSortedDocuments.map((doc) => {
            const isSelected = selectedIds.has(doc.id)
            return (
              <div
                key={doc.id}
                className={`flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group ${
                  isSelected ? 'bg-muted/50 border-primary/50' : ''
                }`}
              >
                {/* Checkbox (only when canManage) */}
                {canManage && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(doc.id)}
                    aria-label={`Selecionar ${doc.name}`}
                    className="shrink-0"
                  />
                )}
                
                {/* Icon */}
                <FileTypeIcon fileType={doc.file_type || doc.external_url} size="md" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openViewer(doc)}
                      className="font-medium text-sm truncate hover:underline text-left"
                    >
                      {doc.name}
                    </button>
                    {doc.is_confidential && (
                      <Badge variant="secondary" className="shrink-0">
                        <Lock className="h-3 w-3 mr-1" />
                        Confidencial
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{doc.folder?.name}</span>
                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                    <span>
                      {formatDistanceToNow(new Date(doc.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openViewer(doc)}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Abrir link externo"
                  >
                    <a href={doc.external_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>

                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(doc)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {folders.length > 1 && (
                          <DropdownMenuItem onClick={() => openMoveDialog(doc)}>
                            <FolderInput className="h-4 w-4 mr-2" />
                            Mover para...
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openShareDialog(doc)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDocumentToDelete(doc.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O documento será removido permanentemente
              do VDR e todos os links compartilhados serão invalidados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      {documentToShare && (
        <ShareDocumentDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          document={documentToShare}
          projectId={projectId}
        />
      )}

      {/* Document Viewer */}
      {documentToView && (
        <DocumentViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          doc={documentToView}
          projectId={projectId}
          canManage={canManage}
        />
      )}

      {/* Edit Document Dialog */}
      {documentToEdit && (
        <EditDocumentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          document={documentToEdit}
        />
      )}

      {/* Move Document Dialog */}
      {documentToMove && (
        <MoveDocumentDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          document={documentToMove}
          folders={folders}
        />
      )}
      
      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedIds.size} documento{selectedIds.size > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os documentos selecionados serão removidos permanentemente
              do VDR e todos os links compartilhados serão invalidados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkDeleting ? 'Excluindo...' : `Excluir ${selectedIds.size} documento${selectedIds.size > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Bulk Move Dialog */}
      <AlertDialog open={bulkMoveDialogOpen} onOpenChange={setBulkMoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover {selectedIds.size} documento{selectedIds.size > 1 ? 's' : ''}</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione a pasta de destino para os documentos selecionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Select value={bulkMoveTargetFolder} onValueChange={setBulkMoveTargetFolder}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma pasta..." />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name} ({folder.documentCount} docs)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkMoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkMove}
              disabled={isBulkMoving || !bulkMoveTargetFolder}
            >
              {isBulkMoving ? 'Movendo...' : `Mover ${selectedIds.size} documento${selectedIds.size > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
