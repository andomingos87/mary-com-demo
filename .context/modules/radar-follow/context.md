# Modulo Radar Follow - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Radar Follow
- **Owner tecnico:** Time Matching/Discovery (confirmar)
- **Owner de negocio:** Produto Investor (confirmar)
- **Status:** em desenvolvimento (MVP ativo)
- **Ultima atualizacao:** 2026-03-29

## 2) Objetivo de negocio

- **Problema que resolve:** registrar interesse recorrente do investidor em oportunidades do Radar.
- **Publico/area impactada:** organizacoes `investor`.
- **Valor esperado:** apoiar shortlist, sinais de intencao e priorizacao de relacionamento.
- **Nao objetivos:** substituir pipeline formal de deal.

## 3) Escopo funcional

- **Entradas principais:** org investidora autenticada, oportunidade publica, CTA de card.
- **Processamentos-chave:** alternar estado seguir/desseguir com persistencia.
- **Saidas/entregaveis:** estado `Seguir`/`Seguindo` no card e registro em `investor_follows`.
- **Fluxo principal:** clicar `Seguir` -> criar follow; clicar novamente -> remover (soft delete).
- **Fluxos alternativos:** bloqueio para seguir a propria organizacao; bloqueio em `readOnlyMode`.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI client, Server Action, DB (RLS).
- **Componentes/servicos principais:**
  - `src/components/radar/OpportunitiesList.tsx`
  - `src/lib/actions/radar.ts`
  - `src/types/radar.ts`
  - `supabase/migrations/20260326110000_create_radar_cta_tables.sql`
- **Dependencias internas:** modulo `radar` (orquestracao) e `radar-nda` (CTAs do funil).
- **Decisoes arquiteturais relevantes:** idempotencia por indice unico ativo e soft delete para historico operacional.

## 5) Estrutura tecnica no codigo

- **Server action de follow:** `toggleFollowOpportunity` em `src/lib/actions/radar.ts`
- **Estado de CTA no card:** `ctaState.isFollowing` em `src/components/radar/OpportunitiesList.tsx`
- **Schema e RLS:** `investor_follows` em `supabase/migrations/20260326110000_create_radar_cta_tables.sql`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `investor_follows`, `projects`, `organizations`.
- **Campos criticos:** `investor_organization_id`, `asset_organization_id`, `project_id`, `deleted_at`.
- **Regras de validacao:** nao permitir follow da propria organizacao; somente oportunidades publicas.
- **Regras de autorizacao:** membership obrigatoria na org investidora + RLS em `investor_follows`.

## 7) Seguranca e conformidade

- **Risco atual:** follow indevido por usuario sem permissao da org investidora.
- **Mitigacao recomendada:** manter validacao server-side e RLS por membership.
- **Urgencia:** media-alta.

## 8) Backlog do modulo

- Integrar eventos de follow no Feed.
- Exibir agregados de follows por oportunidade no lado asset (quando aplicavel).
- Adicionar testes de regressao para alternancia concorrente.

## Evidencias usadas para este modulo

- `src/lib/actions/radar.ts`
- `src/components/radar/OpportunitiesList.tsx`
- `src/types/radar.ts`
- `supabase/migrations/20260326110000_create_radar_cta_tables.sql`
