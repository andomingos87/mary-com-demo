'use client'

import * as React from 'react'
import { Input } from '@/components/ui'

interface PercentInputProps {
  value?: number
  onChange: (value: number | undefined) => void
  placeholder?: string
  min?: number
  max?: number
}

export function PercentInput({ value, onChange, placeholder, min = 0, max = 100 }: PercentInputProps) {
  const [textValue, setTextValue] = React.useState(value?.toString() ?? '')

  React.useEffect(() => {
    setTextValue(value?.toString() ?? '')
  }, [value])

  const handleChange = (nextText: string) => {
    const normalized = nextText.replace(',', '.').replace(/[^\d.]/g, '')
    setTextValue(normalized)

    if (!normalized) {
      onChange(undefined)
      return
    }

    const parsed = Number(normalized)
    if (Number.isNaN(parsed)) return
    onChange(Math.min(max, Math.max(min, parsed)))
  }

  return (
    <div className="relative">
      <Input
        inputMode="decimal"
        value={textValue}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder || '0'}
        className="pr-8"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        %
      </span>
    </div>
  )
}

export default PercentInput
