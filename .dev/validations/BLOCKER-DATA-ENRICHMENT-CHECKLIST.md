# Checklist de Validacao — BLOCKER data_enrichment

**Spec:** `.dev/specs/H0.1-ONBOARDING-ATIVO/BLOCKER-data-enrichment.md`
**Spec pai:** `.dev/specs/H0.1-ONBOARDING-ATIVO/INDEX.md`
**Data da validacao:** 04/04/2026
**Validador:** Claude AI — spec-tester automatizado (browser + Supabase MCP)
**Ambiente:** [x] Local | [ ] Staging | [ ] Producao

---

## Como usar este checklist

Percorra cada secao na ordem. Para cada item, marque:
- `[x]` = Conforme (implementado e funcionando)
- `[~]` = Parcial (existe mas com ressalva — descreva no campo "Obs")
- `[ ]` = Ausente (nao implementado)
- `[N/A]` = Nao aplicavel neste ambiente

---

## 1. Definicao do Step no Sistema

| # | Verificacao | Status | Obs |
|---|------------|--------|-----|
| 1.1 | `data_enrichment` existe no enum `onboarding_step` em `src/types/database.ts` | [x] | Presente na union type, linha ~2080 |
| 1.2 | `data_enrichment` existe em `STEP_ORDER` em `src/types/onboarding.ts` | [x] | Posicao 3 (indice 2), linha 429 |
| 1.3 | `data_enrichment` esta em `WIZARD_VISIBLE_STEPS` | [x] | Linha 449 |
| 1.4 | `data_enrichment` tem entry em `STEP_REQUIREMENTS` (requer `cnpj`) | [x] | Linha 384 |
| 1.5 | URL slug `data-enrichment` mapeia para `data_enrichment` em `STEP_SLUG_MAP` | [x] | `src/app/onboarding/[step]/page.tsx`, linha 19 |

---

## 2. Correcao do Blocker — Skip para Asset

| # | Verificacao | Status | Obs |
|---|------------|--------|-----|
| 2.1 | `data_enrichment` adicionado ao `SKIPPABLE_STEPS.asset` | [x] | `src/types/onboarding.ts:413` |
| 2.2 | `getNextStep('cnpj_input', 'asset')` retorna `asset_company_data` (pula `data_enrichment` e `data_confirmation`) | [x] | Ambos estao em `SKIPPABLE_STEPS.asset` |
| 2.3 | `getPreviousStep('asset_company_data', 'asset')` retorna `cnpj_input` (pula `data_enrichment` e `data_confirmation`) | [x] | Teste atualizado e passando |
| 2.4 | `getNextStep('data_enrichment', 'asset')` retorna `asset_company_data` (caso alguem esteja nesse step) | [x] | `data_confirmation` e pulado, cai em `asset_company_data` |
| 2.5 | Fluxo investor nao e afetado (`data_enrichment` ja era skippable para investor) | [x] | `SKIPPABLE_STEPS.investor` ja continha `data_enrichment` |
| 2.6 | Fluxo advisor nao e afetado | [x] | `data_enrichment` nao esta no skip do advisor (advisor usa esse step normalmente) |

---

## 3. Correcao do Blocker — Case Defensivo no Wizard

| # | Verificacao | Status | Obs |
|---|------------|--------|-----|
| 3.1 | `OnboardingWizard.tsx` tem case `'data_enrichment'` no switch `renderStepContent()` | [x] | Linhas 411-424 |
| 3.2 | Para perfil `asset`, redireciona para `asset_company_data` | [x] | `goToStep('asset_company_data')` |
| 3.3 | Para outros perfis, redireciona para `data_confirmation` | [x] | `goToStep('data_confirmation')` |
| 3.4 | Exibe spinner + "Redirecionando..." durante o redirect (nao mostra "Step nao encontrado") | [x] | `<Spinner size="lg" />` |
| 3.5 | Acesso direto via URL `/onboarding/data-enrichment` nao trava o wizard | [x] | Redireciona para `asset_company_data` sem exibir "Step nao encontrado" (validado em `localhost:3001`) |

---

## 4. Fluxo Completo do Asset (Criterio de Resolucao)

| # | Verificacao | Status | Obs |
|---|------------|--------|-----|
| 4.1 | Fluxo `cnpj_input` -> proximo step nao passa por `data_enrichment` para asset | [x] | Validado apos migration do enum (`asset_*`): banco persiste `onboarding_step = asset_company_data` |
| 4.2 | Fluxo `cnpj_input` -> `asset_company_data` funciona sem erro | [x] | Validado no browser (`/onboarding/cnpj-input` -> `asset-company-data`) |
| 4.3 | `asset_company_data` -> `asset_matching_data` funciona | [x] | Validado no browser |
| 4.4 | `asset_matching_data` -> `asset_team` funciona | [x] | Validado no browser |
| 4.5 | `asset_team` -> `asset_codename` funciona | [x] | Validado em sessao limpa (`localhost:3000`) com persistencia SQL: `onboarding_step = asset_codename` apos avancar |
| 4.6 | `asset_codename` -> `terms_acceptance` funciona | [x] | Validado em sessao limpa com persistencia SQL: `onboarding_step = terms_acceptance`; retomada em `/onboarding` cai em `terms-acceptance` |
| 4.7 | Nenhum passo exibe "Step nao encontrado" | [x] | Nao observado em toda a rodada pos-migration |

---

## 5. Testes Automatizados

