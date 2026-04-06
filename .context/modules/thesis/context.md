# Modulo Thesis - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Thesis (Tese)
- **Owner tecnico:** Time Investor Experience (confirmar)
- **Owner de negocio:** Produto Investidor (confirmar)
- **Status:** em desenvolvimento (H2.1.1, H2.1.2 e refinamento UX multistep concluidos)
- **Ultima atualizacao:** 2026-03-29

## 2) Objetivo de negocio

- **Problema que resolve:** capturar criterios de investimento para orientar descoberta de oportunidades.
- **Publico/area impactada:** organizacoes do perfil `investor`.
- **Valor esperado:** reduzir tempo ate primeiro valor no fluxo investidor (tese -> radar).
- **Nao objetivos:** pipeline completo de deals e due diligence detalhada.

## 3) Escopo funcional

- **Entradas principais:** org ativa investor, criterios de tese, filtros.
- **Processamentos-chave:** validacao de acesso por perfil e preparacao de CRUD de tese.
- **Saidas/entregaveis:** CRUD de teses + contrato canonico de tese ativa para descoberta.
- **Fluxo principal:** acessar `/{orgSlug}/thesis` -> visualizar tese/estado vazio -> iniciar criacao.
- **Fluxo de criacao/edicao (UX):** formulario multistep guiado e numerado (padrao onboarding) com nome/resumo/setores -> geografia -> estagios/ticket/ativacao (sem JSON exposto para usuario final).
- **Fluxos alternativos:** perfil nao investor redireciona para dashboard.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI, DB, auth/perfil.
- **Componentes/servicos principais:**
  - `src/app/(protected)/[orgSlug]/thesis/page.tsx`
  - `src/components/thesis/ThesisManager.tsx`
  - `src/components/shared/SectorMultiSelect.tsx`
  - `src/components/shared/MultiSelectDropdown.tsx`
  - `src/components/shared/UsdCurrencyInput.tsx`
  - `src/components/onboarding/GeographySelector.tsx` (reuso no modal de Tese)
  - `src/components/onboarding/StepIndicator.tsx` (reuso para steps numerados da modal)
  - `src/components/ui/scroll-area.tsx` (conteudo interno rolavel na modal multistep)
  - `src/types/navigation.ts`
  - `src/lib/actions/navigation.ts`
- **Dependencias internas:** organizations, navigation context.
- **Dependencias externas:** Supabase.
- **Decisoes arquiteturais relevantes:** modulo disponivel apenas para investor no menu e nas permissoes de rota.

## 5) Estrutura tecnica no codigo

- **Rotas/paginas:** `src/app/(protected)/[orgSlug]/thesis/page.tsx`
- **Componentes UI:** pagina usa `PageHeader`, `Card`, `Button`, badges e estado vazio.
- **Acoes de servidor:** guardas de rota em `src/lib/actions/navigation.ts`.
- **Acoes de servidor (thesis):** `listTheses`, `createThesis`, `updateThesis`, `activateThesis`, `deleteThesis`, `getActiveThesis`.
- **Schemas/tipos:** `src/types/navigation.ts`, `src/types/database.ts`
- **Constantes compartilhadas:** `src/lib/constants/investment-stages.ts`, `src/lib/constants/sectors.ts`
- **Padrao de moeda:** regex e mascara USD centralizadas em `src/lib/format/currency.ts` e consumidas por `UsdCurrencyInput`.

## 6) Dados e contratos

- **Entidades/tabelas principais:** `organizations` (gating), `investment_theses` (CRUD + tese ativa).
- **Campos criticos:** `organizations.profile_type`, `verification_status`.
- **Contrato de criterios:** `sectors[]`, `geo[]`, `stage[]`, `ticketMin`, `ticketMax` (persistidos em `investment_theses.criteria`).
- **Status de ambiente (2026-03-29):** drift de schema corrigido via MCP Supabase com criação canônica de `investment_theses`; `investor_theses` permanece como legado em paralelo no ambiente.
- **Regras de validacao:** somente investor acessa tese.
- **Contratos de API/eventos:** navegacao/permissao por perfil + contrato `getActiveThesis` (`active_found | no_active_thesis`).
- **Regras de autorizacao:** bloqueio de perfil fora do investor.

## 7) Seguranca e conformidade

- **Risco atual:** expor rota para perfil incorreto.
- **Mitigacao recomendada:** manter dupla validacao em menu e pagina + testes de rota.
- **Urgencia:** alta.

## 8) Backlog do modulo

- Implementar CRUD real de teses e suporte a multiplas teses.
- Conectar tese ao matching do radar (Gap 3).
- Instrumentar metrica de ativacao: tempo de criacao da primeira tese.
- Refinar catalogos padrao de setor/geografia/estagio para reduzir variacao de preenchimento manual.

## Evidencias usadas para este modulo

- `src/app/(protected)/[orgSlug]/thesis/page.tsx`
- `src/types/navigation.ts`
- `src/lib/actions/navigation.ts`
- `src/lib/actions/thesis.ts`
- `src/types/thesis.ts`
- `src/app/(protected)/[orgSlug]/opportunities/page.tsx`
