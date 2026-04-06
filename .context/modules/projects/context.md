# Modulo Projects - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Projects
- **Owner tecnico:** Time Deal Execution (confirmar)
- **Owner de negocio:** Produto Operacional (confirmar)
- **Status:** em desenvolvimento (E4 implementado em 26/03/2026)
- **Ultima atualizacao:** 2026-03-26

## 2) Objetivo de negocio

- **Problema que resolve:** organizar iniciativas de venda/captacao com status e colaboradores.
- **Publico/area impactada:** principalmente perfil asset e advisor.
- **Valor esperado:** rastreabilidade de andamento e colaboracao estruturada.
- **Nao objetivos:** automacoes avancadas de deals fora do recorte MVP.

## 3) Escopo funcional

- **Entradas principais:** dados do projeto (nome, codename, objetivo, setor, faixa de valor), membros e convites.
- **Processamentos-chave:** CRUD de projetos, calculo de readiness base, controle de visibilidade e auditoria.
- **Saidas/entregaveis:** hub de projetos, cards, pagina por codename e membros.
- **Fluxo principal:** criar projeto -> listar -> abrir detalhe -> ajustar dados e equipe.
- **Fluxos alternativos:** restricoes por role, convites duplicados, codename em conflito.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI, Server Actions, DB, Auditoria.
- **Componentes/servicos principais:**
  - `src/app/(protected)/[orgSlug]/projects/page.tsx`
  - `src/lib/actions/projects.ts`
  - `src/components/projects/**`
  - `src/types/projects.ts`
- **Dependencias internas:** `project_members`, `project_invites`, `audit_logs`, readiness.
- **Decisoes arquiteturais relevantes:** codename unico por org e soft delete.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/[orgSlug]/projects/**`, `src/app/(protected)/[orgSlug]/projeto/page.tsx`
- **Componentes UI:** `src/components/projects/**`
- **Acoes de servidor:** `src/lib/actions/projects.ts`, `src/lib/actions/project-members.ts`, `src/lib/actions/project-invites.ts`
- **Schemas/tipos:** `src/types/projects.ts`, `src/types/database.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `projects`, `project_members`, `project_invites`.
- **Campos criticos:** `codename`, `objective`, `status`, `visibility`, `readiness_score`.
- **Regras de validacao:** codename unico, validacoes de faixa e papel de acesso.
- **Contratos de API/eventos:** `createProject`, `listProjects`, `updateProject`, `changeProjectStatus`, `deleteProject`.
- **Regras de autorizacao:** acesso filtrado por membership e visibilidade.

## 7) Seguranca e conformidade

- **Risco atual:** regressao entre contratos legados e contrato canônico em ambientes não migrados.
- **Mitigacao recomendada:** aplicar migration E4 + checklist de validação pós-migration + rollback documentado.
- **Urgencia:** media-alta.
- **Atualizacao contratual E4 (26/03/2026):** contrato canônico definido em `.dev/production/13-SPEC-GAP5-PROJETOS-MARCOS-JURIDICOS.md` com matriz de transicao e gate de criacao por NDA.
 - **Atualizacao de implementacao E4 (26/03/2026):** status canônico, gate NDA, matriz de transição e auditoria mínima implementados em código + migration.
- **Atualizacao de validacao staging E4 (26/03/2026):** runbook executado com NO-GO temporário por falta de smoke E2E autenticado (`.dev/production/19-RUNBOOK-STAGING-E4-EXECUCAO.md`).
- **Atualizacao de validacao producao E4 (26/03/2026):** anti-drift executado com historico reconciliado e checks SQL OK, porem gate final permaneceu NO-GO temporario por pendencia de smoke funcional autenticado e ausencia de eventos E4 no `audit_logs` durante a janela (`.dev/production/20-RUNBOOK-PRODUCAO-E4-ANTI-DRIFT-EXECUCAO.md`).

## 8) Backlog do modulo

- Validar aplicação da migration E4 em staging/producao.
- Expandir testes de integração do fluxo de criação por NDA no contexto investidor.
- Monitorar eventos de auditoria E4 em operação.

## Evidencias usadas para este modulo

- `src/app/(protected)/[orgSlug]/projects/page.tsx`
- `src/lib/actions/projects.ts`
- `src/components/projects/ProjectCard.tsx`
- `src/components/projects/CreateProjectDialog.tsx`
- `src/types/projects.ts`
- `.dev/production/12-AUDIT-GAP5-E4-BASELINE.md`
- `.dev/production/13-SPEC-GAP5-PROJETOS-MARCOS-JURIDICOS.md`
- `.dev/production/14-REVIEW-GATE-E4-PROJETOS-MARCOS.md`
- `.dev/production/15-PLAN-GAP5-IMPLEMENTACAO-TECNICA.md`
- `.dev/production/16-KICKOFF-E4-ESPECIALISTAS.md`
- `.dev/production/17-REVIEW-GATE-E4-IMPLEMENTACAO.md`
- `.dev/production/18-SUPABASE-VALIDACAO-E4.md`
- `supabase/migrations/20260326153000_e4_project_status_gate_audit.sql`
- `.dev/production/19-RUNBOOK-STAGING-E4-EXECUCAO.md`
- `.dev/production/20-RUNBOOK-PRODUCAO-E4-ANTI-DRIFT-EXECUCAO.md`
