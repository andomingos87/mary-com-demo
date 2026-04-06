---
name: onboarding
description: Analisa e executa mudancas no modulo de onboarding com foco em fluxo de steps, elegibilidade, gates de acesso e consistencia entre UI, actions e tipos. Use quando o usuario pedir onboarding, cadastro inicial, onboarding_step, pending_review, elegibilidade, CNPJ onboarding, termos, MFA no onboarding, ou retomada de cadastro.
---

## Fonte de verdade do modulo

- Contexto funcional: `.context/modules/onboarding/context.md`
- Indice de caminhos: `.context/modules/module-index.json`

## Objetivo

Garantir consistencia entre steps, elegibilidade, gates de acesso e alinhamento UI/actions/tipos no onboarding.

## Gatilhos

- Steps, redirecionamentos, elegibilidade, CNPJ/website, retomada de fluxo, tipos de progresso (`STEP_ORDER`, `SKIPPABLE_STEPS`)

## Evidencia

Citar arquivos e regras concretas do repositorio; evitar conclusoes sem referencia.
