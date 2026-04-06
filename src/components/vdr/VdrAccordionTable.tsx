'use client'

import { Fragment, useState, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { VdrTableHeader } from './VdrTableHeader'
import { VdrFolderAccordionRow } from './VdrFolderAccordionRow'
import { VdrDocumentRow, type DocumentAction } from './VdrDocumentRow'
import { VdrEmptyState } from './VdrEmptyState'
import { VdrLoadingState } from './VdrLoadingState'
import type { 
  VdrFolderWithCounts, 
  VdrDocumentWithCounts, 
  VdrDocumentSort,
  VdrValidationLevel,
} from '@/types/vdr'

interface VdrAccordionTableProps {
  folders: VdrFolderWithCounts[]
  documents: VdrDocumentWithCounts[]
  sort?: VdrDocumentSort
  onSortChange?: (sort: VdrDocumentSort | undefined) => void
  selectedDocumentIds: Set<string>
  onSelectionChange: (selectedIds: Set<string>) => void
  userProfile: 'asset' | 'advisor' | 'investor' | null
  userRole?: 'owner' | 'admin' | 'member' | 'viewer' | null
  onValidate?: (documentId: string, level: VdrValidationLevel, checked: boolean) => Promise<void>
  onDocumentAction?: (documentId: string, action: DocumentAction) => void
  onAddDocument?: () => void
  isLoading?: boolean
  className?: string
}

export function VdrAccordionTable({
  folders,
  documents,
  sort,
  onSortChange,
  selectedDocumentIds,
  onSelectionChange,
  userProfile,
  userRole,
  onValidate,
  onDocumentAction,
  onAddDocument,
  isLoading,
  className,
}: VdrAccordionTableProps) {
  // State for expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(folders.map(f => f.id)) // Start with all expanded
  )

  // Group documents by folder
  const documentsByFolder = useMemo(() => {
    const map = new Map<string, VdrDocumentWithCounts[]>()
    for (const folder of folders) {
      map.set(folder.id, [])
    }
    for (const doc of documents) {
      const folderDocs = map.get(doc.folder_id) || []
      folderDocs.push(doc)
      map.set(doc.folder_id, folderDocs)
    }
    return map
  }, [folders, documents])

  // All document IDs
  const allDocumentIds = useMemo(() => 
    new Set(documents.map(d => d.id)), 
    [documents]
  )

  // Check if all documents are selected
  const allSelected = useMemo(() => 
    allDocumentIds.size > 0 && allDocumentIds.size === selectedDocumentIds.size,
    [allDocumentIds, selectedDocumentIds]
  )

  // Check if some documents are selected
  const someSelected = useMemo(() => 
    selectedDocumentIds.size > 0 && selectedDocumentIds.size < allDocumentIds.size,
    [allDocumentIds, selectedDocumentIds]
  )

  // Toggle folder expansion
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }, [])

  // Select/deselect all documents
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      onSelectionChange(new Set(allDocumentIds))
    } else {
      onSelectionChange(new Set())
    }
  }, [allDocumentIds, onSelectionChange])

  // Select/deselect folder (all documents in folder)
  const handleSelectFolder = useCallback((folderId: string, selected: boolean) => {
    const folderDocs = documentsByFolder.get(folderId) || []
    const folderDocIds = new Set(folderDocs.map(d => d.id))
    
    const newSelection = new Set(selectedDocumentIds)
    if (selected) {
      folderDocIds.forEach(id => newSelection.add(id))
    } else {
      folderDocIds.forEach(id => newSelection.delete(id))
    }
    onSelectionChange(newSelection)
  }, [documentsByFolder, selectedDocumentIds, onSelectionChange])

  // Check if folder is fully selected
  const isFolderSelected = useCallback((folderId: string) => {
    const folderDocs = documentsByFolder.get(folderId) || []
    if (folderDocs.length === 0) return false
    return folderDocs.every(d => selectedDocumentIds.has(d.id))
  }, [documentsByFolder, selectedDocumentIds])

  // Check if folder has some documents selected
  const hasSomeDocsSelected = useCallback((folderId: string) => {
    const folderDocs = documentsByFolder.get(folderId) || []
    if (folderDocs.length === 0) return false
    const selectedCount = folderDocs.filter(d => selectedDocumentIds.has(d.id)).length
    return selectedCount > 0 && selectedCount < folderDocs.length
  }, [documentsByFolder, selectedDocumentIds])

  // Select/deselect single document
  const handleSelectDocument = useCallback((documentId: string, selected: boolean) => {
    const newSelection = new Set(selectedDocumentIds)
    if (selected) {
      newSelection.add(documentId)
    } else {
      newSelection.delete(documentId)
    }
    onSelectionChange(newSelection)
  }, [selectedDocumentIds, onSelectionChange])

  // Loading state
  if (isLoading) {
    return <VdrLoadingState className={className} />
  }

  // Empty state
  if (folders.length === 0) {
    return (
      <VdrEmptyState
        title="Nenhuma pasta encontrada"
        description="Configure as pastas padrão do VDR para começar."
        actionLabel="Criar pastas padrão"
        className={className}
      />
    )
  }

  if (documents.length === 0) {
    return (
      <VdrEmptyState
        title="Nenhum documento encontrado"
        description="Adicione o primeiro documento ao VDR."
        actionLabel="Adicionar documento"
        onAction={onAddDocument}
        className={className}
      />
    )
  }

  // Number of columns (for colspan)
  const colSpan = 16

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[1200px] border-collapse">
        <VdrTableHeader
          sort={sort}
          onSortChange={onSortChange}
          allSelected={allSelected}
          someSelected={someSelected}
          onSelectAll={handleSelectAll}
        />
        <tbody>
          {folders.map((folder) => {
            const folderDocs = documentsByFolder.get(folder.id) || []
            const isExpanded = expandedFolders.has(folder.id)
            const isSelected = isFolderSelected(folder.id)
            const someDocsSelected = hasSomeDocsSelected(folder.id)

            return (
              <Fragment key={folder.id}>
                {/* Folder Row */}
                <VdrFolderAccordionRow
                  folder={folder}
                  isExpanded={isExpanded}
                  onToggle={() => toggleFolder(folder.id)}
                  isSelected={isSelected}
                  someDocumentsSelected={someDocsSelected}
                  onSelect={(selected) => handleSelectFolder(folder.id, selected)}
                  colSpan={colSpan}
                />

                {/* Document Rows (when expanded) */}
                {isExpanded && folderDocs.map((doc) => (
                  <VdrDocumentRow
                    key={doc.id}
                    document={doc}
                    isSelected={selectedDocumentIds.has(doc.id)}
                    onSelect={(selected) => handleSelectDocument(doc.id, selected)}
                    userProfile={userProfile}
                    userRole={userRole}
                    onValidate={onValidate}
                    onAction={onDocumentAction}
                  />
                ))}

                {/* Empty folder message when expanded */}
                {isExpanded && folderDocs.length === 0 && (
                  <tr>
                    <td colSpan={colSpan} className="px-8 py-4 text-sm text-gray-500 italic bg-gray-50">
                      Nenhum documento nesta pasta
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
