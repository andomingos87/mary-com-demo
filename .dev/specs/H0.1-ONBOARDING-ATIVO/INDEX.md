# Spec H0.1 — Refatorar Onboarding do Ativo (4 Passos Excalidraw)

**Épico:** E0 — Realinhamento Excalidraw
**Prioridade:** P0 (crítico)
**Estimativa:** L
**Risco:** Alto (impacto visual máximo para o cliente)
**Data:** 02/04/2026
**Fonte primária:** `.dev/excalidraw/02_ATIVO.md` — Etapa 3 (Onboarding)
**PRD:** `.dev/production/PRD-v3.0-RECONCILIADO.md` — Seção 4

---

## Status Consolidado

| Subspec | Itens | ✅ | ⚠️ | ⌛ | Status |
|---------|-------|---|---|---|--------|
| [BLOCKER — data_enrichment](BLOCKER-data-enrichment.md) | 1 | 1 | 0 | 0 | 🟢 Resolvido |
| [P1 — Dados da Empresa](P1-DADOS.md) | 17 | 17 | 0 | 0 | 🟢 Validado |
| [P2 — Dados de Matching](P2-MATCHING.md) | 13 | 13 | 0 | 0 | 🟢 Validado |
| [P3 — Equipe](P3-EQUIPE.md) | 15 | 15 | 0 | 0 | 🟢 Validado |
| [P4 — Codinome](P4-CODINOME.md) | 9 | 0 | 0 | 9 | 🟡 Desbloqueado (a validar) |
| [UX e Regras Globais](UX-REGRAS-GLOBAIS.md) | 15 | 0 | 0 | 15 | 🟡 Desbloqueado (a validar) |
| **Arquitetura (seção 1 checklist)** | 7 | 4 | 1 | 2 | 🟡 Parcial |
| **Total** | **77** | **50** | **1** | **26** | 🟠 **65%** |

> **Próximo passo:** seguir com validação detalhada de P4 + UX e consolidar os contadores finais da rodada.

---

## 1. Objetivo

Substituir o fluxo de onboarding atual do Ativo (5+ passos genéricos baseados no PRD v2.2) pelos **4 passos M&A específicos** definidos no Excalidraw. Este é o item de maior impacto visual para o cliente e deve ser a primeira entrega do realinhamento.

---

## 2. Diagnóstico — Estado Atual vs Excalidraw

### Fluxo atual (implementado)

```
profile_selection → cnpj_input → data_enrichment → data_confirmation → profile_details → [eligibility_check] → terms_acceptance → mfa_setup → pending_review → completed
```

### Fluxo Excalidraw (alvo)

```
[cnpj_input] → [data_enrichment] → Passo 1 (Dados Empresa) → Passo 2 (Dados Matching) → Passo 3 (Equipe) → Passo 4 (Codinome) → [terms_acceptance] → [mfa_setup] → [completed]
```

### Mapeamento de divergências

| Campo Excalidraw | Existe? | Ação |
|-----------------|---------|------|
| Nome responsável | ✅ | Auto-fill, editável |
| Nome empresa | ✅ | Auto-fill do CNPJ |
| Descrição empresa | ✅ | Manter, expandir textarea |
| Objetivo do projeto | ⚠️ | Expandir com sub-opções dinâmicas |
| Modelo de negócio | ❌ | NOVO: multi-select (B2B/B2C/B2B2C/B2G) |
| Setor de atuação | ⚠️ | Mudar para multi-select |
| Regiões de atuação | ❌ | NOVO: usar GeographySelector |
| ROB (últimos 12m) | ⚠️ | Renomear, ajustar contexto M&A |
| EBITDA % | ⚠️ | Mudar de valor absoluto para % |
| Nº funcionários | ❌ | NOVO |
| Ano de fundação | ❌ | NOVO |
| Localização sede | ⚠️ | Tornar editável, campo dedicado |
| Participação ofertada (%) | ❌ | NOVO |
| Valor alvo | ❌ | NOVO (usar UsdCurrencyInput) |
| Sócios | ⚠️ | Tornar editável (usar ShareholderEditor) |
| Advisors do projeto | ❌ | NOVO: lista com convite |
| Codinome do projeto | ❌ | NOVO: geração manual ou Mary AI |

