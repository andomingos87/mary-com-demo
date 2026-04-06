'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Lock, FileText } from 'lucide-react'
import type { VdrSharedLink, VdrDocument, VdrFolder } from '@/types/vdr'
import { SharedLinkLayout } from './SharedLinkLayout'
import { SharedLinkError } from './SharedLinkError'

interface SharedDocumentViewProps {
  link: VdrSharedLink & {
    document?: VdrDocument | null
    folder?: VdrFolder | null
  }
}

export function SharedDocumentView({ link }: SharedDocumentViewProps) {
  const [showWarning, setShowWarning] = useState(true)

  // Anti-copy and anti-print protections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P (print) and Ctrl+S (save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault()
        alert('Esta ação não é permitida.')
      }
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault()
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  const doc = link.document
  const folder = link.folder

  // If it's a folder link, show placeholder message
  if (folder && !doc) {
    return (
      <SharedLinkLayout>
        <div className="bg-card border rounded-lg p-8 shadow-sm max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">{folder.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Visualização de pastas compartilhadas será implementada em versão futura.
          </p>
        </div>
      </SharedLinkLayout>
    )
  }

  // Document not found
  if (!doc) {
    return <SharedLinkError error="Documento não encontrado" />
  }

  return (
    <SharedLinkLayout fullWidth>
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-card rounded-t-lg">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{doc.name}</h1>
            {doc.is_confidential && (
              <Badge variant="secondary">
                <Lock className="h-3 w-3 mr-1" />
                Confidencial
              </Badge>
            )}
          </div>
        </div>

        {/* Warning Banner */}
        {showWarning && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <span>
                Este documento é protegido. Tentativas de impressão ou captura são registradas.
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWarning(false)}
              className="text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900"
            >
              Entendi
            </Button>
          </div>
        )}

        {/* Document Viewer */}
        <div className="flex-1 relative overflow-hidden bg-card rounded-b-lg vdr-protected-content">
          <style jsx global>{`
            @media print {
              .vdr-protected-content { display: none !important; }
              body::after {
                content: "Impressão não permitida";
                display: block;
                font-size: 24px;
                text-align: center;
                padding: 100px;
              }
            }
            .vdr-protected-content {
              -webkit-user-select: none;
              user-select: none;
            }
          `}</style>

          <iframe
            src={doc.external_url}
            className="w-full h-full border-0"
            title={doc.name}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />

          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-400 transform -rotate-45">
              CONFIDENCIAL
            </span>
          </div>
        </div>

        {/* Description */}
        {doc.description && (
          <div className="px-6 py-3 border-t bg-muted/50">
            <p className="text-sm text-muted-foreground">{doc.description}</p>
          </div>
        )}
      </div>
    </SharedLinkLayout>
  )
}
