'use client'

import { useState } from 'react'
import { X, AlertCircle, Tag, User, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { 
  VdrDocumentPriority, 
  VdrDocumentStatus,
  VdrBulkUpdateInput,
} from '@/types/vdr'
import { PRIORITY_LABELS, STATUS_LABELS } from '@/types/vdr'

interface ResponsibleOption {
  id: string
  name: string
}

interface VdrBulkActionsBarProps {
  selectedCount: number
  selectedIds: string[]
  onClearSelection: () => void
  onBulkUpdate: (input: VdrBulkUpdateInput) => Promise<void>
  responsibles?: ResponsibleOption[]
  className?: string
}

export function VdrBulkActionsBar({
  selectedCount,
  selectedIds,
  onClearSelection,
  onBulkUpdate,
  responsibles = [],
  className,
}: VdrBulkActionsBarProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [newTag, setNewTag] = useState('')

  if (selectedCount === 0) {
    return null
  }

  const handleStatusChange = async (status: VdrDocumentStatus) => {
    setIsUpdating(true)
    try {
      await onBulkUpdate({
        documentIds: selectedIds,
        updates: { status },
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePriorityChange = async (priority: VdrDocumentPriority) => {
    setIsUpdating(true)
    try {
      await onBulkUpdate({
        documentIds: selectedIds,
        updates: { priority },
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleResponsibleChange = async (responsibleId: string) => {
    setIsUpdating(true)
    try {
      await onBulkUpdate({
        documentIds: selectedIds,
        updates: { responsibleId: responsibleId === 'none' ? null : responsibleId },
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return
    setIsUpdating(true)
    try {
      await onBulkUpdate({
        documentIds: selectedIds,
        updates: { tagsToAdd: [newTag.trim()] },
      })
      setNewTag('')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className={cn(
      'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
      'bg-white border border-gray-200 shadow-lg rounded-lg',
      'px-4 py-3 flex items-center gap-4',
      className
    )}>
      {/* Selection count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-2 py-1">
          {selectedCount}
        </Badge>
        <span className="text-sm text-gray-600">
          {selectedCount === 1 ? 'selecionado' : 'selecionados'}
        </span>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* Status */}
      <Select onValueChange={handleStatusChange} disabled={isUpdating}>
        <SelectTrigger className="w-[140px] h-8">
          <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority */}
      <Select onValueChange={handlePriorityChange} disabled={isUpdating}>
        <SelectTrigger className="w-[140px] h-8">
          <AlertCircle className="h-4 w-4 mr-2 text-gray-400" />
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Responsible */}
      {responsibles.length > 0 && (
        <Select onValueChange={handleResponsibleChange} disabled={isUpdating}>
          <SelectTrigger className="w-[150px] h-8">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem responsável</SelectItem>
            {responsibles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Add Tag */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2" disabled={isUpdating}>
            <Tag className="h-4 w-4" />
            Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60" align="center">
          <div className="space-y-2">
            <label className="text-sm font-medium">Adicionar tag</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nome da tag"
                className="h-8"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button size="sm" className="h-8" onClick={handleAddTag} disabled={!newTag.trim()}>
                +
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-gray-200" />

      {/* Clear selection */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8"
        onClick={onClearSelection}
        disabled={isUpdating}
      >
        <X className="h-4 w-4 mr-1" />
        Limpar
      </Button>
    </div>
  )
}
