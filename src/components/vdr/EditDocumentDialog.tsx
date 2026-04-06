'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, X, Calendar, Link as LinkIcon } from 'lucide-react'
import { updateDocument } from '@/lib/actions/vdr'
import type { 
  VdrDocument,
  VdrDocumentPriority, 
  VdrDocumentStatus,
  VdrDocumentRisk,
  VdrFolder,
} from '@/types/vdr'
import { PRIORITY_LABELS, STATUS_LABELS, RISK_LABELS } from '@/types/vdr'

interface FolderOption {
  id: string
  name: string
  code?: string | null
}

interface ResponsibleOption {
  id: string
  name: string
}

// Accept any document type that has the base VdrDocument fields plus folder info
type EditableDocument = VdrDocument & {
  folder?: Pick<VdrFolder, 'id' | 'name' | 'slug' | 'icon'> & { code: string | null }
}

interface EditDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: EditableDocument
  folders?: FolderOption[]
  responsibles?: ResponsibleOption[]
  onSuccess?: () => void
}

export function EditDocumentDialog({
  open,
  onOpenChange,
  document,
  folders = [],
  responsibles = [],
  onSuccess,
}: EditDocumentDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: document.name,
    description: document.description || '',
    externalUrl: document.external_url || '',
    isConfidential: document.is_confidential || false,
    folderId: document.folder_id,
    // New fields
    code: document.code || '',
    priority: (document.priority || 'medium') as VdrDocumentPriority,
    status: (document.status || 'pending') as VdrDocumentStatus,
    businessUnit: document.business_unit || '',
    responsibleId: document.responsible_id || '',
    startDate: document.start_date ? document.start_date.split('T')[0] : '',
    dueDate: document.due_date ? document.due_date.split('T')[0] : '',
    risk: (document.risk || '') as VdrDocumentRisk | '',
    tags: (document.tags as string[]) || [],
  })

  // Reset form when document changes
  useEffect(() => {
    setFormData({
      name: document.name,
      description: document.description || '',
      externalUrl: document.external_url || '',
      isConfidential: document.is_confidential || false,
      folderId: document.folder_id,
      code: document.code || '',
      priority: (document.priority || 'medium') as VdrDocumentPriority,
      status: (document.status || 'pending') as VdrDocumentStatus,
      businessUnit: document.business_unit || '',
      responsibleId: document.responsible_id || '',
      startDate: document.start_date ? document.start_date.split('T')[0] : '',
      dueDate: document.due_date ? document.due_date.split('T')[0] : '',
      risk: (document.risk || '') as VdrDocumentRisk | '',
      tags: (document.tags as string[]) || [],
    })
    setError(null)
    setTagInput('')
  }, [document])

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

    // Validation
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    // URL validation (if provided)
    if (formData.externalUrl.trim()) {
      try {
        new URL(formData.externalUrl)
      } catch {
        setError('URL inválida')
        return
      }
    }

    setIsSubmitting(true)

    const result = await updateDocument(document.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      externalUrl: formData.externalUrl.trim(),
      isConfidential: formData.isConfidential,
      folderId: formData.folderId !== document.folder_id ? formData.folderId : undefined,
      // New fields
      code: formData.code.trim() || undefined,
      priority: formData.priority,
      status: formData.status,
      businessUnit: formData.businessUnit.trim() || undefined,
      responsibleId: formData.responsibleId || undefined,
      startDate: formData.startDate || undefined,
      dueDate: formData.dueDate || undefined,
      risk: formData.risk || undefined,
      tags: formData.tags,
    })

    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Erro ao atualizar documento')
      return
    }

    onOpenChange(false)
    onSuccess?.()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>
              Código: <span className="font-mono font-medium">{document.code || 'N/A'}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Row: Name + Folder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              {folders.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="folder">Pasta</Label>
                  <Select
                    value={formData.folderId}
                    onValueChange={(value) => setFormData({ ...formData, folderId: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              )}
            </div>

            {/* External URL */}
            <div className="grid gap-2">
              <Label htmlFor="externalUrl">Link do documento</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="externalUrl"
                  type="url"
                  className="pl-10"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Row: Priority + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: VdrDocumentPriority) => setFormData({ ...formData, priority: value })}
                  disabled={isSubmitting}
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: VdrDocumentStatus) => setFormData({ ...formData, status: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row: Risk + Responsible */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="risk">Risco</Label>
                <Select
                  value={formData.risk || '_none_'}
                  onValueChange={(value) => setFormData({ ...formData, risk: value === '_none_' ? '' : value as VdrDocumentRisk })}
                  disabled={isSubmitting}
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
              {responsibles.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="responsible">Responsável</Label>
                  <Select
                    value={formData.responsibleId || '_none_'}
                    onValueChange={(value) => setFormData({ ...formData, responsibleId: value === '_none_' ? '' : value })}
                    disabled={isSubmitting}
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
              )}
            </div>

            {/* Row: Start Date + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Data Início</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    className="pl-10"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
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
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Business Unit */}
            <div className="grid gap-2">
              <Label htmlFor="businessUnit">Business Unit</Label>
              <Input
                id="businessUnit"
                value={formData.businessUnit}
                onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                placeholder="Ex: Corporativo, Filial SP, etc."
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                <Button type="button" variant="outline" onClick={handleAddTag} disabled={isSubmitting}>
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
                        disabled={isSubmitting}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do documento..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Confidential */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isConfidential"
                checked={formData.isConfidential}
                onCheckedChange={(checked) => setFormData({ ...formData, isConfidential: checked === true })}
                disabled={isSubmitting}
              />
              <Label htmlFor="isConfidential" className="text-sm font-normal">
                Documento confidencial
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
