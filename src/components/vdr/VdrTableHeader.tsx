'use client'

import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { VdrDocumentSort, VdrSortColumn } from '@/types/vdr'
import { VDR_COLUMNS } from '@/types/vdr'

interface VdrTableHeaderProps {
  sort?: VdrDocumentSort
  onSortChange?: (sort: VdrDocumentSort | undefined) => void
  allSelected?: boolean
  someSelected?: boolean
  onSelectAll?: (selected: boolean) => void
  visibleColumns?: string[]
  className?: string
}

export function VdrTableHeader({
  sort,
  onSortChange,
  allSelected = false,
  someSelected = false,
  onSelectAll,
  visibleColumns,
  className,
}: VdrTableHeaderProps) {
  const columns = visibleColumns
    ? VDR_COLUMNS.filter(col => visibleColumns.includes(col.id))
    : VDR_COLUMNS.filter(col => col.visible)

  const handleSortClick = (column: VdrSortColumn) => {
    if (!onSortChange) return

    if (sort?.column === column) {
      // Cycle: asc -> desc -> none
      if (sort.direction === 'asc') {
        onSortChange({ column, direction: 'desc' })
      } else {
        onSortChange(undefined)
      }
    } else {
      onSortChange({ column, direction: 'asc' })
    }
  }

  const getSortIcon = (columnId: string) => {
    if (sort?.column !== columnId) {
      return <ChevronsUpDown className="h-3 w-3 text-gray-400" />
    }
    return sort.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3 text-blue-600" />
      : <ChevronDown className="h-3 w-3 text-blue-600" />
  }

  return (
    <thead className={cn('bg-gray-50 sticky top-0 z-10', className)}>
      <tr className="border-b border-gray-200">
        {columns.map((column) => {
          // Checkbox column
          if (column.id === 'checkbox') {
            return (
              <th
                key={column.id}
                className="w-10 px-2 py-3 text-left"
                style={{ width: column.width }}
              >
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el && someSelected && !allSelected) {
                      el.dataset.state = 'indeterminate'
                    }
                  }}
                  onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                  className="h-4 w-4"
                />
              </th>
            )
          }

          // Actions column (no header)
          if (column.id === 'actions') {
            return (
              <th
                key={column.id}
                className="w-12 px-2 py-3"
                style={{ width: column.width }}
              />
            )
          }

          // Regular columns
          const isSortable = column.sortable
          const sortColumn = column.id as VdrSortColumn

          return (
            <th
              key={column.id}
              className={cn(
                'px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
                isSortable && 'cursor-pointer hover:bg-gray-100 select-none'
              )}
              style={{ width: column.width, minWidth: column.width }}
              onClick={isSortable ? () => handleSortClick(sortColumn) : undefined}
            >
              <div className="flex items-center gap-1">
                <span className="truncate">{column.label}</span>
                {isSortable && getSortIcon(column.id)}
              </div>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
