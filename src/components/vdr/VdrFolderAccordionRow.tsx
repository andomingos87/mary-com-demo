'use client'

import { ChevronDown, ChevronRight, Folder } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { VdrFolderWithCounts } from '@/types/vdr'

interface VdrFolderAccordionRowProps {
  folder: VdrFolderWithCounts
  isExpanded: boolean
  onToggle: () => void
  isSelected: boolean
  someDocumentsSelected?: boolean
  onSelect: (selected: boolean) => void
  className?: string
  colSpan?: number
}

export function VdrFolderAccordionRow({
  folder,
  isExpanded,
  onToggle,
  isSelected,
  someDocumentsSelected = false,
  onSelect,
  className,
  colSpan = 16,
}: VdrFolderAccordionRowProps) {
  return (
    <tr
      className={cn(
        'bg-gray-100 hover:bg-gray-150 cursor-pointer border-b border-gray-200',
        isSelected && 'bg-blue-50 hover:bg-blue-100',
        className
      )}
      onClick={onToggle}
    >
      <td colSpan={colSpan} className="px-2 py-2">
        <div className="flex items-center gap-2">
          {/* Checkbox */}
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              ref={(el) => {
                if (el && someDocumentsSelected && !isSelected) {
                  el.dataset.state = 'indeterminate'
                }
              }}
              onCheckedChange={(checked) => onSelect(!!checked)}
              className="h-4 w-4"
            />
          </div>

          {/* Expand/Collapse Icon */}
          <button
            type="button"
            className="p-0.5 rounded hover:bg-gray-200 transition-colors"
            aria-label={isExpanded ? 'Recolher pasta' : 'Expandir pasta'}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {/* Folder Icon */}
          <Folder className="h-4 w-4 text-amber-500" />

          {/* Folder Name */}
          <span className="font-medium text-gray-900">
            {folder.name}
          </span>

          {/* Folder Code */}
          {folder.code && (
            <span className="text-xs text-gray-500 font-mono">
              ({folder.code})
            </span>
          )}

          {/* Document Count */}
          <span className="text-sm text-gray-500">
            ({folder.documentCount} {folder.documentCount === 1 ? 'item' : 'itens'})
          </span>
        </div>
      </td>
    </tr>
  )
}
