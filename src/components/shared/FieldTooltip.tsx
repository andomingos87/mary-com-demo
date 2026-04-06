'use client'

import * as React from 'react'
import { CircleHelp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface FieldTooltipProps {
  text: string
  label: string
  className?: string
  contentClassName?: string
}

export function FieldTooltip({ text, label, className, contentClassName }: FieldTooltipProps) {
  if (!text) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex h-4 w-4 items-center justify-center text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
              className
            )}
            aria-label={`Ajuda do campo ${label}`}
          >
            <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          className={cn('max-w-xs text-xs leading-relaxed', contentClassName)}
          role="tooltip"
          aria-live="polite"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default FieldTooltip
