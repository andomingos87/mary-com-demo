'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Loader2,
  ChevronDown,
  ChevronRight,
  Reply,
  Star,
} from 'lucide-react'
import { formatDistanceToNow, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  createQaMessage,
  getQaMessagesWithAuthors,
  resolveQaMessage,
  promoteQaToFaq,
} from '@/lib/actions/vdr'
import type { VdrQaMessage } from '@/types/vdr'

// =========================================
// Types
// =========================================

interface VdrQaPanelProps {
  documentId: string
  projectId: string
  canManage: boolean
}

interface QaMessageWithOrg extends VdrQaMessage {
  author_org?: {
    id: string
    name: string
    profile_type: string
  } | null
}

interface QaThread {
  question: QaMessageWithOrg
  replies: QaMessageWithOrg[]
}

// =========================================
// Helpers
// =========================================

function getSlaStatus(createdAt: string, isResolved: boolean) {
  if (isResolved) return null
  const hours = differenceInHours(new Date(), new Date(createdAt))
  if (hours >= 48) return 'exceeded' as const
  if (hours >= 24) return 'warning' as const
  return null
}

function buildThreads(messages: QaMessageWithOrg[]): QaThread[] {
  const questions = messages.filter((m) => !m.parent_id)
  const repliesMap = new Map<string, QaMessageWithOrg[]>()

  messages.forEach((m) => {
    if (m.parent_id) {
      const existing = repliesMap.get(m.parent_id) || []
      existing.push(m)
      repliesMap.set(m.parent_id, existing)
    }
  })

  return questions.map((q) => ({
    question: q,
    replies: repliesMap.get(q.id) || [],
  }))
}

// =========================================
// Main Component
// =========================================

export function VdrQaPanel({ documentId, projectId, canManage }: VdrQaPanelProps) {
  const [threads, setThreads] = useState<QaThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState('')
  const [isConfidential, setIsConfidential] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [promotingId, setPromotingId] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    setIsLoading(true)
    const result = await getQaMessagesWithAuthors(documentId)
    if (result.success && result.data) {
      const builtThreads = buildThreads(result.data as QaMessageWithOrg[])
      setThreads(builtThreads)
      // Auto-expand all threads on first load
      setExpandedThreads(new Set(builtThreads.map((t) => t.question.id)))
    }
    setIsLoading(false)
  }, [documentId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const handleSendQuestion = async () => {
    if (!newQuestion.trim()) return

    setIsSending(true)
    const result = await createQaMessage({
      projectId,
      documentId,
      content: newQuestion.trim(),
      isConfidential,
    })
    setIsSending(false)

    if (result.success) {
      setNewQuestion('')
      setIsConfidential(false)
      loadMessages()
    }
  }

  const handleSendReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    setIsReplying(true)
    const result = await createQaMessage({
      projectId,
      documentId,
      content: replyContent.trim(),
      parentId,
    })
    setIsReplying(false)

    if (result.success) {
      setReplyContent('')
      setReplyingTo(null)
      loadMessages()
    }
  }

  const handleResolve = async (messageId: string) => {
    setResolvingId(messageId)
    const result = await resolveQaMessage(messageId)
    setResolvingId(null)

    if (result.success) {
      loadMessages()
    }
  }

  const handlePromoteToFaq = async (messageId: string) => {
    setPromotingId(messageId)
    const result = await promoteQaToFaq(messageId)
    setPromotingId(null)

    if (result.success) {
      // Optionally show a toast or notification
      // The FAQ document was created successfully
    }
  }

  const toggleThread = (threadId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev)
      if (next.has(threadId)) {
        next.delete(threadId)
      } else {
        next.add(threadId)
      }
      return next
    })
  }

  // =========================================
  // Render
  // =========================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Perguntas &amp; Respostas</h3>
          <Badge variant="secondary" className="text-xs">
            {threads.length}
          </Badge>
        </div>
      </div>

      {/* Threads */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {threads.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma pergunta ainda.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Faça uma pergunta sobre este documento.
            </p>
          </div>
        ) : (
          threads.map((thread) => (
            <ThreadItem
              key={thread.question.id}
              thread={thread}
              isExpanded={expandedThreads.has(thread.question.id)}
              onToggle={() => toggleThread(thread.question.id)}
              canManage={canManage}
              replyingTo={replyingTo}
              replyContent={replyContent}
              isReplying={isReplying}
              resolvingId={resolvingId}
              promotingId={promotingId}
              onReplyClick={(id) => {
                setReplyingTo(replyingTo === id ? null : id)
                setReplyContent('')
              }}
              onReplyContentChange={setReplyContent}
              onSendReply={handleSendReply}
              onCancelReply={() => {
                setReplyingTo(null)
                setReplyContent('')
              }}
              onResolve={handleResolve}
              onPromoteToFaq={handlePromoteToFaq}
            />
          ))
        )}
      </div>

      {/* New Question Form */}
      <div className="border-t px-4 py-3 shrink-0 space-y-2">
        <Textarea
          placeholder="Faça uma pergunta sobre este documento..."
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          rows={2}
          className="text-sm resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="qa-confidential"
              checked={isConfidential}
              onCheckedChange={(checked) => setIsConfidential(checked === true)}
            />
            <Label
              htmlFor="qa-confidential"
              className="text-xs font-normal flex items-center gap-1"
            >
              <Lock className="h-3 w-3" />
              Confidencial
            </Label>
          </div>
          <Button
            size="sm"
            onClick={handleSendQuestion}
            disabled={isSending || !newQuestion.trim()}
          >
            {isSending ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Send className="h-3 w-3 mr-1" />
            )}
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}

