# Modulo Onboarding - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Onboarding
- **Owner tecnico:** Time de Produto/Engenharia (confirmar owner nominal)
- **Owner de negocio:** Time de Operacoes e Growth (confirmar owner nominal)
- **Status:** estavel
- **Ultima atualizacao:** 2026-03-29

## 2) Objetivo de negocio

- **Problema que resolve:** transformar cadastro inicial em conta organizacional pronta para uso, com coleta de dados e gate de elegibilidade.
- **Publico/area impactada:** novos usuarios (investor, asset, advisor), time de operacoes e suporte.
- **Valor esperado:** reduzir abandono no cadastro, melhorar qualidade de dados, controlar risco de acesso com revisao quando necessario.
- **Nao objetivos (fora de escopo):** operacao continua de projetos, VDR, pipeline e analytics avancado.

## 3) Escopo funcional

- **Entradas principais:**
  - perfil da organizacao (`investor | asset | advisor`)
  - CNPJ
  - website, descricao, telefone, LinkedIn
  - dados de elegibilidade (deals, valor, experiencia)
  - aceite de termos
- **Processamentos-chave:**
  - criacao/retomada de organizacao em rascunho
  - enriquecimento por CNPJ e website
  - validacao de elegibilidade por perfil
  - gravacao de progresso em `onboarding_data.flow`
  - transicoes de step e gates de acesso a areas protegidas
- **Saidas/entregaveis:**
  - organizacao com `onboarding_step` atualizado
  - `verification_status` coerente com estado
  - dados estruturados em colunas da org + JSON `onboarding_data`
- **Fluxo principal (happy path):**
  - perfil selecionado -> `cnpj_input` -> `data_enrichment` -> `data_confirmation` -> `profile_details` -> `eligibility_check` -> `terms_acceptance` -> `mfa_setup` -> `completed`
- **Fluxos alternativos/erros:**
  - perfil `asset` pula `eligibility_check`
  - nao elegivel vai para `pending_review`
  - usuario sem org ou sem auth redireciona para login/onboarding
  - retorno para step atual quando tenta pular etapas na URL
  - erro de validacao em formularios faz scroll/focus para o primeiro campo invalido (melhora de UX)
  - retomada prioriza org incompleta com `profile_type` definido para evitar redirect indevido para `profile_selection`

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI, Server Actions, DB, Integracoes, Auth gate.
- **Componentes/servicos principais:**
  - `src/components/onboarding/OnboardingWizard.tsx`
  - `src/components/onboarding/hooks/useOnboarding.ts`
  - `src/lib/actions/onboarding.ts`
  - `src/lib/actions/eligibility.ts`
  - `src/app/onboarding/page.tsx`
  - `src/app/onboarding/[step]/page.tsx`
  - `src/app/onboarding/pending-review/page.tsx`
- **Dependencias internas:**
  - `src/types/onboarding.ts`
  - `src/types/database.ts`
  - `src/lib/supabase/server.ts`
  - `src/lib/actions/navigation.ts`
  - `src/app/(protected)/layout.tsx`
- **Dependencias externas:**
  - Supabase Auth/DB
  - integracoes de enrichment usadas em `src/lib/actions/onboarding.ts`
  - envio de email para revisao manual em `src/lib/actions/eligibility.ts`
