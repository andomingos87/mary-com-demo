'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface VdrLoadingStateProps {
  rowCount?: number
  className?: string
}

export function VdrLoadingState({ rowCount = 8, className }: VdrLoadingStateProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header skeleton */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-t-lg">
        <Skeleton className="h-4 w-4" />
        {[300, 100, 100, 120, 140, 120, 100, 120, 100, 80, 60, 110, 110, 140, 50].map((width, i) => (
          <Skeleton key={i} className="h-4" style={{ width }} />
        ))}
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rowCount }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-3 border-b border-gray-100">
          <Skeleton className="h-4 w-4" />
          {/* Folder row every 4 items */}
          {i % 4 === 0 ? (
            <>
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </>
          ) : (
            <>
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6" />
            </>
          )}
        </div>
      ))}
    </div>
  )
}
