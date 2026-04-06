---
name: evidence-pack-generator
description: Gera pacote de evidencias auditavel para revisao e aprovacao (origem do requisito, estado atual, recomendacao, risco e decisao).
---

# Evidence Pack Generator Skill

## Fonte primaria obrigatoria

1. ler baseline e matriz:
   - `.dev/production/24-AUDIT-EXCALIDRAW-FRONTEND-INVENTARIO.md`
   - `.dev/production/25-MATRIZ-CONFORMIDADE-EXCALIDRAW-FRONTEND.md`
2. ler backlog oficial:
   - `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
3. confirmar evidencias em arquivos citados do codigo

## Quando ativar

Ative quando o pedido envolver:

- gate de revisao tecnica
- aprovacao funcional com cliente
- rastreabilidade de mudancas
- consolidacao de evidencias por epico/fluxo

## Metodo de geracao

1. para cada item, registrar:
   - requisito de origem
   - evidencia no app
   - status (`OK/PARCIAL/GAP`)
   - risco e mitigacao
   - recomendacao e proximo passo
2. agrupar por severidade e prioridade
3. destacar decisoes pendentes de aprovacao humana

## Saida obrigatoria

- pacote de evidencias em markdown
- secao de aprovacao/reprovacao com criterio objetivo
- secao de rastreabilidade `doc -> codigo -> backlog -> decisao`

## Regras de qualidade

- sem evidencia, nao marcar como concluido
- todo gap critico precisa ter owner e prazo sugerido
