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
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { FolderPlus, Loader2 } from 'lucide-react'
import { createFolder } from '@/lib/actions/vdr'

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

interface CreateFolderDialogProps {
  projectId: string
  existingSlugs: string[]
}

/**
 * Generate a URL-safe slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
    .substring(0, 50) // Limit length
}

export function CreateFolderDialog({ projectId, existingSlugs }: CreateFolderDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('folder')

  const slug = generateSlug(name)
  const isSlugTaken = existingSlugs.includes(slug)
  const isValid = name.trim().length >= 2 && !isSlugTaken

  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError(null)
    try {
      const result = await createFolder({
        projectId,
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        icon,
      })

      if (result.success) {
        setOpen(false)
        resetForm()
        router.refresh()
      } else {
        setError(result.error || 'Erro ao criar pasta')
      }
    } catch (err) {
      console.error('Error creating folder:', err)
      setError('Erro ao criar pasta')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setDescription('')
    setIcon('folder')
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <FolderPlus className="h-4 w-4" />
          Nova Pasta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Nova Pasta</DialogTitle>
            <DialogDescription>
              Crie uma pasta customizada para organizar seus documentos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Pasta *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Contratos 2024"
                disabled={loading}
                autoFocus
              />
              {name && (
                <p className="text-xs text-muted-foreground">
                  Slug: <code className="bg-muted px-1 rounded">{slug || '...'}</code>
                  {isSlugTaken && (
                    <span className="text-destructive ml-2">
                      (já existe uma pasta com este nome)
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional da pasta..."
                disabled={loading}
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="icon">Ícone</Label>
              <Select value={icon} onValueChange={setIcon} disabled={loading}>
                <SelectTrigger id="icon">
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Pasta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
