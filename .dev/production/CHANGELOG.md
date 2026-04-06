# CHANGELOG Consolidado - .dev/production

Data da consolidacao: 2026-04-03
Status: Ativo (fonte principal de changelog)

## Fontes consolidadas

- `4-CHANGELOG-PIVOT-07-03.md` (deletado — historico no Git)
- `28-CHANGELOG-CONTEXT-ENGINEERING-FRONTEND.md` (deletado — historico no Git)

## 2026-04-06 | H0.5 - Fechamento final das ressalvas (100%)

### O que mudou

- Persistência de histórico e estado de primeira abertura da Mary AI em sessão com escopo por organização.
- CTAs da Mary AI unificados por perfil + contexto de rota/projeto em sidebar e sheet.
- Ajustes de layout responsivo para modo push em `>=1024` com fallback de sheet abaixo desse breakpoint.
- Hardening de header/fallback para preservar acessibilidade do botão Mary AI em rotas com e sem header.
- Inclusão de tooltips nos controles críticos do chat (anexo, menção e envio).
- Rotas legadas `mary-ai-private` mantidas com redirect explícito e metadata de legado.
- Testes atualizados para cobrir contexto de rota, breakpoint e paridade de comportamento entre modos.

### Evidências principais

- `src/components/providers/MaryAiProvider.tsx`
- `src/components/mary-ai/MaryAiChatContent.tsx`
- `src/components/mary-ai/MaryAiSidebar.tsx`
- `src/components/mary-ai/MaryAiQuickChatSheet.tsx`
- `src/app/(protected)/ProtectedLayoutClient.tsx`
- `src/components/navigation/Header.tsx`
- `src/components/mary-ai/MaryAiEntryFallback.tsx`
- `src/app/(protected)/[orgSlug]/mary-ai-private/page.tsx`
- `src/app/(protected)/advisor/mary-ai-private/page.tsx`
- `src/app/(protected)/__tests__/ProtectedLayoutClient.test.tsx`
- `src/components/mary-ai/__tests__/MaryAiSidebar.test.tsx`
- `src/components/mary-ai/__tests__/MaryAiQuickChatSheet.test.tsx`
- `.dev/validations/H0.5-CHECKLIST-VALIDACAO.md`

## 2026-04-06 | H0.6 - Rodada final (fechamento das ressalvas)

### O que mudou

- Persistência de auto-save do onboarding ativo/investidor foi conectada ao backend como caminho primário (`autoSaveOnboardingFields`) com fallback local apenas em falha.
- Steps de onboarding de ativo passaram a enviar draft incremental com `organizationId` no fluxo real (`OnboardingWizard` + `Asset*Step`).
- Página de projeto ganhou auto-save incremental para dados básicos e contatos via `autoSaveProjectFields`, com feedback visual de status.
- Endurecimento dos contratos de autosave: validação/normalização de payload em onboarding e whitelist explícita de campos em projeto.
- Mensagens e semântica UX ajustadas em Tese/MRS para remover referência a salvamento manual em formulários-alvo.
- Cobertura de testes H0.6 ampliada (payload contract onboarding, gates com draft incremental, cenário de erro no auto-save de tese, contrato de registro de campos no profile).
- Gate técnico executado com sucesso: builds incrementais por arquivo + suíte completa `npm run test` (39/39 suites).

### Evidências principais

- `src/components/onboarding/hooks/useOnboarding.ts`
- `src/components/onboarding/OnboardingWizard.tsx`
- `src/components/onboarding/steps/asset/AssetCompanyDataStep.tsx`
- `src/components/onboarding/steps/asset/AssetMatchingDataStep.tsx`
- `src/components/onboarding/steps/asset/AssetTeamStep.tsx`
- `src/components/onboarding/steps/asset/AssetCodenameStep.tsx`
- `src/components/onboarding/ProfileDetailsForm.tsx`
- `src/components/onboarding/EligibilityForm.tsx`
- `src/app/(protected)/[orgSlug]/projects/[codename]/page.tsx`
- `src/lib/actions/onboarding.ts`
- `src/lib/actions/projects.ts`
- `src/lib/actions/__tests__/onboarding.test.ts`
- `src/lib/actions/__tests__/projects-status-gates.test.ts`
- `src/lib/actions/__tests__/thesis.test.ts`

