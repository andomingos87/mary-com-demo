'use client'

import React, { Fragment } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

// ============================================
// Breadcrumb Component
// ============================================

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center gap-1">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1
          const isMiddle = index > 0 && !isLast
          const hideOnMobile = isMiddle && items.length > 3

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {/* Separator */}
              {index > 0 && (
                <li
                  className={cn('inline-flex items-center', hideOnMobile && 'hidden sm:inline-flex')}
                  aria-hidden="true"
                >
                  <span className="text-muted-foreground">{'>'}</span>
                </li>
              )}

              {/* Crumb */}
              <li
                className={cn(
                  'inline-flex items-center min-w-0',
                  hideOnMobile && 'hidden sm:inline-flex'
                )}
              >
                {isLast ? (
                  <span
                    className="font-semibold text-foreground truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground hover:underline transition-smooth truncate max-w-[200px]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-muted-foreground truncate max-w-[200px]">{crumb.label}</span>
                )}
              </li>

              {/* Mobile ellipsis — after first item when 3+ items */}
              {index === 0 && items.length > 3 && (
                <>
                  <li className="inline-flex items-center sm:hidden text-muted-foreground" aria-hidden="true">{'>'}</li>
                  <li className="inline-flex sm:hidden text-muted-foreground" aria-hidden="true">
                    &hellip;
                  </li>
                </>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
