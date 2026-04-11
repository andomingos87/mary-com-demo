'use client'

import { MessageCircleMore } from 'lucide-react'
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
        size="icon"
        variant="default"
        className="h-14 w-14 rounded-full border border-red-600/20 bg-red-600 text-white shadow-[0_18px_40px_rgba(220,38,38,0.28)] transition-smooth hover:bg-red-700 hover:text-white"
        onClick={toggle}
        aria-label={isOpen ? 'Fechar Mary AI' : 'Abrir Mary AI'}
        aria-expanded={isOpen}
        title={isOpen ? 'Fechar assistente Mary AI' : 'Abrir assistente Mary AI'}
      >
        <MessageCircleMore className={cn('h-6 w-6 transition-transform', isOpen && 'scale-90')} aria-hidden />
        <span className="sr-only">Mary AI</span>
      </Button>
    </div>
  )
}
