# BLOCKER — Step `data_enrichment` trava o fluxo

**Spec pai:** [INDEX.md](INDEX.md)
**Severidade:** 🔴 Crítico — bloqueia validação de 70/77 itens
**Descoberto em:** 04/04/2026
**Status:** 🟢 Resolvido

---

## Sintoma

Ao avançar do `cnpj_input` para `data_enrichment`, o wizard exibe **"Step não encontrado"** e trava o fluxo. Nenhum dos 4 passos Excalidraw é acessível.

## Itens do checklist bloqueados por este bug

| Subspec | Itens bloqueados |
|---------|-----------------|
| Arquitetura (1.3, 1.6) | 2 |
| P1 — Dados (2.1–2.17) | 17 |
| P2 — Matching (3.1–3.13) | 13 |
| P3 — Equipe (4.1–4.15) | 15 |
| P4 — Codinome (5.1–5.9) | 9 |
| UX e Regras Globais (6.1–6.15) | 15 |
| **Total** | **71** |

## Causa raiz confirmada

A ação `enrichFromCnpjAction()` persistia `onboarding_step: 'data_enrichment'` de forma fixa, sem respeitar a transição por perfil. Para `asset`, isso gerava divergência entre estado persistido e fluxo aplicável, causando reconciliação incorreta e loop de navegação.

## Implementação realizada

1. `src/lib/actions/onboarding.ts`: remoção do hardcode e cálculo de `nextStep` via `getNextStep('cnpj_input', profileType)`.
2. `src/components/onboarding/OnboardingWizard.tsx`: navegação pós-CNPJ alinhada ao mesmo contrato (`getNextStep`).
3. `src/app/onboarding/[step]/page.tsx`: fallback do guard ajustado para não cair em `profile_selection` quando step persistido for skippable.
4. `src/app/onboarding/page.tsx`: mapeamento de retomada ampliado para `asset_*`.

## Critério de resolução

- [x] Fluxo parcial validado: acesso direto `/onboarding/data-enrichment` redireciona para `asset_company_data` sem erro
- [x] Fluxo completo ponta-a-ponta validado (`4.1` a `4.7` no checklist)
- [x] Subspecs P1–P4 e UX desbloqueadas para validação detalhada (checklist `6.1` a `6.5`)
