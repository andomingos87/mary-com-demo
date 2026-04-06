'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AtSign, FileText, ImageIcon, Paperclip, Send, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type MaryAiProfile = 'investor' | 'asset' | 'advisor' | null

const ASSET_ICEBREAKERS = [
  'O que a Mary AI pode fazer?',
  'Pergunte sobre este projeto',
  'Suba Q&As e obtenha respostas',
  'Convide investidores para seu projeto',
]

const INVESTOR_ICEBREAKERS = [
  'O que a Mary AI pode fazer?',
  'Pergunte sobre um projeto',
  'Suba Q&As e obtenha respostas',
  'Convide novos Ativos',
]

const ADVISOR_ICEBREAKERS = [
  'O que a Mary AI pode fazer?',
  'Pergunte sobre um projeto',
  'Suba Q&As e obtenha respostas',
  'Explique o próximo passo da transação',
]

const DEFAULT_MENTION_SUGGESTIONS = [
  'Q&A Projeto Prioritário',
  'Memorando Executivo',
  'Checklist de Due Diligence',
]

const ACCEPTED_FILE_TYPES = [
  'image/*',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
]

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  attachments?: string[]
}

interface IcebreakerContext {
  currentPage?: string
  projectCodename?: string
}

function getRouteSection(pathname?: string): string | null {
  if (!pathname) return null
  const normalized = pathname.split('?')[0].split('#')[0]
  const [, , section] = normalized.split('/')
  return section || null
}

export function getMaryAiIcebreakers(profile: MaryAiProfile, context?: IcebreakerContext): string[] {
  const routeSection = getRouteSection(context?.currentPage)
  const isProjectPage = Boolean(context?.currentPage?.includes('/projects/'))
  const codename = context?.projectCodename?.trim()

  if (profile === 'asset') {
    if (isProjectPage && codename) {
      return [
        'O que a Mary AI pode fazer?',
        `Pergunte sobre o projeto ${codename}`,
        'Suba Q&As e obtenha respostas',
        'Convide investidores para seu projeto',
      ]
    }
    if (routeSection === 'feed') {
      return [
        'O que a Mary AI pode fazer?',
        'Resuma os eventos do feed',
        'Suba Q&As e obtenha respostas',
        'Convide investidores para seu projeto',
      ]
    }
    if (routeSection === 'pipeline') {
      return [
        'O que a Mary AI pode fazer?',
        'Organize os próximos passos do pipeline',
        'Suba Q&As e obtenha respostas',
        'Convide investidores para seu projeto',
      ]
    }
    return ASSET_ICEBREAKERS
  }

  if (profile === 'investor') {
    if (isProjectPage && codename) {
      return [
        'O que a Mary AI pode fazer?',
        `Pergunte sobre o projeto ${codename}`,
        'Suba Q&As e obtenha respostas',
        'Convide novos Ativos',
      ]
    }
    if (routeSection === 'feed') {
      return [
        'O que a Mary AI pode fazer?',
        'Resuma os eventos do feed',
        'Suba Q&As e obtenha respostas',
        'Convide novos Ativos',
      ]
    }
    if (routeSection === 'radar') {
      return [
        'O que a Mary AI pode fazer?',
        'Analise os matches do Radar',
        'Suba Q&As e obtenha respostas',
        'Convide novos Ativos',
      ]
    }
    if (routeSection === 'tese') {
      return [
        'O que a Mary AI pode fazer?',
        'Revise minha tese de investimento',
        'Suba Q&As e obtenha respostas',
        'Convide novos Ativos',
      ]
    }
    return INVESTOR_ICEBREAKERS
  }

  if (routeSection === 'feed') {
    return [
      'O que a Mary AI pode fazer?',
      'Resuma os eventos do feed',
      'Suba Q&As e obtenha respostas',
      'Explique o próximo passo da transação',
    ]
  }

  return ADVISOR_ICEBREAKERS
}

export function buildMaryAiDisclaimer(organizationName: string): string {
  return `A Mary AI pode cometer erros. A Mary não usa dados da "${organizationName}" para treinar os modelos.`
}

export interface MaryAiChatContentProps {
  assistantWelcomeMessage: string
  icebreakers: string[]
  initialMessage?: string
  mentionSuggestions?: string[]
  disclaimerText?: string
  storageKey?: string
  isVisible?: boolean
  showFirstGreeting?: boolean
  firstGreetingMessage?: string
  onFirstGreetingConsumed?: () => void
  className?: string
}

function filterTransientMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.id !== 'assistant-first-greeting')
}

function writeChatHistoryToStorage(storageKey: string | undefined, messages: ChatMessage[]) {
  if (!storageKey || typeof window === 'undefined') return
  window.sessionStorage.setItem(storageKey, JSON.stringify(filterTransientMessages(messages)))
}

function buildAssistantReply(userMessage: string): string {
  if (userMessage.toLowerCase().includes('projeto')) {
    return 'Posso ajudar a resumir status, riscos e próximos passos do projeto. Se quiser, mencione uma página com @ para contextualizar.'
  }

  if (userMessage.toLowerCase().includes('q&a')) {
    return 'Perfeito. Envie o material e eu organizo respostas em formato claro, destacando pendências e pontos críticos.'
  }

  if (userMessage.toLowerCase().includes('ativo')) {
    return 'Posso sugerir um texto de convite e uma checklist de onboarding para novos ativos.'
  }

  return 'Recebi sua solicitação. Posso estruturar próximos passos, resumir contexto e sugerir ações práticas para você avançar agora.'
}

export function MaryAiChatContent({
  assistantWelcomeMessage,
  icebreakers,
  initialMessage,
  mentionSuggestions,
  disclaimerText,
  storageKey,
  isVisible = true,
  showFirstGreeting = false,
  firstGreetingMessage = 'Prazer, sou a Mary AI. Estarei sempre aqui!',
  onFirstGreetingConsumed,
  className,
}: MaryAiChatContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasHydratedStorageRef = useRef(false)

  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isMentionOpen, setIsMentionOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const buildInitialMessages = () => {
    const initialMessages: ChatMessage[] = []
    if (showFirstGreeting) {
      initialMessages.push({
        id: 'assistant-first-greeting',
        role: 'assistant',
        content: firstGreetingMessage,
      })
    }
    initialMessages.push({
      id: 'assistant-welcome',
      role: 'assistant',
      content: assistantWelcomeMessage,
    })
    return initialMessages
  }

  const [messages, setMessages] = useState<ChatMessage[]>(buildInitialMessages)

  const resolvedMentionSuggestions = useMemo(() => {
    if (mentionSuggestions && mentionSuggestions.length > 0) {
      return mentionSuggestions
    }
    return DEFAULT_MENTION_SUGGESTIONS
  }, [mentionSuggestions])

  useEffect(() => {
    const seededMessage = initialMessage?.trim()
    if (!seededMessage) return
    setMessage(seededMessage)
  }, [initialMessage])

  // useLayoutEffect: aplicar histórico do sessionStorage antes dos useEffects de persistência,
  // evitando um frame onde hasHydratedStorageRef é true mas `messages` ainda é o estado inicial
  // e o persist sobrescreve o storage com [welcome] apenas.
  useLayoutEffect(() => {
    if (!storageKey || typeof window === 'undefined') {
      hasHydratedStorageRef.current = true
      setMessages(buildInitialMessages())
      return
    }

    hasHydratedStorageRef.current = false
    const raw = window.sessionStorage.getItem(storageKey)
    if (!raw) {
      setMessages(buildInitialMessages())
      hasHydratedStorageRef.current = true
      return
    }

    try {
      const parsed = JSON.parse(raw) as ChatMessage[]
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setMessages(buildInitialMessages())
        hasHydratedStorageRef.current = true
        return
      }
      const sanitized = filterTransientMessages(parsed)
      const withGreeting =
        showFirstGreeting && !sanitized.some((messageItem) => messageItem.id === 'assistant-first-greeting')
          ? [{ id: 'assistant-first-greeting', role: 'assistant', content: firstGreetingMessage }, ...sanitized]
          : sanitized
      setMessages(withGreeting)
      hasHydratedStorageRef.current = true
    } catch {
      setMessages(buildInitialMessages())
      hasHydratedStorageRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistantWelcomeMessage, storageKey, showFirstGreeting, firstGreetingMessage])

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return
    if (!hasHydratedStorageRef.current) return
    writeChatHistoryToStorage(storageKey, messages)
  }, [messages, storageKey])

  useEffect(() => {
    if (!showFirstGreeting || !isVisible) return
    onFirstGreetingConsumed?.()
  }, [showFirstGreeting, isVisible, onFirstGreetingConsumed])

  useEffect(() => {
    if (showFirstGreeting) return
    setMessages((currentMessages) => filterTransientMessages(currentMessages))
  }, [showFirstGreeting])

  const handleIcebreakerClick = (text: string) => {
    setMessage(text)
    inputRef.current?.focus()
  }

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    const selected = Array.from(event.target.files)
    setAttachments((prev) => {
      const next = [...prev]
      selected.forEach((file) => {
        const exists = next.some(
          (current) =>
            current.name === file.name &&
            current.size === file.size &&
            current.lastModified === file.lastModified
        )

        if (!exists) next.push(file)
      })
      return next
    })

    event.target.value = ''
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }

  const handleInsertMention = (target: string) => {
    setMessage((prev) => `${prev}${prev.trim().length > 0 ? ' ' : ''}@${target}`)
    setIsMentionOpen(false)
    inputRef.current?.focus()
  }

  const handleSend = () => {
    if (isSending) return

    const cleanMessage = message.trim()
    if (!cleanMessage && attachments.length === 0) return

    const userContent = cleanMessage || 'Enviei anexos para análise.'
    const userAttachments = attachments.map((file) => file.name)
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userContent,
      attachments: userAttachments.length > 0 ? userAttachments : undefined,
    }

    setMessages((prev) => {
      const next = [...prev, userMessage]
      if (hasHydratedStorageRef.current) {
        writeChatHistoryToStorage(storageKey, next)
      }
      return next
    })
    setMessage('')
    setAttachments([])
    setIsSending(true)

    window.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: buildAssistantReply(userContent),
      }
      setMessages((prev) => {
        const next = [...prev, assistantMessage]
        if (hasHydratedStorageRef.current) {
          writeChatHistoryToStorage(storageKey, next)
        }
        return next
      })
      setIsSending(false)
    }, 350)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="border-b border-border p-4">
        <div className="flex flex-wrap gap-2">
          {icebreakers.map((prompt) => (
            <Button key={prompt} type="button" variant="outline" size="sm" onClick={() => handleIcebreakerClick(prompt)}>
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.map((chatMessage) => (
            <div
              key={chatMessage.id}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm',
                chatMessage.role === 'assistant'
                  ? 'border-border bg-muted text-muted-foreground'
                  : 'ml-6 border-primary/40 bg-primary text-primary-foreground'
              )}
            >
              <p>{chatMessage.content}</p>
              {chatMessage.attachments && chatMessage.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {chatMessage.attachments.map((name) => (
                    <Badge key={`${chatMessage.id}-${name}`} variant="secondary" className="max-w-full">
                      <span className="truncate">{name}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-3 border-t border-border p-4">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => {
              const isImage = file.type.startsWith('image/')
              return (
                <Badge key={`${file.name}-${file.size}-${file.lastModified}`} variant="secondary" className="gap-1.5 pr-1">
                  {isImage ? <ImageIcon className="h-3 w-3" aria-hidden="true" /> : <FileText className="h-3 w-3" aria-hidden="true" />}
                  <span className="max-w-[180px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    aria-label={`Remover ${file.name}`}
                    className="rounded-sm p-0.5 hover:bg-accent"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Adicionar anexo"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Anexar arquivos</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES.join(',')}
            className="hidden"
            onChange={handleSelectFiles}
            data-testid="mary-ai-file-input"
          />

          <Popover open={isMentionOpen} onOpenChange={setIsMentionOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="icon" aria-label="Marcar páginas ou documentos">
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Inserir menções com @</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent align="start" className="p-2">
              <div className="space-y-1">
                {resolvedMentionSuggestions.map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => handleInsertMention(target)}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    @{target}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Input
            ref={inputRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            aria-label="Mensagem para Mary AI"
            className="flex-1"
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={handleSend}
                  aria-label="Enviar mensagem"
                  disabled={isSending || (message.trim().length === 0 && attachments.length === 0)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Enviar mensagem</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {disclaimerText && (
          <p className="text-xs text-muted-foreground">
            {disclaimerText}
          </p>
        )}
      </div>
    </div>
  )
}