## 2026-04-06 | H0.6 - Auto-save e tooltips padronizados (correção de blockers)

### O que mudou

- Criado hook global `src/hooks/useAutoSave.ts` com `registerField`, debounce padrão, retry e estados `idle/saving/saved/error`.
- Criados componentes compartilhados `AutoSaveIndicator` e `FieldTooltip` para feedback visual e ajuda contextual padronizada.
- Catálogo unificado de tooltips criado em `src/lib/constants/tooltips.ts`, exportado em barrel e reaproveitado por `tooltips-thesis`.
- Integração de auto-save/feedback aplicada nos passos de onboarding do ativo e investidor com adaptação do `useOnboarding`.
- Ajustes de UX para remover rótulos textuais "Salvar" nas telas-alvo principais (Tese, MRS e Projeto), alinhando regra global H0.6.
- Backend ampliado com helpers de persistência incremental (`autoSaveOnboardingFields`, `autoSaveThesisField`, `autoSaveProjectFields`).
- Testes adicionados para cobertura H0.6 em onboarding/tese/actions e gate técnico revalidado com `npm run test` e builds incrementais.

### Evidências principais

- `src/hooks/useAutoSave.ts`
- `src/components/shared/AutoSaveIndicator.tsx`
- `src/components/shared/FieldTooltip.tsx`
- `src/lib/constants/tooltips.ts`
- `src/components/onboarding/steps/asset/AssetCompanyDataStep.tsx`
- `src/components/onboarding/ProfileDetailsForm.tsx`
- `src/components/onboarding/EligibilityForm.tsx`
- `src/components/thesis/ThesisManager.tsx`
- `src/components/mrs/MrsWorkspace.tsx`
- `src/app/(protected)/[orgSlug]/projects/[codename]/page.tsx`
- `src/lib/actions/onboarding.ts`
- `src/lib/actions/thesis.ts`
- `src/lib/actions/projects.ts`
- `src/components/onboarding/__tests__/ProfileDetailsForm.test.tsx`
- `src/components/thesis/__tests__/ThesisManager.test.tsx`

## 2026-04-06 | H0.5 - Mary AI Sidebar push contextual

### O que mudou

- Mary AI migrou de `Sheet` local do header para arquitetura com `MaryAiProvider` global no layout protegido.
- Novo `MaryAiSidebar` em coluna dedicada (`w-96`) com comportamento push no desktop (`xl`) e fallback overlay/fullscreen no mobile/tablet.
- `Header` passou a usar toggle contextual (`Mary AI ▼`) com `aria-expanded`, sem estado local de chat.
- Lógica de chat foi extraída para `MaryAiChatContent`, reutilizada tanto na sidebar quanto no `MaryAiQuickChatSheet` do onboarding.
- CTAs por perfil implementados (Ativo/Investidor) com fallback para Advisor, além de saudação e disclaimer canônicos.
- Rotas legadas `mary-ai-private` foram deprecadas com redirect e permissão removida de `ROUTE_PERMISSIONS`.
- Ajustado `ProtectedLayoutClient` para seleção exclusiva por breakpoint real (`>=1280` push; `<1280` sheet), eliminando overlay concorrente no desktop.
- Novo `MaryAiEntryFallback` para manter trigger da Mary AI em rotas com `hideHeader` (ex.: `/validacao-epicos`).
- CTAs e disclaimer passaram para fonte compartilhada em `MaryAiChatContent` (`getMaryAiIcebreakers` e `buildMaryAiDisclaimer`), garantindo paridade entre sidebar e sheet.
- Testes reforçados para prevenir regressão de breakpoint, fallback sem header e variação de CTA por perfil.

