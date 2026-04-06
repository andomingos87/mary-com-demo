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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Link as LinkIcon, Loader2, X, Calendar } from 'lucide-react'
import { createDocument } from '@/lib/actions/vdr'
import type { VdrDocumentPriority, VdrDocumentRisk } from '@/types/vdr'
import { PRIORITY_LABELS, RISK_LABELS } from '@/types/vdr'

interface FolderOption {
  id: string
  name: string
  code?: string | null
}

interface ResponsibleOption {
  id: string
  name: string
}

interface AddDocumentDialogProps {
  projectId: string
  folders: FolderOption[]
  selectedFolderId?: string
  responsibles?: ResponsibleOption[]
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm'
  onSuccess?: () => void
}

export function AddDocumentDialog({
  projectId,
  folders,
  selectedFolderId,
  responsibles = [],
  variant = 'default',
  size = 'default',
  onSuccess,
}: AddDocumentDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    externalUrl: '',
    folderId: selectedFolderId || '',
    description: '',
    fileType: '',
    isConfidential: false,
    // New fields
    priority: 'medium' as VdrDocumentPriority,
    businessUnit: '',
    responsibleId: '',
    dueDate: '',
    risk: '' as VdrDocumentRisk | '',
    tags: [] as string[],
  })

  // Generate code preview based on selected folder
  const selectedFolder = folders.find(f => f.id === formData.folderId)
  const codePreview = selectedFolder?.code ? `${selectedFolder.code}-XX` : 'Selecione uma pasta'

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    if (!formData.folderId) {
      setError('Selecione uma pasta')
      return
    }

    // URL is optional now - documents can start without a link
    if (formData.externalUrl.trim()) {
      try {
        new URL(formData.externalUrl)
      } catch {
        setError('Link inválido. Insira uma URL completa (ex: https://...)')
        return
      }
    }

    setIsLoading(true)

    const result = await createDocument({
      projectId,
      folderId: formData.folderId,
      name: formData.name.trim(),
      externalUrl: formData.externalUrl.trim() || '',
      description: formData.description.trim() || undefined,
      fileType: formData.fileType.trim() || undefined,
      isConfidential: formData.isConfidential,
      // New fields
      priority: formData.priority,
      businessUnit: formData.businessUnit.trim() || undefined,
      responsibleId: formData.responsibleId || undefined,
      dueDate: formData.dueDate || undefined,
      risk: formData.risk || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    })

    setIsLoading(false)

    if (result.success) {
      setOpen(false)
      setFormData({
        name: '',
        externalUrl: '',
        folderId: selectedFolderId || '',
        description: '',
        fileType: '',
        isConfidential: false,
        priority: 'medium',
        businessUnit: '',
        responsibleId: '',
        dueDate: '',
        risk: '',
        tags: [],
      })
      onSuccess?.()
      router.refresh()
    } else {
      setError(result.error || 'Erro ao criar documento')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Plus className="h-4 w-4 mr-2" />
          Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Documento</DialogTitle>
            <DialogDescription>
              Adicione um documento ao VDR. O código será gerado automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Code Preview */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 px-3 py-2 rounded">
              <span>Código:</span>
              <span className="font-mono font-medium">{codePreview}</span>
            </div>

            {/* Row: Name + Folder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Balanço Patrimonial 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="folder">Pasta *</Label>
                <Select
                  value={formData.folderId}
                  onValueChange={(value) => setFormData({ ...formData, folderId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.code && <span className="font-mono mr-2 text-gray-500">{folder.code}</span>}
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* External URL */}
            <div className="grid gap-2">
              <Label htmlFor="url">Link do documento</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  placeholder="https://drive.google.com/..."
                  className="pl-10"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Opcional. Adicione o link depois se preferir.
              </p>
            </div>

            {/* Row: Priority + Risk */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: VdrDocumentPriority) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="risk">Risco</Label>
                <Select
                  value={formData.risk || '_none_'}
                  onValueChange={(value) => setFormData({ ...formData, risk: value === '_none_' ? '' : value as VdrDocumentRisk })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">Não definido</SelectItem>
                    {Object.entries(RISK_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row: Responsible + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Select
                  value={formData.responsibleId || '_none_'}
                  onValueChange={(value) => setFormData({ ...formData, responsibleId: value === '_none_' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">Nenhum</SelectItem>
                    {responsibles.filter(r => r.id).map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Prazo</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    className="pl-10"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Business Unit */}
            <div className="grid gap-2">
              <Label htmlFor="businessUnit">Business Unit</Label>
              <Input
                id="businessUnit"
                placeholder="Ex: Corporativo, Filial SP, etc."
                value={formData.businessUnit}
                onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  +
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Breve descrição do documento..."
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Confidential */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confidential"
                checked={formData.isConfidential}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isConfidential: checked === true })
                }
              />
              <Label htmlFor="confidential" className="text-sm font-normal">
                Documento confidencial (Q&A restrito a gestores)
              </Label>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
