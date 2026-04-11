# .dev/production/

## Identidade
- Pasta canonica de planejamento e controle da execucao do produto.
- Concentra PRD v3.0, backlog priorizado e documentos de rastreabilidade.

## Estrutura ativa

| Arquivo | Funcao |
|---|---|
| `PRD-v3.0-RECONCILIADO.md` | Fonte de verdade funcional do produto (derivado do Excalidraw) |
| `6-PRODUCT_BACKLOG_PRIORIZADO.md` | Backlog oficial v3.0 por epico/historia |
| `MAPEAMENTO_EXCALIDRAW_VS_IMPLEMENTACAO.docx` | Mapeamento campo a campo Excalidraw vs codigo |
| `CHANGELOG.md` | Historico consolidado de mudancas |
| `CLEANUP_EXECUTION_LOG.md` | Trilha de execucao de limpezas estruturais |
| `NAMING_MIGRATION_MAP.md` | Mapa de renomeacao de arquivos (parcialmente executado) |
| `AGENTS.md` | Este arquivo — indice e regras da pasta |
| `MATRIZ-JORNADAS-EXCALIDRAW-MERCADO.md` | Matriz jornada × rota × backlog × escala (mercado) |
| `PRECEDENCIA-EXCALIDRAW-FONTES.md` | Precedência `.dev/excalidraw` vs `src/docs` e escopo V2 |
| `clickup-import-mary-mercado.csv` | Importação de tarefas (ondas W0–W4) no ClickUp |
| `RUNBOOK-MERCADO-ESCALA.md` | Checklist ops/compliance antes de escala comercial |

## Hierarquia de precedencia

1. **Excalidraw** (`.dev/excalidraw/`) — fonte de verdade visual e funcional
2. **PRD v3.0** (`PRD-v3.0-RECONCILIADO.md`) — contrato executavel
3. **Backlog v3.0** (`6-PRODUCT_BACKLOG_PRIORIZADO.md`) — plano de execucao

## Fluxo oficial
1. Registrar necessidade no backlog (`6-PRODUCT_BACKLOG_PRIORIZADO.md`).
2. Abrir especificacao com contexto, escopo, solucao e criterio de aceite.
3. Revisar tecnicamente e funcionalmente.
4. Quando concluido, registrar no `CHANGELOG.md`. Historico preservado no Git.
5. Novos checklists de validacao sao criados sob demanda, alinhados ao PRD v3.0.

## Criterios minimos de qualidade
- Escopo e fora de escopo explicitos.
- Dependencias e riscos com mitigacao.
- Criterios de aceite testaveis.
- Evidencias de codigo/arquivos quando houver implementacao.
- Dono e data de atualizacao visiveis.