### Evidências principais

- `src/components/providers/MaryAiProvider.tsx`
- `src/components/mary-ai/MaryAiSidebar.tsx`
- `src/components/mary-ai/MaryAiChatContent.tsx`
- `src/app/(protected)/ProtectedLayoutClient.tsx`
- `src/components/navigation/Header.tsx`
- `src/components/providers/__tests__/MaryAiProvider.test.tsx`
- `src/components/mary-ai/__tests__/MaryAiSidebar.test.tsx`
- `src/components/mary-ai/__tests__/MaryAiQuickChatSheet.test.tsx`
- `src/app/(protected)/__tests__/ProtectedLayoutClient.test.tsx`
- Gate técnico: `npm run build` incremental por arquivo + `npm run lint` + `npm run test` (37/37 suites, 528/528 testes).

## 2026-04-05 | H0.4 - Fechamento final do gate (100%)

### O que mudou

- Rodada final executada para encerrar a unica ressalva aberta do H0.4 (truncamento mobile `...` em trilha `>3`).
- Evidencia conclusiva consolidada via teste automatizado do componente `Breadcrumb`, com assert explicito do caractere de ellipsis no contexto mobile.
- Checklist H0.4 atualizado com decisao final de gate em **APROVADO** (sem ressalvas).
- Rastreabilidade tecnica consolidada em arquivo dedicado de evidencias.

### Evidencias principais

- `.dev/validations/evidence/H0.4/40-mobile-ellipsis-evidence.md`
- `.dev/validations/H0.4-CHECKLIST-VALIDACAO.md`
- `src/components/shared/__tests__/Breadcrumb.test.tsx`

## 2026-04-05 | H0.4 - Implementação incremental do plano (F1-F4)

### O que mudou

- Breadcrumb global refatorado para bloco dedicado abaixo do header (`BreadcrumbBar`) em todo o layout protegido.
- Contrato do componente atualizado para `href?`, com separador textual `>` e regra mobile (`...`) para itens intermediários quando a trilha tem mais de 3 níveis.
- Raiz da trilha padronizada para `Início` e canonicidade do contexto investidor alinhada para rota `pipeline`.
- Regra NDA-gated aplicada ao label de projeto via fonte canônica (`getProjectBreadcrumbLabel`): investidor sem NDA vê codename, com NDA vê name.
- Estado de hidratação sensível protegido com `BreadcrumbSkeleton`, evitando render prematuro de label sensível.
- Cobertura automatizada adicionada para resolução de trilha, render do componente e integração no `NavigationProvider`.

### Evidências principais

- `src/components/shared/Breadcrumb.tsx`
- `src/components/navigation/BreadcrumbBar.tsx`
- `src/components/navigation/BreadcrumbSkeleton.tsx`
- `src/components/providers/NavigationProvider.tsx`
- `src/lib/breadcrumbs/resolveBreadcrumbs.ts`
- `src/lib/actions/projects.ts`
- `src/lib/breadcrumbs/__tests__/resolveBreadcrumbs.test.ts`
- `src/components/shared/__tests__/Breadcrumb.test.tsx`
- `src/components/providers/__tests__/NavigationProvider.breadcrumbs.test.tsx`
- `.dev/validations/H0.4-CHECKLIST-VALIDACAO.md`

## 2026-04-05 | H0.4 - Rerun spec-tester via cursor-ide-browser

### O que mudou

- Rodada de validação manual executada no `localhost:3001` com MCP `cursor-ide-browser`.
- Confirmado em browser real: raiz `Início`, separador `>`, breadcrumb em bloco dedicado abaixo do header e rota canônica `pipeline` sem redirect indevido.
- Checklist H0.4 atualizado com evidências da rodada e decisão de gate revisada para **APROVADO COM RESSALVAS**.
- Ressalvas remanescentes documentadas: validação completa de NDA-gated (`name` vs `codename`) e cenário mobile com trilha `> 3` níveis.

