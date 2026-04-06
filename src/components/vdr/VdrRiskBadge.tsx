'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VdrDocumentRisk } from '@/types/vdr'
import { RISK_COLORS, RISK_LABELS } from '@/types/vdr'

interface VdrRiskBadgeProps {
  risk: VdrDocumentRisk | null | undefined
  className?: string
  size?: 'sm' | 'md'
}

export function VdrRiskBadge({ risk, className, size = 'sm' }: VdrRiskBadgeProps) {
  if (!risk) {
    return null
  }

  const colors = RISK_COLORS[risk]
  const label = RISK_LABELS[risk]

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
