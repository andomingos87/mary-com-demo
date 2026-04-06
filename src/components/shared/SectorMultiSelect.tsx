'use client'

import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { getSectorsForSelect } from '@/lib/constants/sectors'
import { CircleHelp } from 'lucide-react'

interface SectorMultiSelectProps {
  selectedValues: string[]
  onChange: (values: string[]) => void
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
  error?: string
  tooltip?: string
}

const SECTOR_OPTIONS = getSectorsForSelect()

export function SectorMultiSelect({
  selectedValues,
  onChange,
  label = 'Setores de Interesse',
  required = false,
  disabled = false,
  className,
  error,
  tooltip,
}: SectorMultiSelectProps) {
  const toggleSector = React.useCallback(
    (sectorValue: string) => {
      if (disabled) return
      if (selectedValues.includes(sectorValue)) {
        onChange(selectedValues.filter((value) => value !== sectorValue))
        return
      }
      onChange([...selectedValues, sectorValue])
    },
    [disabled, onChange, selectedValues]
  )

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="inline-flex items-center gap-1.5">
        <span>
          {label}
          {required ? ' *' : ''}
        </span>
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground transition-smooth hover:text-foreground"
                  aria-label={`Ajuda: ${label}`}
                >
                  <CircleHelp className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {SECTOR_OPTIONS.map((sector) => {
          const checked = selectedValues.includes(sector.value)
          return (
            <label
              key={sector.value}
              className={cn(
                'flex items-center gap-2 p-2 rounded border transition-colors',
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                checked ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggleSector(sector.value)}
                disabled={disabled}
              />
              <span className="text-sm">{sector.label}</span>
            </label>
          )
        })}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
