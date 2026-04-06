# Subspec P2 — Dados de Matching

**Spec pai:** [INDEX.md](INDEX.md)
**Blocker:** [BLOCKER-data-enrichment.md](BLOCKER-data-enrichment.md)
**Excalidraw ref:** `.dev/excalidraw/02_ATIVO.md` — Passo 2
**Step type:** `asset_matching_data`
**Componente:** `AssetMatchingDataStep`

---

## Schema de dados

```typescript
// Passo 2 — Dados de Matching
rob12Months: number              // ROB últimos 12 meses (moeda)
ebitdaPercent: number            // EBITDA % (não valor absoluto)
employeeCount: number            // Nº funcionários
foundingYear: number             // Ano de fundação
headquarters: {                  // Sede
  city: string
  state: string
  country: string
}
equityOffered: number            // % participação ofertada
targetValue: number              // Valor alvo da operação (moeda)
```

### Validações

- **Obrigatórios:** rob12Months, ebitdaPercent, employeeCount, foundingYear, headquarters
- **Opcionais:** equityOffered, targetValue

---

## Nota de privacidade

Exibir no topo do passo:

> "Não se preocupe! Esses dados nunca são exibidos publicamente. Eles são usados exclusivamente pelo algoritmo de matching para encontrar investidores compatíveis."

---

## Componentes envolvidos

| Componente | Status | Notas |
|-----------|--------|-------|
| `AssetMatchingDataStep` | Criar | Formulário principal do Passo 2 |
| `UsdCurrencyInput` | Reusar | `src/components/shared/UsdCurrencyInput.tsx` — ROB e Valor alvo |
| `PercentInput` | Criar | Input formatado para % (EBITDA%, participação) |
| `HeadquartersSelector` | Criar | Select cidade/estado/país |

---

## Checklist de Validação (13 itens)

> **Pré-condição:** Blocker resolvido. Avançar até Passo 2 com Passo 1 preenchido.

| # | Verificação | Status | Obs |
|---|------------|--------|-----|
| **Nota de privacidade** | | | |
| 3.1 | Exibe no topo: "Não se preocupe! Esses dados nunca são exibidos publicamente..." | [x] | Texto completo alinhado à spec em `AssetMatchingDataStep` |
| **Campos presentes** | | | |
| 3.2 | Campo **ROB últimos 12 meses** (input monetário, UsdCurrencyInput) | [x] | Presente com `UsdCurrencyInput` (`rob-12-months`) |
| 3.3 | Campo **EBITDA %** (input percentual, **não** valor absoluto) | [x] | Presente com `PercentInput` e sem valor absoluto |
| 3.4 | Campo **Nº de funcionários** (input numérico) | [x] | Presente com `Input type=\"number\"` |
| 3.5 | Campo **Ano de fundação** (input numérico ou select) | [x] | Presente com `Input type=\"number\"` |
| 3.6 | Campo **Localização da sede** (cidade, estado, país) | [x] | Presente com `HeadquartersSelector` (cidade/estado/país) |
| 3.7 | Campo **Participação ofertada %** (input percentual, opcional) | [x] | Presente com `PercentInput` opcional |
| 3.8 | Campo **Valor alvo da operação** (input monetário, opcional) | [x] | Presente com `UsdCurrencyInput` (`target-value`) |
| **Comportamento** | | | |
| 3.9 | Campos obrigatórios: ROB, EBITDA%, funcionários, ano fundação, sede | [x] | Gate no frontend (`isValid`) e validação em `saveAssetMatchingData` |
| 3.10 | Campos opcionais: participação ofertada, valor alvo | [x] | Sem obrigatoriedade no `isValid` e no backend |
| 3.11 | Input monetário formata corretamente (USD) | [x] | `UsdCurrencyInput` usa `handleCurrencyChangeUSD` |
| 3.12 | Input percentual aceita apenas 0-100 | [x] | `PercentInput` aplica clamp `min=0` e `max=100` |
| 3.13 | Botão voltar preserva dados do Passo 1 | [x] | `OnboardingWizard` mantém `formData` com merge incremental entre steps |
