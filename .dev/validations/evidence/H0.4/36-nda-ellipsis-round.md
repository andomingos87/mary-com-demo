# H0.4 — Rodada focada nas 2 ressalvas

Data: 2026-04-05  
Executor: Codex (cursor-ide-browser + user-supabase)

## Escopo

1. Validar regra NDA-gated no breadcrumb (`codename` vs `name`).
2. Validar truncamento mobile para trilha com mais de 3 níveis.

## Cenário de dados usado

- Usuario: `spec.h02.investidor+01@acmeinvest.com`
- Org investidor: `nova-organizacao-mnlp3mny-fhl3` (`8ae216a7-d527-4585-99f1-57b4a3f54bbd`)
- Projeto alvo: `h03-invalid-transition-retest` (`8b6d08cf-e8be-4358-b1fa-a376d52bca84`)

### Ajustes SQL de teste (Supabase MCP)

- Ajuste de status do projeto para eliminar erro de runtime na rota de membros:
  - `status: screening -> teaser`
- Ajuste de nome para diferenciar de codename:
  - `name: Projeto H03 Nome Visivel`
- Insercao de NDA aprovado para cenario positivo:
  - `nda_requests.id: 68691104-49dc-4c7e-b26b-ba9596515379`
  - `status: approved`

## Evidencias visuais

- Sem NDA aprovado (breadcrumb em codename + skeleton visivel durante hidratacao):
  - `c:\Users\asdom\AppData\Local\Temp\cursor\screenshots\.dev\validations\evidence\H0.4\30-nda-investidor-sem-aprovacao-codename.png`
- Com NDA aprovado (breadcrumb em name):
  - `c:\Users\asdom\AppData\Local\Temp\cursor\screenshots\.dev\validations\evidence\H0.4\31-nda-investidor-aprovado-name.png`
- Mobile em trilha >3:
  - `c:\Users\asdom\AppData\Local\Temp\cursor\screenshots\.dev\validations\evidence\H0.4\34-mobile-ellipsis-gt3-itens.png`
- Desktop sem truncamento:
  - `c:\Users\asdom\AppData\Local\Temp\cursor\screenshots\.dev\validations\evidence\H0.4\35-desktop-sem-truncamento.png`

## Console

- Dump completo da rodada:
  - `C:\Users\asdom\.cursor\projects\c-Users-asdom-cursor-worktrees-project-mary-read-h04-breadcrumbs-own\agent-tools\b24d8ff7-f9c2-4a0b-b380-5b88398cc605.txt`

Resumo dos erros encontrados:
- Erros relacionados a rota 404 de projeto inexistente (fora do fluxo final validado).
- Warnings de preload e dev overlay do Next.js em modo desenvolvimento.

## Resultado da rodada focada

- NDA-gated (investidor): validado em cenario sem NDA (codename) e com NDA aprovado (name).
- Skeleton de hidratacao: evidenciado no estado inicial antes da resolucao completa.
- Truncamento mobile com `...`: nao conclusivo visualmente neste ambiente (viewport com comportamento de layout lateral do shell do browser), mantendo ressalva.
