/**
 * Árvore fixa só para a demo (/demo/**). Não usa Supabase nem GeographySelector de produção.
 */

export interface DemoCountry {
  id: string
  name: string
}

export interface DemoContinent {
  id: string
  name: string
  countries: DemoCountry[]
}

export const DEMO_CONTINENTS: DemoContinent[] = [
  {
    id: 'na',
    name: 'América do Norte',
    countries: [
      { id: 'MX', name: 'México' },
      { id: 'US', name: 'Estados Unidos' },
      { id: 'CA', name: 'Canadá' },
    ],
  },
  {
    id: 'sa',
    name: 'América do Sul',
    countries: [
      { id: 'BR', name: 'Brasil' },
      { id: 'CL', name: 'Chile' },
      { id: 'AR', name: 'Argentina' },
      { id: 'CO', name: 'Colômbia' },
    ],
  },
  {
    id: 'eu',
    name: 'Europa',
    countries: [
      { id: 'PT', name: 'Portugal' },
      { id: 'ES', name: 'Espanha' },
      { id: 'GB', name: 'Reino Unido' },
    ],
  },
]

const countryNameById = new Map<string, string>()
for (const c of DEMO_CONTINENTS) {
  for (const co of c.countries) {
    countryNameById.set(co.id, co.name)
  }
}

export function demoCountryName(id: string): string {
  return countryNameById.get(id) ?? id
}

export function demoContinentForCountry(countryId: string): DemoContinent | undefined {
  return DEMO_CONTINENTS.find((ct) => ct.countries.some((co) => co.id === countryId))
}
