'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <Skeleton className="h-4 w-16" />
      <span className="text-muted-foreground">{'>'}</span>
      <Skeleton className="h-4 w-20" />
      <span className="text-muted-foreground">{'>'}</span>
      <Skeleton className="h-4 w-24" />
    </div>
  )
}
