# Modulo Dashboard Frontend - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Dashboard Frontend
- **Owner tecnico:** Time Frontend Platform (confirmar)
- **Owner de negocio:** Produto - Experiencia inicial por perfil (confirmar)
- **Status:** em desenvolvimento
- **Ultima atualizacao:** 2026-03-29

## 2) Objetivo de negocio

- **Problema que resolve:** entregar uma visao inicial clara e acionavel para cada perfil (investor, asset, advisor, admin) apos login.
- **Publico/area impactada:** usuarios autenticados, onboarding, operacao de projetos e administracao.
- **Valor esperado:** reduzir tempo ate primeira acao util, aumentar orientacao por contexto de perfil e dar visibilidade de status da organizacao.
- **Nao objetivos:** analytics avancado em tempo real e dashboards com dados historicos consolidados (pos-MVP).

## 3) Escopo funcional

- **Entradas principais:** `orgSlug`, `profile_type`, `verification_status`, membership e sessao autenticada.
- **Processamentos-chave:** resolucao de organizacao ativa, roteamento por perfil, renderizacao de cards/acoes e bloqueio parcial por modo read-only.
- **Saidas/entregaveis:** paginas de dashboard por perfil com estados vazios, cards de metricas e quick actions.
- **Fluxo principal (happy path):**
  1. usuario autenticado acessa `/dashboard`;
  2. sistema escolhe organizacao primaria e redireciona;
  3. rota de dashboard renderiza painel correspondente ao perfil.
- **Fluxos alternativos/erros:** sem sessao (`/login`), onboarding incompleto (`/onboarding`), org inexistente (`notFound()`), perfil sem painel completo (mensagem "em construcao").

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI (App Router + componentes React), Server (Supabase server client), Navegacao (providers/tipos), DB (organizations/organization_members).
- **Componentes/servicos principais:**
  - `src/app/dashboard/page.tsx` (redirecionador inteligente de entrada)
  - `src/app/(protected)/[orgSlug]/dashboard/page.tsx` (gateway investor/asset/advisor)
  - `src/components/navigation/UserMenu.tsx` (identidade do usuario + acoes de conta)
  - `src/components/dashboard/InvestorDashboard.tsx`
  - `src/components/dashboard/AssetDashboard.tsx`
  - `src/app/(protected)/advisor/dashboard/page.tsx`
  - `src/app/(protected)/admin/dashboard/page.tsx`
  - `src/components/navigation/Header.tsx` (`PageHeader`, breadcrumb e indicador read-only)
  - `src/components/providers/NavigationProvider.tsx` (menu, item ativo, breadcrumbs)
- **Dependencias internas:** componentes de `src/components/ui/*`, tipos de `src/types/navigation.ts`, actions de navegacao/organizacao.
- **Dependencias externas:** Next.js App Router, Supabase, Lucide React.
- **Decisoes arquiteturais relevantes:**
  - dashboards por perfil com estados vazios para destravar navegacao MVP;
  - renderizacao server-side nas paginas de rota e composicao client-side nos componentes visuais;
  - uso de `readOnlyMode` para bloquear acoes quando organizacao esta em analise.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:**
  - `src/app/dashboard/page.tsx`
  - `src/app/(protected)/[orgSlug]/dashboard/page.tsx`
  - `src/app/(protected)/advisor/dashboard/page.tsx`
  - `src/app/(protected)/admin/dashboard/page.tsx`
- **Componentes UI (dashboard):**
  - `src/components/dashboard/InvestorDashboard.tsx`
  - `src/components/dashboard/AssetDashboard.tsx`
  - `src/components/dashboard/index.ts`
- **Componentes de suporte visual/navegacao:**
  - `src/components/navigation/Header.tsx`
  - `src/components/providers/NavigationProvider.tsx`
- **Acoes de servidor relacionadas:** `src/lib/actions/navigation.ts`, `src/lib/actions/organizations.ts`.
- **Schemas/tipos:** `src/types/navigation.ts`, `src/types/database.ts`.