## 2026-04-05 | H0.4 - Rodada focada nas 2 ressalvas (plano executável)

### O que mudou

- Rodada focada executada para as 2 ressalvas remanescentes com `cursor-ide-browser` + `user-supabase`.
- Cenário NDA-gated comprovado no mesmo projeto:
  - sem NDA aprovado: breadcrumb exibiu `codename`.
  - com NDA aprovado: breadcrumb exibiu `name`.
- Evidência de estado de hidratação com skeleton capturada na abertura da rota profunda.
- Rota profunda `/${orgSlug}/projects/${codename}/members` usada como trilha com 4 níveis para avaliação de truncamento.
- Resultado consolidado da rodada: **APROVADO COM RESSALVAS** (truncamento mobile com `...` segue não conclusivo no ambiente de execução integrado).

### Evidências principais

- `.dev/validations/evidence/H0.4/36-nda-ellipsis-round.md`
- `agent-tools/b24d8ff7-f9c2-4a0b-b380-5b88398cc605.txt`

## 2026-04-05 | H0.4 - Execução do checklist de validação (Opção C)

### O que mudou

- Onboarding da conta de teste foi concluído no fluxo normal para liberar acesso às rotas protegidas com `orgSlug`.
- Checklist H0.4 atualizado com execução real em browser (desktop + mobile), incluindo evidências e gate formal de revisão.
- Resultado da rodada: **REPROVADO**, com gaps críticos em breadcrumb raiz (`MRS` em vez de `Início`) e cobertura de `pipeline`.

### Evidências principais

- `.dev/validations/H0.4-CHECKLIST-VALIDACAO.md`
- `.dev/validations/evidence/H0.4/06-dashboard-desktop.png`
- `.dev/validations/evidence/H0.4/07-radar-desktop.png`
- `.dev/validations/evidence/H0.4/08-settings-desktop.png`
- `.dev/validations/evidence/H0.4/09-projects-desktop.png`
- `.dev/validations/evidence/H0.4/10-radar-mobile.png`
- `.dev/validations/evidence/H0.4/11-project-members-mobile.png`
- `.dev/validations/evidence/H0.4/12-console-errors.log`

## 2026-04-05 | H0.3 - Pipeline 12 fases (fechamento técnico + validação MCP)

### Atualização de fechamento final (sem ressalvas)

- Itens remanescentes do checklist H0.3 fechados: `1.1`, `4.3`, `5.6`, `7.1`, `7.2`, `7.4`, `8.4`, `9.6`, `10.1`, `10.3`.
- Evidência nova para bloqueio inválido (`7.2`) adicionada: `.dev/validations/evidence/H0.3/12-72-transicao-invalida-bloqueio.png` + validação SQL de status inalterado.
- Gate NDA (`10.1`) consolidado com prova dupla (visual + SQL): `07-nda-gate-negativo-bloqueado.png`, `08-nda-gate-positivo-projeto-criado.png`, `pos_exists=1` e `neg_exists=0`.
- Gate técnico executado nesta rodada: `npm run test` (516/516), `npm run build` verde, e rastreabilidade CI via `gh run list`.
- Decisão de rota/contexto formalizada: investidor opera pipeline em `/${orgSlug}/pipeline`; aliases `/${orgSlug}/projetos` e `/${orgSlug}/projeto` resolvem por perfil.
- Resultado final da validação H0.3 atualizado para **APROVADO** (sem ressalvas).

### O que mudou