**Resumo:** 5 existem, 5 parciais, 7 novos.

---

## 3. Arquitetura da Solução

### 3.1 Novos step types

```typescript
| 'asset_company_data'     // Passo 1 — Dados da Empresa
| 'asset_matching_data'    // Passo 2 — Dados de Matching
| 'asset_team'             // Passo 3 — Equipe
| 'asset_codename'         // Passo 4 — Codinome
```

### 3.2 Fluxo condicional por perfil

```typescript
const ASSET_STEP_ORDER = [
  'cnpj_input', 'data_enrichment',
  'asset_company_data', 'asset_matching_data', 'asset_team', 'asset_codename',
  'terms_acceptance', 'mfa_setup', 'completed',
]

const ASSET_WIZARD_STEPS = [
  'asset_company_data', 'asset_matching_data', 'asset_team', 'asset_codename',
]
```

### 3.3 Schema `onboarding_data` JSON

> Detalhes completos dos campos em cada subspec (P1, P2, P3, P4).

```typescript
interface AssetOnboardingData {
  // Passo 1 — ver P1-DADOS.md
  responsibleName: string; companyName: string; companyDescription: string;
  projectObjective: { type: 'investment' | 'full_sale'; subReason: string };
  businessModel: string[]; sectors: string[]; operatingRegions: string[];

  // Passo 2 — ver P2-MATCHING.md
  rob12Months: number; ebitdaPercent: number; employeeCount: number;
  foundingYear: number; headquarters: { city: string; state: string; country: string };
  equityOffered: number; targetValue: number;

  // Passo 3 — ver P3-EQUIPE.md
  shareholders: Array<{ name: string; email: string; role: string; ownershipPercent: number }>;
  advisors: Array<{ name: string; email: string; company: string; role: string }>;
  invitedMembers: Array<{ name: string; email: string }>;

  // Passo 4 — ver P4-CODINOME.md
  codename: string; codenameSource: 'manual' | 'ai';
}
```

---

## 4. Componentes

### Reusar

| Componente | Localização | Uso |
|-----------|-------------|-----|
| `StepIndicator` | `src/components/onboarding/StepIndicator.tsx` | Indicador 4 passos |
| `GeographySelector` | `src/components/shared/GeographySelector.tsx` | P1 — Regiões |
| `SectorMultiSelect` | `src/components/shared/SectorMultiSelect.tsx` | P1 — Setor |
| `ShareholderEditor` | `src/components/shared/ShareholderEditor.tsx` | P3 — Sócios |
| `UsdCurrencyInput` | `src/components/shared/UsdCurrencyInput.tsx` | P2 — ROB/Valor alvo |
| `CnpjInput` | `src/components/onboarding/CnpjInput.tsx` | Pre-step |
| `OnboardingWizard` | `src/components/onboarding/OnboardingWizard.tsx` | Orquestrador |

### Criar

| Componente | Passo |
|-----------|-------|
| `AssetCompanyDataStep` | 1 |
| `AssetMatchingDataStep` | 2 |
| `AssetTeamStep` | 3 |
| `AssetCodenameStep` | 4 |
| `ProjectObjectiveSelector` | 1 |
| `BusinessModelSelector` | 1 |
| `PercentInput` | 2 |
| `HeadquartersSelector` | 2 |
| `AdvisorEditor` | 3 |
| `CodenameGenerator` | 4 |

### Estrutura de arquivos

