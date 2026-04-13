'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type DemoTagsFieldProps = {
  value: string[]
  onChange: (next: string[]) => void
  /** Lista sugerida; ainda é possível incluir valores livres pelo campo abaixo. */
  tagOptions?: string[]
  disabled?: boolean
}

export function DemoTagsField({ value, onChange, tagOptions, disabled }: DemoTagsFieldProps) {
  const [custom, setCustom] = useState('')

  const remove = (item: string) => {
    onChange(value.filter((x) => x !== item))
  }

  const addFromPool = (item: string) => {
    if (!value.includes(item)) onChange([...value, item])
  }

  const addCustom = () => {
    const t = custom.trim()
    if (!t || value.includes(t)) return
    onChange([...value, t])
    setCustom('')
  }

  const pool = tagOptions?.filter((t) => !value.includes(t)) ?? []

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((item) => (
          <Badge key={item} variant="secondary" className="gap-1 rounded-full py-1 pl-3 pr-1">
            <span>{item}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground"
              onClick={() => remove(item)}
              disabled={disabled}
              aria-label={`Remover ${item}`}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </Badge>
        ))}
      </div>

      {pool.length > 0 ? (
        <Select onValueChange={addFromPool} disabled={disabled}>
          <SelectTrigger className="max-w-md rounded-lg">
            <SelectValue placeholder="Adicionar das sugestões..." />
          </SelectTrigger>
          <SelectContent>
            {pool.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
          disabled={disabled}
          placeholder={tagOptions?.length ? 'Outro valor (opcional)' : 'Digite e inclua'}
          className="max-w-md rounded-lg"
        />
        <Button type="button" variant="outline" className="rounded-lg" onClick={addCustom} disabled={disabled}>
          Incluir
        </Button>
      </div>
    </div>
  )
}