## 6) Mapa de componentes e elementos de frontend

- **Investor Dashboard:**
  - componentes internos: `StatsCard`, `QuickActionCard`, `EmptyState`, `InvestorDashboardSkeleton`;
  - elementos principais: cards de KPI, acoes rapidas, atividade recente e estados desabilitados.
- **Asset Dashboard:**
  - componentes internos: `StatsCard`, `QuickActionCard`, `ActionItem`, `AssetDashboardSkeleton`;
  - elementos principais: bloco de `Mary Readiness Score`, progresso, recomendacoes e prioridades.
- **Advisor Dashboard:**
  - componentes internos: `StatsCard`, `EmptyProjectList`, `InfoCard`;
  - elementos principais: visao sell-side/buy-side, alerta de conflito, cards informativos.
- **Admin Dashboard:**
  - componentes internos: `StatsCard`, `PlannedFeature`;
  - elementos principais: banner de construcao, stats da plataforma, verificacoes pendentes e roadmap visual.
- **Elementos transversais:**
  - `PageHeader` padronizando titulo/descricao;
  - breadcrumbs e `NotificationBell` no `Header`;
  - menu de usuario no `Header` e footer da `Sidebar` (perfil/minha conta/sair);
  - cards, badges, buttons e skeletons via `shadcn/ui`.

## 7) Dados e contratos

- **Entidades/tabelas principais:** `organizations`, `organization_members`, `user_profiles`.
- **Campos criticos:** `profile_type`, `verification_status`, `onboarding_step`, `slug`, `role`.
- **Regras de validacao relevantes:**
  - acesso exige sessao autenticada;
  - onboarding deve estar `completed` ou `pending_review` para entrada nas rotas protegidas;
  - rotas por perfil devem respeitar `profile_type`.
- **Contratos de navegação:** menu por perfil em `getMenuByProfile` e `ROUTE_PERMISSIONS`.
- **Regras de autorizacao:** membership em organizacao e role para acesso a areas especificas (ex.: admin).

## 8) Seguranca, UX e conformidade visual

- **Dados sensiveis envolvidos:** dados de organizacao e contagens administrativas.
- **Controles aplicados:** redirect por autenticacao, validacao de membership, restricao por perfil.
- **Risco atual (frontend):** uso de cores hardcoded em alguns pontos de dashboard (`text-green-600`, `bg-yellow-50/50`, etc.) fora do padrao de tokens.
- **Mitigacao recomendada:** migrar gradualmente para tokens semanticos (`bg-muted`, `text-muted-foreground`, variantes de estado do design system) em toda UI de dashboard.
- **Urgencia:** media (nao bloqueia operacao, mas impacta consistencia e manutencao).

## 9) Observabilidade e operacao

- **Logs importantes:** erros inesperados em `src/lib/actions/navigation.ts` e falhas de query nas paginas server-side.
- **Metricas-chave recomendadas:** tempo ate primeiro paint do dashboard, cliques em quick actions, taxa de redirect para onboarding, taxa de erro por rota de dashboard.
- **Alertas necessarios:** aumento de `notFound()` em dashboard de org, falha no RPC `get_user_organizations`, queda de renderizacao por perfil.
- **Runbook basico:**
  1. validar sessao do usuario;
  2. validar membership e `profile_type`;
  3. validar `onboarding_step` e `verification_status`;
  4. revisar fallback visual (cards vazios e acoes desabilitadas).

## 10) Qualidade e testes

- **Testes unitarios existentes (dashboard):** nao foram identificados testes dedicados para `src/components/dashboard/*` ate esta data.
- **Testes de integracao existentes:** indiretos via modulos relacionados (ex.: navegacao/VDR), sem cobertura direta dos componentes de dashboard.
- **Cenarios criticos sem cobertura:**
  - renderizacao correta por perfil;
  - comportamento `readOnlyMode` nas quick actions;
  - regressao visual de estados vazios e badges de prioridade.
