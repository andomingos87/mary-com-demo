import type { ProjectStatus } from '@/types/database'
import type { RadarOpportunity } from '@/types/radar'

export type DemoProfileKey = 'investor' | 'asset' | 'advisor'
export type DemoRouteKey =
  | 'landing'
  | 'signup'
  | 'onboarding'
  | 'dashboard'
  | 'thesis'
  | 'radar'
  | 'feed'
  | 'pipeline'
  | 'mrs'
  | 'projects'
  | 'project'
  | 'profile'
  | 'settings'

export interface DemoNavItem {
  key: DemoRouteKey
  label: string
  href: string
}

export interface DemoStat {
  label: string
  value: string
  helper: string
}

export interface DemoFormField {
  label: string
  value: string | string[] | boolean
  note?: string
  kind?: 'text' | 'textarea' | 'tags' | 'boolean' | 'checkbox'
}

export interface DemoStep {
  id: string
  title: string
  description: string
  fields: DemoFormField[]
}

export interface DemoPanel {
  title: string
  body: string
  bullets?: string[]
  badges?: string[]
}

export interface DemoTable {
  columns: string[]
  rows: string[][]
}

export interface DemoProjectTab {
  id: string
  label: string
  intro: string
  panels?: DemoPanel[]
  table?: DemoTable
  docs?: { name: string; status: string; note: string }[]
}

export interface DemoProjectCard {
  name: string
  codename: string
  objective: string
  stage: string
  visibility: string
  summary: string
  value: string
  /** 0–100: badge de aderência / readiness no card (demo). */
  matchScore?: number
  /** Cidade/UF exibidos como no card de investidor. */
  location?: string
  /** Rótulo curto no corpo do card (ex.: tipo de mandato). */
  typeLabel?: string
}

export interface DemoProfileExperience {
  profile: DemoProfileKey
  label: string
  slug: string
  accent: string
  tone: string
  audience: string
  publicFlow: DemoNavItem[]
  appFlow: DemoNavItem[]
  landing: {
    eyebrow: string
    title: string
    summary: string
    ctaPrimary: DemoNavItem
    ctaSecondary: DemoNavItem
    stats: DemoStat[]
    previewPanels: DemoPanel[]
  }
  signup: {
    title: string
    summary: string
    validations: string[]
    fields: DemoFormField[]
  }
  onboarding: {
    title: string
    summary: string
    steps: DemoStep[]
    completionTitle: string
    completionBody: string
    completionHref: string
    completionCta: string
  }
  dashboard?: {
    title: string
    summary: string
    metrics: DemoStat[]
    panels: DemoPanel[]
    aiQueue: string[]
  }
  thesis?: {
    title: string
    summary: string
    theses: Array<{
      id: string
      name: string
      status: string
      matchCount: string
      summary: string
      fields: DemoFormField[]
    }>
    aiActions: string[]
  }
  radar?: {
    title: string
    summary: string
    selectorLabel: string
    selectorValues: string[]
    notes: string[]
    opportunities?: RadarOpportunity[]
    matches?: DemoPanel[]
  }
  feed?: {
    title: string
    summary: string
    filters: string[]
    items: Array<{
      id: string
      tag: string
      title: string
      body: string
      at: string
    }>
    aiPrompts: string[]
  }
  pipeline?: {
    title: string
    summary: string
    metrics: DemoStat[]
    projects: Array<{ id: string; codename: string; status: ProjectStatus }>
    stageRules: DemoPanel[]
  }
  mrs?: {
    title: string
    summary: string
    score: number
    dimensions: DemoStat[]
    steps: DemoPanel[]
    docs: { name: string; status: string; note: string }[]
    aiPrompts: string[]
    /** Eixos 0–5 para o gráfico radar (demo). */
    radarAxes?: Array<{ label: string; value: number }>
    /** `null` ou omitido = cartão “Em breve”. */
    benchmarkScore?: number | null
    globalStatus?: { label: string; detail: string }
  }
  projects?: {
    title: string
    summary: string
    cards: DemoProjectCard[]
  }
  project?: {
    codename: string
    title: string
    summary: DemoPanel[]
    tabs: DemoProjectTab[]
  }
  profilePage?: {
    title: string
    summary: string
    identity: DemoFormField[]
    trackRecord: DemoFormField[]
    preferences: DemoFormField[]
    aiQueue: string[]
  }
  /** Configurações da conta (demo): Conta, Faturamento, Equipe — sem persistência. */
  settings?: {
    title: string
    summary: string
    account: {
      intro: string
      profile: DemoFormField[]
      security: DemoPanel[]
      preferences: DemoFormField[]
      organization: DemoPanel
    }
    billing: {
      plan: { name: string; status: string; renewal: string }
      usage: DemoStat[]
      payment: DemoFormField[]
      invoices: DemoTable
      fiscalNote: string
    }
    team: {
      members: DemoTable
      rolesHelp: string
      externalNote?: string
    }
  }
}

export const DEMO_HOME_PROFILES: Array<{
  profile: DemoProfileKey
  title: string
  subtitle: string
  href: string
  summary: string
}> = [
  {
    profile: 'investor',
    title: 'Investidor',
    subtitle: 'Deal flow, tese, radar e pipeline',
    href: '/demo/investor',
    summary: 'Mostra a jornada completa de compra ou investimento, da landing ao VDR progressivo.',
  },
  {
    profile: 'asset',
    title: 'Ativo',
    subtitle: 'MRS, projeto, radar e investidores',
    href: '/demo/asset',
    summary: 'Simula a experiência da empresa vendendo ou captando com teaser, MRS e projeto Tiger.',
  },
  {
    profile: 'advisor',
    title: 'Advisor',
    subtitle: 'Mandatos, curadoria e operação',
    href: '/demo/advisor',
    summary: 'Cobre cadastro, onboarding, dashboard, radar de mandatos e perfil consultivo.',
  },
]

const investorRadar: RadarOpportunity[] = [
  {
    projectId: 'demo-investor-aurora',
    assetOrganizationId: 'asset-aurora',
    codename: 'Projeto Aurora',
    sector: 'B2B SaaS',
    matchScore: 91,
    updatedAt: '2026-04-10T14:20:00.000Z',
    teaserSummary:
      'Empresa vertical SaaS para supply chain, com recorrência, margem operacional resiliente e tese aderente ao mandato Edtech Growth pela camada de B2B enablement e expansão LatAm.',
    matchReasons: ['Setor aderente', 'ROB dentro da faixa', 'Geografia prioritária'],
    ctaState: {
      canViewTeaser: true,
      canRequestNda: true,
      isFollowing: true,
      hasNdaRequest: false,
    },
  },
  {
    projectId: 'demo-investor-tiger',
    assetOrganizationId: 'asset-tiger',
    codename: 'Projeto Tiger',
    sector: 'Edtech B2B2C',
    matchScore: 88,
    updatedAt: '2026-04-10T13:10:00.000Z',
    teaserSummary:
      'Plataforma de aprendizado corporativo com distribuição em 7 países, churn controlado e readiness score inicial de 72. O ativo não expõe nome antes do NDA.',
    matchReasons: ['Público-alvo compatível', 'Cheque aderente', 'MRS mínimo atingido'],
    ctaState: {
      canViewTeaser: true,
      canRequestNda: false,
      isFollowing: true,
      hasNdaRequest: true,
    },
  },
  {
    projectId: 'demo-investor-vesper',
    assetOrganizationId: 'asset-vesper',
    codename: 'Codinome Vesper',
    sector: 'Fintech B2C',
    matchScore: 74,
    updatedAt: '2026-04-10T10:40:00.000Z',
    teaserSummary:
      'Negócio em fase growth com monetização comprovada e advisor sell-side contratado. Exemplo de card com teaser completo e CTA de contato.',
    matchReasons: ['Ticket compatível', 'EBITDA mínimo atingido'],
    ctaState: {
      canViewTeaser: true,
      canRequestNda: true,
      isFollowing: false,
      hasNdaRequest: false,
    },
  },
]

