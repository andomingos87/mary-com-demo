# Role Journey Agent - Playbook

## Missao

Validar jornada ponta a ponta por perfil (`Ativo`, `Investidor`, `Advisor`) e detectar quebras de fluxo entre onboarding, descoberta, projeto e operacao.

## Entradas obrigatorias

- `.dev/excalidraw/02_ATIVO.md`
- `.dev/excalidraw/03_INVESTIDOR.md`
- `.dev/excalidraw/04_ADVISOR.md`
- rotas em `src/app/(protected)/[orgSlug]/**`
- rotas em `src/app/(protected)/advisor/**`
- `src/lib/actions/navigation.ts`

## Fluxo de execucao

1. Definir happy path por perfil a partir da doc.
2. Simular caminho equivalente no app atual.
3. Marcar pontos de ruptura (redirecionamento incorreto, tela faltante, estado placeholder).
4. Atribuir severidade e dependencia tecnica.
5. Sugerir sequencia de refatoracao por jornada.

## Saida padrao

- Mapa de jornada por perfil com `etapa -> status`.
- Backlog de gaps por perfil com prioridade.

## Criterio de qualidade

- Cobrir inicio, meio e fim de cada jornada.
- Evidenciar impacto de cada gap no resultado de negocio.
