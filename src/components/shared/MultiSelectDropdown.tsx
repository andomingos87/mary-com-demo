'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ChevronDown, CircleHelp } from 'lucide-react'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectDropdownProps {
  label: string
  options: MultiSelectOption[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
  tooltip?: string
}

export function MultiSelectDropdown({
  label,
  options,
  values,
  onChange,
  placeholder = 'Selecione',
  disabled = false,
  error,
  className,
  tooltip,
}: MultiSelectDropdownProps) {
  const handleToggle = (value: string) => {
    if (disabled) return
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value))
      return
    }
    onChange([...values, value])
  }

  const selectedLabel = values.length === 0
    ? placeholder
    : `${values.length} selecionado(s)`

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="inline-flex items-center gap-1.5">
        <span>{label}</span>
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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {options.map((option) => {
              const checked = values.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-center gap-2 rounded p-2 transition-colors',
                    checked ? 'bg-primary/10 border border-primary/40' : 'hover:bg-muted',
                    disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleToggle(option.value)}
                    disabled={disabled}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {values.map((value) => {
            const option = options.find((item) => item.value === value)
            return (
              <Badge key={value} variant="secondary">
                {option?.label || value}
              </Badge>
            )
          })}
        </div>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
