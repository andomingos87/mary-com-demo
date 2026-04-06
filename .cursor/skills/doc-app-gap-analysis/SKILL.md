---
name: doc-app-gap-analysis
description: Compara a documentacao funcional (Excalidraw) com a implementacao atual para gerar matriz de gaps, severidade e prioridade de execucao.
---

# Doc App Gap Analysis Skill

## Fonte primaria obrigatoria

1. ler `.dev/excalidraw/00_INDEX.md`
2. ler `.dev/excalidraw/01_GLOBAL_RULES.md`
3. ler o documento de perfil alvo (`02_ATIVO.md`, `03_INVESTIDOR.md`, `04_ADVISOR.md`)
4. ler `.dev/excalidraw/05_SHARED_MODULES.md`
5. confirmar evidencias em `src/app/**`, `src/components/**`, `src/types/navigation.ts`

## Quando ativar

Ative esta skill quando houver pedidos sobre:

- confrontar doc com app
- mapear gaps de frontend
- medir aderencia funcional por rota/tela
- preparar baseline de refatoracao

## Metodo de analise

1. mapear requisito funcional da doc por dominio
2. localizar implementacao atual no codigo
3. classificar cada item: `OK`, `PARCIAL`, `GAP`
4. atribuir severidade (`S0-S3`) e prioridade (`P0-P3`)
5. registrar recomendacao objetiva de correcao com justificativa

## Saida obrigatoria

- tabela `requisito -> evidencia -> status -> severidade -> prioridade`
- lista de gaps criticos (`S0/S1`) com proximo passo sugerido

## Governanca obrigatoria

1. contexto do modulo (`.context/modules/excalidraw-front-alignment/context.md`)
2. esta skill
3. especialista do modulo (`.cursor/specialists/specialist-excalidraw-front-alignment.md`)
4. resposta com evidencias concretas (arquivo, regra, fluxo)