- Corrigido bloqueador de runtime/chunks em dev (`/login` e `/`), com ajuste de i18n em `src/i18n/request.ts` e restart limpo do `next dev`.
- Criado contrato central de status em `src/lib/projects/status-flow.ts` com ordem das 12 fases, saídas laterais e matriz de transição H0.3.
- Atualizados tipos e labels de `project_status` em `src/types/database.ts` e estilos semânticos em `src/types/projects.ts`.
- Atualizadas actions e UI para consumir contrato único (sem duplicação), incluindo pipeline com 12 colunas, toggle Lista/Pipeline, busca, filtro e drag-and-drop.
- Migração H0.3 adicionada em `supabase/migrations/20260405124000_h03_pipeline_12_fases.sql` e aplicada via MCP (enum + contrato de escrita + remapeamento `spa -> dd_spa`).
- Migração complementar de fechamento criada em `supabase/migrations/20260406113000_h03_finalize_audit_and_history.sql` com:
  - evento de auditoria técnico `pipeline.migration_5_to_12`;
  - helper de leitura histórica `map_legacy_project_status_for_history` (`spa -> dd_spa`).
- Cobertura de testes ampliada com `projects-status-transitions.test.ts` e extensão de `projects-status-gates.test.ts`.
- Regras de progressão MRS reforçadas para pós-NBO em `src/lib/projects/status-gates.ts` (fechamento do item 4.4).
- Tooltips críticos adicionados no `PipelineBoard` para reduzir ambiguidade em ações/fases (fechamento do item 9.5).
- Página de projeto endurecida para fallback seguro de Readiness/MRS em estados incompletos (fechamento do item 10.4).
- Item 6.4 registrado formalmente como fora de escopo desta rodada H0.3 (sem blocker técnico imediato), com mitigação via backlog dedicado.

### Evidencias principais

- `.dev/validations/H0.3-CHECKLIST-VALIDACAO.md`
- `.dev/validations/evidence/H0.3/RUN-2026-04-05.md`
- `.dev/validations/evidence/H0.3/01-pipeline-12-colunas-rerun.png`
- `.dev/validations/evidence/H0.3/06-dragdrop-screening-teaser-rerun.png`
- `.dev/validations/evidence/H0.3/09-tooltip-pipeline-h03.png`
- `src/lib/projects/status-flow.ts`
- `src/components/projects/PipelineBoard.tsx`
- `supabase/migrations/20260405124000_h03_pipeline_12_fases.sql`
- `supabase/migrations/20260406113000_h03_finalize_audit_and_history.sql`

## 2026-04-04 | H0.1 - Onboarding Ativo (4 passos Excalidraw)

### O que mudou

- Fluxo do perfil Ativo atualizado para suportar os steps `asset_company_data`, `asset_matching_data`, `asset_team` e `asset_codename`.
- Wizard, roteamento e tipos de onboarding atualizados para separar fluxo de Ativo sem regressao de Investor/Advisor.
- Novos componentes de onboarding criados para objetivo dinamico, modelo de negocio, percentual, sede, advisors e codinome.
- Novos steps de Ativo adicionados no enum `onboarding_step` via migration Supabase.
- Actions de onboarding expandidas com `saveAssetCompanyData`, `saveAssetMatchingData`, `saveAssetTeamData`, `saveAssetCodename` e `autoSaveOnboardingField`.

### Evidencias principais

- `supabase/migrations/20260404100000_h01_asset_onboarding_steps.sql`
- `src/types/database.ts`
- `src/types/onboarding.ts`
- `src/components/onboarding/OnboardingWizard.tsx`
- `src/lib/actions/onboarding.ts`
- `src/lib/actions/__tests__/onboarding.test.ts`

## 2026-04-05 | H0.1/P4 - Fechamento de gaps 5.5 a 5.9 (Codinome)

### O que mudou

- Decisao D0-B formalizada: conclusao visual/final movida para o fim real do onboarding (apos `terms_acceptance`), mantendo compliance.
- `asset_codename` passou a concluir dados e seguir para termos (CTA: "Continuar para termos"), sem finalizar onboarding prematuramente.
- Modal final de parabens com copy oficial da spec e botao `Ver meu MRS` implementado em `TermsAcceptance`.
- Redirect final para `/${orgSlug}/mrs` aplicado no fluxo de conclusao do perfil Ativo.
- `completeOnboarding` passou a garantir seed de projeto inicial para org Ativo (quando ausente), usando codinome preenchido no onboarding.
- Sidebar do Ativo passou a exibir label dinamica priorizando `projects.name || projects.codename` com fallback em `onboarding_data.assetCodenameData.codename`.

