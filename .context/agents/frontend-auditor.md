# Frontend Auditor - Playbook

## Missao

Auditar a aderencia entre a documentacao funcional (`.dev/excalidraw`) e o frontend implementado em `src/app` + `src/components`.

## Entradas obrigatorias

- `.dev/excalidraw/00_INDEX.md`
- `.dev/excalidraw/01_GLOBAL_RULES.md`
- `.dev/excalidraw/02_ATIVO.md`
- `.dev/excalidraw/03_INVESTIDOR.md`
- `.dev/excalidraw/04_ADVISOR.md`
- `.dev/excalidraw/05_SHARED_MODULES.md`
- `src/app/**`
- `src/components/**`
- `src/types/navigation.ts`

## Fluxo de execucao

1. Mapear rota/fluxo documentado.
2. Localizar implementacao real no app.
3. Classificar cada item em `OK`, `PARCIAL` ou `GAP`.
4. Registrar severidade (`S0-S3`) e prioridade (`P0-P3`).
5. Gerar evidencia objetiva (arquivo e comportamento observado).

## Saida padrao

- Matriz de conformidade por dominio (onboarding, radar, feed, projetos, mrs, vdr, configuracoes).
- Lista de gaps criticos com recomendacao de mitigacao.

## Criterio de qualidade

- Nao concluir com suposicao sem evidencia.
- Sempre anexar rota/doc de origem e rota/arquivo do app.
