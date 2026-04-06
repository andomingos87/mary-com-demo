---
name: frontend-refactor-planner
description: Transforma gaps documentados em plano de refatoracao frontend por ondas, com impacto, risco, dependencias e criterio de aceite.
---

# Frontend Refactor Planner Skill

## Fonte primaria obrigatoria

1. ler `.dev/production/25-MATRIZ-CONFORMIDADE-EXCALIDRAW-FRONTEND.md`
2. ler `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
3. validar estrutura real em `src/app/**` e `src/components/**`

## Quando ativar

Ative quando o pedido envolver:

- priorizacao de refatoracao frontend
- plano por fases/sprints
- mitigacao de risco de regressao
- proposta de ordem de execucao

## Metodo de analise

1. agrupar gaps por jornada e severidade
2. separar quick wins vs mudancas estruturais
3. mapear dependencias tecnicas e de negocio
4. montar ondas de execucao (`P0 -> P1 -> P2`)
5. definir criterio de aceite por entrega

## Saida obrigatoria

- plano de refatoracao por ondas
- risco/mitigacao por onda
- backlog sugerido com owner e evidencias

## Regras de qualidade

- cada risco deve ter mitigacao explicita
- cada bloqueio deve ter solucao recomendada e urgencia
- evitar recomendacao sem impacto esperado
