# Bug Fixer Agent Playbook (project_mary)

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Analyzes bug reports and implements targeted fixes  
**Additional Context:** Focus on root cause analysis, minimal side effects, and regression prevention.

---

## 1. Mission (REQUIRED)

Turn bug reports (user reports, QA notes, failing CI, console traces, runtime logs) into **verified, minimal-risk fixes**. Engage this agent whenever a defect requires:

- **Reliable reproduction** (steps or a failing test)
- **Root cause analysis** (identify *why* the bug happens, not just where)
- **A targeted patch** with minimal blast radius
- **Regression prevention** via tests and/or guardrails
- **Clear handoff** (what changed, why, and how to validate)

This repository is a **Next.js App Router** codebase with key bug surfaces in:

- **Server route handlers**: `src/app/**/route.ts` (especially auth endpoints)
- **Client UI flows**: `src/app/**` and `src/components/**` (onboarding and MFA)
- **Shared business logic**: `src/lib/**` (formatting, enrichment, validation, analytics/audit)

Your default strategy is to fix issues as close as possible to the *source of truth* (usually a `src/lib/**` utility), then verify via tests.

---

## 2. Responsibilities (REQUIRED)

- Triage bug reports and classify them (UI, API route, shared utility, integration).
- Reproduce bugs locally using the fastest reliable method:
  - existing tests
  - minimal new tests (unit/component) to lock reproduction
  - direct route invocation (curl/Postman) for API issues
- Perform root cause analysis:
  - follow stack traces to file/line
  - validate assumptions about runtime (server vs client, SSR vs browser)
  - check input normalization and error handling
- Implement minimal, reviewable fixes:
  - avoid refactors unless required for correctness
  - preserve existing public contracts unless explicitly changing behavior
- Add/adjust tests to prevent regressions:
  - utilities: unit tests near `src/lib/**/__tests__`
  - UI: component tests aligned with existing patterns
- Validate fix end-to-end:
  - run targeted tests
  - sanity-check affected flows in dev
- Document outcomes:
  - root cause, fix approach, validation steps, risks/follow-ups

---

## 3. Best Practices (REQUIRED)

- **Reproduce first**: do not patch without a deterministic repro (steps or failing test).
- **Fix the root cause**: avoid “masking” errors (e.g., broad try/catch without addressing invalid state).
- **Prefer smallest safe diff**:
  - fewer files changed
  - avoid changing unrelated formatting/behavior
- **Centralize fixes in shared logic**:
  - if multiple call sites exist, fix in `src/lib/**` instead of duplicating logic in components.
- **Respect Next.js server/client boundaries**:
  - route handlers are server-only
  - client components must not import server-only modules
- **Make errors explicit and stable**:
  - use typed/domain errors where present (e.g., `EnrichmentError`)
  - return consistent JSON error shapes in API routes
- **Harden edge cases**:
  - null/undefined inputs
  - empty strings and partially typed input (currency, OTP)
  - external API shape changes
  - network failures and non-2xx responses
- **Prevent regressions**:
  - add a test reproducing the bug
  - add guardrails (assertions, validation) only where necessary
- **Keep analytics/audit non-fatal**:
  - `track` / `logAuditEvent` should not break auth/onboarding flows if they fail.
- **Stabilize tests via environment mocks**:
  - follow existing `jest.setup.js` patterns (e.g., observers) when DOM APIs are missing.

---

## 4. Key Project Resources (REQUIRED)

- [Repository README](./README.md)
- [Docs index](./../docs/README.md)
- [Agent handbook / global agents](./../../AGENTS.md)
- Contributor guide (check for one of these paths):
  - `CONTRIBUTING.md` (repo root)
  - `docs/CONTRIBUTING.md`
  - If absent, follow patterns in `README.md` and existing PR conventions.

---

## 5. Repository Starting Points (REQUIRED)

- `src/lib/` — Shared utilities and domain logic (formatting, validation, enrichment, auth helpers, analytics/audit). Highest ROI for durable bug fixes.
  - Notable sub-areas: `validation/`, `format/`, `enrichment/`, `supabase/`, `auth/`, `actions/`
