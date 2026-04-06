'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { updateFolder, deleteFolder } from '@/lib/actions/vdr'
import type { VdrFolderWithCounts } from '@/types/vdr'

// Icons available for folders
const FOLDER_ICONS = [
  { value: 'folder', label: 'Pasta' },
  { value: 'wallet', label: 'Financeiro' },
  { value: 'scale', label: 'Jurídico' },
  { value: 'cog', label: 'Operacional' },
  { value: 'briefcase', label: 'Comercial' },
  { value: 'users', label: 'RH' },
  { value: 'file-text', label: 'Documentos' },
  { value: 'chart', label: 'Relatórios' },
  { value: 'shield', label: 'Compliance' },
  { value: 'building', label: 'Corporativo' },
] as const

interface EditFolderDialogProps {
  folder: VdrFolderWithCounts
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditFolderDialog({ folder, open, onOpenChange }: EditFolderDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(folder.name)
  const [description, setDescription] = useState(folder.description || '')
  const [icon, setIcon] = useState(folder.icon || 'folder')
  const [error, setError] = useState<string | null>(null)

  const isValid = name.trim().length >= 2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError(null)
    try {
      const result = await updateFolder(folder.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
      })

      if (result.success) {
        onOpenChange(false)
        router.refresh()
      } else {
        setError(result.error || 'Erro ao atualizar pasta')
      }
    } catch (err) {
      console.error('Error updating folder:', err)
      setError('Erro ao atualizar pasta')
    } finally {
      setLoading(false)
    }
  }

  // Reset form when dialog opens with new folder data
  function handleOpenChange(newOpen: boolean) {
    if (newOpen) {
      setName(folder.name)
      setDescription(folder.description || '')
      setIcon(folder.icon || 'folder')
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Pasta</DialogTitle>
            <DialogDescription>
              Altere as informações da pasta &quot;{folder.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome da Pasta *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Contratos 2024"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional da pasta..."
                disabled={loading}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-icon">Ícone</Label>
              <Select value={icon} onValueChange={setIcon} disabled={loading}>
                <SelectTrigger id="edit-icon">
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent>
                  {FOLDER_ICONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// =====================================================
// DELETE FOLDER DIALOG
// =====================================================

interface DeleteFolderDialogProps {
  folder: VdrFolderWithCounts
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteFolderDialog({ folder, open, onOpenChange }: DeleteFolderDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const documentCount = folder.documentCount || 0
  const hasDocuments = documentCount > 0

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      const result = await deleteFolder(folder.id)

      if (result.success) {
        onOpenChange(false)
        router.refresh()
      } else {
        setError(result.error || 'Erro ao excluir pasta')
      }
    } catch (err) {
      console.error('Error deleting folder:', err)
      setError('Erro ao excluir pasta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir pasta &quot;{folder.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {hasDocuments ? (
                <>
                  <p className="text-destructive font-medium">
                    Esta pasta contém {documentCount} documento{documentCount !== 1 ? 's' : ''}.
                  </p>
                  <p>
                    Ao excluir a pasta, <strong>todos os documentos serão permanentemente removidos</strong>.
                    Esta ação não pode ser desfeita.
                  </p>
                </>
              ) : (
                <p>
                  Esta pasta está vazia e será excluída permanentemente.
                  Esta ação não pode ser desfeita.
                </p>
              )}
              {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hasDocuments ? 'Excluir pasta e documentos' : 'Excluir pasta'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