- **Decisoes arquiteturais relevantes:**
  - selecao de perfil migrou para landing (compatibilidade legada mantida em `profile_selection`)
  - gate de onboarding fora e dentro de middleware/layout para evitar bypass por rota
  - progresso persistido em JSON + colunas de organizacao para facilitar leitura no app

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/onboarding/**`, `src/app/(protected)/**`
- **Componentes UI:** `src/components/onboarding/**`
- **Acoes de servidor:** `src/lib/actions/onboarding.ts`, `src/lib/actions/eligibility.ts`
- **Schemas/tipos:** `src/types/onboarding.ts`, `src/types/database.ts`
- **Migrations/policies:** `supabase/migrations/20251229125143_organizations_rbac_phase2.sql`, `supabase/migrations/20260110000000_profile_backcompat.sql`

## 6) Dados e contratos

- **Entidades/tabelas principais:**
  - `organizations`
  - `organization_members`
  - `eligibility_reviews` (fluxo de revisao manual)
  - `audit_logs` (trilha de auditoria)
- **Campos criticos:**
  - `organizations.onboarding_step`
  - `organizations.onboarding_data`
  - `organizations.profile_type`
  - `organizations.verification_status`
  - `organizations.onboarding_started_at`
  - `organizations.onboarding_completed_at`
- **Regras de validacao:**
  - `startOnboarding` aceita apenas `investor|asset|advisor`
  - CNPJ passa por limpeza e validacao de formato antes do enrichment
  - `saveProfileDetails` exige consistencia entre `profileType` enviado e `org.profile_type`
  - `acceptTerms` exige aceite dos 3 termos
  - `completeOnboarding` so finaliza em steps validos (`mfa_setup`, `terms_acceptance`, `pending_review`)
- **Contratos de API/eventos:**
  - actions retornam `ActionResult<T>` em `src/types/onboarding.ts`
  - auditoria com eventos como `onboarding.started`, `onboarding.step_completed`, `onboarding.completed`, `onboarding.eligibility_submitted`
- **Regras de autorizacao (RLS/permissoes):**
  - acesso protegido por sessao + filtros por `created_by`/org
  - layout protegido redireciona para onboarding enquanto incompleto (exceto `pending_review`)

## 7) Seguranca e conformidade

- **Dados sensiveis envolvidos:** CNPJ, dados societarios, telefone, website, dados declarados de deals e experiencia.
- **Controles aplicados:**
  - autenticacao obrigatoria antes de qualquer action
  - uso de admin client com verificacao de org e trilha de auditoria
  - gate de rotas protegidas para impedir acesso sem onboarding completo
- **Riscos atuais:**
  - risco de divergencia entre fluxo esperado e estado salvo em `onboarding_data.flow.steps_completed`
  - risco de regras de elegibilidade mudarem sem atualizar testes de tipos/fluxo
- **Mitigacoes recomendadas:**
  - adicionar teste de integracao cobrindo transicoes completas por perfil
  - criar checklist de alteracao de criterio com update obrigatorio de testes e docs

## 8) Observabilidade e operacao

- **Logs importantes:**
  - erros `Unexpected error in ...` nas actions de onboarding
  - eventos de auditoria gerados por `logOnboardingAuditEvent` e `logEligibilityAuditEvent`
- **Metricas-chave:**
  - taxa de conclusao por step
  - tempo medio de onboarding (started_at -> completed_at)
  - taxa de queda em `eligibility_check` e `pending_review`
- **Alertas necessarios:**
  - pico de falhas em enrichment CNPJ/website
  - aumento de erro em `acceptTerms` e `saveProfileDetails`
- **Runbook basico (falhas comuns + acao):**
  - erro de auth: validar sessao/cookies e middleware
  - erro de transicao: validar `onboarding_step` atual e payload do step
  - erro de revisao manual: conferir insercao em `eligibility_reviews` e envio de email

## 9) Qualidade e testes

- **Testes unitarios existentes:**
  - `src/lib/actions/__tests__/onboarding.test.ts` (ordem, navegacao, progresso, criterios)
  - `src/components/onboarding/__tests__/CnpjInput.test.tsx`
  - `src/components/onboarding/__tests__/ProfileSelector.test.tsx`
- **Testes de integracao existentes:** nao identificados no modulo de onboarding end-to-end.
- **Cenarios criticos sem cobertura:**
  - jornada completa server + UI para cada perfil
  - transicao para `pending_review` com requisicao manual de revisao
  - bloqueio de acesso por URL quando usuario tenta pular step
- **Plano minimo de teste manual:**
  - perfil investor: concluir fluxo ate dashboard
  - perfil asset: validar pulo de elegibilidade
  - perfil advisor inelegivel: validar rota `pending-review`
  - retomar onboarding em sessao nova no step correto

## 10) Backlog do modulo

- **Divida tecnica:**
  - consolidar logica de progresso para evitar duplicidade entre wizard, hook e action.
- **Melhorias de curto prazo:**
  - criar testes de integracao de transicao de step por perfil.
  - padronizar mensagens de erro das actions para telemetria.
- **Melhorias de medio prazo:**
  - painel operacional interno com funil por step e tempo medio.
  - versionar contrato de `onboarding_data` com schema validavel.
- **Riscos bloqueantes e plano de resolucao:**
  - **Issue:** ausencia de migration explicita no repo para alguns campos de onboarding (apesar de tipos gerados mostrarem os campos).
  - **Solucao recomendada:** auditar schema real do banco e adicionar migration de normalizacao/backfill documentada.
  - **Justificativa:** reduz risco de drift entre ambientes e falhas em deploy.
  - **Urgencia:** alta, antes de proxima janela de release.

## 11) Checklist de pronto

- [ ] Escopo funcional validado com negocio.
- [ ] Requisitos de seguranca aplicados.
- [ ] Testes minimos implementados e executados.
- [ ] Documentacao tecnica atualizada.
- [ ] Monitoramento basico definido.

## 12) Historico de decisoes

| Data | Decisao | Motivo | Impacto |
|------|---------|--------|---------|
| 2026-03-25 | Criar modulo dedicado de contexto para onboarding | Padronizar analise e execucao por evidencias | Melhora consistencia entre sessoes e handoff |
| 2026-03-29 | Scroll/focus no primeiro erro e ajuste de redirect de retomada | Reduzir friccao de preenchimento e corrigir envio indevido de investidor para `profile_selection` | Melhora UX de correcao e confiabilidade de retomada do onboarding |

## Evidencias usadas para este modulo

- `src/lib/actions/onboarding.ts`
- `src/lib/actions/eligibility.ts`
- `src/types/onboarding.ts`
- `src/types/database.ts`
- `src/app/onboarding/page.tsx`
- `src/app/onboarding/[step]/page.tsx`
- `src/app/onboarding/pending-review/page.tsx`
- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/[orgSlug]/layout.tsx`
- `src/middleware.ts`
- `src/lib/actions/__tests__/onboarding.test.ts`
- `supabase/migrations/20251229125143_organizations_rbac_phase2.sql`
- `supabase/migrations/20260110000000_profile_backcompat.sql`
