# Modulo Radar NDA - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Radar NDA
- **Owner tecnico:** Time Matching/Discovery (confirmar)
- **Owner de negocio:** Produto Investor + Produto Asset (confirmar)
- **Status:** em desenvolvimento (MVP ativo)
- **Ultima atualizacao:** 2026-03-29

## 2) Objetivo de negocio

- **Problema que resolve:** formalizar solicitacao de NDA a partir do Radar para avancar o relacionamento.
- **Publico/area impactada:** organizacoes `investor` (solicita) e `asset` (recebe/avalia).
- **Valor esperado:** criar trilha auditavel de interesse qualificado.
- **Nao objetivos:** assinatura juridica completa dentro do produto.

## 3) Escopo funcional

- **Entradas principais:** org investidor autenticada, oportunidade publica, tese ativa opcional.
- **Processamentos-chave:** verificar acesso, evitar duplicidade, criar `nda_requests`, notificar owners/admins do asset.
- **Saidas/entregaveis:** estado `NDA solicitado` no card e registro persistido com status.
- **Fluxo principal:** clicar `Solicitar NDA` -> criar request `pending` -> notificar asset.
- **Fluxos alternativos:** request existente retorna sem duplicar; conta pendente bloqueia CTA.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI client, Server Action, DB (RLS), notificacoes.
- **Componentes/servicos principais:**
  - `src/components/radar/OpportunitiesList.tsx`
  - `src/lib/actions/radar.ts`
  - `src/lib/actions/notifications.ts`
  - `supabase/migrations/20260326110000_create_radar_cta_tables.sql`
- **Dependencias internas:** modulo `radar`, modulo `thesis` (vinculo opcional via `thesis_id`).
- **Decisoes arquiteturais relevantes:** idempotencia por indice unico ativo e bloqueio em `readOnlyMode`.

## 5) Estrutura tecnica no codigo

- **Server action de solicitacao:** `requestNdaForOpportunity` em `src/lib/actions/radar.ts`
- **Estado de CTA no card:** `hasNdaRequest` e `canRequestNda` em `src/components/radar/OpportunitiesList.tsx`
- **Schema e RLS:** `nda_requests` em `supabase/migrations/20260326110000_create_radar_cta_tables.sql`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `nda_requests`, `organizations`, `organization_members`, `projects`.
- **Campos criticos:** `status`, `investor_organization_id`, `asset_organization_id`, `project_id`, `requested_by`.
- **Regras de validacao:** sem auto-solicitacao para propria organizacao; sem duplicidade ativa.
- **Regras de autorizacao:** RLS por membership e permissao de revisao para `owner/admin` do asset.

## 7) Seguranca e conformidade

- **Risco atual:** solicitacoes indevidas sem controle de role e duplicidade.
- **Mitigacao recomendada:** manter RLS, indice unico ativo e validacoes server-side.
- **Urgencia:** alta.

## 8) Backlog do modulo

- Implementar fluxo de aprovacao/rejeicao de NDA no lado asset.
- Integrar pipeline por etapa apos criacao de NDA.
- Adicionar auditoria explicita para mudancas de status.
- Instrumentar metrica de conversao teaser -> NDA.

## Evidencias usadas para este modulo

- `src/lib/actions/radar.ts`
- `src/components/radar/OpportunitiesList.tsx`
- `src/types/radar.ts`
- `supabase/migrations/20260326110000_create_radar_cta_tables.sql`
