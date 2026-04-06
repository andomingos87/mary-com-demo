'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Copy,
  Check,
  Loader2,
  Link as LinkIcon,
  Clock,
  Eye,
  Lock,
  FileText,
  Folder,
} from 'lucide-react'
import { createSharedLink } from '@/lib/actions/vdr'
import type { VdrDocumentWithFolder, VdrFolderWithCounts } from '@/types/vdr'

interface ShareVdrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  document?: VdrDocumentWithFolder
  folder?: VdrFolderWithCounts
  onSuccess?: () => void
}

/**
 * Dialog para compartilhar documento ou pasta via link
 * Suporta:
 * - Compartilhar documento individual (document prop)
 * - Compartilhar pasta inteira (folder prop)
 */
export function ShareVdrDialog({
  open,
  onOpenChange,
  projectId,
  document,
  folder,
  onSuccess,
}: ShareVdrDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [options, setOptions] = useState({
    expiresIn: '', // days
    maxViews: '',
    hasPassword: false,
    password: '',
  })

  const isFolder = !!folder
  const targetName = folder?.name || document?.name || 'Item'
  const targetType = isFolder ? 'pasta' : 'documento'

  const handleGenerate = async () => {
    setError(null)
    setIsLoading(true)

    // Calculate expiration
    let expiresAt: string | undefined
    if (options.expiresIn) {
      const days = parseInt(options.expiresIn)
      if (days > 0) {
        const date = new Date()
        date.setDate(date.getDate() + days)
        expiresAt = date.toISOString()
      }
    }

    const result = await createSharedLink({
      projectId,
      documentId: document?.id,
      folderId: folder?.id,
      expiresAt,
      maxViews: options.maxViews ? parseInt(options.maxViews) : undefined,
      password: options.hasPassword ? options.password : undefined,
    })

    setIsLoading(false)

    if (result.success && result.data) {
      setGeneratedLink(result.data.url)
      onSuccess?.()
    } else {
      setError(result.error || 'Erro ao gerar link')
    }
  }

  const handleCopy = async () => {
    if (!generatedLink) return

    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setGeneratedLink(null)
    setError(null)
    setOptions({
      expiresIn: '',
      maxViews: '',
      hasPassword: false,
      password: '',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isFolder ? (
              <Folder className="h-5 w-5 text-amber-500" />
            ) : (
              <FileText className="h-5 w-5 text-blue-500" />
            )}
            Compartilhar {isFolder ? 'Pasta' : 'Documento'}
          </DialogTitle>
          <DialogDescription>
            Gere um link para compartilhar &ldquo;{targetName}&rdquo;
            {isFolder && (
              <span className="block mt-1 text-xs">
                Todos os documentos desta pasta serão acessíveis via este link
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {generatedLink ? (
          // Success state - show generated link
          <div className="py-4 space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                Link gerado com sucesso!
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="text-xs bg-white dark:bg-gray-900"
                />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {options.hasPassword && (
              <p className="text-sm text-muted-foreground">
                <Lock className="h-4 w-4 inline mr-1" />
                Senha necessária: <code className="bg-muted px-1 rounded">{options.password}</code>
              </p>
            )}

            {isFolder && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <Folder className="h-3 w-3 inline mr-1" />
                  Este link dá acesso a todos os documentos da pasta &ldquo;{targetName}&rdquo;
                </p>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </div>
        ) : (
          // Configuration state
          <div className="py-4 space-y-4">
            {/* Target Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                {isFolder ? (
                  <Folder className="h-4 w-4 text-amber-500" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm font-medium">{targetName}</span>
              </div>
              {isFolder && folder && (
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  {folder.documentCount} documento{folder.documentCount !== 1 ? 's' : ''} nesta pasta
                </p>
              )}
            </div>

            {/* Expiration */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expiração (opcional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="7"
                  min="1"
                  max="365"
                  value={options.expiresIn}
                  onChange={(e) => setOptions({ ...options, expiresIn: e.target.value })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Deixe vazio para link permanente
              </p>
            </div>

            {/* Max Views */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Limite de visualizações (opcional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="10"
                  min="1"
                  max="1000"
                  value={options.maxViews}
                  onChange={(e) => setOptions({ ...options, maxViews: e.target.value })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">visualizações</span>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPassword"
                  checked={options.hasPassword}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, hasPassword: checked === true })
                  }
                />
                <Label htmlFor="hasPassword" className="text-sm font-normal flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Proteger com senha
                </Label>
              </div>

              {options.hasPassword && (
                <Input
                  type="text"
                  placeholder="Digite uma senha"
                  value={options.password}
                  onChange={(e) => setOptions({ ...options, password: e.target.value })}
                />
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <LinkIcon className="h-4 w-4 mr-2" />
                Gerar Link
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
