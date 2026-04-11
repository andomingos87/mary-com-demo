'use client'

/**
 * ProjectCard Component
 * Phase 4.4 - UI Components
 *
 * Card for displaying project summary in the Hub list.
 */

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Globe,
  Lock,
  Users,
} from 'lucide-react'
import type { Project, ProjectObjective } from '@/types/database'
import { PROJECT_OBJECTIVE_LABELS } from '@/types/database'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { ReadinessIndicator } from './ReadinessIndicator'
import { isProjectRadarMary } from '@/lib/constants/project-sharing'

export interface ProjectCardProps {
  /** Project data */
  project: Project
  /** Organization slug for routing */
  orgSlug: string
  /** Optional L1 sector label */
  sectorL1Label?: string
  /** Additional CSS classes */
  className?: string
}

const OBJECTIVE_ICONS: Record<ProjectObjective, React.ElementType> = {
  sale: DollarSign,
  fundraising: TrendingUp,
}

const OBJECTIVE_COLORS: Record<ProjectObjective, string> = {
  sale: 'text-green-600 bg-green-50',
  fundraising: 'text-blue-600 bg-blue-50',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ProjectCard({
  project,
  orgSlug,
  sectorL1Label,
  className,
}: ProjectCardProps) {
  const ObjectiveIcon = OBJECTIVE_ICONS[project.objective]
  const objectiveLabel = PROJECT_OBJECTIVE_LABELS[project.objective]
  const objectiveColor = OBJECTIVE_COLORS[project.objective]

  const projectUrl = `/${orgSlug}/projects/${project.codename}`
  const visibilityLabel =
    project.visibility === 'restricted'
      ? 'Restrito'
      : isProjectRadarMary(project.visibility)
        ? 'Radar Mary'
        : 'Privado'

  return (
    <Link
      href={projectUrl}
      className={cn(
        'block rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
    >
    <Card className="group cursor-pointer hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={cn('rounded-md p-1.5', objectiveColor)}>
                <ObjectiveIcon className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg group-hover:underline">
                  {project.name || project.codename}
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2">
              <span className="font-mono text-xs">{project.codename}</span>
              <span className="text-muted-foreground">•</span>
              <span>{objectiveLabel}</span>
              {sectorL1Label && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span>{sectorL1Label}</span>
                </>
              )}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span aria-label={visibilityLabel}>
              {isProjectRadarMary(project.visibility) ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : project.visibility === 'restricted' ? (
                <Users className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </span>
            <ProjectStatusBadge status={project.status} size="sm" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Description preview */}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Readiness Score */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Readiness</span>
            <span className="font-medium">{project.readiness_score ?? 0}%</span>
          </div>
          <ReadinessIndicator
            score={project.readiness_score ?? 0}
            l2PlusCoverage={0} // Would need to calculate from readiness_data
            size="sm"
          />
        </div>
      </CardContent>

      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Criado em {formatDate(project.created_at)}</span>
        </div>
      </CardFooter>
    </Card>
    </Link>
  )
}

export default ProjectCard
