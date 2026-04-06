# Gate de Revisao - Radar Contexto (2026-03-29)

## Escopo revisado

- Novos modulos: `radar-score`, `radar-teaser`, `radar-nda`.
- Novas skills: `radar-score`, `radar-teaser`, `radar-nda`.
- Novos especialistas: `specialist-radar-score`, `specialist-radar-teaser`, `specialist-radar-nda`.
- Reforco do modulo `radar` com referencias cruzadas.

## Checklist tecnico

- [x] Cobertura de escopo: Score/Teaser/NDA possuem `context.md`, `agents.md`, `skills.md`.
- [x] Qualidade de evidencia: todos os novos contextos citam arquivos reais de `src/**` e/ou `supabase/**`.
- [x] Governanca local de submodulo: skill e specialist com ordem obrigatoria e fonte primaria.
- [x] Seguranca/conformidade: NDA referencia RLS e migration de `nda_requests`/`investor_follows`.
- [ ] Nao-regressao documental global: ainda existem referencias legadas para `.context/modules/<modulo>.md`.

## Critero objetivo aplicado

- Regra: aprovar somente com 100% dos links internos esperados sem inconsistencia de path.
- Resultado desta rodada: **REPROVADO (parcial)**.

## Motivo da reprovacao parcial

Pendencias bloqueantes encontradas:

1. `.context/AI_GOVERNANCE.md` ainda referencia `.context/modules/<modulo>.md` (2 ocorrencias).
2. `.cursor/specialists/index.md` ainda referencia `.context/modules/<modulo>.md` (1 ocorrencia).

## Plano de resolucao imediata

- Corrigir os paths legados para `.context/modules/<modulo>/context.md`.
- Atualizar documentacao transversal (`glossary`, `data-flow`, `project-overview`, `architecture`).
- Emitir validacao final com nova verificacao por busca.

## Correcao blocker deploy onboarding (2026-03-29)

### O que mudou

- `src/app/onboarding/[step]/page.tsx`
  - `reconstructFormData` agora aceita `profile_type: OrganizationProfile | null` e retorna `undefined` quando o perfil estiver ausente.
  - `getCompletedSteps` agora aceita `profile_type: OrganizationProfile | null`.
- `src/components/mary-ai/MaryAiQuickChatSheet.tsx`
  - troca de spread de `Set` por `Array.from(new Set(...))` para compatibilidade no type-check de build.
- `src/components/onboarding/EligibilityForm.tsx`
  - ajuste de `refMap` para `Partial<Record<...>>` alinhado ao tipo atual de `EligibilityInput`.
- `src/components/onboarding/ProfileDetailsForm.tsx`
  - adicao de import ausente de `cn`.

### Por que mudou

- O deploy da Vercel falhava no type-check com incompatibilidade de tipo entre `currentOrg.profile_type` (`OrganizationProfile | null`) e helpers que exigiam `OrganizationProfile` nao nulo.
- Durante a validacao obrigatoria (`npm run build`), surgiram bloqueios adicionais de type-check no mesmo ciclo e foram corrigidos para restabelecer build green.

### Evidencias

- Build local executado com sucesso: `npm run build` (Next.js 14.2.35), incluindo geracao de paginas estaticas e finalizacao sem erros.
- Gate tecnico aprovado com checklist:
  - tipagem segura sem cast inseguro para `profile_type` nulo;
  - fluxo de redirect de onboarding preservado;
  - sem erros de lint nos arquivos alterados (`ReadLints`).
