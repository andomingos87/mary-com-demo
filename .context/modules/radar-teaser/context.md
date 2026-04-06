# Modulo Radar Teaser - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Radar Teaser
- **Owner tecnico:** Time Matching/Discovery (confirmar)
- **Owner de negocio:** Produto Investor (confirmar)
- **Status:** em desenvolvimento (MVP ativo)
- **Ultima atualizacao:** 2026-03-29

## 2) Objetivo de negocio

- **Problema que resolve:** permitir visualizacao resumida de oportunidade antes do fluxo de NDA.
- **Publico/area impactada:** organizacoes `investor`.
- **Valor esperado:** acelerar triagem inicial e interesse qualificado.
- **Nao objetivos:** substituir data room ou due diligence.

## 3) Escopo funcional

- **Entradas principais:** resumo publico do projeto (`description`) e estado do card no Radar.
- **Processamentos-chave:** habilitar CTA `Ver Teaser` somente quando houver resumo disponivel.
- **Saidas/entregaveis:** modal de teaser com conteudo permitido pre-NDA.
- **Fluxo principal:** clicar em `Ver Teaser` -> abrir dialog com `teaserSummary`.
- **Fluxos alternativos:** teaser indisponivel quando projeto nao possui resumo.

## 4) Arquitetura e componentes

- **Camadas envolvidas:** UI client, Server Action (composicao do card).
- **Componentes/servicos principais:**
  - `src/components/radar/OpportunitiesList.tsx`
  - `src/lib/actions/radar.ts`
  - `src/types/radar.ts`
- **Dependencias internas:** modulo `radar` (listagem), modulo `radar-nda` (proximo passo de relacionamento).
- **Decisoes arquiteturais relevantes:** teaser e exibicao local (dialog), sem nova rota dedicada.

## 5) Estrutura tecnica no codigo

- **Render de CTA e dialog:** `src/components/radar/OpportunitiesList.tsx`
- **Sinal de disponibilidade:** `ctaState.canViewTeaser` em `src/lib/actions/radar.ts`
- **Contrato tipado:** `teaserSummary` em `src/types/radar.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `projects` (campo `description`).
- **Campos criticos:** `description`, `codename`.
- **Regras de validacao:** CTA habilita apenas quando `description` nao vazio.
- **Contrato de exibicao:** dialog com preview de dados permitidos pre-NDA.

## 7) Seguranca e conformidade

- **Risco atual:** expor informacao alem do escopo publico no teaser.
- **Mitigacao recomendada:** manter teaser limitado a campos publicos e revisar conteudo na origem do projeto.
- **Urgencia:** alta.

## 8) Backlog do modulo

- Padronizar tamanho e qualidade minima de teaser para melhor comparabilidade.
- Adicionar telemetria de clique em teaser e conversao para NDA.
- Criar fallback de teaser resumido quando descricao for longa.

## Evidencias usadas para este modulo

- `src/components/radar/OpportunitiesList.tsx`
- `src/lib/actions/radar.ts`
- `src/types/radar.ts`
