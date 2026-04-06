'use client'

import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMaryAiToggle } from '@/components/providers/MaryAiProvider'

interface MaryAiEntryFallbackProps {
  className?: string
}

export function MaryAiEntryFallback({ className }: MaryAiEntryFallbackProps) {
  const { isOpen, toggle } = useMaryAiToggle()

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      <Button
        type="button"
        size="sm"
        className="gap-2 rounded-lg shadow-card transition-smooth"
        onClick={toggle}
        aria-label={isOpen ? 'Fechar Mary AI' : 'Abrir Mary AI'}
        aria-expanded={isOpen}
        title={isOpen ? 'Fechar assistente Mary AI' : 'Abrir assistente Mary AI'}
      >
        <Bot className="h-4 w-4" aria-hidden="true" />
        Mary AI
      </Button>
    </div>
  )
}
