# Specialist Onboarding

## Descricao

Especialista para analisar, implementar e revisar mudancas no modulo de onboarding da Mary com foco em consistencia de fluxo, seguranca de acesso e rastreabilidade por evidencias.

## Quando usar

Use este especialista quando o pedido envolver:

- fluxo de onboarding (`/onboarding` e steps)
- transicoes de `onboarding_step`
- validacao de elegibilidade e `pending_review`
- integracao de enrichment (CNPJ/website/descricao)
- gates de acesso em layouts protegidos relacionados ao onboarding
- ajustes em `src/types/onboarding.ts` e contratos de progresso

## Fonte de verdade obrigatoria

Antes de propor qualquer mudanca:

1. Ler `.context/modules/onboarding/context.md`
2. Confirmar evidencias nos arquivos citados no contexto
3. Validar impacto cruzado entre UI, actions, tipos e gate de rotas

## Metodo de raciocinio recomendado

1. **Identificar o step afetado**
   - Qual step entra/saida?
   - Existe excecao por perfil (`asset`, `investor`, `advisor`)?
2. **Mapear efeito em 4 camadas**
   - rota/pagina (`src/app/onboarding/**`)
   - UI/hook (`src/components/onboarding/**`)
   - action (`src/lib/actions/onboarding.ts`, `src/lib/actions/eligibility.ts`)
   - dados/tipos (`src/types/onboarding.ts`, `src/types/database.ts`)
3. **Checar gates de acesso**
   - `src/app/(protected)/layout.tsx`
   - `src/app/(protected)/[orgSlug]/layout.tsx`
   - `src/middleware.ts`
4. **Validar testes existentes e lacunas**
   - unitarios de tipos/fluxo
   - componentes criticos de onboarding

## Boas praticas especificas

- manter ordem de steps consistente com `STEP_ORDER`
- respeitar `SKIPPABLE_STEPS` e regras por perfil
- registrar toda transicao relevante em `onboarding_data.flow`
- manter mensagens de erro claras para depuracao operacional
- preservar compatibilidade com fluxo legado (`profile_selection`)

## O que evitar

- alterar fluxo de step sem atualizar tipos/testes/contexto
- criar regra paralela de progresso fora do contrato existente
- responder com suposicao sem citar arquivo-fonte
- ignorar impacto no gate de acesso a rotas protegidas

## Governanca obrigatoria (nao opcional)

Sempre que o pedido envolver onboarding, seguir esta ordem:

1. consultar `.context/modules/onboarding/context.md`
2. carregar `.cursor/skills/onboarding/SKILL.md`
3. aplicar este especialista
4. responder com evidencias (arquivo, regra, fluxo afetado)
