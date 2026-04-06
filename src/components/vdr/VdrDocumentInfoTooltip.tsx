'use client'

import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface VdrDocumentInfoTooltipProps {
  description: string | null | undefined
  className?: string
}

export function VdrDocumentInfoTooltip({ description, className }: VdrDocumentInfoTooltipProps) {
  if (!description) {
    return null
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center',
            'text-gray-400 hover:text-gray-600 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded',
            className
          )}
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">Ver descrição</span>
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="right" 
        className="max-w-xs text-sm"
        sideOffset={5}
      >
        <p className="whitespace-pre-wrap">{description}</p>
      </TooltipContent>
    </Tooltip>
  )
}