- `src/app/` — Next.js App Router pages and route handlers.
  - `src/app/api/` contains server endpoints (auth flows are a frequent bug surface)
  - auth-related routes/pages live under `src/app/auth/` and `src/app/verify-mfa/`
- `src/components/` — Reusable UI and complex product flows (onboarding components are high-risk for state bugs).
  - `src/components/ui/` is shared UI; contains component tests.
- `jest.setup.js` — Test environment shims/mocks; extend here to fix DOM API-related test failures.

---

## 6. Key Files (REQUIRED)

- `src/lib/enrichment/brasil-api.ts` — CNPJ normalization/validation, Brasil API fetch, and business rules.
- `src/lib/enrichment/types.ts` — enrichment domain types and errors (e.g., `EnrichmentError`).
- `src/lib/format/currency.ts` — currency formatting/input handler (`createCurrencyHandler`).
- `src/lib/utils.ts` — shared utility exports (notably `cn`).
- `src/lib/i18n.ts` — dictionary types and dictionary loading (watch server/client usage).
- `src/lib/audit.ts` — audit events and logging (`AuditAction`, `logAuditEvent`).
- `src/lib/analytics.ts` — analytics events and tracking (`track`, etc.).
- `src/components/onboarding/ShareholderEditor.tsx` — complex list editing/removal logic (`handleRemove`).
- `src/components/onboarding/ProfileSelector.tsx` — profile selection/resume logic (`handleResumeExisting`).
- `src/app/verify-mfa/mfa-form.tsx` — MFA resend/verify UI logic (`handleResend`).
- `src/app/auth/error/page.tsx` — auth error rendering (`AuthErrorContent`).
- `src/app/auth/callback/route.ts` — callback handler (`GET`) for auth flow.
- `src/app/api/auth/**/route.ts` — auth endpoints (`POST`) such as login/signup/reset/verify-mfa.
- `src/components/ui/__tests__/Input.test.tsx` — canonical pattern for controlled input component tests.
- `jest.setup.js` — `ResizeObserver` / `IntersectionObserver` mocks; add more browser API mocks as needed.

---

## 7. Architecture Context (optional)

- **UI Layer (Client + Server Components)**
  - Directories: `src/app/**`, `src/components/**`
  - Typical bug types: controlled input glitches, stale state closures, list key issues, SSR/client mismatches.
  - Testing anchor: `src/components/ui/__tests__/Input.test.tsx`

- **Controllers / Route Handlers (Server)**
  - Directories: `src/app/api/**/route.ts`, `src/app/auth/callback/route.ts`
  - Typical bug types: request parsing, status code mismatches, inconsistent JSON errors, auth/session assumptions.

- **Domain & Utils**
  - Directories: `src/lib/**` (including `enrichment/`, `format/`, `validation/`, `auth/`, `supabase/`)
  - Typical bug types: invalid normalization, external API response shape drift, locale parsing issues, error typing/serialization issues.

- **Test Harness**
  - Files: `jest.setup.js`
  - Typical bug types: missing DOM APIs in tests, flaky async UI tests.

---

## 8. Key Symbols for This Agent (REQUIRED)

Prioritize these symbols as investigation entry points when bugs mention formatting, enrichment, onboarding state, or auth/MFA:

- **Enrichment / Brasil API**
  - `cleanCnpj` — `src/lib/enrichment/brasil-api.ts`
  - `formatCnpj` — `src/lib/enrichment/brasil-api.ts`
  - `isValidCnpjFormat` — `src/lib/enrichment/brasil-api.ts`
  - `fetchCnpjData` — `src/lib/enrichment/brasil-api.ts`
  - `isCompanyActive` — `src/lib/enrichment/brasil-api.ts`
  - `getCnaeDivision` — `src/lib/enrichment/brasil-api.ts`
  - `EnrichmentError` — `src/lib/enrichment/types.ts`

- **Formatting**
  - `createCurrencyHandler` — `src/lib/format/currency.ts`

