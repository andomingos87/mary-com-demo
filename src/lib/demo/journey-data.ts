export type DemoProfileKey = 'investor' | 'asset' | 'advisor'

export interface DemoField {
  label: string
  type: string
  detail: string
  mockValue: string
}

export interface DemoStep {
  title: string
  route: string
  objective: string
  fields: DemoField[]
  message?: string
  aiAssist?: string
}

export interface DemoMetric {
  label: string
  value: string
}

export interface DemoRecord {
  title: string
  subtitle: string
  badge?: string
  detail?: string
}

export interface DemoTable {
  columns: string[]
  rows: string[][]
}

export interface DemoScreen {
  title: string
  route: string
  goal: string
  highlights: string[]
  metrics?: DemoMetric[]
  records?: DemoRecord[]
  table?: DemoTable
}

export interface DemoNetworkEffect {
  action: string
  effect: string
}

export interface DemoJourney {
  profile: DemoProfileKey
  label: string
  tagline: string
  accent: string
  summary: string
  landingRoute: string
  registerRoute: string
  signupFields: DemoField[]
  onboardingSteps: DemoStep[]
  keyScreens: DemoScreen[]
  networkEffects: DemoNetworkEffect[]
}

export const DEMO_JOURNEYS: DemoJourney[] = [
  {
    profile: 'investor',
    label: 'Investidor',
    tagline: 'Deal flow qualificado, tese estruturada e execucao guiada.',
    accent: 'from-sky-500/20 via-cyan-500/10 to-background',
    summary:
      'Perfil de fundo que entra pela landing publica, completa cadastro com curadoria, cria a primeira tese e chega ao radar com oportunidades aderentes em menos de um minuto.',
    landingRoute: '/invest',
    registerRoute: '/signup?profile=investor',
    signupFields: [
      {
        label: 'Nome completo do responsavel',
        type: 'Texto',
        detail: 'Contato principal do fundo ou veiculo.',
        mockValue: 'Marina Teles',
      },
      {
        label: 'Email profissional',
        type: 'Email',
        detail: 'Somente dominio corporativo.',
        mockValue: 'marina@atlascapital.com.br',
      },
      {
        label: 'WhatsApp / MFA',
        type: 'Telefone',
        detail: 'Usado para segunda camada de autenticacao.',
        mockValue: '+55 (11) 99877-6655',
      },
      {
        label: 'Website institucional',
        type: 'URL',
        detail: 'Mae da informacao para enriquecimento.',
        mockValue: 'https://www.atlascapital.com.br',
      },
      {
        label: 'Tipo de investidor',
        type: 'Select unico',
        detail: 'Segmenta tese e copy do onboarding.',
        mockValue: 'Private Equity',
      },
      {
        label: 'Senha + confirmacao',
        type: 'Senha',
        detail: 'Minimo de 8 caracteres, numero e especial.',
        mockValue: 'Atlas@2026',
      },
    ],
    onboardingSteps: [
      {
        title: 'Step 1 - Criar a primeira tese',
        route: '/onboarding/profile-details',
        objective: 'Definir foco setorial, publico e geografia para o primeiro match.',
        fields: [
          {
            label: 'Nome da empresa / fundo',
            type: 'Texto autofill',
            detail: 'Confirmado a partir do dominio e website.',
            mockValue: 'Atlas Capital Partners',
          },
          {
            label: 'Setores alvo',
            type: 'Multi-select',
            detail: 'Taxonomia Mary / MAICS.',
            mockValue: 'Software B2B, Fintech Infra, Logistics Tech',
          },
          {
            label: 'Publico-alvo da empresa alvo',
            type: 'Multi-select',
            detail: 'Refina matching semantico.',
            mockValue: 'B2B, B2B2C',
          },
          {
            label: 'Geografias prioritarias',
            type: 'Tree multi-select',
            detail: 'Continentes, paises e regioes.',
            mockValue: 'Brasil, Mexico, Chile',
          },
          {
            label: 'Resumo da tese',
            type: 'Textarea',
            detail: 'Maximo de 250 caracteres.',
            mockValue: 'Buscamos ativos growth B2B com software proprietario, margem defensavel e potencial de consolidacao regional.',
          },
        ],
        message:
          'Com base nas informacoes fornecidas, identificamos ativos potencialmente compativeis com seu perfil.',
        aiAssist:
          'Mary AI detecta marca, logo e estrutura institucional a partir do dominio para reduzir friccao no primeiro contato.',
      },
      {
        title: 'Step 2 - Refinar criterios financeiros',
        route: '/onboarding/eligibility-check',
        objective: 'Transformar interesse em radar acionavel com ranges financeiros e operacionais.',
        fields: [
          {
            label: 'ROB minimo e maximo',
            type: 'Range + input',
            detail: 'Receita operacional bruta em USD milhoes.',
            mockValue: 'USD 8M a USD 60M',
          },
          {
            label: 'EBITDA % minimo',
            type: 'Input numerico',
            detail: 'Qualidade minima da operacao.',
            mockValue: '12%',
          },
          {
            label: 'Cheque minimo e maximo',
            type: 'Range + input',
            detail: 'Faixa de investimento do fundo.',
            mockValue: 'USD 5M a USD 25M',
          },
          {
            label: 'Advisor buy-side contratado',
            type: 'Boolean + contato',
            detail: 'Se sim, dispara convite contextual.',
            mockValue: 'Sim - Lucas Brandao / lucas@stratedge.com.br',
          },
          {
            label: 'Termos e privacidade',
            type: 'Checkbox',
            detail: 'Gate final do onboarding.',
            mockValue: 'Aceite confirmado',
          },
        ],
        message:
          'Cadastro finalizado com sucesso. Seu projeto foi configurado e protegido na Mary.',
        aiAssist:
          'No fechamento, a jornada aponta diretamente para o Radar com a tese ja selecionada.',
      },
    ],
    keyScreens: [
      {
        title: 'Radar de Oportunidades',
        route: '/:orgSlug/radar',
        goal: 'Gerar o momento aha com ativos anonimizados aderentes a tese ativa.',
        highlights: [
          'Primeira tese criada entra selecionada por padrao.',
          'CTAs previstos: ver teaser, solicitar NDA, acompanhar ativo.',
          'Teaser muda conforme o ativo e pre-cadastrado, cadastrado ou possui advisor.',
        ],
        metrics: [
          { label: 'Tese ativa', value: 'Growth B2B LatAm' },
          { label: 'Matches aderentes', value: '12' },
          { label: 'Score medio', value: '81' },
        ],
        records: [
          {
            title: 'Projeto Aurora',
            subtitle: 'B2B SaaS - match 89',
            badge: 'Teaser completo',
            detail: 'CTA liberado para ver teaser, solicitar NDA e acompanhar.',
          },
          {
            title: 'Codinome Vesper',
            subtitle: 'Fintech B2C - match 74',
            badge: 'Advisor presente',
            detail: 'Detalhe adicional com opcao de contatar advisor sell-side.',
          },
          {
            title: 'Projeto Neblina',
            subtitle: 'Healthtech - match 61',
            badge: 'Pre-cadastro',
            detail: 'Mostra teaser basico e mensagem de readiness ainda indisponivel.',
          },
        ],
      },
      {
        title: 'Teses',
        route: '/:orgSlug/thesis',
        goal: 'Gerenciar multiplas teses, uma ativa por vez, com profundidade suficiente para matching.',
        highlights: [
          'Mesmo modelo do onboarding em tres blocos.',
          'Suporta edicao, ativacao exclusiva e exclusao.',
          'Cada tese pode disparar nova busca de oportunidades.',
        ],
        metrics: [
          { label: 'Teses cadastradas', value: '3' },
          { label: 'Ativa agora', value: '1' },
          { label: 'Crit. preenchidos', value: '14/14' },
        ],
        records: [
          {
            title: 'Growth B2B LatAm',
            subtitle: 'SaaS vertical com margem defensavel',
            badge: 'Ativa',
          },
          {
            title: 'Fintech infra Brasil',
            subtitle: 'Plays com recorrencia e compliance forte',
            badge: 'Inativa',
          },
        ],
      },
      {
        title: 'Pipeline',
        route: '/:orgSlug/pipeline',
        goal: 'Acompanhar deals por fase juridica, do teaser ao closing.',
        highlights: [
          'O investidor e o advisor buy-side movem o pipeline.',
          'Fases canonicas: teaser, NDA, pre-DD, IoI/NBO, DD/SPA, signing, CPs, closing.',
          'Eventos do pipeline retroalimentam feed, VDR e notificacoes.',
        ],
        table: {
          columns: ['Projeto', 'Estagio', 'Proxima acao', 'Owner'],
          rows: [
            ['Projeto Tiger', 'NDA', 'Assinar NDA e liberar VDR', 'Lucas Brandao'],
            ['Projeto Orion', 'DD/SPA', 'Responder lista de Q&A', 'Marina Teles'],
            ['Projeto Atlas South', 'Closing', 'Gerar tombstone', 'Mary AI + time'],
          ],
        },
      },
      {
        title: 'Feed e VDR do investidor',
        route: '/:orgSlug/feed e /:orgSlug/projects/:codename/vdr',
        goal: 'Centralizar atualizacoes dos ativos seguidos e acesso ao material apos NDA.',
        highlights: [
          'Feed mostra eventos por ativo acompanhado.',
          'VDR compartilhado libera itens e docs, mas zera colunas de gestao do ativo.',
          'Mary AI responde perguntas em linguagem natural sobre o data room.',
        ],
        records: [
          {
            title: 'Ativo Vesper atualizou o MRS',
            subtitle: 'Readiness subiu para 72',
            badge: 'MRS',
          },
          {
            title: 'NDA em analise',
            subtitle: 'Projeto Aurora aguardando assinatura final',
            badge: 'Pipeline',
          },
        ],
      },
    ],
    networkEffects: [
      {
        action: 'Cadastrar e ativar a primeira tese',
        effect: 'Liga o radar e comeca a gerar deal flow qualificado.',
      },
      {
        action: 'Assinar NDA de um ativo',
        effect: 'Cria sinal positivo para o ativo e abre VDR compartilhado.',
      },
      {
        action: 'Indicar advisor buy-side',
        effect: 'Puxa um novo advisor para a rede com contexto pronto.',
      },
    ],
  },
  {
    profile: 'asset',
    label: 'Ativo',
    tagline: 'Projeto protegido, MRS visivel e radar do lado da empresa.',
    accent: 'from-emerald-500/20 via-lime-500/10 to-background',
    summary:
      'Perfil de empresa que entra via landing sell-side, enriquece dados por CNPJ, define o projeto, recebe um MRS inicial e passa a enxergar investidores aderentes.',
    landingRoute: '/sell-raise',
    registerRoute: '/signup?profile=asset',
    signupFields: [
      {
        label: 'Nome completo do responsavel',
        type: 'Texto',
        detail: 'Principal responsavel pelo ativo.',
        mockValue: 'Renata Moraes',
      },
      {
        label: 'Email profissional',
        type: 'Email',
        detail: 'Dominio corporativo obrigatorio.',
        mockValue: 'renata@novaverde.com.br',
      },
      {
        label: 'WhatsApp / MFA',
        type: 'Telefone',
        detail: 'Canal para OTP e alertas de interesse.',
        mockValue: '+55 (11) 98766-5544',
      },
      {
        label: 'Website institucional',
        type: 'URL',
        detail: 'Aciona lookup automatico e pre-preenchimento.',
        mockValue: 'https://www.novaverde.com.br',
      },
      {
        label: 'Senha + confirmacao',
        type: 'Senha',
        detail: 'Mesmo padrao forte dos demais perfis.',
        mockValue: 'Nova@Deal2026',
      },
    ],
    onboardingSteps: [
      {
        title: 'Step 1 - Dados da empresa',
        route: '/onboarding/cnpj-input + /onboarding/data-confirmation',
        objective: 'Enriquecer cadastro com dados oficiais e narrativa comercial minima.',
        fields: [
          {
            label: 'CNPJ',
            type: 'Input formatado',
            detail: 'Busca razao social, CNAEs, endereco e quadro societario.',
            mockValue: '12.345.678/0001-90',
          },
          {
            label: 'Setores de atuacao',
            type: 'Multi-select',
            detail: 'Taxonomia com sugestao da IA.',
            mockValue: 'Agritech, Supply Chain Software',
          },
          {
            label: 'Publico-alvo',
            type: 'Multi-select',
            detail: 'Base para matching semantico.',
            mockValue: 'B2B, B2G',
          },
          {
            label: 'Descricao da empresa',
            type: 'Textarea',
            detail: 'Resumo pre-gerado pela Mary AI e editavel.',
            mockValue: 'A Nova Verde digitaliza a cadeia agricola com software de rastreabilidade e analytics para distribuidores e cooperativas.',
          },
          {
            label: 'Objetivo principal',
            type: 'Select unico',
            detail: 'Direciona copy e criacao do projeto.',
            mockValue: 'Captacao de investimento',
          },
          {
            label: 'Motivo principal',
            type: 'Select unico',
            detail: 'Motivacao central da transacao.',
            mockValue: 'Escalar comercial e consolidar mercado',
          },
        ],
        message:
          'Com base nas informacoes fornecidas, identificamos investidores potencialmente compativeis com seu perfil.',
        aiAssist:
          'Mary AI sugere descricao, logo, dossie inicial e consolidacao de dados publicos sem exigir esforco manual.',
      },
      {
        title: 'Step 2 - Dados minimos para matching',
        route: '/onboarding/asset-matching-data',
        objective: 'Transformar o cadastro em oportunidade comparavel com teses de investidores.',
        fields: [
          {
            label: 'ROB minimo e maximo',
            type: 'Range + input',
            detail: 'Receita operacional dos ultimos 12 meses.',
            mockValue: 'USD 6M a USD 11M',
          },
          {
            label: 'EBITDA % minimo',
            type: 'Input numerico',
            detail: 'Indicador de eficiencia operacional.',
            mockValue: '14%',
          },
          {
            label: 'Valor esperado da transacao',
            type: 'Range em USD',
            detail: 'Ajuda no fit com cheque do investidor.',
            mockValue: 'USD 18M a USD 25M',
          },
          {
            label: 'Participacao negociada',
            type: 'Range',
            detail: 'Percentual da empresa em discussao.',
            mockValue: '18% a 24%',
          },
        ],
        message:
          'Com base nesses dados, identificamos 9 investidores na Mary com teses compativeis com seu perfil.',
      },
      {
        title: 'Step 3 - Advisors e apoio operacional',
        route: '/onboarding/asset-team',
        objective: 'Definir se o ativo ja possui assessoria ou precisa entrar no marketplace de advisors.',
        fields: [
          {
            label: 'Possui assessores contratados?',
            type: 'Boolean',
            detail: 'Gatilho de rede para convidar advisors ou abrir demanda.',
            mockValue: 'Sim',
          },
          {
            label: 'Advisor indicado',
            type: 'Nome + email',
            detail: 'Convite automatico contextualizado.',
            mockValue: 'Patricia Lessa / patricia@marstone.com.br',
          },
          {
            label: 'Busca recomendacoes da Mary',
            type: 'Boolean',
            detail: 'Se nao tiver advisor, aciona base de especialistas.',
            mockValue: 'Nao - ja possui assessoria',
          },
        ],
        message:
          'Voce esta a um passo de conhecer seu MRS e conectar-se com investidores qualificados.',
      },
      {
        title: 'Step 4 - Codinome, seguranca e ativacao',
        route: '/onboarding/asset-codename + /onboarding/eligibility-check',
        objective: 'Criar o projeto em modo protegido e concluir os gates de termos.',
        fields: [
          {
            label: 'Codinome do projeto',
            type: 'String',
            detail: 'Pode ser manual ou sugerido pela Mary.',
            mockValue: 'Projeto Orquidea',
          },
          {
            label: 'Termos e privacidade',
            type: 'Checkbox',
            detail: 'Gate juridico do fluxo.',
            mockValue: 'Aceite confirmado',
          },
        ],
        message:
          'Cadastro finalizado. Seu projeto foi configurado e protegido na Mary.',
        aiAssist:
          'Ao concluir, a Mary gera dossie executivo, SWOT inicial, resumo do ativo e um MRS de partida.',
      },
    ],
    keyScreens: [
      {
        title: 'Market Readiness Score',
        route: '/:orgSlug/mrs',
        goal: 'Virar o centro operacional do ativo com score, gaps e uploads por etapa.',
        highlights: [
          'Roadmap em 4 passos com itens, status, prioridade e gates NDA / NBO.',
          'Upload indexado de documentos e alertas de itens faltantes.',
          'Convite de membros da equipe direto do modulo.',
        ],
        metrics: [
          { label: 'MRS atual', value: '68/100' },
          { label: 'Cobertura L2+', value: '74%' },
          { label: 'Itens criticos', value: '5' },
        ],
        records: [
          {
            title: 'Financeiro e performance',
            subtitle: 'DRE 2024, balanco e cohort pendentes',
            badge: 'Alta prioridade',
          },
          {
            title: 'Societario e governanca',
            subtitle: 'Contrato social e quadro de socios validados',
            badge: 'Completo',
          },
          {
            title: 'Fiscal e regulatorio',
            subtitle: 'Falta certidao negativa federal',
            badge: 'Gate bloqueado',
          },
        ],
      },
      {
        title: 'Radar do Ativo',
        route: '/:orgSlug/radar',
        goal: 'Mostrar investidores aderentes, sinais de interesse e impacto do MRS na visibilidade.',
        highlights: [
          'Visao espelhada do radar do investidor, agora do lado do ativo.',
          'Permite comparar quem aparece com o MRS atual e quem destrava com score maior.',
          'Ativo e advisor podem incluir investidores externos para aumentar a rede.',
        ],
        metrics: [
          { label: 'Investidores aderentes', value: '9' },
          { label: 'Score medio de aderencia', value: '78' },
          { label: 'Novo com MRS 75+', value: '+4 investidores' },
        ],
        records: [
          {
            title: 'Fundo Atlas',
            subtitle: 'Growth equity LatAm - ticket USD 8M a 25M',
            badge: 'Match 91',
          },
          {
            title: 'Family Office Horizonte',
            subtitle: 'Saude, software e infraestrutura leve',
            badge: 'Match 76',
          },
        ],
      },
      {
        title: 'Projetos do Ativo',
        route: '/:orgSlug/projects',
        goal: 'Suportar multiplos mandatos simultaneos com visibilidade controlada.',
        highlights: [
          'Projeto pode ser restrito ou aberto para contas dentro da Mary.',
          'Cada projeto tem codinome, responsaveis, taxonomia e dados financeiros.',
          'A mesma empresa pode operar fundraising e divisional sale em paralelo.',
        ],
        table: {
          columns: ['Codinome', 'Objetivo', 'Visibilidade', 'Status', 'Proximo passo'],
          rows: [
            ['Projeto Orquidea', 'Fundraising', 'Mary', 'NDA', 'Atualizar data room'],
            ['Projeto Jacaranda', 'Venda divisao', 'Restrito', 'Teaser', 'Revisar teaser com advisor'],
          ],
        },
      },
      {
        title: 'Dashboard e notificacoes',
        route: '/:orgSlug/dashboard e /:orgSlug/feed',
        goal: 'Dar tracao semanal, mostrar gaps e manter a empresa engajada.',
        highlights: [
          'Banner orienta o proximo ganho de score.',
          'Feed mistura interesse de investidores, novos docs e alertas de diligencia.',
          'Notificacoes saem por WhatsApp, email e in-app.',
        ],
        records: [
          {
            title: 'Novo interesse de investidor',
            subtitle: 'Fundo Atlas abriu o teaser do projeto',
            badge: 'Pipeline',
          },
          {
            title: 'Documento adicionado ao VDR',
            subtitle: 'Lista de questoes do investidor disponivel',
            badge: 'In-app',
          },
        ],
      },
    ],
    networkEffects: [
      {
        action: 'Melhorar o MRS do projeto',
        effect: 'Eleva o ativo no radar dos investidores e aumenta liquidez.',
      },
      {
        action: 'Indicar advisor ou pedir recomendacao',
        effect: 'Ativa novos advisors no ecossistema com contexto imediato.',
      },
      {
        action: 'Fechar deal e gerar tombstone',
        effect: 'Cria prova social para atrair mais ativos e investidores.',
      },
    ],
  },
  {
    profile: 'advisor',
    label: 'Advisor',
    tagline: 'Mais mandatos, menos operacao repetitiva e IA com governanca.',
    accent: 'from-amber-500/20 via-orange-500/10 to-background',
    summary:
      'Perfil de assessoria que entra por trial ou convite de um ativo, passa por curadoria, declara especialidade e recebe um dashboard inicial com mandatos e oportunidades.',
    landingRoute: '/advise',
    registerRoute: '/signup?profile=advisor',
    signupFields: [
      {
        label: 'Nome completo do responsavel',
        type: 'Texto',
        detail: 'Contato principal da assessoria.',
        mockValue: 'Patricia Lessa',
      },
      {
        label: 'Email profissional',
        type: 'Email',
        detail: 'Curadoria exige dominio corporativo.',
        mockValue: 'patricia@marstone.com.br',
      },
      {
        label: 'WhatsApp / MFA',
        type: 'Telefone',
        detail: 'Canal principal para autenticacao e alertas.',
        mockValue: '+55 (21) 99811-2200',
      },
      {
        label: 'Nome da assessoria',
        type: 'Texto',
        detail: 'Marca que aparecera em convites e track record.',
        mockValue: 'Marstone Advisory',
      },
      {
        label: 'Website institucional',
        type: 'URL',
        detail: 'Base para crawling de tombstones.',
        mockValue: 'https://www.marstone.com.br',
      },
      {
        label: 'LinkedIn institucional',
        type: 'URL',
        detail: 'Refina curadoria e comprova existencia operacional.',
        mockValue: 'https://www.linkedin.com/company/marstone-advisory',
      },
    ],
    onboardingSteps: [
      {
        title: 'Step 1 - Identidade profissional',
        route: '/onboarding/profile-details',
        objective: 'Posicionar a assessoria por atuacao, lado e capacidade operacional.',
        fields: [
          {
            label: 'Tipo de atuacao',
            type: 'Select unico',
            detail: 'Define linguagem e oportunidades.',
            mockValue: 'Boutique M&A',
          },
          {
            label: 'Lados de atuacao',
            type: 'Multi-select',
            detail: 'Sell-side e/ou buy-side, com controle de conflito por projeto.',
            mockValue: 'Sell-side, Buy-side',
          },
          {
            label: 'Tamanho da equipe M&A',
            type: 'Select',
            detail: 'Dimensiona capacidade de mandatos simultaneos.',
            mockValue: '11-20',
          },
          {
            label: 'Anos de experiencia em M&A',
            type: 'Select',
            detail: 'Sinal de senioridade.',
            mockValue: '+10 anos',
          },
        ],
      },
      {
        title: 'Step 2 - Track record e curadoria',
        route: '/onboarding/eligibility-check',
        objective: 'Provar credibilidade do advisor antes de liberacao total.',
        fields: [
          {
            label: 'Deals concluidos (3 anos)',
            type: 'Numerico',
            detail: 'Gate minimo de curadoria.',
            mockValue: '7',
          },
          {
            label: 'URL com tombstones',
            type: 'URL',
            detail: 'Pode ser pagina institucional ou clipping.',
            mockValue: 'https://www.marstone.com.br/deals',
          },
          {
            label: 'Setores de especializacao',
            type: 'Multi-select',
            detail: 'Taxonomia Mary.',
            mockValue: 'Fintech, Healthtech, B2B SaaS',
          },
          {
            label: 'Estagios mais frequentes',
            type: 'Multi-select',
            detail: 'Ajusta oferta de mandatos.',
            mockValue: 'Growth, Maturity, Turnaround',
          },
          {
            label: 'Ticket medio dos deals',
            type: 'Select faixa',
            detail: 'Faixa de experiencia comprovada.',
            mockValue: 'R$ 30M - R$ 100M',
          },
          {
            label: 'Regioes de atuacao',
            type: 'Multi-select',
            detail: 'Escopo geografico do advisor.',
            mockValue: 'Brasil, LatAm',
          },
        ],
        aiAssist:
          'Mary AI faz crawling do site e sugere deals publicos para acelerar a prova de track record.',
      },
      {
        title: 'Step 3 - Operacao e preferencias',
        route: '/onboarding/terms-acceptance',
        objective: 'Configurar capacidade, modelo comercial e origem de demanda.',
        fields: [
          {
            label: 'Maximo de mandatos simultaneos',
            type: 'Numerico',
            detail: 'Usado para ranking e capacidade.',
            mockValue: '6',
          },
          {
            label: 'Honorarios tipicos',
            type: 'Multi-select',
            detail: 'Modelo comercial dominante.',
            mockValue: 'Retainer mensal, Sucesso, Hibrido',
          },
          {
            label: 'Forma preferida de originacao',
            type: 'Multi-select',
            detail: 'Canal de entrada de oportunidades.',
            mockValue: 'Plataforma, Indicacao de ativos, Indicacao de investidores',
          },
          {
            label: 'Aceita ativos sem advisor',
            type: 'Boolean',
            detail: 'Entrada no marketplace de demandas.',
            mockValue: 'Sim',
          },
        ],
      },
      {
        title: 'Step 4 - Termos e ativacao',
        route: '/advisor/dashboard',
        objective: 'Liberar trial de 14 dias e painel inicial do advisor.',
        fields: [
          {
            label: 'Trial',
            type: 'Flag',
            detail: 'Acesso total sem cartao.',
            mockValue: '14 dias ativos',
          },
          {
            label: 'Termo de conflito de interesse',
            type: 'Checkbox',
            detail: 'Reforca separacao entre lado ativo e lado investidor.',
            mockValue: 'Aceite confirmado',
          },
        ],
        message:
          'Conta ativada. O dashboard do advisor abre com mandatos, fila de trabalho e oportunidades de exemplo.',
      },
    ],
    keyScreens: [
      {
        title: 'Dashboard inicial',
        route: '/advisor/dashboard',
        goal: 'Entregar aha imediato com mandatos, oportunidades e fila da Mary AI.',
        highlights: [
          'Mostra mandatos ativos, deals em DD e fechados no ano.',
          'Exibe oportunidades de mandato para ativos sem assessoria.',
          'Fila da Mary AI destaca geracao de CIM, Q&A e proxima acao.',
        ],
        metrics: [
          { label: 'Mandatos ativos', value: '3' },
          { label: 'Deals em DD', value: '1' },
          { label: 'Fechados YTD', value: '5' },
        ],
        records: [
          {
            title: 'Empresa Anonima - Fintech B2B',
            subtitle: 'ROB R$ 8M - quer captar R$ 5M a 15M',
            badge: 'MRS 52',
          },
          {
            title: 'Projeto Neblina - Healthtech',
            subtitle: 'Demanda de assessoria com match setorial',
            badge: 'Trial CTA',
          },
        ],
      },
      {
        title: 'Projetos do advisor',
        route: '/advisor/projects',
        goal: 'Consolidar mandatos, lado representado e proxima acao por projeto.',
        highlights: [
          'Regra critica de conflito bloqueia cruzamento de lados no mesmo deal.',
          'Cada projeto herda RBAC do owner do ativo ou do buyer representado.',
          'Mary AI pode ser acionada dentro da linha do projeto.',
        ],
        table: {
          columns: ['Projeto', 'Lado', 'Estagio', 'MRS', 'Proxima acao'],
          rows: [
            ['Projeto Alfa', 'Sell-side', 'DD', '78/100', 'Gerar CIM - vence em 3 dias'],
            ['Projeto Delta', 'Buy-side', 'NBO', 'n/a', 'Revisar Q&A do VDR'],
          ],
        },
      },
      {
        title: 'Feed e notificacoes',
        route: '/advisor/feed',
        goal: 'Manter o advisor no loop sem precisar navegar projeto por projeto.',
        highlights: [
          'Recebe NDA assinado, perguntas de DD, novos documentos e mudancas de score.',
          'Canal varia entre WhatsApp, email e in-app.',
          'A IA pode pre-gerar respostas sugeridas para acelerar atendimento.',
        ],
        records: [
          {
            title: 'Novo mandato sugerido',
            subtitle: 'Projeto compativel com sua especialidade',
            badge: 'Convite',
          },
          {
            title: 'Q&A pendente',
            subtitle: 'Investidor enviou perguntas no VDR',
            badge: 'Pipeline',
          },
        ],
      },
      {
        title: 'Mary AI isolada por projeto',
        route: 'Dentro do projeto / VDR',
        goal: 'Ajudar em teaser, CIM, valuation, checklist e Q&A sem vazar contexto.',
        highlights: [
          'Namespace isolado por projeto.',
          'Bloqueio explicito quando a pergunta tentar cruzar informacoes de outro mandato.',
          'Entrega rascunhos com aprovacao humana antes de qualquer publicacao.',
        ],
        records: [
          {
            title: 'Geracao de Teaser',
            subtitle: 'Um clique apos o ativo completar dados',
            badge: 'Rascunho revisavel',
          },
          {
            title: 'Valuation AI',
            subtitle: 'Comparaveis, multiplos e observacoes criticas',
            badge: 'Assistido',
          },
        ],
      },
    ],
    networkEffects: [
      {
        action: 'Elevar o MRS do ativo',
        effect: 'Faz o mandato aparecer para mais investidores e acelera o deal.',
      },
      {
        action: 'Fechar um deal e publicar tombstone',
        effect: 'Atrai novos ativos para contratar a assessoria.',
      },
      {
        action: 'Usar a plataforma em multiplos mandatos',
        effect: 'Enriquece benchmarks setoriais e melhora a inteligencia coletiva.',
      },
    ],
  },
]

export function getDemoJourney(profile: DemoProfileKey) {
  return DEMO_JOURNEYS.find((item) => item.profile === profile) ?? DEMO_JOURNEYS[0]
}
