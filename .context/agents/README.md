# Feature-Developer Agent Playbook — Project Mary

## Mission
Deliver product features end-to-end (UX + API + integration + tests) **within the existing Next.js App Router architecture**, reusing established UI primitives, providers, onboarding/auth patterns, and shared libs (notably **CNPJ/BrasilAPI enrichment**).

---

## Operating Principles (Non‑negotiables)
1. **Follow existing structure first**: put code where the repo already expects it (App Router pages/routes, `src/components/*`, `src/lib/*`).
2. **Thin route handlers**: API `route.ts` should validate + orchestrate; move reusable logic to `src/lib/**`.
3. **Reuse UI primitives**: prefer `src/components/ui/*` before introducing new components/styles.
4. **Centralize onboarding state**: onboarding fields/steps live in `useOnboarding.ts` (+ `useAutoSave.ts` when draft persistence is needed).
5. **Tests match existing locations**: UI tests under `src/components/ui/__tests__`, onboarding tests under `src/components/onboarding/__tests__`.

---

## Repository Map (Where Features Typically Live)

### 1) Feature Entry Points — App Router
**Root**: `src/app/**`

**UI routes**
- `src/app/**/page.tsx` — pages and layouts for the product surface
- Protected areas:
  - `src/app/(protected)/[orgSlug]/**` — org-scoped feature pages (projects, pipeline, opportunities, settings, etc.)
  - `src/app/(protected)/advisor/**` — advisor experience
  - `src/app/(protected)/admin/**` — admin experience

