# Anexo I - Escopo Detalhado

## 1) Objetivo da V1

Viabilizar o ciclo núcleo de M&A com três papéis: Investor, Asset (empresa) e Advisor (curadoria), cobrindo:

- Onboarding por perfil;
- Investor Thesis (filtros e preferências);
- Radar com matching explicável;
- Projeto do Ativo com Teaser, Infomemo e o Valuation;
- Modelos pré-determinados para download e upload com a normalização de dados na parte financeira;
- Painel de KPIs do Ativo com dados da base de dados;
- NDA (controle manual / upload);
- Data Room padronizado do ativo + Data Room espelhado por investidor pós-NDA;
- Validações N1/N2/N3 (readiness), Q&A com IA (RAG) referenciando itens do DR;
- Pipeline Kanban espelhado entre lado do ativo e do investidor;
- Notificações (in-app + e-mail).

### Fora da V1 (explícito)

Marketplace de advisors, integrações de assinatura eletrônica "deep" (ex.: ClickSign com fluxo completo), uploads pesados internos (file storage proprietário), relatórios PDF/Excel, BI, smart-contracts/escrow, cap table, ranking/gamificação, LP pública avançada. (Manter apenas hooks/stubs quando necessário.)

## 2) Perfis, Autenticação e Acesso

- Perfis: Investor | Asset | Advisor.
- Auth: Supabase Auth (e-mail/senha + OAuth corporativos se disponível).
- Pós-login: seleção de perfil (se multi-papel) -> guardas por perfil/estado (pendente/ativo).
- Organização: cada usuário pertence a organization (investidor, empresa, advisory). membership define permissões.
- Domínio de e-mail corporativo: apenas aviso (bloqueio na v1 de qualquer e-mail).

### Critérios de aceite

- Usuário cria conta, escolhe perfil e cai no dashboard correto.
- Após o onboarding modelo padrão de contrato para assinatura entre a Mary e as partes, com upload manual.
- Usuário pendente navega em modo restrito até concluir onboarding mínimo.

## 3) Investor - Thesis, Radar e Matching

### Investor Thesis

- Campos: setores (Taxonomia Mary), geografia, ticket (min/max), estágio, faturamento/EBITDA faixa, tese/estratégia textual, exclusões (listas negativas), readiness mínima.
- Múltiplas teses por organização (ativo/desativado).

### Radar e Matching

- Radar lista projetos compatíveis com a(s) tese(s), ordenados por score.
- Algoritmo V1 (determinístico) com pesos (exemplo base ajustável no Admin):
  - Setor/Taxonomia: 30%
  - Ticket (min/max): 25%
  - Geografia: 15%
  - Readiness mínimo atendido: 15%
  - Faixas operacionais (faturamento/EBITDA/estágio): 15%
- Explain: breakdown percentual e "por que bateu / onde não bateu".
- Ação: Ver Teaser -> Prosseguir (NDA) -> cria espelho.

### Critérios de aceite

- Criar/editar/excluir tese.
- Radar retorna score e explain coerentes com filtros.
- Alterar tese reflete de imediato na lista/score.

## 4) Asset - Projeto, Teaser, NDA

### Projeto do Ativo

- Campos-chave: objetivo (venda/fundraising/merger), codinome, sumário, setor, geografia, ranges (valuation/cheque), principais métricas e highlights.
- Teaser (pré-NDA): visão resumida sem revelar identificação sensível (empresa em sigilo), com tracking de visualização (por investidor).

### NDA (V1)

- Fluxo: botão Prosseguir -> NDA -> status "assinado" marcado via upload de arquivo/URL (manual).
- Ao marcar assinado, o sistema cria Investor DR (espelho com ACL separada) para aquele par Projeto×Investidor.

### Critérios de aceite

- Teaser aparece no radar; clique registra visualização.
- Marcar NDA como assinado cria DR espelhado e libera acesso ao investidor.

## 5) Data Room (Ativo) + Espelho (Investidor)

### Estrutura

- Árvore padronizada (template V1): Jurídico, Financeiro, Operacional, Estratégia, Pessoas, Fiscal, etc., com subpastas e itens.

### Itens de DR

- Link externo (Google Drive/SharePoint/Dropbox) - V1 sem upload nativo interno.
- Campos: título, descrição/observações (usada pela IA), visibilidade, unidade de negócio, tags, responsável, prioridade, status, prazo.
- Comentários (sidebar) por item, histórico (activity log).

