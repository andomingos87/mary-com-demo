'use client'

import * as React from 'react'
import { useState } from 'react'
import { Globe, Lock, Loader2 } from 'lucide-react'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { updateProject } from '@/lib/actions/projects'
import type { ProjectVisibility } from '@/types/projects'

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
  const [currentVisibility, setCurrentVisibility] = useState(visibility)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isPublic = currentVisibility === 'public'

  const handleToggle = () => {
    if (isPublic) {
      // public -> private: no confirmation needed
      doUpdate('private')
    } else {
      // private -> public: show confirmation
      setShowConfirm(true)
    }
  }

  const doUpdate = async (newVisibility: ProjectVisibility) => {
    setIsUpdating(true)
    const result = await updateProject(projectId, { visibility: newVisibility })
    setIsUpdating(false)

    if (result.success) {
      setCurrentVisibility(newVisibility)
      onVisibilityChange?.(newVisibility)
    }
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              disabled={disabled || isUpdating}
              className="gap-2"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPublic ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {isPublic ? 'Publico' : 'Privado'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPublic
              ? 'Visivel para todos os membros da organizacao'
              : 'Visivel apenas para membros do projeto'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tornar projeto publico?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os membros da organizacao poderao visualizar este projeto.
              Apenas membros do projeto poderao editar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => doUpdate('public')}>
              Tornar publico
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