**API routes**
- `src/app/api/**/route.ts` — server endpoints (App Router route handlers)
- Auth API endpoints already exist:
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/logout/route.ts`
  - `src/app/api/auth/signup/route.ts`
  - `src/app/api/auth/verify-mfa/route.ts`
  - `src/app/api/auth/forgot-password/route.ts`
  - `src/app/api/auth/reset-password/route.ts`
  - `src/app/api/auth/resend-otp/route.ts`

**Auth callback**
- `src/app/auth/callback/route.ts` — high-impact; modify cautiously

**UX pages already present (patterns to follow)**
- `src/app/login`, `src/app/signup`, `src/app/forgot-password`, `src/app/reset-password`, `src/app/verify-mfa`
- Legal: `src/app/terms`, `src/app/privacy`
- Onboarding: `src/app/onboarding/**` including `src/app/onboarding/[step]` and `pending-review`

---

### 2) Shared UI Primitives (Build with these first)
**Directory**: `src/components/ui/*`

Common primitives to reuse:
- `button.tsx`, `input.tsx`, `label.tsx`, `separator.tsx`, `badge.tsx`, `spinner.tsx`

**Tests**:
- `src/components/ui/__tests__`

**Rule of thumb**: if the UI element is generic (buttons, inputs, badges, layout separators, spinners), it belongs here and should be tested here.

---

### 3) Providers (Cross-cutting app state)
**Directory**: `src/components/providers/*`

Key providers:
- `src/components/providers/OrganizationProvider.tsx` — org context/state
- `src/components/providers/NavigationProvider.tsx` — navigation state/patterns

Use these instead of re-implementing “current org” or navigation state across pages.

---

### 4) Onboarding Cluster (Structured, stateful, tested)
**Directories**
- UI + logic: `src/components/onboarding/*`
- Step routes: `src/app/onboarding/**`
- Hooks:
  - `src/components/onboarding/hooks/useOnboarding.ts` — authoritative onboarding state machine and actions
  - `src/components/onboarding/hooks/useAutoSave.ts` — autosave/draft persistence

Onboarding components (examples present in repo context):
- `TermsAcceptance.tsx`, `StepIndicator.tsx`, and wizard/step components

**Tests**
- `src/components/onboarding/__tests__`

---

### 5) Domain Components (Feature-focused UI)
**Examples**
- Projects: `src/components/projects/*` (e.g., `ProjectCard`, `CreateProjectDialog`, `TaxonomySelector`, `ReadinessIndicator`)
- Navigation: `src/components/navigation/*` (`Sidebar`, `Header`, `OrgSwitcher`)
- Guards: `src/components/guards/*` (access control patterns)
- Dashboard: `src/components/dashboard/*`

Place reusable domain UI here; keep page-only glue inside the relevant `src/app/...` route.

---

### 6) Shared Libs / Integrations
**Directory**: `src/lib/**`

Key integration:
- `src/lib/enrichment/brasil-api.ts`
  - `cleanCnpj`, `formatCnpj`, `isValidCnpjFormat`
  - `fetchCnpjData`
  - `isCompanyActive`, `getCnaeDivision`

**Rule**: do not fetch BrasilAPI directly inside components/pages; use this module (or extend it).

---

## Standard Feature Development Workflow (End-to-End)

### Step 0 — Define the feature contract (required)
Produce a short “Implementation Plan” that answers:
- User story + acceptance criteria
- Entry point(s): which page(s) under `src/app/**`?
- Data contract(s): which API routes, request/response shapes
- UX states: loading / empty / error / success
- Permissions: protected route? org-scoped? advisor/admin?
- Test plan: where tests will live and what will be covered

**Deliverable**: 2–8 bullet plan mapping changes to specific files/directories.

---

### Step 1 — Locate the correct “home” for the feature
Choose based on scope:

**Org-scoped feature**
- Add/modify: `src/app/(protected)/[orgSlug]/<feature>/page.tsx`
- Prefer shared components in: `src/components/<domain>/*`

**Advisor/admin feature**
- Add/modify: `src/app/(protected)/advisor/<feature>/page.tsx` or `.../admin/...`

**Auth/onboarding feature**
- UI routes under: `src/app/login`, `src/app/signup`, `src/app/onboarding/**`
- Core logic in: `src/components/onboarding/hooks/useOnboarding.ts` (+ autosave hook)

**Shared/reusable UI**
- Put primitives into `src/components/ui/*`
- Put domain widgets into `src/components/<domain>/*`

---

### Step 2 — Build UI using repo conventions
- Compose from `src/components/ui/*` first (`Button`, `Input`, `Label`, `Badge`, `Spinner`, `Separator`)
- Reuse domain widgets when applicable:
  - Projects: `ProjectCard`, `CreateProjectDialog`, `ProjectStatusBadge`, etc.
  - Navigation: `Header`, `Sidebar`, `OrgSwitcher`
- Use providers rather than threading props across many layers:
  - `OrganizationProvider` for org context
  - `NavigationProvider` for nav behavior

**UX expectations**
- Implement explicit states:
  - Initial loading (use `Spinner`)
  - Empty state (clear message + primary action)
  - Error state (actionable copy + retry where possible)
  - Success state (confirmation + next steps)

---

### Step 3 — Add/extend API routes (when needed)
Create `src/app/api/<domain>/<action>/route.ts` and export `GET`/`POST`.

**Route handler responsibilities**
- Parse request
- Validate inputs at the boundary
- Call `src/lib/**` or other isolated helpers
- Return consistent JSON + appropriate status codes

**Prefer:**
- `src/lib/**` for reusable business logic
- Minimal logic in route files for better testability

**Route handler skeleton**
```ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    // Call lib/service
    // Shape response

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
```

**Auth routes reference**
- Follow patterns used in `src/app/api/auth/**/route.ts` (login/signup/verify-mfa/reset-password) for:
  - request parsing
  - error handling conventions
  - status codes
  - response shapes

---

### Step 4 — Integrate cross-cutting concerns
**Organization-aware features**
- Use `OrganizationProvider` patterns to avoid re-fetching/duplicating “current org” logic.

**Navigation changes**
- Update/extend navigation behavior via `NavigationProvider` and components in `src/components/navigation/*` (e.g., sidebar entries).

**Observability**
- `src/components/ObservabilityProvider.tsx` exists; use it as the standard integration point for feature-level logging/telemetry if the feature needs it.

---

### Step 5 — Add tests where the repo expects them
**UI primitives**
- `src/components/ui/__tests__`

**Onboarding**
- `src/components/onboarding/__tests__`

**Logic moved into libs/hooks**
- Prefer testing extracted logic (in `src/lib/**` or hook modules) rather than testing heavy route handlers directly.

**Browser API usage**
- Repo includes mocks for `ResizeObserver` and `IntersectionObserver` in `jest.setup.js`.
- If your feature uses observers, align with these mocks; extend them only when necessary.

---

## Common Task Playbooks (Do this, not guesswork)

### A) Add a new org-scoped page (protected)
**Use when:** new UI under `/(protected)/[orgSlug]/...`

1. Create page: `src/app/(protected)/[orgSlug]/<feature>/page.tsx`
2. If needed, add/adjust navigation:
   - `src/components/navigation/Sidebar.tsx` and/or `Header.tsx`
3. Use `OrganizationProvider` to access org state (don’t hand-roll org retrieval)
4. Compose UI from primitives and existing domain components
5. If backend interaction is required:
   - add API route under `src/app/api/<domain>/<action>/route.ts`
   - move business logic into `src/lib/**`
6. Add tests:
   - component tests in appropriate `__tests__` folder
   - critical state transitions and edge cases covered

**Checklist**
- [ ] Access control correct (protected path; org-scoped)
- [ ] Works with org switching (if org switcher exists in UX)
- [ ] Handles empty/error/loading

---

### B) Add/extend an API endpoint
**Use when:** new CRUD action, validation endpoint, or integration.

1. Add route file: `src/app/api/<domain>/<action>/route.ts`
2. Validate input early; return `400` for invalid payloads
3. Put reusable computations/integrations in `src/lib/**`
4. Keep error responses consistent and non-leaky (no secrets, no stack traces to client)
5. Add unit tests for the extracted logic (preferred)

**Checklist**
- [ ] Input validation at boundary
- [ ] Minimal logic in route file
- [ ] Correct status codes (`200/201`, `400`, `401/403`, `404`, `409`, `500`)
- [ ] Safe error messages

---

### C) Add a new onboarding step
**Use when:** onboarding flow changes or new required data fields.

1. Add step UI component under `src/components/onboarding/<StepName>.tsx`
2. Extend state/actions in `src/components/onboarding/hooks/useOnboarding.ts`
3. If draft persistence is needed:
   - update types and logic in `src/components/onboarding/hooks/useAutoSave.ts`
4. Wire step into the onboarding routing flow:
   - update step routing under `src/app/onboarding/[step]`
   - keep `StepIndicator.tsx` in sync
5. Add/extend tests in `src/components/onboarding/__tests__`

**Checklist**
- [ ] New fields exist in central onboarding state
- [ ] Validation blocks progression when necessary
- [ ] Autosave works (if applicable)
- [ ] Step indicator reflects new flow
- [ ] Tests cover transitions and validation

---

### D) Add CNPJ enrichment/validation functionality
**Use when:** feature accepts CNPJ or needs company data.

1. Use existing helpers from `src/lib/enrichment/brasil-api.ts`:
   - `cleanCnpj` to normalize
   - `formatCnpj` to display
   - `isValidCnpjFormat` to validate format
2. Fetch company data via `fetchCnpjData` (don’t fetch directly in components)
3. Add new reusable business predicates to the same module if needed:
   - follow patterns like `isCompanyActive`, `getCnaeDivision`
4. UI integration:
   - follow existing CNPJ input UX patterns in onboarding (if applicable)
5. Error handling:
   - treat upstream API failures as recoverable; provide retry

**Checklist**
- [ ] No direct BrasilAPI fetch in React components
- [ ] Normalization/formatting consistent
- [ ] API failure path tested/handled

---

### E) Add or change a reusable domain component (Projects/Navigation/etc.)
**Use when:** multiple pages need the same widget.

1. Place the component under the appropriate folder:
   - Projects: `src/components/projects/*`
   - Navigation: `src/components/navigation/*`
2. Accept a typed props interface (repo exports many `*Props` types)
3. Compose using `src/components/ui/*`
4. Add tests if behavior is non-trivial or it’s a shared component

**Checklist**
- [ ] Component is reusable (not tightly coupled to one page)
- [ ] Styling consistent with UI primitives
- [ ] Props are typed and minimal

---

## Codebase Conventions & Best Practices (Derived from This Repo)

### 1) “Right layer” state management
- Onboarding: `useOnboarding.ts` is the source of truth (avoid duplicate local state for onboarding progress).
- Autosave/drafts: `useAutoSave.ts` for persistence patterns.
- App-wide context: providers in `src/components/providers/*`.

### 2) Prefer composition over new styling systems
- Use the existing UI primitives to maintain consistency.
- If you must add a primitive, add it to `src/components/ui/` and include tests.

### 3) Keep integrations in libs
- `src/lib/enrichment/brasil-api.ts` is the model: format/validate/fetch + helper predicates.
- Mirror this approach for any new third-party integration.

### 4) Testing patterns already exist; extend them
- UI tests: `src/components/ui/__tests__`
- Onboarding tests: `src/components/onboarding/__tests__`
- Browser observers are already mocked in `jest.setup.js` (don’t reinvent).

### 5) App Router correctness
- Use `route.ts` exports (`GET`, `POST`) for API.
- Use `page.tsx` for pages.
- If metadata is used elsewhere (e.g., verify MFA page), follow that pattern when adding new top-level pages.

---

## Key Files (Quick Reference)

### App Router / Routes
- `src/app/api/auth/**/route.ts` — reference implementations for route handlers, error handling, auth flows
- `src/app/auth/callback/route.ts` — auth callback; sensitive/high-impact
- `src/app/(protected)/[orgSlug]/**` — org-scoped protected feature pages

### UI Primitives
- `src/components/ui/button.tsx` — standard buttons
- `src/components/ui/input.tsx` — standard inputs
- `src/components/ui/label.tsx` — form labels
- `src/components/ui/badge.tsx` — status/tags
- `src/components/ui/spinner.tsx` — loading UI

### Providers
- `src/components/providers/OrganizationProvider.tsx` — org context
- `src/components/providers/NavigationProvider.tsx` — navigation context

### Onboarding
- `src/components/onboarding/hooks/useOnboarding.ts` — onboarding state machine/actions
- `src/components/onboarding/hooks/useAutoSave.ts` — autosave draft persistence
- `src/components/onboarding/TermsAcceptance.tsx` — step component pattern
- `src/components/onboarding/StepIndicator.tsx` — step navigation display

### Enrichment
- `src/lib/enrichment/brasil-api.ts` — CNPJ utilities + BrasilAPI integration

---

## Definition of Done (Feature Developer)

### Functional
- [ ] Acceptance criteria met, including edge cases
- [ ] Loading / empty / error / success states implemented
- [ ] Permissions and protected routes correct (org/advisor/admin)

### Code quality
- [ ] Uses existing UI primitives and providers
- [ ] Reusable logic extracted into `src/lib/**` or hooks
- [ ] Route handlers remain thin and readable

### Tests
- [ ] Tests added/updated in the established test folders
- [ ] Onboarding changes include state transition and validation tests (when applicable)

### Safety & maintainability
- [ ] Input validation at boundaries (forms + APIs)
- [ ] Errors are consistent and non-leaky
- [ ] No secrets or privileged logic shipped to the client

---

## PR Packaging Guide (Expected Structure)
1. **Summary**: what changed and why; screenshots for UI changes
2. **Implementation plan**: include the short plan you used (or final version)
3. **Files changed** grouped by layer:
   - `src/app/**` (pages/routes)
   - `src/components/**` (UI/domain/providers/onboarding)
   - `src/lib/**` (shared logic/integrations)
   - tests
4. **Test plan**:
   - commands run + manual verification steps
5. **Follow-ups**:
   - any debt discovered, future improvements, or deferred refactors

---

## Guardrails (Common Mistakes to Avoid)
- Don’t call BrasilAPI from components/pages; use `src/lib/enrichment/brasil-api.ts`.
- Don’t introduce one-off UI patterns; use `src/components/ui/*`.
- Don’t create a parallel onboarding store; extend `useOnboarding.ts`.
- Don’t put business logic into `route.ts`; extract to `src/lib/**` for reuse/testing.
- Don’t break protected route assumptions (org slug routing and provider usage).
