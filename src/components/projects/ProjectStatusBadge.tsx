'use client'

/**
 * ProjectStatusBadge Component
 * Phase 4.4 - UI Components
 *
 * Displays the current status of a project with appropriate colors.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types/database'
import { PROJECT_STATUS_LABELS } from '@/types/database'
import { PROJECT_STATUS_COLORS } from '@/types/projects'

export interface ProjectStatusBadgeProps {
  /** Current project status */
  status: ProjectStatus
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
} as const

export function ProjectStatusBadge({
  status,
  size = 'md',
  className,
}: ProjectStatusBadgeProps) {
  const colors = PROJECT_STATUS_COLORS[status]
  const label = PROJECT_STATUS_LABELS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colors.bg,
        colors.text,
        SIZE_CLASSES[size],
        className
      )}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  )
}

export default ProjectStatusBadge
