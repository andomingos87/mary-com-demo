import type { ProjectStatus } from '@/types/database'

export type MockPipelineProject = {
  id: string
  codename: string
  status: ProjectStatus
}

/** Cartões distribuídos em fases para validar o kanban sem banco. */
export const MOCK_PIPELINE_PROJECTS: MockPipelineProject[] = [
  { id: '00000000-0000-4000-8000-00000000p01', codename: 'Projeto Tiger', status: 'teaser' },
  { id: '00000000-0000-4000-8000-00000000p02', codename: 'Codinome Vesper', status: 'nda' },
  { id: '00000000-0000-4000-8000-00000000p03', codename: 'Deal Orion', status: 'dd_spa' },
  { id: '00000000-0000-4000-8000-00000000p04', codename: 'Oportunidade Beta', status: 'screening' },
]
