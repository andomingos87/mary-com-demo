'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import {
  DEMO_CONTINENTS,
  demoCountryName,
  type DemoContinent,
} from '@/lib/demo/demo-geography-tree'

type DemoGeographyPickerProps = {
  value: string[]
  onChange: (codes: string[]) => void
  disabled?: boolean
}

function continentCodes(continent: DemoContinent): string[] {
  return continent.countries.map((c) => c.id)
}

function selectionState(
  continent: DemoContinent,
  selected: Set<string>
): { all: boolean; some: boolean } {
  const codes = continentCodes(continent)
  const n = codes.filter((c) => selected.has(c)).length
  return { all: n === codes.length && codes.length > 0, some: n > 0 && n < codes.length }
}

export function DemoGeographyPicker({ value, onChange, disabled }: DemoGeographyPickerProps) {
  const selected = useMemo(() => new Set(value), [value])
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const ct of DEMO_CONTINENTS) {
      const { some, all } = selectionState(ct, selected)
      initial[ct.id] = some || all
    }
    return initial
  })

  const setOpen = (id: string, open: boolean) => {
    setOpenMap((prev) => ({ ...prev, [id]: open }))
  }

  const toggleCountry = (countryId: string) => {
    if (disabled) return
    const next = new Set(value)
    if (next.has(countryId)) {
      next.delete(countryId)
    } else {
      next.add(countryId)
    }
    onChange(Array.from(next))
  }

  const toggleContinentAll = (continent: DemoContinent, checked: boolean) => {
    if (disabled) return
    const codes = continentCodes(continent)
    const next = new Set(value)
    if (checked) {
      for (const c of codes) next.add(c)
    } else {
      for (const c of codes) next.delete(c)
    }
    onChange(Array.from(next))
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Abra cada continente. Marque o continente para incluir todos os países listados ou escolha países individuais.
      </p>
      <div className="space-y-2">
        {DEMO_CONTINENTS.map((continent) => {
          const { all, some } = selectionState(continent, selected)
          const isOpen = openMap[continent.id] ?? false
          const continentChecked = all ? true : some ? 'indeterminate' : false

          return (
            <Collapsible
              key={continent.id}
              open={isOpen}
              onOpenChange={(o) => setOpen(continent.id, o)}
              className="rounded-lg border border-border bg-card/50"
            >
              <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-foreground transition-smooth hover:text-primary"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    {continent.name}
                  </button>
                </CollapsibleTrigger>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`continent-${continent.id}`}
                    checked={continentChecked}
                    disabled={disabled}
                    onCheckedChange={(v) => toggleContinentAll(continent, v === true)}
                    aria-label={`Selecionar todos os países de ${continent.name}`}
                  />
                  <Label htmlFor={`continent-${continent.id}`} className="text-xs font-normal text-muted-foreground">
                    Todos os países deste continente
                  </Label>
                </div>
              </div>
              <CollapsibleContent className="border-t border-border px-3 pb-3 pt-1">
                <div className="grid gap-2 sm:grid-cols-2">
                  {continent.countries.map((country) => (
                    <div key={country.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`cty-${country.id}`}
                        checked={selected.has(country.id)}
                        disabled={disabled}
                        onCheckedChange={() => toggleCountry(country.id)}
                      />
                      <Label htmlFor={`cty-${country.id}`} className="text-sm font-normal">
                        {country.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
      {value.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Selecionados:</span>{' '}
          {value.map(demoCountryName).join(', ')}
        </p>
      ) : null}
    </div>
  )
}
