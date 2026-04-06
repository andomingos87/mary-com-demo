'use client'

/**
 * GeographySelector Component
 * TASK-012d - Cascading Geography Selection
 *
 * Hierarchical multi-select for geography: Continents → Countries → States
 * Supports "Global" as mutually exclusive option.
 */

import * as React from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Globe, MapPin } from 'lucide-react'
import type { Geography, GeographyNode, GeographySelection } from '@/types/geography'
import { getGeographyHierarchy } from '@/lib/actions/geographies'

// ============================================
// Types
// ============================================

export interface GeographySelectorProps {
  /** Current selection */
  value: GeographySelection
  /** Callback when selection changes */
  onChange: (selection: GeographySelection) => void
  /** Whether the selector is disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
  /** Countries that should show state-level selection (default: ['BR']) */
  countriesWithStates?: string[]
}

// ============================================
// Constants
// ============================================

const GLOBAL_CODE = 'GLOBAL'
const DEFAULT_COUNTRIES_WITH_STATES = ['BR']

// ============================================
// Component
// ============================================

export function GeographySelector({
  value,
  onChange,
  disabled = false,
  className,
  countriesWithStates = DEFAULT_COUNTRIES_WITH_STATES,
}: GeographySelectorProps) {
  // State for geography data
  const [continents, setContinents] = useState<GeographyNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for expanded continents
  const [expandedContinents, setExpandedContinents] = useState<Set<string>>(new Set())
  // State for expanded countries (to show states)
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set())

  // Load geography data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getGeographyHierarchy()
        if (result.success && result.data) {
          setContinents(result.data.continents)
          // Auto-expand continents that have selected items
          const toExpand = new Set<string>()
          result.data.continents.forEach(continent => {
            if (value.continents.includes(continent.code)) {
              toExpand.add(continent.code)
            }
            continent.children?.forEach(country => {
              if (value.countries.includes(country.code)) {
                toExpand.add(continent.code)
              }
              country.children?.forEach(state => {
                if (value.states.includes(state.code)) {
                  toExpand.add(continent.code)
                  setExpandedCountries(prev => new Set([...Array.from(prev), country.code]))
                }
              })
            })
          })
          setExpandedContinents(toExpand)
        } else {
          setError(result.error || 'Erro ao carregar geografias')
        }
      } catch (err) {
        console.error('Error loading geographies:', err)
        setError('Erro inesperado ao carregar geografias')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only load once on mount

  // Check if Global is selected
  const isGlobalSelected = value.continents.includes(GLOBAL_CODE)

  // Toggle continent expansion
  const toggleContinentExpansion = useCallback((code: string) => {
    setExpandedContinents(prev => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }, [])

  // Toggle country expansion (for states)
  const toggleCountryExpansion = useCallback((code: string) => {
    setExpandedCountries(prev => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }, [])

  // Handle Global selection (mutually exclusive)
  const handleGlobalToggle = useCallback((checked: boolean) => {
    if (checked) {
      // Select only Global, clear everything else
      onChange({ continents: [GLOBAL_CODE], countries: [], states: [] })
    } else {
      // Deselect Global
      onChange({ ...value, continents: value.continents.filter(c => c !== GLOBAL_CODE) })
    }
  }, [onChange, value])

  // Handle continent selection
  const handleContinentToggle = useCallback((code: string, checked: boolean) => {
    if (code === GLOBAL_CODE) {
      handleGlobalToggle(checked)
      return
    }

    let newContinents = [...value.continents]
    let newCountries = [...value.countries]
    let newStates = [...value.states]

    // Remove Global if it was selected
    newContinents = newContinents.filter(c => c !== GLOBAL_CODE)

    if (checked) {
      // Add continent
      if (!newContinents.includes(code)) {
        newContinents.push(code)
      }
      // Find the continent and select all its countries
      const continent = continents.find(c => c.code === code)
      if (continent?.children) {
        continent.children.forEach(country => {
          if (!newCountries.includes(country.code)) {
            newCountries.push(country.code)
          }
          // Also select all states if country has them
          if (country.children) {
            country.children.forEach(state => {
              if (!newStates.includes(state.code)) {
                newStates.push(state.code)
              }
            })
          }
        })
      }
    } else {
      // Remove continent
      newContinents = newContinents.filter(c => c !== code)
      // Find the continent and remove all its countries and states
      const continent = continents.find(c => c.code === code)
      if (continent?.children) {
        const countryCodes = continent.children.map(c => c.code)
        newCountries = newCountries.filter(c => !countryCodes.includes(c))
        // Remove states of those countries
        continent.children.forEach(country => {
          if (country.children) {
            const stateCodes = country.children.map(s => s.code)
            newStates = newStates.filter(s => !stateCodes.includes(s))
          }
        })
      }
    }

    onChange({ continents: newContinents, countries: newCountries, states: newStates })
  }, [value, onChange, continents, handleGlobalToggle])

  // Handle country selection
  const handleCountryToggle = useCallback((
    countryCode: string,
    continentCode: string,
    checked: boolean
  ) => {
    let newContinents = [...value.continents].filter(c => c !== GLOBAL_CODE)
    let newCountries = [...value.countries]
    let newStates = [...value.states]

    const continent = continents.find(c => c.code === continentCode)
    const country = continent?.children?.find(c => c.code === countryCode)

    if (checked) {
      // Add country
      if (!newCountries.includes(countryCode)) {
        newCountries.push(countryCode)
      }
      // Also select all states if country has them
      if (country?.children) {
        country.children.forEach(state => {
          if (!newStates.includes(state.code)) {
            newStates.push(state.code)
          }
        })
      }
      // Check if all countries in continent are now selected
      if (continent?.children) {
        const allCountriesSelected = continent.children.every(c =>
          newCountries.includes(c.code)
        )
        if (allCountriesSelected && !newContinents.includes(continentCode)) {
          newContinents.push(continentCode)
        }
      }
    } else {
      // Remove country
      newCountries = newCountries.filter(c => c !== countryCode)
      // Remove all states of this country
      if (country?.children) {
        const stateCodes = country.children.map(s => s.code)
        newStates = newStates.filter(s => !stateCodes.includes(s))
      }
      // Remove continent from selection
      newContinents = newContinents.filter(c => c !== continentCode)
    }

    onChange({ continents: newContinents, countries: newCountries, states: newStates })
  }, [value, onChange, continents])

  // Handle state selection
  const handleStateToggle = useCallback((
    stateCode: string,
    countryCode: string,
    continentCode: string,
    checked: boolean
  ) => {
    let newContinents = [...value.continents].filter(c => c !== GLOBAL_CODE)
    let newCountries = [...value.countries]
    let newStates = [...value.states]

    const continent = continents.find(c => c.code === continentCode)
    const country = continent?.children?.find(c => c.code === countryCode)

    if (checked) {
      // Add state
      if (!newStates.includes(stateCode)) {
        newStates.push(stateCode)
      }
      // Check if all states in country are now selected
      if (country?.children) {
        const allStatesSelected = country.children.every(s =>
          newStates.includes(s.code)
        )
        if (allStatesSelected && !newCountries.includes(countryCode)) {
          newCountries.push(countryCode)
        }
      }
      // Check if all countries in continent are now selected
      if (continent?.children) {
        const allCountriesSelected = continent.children.every(c =>
          newCountries.includes(c.code)
        )
        if (allCountriesSelected && !newContinents.includes(continentCode)) {
          newContinents.push(continentCode)
        }
      }
    } else {
      // Remove state
      newStates = newStates.filter(s => s !== stateCode)
      // Remove country from full selection
      newCountries = newCountries.filter(c => c !== countryCode)
      // Remove continent from full selection
      newContinents = newContinents.filter(c => c !== continentCode)
    }

    onChange({ continents: newContinents, countries: newCountries, states: newStates })
  }, [value, onChange, continents])

  // Check if continent is partially selected (some but not all children)
  const isContinentPartial = useCallback((continent: GeographyNode): boolean => {
    if (!continent.children || continent.children.length === 0) return false
    const selectedCount = continent.children.filter(c =>
      value.countries.includes(c.code)
    ).length
    return selectedCount > 0 && selectedCount < continent.children.length
  }, [value.countries])

  // Check if country is partially selected (some but not all states)
  const isCountryPartial = useCallback((country: GeographyNode): boolean => {
    if (!country.children || country.children.length === 0) return false
    const selectedCount = country.children.filter(s =>
      value.states.includes(s.code)
    ).length
    return selectedCount > 0 && selectedCount < country.children.length
  }, [value.states])

  // Get selection summary
  const selectionSummary = useMemo(() => {
    if (isGlobalSelected) return 'Global'
    const parts: string[] = []
    if (value.continents.length > 0) {
      parts.push(`${value.continents.length} continente(s)`)
    }
    if (value.countries.length > 0) {
      parts.push(`${value.countries.length} país(es)`)
    }
    if (value.states.length > 0) {
      parts.push(`${value.states.length} estado(s)`)
    }
    return parts.length > 0 ? parts.join(', ') : 'Nenhuma seleção'
  }, [isGlobalSelected, value])

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Spinner size="default" />
        <span className="ml-2 text-muted-foreground">Carregando geografias...</span>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className={cn('p-4 text-center text-destructive', className)}>
        {error}
      </div>
    )
  }

  // Find Global continent
  const globalContinent = continents.find(c => c.code === GLOBAL_CODE)
  const otherContinents = continents.filter(c => c.code !== GLOBAL_CODE)

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selection Summary */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{selectionSummary}</span>
      </div>

      {/* Global Option */}
      {globalContinent && (
        <label
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
            isGlobalSelected
              ? 'bg-primary/10 border-primary'
              : 'hover:bg-muted',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Checkbox
            checked={isGlobalSelected}
            onCheckedChange={(checked) => handleGlobalToggle(checked === true)}
            disabled={disabled}
          />
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <span className="font-medium">Global</span>
            <p className="text-xs text-muted-foreground">
              Atuação em todos os mercados
            </p>
          </div>
        </label>
      )}

      {/* Continents */}
      <div className={cn('space-y-2', isGlobalSelected && 'opacity-50 pointer-events-none')}>
        {otherContinents.map(continent => {
          const isExpanded = expandedContinents.has(continent.code)
          const isSelected = value.continents.includes(continent.code)
          const isPartial = isContinentPartial(continent)
          const hasChildren = continent.children && continent.children.length > 0

          return (
            <Collapsible
              key={continent.code}
              open={isExpanded}
              onOpenChange={() => toggleContinentExpansion(continent.code)}
            >
              <div
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                  isSelected
                    ? 'bg-primary/10 border-primary'
                    : isPartial
                    ? 'bg-primary/5 border-primary/50'
                    : 'hover:bg-muted'
                )}
              >
                {hasChildren && (
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="p-1 hover:bg-muted rounded"
                      disabled={disabled}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                )}
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleContinentToggle(continent.code, checked === true)
                  }
                  disabled={disabled}
                  className={isPartial ? 'data-[state=unchecked]:bg-primary/30' : ''}
                />
                <span className="font-medium flex-1">
                  {continent.namePt || continent.nameEn}
                </span>
                {hasChildren && (
                  <span className="text-xs text-muted-foreground">
                    {continent.children!.length} países
                  </span>
                )}
              </div>

              {/* Countries */}
              <CollapsibleContent>
                <div className="ml-6 mt-1 space-y-1">
                  {continent.children?.map(country => {
                    const isCountrySelected = value.countries.includes(country.code)
                    const countryPartial = isCountryPartial(country)
                    const hasStates = country.children && country.children.length > 0
                    const showStates = countriesWithStates.includes(country.code)
                    const isCountryExpanded = expandedCountries.has(country.code)

                    if (showStates && hasStates) {
                      // Country with states (collapsible)
                      return (
                        <Collapsible
                          key={country.code}
                          open={isCountryExpanded}
                          onOpenChange={() => toggleCountryExpansion(country.code)}
                        >
                          <div
                            className={cn(
                              'flex items-center gap-2 p-2 rounded border transition-colors',
                              isCountrySelected
                                ? 'bg-primary/10 border-primary'
                                : countryPartial
                                ? 'bg-primary/5 border-primary/50'
                                : 'hover:bg-muted'
                            )}
                          >
                            <CollapsibleTrigger asChild>
                              <button
                                type="button"
                                className="p-1 hover:bg-muted rounded"
                                disabled={disabled}
                              >
                                {isCountryExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                            </CollapsibleTrigger>
                            <Checkbox
                              checked={isCountrySelected}
                              onCheckedChange={(checked) =>
                                handleCountryToggle(country.code, continent.code, checked === true)
                              }
                              disabled={disabled}
                              className={countryPartial ? 'data-[state=unchecked]:bg-primary/30' : ''}
                            />
                            {country.flagEmoji && (
                              <span className="text-lg">{country.flagEmoji}</span>
                            )}
                            <span className="text-sm flex-1">
                              {country.namePt || country.nameEn}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {country.children!.length} estados
                            </span>
                          </div>

                          {/* States */}
                          <CollapsibleContent>
                            <div className="ml-6 mt-1 grid grid-cols-2 md:grid-cols-3 gap-1">
                              {country.children?.map(state => {
                                const isStateSelected = value.states.includes(state.code)
                                return (
                                  <label
                                    key={state.code}
                                    className={cn(
                                      'flex items-center gap-2 p-1.5 rounded border cursor-pointer transition-colors text-sm',
                                      isStateSelected
                                        ? 'bg-primary/10 border-primary'
                                        : 'hover:bg-muted'
                                    )}
                                  >
                                    <Checkbox
                                      checked={isStateSelected}
                                      onCheckedChange={(checked) =>
                                        handleStateToggle(
                                          state.code,
                                          country.code,
                                          continent.code,
                                          checked === true
                                        )
                                      }
                                      disabled={disabled}
                                    />
                                    <span className="truncate">
                                      {state.namePt || state.nameEn}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    }

                    // Country without states (simple checkbox)
                    return (
                      <label
                        key={country.code}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors',
                          isCountrySelected
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted'
                        )}
                      >
                        <Checkbox
                          checked={isCountrySelected}
                          onCheckedChange={(checked) =>
                            handleCountryToggle(country.code, continent.code, checked === true)
                          }
                          disabled={disabled}
                        />
                        {country.flagEmoji && (
                          <span className="text-lg">{country.flagEmoji}</span>
                        )}
                        <span className="text-sm">
                          {country.namePt || country.nameEn}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}

export default GeographySelector
