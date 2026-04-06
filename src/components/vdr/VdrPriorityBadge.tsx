'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VdrDocumentPriority } from '@/types/vdr'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/types/vdr'

interface VdrPriorityBadgeProps {
  priority: VdrDocumentPriority | null | undefined
  className?: string
  size?: 'sm' | 'md'
}

export function VdrPriorityBadge({ priority, className, size = 'sm' }: VdrPriorityBadgeProps) {
  if (!priority) {
    return null
  }

  const colors = PRIORITY_COLORS[priority]
  const label = PRIORITY_LABELS[priority]

  return (
    <Badge
      variant="outline"
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-0.5',
        'font-medium',
        className
      )}
    >
      {label}
    </Badge>
  )
}
