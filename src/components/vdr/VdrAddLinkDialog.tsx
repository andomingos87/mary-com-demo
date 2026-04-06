'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { addDocumentLink } from '@/lib/actions/vdr'
import { toast } from 'sonner'
import type { VdrLinkType } from '@/types/vdr'

const LINK_TYPES: { value: VdrLinkType; label: string }[] = [
  { value: 'generic', label: 'Link Externo' },
  { value: 'drive', label: 'Google Drive' },
  { value: 'dropbox', label: 'Dropbox' },
  { value: 'onedrive', label: 'OneDrive' },
  { value: 'linkedin', label: 'LinkedIn' },
]

interface VdrAddLinkDialogProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function VdrAddLinkDialog({
  documentId,
  isOpen,
  onClose,
  onSuccess,
}: VdrAddLinkDialogProps) {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [linkType, setLinkType] = useState<VdrLinkType>('generic')
  const [isLoading, setIsLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setUrlError('URL é obrigatória')
      return false
    }
    try {
      new URL(value)
      setUrlError(null)
      return true
    } catch {
      setUrlError('URL inválida')
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateUrl(url)) return

    setIsLoading(true)
    try {
      const result = await addDocumentLink({
        documentId,
        url: url.trim(),
        label: label.trim() || undefined,
        linkType,
      })

      if (result.success) {
        toast.success('Link adicionado com sucesso')
        handleClose()
        onSuccess()
      } else {
        toast.error(result.error || 'Erro ao adicionar link')
      }
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error('Erro ao adicionar link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setUrl('')
    setLabel('')
    setLinkType('generic')
    setUrlError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Adicionar Link
          </DialogTitle>
          <DialogDescription>
            Adicione um link externo ao documento (Google Drive, SharePoint, etc.)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">
              URL <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (urlError) validateUrl(e.target.value)
                }}
                onBlur={() => url && validateUrl(url)}
                className={`pl-10 ${urlError ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
            </div>
            {urlError && (
              <p className="text-sm text-destructive">{urlError}</p>
            )}
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Título/Descrição (opcional)</Label>
            <Input
              id="label"
              placeholder="Ex: Contrato de Prestação de Serviços"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Link Type */}
          <div className="space-y-2">
            <Label htmlFor="linkType">Tipo de Link</Label>
            <Select value={linkType} onValueChange={(value) => setLinkType(value as VdrLinkType)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {LINK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !url.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
