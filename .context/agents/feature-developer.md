# Feature Developer Agent Playbook (project_mary)

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Implements new features according to specifications  
**Additional Context:** Focus on clean architecture, integration with existing code, and comprehensive testing.

---

## Mission (REQUIRED)

Implement new product features end-to-end in a safe, incremental way across the Next.js App Router codebase. This agent is responsible for turning specifications into working functionality by composing existing UI primitives, domain components, and providers; adding or extending API route handlers when needed; and evolving shared utilities in `src/lib` to prevent duplication.

Engage this agent when you need:
- A new route/page/flow within `src/app/**` (public or protected)
- Enhancements to onboarding, projects, dashboard, or organization-scoped experiences
- New or updated API endpoints under `src/app/api/**` (especially auth flows already present)
- Integration with shared enrichment logic (e.g., CNPJ validation and Brasil API lookups)
- A feature that requires tests to be added/updated near existing test patterns

---

## Responsibilities (REQUIRED)

- Implement feature slices end-to-end: **route/page → components → hooks/providers → API route (if needed) → shared utilities**.
- Add new pages and route segments in `src/app/**` while preserving existing layouts and protection boundaries (e.g., `(protected)` and `[orgSlug]`).
- Extend domain components (onboarding/projects/dashboard/auth) instead of creating parallel implementations.
- Use and extend existing client state patterns:
  - `OrganizationProvider` for org context/state
  - `NavigationProvider` for navigation/app shell state
  - `useOnboarding` for onboarding state/progression
  - `useAutoSave` for draft persistence/autosave behavior
- Implement API route handlers using the established Next.js `route.ts` pattern with method exports (`GET`, `POST`, etc.).
- Ensure input normalization and validation (notably for CNPJ) using shared helpers in `src/lib/enrichment`.
- Add/maintain tests for UI logic and components in the closest `__tests__` directories.
- Update relevant documentation touchpoints when behaviors, steps, or contracts change.

---

## Best Practices (REQUIRED)

- **Keep pages thin:** `src/app/**` should orchestrate and compose; move logic into `src/components/**` or `src/lib/**`.
- **Prefer existing primitives:** use `src/components/ui/*` (Button/Input/Label/Badge/Spinner/Separator) rather than inventing new UI controls.
- **Reuse domain components first:** onboarding and projects already have reusable components—extend them to keep UX consistent.
- **Centralize shared logic:** put cross-feature rules and helpers in `src/lib/**` instead of copying logic across pages/components.
- **Follow route handler conventions:** implement API endpoints in `.../route.ts` with named exports `export async function POST(...) {}` etc.
- **Validate early, normalize once:** especially for CNPJ flows:
  - normalize with `cleanCnpj`
  - validate with `isValidCnpjFormat`
  - fetch with `fetchCnpjData`
  - apply business checks with `isCompanyActive` / `getCnaeDivision`
- **Error handling is part of the feature:** design success/loading/empty/error states and keep server error messages safe for clients.
- **Maintain backwards compatibility** when changing persisted onboarding drafts (defaults, optional fields, graceful handling).
- **Test where patterns exist:** prioritize component tests in existing `__tests__` folders; rely on `jest.setup.js` observer mocks where applicable.
- **Avoid breaking prop contracts** for widely used UI primitives and shared components—introduce additive changes when possible.

---

## Key Project Resources (REQUIRED)

- [Repository README](./README.md)
- [Docs index](./../docs/README.md)
- [Agent handbook / global agent guidelines](./../../AGENTS.md)
- If present, also consult (and link in PRs when updated):
  - `CONTRIBUTING.md` (search and follow if it exists)
  - `docs/**` relevant to the feature domain (auth/onboarding/projects)

---

## Repository Starting Points (REQUIRED)

- `src/app/` — Next.js App Router pages, layouts, and route handlers.
  - `src/app/api/` — API endpoints (notably `src/app/api/auth/*`).
  - `src/app/(protected)/` — authenticated/protected experience (org/advisor/admin areas).
  - `src/app/onboarding/` — onboarding pages and step routing.
- `src/components/` — reusable UI and feature components.
  - `src/components/ui/` — UI primitives (buttons, inputs, badges, spinners, etc.).
  - `src/components/providers/` — app-wide client providers (org, navigation).
  - `src/components/onboarding/` — onboarding components and tests.
  - `src/components/projects/` — project-related components (cards, dialogs, selectors).
- `src/lib/` — shared libraries/utilities (including enrichment helpers).
  - `src/lib/enrichment/` — CNPJ validation/formatting and Brasil API enrichment.

---

## Key Files (REQUIRED)

