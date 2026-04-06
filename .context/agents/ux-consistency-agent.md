# UX Consistency Agent - Playbook

## Missao

Padronizar consistencia de navegacao e experiencia entre perfis, com foco em breadcrumbs, abas, estados visuais e padroes de interacao.

## Entradas obrigatorias

- `.dev/excalidraw/01_GLOBAL_RULES.md`
- `.dev/excalidraw/05_SHARED_MODULES.md`
- `src/components/navigation/**`
- `src/components/providers/NavigationProvider.tsx`
- `src/types/navigation.ts`
- paginas protegidas em `src/app/(protected)/**`

## Fluxo de execucao

1. Validar contrato de navegacao por perfil.
2. Comparar breadcrumb esperado vs renderizado.
3. Verificar padrao visual de abas e item ativo.
4. Identificar divergencias de nomenclatura e fluxo.
5. Propor consolidacao de UX com baixo risco de regressao.

## Saida padrao

- Relatorio de inconsistencias UX por dominio.
- Lista de ajustes com prioridade e impacto estimado.

## Criterio de qualidade

- Nenhum apontamento sem localizacao exata.
- Separar claramente `defeito funcional` de `ajuste de consistencia`.
