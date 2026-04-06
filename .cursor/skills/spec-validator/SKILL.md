---
name: spec-validator
description: "Gera checklists de validação padronizados para specs do projeto Mary. Use SEMPRE que o usuário disser 'validar spec', 'checklist de validação', 'verificar implementação', 'testar H0.x', 'validar história', 'gerar checklist', ou quando uma spec H0.x acabou de ser implementada e precisa ser verificada. Também use quando o usuário pedir para validar qualquer entrega contra o Excalidraw ou PRD."
---

# Spec Validator — Gerador de Checklists de Validação

Skill para gerar checklists de validação padronizados que permitem verificar campo a campo se uma spec foi implementada corretamente.

## Quando usar

- Após implementar qualquer história H0.x do E0
- Quando o usuário quer validar uma entrega antes de apresentar ao cliente
- Quando precisa verificar aderência ao Excalidraw
- Quando precisa gerar evidências de validação para liberação de parcela

## Processo

### 1. Identificar a spec

Pergunte ao usuário qual spec será validada (ex: H0.1, H0.2, etc.) ou identifique pelo contexto da conversa.

### 2. Ler fontes de verdade

Leia obrigatoriamente, nesta ordem:

1. **A spec da história:** `.dev/specs/H0.X-NOME.md`
2. **O Excalidraw correspondente:** `.dev/excalidraw/0X_MODULO.md` (referenciado na spec)
3. **O código implementado:** arquivos listados na seção "Impacto no código" da spec

### 3. Análise cruzada

Compare spec vs código para identificar:
- O que foi implementado conforme a spec
- O que foi implementado parcialmente
- O que está ausente
- Gaps não previstos na spec mas relevantes

### 4. Gerar o checklist

Salve em `.dev/validations/H0.X-CHECKLIST-VALIDACAO.md` seguindo o template abaixo.

## Template do Checklist

O checklist deve seguir esta estrutura exata:

```markdown
# Checklist de Validação — H0.X [Título da História]

**Spec:** `.dev/specs/H0.X-NOME.md`
**Excalidraw:** `.dev/excalidraw/0X_MODULO.md`
**Data da validação:** ___/___/2026
**Validador:** _______________
**Ambiente:** [ ] Local | [ ] Staging | [ ] Produção

---

## Como usar este checklist

Percorra cada seção na ordem. Para cada item, marque:
- `[x]` = Conforme (implementado e funcionando)
- `[~]` = Parcial (existe mas com ressalva — descreva no campo "Obs")
- `[ ]` = Ausente (não implementado)
- `[N/A]` = Não aplicável neste ambiente

---

## [Seção por área funcional]

| # | Verificação | Status | Obs |
|---|------------|--------|-----|
| X.1 | [Descrição clara e verificável] | [ ] | |

---

## [Seção de UX e Regras Globais]

Sempre incluir verificações de:
- Auto-save (se aplicável)
- Tooltips (se aplicável)
- Responsividade
- Design tokens (DM Sans, rounded-lg, shadow-card)
- Acessibilidade básica

---

## [Seção de Regressão]

Sempre incluir verificações de que outros fluxos não quebraram.

---

## [Seção de Gaps Conhecidos]

Itens identificados na análise de código que precisam confirmação visual.

| # | Gap | Severidade | Confirmado? | Obs |
|---|-----|-----------|-------------|-----|

---

## Resumo da Validação

| Seção | Total | ✅ | ⚠️ | ❌ | % |
|-------|-------|---|---|---|---|

### Resultado

- [ ] **APROVADO** — Todos os itens conformes ou com gaps aceitáveis
- [ ] **APROVADO COM RESSALVAS** — Gaps de severidade média documentados
- [ ] **REPROVADO** — Gaps críticos que bloqueiam entrega

### Assinatura

- **Validador:** _______________
- **Data:** ___/___/2026
- **Próximo passo:** [ ] Apresentar ao cliente | [ ] Corrigir gaps | [ ] Escalar
```

## Regras de qualidade

### Cada item de verificação deve ser:
- **Específico:** "Campo EBITDA % aceita apenas valores 0-100" (não "EBITDA funciona")
- **Verificável visualmente:** o validador consegue confirmar olhando a tela
- **Rastreável:** referenciar seção do Excalidraw quando aplicável
- **Independente:** cada item pode ser verificado isoladamente

### Quantidade esperada por complexidade da spec:
- **Spec S (simples):** 20-40 itens
- **Spec M (média):** 40-70 itens
- **Spec L (grande):** 70-100 itens

### Seções obrigatórias:
1. Estrutura/Arquitetura (itens técnicos visíveis)
2. Uma seção por passo/tela/módulo funcional
3. UX e Regras Globais
4. Persistência/Backend (quando aplicável)
5. Regressão
6. Gaps Conhecidos (da análise de código)
7. Resumo

### Severidade dos gaps:
- **Alta:** Funcionalidade core ausente, visível ao cliente, bloqueia entrega
- **Média:** Funcionalidade secundária ausente ou com comportamento inesperado
- **Baixa:** Cosmético, placeholder aceitável para MVP, melhoria futura

## Localização dos artefatos

- Checklists gerados: `.dev/validations/H0.X-CHECKLIST-VALIDACAO.md`
- Specs: `.dev/specs/`
- Excalidraw: `.dev/excalidraw/`
- Backlog: `.dev/production/6-PRODUCT_BACKLOG_PRIORIZADO.md`