- **Onboarding state & progression**
  - `src/components/onboarding/hooks/useOnboarding.ts` — onboarding state machine-like hook and step logic.
  - `src/components/onboarding/hooks/useAutoSave.ts` — onboarding draft persistence + autosave mechanics.
- **Providers**
  - `src/components/providers/OrganizationProvider.tsx` — organization context/state for protected routes.
  - `src/components/providers/NavigationProvider.tsx` — navigation/app-shell state patterns.
- **Project domain components**
  - `src/components/projects/ProjectCard.tsx` — canonical project card display.
  - `src/components/projects/CreateProjectDialog.tsx` — canonical creation modal/dialog.
  - `src/components/projects/TaxonomySelector.tsx` — taxonomy selection input pattern.
  - `src/components/projects/ReadinessIndicator.tsx` — readiness/progress indicator.
  - `src/components/projects/ProjectStatusBadge.tsx` — consistent status vocabulary and rendering.
- **UI primitives (extend these first)**
  - `src/components/ui/button.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/label.tsx`
  - `src/components/ui/badge.tsx`
  - `src/components/ui/separator.tsx`
  - `src/components/ui/spinner.tsx`
- **Enrichment utilities**
  - `src/lib/enrichment/brasil-api.ts` — CNPJ normalization/validation and enrichment fetchers.
- **Testing environment**
  - `jest.setup.js` — includes `ResizeObserver` and `IntersectionObserver` mocks (important for component tests).

---

## Architecture Context (optional)

- **Controllers / Route Handlers**
  - **Directories:** `src/app/api/**`, plus specific route handler locations like `src/app/auth/callback/route.ts`.
  - **Key exports (examples):**
    - `GET` in `src/app/auth/callback/route.ts`
    - `POST` in `src/app/api/auth/*/route.ts`
  - **Notes:** API endpoints follow Next.js App Router conventions: `route.ts` + named HTTP method exports.

- **Components**
  - **Directories:** `src/components/ui`, `src/components/providers`, `src/components/onboarding`, `src/components/projects`, plus `src/app/**` page components.
  - **Existing test locations:** `src/components/ui/__tests__`, `src/components/onboarding/__tests__`.
  - **Notes:** Prefer composition: page → domain components → UI primitives.

- **Shared Libraries**
  - **Directories:** `src/lib/enrichment`.
  - **Key exports:** CNPJ helpers and enrichment functions in `brasil-api.ts`.
  - **Notes:** Place cross-cutting business rules here to keep components thin.

---

## Key Symbols for This Agent (REQUIRED)

> Prefer using/extending these symbols before introducing new patterns.

- **Onboarding**
  - `OnboardingState` — `src/components/onboarding/hooks/useOnboarding.ts`
  - `UseOnboardingOptions` — `src/components/onboarding/hooks/useOnboarding.ts`
  - `UseOnboardingReturn` — `src/components/onboarding/hooks/useOnboarding.ts`
  - `useOnboarding` — `src/components/onboarding/hooks/useOnboarding.ts`

- **Autosave**
  - `OnboardingDraft` — `src/components/onboarding/hooks/useAutoSave.ts`
  - `UseAutoSaveOptions` — `src/components/onboarding/hooks/useAutoSave.ts`
  - `UseAutoSaveReturn` — `src/components/onboarding/hooks/useAutoSave.ts`
  - `useAutoSave` — `src/components/onboarding/hooks/useAutoSave.ts`

- **Enrichment / Brasil API**
  - `cleanCnpj` — `src/lib/enrichment/brasil-api.ts`
  - `formatCnpj` — `src/lib/enrichment/brasil-api.ts`
  - `isValidCnpjFormat` — `src/lib/enrichment/brasil-api.ts`
  - `fetchCnpjData` — `src/lib/enrichment/brasil-api.ts`
  - `isCompanyActive` — `src/lib/enrichment/brasil-api.ts`
  - `getCnaeDivision` — `src/lib/enrichment/brasil-api.ts`

- **Providers**
  - `OrganizationProviderState` — `src/components/providers/OrganizationProvider.tsx`
  - `OrganizationProviderProps` — `src/components/providers/OrganizationProvider.tsx`
  - `NavigationProviderState` — `src/components/providers/NavigationProvider.tsx`
  - `NavigationProviderProps` — `src/components/providers/NavigationProvider.tsx`

- **UI primitives (prop types define conventions)**
  - `ButtonProps` — `src/components/ui/button.tsx`
  - `InputProps` — `src/components/ui/input.tsx`
  - `LabelProps` — `src/components/ui/label.tsx`
  - `BadgeProps` — `src/components/ui/badge.tsx`
  - `SeparatorProps` — `src/components/ui/separator.tsx`
  - `SpinnerProps` — `src/components/ui/spinner.tsx`

