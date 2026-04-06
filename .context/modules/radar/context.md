# Modulo Radar - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Radar
- **Owner tecnico:** Time Matching/Discovery (confirmar)
- **Owner de negocio:** Produto Core (confirmar)
- **Status:** em desenvolvimento (MVP ativo para investidor)
- **Ultima atualizacao:** 2026-03-29

## 2) Objetivo de negocio

- **Problema que resolve:** descoberta de oportunidades aderentes para investidor e inicio de relacionamento.
- **Publico/area impactada:** investidores (ativo), assets (visao em preparacao).
- **Valor esperado:** aumentar descoberta qualificada e avancar o funil teaser -> NDA.
- **Nao objetivos:** pipeline completo de deal e gestao juridica de NDA.

## 3) Escopo funcional

- **Entradas principais:** org ativa, perfil, tese ativa e projetos publicos.
- **Processamentos-chave:** roteamento por perfil, listagem de oportunidades, CTAs de relacionamento.
- **Saidas/entregaveis:** cards com score, motivos, teaser e estados de NDA/follow.
- **Fluxo principal:** abrir `/{orgSlug}/radar` -> carregar estado (`no_active_thesis`, `no_matches`, `matches_found`) -> agir via CTAs.
- **Fluxos alternativos:** perfil invalido redireciona para dashboard; sem tese ativa exibe CTA para criar tese.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI, Server Actions, DB, auth/perfil.
- **Componentes/servicos principais:**
  - `src/app/(protected)/[orgSlug]/radar/page.tsx`
  - `src/components/radar/OpportunitiesList.tsx`
  - `src/lib/actions/radar.ts`
  - `src/types/radar.ts`
- **Submodulos relacionados:**
  - [Radar Score](../radar-score/context.md): calculo e ranking.
  - [Radar Teaser](../radar-teaser/context.md): preview pre-NDA.
  - [Radar NDA](../radar-nda/context.md): solicitacao e status de NDA.
  - [Radar Follow](../radar-follow/context.md): sinal de interesse via seguir/desseguir.
- **Dependencias internas:** `thesis`, `navigation`, `notifications`.
- **Decisoes arquiteturais relevantes:** Radar atua como modulo orquestrador; capacidades especializadas ficam em submodulos dedicados.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/[orgSlug]/radar/page.tsx`, `src/app/(protected)/[orgSlug]/opportunities/page.tsx`
- **Lista e CTAs:** `src/components/radar/OpportunitiesList.tsx`
- **Regra/orquestracao:** `src/lib/actions/radar.ts`
- **Regra de score:** `src/lib/radar/score.ts`
- **Tipos:** `src/types/radar.ts`, `src/types/navigation.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `organizations`, `projects`, `investment_theses`, `investor_follows`, `nda_requests`.
- **Campos criticos:** `profile_type`, `verification_status`, `description`, `status`, campos setoriais/financeiros.
- **Regras de validacao:** Radar funcional apenas para investidor; asset permanece em placeholder.
- **Regras de autorizacao:** membership obrigatoria, bloqueios por perfil e `readOnlyMode` para CTAs.
- **Contrato de estado:** `RadarResult` com `state`, `opportunities`, `fallbackUsed`, `readOnlyMode`.

## 7) Seguranca e conformidade

- **Risco atual:** divergencia entre documentacao e fluxo real de CTAs.
- **Mitigacao recomendada:** manter rastreabilidade entre Radar e submodulos (`score`, `teaser`, `nda`, `follow`) com evidencias de codigo.
- **Urgencia:** alta.

## 8) Backlog do modulo

- Habilitar filtros reais (hoje desabilitados na UI).
- Integrar progresso de NDA/follow no pipeline.
- Ampliar cobertura de testes para CTAs e estados de erro.
- Evoluir calibracao do score por feedback de conversao.

## Evidencias usadas para este modulo

- `src/app/(protected)/[orgSlug]/radar/page.tsx`
- `src/components/radar/OpportunitiesList.tsx`
- `src/lib/actions/radar.ts`
- `src/lib/radar/score.ts`
- `src/types/radar.ts`
- `supabase/migrations/20260326110000_create_radar_cta_tables.sql`
