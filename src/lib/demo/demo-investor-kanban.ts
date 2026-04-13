import type {
  DemoInvestorKanbanCard,
  DemoInvestorKanbanColumnId,
  DemoProfileExperience,
} from '@/lib/demo/platform-data'

/** Ordem e rótulos das 6 colunas do Kanban investidor (demo). */
export const INVESTOR_KANBAN_COLUMNS: Array<{ id: DemoInvestorKanbanColumnId; label: string }> = [
  { id: 'teaser', label: 'Teaser' },
  { id: 'nda', label: 'NDA' },
  { id: 'nbo', label: 'NBO' },
  { id: 'spa', label: 'SPA' },
  { id: 'fechado', label: 'Fechado' },
  { id: 'perdido', label: 'Perdido' },
]

function normalizeSearch(s: string) {
  return s.trim().toLowerCase()
}

/** Texto agregado para busca simulada (nome, codinome, segmento, setor). */
export function investorKanbanSearchBlob(card: DemoInvestorKanbanCard): string {
  return [
    card.name,
    card.codename,
    card.typeLabel,
    card.sectorTag,
    card.segment,
    card.column,
  ]
    .filter(Boolean)
    .join(' ')
}

export function filterInvestorKanbanCards(
  cards: DemoInvestorKanbanCard[],
  query: string,
  columnFilter: 'all' | DemoInvestorKanbanColumnId
): DemoInvestorKanbanCard[] {
  const q = normalizeSearch(query)
  return cards.filter((card) => {
    if (columnFilter !== 'all' && card.column !== columnFilter) return false
    if (!q) return true
    return normalizeSearch(investorKanbanSearchBlob(card)).includes(q)
  })
}

function columnLabel(id: DemoInvestorKanbanColumnId): string {
  return INVESTOR_KANBAN_COLUMNS.find((c) => c.id === id)?.label ?? id
}

/** Projeto sintético para `ProjectView` quando o codinome está no Kanban mas não há `experience.project` completo (ex.: Alpha, Bravo). */
export function createInvestorPlaceholderProject(
  card: DemoInvestorKanbanCard
): NonNullable<DemoProfileExperience['project']> {
  const phase = columnLabel(card.column)
  return {
    codename: card.codename,
    title: `${card.name} · resumo (demo)`,
    kpiScoreOverride: card.mrs,
    summary: [
      {
        title: 'Sobre este projeto',
        body: `Demonstração: resumo sintético para ${card.name}. No produto, o conteúdo viria do dealflow e dos materiais compartilhados pelo ativo.`,
        badges: [card.sectorTag ?? 'Demo', card.typeLabel],
      },
    ],
    tabs: [
      {
        id: 'summary',
        label: 'Resumo',
        intro: 'Visão executiva mockada para navegação na demo.',
        panels: [
          {
            title: 'Snapshot',
            body: `Segmento: ${card.segment ?? '—'}. ROB e MRS exibidos no Kanban são valores apenas para demonstração.`,
            bullets: [`Fase no pipeline: ${phase}`, `Tipo: ${card.typeLabel}`, `ROB ${card.rob} · MRS ${card.mrs}`],
          },
          {
            title: 'Documentos referência (demo)',
            body: 'Exemplos do que pode aparecer no data room após liberação; itens e status são fictícios.',
            bullets: [
              'Teaser resumido',
              'FAQ do processo',
              'Deck curto (10 slides)',
              'Resumo financeiro LTM',
              'Lista de principais clientes (anonimizada)',
              'Pipeline comercial agregado',
              'Apresentação de produto',
              'Política de churn e retenção',
              'ESG — resumo voluntário',
              'Anexo de mercado e concorrentes',
              'Minuta de NDA (referência)',
              'Calendário sugerido de próximos passos',
            ],
          },
        ],
      },
      {
        id: 'mrs',
        label: 'MRS',
        intro:
          'Conteúdo do MRS replica a visão global da demo; o número em destaque segue o MRS do card deste pipeline.',
      },
      {
        id: 'info',
        label: '+ Informações',
        intro:
          'Antes do NDA, apenas materiais públicos ou já liberados aparecem. Itens “Somente solicitante” nunca são listados para o investidor.',
        moreInfoSections: [
          {
            id: `more-${card.codename}-ma`,
            title: 'M&A Docs',
            rows: [
              {
                id: `${card.codename}-doc-teaser`,
                subtheme: 'Apresentação',
                itemDocument: 'Teaser resumido',
                uploadDate: '01/03/2026',
                status: 'completo',
                responsible: 'Mary AI',
                sharedWith: 'all_with_nda',
              },
              {
                id: `${card.codename}-doc-internal`,
                subtheme: 'Interno',
                itemDocument: 'Notas confidenciais do deal team',
                uploadDate: null,
                status: 'parcial',
                responsible: 'Analyst',
                sharedWith: 'requester_only',
              },
            ],
          },
          {
            id: `more-${card.codename}-extra`,
            title: 'Documentos Adicionais',
            rows: [
              {
                id: `${card.codename}-doc-dd`,
                subtheme: 'Due Diligence',
                itemDocument: 'DD checklist (parcial)',
                uploadDate: null,
                status: 'parcial',
                responsible: 'Advisor',
                sharedWith: 'all_with_nda',
              },
            ],
          },
        ],
      },
    ],
  }
}
