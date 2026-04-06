'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VdrDocumentStatus } from '@/types/vdr'
import { STATUS_COLORS, STATUS_LABELS } from '@/types/vdr'

interface VdrStatusBadgeProps {
  status: VdrDocumentStatus | null | undefined
  className?: string
  size?: 'sm' | 'md'
}

export function VdrStatusBadge({ status, className, size = 'sm' }: VdrStatusBadgeProps) {
  if (!status) {
    return null
  }

  const colors = STATUS_COLORS[status]
  const label = STATUS_LABELS[status]

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
