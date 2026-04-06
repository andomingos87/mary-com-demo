'use client'

/**
 * TaxonomySelector Component
 * Phase 4.4 - UI Components
 *
 * Hierarchical selector for MAICS taxonomy (L1 -> L2 -> L3).
 * Supports search and cascading selection.
 */

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ChevronRight, Loader2 } from 'lucide-react'
import type { TaxonomySelection, TaxonomyNode } from '@/types/projects'
import { getL1Sectors, getTaxonomyChildren, searchTaxonomy } from '@/lib/actions/taxonomy'

export interface TaxonomySelectorProps {
  /** Current selection */
  value?: TaxonomySelection
  /** Callback when selection changes */
  onChange: (value: TaxonomySelection) => void
  /** Whether the selector is disabled */
  disabled?: boolean
  /** Show search input */
  showSearch?: boolean
  /** Additional CSS classes */
  className?: string
}

export function TaxonomySelector({
  value,
  onChange,
  disabled = false,
  showSearch = true,
  className,
}: TaxonomySelectorProps) {
  // State for taxonomy data
  const [l1Sectors, setL1Sectors] = useState<TaxonomyNode[]>([])
  const [l2Sectors, setL2Sectors] = useState<TaxonomyNode[]>([])
  const [l3Sectors, setL3Sectors] = useState<TaxonomyNode[]>([])

  // Loading states
  const [loadingL1, setLoadingL1] = useState(true)
  const [loadingL2, setLoadingL2] = useState(false)
  const [loadingL3, setLoadingL3] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TaxonomyNode[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Load L1 sectors on mount
  useEffect(() => {
    async function loadL1() {
      setLoadingL1(true)
      const result = await getL1Sectors()
      if (result.success && result.data) {
        setL1Sectors(result.data)
      }
      setLoadingL1(false)
    }
    loadL1()
  }, [])

  // Load L2 when L1 changes
  useEffect(() => {
    async function loadL2() {
      if (!value?.l1) {
        setL2Sectors([])
        return
      }
      setLoadingL2(true)
      const result = await getTaxonomyChildren(value.l1)
      if (result.success && result.data) {
        setL2Sectors(result.data)
      }
      setLoadingL2(false)
    }
    loadL2()
  }, [value?.l1])

  // Load L3 when L2 changes
  useEffect(() => {
    async function loadL3() {
      if (!value?.l2) {
        setL3Sectors([])
        return
      }
      setLoadingL3(true)
      const result = await getTaxonomyChildren(value.l2)
      if (result.success && result.data) {
        setL3Sectors(result.data)
      }
      setLoadingL3(false)
    }
    loadL3()
  }, [value?.l2])

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const result = await searchTaxonomy(searchQuery)
      if (result.success && result.data) {
        setSearchResults(result.data)
      }
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle L1 selection
  const handleL1Change = useCallback((code: string) => {
    onChange({ l1: code, l2: undefined, l3: undefined })
  }, [onChange])

  // Handle L2 selection
  const handleL2Change = useCallback((code: string) => {
    onChange({ ...value, l2: code, l3: undefined })
  }, [onChange, value])

  // Handle L3 selection
  const handleL3Change = useCallback((code: string) => {
    onChange({ ...value, l3: code })
  }, [onChange, value])

  // Handle search result selection
  const handleSearchSelect = useCallback((node: TaxonomyNode) => {
    if (node.level === 1) {
      onChange({ l1: node.code, l2: undefined, l3: undefined })
    } else if (node.level === 2 && node.parentCode) {
      onChange({ l1: node.parentCode, l2: node.code, l3: undefined })
    } else if (node.level === 3 && node.parentCode) {
      // Need to find L1 from L2's parent
      const l2Node = l2Sectors.find(s => s.code === node.parentCode)
      if (l2Node?.parentCode) {
        onChange({ l1: l2Node.parentCode, l2: node.parentCode, l3: node.code })
      }
    }
    setSearchQuery('')
    setSearchResults([])
  }, [onChange, l2Sectors])

  // Get current labels for display
  const selectedL1 = l1Sectors.find(s => s.code === value?.l1)
  const selectedL2 = l2Sectors.find(s => s.code === value?.l2)
  const selectedL3 = l3Sectors.find(s => s.code === value?.l3)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar setor por nome ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
              <ul className="max-h-60 overflow-auto p-1">
                {searchResults.map((node) => (
                  <li key={node.code}>
                    <button
                      type="button"
                      onClick={() => handleSearchSelect(node)}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <span className="text-xs text-muted-foreground">
                        L{node.level}
                      </span>
                      <span>{node.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Selection Path Display */}
      {(selectedL1 || selectedL2 || selectedL3) && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {selectedL1 && <span>{selectedL1.label}</span>}
          {selectedL2 && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span>{selectedL2.label}</span>
            </>
          )}
          {selectedL3 && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span>{selectedL3.label}</span>
            </>
          )}
        </div>
      )}

      {/* Hierarchical Selectors */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* L1 - Macrosetor */}
        <div className="space-y-2">
          <Label htmlFor="sector-l1">Setor (L1)</Label>
          <Select
            value={value?.l1 || ''}
            onValueChange={handleL1Change}
            disabled={disabled || loadingL1}
          >
            <SelectTrigger id="sector-l1">
              <SelectValue placeholder={loadingL1 ? 'Carregando...' : 'Selecione'} />
            </SelectTrigger>
            <SelectContent>
              {l1Sectors.map((sector) => (
                <SelectItem
                  key={sector.code}
                  value={sector.code}
                  className="cursor-pointer transition-colors hover:bg-primary/10"
                >
                  {sector.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* L2 - Subsetor */}
        <div className="space-y-2">
          <Label htmlFor="sector-l2">Subsetor (L2)</Label>
          <Select
            value={value?.l2 || ''}
            onValueChange={handleL2Change}
            disabled={disabled || !value?.l1 || loadingL2}
          >
            <SelectTrigger id="sector-l2">
              <SelectValue
                placeholder={
                  loadingL2 ? 'Carregando...' : !value?.l1 ? 'Selecione L1 primeiro' : 'Selecione'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {l2Sectors.map((sector) => (
                <SelectItem
                  key={sector.code}
                  value={sector.code}
                  className="cursor-pointer transition-colors hover:bg-primary/10"
                >
                  {sector.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* L3 - Segmento */}
        <div className="space-y-2">
          <Label htmlFor="sector-l3">Segmento (L3)</Label>
          <Select
            value={value?.l3 || ''}
            onValueChange={handleL3Change}
            disabled={disabled || !value?.l2 || loadingL3 || l3Sectors.length === 0}
          >
            <SelectTrigger id="sector-l3">
              <SelectValue
                placeholder={
                  loadingL3
                    ? 'Carregando...'
                    : !value?.l2
                    ? 'Selecione L2 primeiro'
                    : l3Sectors.length === 0
                    ? 'Sem segmentos'
                    : 'Selecione (opcional)'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {l3Sectors.map((sector) => (
                <SelectItem
                  key={sector.code}
                  value={sector.code}
                  className="cursor-pointer transition-colors hover:bg-primary/10"
                >
                  {sector.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default TaxonomySelector