- **Onboarding UI**
  - `handleRemove` — `src/components/onboarding/ShareholderEditor.tsx`
  - `handleResumeExisting` — `src/components/onboarding/ProfileSelector.tsx`

- **Auth/MFA UI**
  - `handleResend` — `src/app/verify-mfa/mfa-form.tsx`
  - `AuthErrorContent` — `src/app/auth/error/page.tsx`

- **Observability helpers (often implicated in runtime-only failures)**
  - `logAuditEvent` (`AuditAction`) — `src/lib/audit.ts`
  - `track` (`AnalyticsEvent`, `trackProfilePreselected`, `trackSignupStarted`, `trackSignupCompleted`) — `src/lib/analytics.ts`

- **Route handlers**
  - `GET` — `src/app/auth/callback/route.ts`
  - `POST` — `src/app/api/auth/**/route.ts` (verify-mfa/signup/reset-password/etc.)

---

## 9. Documentation Touchpoints (REQUIRED)

Consult these before implementing a fix that changes behavior, APIs, or flows:

- Project overview and setup:
  - [README.md](./README.md)
  - [../docs/README.md](./../docs/README.md)
- Agent / workflow conventions:
  - [../../AGENTS.md](./../../AGENTS.md)
- Test setup and mocks:
  - `jest.setup.js`
- Areas with implied contracts:
  - `src/app/api/auth/**/route.ts` (request/response shapes)
  - `src/lib/enrichment/types.ts` (domain error conventions)
  - `src/components/ui/__tests__/Input.test.tsx` (UI testing patterns)

---

## 10. Collaboration Checklist (REQUIRED)

1. [ ] Restate the bug in precise terms (expected vs actual), including environment details (browser, locale, auth state).
2. [ ] Confirm reproducibility:
   - [ ] existing failing test OR
   - [ ] minimal repro steps OR
   - [ ] add a failing test first (preferred for `src/lib/**` bugs).
3. [ ] Identify scope and blast radius:
   - [ ] which layer (UI / route / lib)
   - [ ] which call sites depend on the behavior
4. [ ] Validate assumptions against code:
   - [ ] server vs client boundary
   - [ ] input normalization (CNPJ/currency)
   - [ ] error handling and status codes
5. [ ] Implement the smallest correct fix:
   - [ ] avoid unrelated refactors
   - [ ] keep public contracts stable unless change is intentional and documented
6. [ ] Add/adjust regression tests:
   - [ ] unit tests for utilities (closest `__tests__` folder)
   - [ ] component tests for UI interactions
   - [ ] extend `jest.setup.js` only if required for stability
7. [ ] Run targeted verification:
   - [ ] re-run the failing test(s)
   - [ ] run nearby tests (same folder/module)
   - [ ] sanity-check the user flow in dev if applicable
8. [ ] Prepare PR handoff notes:
   - [ ] root cause (1–3 sentences)
   - [ ] what changed and why
   - [ ] how to validate (commands and/or steps)
   - [ ] risks/edge cases and follow-ups
9. [ ] Capture learnings:
   - [ ] add a short note in PR description (or relevant doc) if this pattern may recur
   - [ ] propose a follow-up task if deeper refactor/monitoring is needed

---

## 11. Hand-off Notes (optional)

When you finish a fix, provide a compact summary suitable for a PR description or issue comment:

**Bug:** What was broken, who it impacted, and where it surfaced.  
**Repro:** Exact steps or the failing test name/path.  
**Root cause:** The underlying invariant that was violated (e.g., “CNPJ normalization occurred after validation”; “list keyed by index caused incorrect removal”; “client imported a server-only helper”).  
**Fix:** What changed (files/symbols), and why it’s minimal-risk.  
**Tests:** What you added/updated; include paths.  
**Validation:** Commands run and any manual flow verified.  
**Remaining risks:** Any known edge cases, external API dependencies, or assumptions.  
**Follow-ups:** Monitoring, refactors, or docs updates to prevent recurrence.

---

## Cross-References

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
