# Status Atual do Backlog

**Fase ativa:** Fase 0 — Realinhamento Excalidraw
**Épico em foco:** E0 — Realinhamento Excalidraw
**Progresso do épico:** 0 de 7 histórias concluídas (+ 1 bug B0.8)
**Data de referência:** 02/04/2026

---

## Em Andamento

- **[E0]** Realinhamento Excalidraw — Marcado como "Em andamento" desde 02/04/2026. Nenhuma história dentro de E0 foi concluída ainda.

---

## Próxima Etapa Recomendada

### **[H0.1] Refatorar Onboarding do Ativo (4 Passos Excalidraw)**

**Por que agora:**
- **P0** (crítico) — Primeira entrega do realinhamento, impacto visual máximo para cliente
- **Sem dependências** — Pode começar imediatamente
- **Liberação de parcelas** — Concluir E0 é pré-requisito para cliente autorizar próximas tranches
- **Já tem spec detalhada** — `.dev/specs/H0.1-ONBOARDING-ATIVO.md` (100% pronta)
- **Componentes reutilizáveis disponíveis** — GeographySelector, SectorMultiSelect, ShareholderEditor, StepIndicator, UsdCurrencyInput

**O que falta:**
- Refatorar `OnboardingWizard.tsx` para os 4 passos Excalidraw (vs 5+ genéricos atuais)
- Adicionar 7 novos campos M&A (modelo negócio, regiões, participação %, valor alvo, nº funcionários, ano fundação, advisors)
- Implementar geração automática de codinome (Passo 4)
- Padronizar auto-save e tooltips com feedback visual
- Validar contra `.dev/excalidraw/02_ATIVO.md` campo a campo

**Estimativa:** L (grande)
**Risco:** Alto (impacto visual máximo)

**Arquivos impactados:**
- `src/components/onboarding/OnboardingWizard.tsx` — reestruturar steps
- `src/components/onboarding/ProfileDetailsForm.tsx` — campos M&A
- `src/types/onboarding.ts` — novo contrato de steps
- `src/types/database.ts` — novos OnboardingStep types
- `src/lib/actions/onboarding.ts` — validações e server actions
- Schema Supabase: `organizations.onboarding_data` JSON

**Spec:** `.dev/specs/H0.1-ONBOARDING-ATIVO.md` (completa)

---

## Sequência Após Isso

1. **[H0.7] Ajustar Menus Laterais por Perfil**
   - Por que depois: P1, rápido (S), visível, desbloqueador de B0.8
   - Reordenar menu por perfil conforme Excalidraw (Investidor, Ativo, Advisor)
   - Implementar codinome dinâmico no menu Ativo
   - Spec: `.dev/specs/H0.4-H0.7-ITENS-MENORES.md`

2. **[H0.4] Implementar Breadcrumbs Globais**
   - Por que depois: P1, rápido (S), visível no mesmo sprint que H0.7
   - Componente reutilizável de breadcrumb em todas as telas protegidas
   - Navegação funcional e responsiva
   - Spec: `.dev/specs/H0.4-H0.7-ITENS-MENORES.md`

3. **[B0.8] Tornar Fluxo Multi-organização Acessível na Navegação**
   - Por que depois: P1, médio (S), depende de H0.7 estar completo
   - Habilitar CTA "Nova organização" também com 1 org (não só em dropdown)
   - Viabilizar validação de cenário multi-organização
   - Estimativa: S | Risco: Médio

---

## Próximas Etapas (Sprint 2)

4. **[H0.2] Complementar Campos da Tese de Investimento**
   - P0, M, adicionar ROB min/max, EBITDA%, público-alvo, tipo operação, critérios exclusão
   - Spec: `.dev/specs/H0.2-TESE-INVESTIDOR.md`

5. **[H0.3] Expandir Pipeline de 5 para 12 Fases**
   - P0, M, migração do pipeline para as 12 fases Excalidraw
   - Spec: `.dev/specs/H0.3-PIPELINE-12-FASES.md`

6. **[H0.6] Padronizar Auto-save e Tooltips em Todas as Telas**
   - P1, M, extrair useAutoSave para Supabase, implementar tooltips Excalidraw
   - Spec: `.dev/specs/H0.4-H0.7-ITENS-MENORES.md`

---

## Blockers / Decisões Pendentes

- **T7.1** (Assinatura eletrônica no MVP) — Pendente de decisão formal
- **T7.2** (Política inicial de upload) — Pendente de baseline
- **H0.5** (Mary AI sidebar) — Marcado como L/Médio risco, agendado para Sprint 3 (após H0.6)

---

## Recomendação de Ação Imediata

**Comece por H0.1 hoje.** É o item que:
- Tem maior impacto visual (resgata confiança do cliente)
- Tem spec 100% pronta
- Não depende de nada
- Libera o épico E0 quando concluído
- Permite validação direta contra Excalidraw (`02_ATIVO.md`)

Após H0.1 passar em validação cliente, o épico E0 sairá do "Em andamento" para criar momentum nas próximas entregas.
