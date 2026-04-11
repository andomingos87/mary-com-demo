'use client'

import * as React from 'react'
import { useState } from 'react'
import { Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { updateProject } from '@/lib/actions/projects'
import { TOOLTIPS } from '@/lib/constants/tooltips'
import {
  PROJECT_SHARING_LOGIN_NOTICE,
  PROJECT_VISIBILITY_OPTIONS,
  normalizeProjectVisibility,
} from '@/lib/constants/project-sharing'
import type { ProjectVisibility } from '@/types/projects'
import { cn } from '@/lib/utils'

interface ProjectVisibilityToggleProps {
  projectId: string
  visibility: ProjectVisibility
  onVisibilityChange?: (newVisibility: ProjectVisibility) => void
  disabled?: boolean
}

export function ProjectVisibilityToggle({
  projectId,
  visibility,
  onVisibilityChange,
  disabled,
}: ProjectVisibilityToggleProps) {
  const [currentVisibility, setCurrentVisibility] = useState(() => normalizeProjectVisibility(visibility))
  const [isUpdating, setIsUpdating] = useState(false)
  const [showRadarConfirm, setShowRadarConfirm] = useState(false)
  const [pendingVisibility, setPendingVisibility] = useState<ProjectVisibility | null>(null)

  React.useEffect(() => {
    setCurrentVisibility(normalizeProjectVisibility(visibility))
  }, [visibility])

  const doUpdate = async (newVisibility: ProjectVisibility) => {
    setIsUpdating(true)
    const result = await updateProject(projectId, { visibility: newVisibility })
    setIsUpdating(false)

    if (result.success) {
      setCurrentVisibility(newVisibility)
      onVisibilityChange?.(newVisibility)
    }
  }

  const handleSelect = (value: string) => {
    const next = normalizeProjectVisibility(value)
    if (next === currentVisibility) return

    if (next === 'public' && currentVisibility !== 'public') {
      setPendingVisibility(next)
      setShowRadarConfirm(true)
      return
    }

    void doUpdate(next)
  }

  const confirmRadarMary = () => {
    if (pendingVisibility) {
      void doUpdate(pendingVisibility)
    }
    setShowRadarConfirm(false)
    setPendingVisibility(null)
  }

  const cancelRadarMary = () => {
    setShowRadarConfirm(false)
    setPendingVisibility(null)
  }

  const currentLabel =
    PROJECT_VISIBILITY_OPTIONS.find((o) => o.value === currentVisibility)?.label ?? 'Privado'

  return (
    <>
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Visibilidade</span>
          <Select
            value={currentVisibility}
            onValueChange={handleSelect}
            disabled={disabled || isUpdating}
          >
            <SelectTrigger
              className={cn(
                'h-9 w-[min(100vw-8rem,220px)] sm:w-[220px] border-border bg-background text-sm shadow-card'
              )}
              aria-label="Visibilidade do projeto"
            >
              <SelectValue placeholder={currentLabel} />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_VISIBILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="block text-xs text-muted-foreground font-normal">{opt.shortHint}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground"
                aria-label="Ajuda sobre visibilidade e acesso"
              >
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm space-y-2 text-left">
              <p className="text-xs font-medium text-foreground">Privado</p>
              <p className="text-xs text-muted-foreground">{TOOLTIPS.projects.visibilityPrivate}</p>
              <p className="text-xs font-medium text-foreground pt-1">Restrito</p>
              <p className="text-xs text-muted-foreground">{TOOLTIPS.projects.visibilityRestricted}</p>
              <p className="text-xs font-medium text-foreground pt-1">Radar Mary</p>
              <p className="text-xs text-muted-foreground">{TOOLTIPS.projects.visibilityRadarMary}</p>
              <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-1">
                {TOOLTIPS.projects.sharingLoginRule}
              </p>
            </TooltipContent>
          </Tooltip>
          {isUpdating ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-hidden /> : null}
        </div>
      </TooltipProvider>

      <AlertDialog open={showRadarConfirm} onOpenChange={(open) => !open && cancelRadarMary()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicar no Radar Mary?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-left">
              <span className="block">
                O projeto passará a aparecer no Radar geral da Mary para investidores elegíveis. Não há acesso ao
                deal fora do ambiente Mary.
              </span>
              <span className="block text-xs text-muted-foreground">{PROJECT_SHARING_LOGIN_NOTICE}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRadarMary}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRadarMary}>Publicar no Radar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
