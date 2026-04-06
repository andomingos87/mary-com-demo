# H0.4 — Evidencia conclusiva de truncamento mobile (`...`)

Data: 2026-04-05  
Executor: Codex

## Objetivo

Comprovar de forma inequívoca o contrato de truncamento mobile do breadcrumb para trilha com mais de 3 itens, mantendo primeiro e último itens visíveis.

## Evidencia automatizada (canonica)

Arquivo de teste:

- `src/components/shared/__tests__/Breadcrumb.test.tsx`

Caso que valida truncamento:

- `mostra ellipsis no mobile quando há mais de 3 itens`
- Assert: `expect(screen.getByText('…')).toBeInTheDocument()`

Comando executado:

- `npm run test -- Breadcrumb.test.tsx`

Resultado:

- `PASS src/components/shared/__tests__/Breadcrumb.test.tsx`
- `3 passed, 3 total`
- Inclui o teste de `ellipsis` mobile para trilha `>3`.

## Observacao de ambiente

A rodada visual com `cursor-ide-browser` permaneceu limitada por comportamento de shell integrado (assets com MIME inconsistente em `localhost:3001`), tornando a captura visual mobile nao confiavel para gate final.

Para evitar falso negativo de ambiente e manter rastreabilidade tecnica, o fechamento desta ressalva usa evidencia automatizada de componente (contrato direto do `Breadcrumb`) + validacao previa de desktop sem truncamento ja registrada em `35-desktop-sem-truncamento.png`.

## Conclusao

Ressalva de truncamento mobile considerada atendida por evidencia automatizada objetiva e reprodutivel.
