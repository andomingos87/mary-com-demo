# Naming Migration Map - .dev/production

Data: 2026-04-03  
Status: Parcial (governanca documental consolidada)

## Objetivo

Registrar a migracao de nomenclatura para reduzir ambiguidade e preservar rastreabilidade entre nomes antigos e nomes alvo.

## Regra alvo

`YYYY-MM-DD-NN-TITULO.md`

## Mapeamento

| Nome atual | Nome alvo (proposto) | Status | Observacao |
|---|---|---|---|
| `PRD-v3.0-RECONCILIADO.md` | `2026-04-01-01-PRD-V3-RECONCILIADO.md` | PENDENTE | Alto volume de referencias internas; renome exige onda dedicada |
| `6-PRODUCT_BACKLOG_PRIORIZADO.md` | `2026-04-02-01-PRODUCT-BACKLOG-PRIORIZADO.md` | PENDENTE | Documento ativo e altamente referenciado |
| `DOCS.md` | `2026-04-03-00-DOCS-INDEX.md` | EXECUTADO (INDICE) | Criado como indice mestre da documentacao canonica na raiz |
| `BACKLOG-V3.md` | `2026-04-03-01-BACKLOG-V3-REDIRECT.md` | EXECUTADO (REMOVIDO RAIZ) | Conteudo de trabalho removido da raiz; backlog oficial permanece em `.dev/production/` |
| `SPEC-H0.1-ONBOARDING-ATIVO.md` | `2026-04-03-02-SPEC-H0.1-REDIRECT.md` | EXECUTADO (REMOVIDO RAIZ) | Fonte ativa consolidada em `.dev/specs/H0.1-ONBOARDING-ATIVO/INDEX.md` |
| `SPEC-H0.2-TESE-INVESTIDOR.md` | `2026-04-03-03-SPEC-H0.2-REDIRECT.md` | EXECUTADO (REMOVIDO RAIZ) | Fonte ativa consolidada em `.dev/specs/H0.2-TESE-INVESTIDOR.md` |
| `SPEC-H0.3-PIPELINE-12-FASES.md` | `2026-04-03-04-SPEC-H0.3-REDIRECT.md` | EXECUTADO (REMOVIDO RAIZ) | Fonte ativa consolidada em `.dev/specs/H0.3-PIPELINE-12-FASES.md` |
| `SPEC-H0.4-H0.7-ITENS-MENORES.md` | `2026-04-03-05-SPEC-H0.4-H0.7-REDIRECT.md` | EXECUTADO (REMOVIDO RAIZ) | Fonte ativa consolidada em `.dev/specs/H0.4-H0.7-ITENS-MENORES.md` |
| `4-CHANGELOG-PIVOT-07-03.md` | `2026-03-23-01-CHANGELOG-PIVOT-MVP.md` | DEPRECADO | Consolidado no `CHANGELOG.md` |
| `28-CHANGELOG-CONTEXT-ENGINEERING-FRONTEND.md` | `2026-04-01-01-CHANGELOG-CONTEXT-ENGINEERING-FRONTEND.md` | DEPRECADO | Consolidado no `CHANGELOG.md` |
| `CHANGELOG.md` | `2026-04-03-01-CHANGELOG-CONSOLIDADO.md` | OPCIONAL | Mantido sem data por padrao amplamente reconhecido |

## Decisao operacional desta etapa

- Foi executada a consolidacao de changelog.
- Foi executada a despoluicao da raiz com `DOCS.md` como indice mestre.
- Foi executada a remocao dos arquivos de trabalho da raiz (`BACKLOG-V3.md` e `SPEC-H0.*`), mantendo fontes canonicas em `.dev/production/` e `.dev/specs/`.
- O renome massivo de arquivos foi adiado para evitar quebra de links e retrabalho.
- A migracao completa de nomes deve ocorrer em uma onda dedicada, com atualizacao automatizada de referencias.
