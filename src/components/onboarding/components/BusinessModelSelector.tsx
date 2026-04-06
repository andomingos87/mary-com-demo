'use client'

import { Checkbox, Label } from '@/components/ui'

const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'B2G'] as const
export type BusinessModel = (typeof BUSINESS_MODELS)[number]

interface BusinessModelSelectorProps {
  value: BusinessModel[]
  onChange: (value: BusinessModel[]) => void
}

export function BusinessModelSelector({ value, onChange }: BusinessModelSelectorProps) {
  const toggleModel = (model: BusinessModel) => {
    if (value.includes(model)) {
      onChange(value.filter((item) => item !== model))
      return
    }
    onChange([...value, model])
  }

  return (
    <div className="space-y-3">
      <Label>Modelo de negócio</Label>
      <div className="grid grid-cols-2 gap-3">
        {BUSINESS_MODELS.map((model) => (
          <label
            key={model}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground"
          >
            <Checkbox checked={value.includes(model)} onCheckedChange={() => toggleModel(model)} />
            {model}
          </label>
        ))}
      </div>
    </div>
  )
}

export default BusinessModelSelector