| # | Verificacao | Status | Obs |
|---|------------|--------|-----|
| 5.1 | Teste `SKIPPABLE_STEPS.asset` inclui `data_enrichment` | [x] | `onboarding.test.ts:68` |
| 5.2 | Teste `getNextStep('data_enrichment', 'asset')` retorna `asset_company_data` | [x] | `onboarding.test.ts:122` |
| 5.3 | Teste `getPreviousStep('asset_company_data', 'asset')` retorna `cnpj_input` | [x] | `onboarding.test.ts:148` — atualizado |
| 5.4 | Todos os 106 testes de onboarding passam | [x] | `npm test -- --testPathPattern=onboarding` |
| 5.5 | Zero erros de TypeScript nos arquivos modificados | [x] | `tsc --noEmit` sem erros em onboarding |

---

## 6. Desbloqueio de Subspecs

| # | Verificacao | Status | Obs |
|---|------------|--------|-----|
| 6.1 | P1 — Dados da Empresa (17 itens) desbloqueado para validacao | [x] | Desbloqueado por 4.2 |
| 6.2 | P2 — Dados de Matching (13 itens) desbloqueado para validacao | [x] | Desbloqueado por 4.3 |
| 6.3 | P3 — Equipe (15 itens) desbloqueado para validacao | [x] | Desbloqueado por 4.4 |
| 6.4 | P4 — Codinome (9 itens) desbloqueado para validacao | [x] | Desbloqueado por 4.5-4.6 com persistencia validada |
| 6.5 | UX e Regras Globais (15 itens) desbloqueado para validacao | [x] | Retomada de sessao confirmada em `terms_acceptance` (sem regressao para `asset_team`) |

---

## Resumo

| Secao | Total | Conforme | Parcial | Ausente | N/A |
|-------|-------|----------|---------|---------|-----|
| 1. Definicao no Sistema | 5 | 5 | 0 | 0 | 0 |
| 2. Skip para Asset | 6 | 6 | 0 | 0 | 0 |
| 3. Case Defensivo | 5 | 5 | 0 | 0 | 0 |
| 4. Fluxo Completo | 7 | 7 | 0 | 0 | 0 |
| 5. Testes | 5 | 5 | 0 | 0 | 0 |
| 6. Desbloqueio Subspecs | 5 | 5 | 0 | 0 | 0 |
| **Total** | **33** | **33** | **0** | **0** | **0** |

**Status geral:** 33/33 confirmados (100%), sem itens parciais e sem itens ausentes.

**Resultado da rodada automatizada (spec-tester):** Aprovado sem ressalvas. Fluxo final validado ponta-a-ponta com persistencia correta de `onboarding_step` e retomada consistente.

---

## 7. Correcao complementar — Reidratacao do P1 (asset_company_data)

| # | Verificacao | Status | Obs |
|---|------------|--------|-----|
| 7.1 | Loader de `/onboarding/[step]` reidrata `assetCompanyData` salvo em `onboarding_data` | [x] | Ajuste aplicado em `src/app/onboarding/[step]/page.tsx` com helper dedicado |
| 7.2 | Merge de payloads dos steps asset coberto por teste automatizado | [x] | `src/lib/actions/__tests__/onboarding.test.ts` (`Asset Step Hydration`) |
| 7.3 | Build apos ajustes de reidratacao | [x] | `npm run build` concluido com sucesso |
| 7.4 | Evidencias visuais do P1 salvas na pasta da spec | [x] | `.dev/specs/H0.1-ONBOARDING-ATIVO/evidence/*.png` |
| 7.5 | Revalidacao no browser confirma persistencia apos avancar/voltar e refresh | [x] | Validado em `localhost:3003` com screenshots `p1-rerun-*.png` e SQL de `assetCompanyData` persistido |

---

## 8. Correcao complementar — Fechamento dos itens P1 2.13 e 2.17

| # | Verificacao | Status | Obs |
|---|------------|--------|-----|
| 8.1 | Auto-fill do Passo 1 aplica fallback sem sobrescrever dados ja salvos | [x] | `hydrateAssetStepFormData` recebe fallback de `companyName` (`org.name`) e `responsibleName` (`user_metadata.full_name`) com precedencia do dado salvo |
| 8.2 | Loader do onboarding injeta fallback de `companyName` e `responsibleName` para perfil asset | [x] | `src/app/onboarding/[step]/page.tsx` atualizado para passar fallback no `reconstructFormData` |
| 8.3 | Mary AI contextual no Passo 1 habilitado com CTA e contexto pre-montado | [x] | `AssetCompanyDataStep` + `OnboardingWizard` + `MaryAiQuickChatSheet(initialMessage)` |
| 8.4 | Cobertura de regressao e build pos-ajustes | [x] | Testes atualizados em `onboarding.test.ts` e `MaryAiQuickChatSheet.test.tsx`; `npm run build` aprovado apos cada arquivo alterado |
| 8.5 | Revalidacao browser + Supabase confirma 2.13 e 2.17 em runtime | [x] | Validado em `localhost:3004` com screenshots `p1-rerun-04..07` e SQL MCP confirmando `onboarding_data.assetCompanyData` |

---

## Proximo passo

1. [x] Atualizar `BLOCKER-data-enrichment.md` para status resolvido e registrar evidencias finais da rodada limpa
2. [x] Atualizar contadores do `INDEX.md` para remover estado de bloqueio do onboarding ativo
3. [x] Iniciar validacao detalhada das subspecs P1-P4 e UX agora destravadas
4. [ ] Concluir validacao detalhada item a item nas subspecs `P1-DADOS`, `P2-MATCHING`, `P3-EQUIPE`, `P4-CODINOME` e `UX-REGRAS-GLOBAIS`
