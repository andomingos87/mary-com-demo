'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  Lock,
  AlertTriangle,
  X,
  MessageSquare,
} from 'lucide-react'
import type { VdrDocumentWithFolder } from '@/types/vdr'
import { logViewStart, logViewEnd, logPrintAttempt } from '@/lib/actions/vdr'
import { nanoid } from 'nanoid'
import { VdrQaPanel } from './VdrQaPanel'

interface DocumentViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: VdrDocumentWithFolder
  projectId: string
  canManage?: boolean
}

export function DocumentViewerDialog({
  open,
  onOpenChange,
  doc,
  projectId,
  canManage = false,
}: DocumentViewerDialogProps) {
  const sessionIdRef = useRef<string | null>(null)
  const [showWarning, setShowWarning] = useState(true)
  const [showQa, setShowQa] = useState(false)

  // Start session when dialog opens
  useEffect(() => {
    if (open && !sessionIdRef.current) {
      const sessionId = nanoid()
      sessionIdRef.current = sessionId

      // Log view start
      logViewStart(projectId, doc.id, sessionId)

      // Set up anti-print protection
      const handleKeyDown = (e: KeyboardEvent) => {
        // Block Ctrl+P, Cmd+P (print)
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          e.preventDefault()
          logPrintAttempt(projectId, doc.id, sessionId)
          alert('Impressão não permitida. Esta tentativa foi registrada.')
        }

        // Block Ctrl+S, Cmd+S (save)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault()
        }

        // Block PrintScreen
        if (e.key === 'PrintScreen') {
          e.preventDefault()
          logPrintAttempt(projectId, doc.id, sessionId)
          alert('Captura de tela não permitida. Esta tentativa foi registrada.')
        }
      }

      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
      }

      const handleBeforePrint = () => {
        logPrintAttempt(projectId, doc.id, sessionId)
      }

      window.document.addEventListener('keydown', handleKeyDown)
      window.document.addEventListener('contextmenu', handleContextMenu)
      window.addEventListener('beforeprint', handleBeforePrint)

      return () => {
        window.document.removeEventListener('keydown', handleKeyDown)
        window.document.removeEventListener('contextmenu', handleContextMenu)
        window.removeEventListener('beforeprint', handleBeforePrint)
      }
    }
  }, [open, projectId, doc.id])

  // End session when dialog closes
  useEffect(() => {
    if (!open && sessionIdRef.current) {
      logViewEnd(sessionIdRef.current)
      sessionIdRef.current = null
    }
  }, [open])

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg">{doc.name}</DialogTitle>
              {doc.is_confidential && (
                <Badge variant="secondary">
                  <Lock className="h-3 w-3 mr-1" />
                  Confidencial
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showQa ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowQa(!showQa)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Q&amp;A
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={doc.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Original
                </a>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Warning Banner */}
        {showWarning && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950 border-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <span>
                Este documento é protegido. Tentativas de impressão ou captura de tela são registradas.
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

        {/* Document Viewer + Q&A */}
        <div className="flex-1 flex overflow-hidden">
          {/* Viewer */}
          <div className="flex-1 relative overflow-hidden vdr-protected-content">
            {/* Anti-print CSS overlay */}
            <style jsx global>{`
              @media print {
                .vdr-protected-content {
                  display: none !important;
                }
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
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
              }
            `}</style>

            {/* Iframe for external content */}
            <iframe
              src={doc.external_url}
              className="w-full h-full border-0"
              title={doc.name}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />

            {/* Watermark overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 100px,
                  rgba(0,0,0,0.1) 100px,
                  rgba(0,0,0,0.1) 200px
                )`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-4xl font-bold text-gray-400 transform -rotate-45 whitespace-nowrap"
                  style={{ opacity: 0.1 }}
                >
                  CONFIDENCIAL
                </span>
              </div>
            </div>
          </div>

          {/* Q&A Side Panel */}
          {showQa && (
            <div className="w-80 border-l flex flex-col overflow-hidden shrink-0 bg-background">
              <VdrQaPanel
                documentId={doc.id}
                projectId={projectId}
                canManage={canManage}
              />
            </div>
          )}
        </div>

        {/* Footer with description */}
        {doc.description && (
          <div className="px-6 py-3 border-t bg-muted/50 shrink-0">
            <p className="text-sm text-muted-foreground">{doc.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
