# Modulo MRS - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** MRS
- **Owner tecnico:** Time Asset Readiness (confirmar)
- **Owner de negocio:** Produto Ativo (confirmar)
- **Status:** implementado (MVP canonico)
- **Ultima atualizacao:** 2026-03-26

## 0) Contrato canonico vigente

- **Spec canonica:** `.dev/production/done/10-SPEC-GAP4-MRS-CANONICO.md`
- **Escopo normativo ativo:** passos 1-4, status `pendente/parcial/completo/na`, prioridade `critica/alta/media`, score por passo/total e gates NDA/NBO.
- **Regra de governanca:** qualquer mudanca de contrato deve ser atualizada primeiro na spec canonica.

## 2) Objetivo de negocio

- **Problema que resolve:** dar transparencia de prontidao documental para ativos e apoiar matching.
- **Publico/area impactada:** perfil asset e stakeholders de diligencia.
- **Valor esperado:** evolucao progressiva de readiness com criterio mensuravel.
- **Nao objetivos:** benchmark setorial ativo no MVP atual.

## 3) Escopo funcional

- **Entradas principais:** dados de projeto, checklist de readiness e contribuicao de documentos VDR.
- **Processamentos-chave:** calculo de score canonico por passo/total, gates NDA/NBO, persistencia de historico e metadados por item.
- **Saidas/entregaveis:** score por passo, score total, status de gate NDA/NBO e trilha operacional por item.
- **Fluxo principal:** atualizar item/status/arquivos -> recalcular score e gates -> refletir score no projeto.
- **Fluxos alternativos:** campo sem validacao previa, projeto sem documentos VDR.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** Server Actions, DB, UI dedicada de MRS, regras de dominio.
- **Componentes/servicos principais:**
  - `src/app/(protected)/[orgSlug]/mrs/page.tsx`
  - `src/lib/actions/readiness.ts`
  - `src/lib/readiness/**`
  - `src/lib/readiness/mrs.ts`
  - `src/components/mrs/MrsWorkspace.tsx`
- **Dependencias internas:** `projects`, `vdr_documents`, `audit_logs`.
- **Decisoes arquiteturais relevantes:** contrato canonico do MRS persiste em `readiness_data.mrs` e atualiza `readiness_score` com score total do contrato quando ativo.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/[orgSlug]/mrs/page.tsx`
- **Acoes de servidor:** `src/lib/actions/readiness.ts`
- **Regras de dominio:** `src/lib/readiness/checklist.ts`, `src/lib/readiness/score.ts`, `src/lib/readiness/mrs.ts`
- **Testes:** `src/lib/readiness/__tests__/score.test.ts`, `src/lib/readiness/__tests__/mrs.test.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `projects`, `vdr_documents`.
- **Campos criticos:** `readiness_score`, `readiness_data`, `field_metadata`.
- **Regras de validacao:** L2 exige L1, L3 exige L2.
- **Contratos de API/eventos:** `calculateReadinessScore`, `updateProjectReadiness`, `validateField`, `auditField`.
- **Regras de autorizacao:** autenticacao obrigatoria e acesso ao projeto por membership.

## 7) Seguranca e conformidade

- **Risco atual:** necessidade de monitorar calibragem de thresholds apos uso real.
- **Mitigacao recomendada:** revisar telemetria de score/gates apos primeiro ciclo operacional.
- **Urgencia:** media.

## 8) Backlog do modulo

- Consolidar monitoramento de bloqueios de gate e tempos de conclusao por passo.
- Expandir metadados de upload para integracao com storage real por bucket dedicado.
- Avaliar rollout de override operacional com governanca.

## Evidencias usadas para este modulo

- `src/app/(protected)/[orgSlug]/mrs/page.tsx`
- `src/lib/actions/readiness.ts`
- `src/lib/readiness/checklist.ts`
- `src/lib/readiness/score.ts`
- `src/lib/readiness/mrs.ts`
- `src/components/mrs/MrsWorkspace.tsx`
- `src/lib/readiness/__tests__/mrs.test.ts`
- `.dev/production/done/10-SPEC-GAP4-MRS-CANONICO.md`
- `.dev/production/done/11-CHECKLIST-VALIDACAO-MRS.md`