### Validações N1/N2/N3 e Readiness

- N1: auto-declaração do ativo.
- N2: validação do Advisor do projeto.
- N3: validação de auditor (papel opcional V1).
- O Readiness Score (0-100) do projeto é a composição ponderada das seções (pesos definidos no Admin).
- Alterar Níveis atualiza Readiness e influencia o matching (regra "readiness mínimo").

### Data Room espelhado do Investidor

- Criado por investidor após NDA.
- Herda a estrutura e referências de link (somente leitura para investidor; dúvidas via Q&A).

### Critérios de aceite

- Criar/editar/remover item; anexar link; definir prioridade/status/prazo; comentar; logar ações.
- Dar N1/N2/N3 conforme papel e recalcular Readiness.
- Investidor vê somente o que foi espelhado para ele (isolamento por par).

## 6) Q&A com IA (RAG)

- Escopo por projeto & usuário; a IA só indexa metadados/descrições informadas nos itens + eventuais trechos colados, não baixa arquivos protegidos na V1.
- Perguntas do investidor retornam resposta + referência (link do item/ seção).
- Se a IA não resolve, abre solicitação ao responsável (Ativo/Advisor) no próprio item, mantendo histórico.

### Critérios de aceite

- IA responde dentro do escopo e sempre referencia itens.
- Perguntas sem base criam solicitação direcionada e geram notificação.

## 7) Pipeline Kanban (espelhado)

- Etapas padrão V1 (exemplo): Screening -> Teaser -> NDA -> Pré-DD/ Q&A -> Term Sheet/ NBO -> DD/ SPA -> Signing -> CPs -> Closing -> Disclosure -> Encerrado/Declinado.
- Cada par Projeto×Investidor = ticket no Kanban; mover no lado do ativo espelha no lado do investidor (e vice-versa).
- Regras de transição compostas de check dos envolvidos mais automação relativa aos prazos.

### Critérios de aceite

- Mover etapa atualiza ambos os lados e gera histórico + notificação.
- Filtros por etapa/indicadores básicos.

## 8) Notificações (V1)

In-app + e-mail (SMTP):

- NDA assinado;
- Novo item/alteração no DR;
- Nova pergunta/resposta no Q&A;
- Mudança de etapa no Pipeline;
- Menção em comentário.

- Controle de silenciamento por usuário (toggle simples).

## 9) Admin Essencial

- Taxonomia Mary (setores/atributos) usada em tese/projeto.
- Pesos do Matching e do Readiness (somente leitura ou edição restrita).
- Listas de apoio: etapas do pipeline (fixas na V1), tags de risco, motivos de declínio.

## 10) Modelo de Dados (Supabase) - V1

Nomes em `snake_case`, ids `uuid`, `created_at/updated_at` com `now()`.

### Identidade

- `profiles` (`user_id` FK auth, `role`, `org_id`, `name`, `email_domain`, `status`)
- `organizations` (`name`, `type {investor, asset, advisory}`, `slug`)
- `memberships` (`org_id`, `user_id`, `role {owner, admin, member, advisor_ctx, auditor_ctx}`)

### Investidor

- `investor_theses` (`org_id`, `status`, `readiness_min`, `notes`)
- `thesis_filters_sector` (`thesis_id`, `mary_code`)
- `thesis_filters_geo` (`thesis_id`, `country/state`)
- `thesis_filters_ranges` (`thesis_id`, `ticket_min`, `ticket_max`, `rev_min`, `rev_max`, `ebitda_min`, `ebitda_max`)

### Ativo e Projeto

- `projects` (`org_id_asset`, `codename`, `objective`, `sector_main`, `geo`, `ranges_json`, `summary`, `status`)
- `teasers` (`project_id`, `sections_json`, `viewed_by/investor_id`, `viewed_at`)

### NDA e Espelho

- `ndas` (`project_id`, `investor_org_id`, `status {pending,signed}`, `file_url`, `signed_at`)
- `investor_drs` (`project_id`, `investor_org_id`, `created_at`)

### Data Room