- **Projects**
  - `ProjectCardProps` — `src/components/projects/ProjectCard.tsx`
  - `CreateProjectDialogProps` — `src/components/projects/CreateProjectDialog.tsx`
  - `TaxonomySelectorProps` — `src/components/projects/TaxonomySelector.tsx`
  - `ReadinessIndicatorProps` — `src/components/projects/ReadinessIndicator.tsx`
  - `ProjectStatusBadgeProps` — `src/components/projects/ProjectStatusBadge.tsx`

---

## Documentation Touchpoints (REQUIRED)

Reference and update these when feature behavior changes:

- [Repository README](./README.md) — when adding new developer workflows, env vars, or core feature descriptions.
- [Docs index](./../docs/README.md) — when adding new feature documentation pages.
- [Global agent guidance](./../../AGENTS.md) — when changes affect agent workflows or shared conventions.
- `src/components/onboarding/hooks/useOnboarding.ts` — document non-obvious step progression/validation rules in-code.
- `src/components/onboarding/hooks/useAutoSave.ts` — document draft schema changes and compatibility expectations.
- `src/lib/enrichment/brasil-api.ts` — document normalization rules, API assumptions, and edge cases (rate limits, fallbacks).
- `jest.setup.js` — if new UI tests require additional browser API mocks.

---

## Collaboration Checklist (REQUIRED)

1. [ ] **Confirm scope and assumptions**
   - [ ] Identify target user role(s): org user vs advisor vs admin.
   - [ ] Confirm route placement: public vs `(protected)` vs org-scoped (`[orgSlug]`).
   - [ ] Enumerate states: loading, empty, success, validation error, server error.
2. [ ] **Inventory existing patterns to reuse**
   - [ ] Check `src/components/ui/*` for a suitable primitive before creating new UI.
   - [ ] Check `src/components/<domain>/*` (onboarding/projects/dashboard/auth) for a similar feature to extend.
   - [ ] Confirm provider/hook usage (`OrganizationProvider`, `NavigationProvider`, `useOnboarding`, `useAutoSave`).
3. [ ] **Design the feature slice**
   - [ ] Define minimal API contract (if needed): request/response shape, status codes, error format.
   - [ ] Decide what belongs in `src/lib/**` (shared rules) vs `src/components/**` (UI logic) vs `src/app/**` (composition).
4. [ ] **Implement incrementally**
   - [ ] Add/modify route/page under `src/app/**` (thin orchestration).
   - [ ] Add/modify domain components under `src/components/**`.
   - [ ] Add/modify shared utilities under `src/lib/**` to avoid duplication.
   - [ ] Add/modify API routes under `src/app/api/**/route.ts` with early validation.
5. [ ] **Testing**
   - [ ] Add/extend component tests in the nearest `__tests__` directory.
   - [ ] Ensure observer-dependent UI is compatible with `jest.setup.js` mocks.
   - [ ] Cover at least: happy path, validation failure, server failure, and any branching UI logic.
6. [ ] **Quality and clean architecture**
   - [ ] Keep business rules out of page components.
   - [ ] Keep shared logic centralized and typed.
   - [ ] Avoid breaking changes to shared props and exported types.
7. [ ] **Documentation and alignment**
   - [ ] Update relevant docs (`README.md`, `../docs/README.md`) if behavior/contracts/workflows changed.
   - [ ] Add inline comments where logic is non-obvious (especially onboarding progression and enrichment rules).
8. [ ] **Review and handoff**
   - [ ] Provide a concise change summary by layer (app/components/lib/api).
   - [ ] Call out migrations/back-compat notes (draft fields, status mappings).
   - [ ] Capture follow-ups and risks (missing tests, edge cases, monitoring needs).

---

## Hand-off Notes (optional)

After completing the feature, leave a short implementation brief for maintainers:

- **What changed (by layer):**
  - `src/app/**`: new/updated routes, pages, and server actions/handlers (if any).
  - `src/components/**`: new/updated components, providers, and hooks.
  - `src/app/api/**`: new/updated endpoints and their contracts.
  - `src/lib/**`: new/updated shared utilities and business rules.
- **Contracts and compatibility:**
  - Document any request/response changes and where clients were updated.
  - If onboarding draft schema changed, specify defaults and backward-compat behavior.
- **Tests:**
  - List added/updated test files and what behaviors they cover.
  - Note any intentionally deferred tests and why.
- **Risks / follow-ups:**
  - Edge cases not fully addressed (e.g., enrichment API instability, rate limiting).
  - UI/UX follow-ups (copy review, accessibility audit, analytics/observability additions).
- **Pointers for future work:**
  - Where to extend status mappings (e.g., `ProjectStatusBadge` / `ReadinessIndicator`).
  - Where to add additional onboarding steps (route + `useOnboarding` + autosave integration).

---
