'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Copy,
  Archive,
  Trash,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { VdrPriorityBadge } from './VdrPriorityBadge'
import { VdrStatusBadge } from './VdrStatusBadge'
import { VdrRiskBadge } from './VdrRiskBadge'
import { VdrValidationCheckboxes } from './VdrValidationCheckboxes'
import { VdrDocumentInfoTooltip } from './VdrDocumentInfoTooltip'
import type { VdrDocumentWithCounts, VdrValidationLevel } from '@/types/vdr'

export type DocumentAction = 
  | 'view'
  | 'edit'
  | 'add_file'
  | 'add_link'
  | 'comment'
  | 'duplicate'
  | 'archive'
  | 'delete'

interface VdrDocumentRowProps {
  document: VdrDocumentWithCounts
  isSelected: boolean
  onSelect: (selected: boolean) => void
  userProfile: 'asset' | 'advisor' | 'investor' | null
  userRole?: 'owner' | 'admin' | 'member' | 'viewer' | null
  onValidate?: (documentId: string, level: VdrValidationLevel, checked: boolean) => Promise<void>
  onAction?: (documentId: string, action: DocumentAction) => void
  className?: string
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function VdrDocumentRow({
  document,
  isSelected,
  onSelect,
  userProfile,
  userRole,
  onValidate,
  onAction,
  className,
}: VdrDocumentRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-gray-100 hover:bg-gray-50 transition-colors',
        isSelected && 'bg-blue-50 hover:bg-blue-100',
        className
      )}
    >
      {/* Checkbox */}
      <td className="px-2 py-2 w-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(!!checked)}
          className="h-4 w-4"
        />
      </td>

      {/* Code + Name + Info Icon */}
      <td className="px-2 py-2 max-w-[300px]">
        <div className="flex items-center gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">
                {document.code || '-'}
              </span>
              <VdrDocumentInfoTooltip description={document.description} />
            </div>
            <span className="text-sm font-medium text-gray-900 truncate" title={document.name}>
              {document.name}
            </span>
          </div>
        </div>
      </td>

      {/* Priority */}
      <td className="px-2 py-2">
        <VdrPriorityBadge priority={document.priority as any} />
      </td>

      {/* Business Unit */}
      <td className="px-2 py-2 text-sm text-gray-600">
        {document.business_unit || '-'}
      </td>

      {/* Status */}
      <td className="px-2 py-2">
        <VdrStatusBadge status={document.status as any} />
      </td>

      {/* Responsible */}
      <td className="px-2 py-2">
        {document.responsible_name ? (
          <div className="text-sm truncate max-w-[120px]" title={document.responsible_name}>
            {document.responsible_name}
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>

      {/* Files/Links */}
      <td className="px-2 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-gray-600">
            <FileText className="h-3 w-3" />
            {document.files_count}
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <LinkIcon className="h-3 w-3" />
            {document.links_count}
          </span>
        </div>
      </td>

      {/* Comments */}
      <td className="px-2 py-2">
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <MessageSquare className="h-3 w-3" />
          {document.comments_count}
        </span>
      </td>

      {/* N1/N2/N3 Validation */}
      <td className="px-2 py-2">
        <VdrValidationCheckboxes
          document={document}
          userProfile={userProfile}
          userRole={userRole}
          onValidate={onValidate}
        />
      </td>

      {/* Tags */}
      <td className="px-2 py-2">
        <div className="flex flex-wrap gap-1 max-w-[100px]">
          {(document.tags as string[] || []).slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs px-1 py-0">
              {tag}
            </Badge>
          ))}
          {((document.tags as string[])?.length || 0) > 2 && (
            <span className="text-xs text-gray-400">
              +{(document.tags as string[]).length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Risk */}
      <td className="px-2 py-2">
        <VdrRiskBadge risk={document.risk as any} />
      </td>

      {/* Flags */}
      <td className="px-2 py-2">
        {(document.flags as string[] || []).length > 0 && (
          <Badge variant="destructive" className="text-xs px-1 py-0">
            {(document.flags as string[]).length}
          </Badge>
        )}
      </td>

      {/* Start Date */}
      <td className="px-2 py-2 text-xs text-gray-600">
        {formatDate(document.start_date)}
      </td>

      {/* Due Date */}
      <td className="px-2 py-2 text-xs text-gray-600">
        {formatDate(document.due_date)}
      </td>

      {/* Updated At */}
      <td className="px-2 py-2 text-xs text-gray-600">
        {formatDate(document.updated_at)}
      </td>

      {/* Actions */}
      <td className="px-2 py-2 w-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onAction?.(document.id, 'view')}>
              <Eye className="h-4 w-4 mr-2" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction?.(document.id, 'edit')}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction?.(document.id, 'add_file')}>
              <FileText className="h-4 w-4 mr-2" />
              Adicionar arquivo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction?.(document.id, 'add_link')}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Adicionar link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction?.(document.id, 'comment')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Comentar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction?.(document.id, 'duplicate')}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction?.(document.id, 'archive')}>
              <Archive className="h-4 w-4 mr-2" />
              Arquivar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onAction?.(document.id, 'delete')}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
