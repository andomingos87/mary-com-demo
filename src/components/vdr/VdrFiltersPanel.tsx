'use client'

import { useState } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { 
  VdrDocumentFilters, 
  VdrDocumentPriority,
  VdrDocumentStatus,
  VdrDocumentRisk,
  VdrValidationLevel,
  VdrFolderWithCounts,
} from '@/types/vdr'
import { PRIORITY_LABELS, STATUS_LABELS, RISK_LABELS } from '@/types/vdr'

interface FilterOption<T> {
  value: T
  label: string
}

interface ResponsibleOption {
  id: string
  name: string
}

interface VdrFiltersPanelProps {
  filters: VdrDocumentFilters
  onChange: (filters: VdrDocumentFilters) => void
  folders?: VdrFolderWithCounts[]
  responsibles?: ResponsibleOption[]
  businessUnits?: string[]
  availableTags?: string[]
  className?: string
}

const PRIORITY_OPTIONS: FilterOption<VdrDocumentPriority>[] = [
  { value: 'critical', label: PRIORITY_LABELS.critical },
  { value: 'high', label: PRIORITY_LABELS.high },
  { value: 'medium', label: PRIORITY_LABELS.medium },
  { value: 'low', label: PRIORITY_LABELS.low },
]

const STATUS_OPTIONS: FilterOption<VdrDocumentStatus>[] = [
  { value: 'pending', label: STATUS_LABELS.pending },
  { value: 'in_progress', label: STATUS_LABELS.in_progress },
  { value: 'completed', label: STATUS_LABELS.completed },
  { value: 'stopped', label: STATUS_LABELS.stopped },
  { value: 'na', label: STATUS_LABELS.na },
]

const RISK_OPTIONS: FilterOption<VdrDocumentRisk>[] = [
  { value: 'high', label: RISK_LABELS.high },
  { value: 'medium', label: RISK_LABELS.medium },
  { value: 'low', label: RISK_LABELS.low },
]

const VALIDATION_OPTIONS: FilterOption<VdrValidationLevel>[] = [
  { value: 'n1', label: 'N1 - Asset' },
  { value: 'n2', label: 'N2 - Advisor' },
  { value: 'n3', label: 'N3 - Owner/Admin' },
]

function FilterSection<T extends string>({
  title,
  options,
  selected,
  onChange,
}: {
  title: string
  options: FilterOption<T>[]
  selected: T[]
  onChange: (values: T[]) => void
}) {
  const [isOpen, setIsOpen] = useState(true)

  const handleToggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-gray-50 rounded px-2">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pt-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
              className="h-4 w-4"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function VdrFiltersPanel({
  filters,
  onChange,
  folders = [],
  responsibles = [],
  businessUnits = [],
  availableTags = [],
  className,
}: VdrFiltersPanelProps) {
  // Count active filters
  const activeFilterCount = [
    (filters.folderIds?.length || 0) > 0,
    (filters.priorities?.length || 0) > 0,
    (filters.statuses?.length || 0) > 0,
    (filters.responsibleIds?.length || 0) > 0,
    (filters.businessUnits?.length || 0) > 0,
    (filters.risks?.length || 0) > 0,
    (filters.tags?.length || 0) > 0,
    (filters.validationLevels?.length || 0) > 0,
  ].filter(Boolean).length

  const handleClearAll = () => {
    onChange({})
  }

  const updateFilter = <K extends keyof VdrDocumentFilters>(
    key: K,
    value: VdrDocumentFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value }
    // Remove empty arrays
    if (Array.isArray(value) && value.length === 0) {
      delete newFilters[key]
    }
    onChange(newFilters)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Filter className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-1 h-5 w-5 p-0 justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 max-h-[500px] overflow-y-auto" align="start">
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="font-medium">Filtros</span>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs"
                onClick={handleClearAll}
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Folders */}
          {folders.length > 0 && (
            <FilterSection
              title="Pasta"
              options={folders.map(f => ({ value: f.id, label: f.name }))}
              selected={filters.folderIds || []}
              onChange={(values) => updateFilter('folderIds', values)}
            />
          )}

          {/* Priority */}
          <FilterSection
            title="Prioridade"
            options={PRIORITY_OPTIONS}
            selected={(filters.priorities || []) as VdrDocumentPriority[]}
            onChange={(values) => updateFilter('priorities', values)}
          />

          {/* Status */}
          <FilterSection
            title="Status"
            options={STATUS_OPTIONS}
            selected={(filters.statuses || []) as VdrDocumentStatus[]}
            onChange={(values) => updateFilter('statuses', values)}
          />

          {/* Risk */}
          <FilterSection
            title="Risco"
            options={RISK_OPTIONS}
            selected={(filters.risks || []) as VdrDocumentRisk[]}
            onChange={(values) => updateFilter('risks', values)}
          />

          {/* Validation Level */}
          <FilterSection
            title="Nível de Validação"
            options={VALIDATION_OPTIONS}
            selected={(filters.validationLevels || []) as VdrValidationLevel[]}
            onChange={(values) => updateFilter('validationLevels', values)}
          />

          {/* Responsible */}
          {responsibles.length > 0 && (
            <FilterSection
              title="Responsável"
              options={responsibles.map(r => ({ value: r.id, label: r.name }))}
              selected={filters.responsibleIds || []}
              onChange={(values) => updateFilter('responsibleIds', values)}
            />
          )}

          {/* Business Unit */}
          {businessUnits.length > 0 && (
            <FilterSection
              title="Business Unit"
              options={businessUnits.map(bu => ({ value: bu, label: bu }))}
              selected={filters.businessUnits || []}
              onChange={(values) => updateFilter('businessUnits', values)}
            />
          )}

          {/* Tags */}
          {availableTags.length > 0 && (
            <FilterSection
              title="Tags"
              options={availableTags.map(tag => ({ value: tag, label: tag }))}
              selected={filters.tags || []}
              onChange={(values) => updateFilter('tags', values)}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
