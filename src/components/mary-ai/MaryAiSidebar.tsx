'use client'

import { useMemo } from 'react'
import { Bot, Sparkles, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  buildMaryAiDisclaimer,
  getMaryAiIcebreakers,
  MaryAiChatContent,
} from '@/components/mary-ai/MaryAiChatContent'
import { useMaryAi, useMaryAiToggle } from '@/components/providers/MaryAiProvider'
import { useOrganization } from '@/components/providers/OrganizationProvider'

export function MaryAiSidebar() {
  const { currentPage, currentProfile, projectCodename, isOpen, showFirstGreeting, consumeFirstGreeting } = useMaryAi()
  const { setOpen } = useMaryAiToggle()
  const { currentUser, organization } = useOrganization()

  const userName = currentUser?.fullName || 'vamos começar'
  const organizationName = organization?.name || 'sua empresa'
  const profileFromOrg = organization?.profileType
  const profile =
    currentProfile === 'investor' || currentProfile === 'asset' || currentProfile === 'advisor'
      ? currentProfile
      : profileFromOrg === 'investor' || profileFromOrg === 'asset' || profileFromOrg === 'advisor'
        ? profileFromOrg
        : null

  const icebreakers = useMemo(
    () => getMaryAiIcebreakers(profile, { currentPage, projectCodename }),
    [profile, currentPage, projectCodename]
  )
  const mentionSuggestions = useMemo(() => {
    const suggestions = ['Projeto Atual', 'Q&A Prioritário', 'Data Room']
    if (projectCodename) suggestions.unshift(projectCodename)
    if (currentPage) suggestions.push(currentPage)
    return Array.from(new Set(suggestions))
  }, [currentPage, projectCodename])

  const disclaimer = buildMaryAiDisclaimer(organizationName)
  const orgSlugFromPath = currentPage.split('/').filter(Boolean)[0]
  const sessionScope = orgSlugFromPath || organization?.id || organization?.slug || 'global'
  const storageKey = `mary_ai_chat_history:${sessionScope}`

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-background">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">Mary AI</h2>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Beta
            </Badge>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Fechar Mary AI"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm text-muted-foreground">{`Olá ${userName}, vamos começar?`}</p>
          <p className="text-sm text-muted-foreground">Como posso te ajudar?</p>
        </div>
      </div>

      <MaryAiChatContent
        assistantWelcomeMessage="Estou pronta para apoiar com contexto de projeto, documentos e próximos passos."
        icebreakers={icebreakers}
        mentionSuggestions={mentionSuggestions}
        disclaimerText={disclaimer}
        storageKey={storageKey}
        isVisible={isOpen}
        showFirstGreeting={showFirstGreeting}
        onFirstGreetingConsumed={consumeFirstGreeting}
      />
    </aside>
  )
}

