'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { handleCurrencyChangeUSD, USD_CURRENCY_INPUT_REGEX } from '@/lib/format/currency'
import { CircleHelp } from 'lucide-react'

interface UsdCurrencyInputProps {
  id: string
  label: string
  value: string
  onValueChange: (displayValue: string, numericValue: number | undefined) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  tooltip?: string
}

export function UsdCurrencyInput({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  tooltip,
}: UsdCurrencyInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="inline-flex items-center gap-1.5">
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
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          USD
        </span>
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          className="pl-12"
          value={value}
          disabled={disabled}
          onChange={(event) => {
            if (!USD_CURRENCY_INPUT_REGEX.test(event.target.value)) {
              return
            }
            let numericValue: number | undefined
            const displayValue = handleCurrencyChangeUSD(event.target.value, (parsed) => {
              numericValue = parsed
            })
            onValueChange(displayValue, numericValue)
          }}
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