- **Plano minimo de teste manual:**
  1. validar `/dashboard` para usuario sem org, com org incompleta e com org concluida;
  2. validar investor/asset/advisor/admin com perfil correto;
  3. validar bloqueio de acoes em `verification_status = pending`.

## 11) Backlog do modulo

- **Divida tecnica:** placeholders (`href="#"` e dados mock) em componentes de dashboard.
- **Melhorias de curto prazo:**
  - conectar quick actions a rotas reais;
  - remover hardcodes de cor e alinhar 100% ao design system;
  - criar testes de renderizacao por perfil.
- **Melhorias de medio prazo:**
  - alimentar cards com dados reais via server actions;
  - adicionar telemetria de interacao;
  - padronizar componentes compartilhados de card/empty state para reduzir duplicacao.
- **Riscos bloqueantes e plano de resolucao:**
  - risco: desalinhamento entre menu de navegacao e destinos das quick actions;
  - resolucao recomendada: centralizar destinos no contrato de navegacao (`src/types/navigation.ts`) e reutilizar em dashboard;
  - justificativa: reduz regressao de rota e divergencia de UX.

## 12) Checklist de pronto

- [ ] Fluxo de entrada `/dashboard` validado para todos cenarios de sessao/org.
- [ ] Renderizacao por perfil validada com dados reais.
- [ ] Quick actions ligadas a rotas ativas do produto.
- [ ] Componentes sem hardcode de cor fora de tokens permitidos.
- [ ] Testes minimos (unitarios + smoke) implementados para dashboard frontend.
- [ ] Contexto do modulo atualizado apos alteracoes estruturais.

## 13) Historico de decisoes

| Data | Decisao | Motivo | Impacto |
|------|---------|--------|---------|
| 2026-03-29 | Criado modulo especialista `dashboard-frontend` com governanca dedicada | Pedido de time especialista para criar/editar/corrigir frontend do dashboard com rastreabilidade | Padroniza analise, reduz respostas genericas e acelera manutencao |
| 2026-03-29 | Adicionado `UserMenu` com avatar, nome, email, tipo de perfil e acoes de conta no Header/Sidebar | Melhorar navegacao de conta e cumprir requisito de identidade do usuario no dashboard | Unifica UX de conta, elimina logout isolado e reduz atrito de acesso a Perfil/Minha conta |
| 2026-03-29 | Simplificado `Header` removendo busca, notificacoes e `UserMenu`; perfil fica apenas no footer da Sidebar | Centralizar acoes de conta em um unico ponto e reduzir ruido visual no topo | Header mais limpo, fluxo de conta consistente em desktop/mobile e menor complexidade no `UserMenu` |
| 2026-03-29 | Incluido botao `Mary AI` no Header com painel lateral de chat rapido (quebra-gelos, `+` anexos, `@` mencoes e envio mock) | Reduzir friccao de acesso ao assistente e acelerar perguntas contextuais sem sair da tela atual | Aumenta adotacao do Mary AI no fluxo protegido e prepara base para integracao real com backend em fase futura |

## Evidencias usadas para este modulo

- `src/app/dashboard/page.tsx`
- `src/app/(protected)/[orgSlug]/dashboard/page.tsx`
- `src/app/(protected)/advisor/dashboard/page.tsx`
- `src/app/(protected)/admin/dashboard/page.tsx`
- `src/components/dashboard/InvestorDashboard.tsx`
- `src/components/dashboard/AssetDashboard.tsx`
- `src/components/navigation/UserMenu.tsx`
- `src/components/navigation/Header.tsx`
- `src/components/navigation/Sidebar.tsx`
- `src/components/mary-ai/MaryAiQuickChatSheet.tsx`
- `src/components/mary-ai/__tests__/MaryAiQuickChatSheet.test.tsx`
- `src/components/providers/NavigationProvider.tsx`
- `src/lib/actions/navigation.ts`
- `src/types/navigation.ts`