export const DEMO_PLATFORM: Record<DemoProfileKey, DemoProfileExperience> = {
  investor: {
    profile: 'investor',
    label: 'Investidor',
    slug: 'investor',
    accent: 'from-[#4b1223] via-[#7a203b] to-[#e6b8a9]',
    tone: 'escassez, curadoria e velocidade de decisão',
    audience: 'PE, VC, family office, corporate e fundos setoriais',
    publicFlow: [
      { key: 'landing', label: 'Landing /invest', href: '/demo/investor' },
      { key: 'signup', label: 'Cadastro', href: '/demo/investor/signup' },
      { key: 'onboarding', label: 'Onboarding', href: '/demo/investor/onboarding' },
    ],
    appFlow: [
      { key: 'dashboard', label: 'Dashboard', href: '/demo/investor/dashboard' },
      { key: 'thesis', label: 'Teses', href: '/demo/investor/thesis' },
      { key: 'radar', label: 'Radar', href: '/demo/investor/radar' },
      { key: 'feed', label: 'Feed', href: '/demo/investor/feed' },
      { key: 'pipeline', label: 'Pipeline', href: '/demo/investor/pipeline' },
      { key: 'project', label: 'Projeto Tiger', href: '/demo/investor/projects/tiger' },
      { key: 'settings', label: 'Configurações', href: '/demo/investor/settings' },
    ],
    landing: {
      eyebrow: 'Perfil 1 · Investor journey',
      title: 'Acesse deal flow qualificado, estruturado e matching com sua tese.',
      summary:
        'A demo pública simula o CTA /invest, a captura do responsável, a configuração da tese e a primeira ativação no radar com menos de 60 segundos.',
      ctaPrimary: { key: 'signup', label: 'Solicitar acesso', href: '/demo/investor/signup' },
      ctaSecondary: { key: 'dashboard', label: 'Ver plataforma logada', href: '/demo/investor/dashboard' },
      stats: [
        { label: 'Ativos qualificados', value: '184', helper: 'base anônima e curada' },
        { label: 'Deals em andamento', value: '27', helper: 'pipeline vivo' },
        { label: 'Track record mínimo', value: '2 deals', helper: 'últimos 3 anos' },
      ],
      previewPanels: [
        {
          title: 'Readiness Score visível',
          body: 'O investidor entra pela prova de qualidade: teaser, score, gatilhos de NDA e progresso documental.',
          badges: ['Readiness', 'MRS mínimo', 'NDA progressivo'],
        },
        {
          title: 'Matching por tese',
          body: 'A primeira tese criada já nasce selecionada no radar, puxando cards compatíveis por setor, geografia, ROB e cheque.',
          badges: ['Setor', 'Geografia', 'Cheque'],
        },
        {
          title: 'Pipeline documental',
          body: 'Teaser, NDA, pré-DD e DD/SPA andam com gatilhos claros. O board vira cockpit do deal.',
          badges: ['Kanban', 'Q&A', 'VDR'],
        },
      ],
    },
    signup: {
      title: 'Cadastro de investidor',
      summary:
        'Todos os campos do pré-cadastro foram mockados, incluindo bloqueio de domínio pessoal, MFA por WhatsApp e lookup do website institucional.',
      validations: [
        'Bloqueio de @gmail, @hotmail, @yahoo e @outlook',
        'Senha com mínimo de 8 caracteres, letra, número e símbolo',
        'Disparo paralelo de email de autenticação e código WhatsApp',
        'Lookup de empresa e logo a partir do domínio institucional',
      ],
      fields: [
        { label: 'Nome completo do responsável', value: 'Mariana Reis' },
        { label: 'E-mail profissional', value: 'm.reis@atlasgrowth.com', note: 'domínio corporativo validado' },
        { label: 'Senha', value: 'A!as2026#secure' },
        { label: 'Confirmação de senha', value: 'A!as2026#secure' },
        { label: 'MFA via WhatsApp', value: '+55 11 98888-4401' },
        { label: 'Website institucional', value: 'https://atlasgrowth.com' },
        {
          label: 'Tipo de investidor',
          value: ['Private Equity', 'Family Office'],
          kind: 'tags',
        },
      ],
    },
    onboarding: {
      title: 'Onboarding do investidor',
      summary:
        'O onboarding replica o fluxo de tese inicial e refinamento com microcopy, ranges financeiros e convite de advisor buy-side.',
      steps: [
        {
          id: 'step-1',
          title: 'Step 1 · Crie sua primeira tese de investimento',
          description: 'Os campos geram a base do matching e aparecem depois na tela de Teses.',
          fields: [
            { label: 'Nome da empresa/fundo', value: 'Atlas Growth Partners' },
            { label: 'Setores-alvo de investimento', value: ['Edtech', 'HR Tech', 'B2B SaaS'], kind: 'tags' },
            { label: 'Público-alvo da empresa-alvo', value: ['B2B', 'B2B2C'], kind: 'tags' },
            { label: 'Regiões prioritárias', value: ['Brasil', 'México', 'Chile'], kind: 'tags' },
            {
              label: 'Detalhes da tese',
              value:
                'Buscamos plataformas de software ou enablement educacional com recorrência, capacidade de consolidação e abertura para M&A regional.',
              kind: 'textarea',
            },
          ],
        },
        {
          id: 'step-2',
          title: 'Step 2 · Refine sua tese',
          description: 'Faixas financeiras, EBITDA mínimo e convite do advisor entram aqui.',
          fields: [
            { label: 'ROB mínimo (últimos 12 meses)', value: 'USD 8M' },
            { label: 'ROB máximo (últimos 12 meses)', value: 'USD 70M' },
            { label: 'EBITDA % mínimo', value: '12%' },
            { label: 'Cheque mínimo', value: 'USD 5M' },
            { label: 'Cheque máximo', value: 'USD 35M' },
            { label: 'Ja possui advisor buy-side?', value: true, kind: 'boolean' },
            { label: 'Advisor convidado', value: 'rafael@northadvisors.com' },
            { label: 'Aceite de termos e privacidade', value: true, kind: 'checkbox' },
          ],
        },
      ],
      completionTitle: 'Cadastro finalizado com sucesso',
      completionBody:
        'Seu perfil e sua tese foram configurados e protegidos na Mary. O CTA leva direto ao Radar com a tese Edtech Growth já selecionada.',
      completionHref: '/demo/investor/radar',
      completionCta: 'Ver meu Radar',
    },
    dashboard: {
      title: 'Cockpit do investidor',
      summary:
        'A área logada concentra sinais de deal flow, qualidade do matching, projetos ativos e próximos passos do advisor.',
      metrics: [
        { label: 'Teses ativas', value: '3', helper: '1 principal + 2 secundarias' },
        { label: 'Matches acima de 75', value: '18', helper: 'últimas 72h' },
        { label: 'Projetos em pipeline', value: '5', helper: '3 em NDA ou acima' },
        { label: 'NDA ativos', value: '3', helper: 'liberando MRS progressivo' },
      ],
      panels: [
        {
          title: 'Momento aha imediato',
          body: 'Projeto Tiger aparece como match quente logo no primeiro login, com teaser completo, score 88 e liberacao parcial do MRS após NDA.',
          badges: ['Tiger', 'Score 88', 'NDA ativo'],
        },
        {
          title: 'Mary AI como operador',
          body: 'A fila mockada mostra rascunho de email para advisor, checklist de DD sugerida e leitura automática das últimas atualizações dos ativos seguidos.',
          bullets: ['Enviar convite buy-side', 'Resumir MRS de Tiger', 'Calibrar tese Fintech Expansion'],
        },
        {
          title: 'Rede e prova de valor',
          body: 'A plataforma explícita que cada tese melhora o matching, cada NDA gera sinal para o ativo e cada fechamento retroalimenta a rede.',
          badges: ['Network effects', 'Matching', 'Tombstone'],
        },
      ],
      aiQueue: [
        'Gerar email contextual para o advisor Rafael North sobre o Projeto Tiger.',
        'Comparar MRS do Projeto Tiger com a tese Edtech Growth.',
        'Sugerir perguntas de Q&A para a proxima rodada de DD.',
      ],
    },
    thesis: {
      title: 'Teses de investimento',
      summary:
        'A tela replica o stack de teses criado no onboarding e depois expandido manualmente, com campos completos e leitura pronta para matching.',
      theses: [
        {
          id: 'edtech-growth',
          name: 'Edtech Growth',
          status: 'Ativa',
          matchCount: '9 matches',
          summary: 'Tese principal usada no Radar e no pipeline atual.',
          fields: [
            { label: 'Setores-alvo', value: ['Edtech', 'HR Tech', 'B2B SaaS'], kind: 'tags' },
            { label: 'Público alvo', value: ['B2B', 'B2B2C'], kind: 'tags' },
            { label: 'Regioes', value: ['Brasil', 'Mexico', 'Chile'], kind: 'tags' },
            { label: 'ROB mínimo', value: 'USD 8M' },
            { label: 'ROB máximo', value: 'USD 70M' },
            { label: 'EBITDA % mínimo', value: '12%' },
            { label: 'Cheque mínimo', value: 'USD 5M' },
            { label: 'Cheque máximo', value: 'USD 35M' },
            {
              label: 'Detalhes',
              value:
                'Consolidacao regional de plataformas de software educacional ou corporativo com forte motor comercial e possibilidade de cross-sell.',
              kind: 'textarea',
            },
          ],
        },
        {
          id: 'fintech-expansion',
          name: 'Fintech Expansion',
          status: 'Ativa',
          matchCount: '5 matches',
          summary: 'Tese secundaria orientada a fintech B2C com monetizacao validada.',
          fields: [
            { label: 'Setores-alvo', value: ['Fintech', 'Insurtech'], kind: 'tags' },
            { label: 'Público alvo', value: ['B2C'], kind: 'tags' },
            { label: 'Regioes', value: ['Brasil'], kind: 'tags' },
            { label: 'ROB mínimo', value: 'USD 15M' },
            { label: 'ROB máximo', value: 'USD 120M' },
            { label: 'EBITDA % mínimo', value: '8%' },
            { label: 'Cheque mínimo', value: 'USD 8M' },
            { label: 'Cheque máximo', value: 'USD 40M' },
          ],
        },
        {
          id: 'special-situations',
          name: 'Special Situations',
          status: 'Rascunho',
          matchCount: '0 matches',
          summary: 'Rascunho salvo para deals de carve-out e turnaround.',
          fields: [
            { label: 'Setores-alvo', value: ['Industrial Tech', 'Logistica'], kind: 'tags' },
            { label: 'Público alvo', value: ['B2B'], kind: 'tags' },
            { label: 'Regioes', value: ['Brasil', 'Colombia'], kind: 'tags' },
            { label: 'ROB mínimo', value: 'USD 20M' },
            { label: 'ROB máximo', value: 'USD 250M' },
            { label: 'Cheque mínimo', value: 'USD 10M' },
            { label: 'Cheque máximo', value: 'USD 60M' },
          ],
        },
      ],
      aiActions: [
        'Buscar ativos fora da base Mary para a tese Special Situations.',
        'Disparar tese Edtech Growth para advisors relevantes.',
        'Comparar cobertura geografica entre Edtech Growth e Fintech Expansion.',
      ],
    },
    radar: {
      title: 'Radar de oportunidades',
      summary:
        'A tese Edtech Growth vem pré-selecionada por padrao. O usuario pode combinar multiplas teses e ver matches anonimizados com teaser, score e CTA.',
      selectorLabel: 'Teses selecionadas',
      selectorValues: ['Edtech Growth', 'Fintech Expansion'],
      notes: [
        'Cenario 1: ativo pré-cadastrado mostra teaser basico e apenas CTA de acompanhar.',
        'Cenario 2: ativo cadastrado mostra teaser completo, readiness score e CTA de NDA.',
        'Ao seguir um ativo, ele passa a alimentar o Feed de atualizações.',
      ],
      opportunities: investorRadar,
    },
    feed: {
      title: 'Atualizacoes do investidor',
      summary:
        'Feed único dos ativos acompanhados, com filtro por projeto e suporte contextual da Mary AI para Q&A, tese e monitoramento.',
      filters: ['Todos', 'Projeto Tiger', 'Projeto Aurora', 'Somente MRS', 'Somente pipeline'],
      items: [
        {
          id: 'inv-feed-1',
          tag: 'mrs',
          title: 'Projeto Tiger subiu o MRS de 68 para 72',
          body: 'O ativo concluiu documentos financeiros do passo 2 e destravou mais detalhes do resumo executivo.',
          at: '2026-04-10T14:00:00.000Z',
        },
        {
          id: 'inv-feed-2',
          tag: 'pipeline',
          title: 'NDA de Codinome Vesper aguardando aceite do ativo',
          body: 'O advisor sell-side recebeu o pedido e a timeline estimada para resposta ficou em 24h.',
          at: '2026-04-10T12:30:00.000Z',
        },
        {
          id: 'inv-feed-3',
          tag: 'alerta',
          title: 'Projeto Aurora entrou no seu radar como novo match quente',
          body: 'Setor, geografia e ticket aderem a sua tese principal. O score calculado foi 91.',
          at: '2026-04-10T09:15:00.000Z',
        },
      ],
      aiPrompts: [
        'Resuma as mudanças de readiness dos ativos seguidos nestá semana.',
        'Monte um Q&A inicial para o advisor do Projeto Tiger.',
        'Liste quais projetos já estão elegíveis para IOI.',
      ],
    },
    pipeline: {
      title: 'Pipeline do investidor',
      summary:
        'O board mostra fases do deal. Ativo e advisor sell-side ficam passivos; a movimentação pertence ao investidor e ao advisor buy-side.',
      metrics: [
        { label: 'Teaser', value: '2', helper: 'triagem inicial' },
        { label: 'NDA', value: '2', helper: 'documentação em curso' },
        { label: 'DD / SPA', value: '1', helper: 'etapa profunda' },
      ],
      projects: [
        { id: 'pipe-1', codename: 'tiger', status: 'nda' },
        { id: 'pipe-2', codename: 'aurora', status: 'teaser' },
        { id: 'pipe-3', codename: 'vesper', status: 'ioi' },
        { id: 'pipe-4', codename: 'atlas-x', status: 'dd_spa' },
        { id: 'pipe-5', codename: 'nebula', status: 'screening' },
      ],
      stageRules: [
        {
          title: 'Gatilho documental',
          body: 'Cada avançar de fase está amarrado a um evento: teaser visto, NDA assinado, checklist de DD criada, IOI recebida e SPA assinado.',
        },
        {
          title: 'Liberacao progressiva do VDR',
          body: 'Após NDA assinado, o investidor vê passos 1 e 2 do MRS. Após NBO assinada, passos 3 e 4 são destravados.',
        },
      ],
    },
    projects: {
      title: 'Projetos engajados',
      summary:
        'A lista de projetos serve como entrada para o VDR progressivo e para o histórico dos deals em que o investidor está ativo.',
      cards: [
        {
          name: 'Projeto Tiger',
          codename: 'tiger',
          objective: 'Aquisicao integral',
          stage: 'NDA',
          visibility: 'Restrito',
          summary: 'Edtech B2B2C com readiness score 72 e advisor sell-side contratado.',
          value: 'USD 40M - 60M',
          matchScore: 94,
          location: 'São Paulo, SP',
          typeLabel: 'Growth equity',
        },
        {
          name: 'Projeto Aurora',
          codename: 'aurora',
          objective: 'Growth equity',
          stage: 'Teaser',
          visibility: 'Radar Mary',
          summary: 'SaaS vertical em supply chain com forte aderencia a tese principal.',
          value: 'USD 20M - 35M',
          matchScore: 82,
          location: 'São Paulo, SP',
          typeLabel: 'Venture Capital',
        },
      ],
    },
    project: {
      codename: 'tiger',
      title: 'Projeto Tiger · área progressiva do investidor',
      summary: [
        {
          title: 'Resumo do deal',
          body: 'Projeto Tiger está em NDA. O investidor recebe acesso progressivo a resumo, MRS e área complementar + Info conforme a fase do pipeline.',
          badges: ['NDA ativo', 'Score 72', 'Advisor sell-side presente'],
        },
        {
          title: 'Regra de acesso',
          body: 'Somente documentos compartilhados pelo ativo aparecem aqui. Colunas de gestão interna do MRS foram zeradas para o investidor.',
          badges: ['RBAC', 'Read-only', 'Docs compartilhados'],
        },
      ],
      tabs: [
        {
          id: 'summary',
          label: 'Resumo',
          intro: 'Visão executiva anônima com progresso do processo.',
          panels: [
            {
              title: 'Snapshot',
              body: 'Edtech B2B2C com operação em 7 países, receita recorrente, crescimento de dois digitos e motivacao de consolidação.',
              bullets: ['Receita 2025: USD 28M', 'EBITDA 14%', 'Equipe fundadora permanecera no carve-out inicial'],
            },
            {
              title: 'Timeline do pipeline',
              body: 'Teaser visto, NDA assinado, perguntas iniciais abertas e checklist de pré-DD em construcao.',
              bullets: ['03/04 teaser aberto', '05/04 NDA assinado', '10/04 acesso aos passos 1 e 2 do MRS'],
            },
          ],
        },
        {
          id: 'mrs',
          label: 'MRS',
          intro: 'Passos 1 e 2 liberados após NDA.',
          docs: [
            { name: 'Passo 1 · Company basics', status: 'Compartilhado', note: 'visível ao investidor' },
            { name: 'Passo 2 · Financial snapshot', status: 'Compartilhado', note: 'DFs resumidas e resumo executivo' },
            { name: 'Passo 3 · Tax and legal', status: 'Bloqueado', note: 'libera após NBO assinada' },
            { name: 'Passo 4 · Final DD package', status: 'Bloqueado', note: 'libera após fase avancada' },
          ],
        },
        {
          id: 'info',
          label: '+ Info',
          intro: 'VDR complementar para Q&A, memorandos internos e materiais adicionais.',
          panels: [
            {
              title: 'Q&A do deal',
              body: 'Investidor pode subir documentos proprios, registrar perguntas e receber rascunhos da Mary AI baseados no material compartilhado.',
              bullets: ['Pergunta 1: CAC por segmento', 'Pergunta 2: Renovação por cohort', 'Pergunta 3: Estrutura societária internacional'],
            },
          ],
        },
      ],
    },
    settings: {
      title: 'Configurações',
      summary:
        'Preferências da conta do fundo, faturamento do workspace Mary e equipe com acesso ao deal flow. Dados mockados para demonstração.',
      account: {
        intro: 'Perfil do responsável e segurança da conta institucional.',
        profile: [
          { label: 'Nome', value: 'Marina Duarte' },
          { label: 'E-mail', value: 'marina@fundoxyz.com.br' },
          { label: 'Cargo', value: 'Partner · Growth' },
          { label: 'Telefone', value: '+55 11 98888-2200' },
        ],
        security: [
          {
            title: 'Autenticação',
            body: 'MFA ativo via app autenticador. Último login simulado: hoje, 09:12.',
            badges: ['MFA', 'Sessão segura'],
          },
        ],
        preferences: [
          { label: 'Idioma', value: 'Português (Brasil)' },
          { label: 'Fuso', value: 'America/Sao_Paulo' },
          { label: 'Resumo semanal por e-mail', value: true, kind: 'boolean' },
          { label: 'Alertas de NDA e MRS', value: true, kind: 'boolean' },
        ],
        organization: {
          title: 'Organização ativa',
          body: 'Fundo XYZ Growth I · CNPJ 00.000.000/0001-00. Conta institucional usada no Radar e no pipeline.',
          badges: ['Investidor', 'Ativo'],
        },
      },
      billing: {
        plan: { name: 'Mary Institutional', status: 'Ativo', renewal: 'Renovação em 12/05/2026' },
        usage: [
          { label: 'Usuários', value: '4 / 15', helper: 'licenças em uso' },
          { label: 'NDAs ativos', value: '3', helper: 'no ciclo atual' },
          { label: 'Armazenamento VDR', value: '8 / 100 GB', helper: 'acumulado' },
        ],
        payment: [
          { label: 'Método', value: 'Cartão corporativo · ****4242' },
          { label: 'Próxima cobrança', value: 'BRL 4.900,00' },
        ],
        invoices: {
          columns: ['Data', 'Descrição', 'Valor', 'Status'],
          rows: [
            ['10/03/2026', 'Assinatura Mary Institutional', 'BRL 4.900,00', 'Pago'],
            ['10/02/2026', 'Assinatura Mary Institutional', 'BRL 4.900,00', 'Pago'],
          ],
        },
        fiscalNote: 'Notas fiscais e XML enviados para financeiro@fundoxyz.com.br (demo).',
      },
      team: {
        members: {
          columns: ['Nome', 'E-mail', 'Papel', 'Status'],
          rows: [
            ['Marina Duarte', 'marina@fundoxyz.com.br', 'Owner', 'Ativo'],
            ['Paulo Rezende', 'paulo@fundoxyz.com.br', 'Deal team', 'Ativo'],
            ['Ana Kim', 'ana@fundoxyz.com.br', 'Leitura', 'Convite pendente'],
          ],
        },
        rolesHelp:
          'Owner gerencia faturamento e convites; Deal team opera pipeline e NDA; Leitura acompanha oportunidades sem editar teses.',
      },
    },
  },
  asset: {
    profile: 'asset',
    label: 'Ativo',
    slug: 'asset',
    accent: 'from-[#0f3d35] via-[#175f53] to-[#d6e0b6]',
    tone: 'preparo, visibilidade e controle do projeto',
    audience: 'empresa vendendo, captando ou estruturando um mandato',
    publicFlow: [
      { key: 'landing', label: 'Landing /sell-raise', href: '/demo/asset' },
      { key: 'signup', label: 'Cadastro', href: '/demo/asset/signup' },
      { key: 'onboarding', label: 'Onboarding', href: '/demo/asset/onboarding' },
    ],
    appFlow: [
      { key: 'dashboard', label: 'Cockpit', href: '/demo/asset/dashboard' },
      { key: 'mrs', label: 'MRS', href: '/demo/asset/mrs' },
      { key: 'radar', label: 'Radar', href: '/demo/asset/radar' },
      { key: 'feed', label: 'Feed', href: '/demo/asset/feed' },
      { key: 'projects', label: 'Projetos', href: '/demo/asset/projects' },
      { key: 'project', label: 'Projeto Tiger', href: '/demo/asset/projects/tiger' },
      { key: 'settings', label: 'Configurações', href: '/demo/asset/settings' },
    ],
    landing: {
      eyebrow: 'Perfil 2 · Asset journey',
      title: 'Conecte sua empresa aos investidores certos sem ruido.',
      summary:
        'A demo cobre o CTA /sell-raise, o onboarding com dados da empresa, a geracao automática do dossier e o primeiro acesso ao MRS.',
      ctaPrimary: { key: 'signup', label: 'Cadastrar minha empresa', href: '/demo/asset/signup' },
      ctaSecondary: { key: 'mrs', label: 'Ver MRS mockado', href: '/demo/asset/mrs' },
      stats: [
        { label: 'Investidores ativos buscando', value: '96', helper: 'em setores aderentes' },
        { label: 'Projetos em Radar Mary', value: '38', helper: 'visiveis na rede' },
        { label: 'Tempo para teaser inicial', value: '< 10 min', helper: 'com Mary AI' },
      ],
      previewPanels: [
        {
          title: 'Teaser e dossier automaticos',
          body: 'Ao concluir o onboarding, a Mary gera resumo executivo, SWOT, prompts de teaser e um MRS inicial.',
          badges: ['Teaser', 'SWOT', 'Dossier'],
        },
        {
          title: 'Privacidade controlada',
          body: 'Cada projeto pode ser Privado, Restrito ou Radar Mary. Tudo fica mockado na vista do projeto Tiger.',
          badges: ['Privado', 'Restrito', 'Radar Mary'],
        },
        {
          title: 'Interesse qualificado',
          body: 'O ativo enxerga quem está seguindo, em teaser, NDA e NBO, com temperatura e visualizações do MRS.',
          badges: ['NDA', 'NBO', 'Temperatura'],
        },
      ],
    },
    signup: {
      title: 'Cadastro do ativo',
      summary:
        'O pré-cadastro combina identificação do responsável com dados institucionais e garante uma base limpa para o onboarding da empresa.',
      validations: [
        'Email corporativo validado',
        'Website e CNPJ usados como mae da informacao',
        'Codigo MFA por WhatsApp',
        'Sessão persistida após email magic link',
      ],
      fields: [
        { label: 'Nome completo do responsável', value: 'Anderson Cassio' },
        { label: 'E-mail profissional', value: 'anderson@tigerlearning.com.br' },
        { label: 'Senha', value: 'Tiger!2026#deal' },
        { label: 'Confirmação de senha', value: 'Tiger!2026#deal' },
        { label: 'WhatsApp para MFA', value: '+55 11 97777-1188' },
        { label: 'Website institucional', value: 'https://tigerlearning.com.br' },
      ],
    },
    onboarding: {
      title: 'Onboarding do ativo',
      summary:
        'O fluxo cobre informações do negócio, objetivo da transação, faixa financeira, advisor e definição do codinome do projeto.',
      steps: [
        {
          id: 'step-1',
          title: 'Passo 1 - Conte-nos um pouco sobre sua empresa.',
          description: 'Dados básicos e narrativos da empresa.',
          fields: [
            { label: 'Razao social / nome fantasia', value: 'Tiger Learning S.A.' },
            { label: 'CNPJ', value: '12.345.678/0001-90' },
            { label: 'Setores', value: ['Edtech', 'Corporate Learning', 'B2B2C'], kind: 'tags' },
            { label: 'Público alvo', value: ['B2B', 'B2B2C'], kind: 'tags' },
            { label: 'Descrição do negócio', value: 'Plataforma de treinamento corporativo com motor de IA para jornada de aprendizagem e analytics.', kind: 'textarea' },
            { label: 'Objetivo principal', value: 'Venda integral com possibilidade de permanência da gestão por transição.' },
            { label: 'Motivação da transação', value: 'Escalar internacionalmente com parceiro estratégico e organizar sucessão dos fundadores.', kind: 'textarea' },
          ],
        },
        {
          id: 'step-2',
          title: 'Passo 2 - Forneça alguns dados mínimos para matching',
          description: 'Dados privados que so serao abertos conforme autorizacao e fase.',
          fields: [
            { label: 'ROB mínimo / máximo', value: ['USD 24M', 'USD 32M'], kind: 'tags' },
            { label: 'EBITDA % atual', value: '14%' },
            { label: 'Valuation alvo', value: 'USD 48M' },
            { label: 'Participação alvo', value: '100%' },
          ],
        },
        {
          id: 'step-3',
          title: 'Passo 3 - Quem está ao seu lado nessa jornada?',
          description: 'Definicao de apoio externo e responsabilidades.',
          fields: [
            { label: 'Ja possui advisor contratado?', value: true, kind: 'boolean' },
            { label: 'Advisor principal', value: 'North Advisors · sell-side' },
            { label: 'Email do advisor', value: 'rafael@northadvisors.com' },
            { label: 'Precisa de apoio adicional da Mary?', value: 'Somente para materials e outreach internacional.' },
          ],
        },
        {
          id: 'step-4',
          title: 'Passo 4 - Último passo para sua segurança e confidencialidade',
          description: 'Codinome, aceite e privacidade inicial.',
          fields: [
            { label: 'Codinome do projeto', value: 'Tiger' },
            { label: 'Visibilidade inicial', value: 'Radar Mary' },
            { label: 'Aceite de termos', value: true, kind: 'checkbox' },
          ],
        },
      ],
      completionTitle: 'Cadastro finalizado com sucesso',
      completionBody:
        'Seu projeto foi configurado e protegido na Mary.\n\nAgora você já pode acessar e ver seu Market Readiness Score (MRS).',
      completionHref: '/demo/asset/mrs',
      completionCta: 'Ver meu MRS',
    },
    dashboard: {
      title: 'Cockpit do ativo',
      summary:
        'Visão executiva do MRS, interesse dos investidores, tarefas de prontidão e status dos materiais do projeto.',
      metrics: [
        { label: 'MRS atual', value: '72', helper: 'inicial após onboarding' },
        { label: 'Investidores seguindo', value: '15', helper: 'sinal de mercado' },
        { label: 'NDA ativos', value: '5', helper: '3 acessando MRS' },
        { label: 'Docs compartilhados', value: '24', helper: 'entre MRS e + Info' },
      ],
      panels: [
        {
          title: 'Projeto Tiger pronto para radar',
          body: 'O projeto está publicado em Radar Mary, com teaser, valuation, deck e mapa de investidores interessados.',
          badges: ['Radar Mary', 'Tiger', '72/100'],
        },
        {
          title: 'Ações recomendadas',
          body: 'Completar tax package, publicar novo deck e responder perguntas abertas dos investidores melhora score e conversão.',
          bullets: ['Subir docs fiscais', 'Revisar deck/IM', 'Responder Q&A do Fundo Atlas'],
        },
        {
          title: 'Operacao com advisor',
          body: 'North Advisors opera a camada sell-side. A Mary fica como sistema operacional do fluxo, documentos e matching.',
          badges: ['Advisor sell-side', 'Workflow', 'Q&A'],
        },
      ],
      aiQueue: [
        'Gerar nova versão do teaser com foco em consolidação regional.',
        'Atualizar SWOT do dossier com base no onboarding e nas últimas perguntas.',
        'Sugerir quais investidores aderentes priorizar no outreach destá semana.',
      ],
    },
    radar: {
      title: 'Radar do ativo',
      summary:
        'Em vez de oportunidades, o ativo enxerga investidores aderentes ao seu projeto, nível de match, tese declarada e potencial de outreach.',
      selectorLabel: 'Projeto selecionado',
      selectorValues: ['Projeto Tiger'],
      notes: [
        'Investidores seguindo, em teaser, NDA e NBO aparecem agregados no projeto.',
        'O nome do investidor pode levar ao perfil dele dentro da Mary.',
        'A temperatura usa visualização de MRS, etapa atual e tempo desde o ultimo movimento.',
      ],
      matches: [
        {
          title: 'Fundo Atlas',
          body: 'Tese Edtech Growth, cheque USD 5M-35M, match 91. Ja segue o ativo e acessou o teaser.',
          badges: ['Seguindo', 'Teaser', 'Match 91'],
        },
        {
          title: 'Vinci Partners',
          body: 'Family office com tese em software educacional e playbook de consolidação. NDA solicitado.',
          badges: ['NDA', 'LatAm', 'Advisor buy-side'],
        },
        {
          title: 'Advent Intl.',
          body: 'Mandato de crescimento para vertical software. Ainda sem visualização recente do MRS.',
          badges: ['Teaser', 'Sem atividade recente'],
        },
      ],
    },
    feed: {
      title: 'Feed do ativo',
      summary:
        'Atualizacoes operacionais, leitura do MRS, movimentação do projeto e mensagens de investidores convergem em uma única timeline.',
      filters: ['Todos', 'Projeto Tiger', 'Investidores', 'MRS', 'Mary AI'],
      items: [
        {
          id: 'asset-feed-1',
          tag: 'pipeline',
          title: 'Fundo Atlas entrou em NDA no Projeto Tiger',
          body: 'Os passos 1 e 2 do MRS foram compartilhados automaticamente para o investidor.',
          at: '2026-04-10T13:35:00.000Z',
        },
        {
          id: 'asset-feed-2',
          tag: 'mrs',
          title: 'Novo documento financeiro aumentou o score em 4 pontos',
          body: 'A Mary atualizou o readiness score e sugeriu perguntas de follow-up para a gestão.',
          at: '2026-04-10T11:20:00.000Z',
        },
        {
          id: 'asset-feed-3',
          tag: 'alerta',
          title: 'Pergunta aberta de investor relations',
          body: 'O advisor do Fundo Atlas pediu detalhamento de churn por coorte e retencao enterprise.',
          at: '2026-04-10T09:05:00.000Z',
        },
      ],
      aiPrompts: [
        'Resuma o interesse dos investidores por etapa do pipeline.',
        'Preparar resposta para a pergunta de churn enterprise.',
        'Sugerir quais docs faltam para liberar passo 3 do MRS.',
      ],
    },
    mrs: {
      title: 'Market Readiness Score (MRS)',
      summary:
        'Índice de prontidão do ativo para processos de captação e M&A. Avaliação contínua por Mary AI. O workspace organiza documentos, responsáveis e lacunas; abaixo, visão por eixos e passos.',
      score: 72,
      benchmarkScore: null,
      globalStatus: {
        label: 'Em Preparação',
        detail: 'Você subiu 15 itens do total de 180',
      },
      radarAxes: [
        { label: 'Fundamentos', value: 2 },
        { label: 'Financeiro', value: 2 },
        { label: 'Comercial', value: 2 },
        { label: 'Operações', value: 3 },
        { label: 'Pessoas', value: 4 },
        { label: 'Jurídicos', value: 2 },
        { label: 'Planejamento', value: 2 },
        { label: 'Adicionais', value: 1 },
      ],
      dimensions: [
        { label: 'Company basics', value: '86%', helper: 'identidade e narrativa' },
        { label: 'Financial package', value: '73%', helper: 'DFs e KPIs' },
        { label: 'Legal / tax', value: '48%', helper: 'pendências de diligencia' },
        { label: 'Project materials', value: '81%', helper: 'teaser, valuation e deck' },
      ],
      steps: [
        {
          title: 'Passo 1 · Base da empresa',
          body: 'Identidade, tese, público, geografia, narrativa e resumo executivo foram gerados a partir do onboarding.',
          bullets: ['Descrição validada', 'Resumo executivo pronto', 'SWOT inicial pronta'],
        },
        {
          title: 'Passo 2 · Financial snapshot',
          body: 'Receita, EBITDA, crescimento, drivers e estrutura de indicadores foram preenchidos e resumidos.',
          bullets: ['ROB 12 meses', 'Margem EBITDA', 'Drivers de crescimento'],
        },
        {
          title: 'Passo 3 · Tax and legal',
          body: 'Camada ainda incompleta. A Mary destaca a falta de documentos fiscais, societários e contratos chave.',
          bullets: ['Contrato social', 'Certidões', 'Mapa tributário'],
        },
        {
          title: 'Passo 4 · Final package',
          body: 'Deck, valuation e materiais extras estão prontos, mas alguns anexos ainda dependem do advisor para revisão final.',
          bullets: ['Deck/IM v1', 'Valuation draft', 'Q&A room'],
        },
      ],
      docs: [
        { name: 'Resumo executivo', status: 'Pronto', note: 'gerado pela Mary AI' },
        { name: 'Teaser v1', status: 'Pronto', note: 'editável com autosave' },
        { name: 'Valuation draft', status: 'Em revisão', note: 'advisor sell-side revisando premissas' },
        { name: 'Tax package', status: 'Pendente', note: 'impacta score e DD' },
      ],
      aiPrompts: [
        'Atualize o teaser com foco em revenue quality.',
        'Liste os documentos que mais impactam o score restante.',
        'Gere briefing para o advisor revisar o valuation.',
      ],
    },
    projects: {
      title: 'Projetos do ativo',
      summary:
        'Cada projeto concentra overview, investidores, materiais e VDR complementar. A demo deixa o Projeto Tiger totalmente navegável.',
      cards: [
        {
          name: 'Projeto Tiger',
          codename: 'tiger',
          objective: 'Venda integral',
          stage: 'Radar Mary',
          visibility: 'Radar Mary',
          summary: 'Mandato sell-side com advisor contratado e readiness score 72.',
          value: 'USD 48M alvo',
          matchScore: 94,
          location: 'São Paulo, SP',
          typeLabel: 'Private Equity',
        },
        {
          name: 'Projeto Cedar',
          codename: 'cedar',
          objective: 'Captacao',
          stage: 'Restrito',
          visibility: 'Restrito',
          summary: 'Projeto confidencial para rodada de crescimento, ainda fora do radar geral.',
          value: 'USD 12M alvo',
          matchScore: 71,
          location: 'Curitiba, PR',
          typeLabel: 'Captação',
        },
      ],
    },
    project: {
      codename: 'tiger',
      title: 'Projeto Tiger · área completa do ativo',
      summary: [
        {
          title: 'Dados do projeto',
          body: 'Inicio 10/01/2026, tipo venda integral, valor alvo USD 48M, participacao 100% e advisor principal North Advisors.',
          badges: ['Tiger', 'Venda integral', 'Radar Mary'],
        },
        {
          title: 'Visibilidade',
          body: 'O mock deixa explícita a política Privado, Restrito e Radar Mary para demonstrar governanca e controle de compartilhamento.',
          badges: ['Privado', 'Restrito', 'Radar Mary'],
        },
      ],
      tabs: [
        {
          id: 'summary',
          label: 'Resumo',
          intro: 'Snapshot do projeto e estado atual do mandato.',
          panels: [
            {
              title: 'Resumo executivo',
              body: 'Tiger Learning opera software e conteúdo para treinamento corporativo, com receita recorrente, clientes enterprise e expansão na América Latina.',
              bullets: ['Receita 2025: USD 28M', 'Crescimento anual: 24%', 'EBITDA: 14%'],
            },
          ],
        },
        {
          id: 'investors',
          label: 'Investidores',
          intro: 'Tabela espelhada com estágio, temperatura, docs legais e email.',
          table: {
            columns: ['Investidor', 'Responsável', 'Etapa', 'Tempo NDA', 'Temperatura', 'Legal Docs', 'Email'],
            rows: [
              ['BTG Pactual', 'João Silva', 'NBO', '4d', '3 visualizações MRS', 'NDA / NBO / SPA', 'Enviar'],
              ['Vinci Partners', 'Ana Costa', 'NDA', '90d', '12 visualizações MRS', 'NDA / NBO / SPA', 'Enviar'],
              ['Advent Intl.', 'Pedro Melo', 'NDA', '14d', '0 visualizações MRS', 'NDA / NBO / SPA', 'Enviar'],
            ],
          },
        },
        {
          id: 'teaser',
          label: 'Teaser',
          intro: 'Mesma logica visual de deck e valuation, com prompt e conteúdo diferentes.',
          panels: [
            {
              title: 'Teaser v1',
              body: 'Versão inicial gerada automaticamente pela Mary AI. Traz capa, mercado, detalhes do negócio e dados-chave.',
              bullets: ['Narrativa resumida', 'Mercado alvo', 'Drivers de valor', 'Pontos de destaque'],
            },
          ],
        },
        {
          id: 'valuation',
          label: 'Valuation',
          intro: 'Premissas financeiras, intervalo de valor e racional da transação.',
          panels: [
            {
              title: 'Valuation draft',
              body: 'DCF + multiplos de comparáveis, com sensibilidade por churn, crescimento e margem EBITDA.',
              bullets: ['Base case: USD 48M', 'Bull case: USD 58M', 'Bear case: USD 39M'],
            },
          ],
        },
        {
          id: 'deck',
          label: 'Deck/IM',
          intro: 'Material mais completo para outreach e diligencia inicial.',
          panels: [
            {
              title: 'Deck/IM v1',
              body: 'Estrutura com narrativa do mercado, tese de investimento, produtos, unit economics, GTM e roadmap.',
              bullets: ['Problema e solução', 'Tamanho de mercado', 'KPIs e unit economics'],
            },
          ],
        },
        {
          id: 'info',
          label: '+ Info',
          intro: 'VDR complementar para pedidos customizados do processo.',
          docs: [
            { name: 'Data room adicional', status: 'Ativo', note: 'docs extras de M&A e Q&A' },
            { name: 'Q&A de investidores', status: 'Ativo', note: 'respostas por tema e prioridade' },
            { name: 'Documentos customizados', status: 'Ativo', note: 'materiais sob demanda' },
          ],
        },
      ],
    },
    settings: {
      title: 'Configurações',
      summary:
        'Conta do responsável pela empresa, faturamento do workspace Mary e equipe com acesso ao projeto e ao MRS. Demonstração sem backend.',
      account: {
        intro: 'Identidade, segurança e preferências ligadas à Tiger Learning.',
        profile: [
          { label: 'Nome', value: 'Anderson Cassio' },
          { label: 'E-mail', value: 'anderson@tigerlearning.com.br' },
          { label: 'Cargo', value: 'CEO' },
          { label: 'WhatsApp (MFA)', value: '+55 11 97777-1188' },
        ],
        security: [
          {
            title: 'Autenticação',
            body: 'MFA por WhatsApp ativo. Sessão atual iniciada neste dispositivo (demo).',
            badges: ['MFA', 'Magic link'],
          },
        ],
        preferences: [
          { label: 'Idioma', value: 'Português (Brasil)' },
          { label: 'Fuso', value: 'America/Sao_Paulo' },
          { label: 'Notificar novo interesse no Radar', value: true, kind: 'boolean' },
          { label: 'Resumo semanal de MRS', value: true, kind: 'boolean' },
        ],
        organization: {
          title: 'Organização',
          body: 'Tiger Learning S.A. · CNPJ 12.345.678/0001-90. Dados alinhados ao onboarding e ao mandato sell-side.',
          badges: ['Asset', 'Radar Mary'],
        },
      },
      billing: {
        plan: { name: 'Mary Growth', status: 'Em trial', renewal: 'Trial até 01/06/2026' },
        usage: [
          { label: 'Projetos ativos', value: '2 / 5', helper: 'inclui Tiger e Cedar' },
          { label: 'Usuários', value: '3 / 10', helper: 'convites internos' },
          { label: 'Armazenamento VDR', value: '12 / 50 GB', helper: 'documentos do MRS' },
        ],
        payment: [
          { label: 'Método', value: 'A definir após trial' },
          { label: 'Próxima etapa', value: 'Upgrade para Mary Growth Plus' },
        ],
        invoices: {
          columns: ['Data', 'Descrição', 'Valor', 'Status'],
          rows: [['—', 'Nenhuma fatura no trial', '—', '—']],
        },
        fiscalNote:
          'Após contratação, NF-e e dados cadastrais da empresa serão emitidos conforme CNPJ cadastrado (demo).',
      },
      team: {
        members: {
          columns: ['Nome', 'E-mail', 'Papel', 'Status'],
          rows: [
            ['Anderson Cassio', 'anderson@tigerlearning.com.br', 'Admin', 'Ativo'],
            ['CFO Tiger', 'cfo@tigerlearning.com.br', 'Financeiro', 'Ativo'],
            ['North Advisors', 'rafael@northadvisors.com', 'Advisor externo', 'Somente leitura'],
          ],
        },
        rolesHelp:
          'Admin publica materiais e convida investidores; Financeiro acompanha faturamento; Advisor externo enxerga o pipeline acordado.',
        externalNote: 'North Advisors aparece como contato sell-side vinculado ao mandato Tiger.',
      },
    },
  },
  advisor: {
    profile: 'advisor',
    label: 'Advisor',
    slug: 'advisor',
    accent: 'from-[#1f2948] via-[#31467b] to-[#d9d7c6]',
    tone: 'curadoria, execução e reputação',
    audience: 'buy-side, sell-side e boutiques setoriais',
    publicFlow: [
      { key: 'landing', label: 'Landing /advise', href: '/demo/advisor' },
      { key: 'signup', label: 'Cadastro', href: '/demo/advisor/signup' },
      { key: 'onboarding', label: 'Onboarding', href: '/demo/advisor/onboarding' },
    ],
    appFlow: [
      { key: 'dashboard', label: 'Dashboard', href: '/demo/advisor/dashboard' },
      { key: 'radar', label: 'Radar', href: '/demo/advisor/radar' },
      { key: 'feed', label: 'Feed', href: '/demo/advisor/feed' },
      { key: 'projects', label: 'Projetos', href: '/demo/advisor/projects' },
      { key: 'settings', label: 'Configurações', href: '/demo/advisor/settings' },
      { key: 'profile', label: 'Perfil', href: '/demo/advisor/profile' },
    ],
    landing: {
      eyebrow: 'Perfil 3 · Advisor journey',
      title: 'Assuma mandatos aderentes e opere deals com contexto completo.',
      summary:
        'A jornada do advisor combina prova de track record, onboarding por especialidade e uma área logada focada em mandatos, feed e Mary AI operacional.',
      ctaPrimary: { key: 'signup', label: 'Solicitar acesso advisor', href: '/demo/advisor/signup' },
      ctaSecondary: { key: 'dashboard', label: 'Ver dashboard', href: '/demo/advisor/dashboard' },
      stats: [
        { label: 'Mandatos ativos', value: '14', helper: 'base da demo advisor' },
        { label: 'Deals fechados YTD', value: '5', helper: 'tombstones simulados' },
        { label: 'Especialidades mapeadas', value: '9', helper: 'setores e estágios' },
      ],
      previewPanels: [
        {
          title: 'Curadoria explícita',
          body: 'O cadastro exige tipo de advisory, lado de atuação, anos de experiência e track record verificavel.',
          badges: ['Track record', 'Side', 'Team size'],
        },
        {
          title: 'Mandatos com contexto',
          body: 'O advisor entra em deals já contextualizados com tese, readiness, materiais e Q&A, sem depender de troca difusa por email.',
          badges: ['Mandatos', 'Contexto', 'Q&A'],
        },
        {
          title: 'Mary AI operacional',
          body: 'Fila de trabalho com rascunhos de CIM, respostas de Q&A, outreach e monitoramento de conflitos.',
          badges: ['CIM', 'Conflict check', 'Workflow'],
        },
      ],
    },
    signup: {
      title: 'Cadastro do advisor',
      summary:
        'A porta de entrada pede identificação profissional e credenciais institucionais para construir um perfil de curadoria confiável.',
      validations: [
        'Email corporativo e website validados',
        'LinkedIn e nome da boutique obrigatorios',
        'MFA por WhatsApp',
        'Acesso liberado para onboarding após verificacao inicial',
      ],
      fields: [
        { label: 'Nome do responsável', value: 'Rafael North' },
        { label: 'Email profissional', value: 'rafael@northadvisors.com' },
        { label: 'WhatsApp', value: '+55 11 96666-2233' },
        { label: 'Nome da consultoria', value: 'North Advisors' },
        { label: 'Website', value: 'https://northadvisors.com' },
        { label: 'LinkedIn', value: 'https://www.linkedin.com/company/north-advisors' },
      ],
    },
    onboarding: {
      title: 'Onboarding do advisor',
      summary:
        'Os passos mockados cobrem identidade, track record, preferências operacionais e termos de conflito para liberar o advisor na rede.',
      steps: [
        {
          id: 'step-1',
          title: 'Step 1 · Identidade consultiva',
          description: 'Tipo, lado de atuação, tamanho da equipe e experiência.',
          fields: [
            { label: 'Tipo de advisory', value: ['Boutique M&A', 'Corporate finance'], kind: 'tags' },
            { label: 'Side principal', value: ['Sell-side', 'Buy-side'], kind: 'tags' },
            { label: 'Tamanho da equipe', value: '14 pessoas' },
            { label: 'Anos de experiência', value: '11 anos' },
          ],
        },
        {
          id: 'step-2',
          title: 'Step 2 · Track record e curadoria',
          description: 'Deals, setores, estágios e geografias.',
          fields: [
            { label: 'Deals nos últimos 3 anos', value: '7' },
            { label: 'Tombstone URL', value: 'https://northadvisors.com/tombstones' },
            { label: 'Setores', value: ['Edtech', 'Fintech', 'Healthcare'], kind: 'tags' },
            { label: 'Estagios', value: ['Teaser', 'NDA', 'DD/SPA'], kind: 'tags' },
            { label: 'Ticket medio', value: 'USD 10M - 80M' },
            { label: 'Geografias', value: ['Brasil', 'LatAm'], kind: 'tags' },
          ],
        },
        {
          id: 'step-3',
          title: 'Step 3 · Preferências operacionais',
          description: 'Capacidade, fees e postura comercial.',
          fields: [
            { label: 'Mandatos simultâneos máximos', value: '6' },
            { label: 'Modelo de fee', value: 'Retainer + success fee' },
            { label: 'Origina deals proprios?', value: true, kind: 'boolean' },
            { label: 'Aceita ativos sem advisor?', value: true, kind: 'boolean' },
          ],
        },
        {
          id: 'step-4',
          title: 'Step 4 · Trial e conflitos',
          description: 'Governanca final para operar na rede.',
          fields: [
            { label: 'Periodo trial', value: '30 dias' },
            { label: 'Aceite de política de conflitos', value: true, kind: 'checkbox' },
          ],
        },
      ],
      completionTitle: 'Perfil advisor configurado',
      completionBody:
        'O advisor agora vê mandatos aderentes, fila de Mary AI e cards de projeto com contexto completo.',
      completionHref: '/demo/advisor/dashboard',
      completionCta: 'Abrir dashboard',
    },
    dashboard: {
      title: 'Dashboard do advisor',
      summary:
        'Visão operacional da carteira, mandatos quentes, deals em DD e tarefas em que a Mary AI acelera execução com revisão humana.',
      metrics: [
        { label: 'Mandatos ativos', value: '3', helper: '2 sell-side e 1 buy-side' },
        { label: 'Deals em DD', value: '1', helper: 'Projeto Tiger' },
        { label: 'Closed YTD', value: '5', helper: 'prova reputacional' },
        { label: 'Oportunidades novas', value: '2', helper: 'matching de mandato' },
      ],
      panels: [
        {
          title: 'Mandatos priorizados',
          body: 'Projeto Tiger, Projeto Aurora e Atlas Growth aparecem como foco da semana com work queue já sugerida.',
          badges: ['Tiger', 'Aurora', 'Atlas Growth'],
        },
        {
          title: 'Mary AI como copiloto',
          body: 'Rascunho de CIM, resposta de Q&A, outreach para investidor e monitoramento de conflito ficam centralizados na mesa do advisor.',
          bullets: ['Rascunhar deck/IM', 'Responder churn question', 'Checar conflito com Family Office Horizonte'],
        },
      ],
      aiQueue: [
        'Gerar rascunho de CIM do Projeto Tiger.',
        'Montar email de update semanal para Fundo Atlas e Vinci Partners.',
        'Consolidar Q&A pendente em um brief para a gestão.',
      ],
    },
    radar: {
      title: 'Radar do advisor',
      summary:
        'O radar do advisor mostra ativos e investidores aderentes aos setores e tickets em que a boutique opera, além de convites para novos mandatos.',
      selectorLabel: 'Filtros ativos',
      selectorValues: ['Edtech', 'Fintech', 'USD 10M - 80M'],
      notes: [
        'O advisor pode atuar em sell-side e buy-side.',
        'Mandatos não assumidos ainda aparecem como oportunidade de business development.',
        'A Mary sinaliza conflitos e lacunas antes do aceite.',
      ],
      matches: [
        {
          title: 'Projeto Aurora · oportunidade de mandato',
          body: 'Healthtech em captação buscando advisor para material e outreach. Match alto pela experiência em growth e ticket.',
          badges: ['Mandato sugerido', 'Growth equity', 'Sem conflito'],
        },
        {
          title: 'Atlas Growth · precisa de advisor buy-side',
          body: 'Investidor concluiu onboarding e convidou advisor para acompanhar tese Edtech Growth.',
          badges: ['Buy-side', 'Convite pendente', 'Edtech'],
        },
      ],
    },
    feed: {
      title: 'Feed do advisor',
      summary:
        'Mensagens operacionais, updates de mandatos, perguntas de investidores e fila da Mary AI aparecem em um único stream de trabalho.',
      filters: ['Todos', 'Tiger', 'Atlas Growth', 'Q&A', 'Mary AI'],
      items: [
        {
          id: 'advisor-feed-1',
          tag: 'convite',
          title: 'Atlas Growth convidou você como advisor buy-side',
          body: 'A tese Edtech Growth foi compartilhada com contexto financeiro e geográfico.',
          at: '2026-04-10T14:05:00.000Z',
        },
        {
          id: 'advisor-feed-2',
          tag: 'pipeline',
          title: 'Projeto Tiger recebeu nova pergunta de diligencia',
          body: 'Fundo Atlas pediu detalhes sobre churn enterprise e expansion revenue.',
          at: '2026-04-10T11:45:00.000Z',
        },
        {
          id: 'advisor-feed-3',
          tag: 'alerta',
          title: 'Mary AI sinalizou possível conflito em novo mandato',
          body: 'Oportunidade healthtech cruza com mandato antigo da boutique e pede revisão antes do aceite.',
          at: '2026-04-10T08:55:00.000Z',
        },
      ],
      aiPrompts: [
        'Agrupar todas as perguntas abertas do Projeto Tiger.',
        'Gerar minuta de update semanal aos investidores ativos.',
        'Revisar conflitos antes de aceitar o mandato Aurora.',
      ],
    },
    projects: {
      title: 'Mandatos e projetos',
      summary:
        'A tela concentra os projetos em que o advisor está operando ou foi convidado a operar, com status, lado de atuação e próximo passo.',
      cards: [
        {
          name: 'Projeto Tiger',
          codename: 'tiger',
          objective: 'Sell-side',
          stage: 'NDA / DD',
          visibility: 'Radar Mary',
          summary: 'Mandato ativo com material completo, Q&A aquecido e investidores em NDA.',
          value: 'USD 48M alvo',
          matchScore: 88,
          location: 'São Paulo, SP',
          typeLabel: 'Sell-side',
        },
        {
          name: 'Atlas Growth',
          codename: 'atlas-growth',
          objective: 'Buy-side',
          stage: 'Convite',
          visibility: 'Restrito',
          summary: 'Advisor convidado para operar tese Edtech Growth e pipeline do investidor.',
          value: 'USD 5M - 35M cheque',
          matchScore: 76,
          location: 'Rio de Janeiro, RJ',
          typeLabel: 'Buy-side',
        },
      ],
    },
    settings: {
      title: 'Configurações',
      summary:
        'Conta do consultor, faturamento da assinatura Mary da boutique e equipe com acesso a mandatos. Conteúdo ilustrativo.',
      account: {
        intro: 'Perfil profissional e segurança do usuário North Advisors.',
        profile: [
          { label: 'Nome', value: 'Rafael North' },
          { label: 'E-mail', value: 'rafael@northadvisors.com' },
          { label: 'Função', value: 'Managing Director' },
          { label: 'Telefone', value: '+55 11 97700-4411' },
        ],
        security: [
          {
            title: 'Autenticação',
            body: 'MFA ativo. Logins recentes simulados a partir de São Paulo e Curitiba.',
            badges: ['MFA', 'Auditoria'],
          },
        ],
        preferences: [
          { label: 'Idioma', value: 'Português (Brasil)' },
          { label: 'Fuso', value: 'America/Sao_Paulo' },
          { label: 'Digest de mandatos', value: true, kind: 'boolean' },
          { label: 'Alertas de conflito de interesse', value: true, kind: 'boolean' },
        ],
        organization: {
          title: 'Boutique',
          body: 'North Advisors · CNPJ 98.765.432/0001-10. Conta usada em mandatos sell-side e buy-side na Mary.',
          badges: ['Advisor', 'Verificado'],
        },
      },
      billing: {
        plan: { name: 'Mary Advisor Pro', status: 'Ativo', renewal: 'Renovação em 20/06/2026' },
        usage: [
          { label: 'Mandatos ativos', value: '6 / 12', helper: 'limite do plano' },
          { label: 'Assentos', value: '8 / 20', helper: 'equipe + convidados' },
          { label: 'Armazenamento', value: '24 / 80 GB', helper: 'data rooms compartilhados' },
        ],
        payment: [
          { label: 'Método', value: 'Transferência · última NF paga' },
          { label: 'Valor mensal', value: 'BRL 7.200,00' },
        ],
        invoices: {
          columns: ['Data', 'Descrição', 'Valor', 'Status'],
          rows: [
            ['05/04/2026', 'Mary Advisor Pro · mensalidade', 'BRL 7.200,00', 'Pago'],
            ['05/03/2026', 'Mary Advisor Pro · mensalidade', 'BRL 7.200,00', 'Pago'],
          ],
        },
        fiscalNote: 'Razão social North Advisors Ltda. NFS-e enviada para financeiro@northadvisors.com (demo).',
      },
      team: {
        members: {
          columns: ['Nome', 'E-mail', 'Papel', 'Status'],
          rows: [
            ['Rafael North', 'rafael@northadvisors.com', 'Admin boutique', 'Ativo'],
            ['Julia Mota', 'julia@northadvisors.com', 'Associada', 'Ativo'],
            ['Estagiário deal', 'deal@northadvisors.com', 'Leitura', 'Ativo'],
          ],
        },
        rolesHelp:
          'Admin gerencia assinatura e convites; Associado opera mandatos; Leitura acompanha Q&A e timeline.',
        externalNote: 'Mandatos como Tiger podem incluir usuários do ativo com permissão limitada (simulado).',
      },
    },
    profilePage: {
      title: 'Perfil do advisor',
      summary:
        'A página compila identidade, track record, preferências operacionais e governanca de conflito para consulta interna e matching.',
      identity: [
        { label: 'Consultoria', value: 'North Advisors' },
        { label: 'Tipo', value: ['Boutique M&A', 'Corporate finance'], kind: 'tags' },
        { label: 'Lado de atuação', value: ['Sell-side', 'Buy-side'], kind: 'tags' },
        { label: 'Equipe', value: '14 pessoas' },
        { label: 'Anos de experiência', value: '11 anos' },
      ],
      trackRecord: [
        { label: 'Deals últimos 3 anos', value: '7' },
        { label: 'Setores', value: ['Edtech', 'Fintech', 'Healthcare'], kind: 'tags' },
        { label: 'Tickets', value: 'USD 10M - 80M' },
        { label: 'Geografias', value: ['Brasil', 'LatAm'], kind: 'tags' },
        { label: 'Tombstone', value: 'northadvisors.com/tombstones' },
      ],
      preferences: [
        { label: 'Mandatos simultâneos máximos', value: '6' },
        { label: 'Aceita ativos sem advisor', value: true, kind: 'boolean' },
        { label: 'Origina deals proprios', value: true, kind: 'boolean' },
        { label: 'Fee model', value: 'Retainer + success fee' },
        { label: 'Conflito policy', value: true, kind: 'checkbox' },
      ],
      aiQueue: [
        'Revisar reputação percebida da boutique com base em tombstones.',
        'Sugerir setores adjacentes para expandir o radar.',
        'Criar one-pager institucional para novos convites.',
      ],
    },
  },
}
