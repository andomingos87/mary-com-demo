'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Loader2,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { addDocumentFile } from '@/lib/actions/vdr'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

interface FileWithStatus {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface VdrFileUploadDialogProps {
  documentId: string
  projectId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || 'FILE'
}

export function VdrFileUploadDialog({
  documentId,
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: VdrFileUploadDialogProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não permitido'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande (máx. 50MB)'
    }
    return null
  }

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const filesToAdd: FileWithStatus[] = []
    
    Array.from(newFiles).forEach((file) => {
      const error = validateFile(file)
      filesToAdd.push({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: error ? 'error' : 'pending',
        progress: 0,
        error: error || undefined,
      })
    })

    setFiles((prev) => [...prev, ...filesToAdd])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addFiles])

  const uploadFile = async (fileWithStatus: FileWithStatus): Promise<boolean> => {
    const { file, id } = fileWithStatus
    const supabase = createClient()

    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: 'uploading' as const, progress: 0 } : f
      )
    )

    try {
      // Generate unique path
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const path = `${projectId}/${documentId}/${timestamp}-${safeName}`

      // Upload to Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vdr-documents')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Update progress to 50%
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, progress: 50 } : f))
      )

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('vdr-documents')
        .getPublicUrl(path)

      // Register in database
      const result = await addDocumentFile({
        documentId,
        fileName: file.name,
        fileUrl: urlData.publicUrl,
        fileType: file.type,
        fileSizeBytes: file.size,
      })

      if (!result.success) {
        throw new Error(result.error || 'Erro ao registrar arquivo')
      }

      // Update status to success
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'success' as const, progress: 100 } : f
        )
      )

      return true
    } catch (error) {
      console.error('Error uploading file:', error)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Erro no upload',
              }
            : f
        )
      )
      return false
    }
  }

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    let successCount = 0
    for (const file of pendingFiles) {
      const success = await uploadFile(file)
      if (success) successCount++
    }

    setIsUploading(false)

    if (successCount > 0) {
      toast.success(`${successCount} arquivo(s) enviado(s) com sucesso`)
      onSuccess()
    }

    if (successCount === pendingFiles.length) {
      // All files uploaded successfully, close dialog
      setTimeout(() => {
        handleClose()
      }, 1000)
    }
  }

  const handleClose = () => {
    if (isUploading) return
    setFiles([])
    onClose()
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const hasErrors = files.some((f) => f.status === 'error')

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adicionar Arquivos
          </DialogTitle>
          <DialogDescription>
            Arraste arquivos ou clique para selecionar. Máximo 50MB por arquivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragging
                ? 'Solte os arquivos aqui'
                : 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PDF, Word, Excel, PowerPoint, Imagens
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((f) => (
                <div
                  key={f.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    f.status === 'error' && 'border-destructive bg-destructive/5',
                    f.status === 'success' && 'border-green-500 bg-green-50'
                  )}
                >
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getFileExtension(f.file.name)} • {formatFileSize(f.file.size)}
                    </p>
                    {f.status === 'uploading' && (
                      <Progress value={f.progress} className="h-1 mt-2" />
                    )}
                    {f.error && (
                      <p className="text-xs text-destructive mt-1">{f.error}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {f.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(f.id)
                        }}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {f.status === 'uploading' && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    {f.status === 'success' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {f.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {files.some((f) => f.status === 'success') ? 'Fechar' : 'Cancelar'}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || pendingCount === 0}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pendingCount > 0
              ? `Enviar ${pendingCount} arquivo${pendingCount > 1 ? 's' : ''}`
              : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
