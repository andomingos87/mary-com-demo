'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Folder,
  Wallet,
  Scale,
  Cog,
  Briefcase,
  Users,
  FolderOpen,
  FileText,
  BarChart3,
  Shield,
  Building,
  MoreVertical,
  Pencil,
  Trash2,
  GripVertical,
  Link as LinkIcon,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { VdrFolderWithCounts } from '@/types/vdr'
import { CreateFolderDialog } from './CreateFolderDialog'
import { EditFolderDialog, DeleteFolderDialog } from './EditFolderDialog'
import { ShareVdrDialog } from './ShareVdrDialog'
import { reorderFolders } from '@/lib/actions/vdr'

interface VdrFolderListProps {
  folders: VdrFolderWithCounts[]
  selectedSlug?: string
  baseUrl: string
  canManage?: boolean
  projectId?: string
}

const iconMap: Record<string, React.ElementType> = {
  wallet: Wallet,
  scale: Scale,
  cog: Cog,
  briefcase: Briefcase,
  users: Users,
  folder: Folder,
  'file-text': FileText,
  chart: BarChart3,
  shield: Shield,
  building: Building,
}

// =====================================================
// SORTABLE FOLDER ITEM
// =====================================================

interface SortableFolderItemProps {
  folder: VdrFolderWithCounts
  isSelected: boolean
  baseUrl: string
  canManage: boolean
  onEdit: (folder: VdrFolderWithCounts) => void
  onDelete: (folder: VdrFolderWithCounts) => void
  onShare: (folder: VdrFolderWithCounts) => void
}

function SortableFolderItem({
  folder,
  isSelected,
  baseUrl,
  canManage,
  onEdit,
  onDelete,
  onShare,
}: SortableFolderItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = iconMap[folder.icon || 'folder'] || Folder
  const isDefault = folder.is_default

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 px-2 py-3 text-sm transition-colors border-b',
        isSelected
          ? 'bg-primary/10 text-primary font-medium'
          : 'hover:bg-muted/50 text-muted-foreground',
        isDragging && 'opacity-50 bg-muted'
      )}
    >
      {/* Drag Handle (managers only) */}
      {canManage && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      <Link
        href={`${baseUrl}?folder=${folder.slug}`}
        className={cn(
          'flex items-center gap-3 flex-1 min-w-0',
          !canManage && 'pl-2'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{folder.name}</span>
        <span className="text-xs shrink-0">
          {folder.documentCount || 0}
        </span>
      </Link>

      {/* Context Menu (managers only) */}
      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu da pasta</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(folder)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(folder)}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Compartilhar
            </DropdownMenuItem>
            {!isDefault && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(folder)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function VdrFolderList({ folders, selectedSlug, baseUrl, canManage, projectId }: VdrFolderListProps) {
  const router = useRouter()
  const existingSlugs = folders.map(f => f.slug)
  const [editFolder, setEditFolder] = useState<VdrFolderWithCounts | null>(null)
  const [deleteFolderState, setDeleteFolderState] = useState<VdrFolderWithCounts | null>(null)
  const [shareFolder, setShareFolder] = useState<VdrFolderWithCounts | null>(null)
  const [localFolders, setLocalFolders] = useState(folders)

  // Update local folders when prop changes
  if (folders !== localFolders && folders.length !== localFolders.length) {
    setLocalFolders(folders)
  }

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id || !projectId) return

    const oldIndex = localFolders.findIndex(f => f.id === active.id)
    const newIndex = localFolders.findIndex(f => f.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Optimistic update
    const newFolders = arrayMove(localFolders, oldIndex, newIndex)
    setLocalFolders(newFolders)

    // Prepare order updates
    const folderOrders = newFolders.map((folder, index) => ({
      id: folder.id,
      sortOrder: index + 1,
    }))

    // Save to database
    const result = await reorderFolders(projectId, folderOrders)

    if (result.success) {
      router.refresh()
    } else {
      // Revert on error
      setLocalFolders(folders)
      console.error('Error reordering folders:', result.error)
    }
  }

  return (
    <>
      <nav className="flex flex-col">
        {/* All Documents */}
        <Link
          href={baseUrl}
          className={cn(
            'flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b',
            !selectedSlug
              ? 'bg-primary/10 text-primary font-medium'
              : 'hover:bg-muted/50 text-muted-foreground'
          )}
        >
          <FolderOpen className="h-4 w-4" />
          <span className="flex-1">Todos</span>
          <span className="text-xs text-muted-foreground">
            {folders.reduce((acc, f) => acc + (f.documentCount || 0), 0)}
          </span>
        </Link>

        {/* Sortable Folders */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localFolders.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {localFolders.map((folder) => (
              <SortableFolderItem
                key={folder.id}
                folder={folder}
                isSelected={selectedSlug === folder.slug}
                baseUrl={baseUrl}
                canManage={!!canManage}
                onEdit={setEditFolder}
                onDelete={setDeleteFolderState}
                onShare={setShareFolder}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Create Folder Button (managers only) */}
        {canManage && projectId && (
          <div className="p-2 border-t">
            <CreateFolderDialog
              projectId={projectId}
              existingSlugs={existingSlugs}
            />
          </div>
        )}
      </nav>

      {/* Edit Folder Dialog */}
      {editFolder && (
        <EditFolderDialog
          folder={editFolder}
          open={!!editFolder}
          onOpenChange={(open) => !open && setEditFolder(null)}
        />
      )}

      {/* Delete Folder Dialog */}
      {deleteFolderState && (
        <DeleteFolderDialog
          folder={deleteFolderState}
          open={!!deleteFolderState}
          onOpenChange={(open) => !open && setDeleteFolderState(null)}
        />
      )}

      {/* Share Folder Dialog */}
      {shareFolder && projectId && (
        <ShareVdrDialog
          folder={shareFolder}
          projectId={projectId}
          open={!!shareFolder}
          onOpenChange={(open) => !open && setShareFolder(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
