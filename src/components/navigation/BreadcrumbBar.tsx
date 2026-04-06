'use client'

import { useBreadcrumbLoading, useBreadcrumbs } from '@/components/providers/NavigationProvider'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { BreadcrumbSkeleton } from '@/components/navigation/BreadcrumbSkeleton'

export function BreadcrumbBar() {
  const breadcrumbs = useBreadcrumbs()
  const isLoading = useBreadcrumbLoading()

  if (isLoading) {
    return <BreadcrumbSkeleton />
  }

  return <Breadcrumb items={breadcrumbs} />
}