// =========================================
// Thread Item
// =========================================

interface ThreadItemProps {
  thread: QaThread
  isExpanded: boolean
  onToggle: () => void
  canManage: boolean
  replyingTo: string | null
  replyContent: string
  isReplying: boolean
  resolvingId: string | null
  promotingId: string | null
  onReplyClick: (id: string) => void
  onReplyContentChange: (content: string) => void
  onSendReply: (parentId: string) => void
  onCancelReply: () => void
  onResolve: (id: string) => void
  onPromoteToFaq: (id: string) => void
}

function ThreadItem({
  thread,
  isExpanded,
  onToggle,
  canManage,
  replyingTo,
  replyContent,
  isReplying,
  resolvingId,
  promotingId,
  onReplyClick,
  onReplyContentChange,
  onSendReply,
  onCancelReply,
  onResolve,
  onPromoteToFaq,
}: ThreadItemProps) {
  const { question, replies } = thread
  const slaStatus = getSlaStatus(question.created_at, question.is_resolved ?? false)

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Question Header */}
      <div className="p-3 bg-muted/30">
        <div className="flex items-start gap-2">
          <button onClick={onToggle} className="mt-0.5 shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-primary">
                {question.author_org?.name || 'Anônimo'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(question.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              {question.is_confidential && (
                <Badge variant="secondary" className="text-xs py-0">
                  <Lock className="h-3 w-3 mr-0.5" />
                  Confidencial
                </Badge>
              )}
              {question.is_resolved && (
                <Badge className="text-xs py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-emerald-100">
                  <CheckCircle2 className="h-3 w-3 mr-0.5" />
                  Resolvido
                </Badge>
              )}
              {slaStatus === 'warning' && (
                <Badge
                  variant="secondary"
                  className="text-xs py-0 text-amber-700 bg-amber-100 dark:bg-amber-900 dark:text-amber-200"
                >
                  <Clock className="h-3 w-3 mr-0.5" />
                  Aguardando
                </Badge>
              )}
              {slaStatus === 'exceeded' && (
                <Badge variant="destructive" className="text-xs py-0">
                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                  SLA excedido
                </Badge>
              )}
            </div>

            {/* Content */}
            <p className="text-sm mt-1 whitespace-pre-wrap">{question.content}</p>

            {/* Reply count */}
            <span className="text-xs text-muted-foreground mt-1 inline-block">
              {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded: Replies + Actions */}
      {isExpanded && (
        <div className="border-t">
          {/* Replies */}
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="p-3 pl-10 border-b last:border-b-0 bg-background"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Reply className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-primary">
                  {reply.author_org?.name || 'Anônimo'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(reply.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-sm mt-1 ml-5 whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}

          {/* Actions */}
          <div className="p-2 pl-10 flex items-center gap-2 bg-muted/20 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReplyClick(question.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Responder
            </Button>
            {canManage && !question.is_resolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolve(question.id)}
                disabled={resolvingId === question.id}
                className="text-emerald-600 hover:text-emerald-700"
              >
                {resolvingId === question.id ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                )}
                Marcar resolvido
              </Button>
            )}
            {canManage && question.is_resolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPromoteToFaq(question.id)}
                disabled={promotingId === question.id}
                className="text-amber-600 hover:text-amber-700"
              >
                {promotingId === question.id ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Star className="h-3 w-3 mr-1" />
                )}
                Promover a FAQ
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === question.id && (
            <div className="p-3 pl-10 border-t bg-background">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyContent}
                onChange={(e) => onReplyContentChange(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={onCancelReply}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSendReply(question.id)}
                  disabled={isReplying || !replyContent.trim()}
                >
                  {isReplying && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  <Send className="h-3 w-3 mr-1" />
                  Enviar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
