'use client'

import { Input, Label } from '@/components/ui'

export interface HeadquartersValue {
  city: string
  state: string
  country: string
}

interface HeadquartersSelectorProps {
  value: HeadquartersValue
  onChange: (value: HeadquartersValue) => void
}

export function HeadquartersSelector({ value, onChange }: HeadquartersSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Cidade</Label>
        <Input
          value={value.city}
          onChange={(event) => onChange({ ...value, city: event.target.value })}
          placeholder="São Paulo"
        />
      </div>
      <div className="space-y-2">
        <Label>Estado</Label>
        <Input
          value={value.state}
          onChange={(event) => onChange({ ...value, state: event.target.value })}
          placeholder="SP"
        />
      </div>
      <div className="space-y-2">
        <Label>País</Label>
        <Input
          value={value.country}
          onChange={(event) => onChange({ ...value, country: event.target.value })}
          placeholder="Brasil"
        />
      </div>
    </div>
  )
}

export default HeadquartersSelector
