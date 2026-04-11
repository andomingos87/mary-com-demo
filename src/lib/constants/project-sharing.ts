import type { ProjectVisibility } from '@/types/projects'

/** Texto curto: regra de governança de acesso na Mary (produto). */
export const PROJECT_SHARING_LOGIN_NOTICE =
  'Privado, Restrito e Radar Mary exigem cadastro e login na Mary para acessar o deal dentro da plataforma.'

export const PROJECT_VISIBILITY_OPTIONS: ReadonlyArray<{
  value: ProjectVisibility
  label: string
  shortHint: string
}> = [
  {
    value: 'private',
    label: 'Privado',
    shortHint: 'Não aparece no Radar; apenas equipe interna e advisors autorizados.',
  },
  {
    value: 'restricted',
    label: 'Restrito',
    shortHint: 'Não aparece no Radar; compartilhe com investidores específicos por convite na Mary.',
  },
  {
    value: 'public',
    label: 'Radar Mary',
    shortHint: 'Publicado no Radar geral da Mary; nunca fora do ambiente Mary.',
  },
]

export function isProjectRadarMary(visibility: string | null | undefined): boolean {
  return visibility === 'public'
}

export function normalizeProjectVisibility(value: string | null | undefined): ProjectVisibility {
  if (value === 'public' || value === 'private' || value === 'restricted') {
    return value
  }
  return 'private'
}
