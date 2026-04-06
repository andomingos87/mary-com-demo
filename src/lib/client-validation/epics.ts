export type ValidationUser = 'Anderson' | 'Cassio' | 'Leonardo';

export type ChecklistStatus = 'pending' | 'approved' | 'rejected' | 'bug';

export type FinalStatus = 'Aprovado' | 'Reprovado' | 'Pendencias';

export interface EpicChecklistItem {
  id: string;
  label: string;
}

export interface ValidationEpic {
  id: string;
  title: string;
  documentPath: string;
  whatIs: string[];
  implemented: string[];
  checklist: EpicChecklistItem[];
}

export const VALIDATION_USERS: ValidationUser[] = ['Anderson', 'Cassio', 'Leonardo'];

export const VALIDATION_EPICS: ValidationEpic[] = [
  {
    id: 'E2',
    title: 'Onboarding Investidor',
    documentPath: '.dev/production/client-validation/E2-VALIDACAO-CLIENTE-ONBOARDING-INVESTIDOR.md',
    whatIs: [
      'O Epico 2 simplifica a entrada do investidor em apenas 2 etapas.',
      'Ao concluir o onboarding, o usuario vai para Tese como ponto de partida.',
      'Objetivo de negocio: reduzir friccao no primeiro acesso e acelerar tempo para gerar valor.',
    ],
    implemented: [
      'Fluxo de onboarding do investidor organizado em 2 etapas.',
      'Redirecionamento para o modulo de Tese ao final do onboarding.',
      'CRUD minimo de Tese disponivel: criar, editar e ativar.',
      'Regra de 1 tese ativa por investidor aplicada.',
      'Radar conectado a tese ativa com CTAs iniciais.',
    ],
    checklist: [
      { id: '3.1.1', label: 'Tenho acesso a uma conta de teste com perfil Investidor.' },
      { id: '3.1.2', label: 'Consigo entrar normalmente na conta.' },
      { id: '3.1.3', label: 'Tenho uma organizacao valida para executar o fluxo.' },
      { id: '3.2.1', label: 'O onboarding aparece em 2 etapas, sem etapas extras.' },
      { id: '3.2.2', label: 'Validacoes de campos obrigatorios funcionam.' },
      { id: '3.3.1', label: 'Ao concluir onboarding, o usuario e enviado para Tese.' },
      { id: '3.4.1', label: 'Consigo criar uma tese nova.' },
      { id: '3.4.2', label: 'Consigo editar uma tese existente.' },
      { id: '3.4.3', label: 'Consigo ativar uma tese com apenas 1 tese ativa por vez.' },
      { id: '3.5.1', label: 'O Radar mostra oportunidades coerentes com a tese ativa.' },
      { id: '3.5.2', label: 'CTAs de teaser, NDA e follow respondem corretamente.' },
    ],
  },
  {
    id: 'E3',
    title: 'MRS Canonico',
    documentPath: '.dev/production/client-validation/E3-VALIDACAO-CLIENTE-MRS-CANONICO.md',
    whatIs: [
      'O Epico 3 entrega o modulo central do lado Ativo: o MRS canonico.',
      'Ele organiza prontidao do projeto em passos, com status, prioridade, score e gates por etapa.',
      'Objetivo de negocio: padronizar a leitura de prontidao e apoiar decisao com criterio objetivo.',
    ],
    implemented: [
      'Rota dedicada de MRS com estrutura navegavel por 4 passos.',
      'Contrato de status e prioridade aplicado.',
      'Score por passo e score total com regras definidas.',
      'Gates por etapa do deal (NDA/NBO) com bloqueio quando necessario.',
      'Upload multiplo por item com metadados operacionais.',
    ],
    checklist: [
      { id: '3.1.1', label: 'Tenho acesso a conta de teste com perfil Ativo.' },
      { id: '3.1.2', label: 'Consigo abrir o modulo MRS sem erro.' },
      { id: '3.1.3', label: 'Tenho ao menos 1 projeto para validar preenchimento.' },
      { id: '3.2.1', label: 'O MRS abre com os 4 passos previstos.' },
      { id: '3.3.1', label: 'Consigo marcar itens com os status permitidos.' },
      { id: '3.3.2', label: 'Consigo definir prioridade dos itens.' },
      { id: '3.3.3', label: 'Score por passo e total reage ao preenchimento.' },
      { id: '3.4.1', label: 'Bloqueios por gate funcionam quando requisito nao e atendido.' },
      { id: '3.4.2', label: 'Avanco e permitido quando requisito e atendido.' },
      { id: '3.5.1', label: 'Consigo anexar mais de um arquivo no mesmo item.' },
      { id: '3.5.2', label: 'Metadados do item ficam visiveis e atualizados.' },
    ],
  },
  {
    id: 'E4',
    title: 'Projetos e Marcos Juridicos',
    documentPath: '.dev/production/client-validation/E4-VALIDACAO-CLIENTE-PROJETOS-MARCOS-JURIDICOS.md',
    whatIs: [
      'O Epico 4 ajusta o modulo de Projetos para seguir os marcos juridicos do MVP.',
      'Ele garante que um projeto so nasce apos NDA.',
      'Objetivo de negocio: manter o pipeline alinhado ao processo juridico minimo da operacao.',
    ],
    implemented: [
      'Taxonomia do pipeline ajustada para Teaser, NDA, NBO, SPA e Fechado-Perdido.',
      'Gate de criacao de projeto por NDA aplicado.',
      'Regras de transicao entre estagios registradas.',
      'Trilha minima de auditoria para eventos criticos.',
      'Ajustes no pipeline e tipos compartilhados.',
    ],
    checklist: [
      { id: '3.1.1', label: 'Tenho acesso a conta com permissao de operar Projetos.' },
      { id: '3.1.2', label: 'Tenho ao menos um caso sem NDA e um caso com NDA para testar.' },
      { id: '3.1.3', label: 'Consigo abrir o Pipeline sem erro.' },
      { id: '3.2.1', label: 'Vejo somente os estagios canonicos do PRD no pipeline.' },
      { id: '3.3.1', label: 'Nao consigo criar projeto sem NDA.' },
      { id: '3.3.2', label: 'Consigo criar projeto quando NDA estiver valido.' },
      { id: '3.4.1', label: 'Consigo movimentar projeto entre estagios permitidos.' },
      { id: '3.4.2', label: 'Nao consigo transicao fora da regra.' },
      { id: '3.5.1', label: 'Eventos principais do epico ficam rastreaveis para auditoria.' },
    ],
  },
  {
    id: 'E5',
    title: 'Feed, Alertas e Recorrencia',
    documentPath: '.dev/production/client-validation/E5-VALIDACAO-CLIENTE-FEED-ALERTAS-RECORRENCIA.md',
    whatIs: [
      'O Epico 5 cria rotina de uso com feed cronologico, alertas e lembretes.',
      'Ele busca reduzir abandono e melhorar frequencia de acesso.',
      'Objetivo de negocio: aumentar recorrencia de uso para Investidor e Ativo.',
    ],
    implemented: [
      'Escopo de feed ativo com minimo de 3 tipos de evento definido.',
      'Historia de preferencias de notificacao e digest semanal prevista.',
      'Entrega funcional ainda depende de conclusao no backlog oficial.',
    ],
    checklist: [
      { id: '3.1.1', label: 'Tenho acesso a conta Investidor e conta Ativo.' },
      { id: '3.1.2', label: 'Existe ambiente com dados suficientes para gerar eventos.' },
      { id: '3.1.3', label: 'Consigo abrir o Feed sem erro.' },
      { id: '3.2.1', label: 'Feed mostra eventos em ordem de tempo (mais novo para mais antigo).' },
      { id: '3.2.2', label: 'Existem no minimo 3 tipos de evento relevantes.' },
      { id: '3.3.1', label: 'Consigo ajustar preferencias de notificacao.' },
      { id: '3.3.2', label: 'Recebo alertas conforme preferencias escolhidas.' },
      { id: '3.4.1', label: 'Digest semanal e gerado com conteudo util.' },
    ],
  },
  {
    id: 'E6',
    title: 'IA com Aprovacao Humana',
    documentPath: '.dev/production/client-validation/E6-VALIDACAO-CLIENTE-IA-APROVACAO-HUMANA.md',
    whatIs: [
      'O Epico 6 coloca IA para ajudar na producao de conteudo.',
      'Nada deve ser publicado automaticamente sem aprovacao humana.',
      'Objetivo de negocio: ganhar velocidade sem perder controle.',
    ],
    implemented: [
      'Fluxo esperado definido: rascunho, revisao, aprovado e publicado.',
      'Dependencias com outros modulos mapeadas.',
      'Trava de autopublicacao prevista no backlog tecnico.',
      'Entrega funcional ainda pendente de conclusao oficial.',
    ],
    checklist: [
      { id: '3.1.1', label: 'Tenho conta com permissao para usar assistencia de IA.' },
      { id: '3.1.2', label: 'Tenho um caso real para gerar teaser, valuation e deck.' },
      { id: '3.1.3', label: 'Ambiente possui rastreio de aprovacao habilitado.' },
      { id: '3.2.1', label: 'Consigo gerar rascunho inicial por IA sem erro.' },
      { id: '3.3.1', label: 'Conteudo fica em estado de revisao antes de aprovar.' },
      { id: '3.3.2', label: 'Usuario consegue aprovar explicitamente.' },
      { id: '3.4.1', label: 'Publicacao ocorre apenas apos aprovacao.' },
      { id: '3.5.1', label: 'Acao de revisao e aprovacao fica registrada para auditoria.' },
    ],
  },
  {
    id: 'E7',
    title: 'Hardening de Seguranca',
    documentPath: '.dev/production/client-validation/E7-VALIDACAO-CLIENTE-HARDENING-SEGURANCA.md',
    whatIs: [
      'O Epico 7 reforca seguranca em operacoes sensiveis.',
      'Cada usuario deve acessar apenas dados da propria organizacao.',
      'Objetivo de negocio: proteger dados multi-tenant e reduzir risco de vazamento.',
    ],
    implemented: [
      'Escopo de ownership e membership em actions criticas definido.',
      'Escopo de mitigacao de prompt injection ampliado.',
      'Pendencias de baseline registradas: assinatura eletronica e politica de upload.',
      'Entrega funcional ainda sem conclusao oficial no backlog.',
    ],
    checklist: [
      { id: '3.1.1', label: 'Tenho 2 contas em organizacoes diferentes para teste cruzado.' },
      { id: '3.1.2', label: 'Tenho permissao para executar operacoes sensiveis em uma delas.' },
      { id: '3.1.3', label: 'Tenho documentos de teste para ingestao.' },
      { id: '3.2.1', label: 'Nao consigo acessar dados de outra organizacao.' },
      { id: '3.3.1', label: 'Somente usuarios autorizados executam acao critica.' },
      { id: '3.4.1', label: 'Upload respeita politica de formato e tamanho definida.' },
      { id: '3.4.2', label: 'Conteudo com entrada suspeita e tratado com seguranca.' },
    ],
  },
  {
    id: 'E8',
    title: 'Advisor MVP Parcial',
    documentPath: '.dev/production/client-validation/E8-VALIDACAO-CLIENTE-ADVISOR-MVP-PARCIAL.md',
    whatIs: [
      'O Epico 8 cobre a jornada minima do advisor no MVP.',
      'Inclui onboarding em 2 passos e fluxo basico de atendimento.',
      'Objetivo de negocio: habilitar operacao hibrida sem aumentar demais o escopo.',
    ],
    implemented: [
      'Escopo parcial do advisor definido no backlog.',
      'Jornada alvo documentada: onboarding em 2 passos e atendimento minimo.',
      'Epico planejado para fase de evolucao, sem conclusao oficial no momento.',
    ],
    checklist: [
      { id: '3.1.1', label: 'Tenho conta de teste com perfil Advisor (ou equivalente).' },
      { id: '3.1.2', label: 'Tenho casos minimos para simular atendimento.' },
      { id: '3.1.3', label: 'Ambiente possui rotas e permissoes do advisor habilitadas.' },
      { id: '3.2.1', label: 'Onboarding do advisor conclui em 2 passos.' },
      { id: '3.3.1', label: 'Advisor consegue abrir e acompanhar atendimento basico.' },
      { id: '3.3.2', label: 'Advisor visualiza informacoes necessarias para atuar.' },
      { id: '3.4.1', label: 'Advisor ve somente o que e permitido para seu perfil.' },
    ],
  },
  {
    id: 'E9',
    title: 'Pos-MVP Planejado',
    documentPath: '.dev/production/client-validation/E9-VALIDACAO-CLIENTE-POS-MVP-PLANEJADO.md',
    whatIs: [
      'O Epico 9 organiza evolucoes que ficam fora do recorte do MVP.',
      'Ele preserva foco na entrega principal sem perder visao de crescimento.',
      'Objetivo de negocio: priorizar o essencial agora e escalar com previsibilidade depois.',
    ],
    implemented: [
      'Backlog Pos-MVP estruturado como epico dedicado.',
      'Itens de evolucao mapeados para proximas fases.',
      'Entregas desse epico dependem da aprovacao do gate MVP.',
    ],
    checklist: [
      { id: '3.1.1', label: 'Gate MVP foi oficialmente aprovado.' },
      { id: '3.1.2', label: 'Existe priorizacao de itens Pos-MVP com dono e prazo.' },
      { id: '3.1.3', label: 'Dependencias tecnicas e de produto estao mapeadas.' },
      { id: '3.2.1', label: 'Cada item possui objetivo de negocio claro.' },
      { id: '3.2.2', label: 'Cada item possui criterio de aceite verificavel.' },
      { id: '3.3.1', label: 'Ordem de execucao considera impacto e risco.' },
      { id: '3.3.2', label: 'Dono e prazo existem para os proximos itens.' },
    ],
  },
  {
    id: 'E1',
    title: 'Navegacao',
    documentPath: '.dev/production/client-validation/E1-VALIDACAO-CLIENTE-NAVEGACAO.md',
    whatIs: [
      'O Epico 1 organizou a navegacao da plataforma para cada tipo de usuario ver o menu certo, com os nomes certos, sem confusao.',
      'Quem e Investidor deve ver: Tese, Radar, Feed, Projetos.',
      'Quem e Ativo deve ver: MRS, Radar, Feed, Projeto.',
      'Objetivo de negocio: deixar a experiencia mais clara, reduzir erro de navegacao e evitar retrabalho.',
    ],
    implemented: [
      'Menus ajustados por perfil (Investidor e Ativo).',
      'Nomes das opcoes padronizados conforme produto.',
      'Caminhos principais de navegacao organizados.',
      'Compatibilidade com caminhos antigos importantes preservada.',
      'Regras de acesso por perfil mantidas.',
    ],
    checklist: [
      { id: '3.1.1', label: 'Tenho acesso a conta Investidor e conta Ativo para validacao.' },
      { id: '3.2.1', label: 'Perfil Investidor exibe exatamente Tese, Radar, Feed e Projetos.' },
      { id: '3.2.2', label: 'Cliques do menu Investidor abrem as telas corretas.' },
      { id: '3.3.1', label: 'Perfil Ativo exibe exatamente MRS, Radar, Feed e Projeto.' },
      { id: '3.3.2', label: 'Cliques do menu Ativo abrem as telas corretas.' },
      { id: '3.4.1', label: 'Investidor nao acessa area exclusiva de Ativo.' },
      { id: '3.4.2', label: 'Ativo nao acessa area exclusiva de Investidor.' },
      { id: '3.5.1', label: 'Caminhos antigos importantes funcionam sem erro 404/500.' },
      { id: '3.5.2', label: 'Nao ocorre loop de redirecionamento ou tela branca.' },
      { id: '3.6.1', label: 'Fluxo ponta a ponta de Investidor funciona sem problema.' },
      { id: '3.6.2', label: 'Fluxo ponta a ponta de Ativo funciona sem problema.' },
    ],
  },
];
