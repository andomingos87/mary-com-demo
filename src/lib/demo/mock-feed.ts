export type MockFeedItem = {
  id: string
  title: string
  body: string
  at: string
  tag: 'alerta' | 'pipeline' | 'mrs' | 'convite'
}

const FEED_TAG_LABELS: Record<MockFeedItem['tag'], string> = {
  alerta: 'Alerta',
  pipeline: 'Pipeline',
  mrs: 'MRS',
  convite: 'Convite',
}

export function feedTagLabel(tag: MockFeedItem['tag']): string {
  return FEED_TAG_LABELS[tag]
}

export const MOCK_FEED_ITEMS_INVESTOR: MockFeedItem[] = [
  {
    id: 'f1',
    title: 'Ativo Vesper atualizou o MRS',
    body: 'Readiness subiu para 72. Confira o radar para novo match.',
    at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    tag: 'mrs',
  },
  {
    id: 'f2',
    title: 'NDA em análise',
    body: 'Sua solicitação de NDA para Projeto Aurora está com o time do ativo.',
    at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    tag: 'pipeline',
  },
  {
    id: 'f3',
    title: 'Novo interesse',
    body: 'Um investidor adicional visualizou seu teaser (simulação).',
    at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    tag: 'alerta',
  },
]

export const MOCK_FEED_ITEMS_ASSET: MockFeedItem[] = [
  {
    id: 'a1',
    title: 'Investidor demonstrou interesse',
    body: 'Fundo Atlas abriu o teaser do seu projeto (demo).',
    at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    tag: 'pipeline',
  },
  {
    id: 'a2',
    title: 'Documento no VDR',
    body: 'Nova lista de diligência disponível na pasta DD (exemplo).',
    at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    tag: 'mrs',
  },
]

export const MOCK_FEED_ITEMS_ADVISOR: MockFeedItem[] = [
  {
    id: 'v1',
    title: 'Novo mandato sugerido',
    body: 'Projeto compatível com seu setor de especialização (demo).',
    at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    tag: 'convite',
  },
  {
    id: 'v2',
    title: 'Q&A pendente',
    body: 'Investidor enviou perguntas no VDR — rascunho de resposta na Mary AI.',
    at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    tag: 'pipeline',
  },
]
