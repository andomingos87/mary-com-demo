'use client'

import { Inbox, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VdrEmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function VdrEmptyState({
  title = 'Nenhum documento',
  description = 'Adicione documentos ao VDR para começar.',
  actionLabel,
  onAction,
  className,
}: VdrEmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4',
      'bg-gray-50 rounded-lg border border-dashed border-gray-300',
      className
    )}>
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        <Inbox className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
