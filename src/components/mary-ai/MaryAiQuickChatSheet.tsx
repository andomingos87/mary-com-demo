'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { History, PanelLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { buildMaryAiDisclaimer, getMaryAiIcebreakers, getMaryAiPageBrief, MaryAiChatContent } from '@/components/mary-ai/MaryAiChatContent'
import { useOrganization } from '@/components/providers/OrganizationProvider'

interface MaryAiQuickChatSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMessage?: string
}

export function MaryAiQuickChatSheet({ open, onOpenChange, initialMessage }: MaryAiQuickChatSheetProps) {
  const { organization } = useOrganization()
  const pathname = usePathname()
  const profileType = organization?.profileType
  const organizationName = organization?.name || 'sua empresa'
  const orgSlugFromPath = pathname.split('/').filter(Boolean)[0]
  const organizationScope = orgSlugFromPath || organization?.id || organization?.slug || 'global'
  const storageKey = `mary_ai_chat_history:${organizationScope}`
  const greetingStorageKey = `mary_ai_first_greeting_seen:${organizationScope}`
  const projectCodename = useMemo(() => {
    const match = pathname.match(/^\/[^/]+\/projects\/([^/?#]+)/)
    return match?.[1] ? decodeURIComponent(match[1]) : undefined
  }, [pathname])
  const [showFirstGreeting, setShowFirstGreeting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setShowFirstGreeting(window.sessionStorage.getItem(greetingStorageKey) !== '1')
  }, [greetingStorageKey])

  const icebreakers = useMemo(
    () => getMaryAiIcebreakers(profileType ?? null, { currentPage: pathname, projectCodename }),
    [profileType, pathname, projectCodename]
  )
  const pageBrief = useMemo(
    () => getMaryAiPageBrief(profileType ?? null, { currentPage: pathname, projectCodename }),
    [profileType, pathname, projectCodename]
  )

  const disclaimerText = useMemo(() => buildMaryAiDisclaimer(organizationName), [organizationName])
  const consumeFirstGreeting = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(greetingStorageKey, '1')
    }
    setShowFirstGreeting(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        hideClose
        className="flex w-full flex-col border-l border-border p-0 shadow-elegant sm:max-w-md"
      >
        <SheetTitle className="sr-only">Assistente Mary AI</SheetTitle>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-2 py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Recolher painel Mary AI"
            onClick={() => onOpenChange(false)}
          >
            <PanelLeft className="h-4 w-4" aria-hidden />
          </Button>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Histórico de conversas (em breve)"
              disabled
            >
              <History className="h-4 w-4 opacity-50" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Fechar Mary AI"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
        <MaryAiChatContent
          className="min-h-0 flex-1"
          assistantWelcomeMessage="Olá! Sou a Mary AI. Posso te ajudar com contexto de projetos, Q&As e próximos passos de execução."
          icebreakers={icebreakers}
          pageBrief={pageBrief}
          initialMessage={initialMessage}
          disclaimerText={disclaimerText}
          storageKey={storageKey}
          isVisible={open}
          showFirstGreeting={showFirstGreeting}
          onFirstGreetingConsumed={consumeFirstGreeting}
        />
      </SheetContent>
    </Sheet>
  )
}