### Evidencias principais

- `.dev/specs/H0.1-ONBOARDING-ATIVO/P4-CODINOME.md`
- `.dev/validations/H0.1-SUBSPECS-VALIDACAO-RODADA-1.md`
- `src/components/onboarding/steps/asset/AssetCodenameStep.tsx`
- `src/components/onboarding/TermsAcceptance.tsx`
- `src/components/onboarding/OnboardingWizard.tsx`
- `src/app/onboarding/[step]/page.tsx`
- `src/lib/actions/onboarding.ts`
- `src/components/providers/NavigationProvider.tsx`
- `src/components/onboarding/__tests__/AssetCodenameStep.test.tsx`

## 2026-04-03 | Limpeza estrutural da pasta production

### O que mudou

- Movidos para `done/` 17 documentos de trabalho concluido (cadeia E3, E4, MFA, runbooks, context engineering intermediario).
- Deletados 6 documentos supersedidos pelo PRD v3.0 e Backlog v3.0: 1-PRD.md, 2-REVIEW_GATE_PRD_PIVOT.md, 3-DEVELOPMENT_PLAN.md, 4-CHANGELOG-PIVOT-07-03.md, 5-PRD_IMPLEMENTATION_AUDIT.md, 28-CHANGELOG-CONTEXT-ENGINEERING-FRONTEND.md.
- Pasta production reduzida de ~25 arquivos + 3 subpastas para 7 arquivos e 0 subpastas.
- Deletadas subpastas done/ (22 docs), client-validation/ (15 checklists) e validate/ (1 checklist) — resquicios do ciclo v2.2, obsoletos apos PRD v3.0.
- AGENTS.md reescrito para refletir nova estrutura.
- Justificativa: todo historico preservado no Git. Checklists de validacao serao criados sob demanda alinhados ao E0.

## 2026-03-23 - 2026-03-31 | Pivot MVP + Fechamento E4

### O que mudou

- Pivot do MVP para escopo essencial e incremental.
- Consolidacao de backlog oficial, plano de execucao e gates formais.
- Entregas de Radar por tese ativa e CTAs (teaser/follow/NDA) com persistencia.
- Fechamento do contrato E4 (status canonico, gates de criacao e auditoria).
- Runbooks de staging/producao e limpeza completa da base de teste.

### Evidencias principais

- `6-PRODUCT_BACKLOG_PRIORIZADO.md`
- Docs de E4 (deletados — historico no Git): 17-REVIEW-GATE-E4-IMPLEMENTACAO, 18-SUPABASE-VALIDACAO-E4, 19-RUNBOOK-STAGING-E4-EXECUCAO, 20-RUNBOOK-PRODUCAO-E4-ANTI-DRIFT-EXECUCAO, 21-RUNBOOK-LIMPEZA-BASE-TESTE

## 2026-04-01 | Context Engineering Frontend

### O que mudou

- Bootstrap da esteira Excalidraw x App com inventario, matriz e piloto.
- Criacao de gate formal para alinhamento frontend/documentacao.
- Atualizacao documental do E1 de validacao cliente com rastreabilidade.

### Evidencias principais

- Docs de context engineering (deletados — historico no Git): 24-AUDIT-EXCALIDRAW-FRONTEND-INVENTARIO, 25-MATRIZ-CONFORMIDADE, 26-PILOTO-CONTEXT-ENGINEERING, 27-REVIEW-GATE-CONTEXT-ENGINEERING, 29-PADRAO-E1-NAVEGACAO, E1-VALIDACAO-CLIENTE-NAVEGACAO

## 2026-04-04 | H0.7 - Revalidacao menu lateral por perfil

### O que mudou

- Correcao de carregamento da rota `/advisor/profile` para eliminar falha intermitente de chunk na validacao