```
src/components/onboarding/
  OnboardingWizard.tsx           # Refatorar
  StepIndicator.tsx              # Ajustar labels
  steps/asset/
    AssetCompanyDataStep.tsx     # Passo 1
    AssetMatchingDataStep.tsx    # Passo 2
    AssetTeamStep.tsx            # Passo 3
    AssetCodenameStep.tsx        # Passo 4
  components/
    ProjectObjectiveSelector.tsx
    BusinessModelSelector.tsx
    PercentInput.tsx
    HeadquartersSelector.tsx
    AdvisorEditor.tsx
    CodenameGenerator.tsx
```

---

## 5. Layout e UX

> Regras detalhadas de UX em [UX-REGRAS-GLOBAIS.md](UX-REGRAS-GLOBAIS.md).

```
┌──────────────────────────────────────────────────────────────┐
│ Mary | Início > Onboarding > Passo X              Mary AI ▼ │
├──────────┬───────────────────────────────────────────────────┤
│ [ MRS ]  │  [ 1 ] ── [ 2 ] ── [ 3 ] ── [ 4 ]              │
│ [ Radar ]│  Dados    Matching  Equipe   Codinome            │
│ [ Feed ] │  [Campos do passo...]                            │
│          │                              [ > Próximo Passo ] │
├──────────┴───────────────────────────────────────────────────┤
│ [Nome Real] | [Company Name] | + Convidar membro            │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Backend

### Migration Supabase

```sql
ALTER TYPE onboarding_step ADD VALUE IF NOT EXISTS 'asset_company_data';
ALTER TYPE onboarding_step ADD VALUE IF NOT EXISTS 'asset_matching_data';
ALTER TYPE onboarding_step ADD VALUE IF NOT EXISTS 'asset_team';
ALTER TYPE onboarding_step ADD VALUE IF NOT EXISTS 'asset_codename';
```

### Server Actions

```typescript
export async function saveAssetCompanyData(orgId: string, data: AssetCompanyData): Promise<ActionResult>
export async function saveAssetMatchingData(orgId: string, data: AssetMatchingData): Promise<ActionResult>
export async function saveAssetTeamData(orgId: string, data: AssetTeamData): Promise<ActionResult>
export async function saveAssetCodename(orgId: string, data: AssetCodenameData): Promise<ActionResult>
export async function autoSaveOnboardingField(orgId: string, field: string, value: unknown): Promise<ActionResult>
```

---

## 7. Migração de Dados

```typescript
// Campos que mapeiam diretamente
'onboarding_data.description' → 'companyDescription'
'onboarding_data.sector' → 'sectors' (wrap em array)
'onboarding_data.revenueAnnualUsd' → 'rob12Months'
'onboarding_data.objective' → 'projectObjective.type'
'onboarding_data.ebitdaAnnualUsd' → calcular % se ROB disponível
'enrichment.shareholders' → 'shareholders'
'enrichment.address' → 'headquarters'
'enrichment.dataInicioAtividade' → 'foundingYear'
// Campos novos ficam null
```

---

## 8. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Refatoração quebra fluxos existentes | Manter steps antigos para investor/advisor |
| Migração falha | Testar em staging, manter fallback |
| Mary AI codinome não pronta | Input manual primeiro, AI como placeholder |
| Auto-save gera muitas requests | Debounce 2000ms, batch updates |

---

## 9. Dependências

- **H0.4:** Breadcrumbs (inline aqui enquanto H0.4 não entrega)
- **H0.6:** Auto-save/Tooltips (hook criado aqui, extraído em H0.6)
- **E6:** IA assistiva pós-onboarding (mock/placeholder neste escopo)

---

## 10. Critérios de Aceite (DoD)

- [ ] 4 passos Excalidraw implementados e funcionais
- [ ] Todos os 17+ campos presentes
- [ ] Sub-opções dinâmicas do objetivo com tooltips
- [ ] Setor multi-select, EBITDA como %
- [ ] Auto-save + tooltips em todos os campos
- [ ] Conclusão: modal + redirect MRS + codinome no menu
- [ ] Regressão: investor/advisor não quebram
- [ ] Migração de orgs existentes sem perda
- [ ] Testes passando
- [ ] Validado campo a campo contra `02_ATIVO.md`
