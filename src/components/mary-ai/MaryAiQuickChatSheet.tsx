'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bot, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { buildMaryAiDisclaimer, getMaryAiIcebreakers, MaryAiChatContent } from '@/components/mary-ai/MaryAiChatContent'
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

  const disclaimerText = useMemo(() => buildMaryAiDisclaimer(organizationName), [organizationName])
  const consumeFirstGreeting = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(greetingStorageKey, '1')
    }
    setShowFirstGreeting(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="p-4 pb-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
            Mary AI
            <Badge variant="secondary" className="ml-1">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Beta
            </Badge>
          </SheetTitle>
          <SheetDescription>Com o que posso te ajudar</SheetDescription>
        </SheetHeader>
        <MaryAiChatContent
          assistantWelcomeMessage="Olá! Sou a Mary AI. Posso te ajudar com contexto de projetos, Q&As e próximos passos de execução."
          icebreakers={icebreakers}
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

