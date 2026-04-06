# Modulo Radar Score - Mary

## 1) Identificacao do modulo

- **Nome do modulo:** Radar Score
- **Owner tecnico:** Time Matching/Discovery (confirmar)
- **Owner de negocio:** Produto Investor (confirmar)
- **Status:** em desenvolvimento (MVP ativo)
- **Ultima atualizacao:** 2026-03-29

## 2) Objetivo de negocio

- **Problema que resolve:** priorizar oportunidades no Radar por aderencia a tese ativa.
- **Publico/area impactada:** organizacoes `investor`.
- **Valor esperado:** reduzir tempo de analise inicial e melhorar qualidade do shortlist.
- **Nao objetivos:** substituir avaliacao humana de deal.

## 3) Escopo funcional

- **Entradas principais:** criterios da tese ativa (`sectors`, `geo`, `stage`, `ticketMin`, `ticketMax`) e metadados do projeto.
- **Processamentos-chave:** calculo deterministico de score (0-100), justificativas e ordenacao.
- **Saidas/entregaveis:** `matchScore`, `matchReasons`, ordenacao por score.
- **Fluxo principal:** carregar tese ativa -> pontuar projetos publicos -> ordenar e filtrar por threshold.
- **Fluxos alternativos:** sem tese ativa ou sem match acima do threshold (fallback de melhores opcoes).

## 4) Arquitetura e componentes

- **Camadas envolvidas:** DB, Server Actions, regra de negocio.
- **Componentes/servicos principais:**
  - `src/lib/radar/score.ts`
  - `src/lib/actions/radar.ts`
  - `src/types/radar.ts`
- **Dependencias internas:** modulo `thesis` (tese ativa) e modulo `radar` (listagem).
- **Decisoes arquiteturais relevantes:** score composito por pesos fixos e explicabilidade por `matchReasons`.

## 5) Estrutura tecnica no codigo

- **Regra de score:** `src/lib/radar/score.ts`
- **Orquestracao e threshold/fallback:** `src/lib/actions/radar.ts`
- **Contrato de saida:** `src/types/radar.ts`
- **Cobertura de testes:** `src/lib/actions/__tests__/radar.test.ts`

## 6) Dados e contratos

- **Entidades/tabelas principais:** `projects`, `investment_theses`, `organizations`.
- **Campos criticos:** `sector_l1/l2/l3`, `value_min_usd`, `value_max_usd`, `revenue_annual_usd`, `status`, `extra_data`.
- **Regras de validacao:** score calcula apenas com dados disponiveis; pesos aplicados por criterio aderente.
- **Contrato funcional atual:**
  - Setor aderente: +40
  - Faixa tamanho/receita aderente: +30
  - Geografia aderente: +20
  - Estagio aderente: +10

## 7) Seguranca e conformidade

- **Risco atual:** interpretar score como recomendacao final automatica.
- **Mitigacao recomendada:** manter explicacao por motivos no card e reforcar suporte a decisao humana.
- **Urgencia:** media.

## 8) Backlog do modulo

- Ajustar pesos por telemetria de conversao.
- Adicionar normalizacao mais robusta para geografia e estagio.
- Introduzir calibracao por perfil de investidor.
- Cobrir testes para cenarios de dados parciais extremos.

## Evidencias usadas para este modulo

- `src/lib/radar/score.ts`
- `src/lib/actions/radar.ts`
- `src/types/radar.ts`
- `src/lib/actions/__tests__/radar.test.ts`
