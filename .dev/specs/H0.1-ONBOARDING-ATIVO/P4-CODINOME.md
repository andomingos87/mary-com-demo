# Subspec P4 — Codinome

**Spec pai:** [INDEX.md](INDEX.md)
**Blocker:** [BLOCKER-data-enrichment.md](BLOCKER-data-enrichment.md)
**Excalidraw ref:** `.dev/excalidraw/02_ATIVO.md` — Passo 4
**Step type:** `asset_codename`
**Componente:** `AssetCodenameStep`

---

## Schema de dados

```typescript
// Passo 4 — Codinome
codename: string                 // Ex: "Projeto Tiger"
codenameSource: 'manual' | 'ai' // Gerado manual ou por Mary AI
```

### Validações

- **Obrigatórios:** codename

---

## Comportamento de conclusão

Ao clicar "Continuar para termos" no Passo 4:

1. Dados de codinome sao persistidos (`codename`, `codenameSource`)
2. Fluxo avanca para `terms_acceptance`

Ao concluir o aceite de termos:

1. **Modal animado de parabéns** aparece
2. **Texto:** "Cadastro finalizado com sucesso. Seu projeto foi configurado e protegido na Mary. Agora você já pode acessar e ver seu Market Readiness Score (MRS)."
3. **Botão:** `[ Ver meu MRS ]`
4. **Redirecionamento** para `/[orgSlug]/mrs`
5. **Codinome** aparece no menu lateral: `[ Projeto Tiger ]`

> **Decisão D0-B (04/04/2026):** manter `terms_acceptance` por compliance e mover a conclusão visual/final para o fim real do onboarding.

### Pós-onboarding (Mary AI em background)

Após `completed`, trigger automático:
1. Mary AI coleta dados preenchidos
2. Executa deep research (informações públicas)
3. Gera: Dossiê (resumo executivo, SWOT), MRS inicial, Teaser v1
4. Dossiê vai para VDR em Q&As (base do RAG)

> **Nota:** Implementação completa da geração automática é E6 (IA assistiva). Para H0.1, preparar interface e hooks, geração pode ser placeholder/mock.

---

## Componentes envolvidos

| Componente | Status | Notas |
|-----------|--------|-------|
| `AssetCodenameStep` | Criar | Formulário + modal de conclusão |
| `CodenameGenerator` | Criar | Input + botão "Sugerir com Mary AI" |

---

## Checklist de Validação (9 itens)

> **Pré-condição:** Blocker resolvido. Avançar até Passo 4 com Passos 1–3 preenchidos.

| # | Verificação | Status | Obs |
|---|------------|--------|-----|
| **Campos** | | | |
| 5.1 | Campo **Codinome do projeto** (input texto, obrigatório) | ✅ Conforme | Input obrigatorio validado (botao desabilitado com campo vazio) |
| 5.2 | Botão **"Sugerir com Mary AI"** presente | ✅ Conforme | Botao visivel no step `asset_codename` |
| 5.3 | Pode digitar codinome manualmente | ✅ Conforme | Fluxo manual validado (`codenameSource = manual`) |
| 5.4 | Pode usar sugestão da Mary AI | ✅ Conforme | Sugestao mock aplicada com persistencia (`codenameSource = ai`) |
| **Conclusão** | | | |
| 5.5 | Ao concluir termos, exibe **modal de parabéns** animado | ✅ Conforme | Conclusao movida para `terms_acceptance` (D0-B) |
| 5.6 | Texto do modal: "Cadastro finalizado com sucesso..." | ✅ Conforme | Copy oficial aplicada no modal final |
| 5.7 | Botão do modal: **"Ver meu MRS"** | ✅ Conforme | CTA implementado no modal final |
| 5.8 | Botão redireciona para `/[orgSlug]/mrs` | ✅ Conforme | Redirect dinamico via `organizationSlug` no wizard |
| 5.9 | Após conclusão, codinome aparece no **menu lateral** | ✅ Conforme | Sidebar dinamica com `projects.name || projects.codename` e fallback em `onboarding_data.assetCodenameData.codename` |