- `dr_items` (`project_id`, `parent_id`, `path`, `title`, `section`, `description`, `visibility`, `owner_user_id`, `priority`, `status`, `due_date`)
- `dr_links` (`item_id`, `url`, `provider`, `access_level`, `updated_by`)
- `dr_validations` (`item_id`, `level {N1,N2,N3}`, `validator_user_id`, `validated_at`, `comment`, `hash_opt`)
- `dr_comments` (`item_id`, `author_user_id`, `body`, `thread_id`, `created_at`)
- `dr_activity_log` (`entity`, `entity_id`, `action`, `actor_user_id`, `meta_json`, `at`)

### Q&A / IA

- `qna_threads` (`project_id`, `asked_by_user_id`, `asked_by_role`, `question`, `status {open,waiting,resolved}`, `created_at`)
- `qna_messages` (`thread_id`, `author_user_id`, `message`, `refs_items[]`, `created_at`)
- `rag_chunks` (`project_id`, `item_id`, `text`, `embedding_vector`)

### Matching / Radar / Pipeline

- `matches` (`project_id`, `investor_org_id`, `score`, `breakdown_json`, `matched_at`)
- `pipeline_tickets` (`project_id`, `investor_org_id`, `stage`, `moved_by`, `moved_at`)

### Admin

- `mary_taxonomy` (`code`, `level`, `name`, `parent_code`)
- Pensar em performance (carregamento/ velocidade) tokens de IA (verificar o que conseguimos buscar de dados do servidor para alimentar um Painel)
- `settings_matching` (`weights_json`, `readiness_threshold_default`)
- `settings_readiness` (`section_weights_json`)

### Notificações

- `notifications` (`user_id`, `type`, `payload_json`, `read_at`)

### Segurança (RLS) - princípios V1

- Row-level por organização e por par projeto×investidor nos objetos sensíveis.
- Advisor só pode validar N2 nos projetos em que foi vinculado; N3 apenas "auditor".
- Investidor só lê o Investor DR que lhe pertence; não lê DR do ativo diretamente.
- Logs e comentários visíveis conforme escopo do projeto e papel.

## 11) APIs / Edge RPC (V1)

- `rpc_upsert_profile()` - cria/atualiza perfil + org.
- `rpc_create_thesis(org_id, filters)` - valida e grava tese + filtros.
- `rpc_list_opportunities(thesis_id, paging)` - aplica matching e retorna score + explain.
- `rpc_create_project(org_id_asset, payload)` - cria projeto + teaser.
- `rpc_set_nda_status(project_id, investor_org_id, status, file_url?)` - ao `signed` cria `investor_drs`.
- `rpc_dr_upsert_item(project_id, payload)` - cria/edita item; escreve log.
- `rpc_dr_validate(item_id, level, comment?)` - grava N1/N2/N3 e recalcula readiness.
- `rpc_qna_ask(project_id, question)` - cria thread; IA tenta responder e referenciar; se falha, atribui ao responsável.
- `rpc_pipeline_move(project_id, investor_org_id, new_stage)` - valida transição, atualiza espelho e notifica.

## 12) Fluxos Principais (ponta-a-ponta)

- Investor cria Thesis -> abre Radar -> vê Teaser -> clica Prosseguir -> NDA (upload) -> ganha Investor DR -> faz Q&A -> avança Pipeline.
- Asset cria Projeto -> alimenta DR (links + descrições) -> faz N1 -> o Advisor faz N2 (quando aplicável) -> Readiness sobe -> atrai mais matches -> conduz Pipeline.
- Advisor acompanha projetos em que participa, valida itens (N2), responde Q&A escalados, e orienta ações no DR.

## 13) Critérios de Aceite (resumo)

- Onboarding por perfil com guarda de acesso.
- Thesis salva e aplicada ao Radar; matching com explain.
- NDA manual libera o DR espelhado do investidor.
- DR com itens, links, comentários, activity log, N1/N2/N3 e Readiness funcionando.
- Q&A com IA referenciando itens; fallback para responsável.
- Pipeline espelhado com histórico e notificações.
- RLS sem vazamentos entre organizações e entre investidores do mesmo projeto.

## 14) Não-funcionais (V1)

- Segurança: RLS rigoroso; mínimos PII; logs de acesso.
- Escalabilidade: índices em matches, pipeline_tickets, dr_*.
- Observabilidade: métricas simples de uso (contagem de eventos).
- Performance: lista do Radar paginada, DR por seções, jobs de embeddings assíncronos.
