'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, Folder, FolderOpen, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateDocument } from '@/lib/actions/vdr'
import type { VdrDocumentWithFolder, VdrFolderWithCounts } from '@/types/vdr'

interface MoveDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: VdrDocumentWithFolder
  folders: VdrFolderWithCounts[]
}

export function MoveDocumentDialog({
  open,
  onOpenChange,
  document,
  folders,
}: MoveDocumentDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  // Filter out current folder from options
  const availableFolders = folders.filter((f) => f.id !== document.folder_id)

  const handleMove = async () => {
    if (!selectedFolderId) {
      setError('Selecione uma pasta de destino')
      return
    }

    setError(null)
    setIsSubmitting(true)

    const result = await updateDocument(document.id, {
      folderId: selectedFolderId,
    })

    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Erro ao mover documento')
      return
    }

    setSelectedFolderId(null)
    onOpenChange(false)
    router.refresh()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedFolderId(null)
      setError(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Mover Documento</DialogTitle>
          <DialogDescription>
            Selecione a pasta de destino para &quot;{document.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {availableFolders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Não há outras pastas disponíveis
            </p>
          ) : (
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {availableFolders.map((folder) => {
                const isSelected = selectedFolderId === folder.id
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedFolderId(folder.id)}
                    disabled={isSubmitting}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors',
                      'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      isSelected && 'bg-primary/10 border border-primary',
                      !isSelected && 'border border-transparent'
                    )}
                  >
                    {isSelected ? (
                      <FolderOpen className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                      <Folder className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        isSelected && 'text-primary'
                      )}>
                        {folder.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {folder.documentCount} {folder.documentCount === 1 ? 'documento' : 'documentos'}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleMove}
            disabled={isSubmitting || !selectedFolderId || availableFolders.length === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
