'use client'

import { useMemo } from 'react'
import { History, PanelLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  buildMaryAiDisclaimer,
  getMaryAiIcebreakers,
  getMaryAiPageBrief,
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
  const pageBrief = useMemo(() => getMaryAiPageBrief(profile, { currentPage, projectCodename }), [profile, currentPage, projectCodename])
  const orgSlugFromPath = currentPage.split('/').filter(Boolean)[0]
  const sessionScope = orgSlugFromPath || organization?.id || organization?.slug || 'global'
  const storageKey = `mary_ai_chat_history:${sessionScope}`

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-border bg-background shadow-elegant">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-2 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Recolher painel Mary AI"
          onClick={() => setOpen(false)}
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
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <p className="sr-only">Assistente Mary AI</p>
      <div className="shrink-0 border-b border-border px-4 py-2">
        <p className="text-xs text-muted-foreground">{`Olá, ${userName}`}</p>
      </div>

      <MaryAiChatContent
        className="min-h-0 flex-1"
        assistantWelcomeMessage="Estou pronta para apoiar com contexto de projeto, documentos e próximos passos."
        icebreakers={icebreakers}
        pageBrief={pageBrief}
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
