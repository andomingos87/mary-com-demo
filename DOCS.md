# Documentacao Canonica - Mary AI Platform

Este arquivo e a porta de entrada unica para documentacao funcional, tecnica e de governanca.

## Hierarquia de precedencia

1. Excalidraw (`.dev/excalidraw/`)
2. PRD canonico (`.dev/production/PRD-v3.0-RECONCILIADO.md`)
3. Backlog canonico (`.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`)
4. Specs canonicas (`.dev/specs/`)
5. Guias operacionais (`.dev/guides/`)

## Fontes canonicas

- Backlog oficial: `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
- PRD oficial: `.dev/production/PRD-v3.0-RECONCILIADO.md`
- Specs oficiais:
  - `.dev/specs/H0.1-ONBOARDING-ATIVO.md`
  - `.dev/specs/H0.2-TESE-INVESTIDOR.md`
  - `.dev/specs/H0.3-PIPELINE-12-FASES.md`
  - `.dev/specs/H0.4-BREADCRUMBS.md`
  - `.dev/specs/H0.5-MARY-AI-SIDEBAR.md`
  - `.dev/specs/H0.6-AUTOSAVE-TOOLTIPS.md`
  - `.dev/specs/H0.7-MENU-LATERAL.md`
- Guia de implementacao: `.dev/guides/GUIA-FLUXO-IMPLEMENTACAO-E0.md`

## Context engineering

- Regras e convencoes de execucao: `AGENTS.md`
- Contexto tecnico ativo: `.context/docs/README.md`
- Modulos e indexacao: `.context/modules/`
- Skills de execucao: `.cursor/skills/`
- Comandos do Cursor: `.cursor/commands/`

## Rastreabilidade e historico

- Mapa de migracao de nomes: `.dev/production/NAMING_MIGRATION_MAP.md`
- Log de execucao de limpeza: `.dev/production/CLEANUP_EXECUTION_LOG.md`
- Relatorio consolidado de limpeza: `RELATORIO_LIMPEZA_REPOSITORIO.md`

## Politica de raiz minima

- A raiz deve conter apenas arquivos de entrada/documentacao minima.
- Nao criar novas specs ou backlog na raiz.
- Novos documentos de trabalho devem nascer em `.dev/production/`, `.dev/specs/` ou `.dev/guides/`.
