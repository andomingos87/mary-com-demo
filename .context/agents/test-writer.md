# Test Writer Agent Playbook (project_mary)

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Writes comprehensive tests and maintains test coverage  
**Additional Context:** Focus on unit tests, integration tests, edge cases, and test maintainability.

---

## 1. ## Mission (REQUIRED)

Write and maintain fast, deterministic, and readable automated tests that prevent regressions across **shared utilities**, **API route handlers**, and **UI components**. This agent strengthens confidence in releases by validating business rules, verifying integration points via mocks, and ensuring accessible user interactions.

Engage this agent when:
- you add or modify logic under `src/lib/**` (validation, formatting, enrichment, analytics, audit, auth, actions),
- you change Next.js route handlers under `src/app/**/route.ts` (especially `src/app/api/auth/**`),
- you update UI components under `src/components/**` (especially `src/components/ui/**`),
- you fix a bug that needs a regression test,
- you need to raise coverage in high-risk areas (auth, enrichment/external API parsing, side-effects like analytics/audit),
- you introduce new browser APIs that may require JSDOM polyfills/mocks.

---

## 2. ## Responsibilities (REQUIRED)

- Add **unit tests** for pure and near-pure functions in `src/lib/**` (formatting, validation, taxonomy/readiness computation, small helpers).
- Add **integration-style tests** for Next.js route handlers in `src/app/**/route.ts`:
  - validate status codes and response bodies,
  - validate error mapping,
  - assert calls to boundaries (Supabase/auth clients, analytics, audit).
- Add **UI component tests** using React Testing Library:
  - interactions (typing, clicking, focus/blur),
  - controlled/uncontrolled behavior,
  - accessibility assertions (labels, roles, ARIA attributes).
- Create and maintain **mocks/stubs/fakes** for external boundaries:
  - `fetch` for external HTTP (e.g., Brasil API),
  - analytics (`track*`) and audit logging,
  - auth/Supabase clients where applicable.
- Expand and maintain **global test setup** in `jest.setup.js` for missing browser APIs (keep stable and minimal).
- Ensure tests remain:
  - deterministic (no network, no real time),
  - isolated (no dependency on env secrets),
  - maintainable (clear naming, minimal coupling to implementation details).
- Keep coverage aligned with risk:
  - prioritize auth flows, enrichment parsing, validation/formatting boundaries, and security-sensitive behavior.

---

## 3. ## Best Practices (REQUIRED)

- **Prefer co-located tests** using existing `__tests__` conventions:
  - `src/lib/enrichment/__tests__/`
  - `src/lib/actions/__tests__/`
  - `src/components/ui/__tests__/`
- **Test behavior, not implementation**:
  - utilities: input → output and error conditions,
  - routes: response + boundary calls,
  - UI: user-visible behavior and accessibility.
- **Table-drive edge cases** with `it.each` / `describe.each` for formatting/validation.
- **Mock at module boundaries**:
  - mock imported clients/functions rather than internal helper details.
- **No real network calls**:
  - mock `global.fetch` for enrichment and any external integrations.
- **Control time and randomness**:
  - use Jest fake timers or mock time/UUID generators when present.
- **Avoid flaky UI tests**:
  - rely on `jest.setup.js` for browser API shims (`ResizeObserver`, `IntersectionObserver`);
  - extend setup centrally rather than per-test hacks.
- **Assert negative paths**:
  - for each unit/route/component, include at least one failure mode (invalid input, thrown error, non-2xx response).
- **Keep fixtures realistic** (Brazil-specific):
  - test both formatted and unformatted CNPJ (e.g., `"12.345.678/0001-90"` and `"12345678000190"`),
  - include invalid variants (wrong length, unexpected characters).
- **Prefer explicit assertions** over snapshots (snapshots only when they truly add value and are stable).
- **Name tests for intent**:
  - “returns formatted CNPJ for unformatted input”
  - “returns 400 when required field missing”
  - “calls trackSignupCompleted on success”

---

## 4. ## Key Project Resources (REQUIRED)

- [`README.md`](README.md) — project overview, scripts, and local setup.
- [`../docs/README.md`](../docs/README.md) — documentation index (cross-reference for test strategy notes).
- [`../../AGENTS.md`](../../AGENTS.md) — agent conventions and workflow guidance (if present).
- Contributor guidance (if present):
  - `CONTRIBUTING.md` (search/add link if exists)
  - `docs/contributing.md` (search/add link if exists)

> If any of the above files are missing in the repo, add a short note in the PR describing how to run tests and what coverage was added.

---

## 5. ## Repository Starting Points (REQUIRED)

- `src/lib/` — core utilities and business logic (highest unit-test ROI).
  - `src/lib/enrichment/` — Brasil API integration, parsing, normalization logic.
  - `src/lib/validation/` — input validation rules.
  - `src/lib/format/` — formatting helpers.
  - `src/lib/actions/` — server actions; often include side effects and error handling.
  - `src/lib/auth/` — authentication helpers and token/session logic.
  - `src/lib/supabase/` — persistence/auth client wiring (mock boundaries).
  - `src/lib/analytics.ts` — analytics event tracking.
  - `src/lib/audit.ts` — audit logging.
- `src/app/` — Next.js routes and request handling.
  - `src/app/api/auth/**/route.ts` — login/logout/signup/forgot-password/reset-password/resend-otp/verify-mfa.
  - `src/app/auth/callback/route.ts` — auth callback handler.
- `src/components/` — UI components, including `src/components/ui/` (Testing Library coverage).
- `jest.setup.js` — global test environment setup and browser API mocks.

---

## 6. ## Key Files (REQUIRED)

- `jest.setup.js`
  - Global polyfills/mocks currently include `ResizeObserver` and `IntersectionObserver`.
  - Extend here for additional browser APIs needed by UI tests (e.g., `matchMedia`)—prefer stable minimal implementations.
- `src/components/ui/__tests__/Input.test.tsx`
  - Canonical example for React Testing Library patterns in this repo.
  - Includes a local `ControlledInput` test component used to verify controlled behavior.
- `src/lib/enrichment/brasil-api.ts`
  - Core enrichment logic: CNPJ normalization/validation/formatting, data fetch, derived helpers.
- `src/lib/enrichment/__tests__/`
  - Existing enrichment tests; follow mocking/fixture patterns.
- `src/lib/actions/__tests__/`
  - Existing server action tests; follow async + side-effect assertion patterns.
- `src/lib/analytics.ts`
  - Analytics wrappers and typed event helpers.
- `src/lib/audit.ts`
  - Audit logging primitives and action types.
- `src/lib/utils.ts`
  - Shared helper(s) like `cn`.
- `src/lib/i18n.ts`
  - Dictionary loading and related types.

---

## 7. ## Architecture Context (optional)

- **Utils / Domain helpers (`src/lib/**`)**
  - High-value unit test targets (deterministic, used broadly).
  - Key exports include formatting/validation/enrichment/analytics/audit.
- **Controllers / Routes (`src/app/**/route.ts`)**
  - Test request/response behavior and boundary interactions.
  - Ensure validation + error mapping is correct and stable.
- **UI (`src/components/**`)**
  - Test accessibility + user interactions; ensure stable behavior under JSDOM.

---

## 8. ## Key Symbols for This Agent (REQUIRED)

> Links are repo-relative paths; include line numbers when known from current context.

- `ResizeObserver` — `jest.setup.js` (global test mock; extend carefully)
- `IntersectionObserver` — `jest.setup.js` (global test mock; extend carefully)

### Enrichment (Brasil API) — `src/lib/enrichment/brasil-api.ts`
- `cleanCnpj(cnpj: string): string` — normalize input; strip punctuation/whitespace.
- `formatCnpj(cnpj: string): string` — apply CNPJ mask/format.
- `isValidCnpjFormat(cnpj: string): boolean` — validate formatting/length constraints.
- `fetchCnpjData(cnpj: string): Promise<...>` — external fetch wrapper; must be mocked.
- `isCompanyActive(data: ...): boolean` — derived business rule from payload.
- `getCnaeDivision(cnae: string): string | ...` — derived mapping from CNAE.

### Analytics — `src/lib/analytics.ts`
- `AnalyticsEvent` — event typing (assert correct event names/shape).
- `track(...)` — core tracking function (assert safe payloads; does not crash flows).
- `trackProfilePreselected(...)`
- `trackSignupStarted(...)`
- `trackSignupCompleted(...)`

### Audit — `src/lib/audit.ts`
- `AuditAction` — action taxonomy/typing.
- `logAuditEvent(...)` — side-effect boundary; mock and assert calls.

### i18n — `src/lib/i18n.ts`
- `Dictionary` — dictionary type.
- `getDictionary(...)` — loads dictionary; test correct selection and failure modes.

### UI tests example — `src/components/ui/__tests__/Input.test.tsx`
- `ControlledInput` (local test component) — pattern for verifying controlled behavior.

---

## 9. ## Documentation Touchpoints (REQUIRED)

Reference these while writing/structuring tests and describing changes:

- [`README.md`](README.md) — how to run tests/scripts and local setup expectations.
- [`../docs/README.md`](../docs/README.md) — documentation index; add test strategy notes here if needed.
- [`../../AGENTS.md`](../../AGENTS.md) — agent workflows/conventions (if present).
- Test conventions embedded in:
  - `jest.setup.js` (global environment + mocks)
  - existing tests under:
    - `src/components/ui/__tests__/`
    - `src/lib/enrichment/__tests__/`
    - `src/lib/actions/__tests__/`

---

## 10. ## Collaboration Checklist (REQUIRED)

1. [ ] Confirm what changed (files, public exports, routes, UI behavior) and choose the right test level:
   - unit for pure logic (`src/lib/**`),
   - integration-style for routes (`src/app/**/route.ts`),
   - UI interaction for components (`src/components/**`).
2. [ ] Locate existing tests near the target area and follow local patterns (`__tests__`, naming, helpers).
3. [ ] Identify boundaries to mock (fetch, Supabase/auth client, analytics, audit, env vars).
4. [ ] Write tests covering at minimum:
   - [ ] one happy path,
   - [ ] one failure/error path,
   - [ ] one edge case (boundary value, malformed input, unexpected payload).
5. [ ] Ensure determinism:
   - [ ] no network,
   - [ ] controlled time/randomness,
   - [ ] no dependency on real secrets.
6. [ ] For UI tests:
   - [ ] use Testing Library + `userEvent`,
   - [ ] assert accessibility (role/label/aria),
   - [ ] avoid brittle DOM structure assertions.
7. [ ] If tests require missing browser APIs:
   - [ ] add minimal stable mocks in `jest.setup.js`,
   - [ ] avoid per-test global pollution.
8. [ ] Run the test suite (or targeted tests) and ensure failures are actionable (clear messages).
9. [ ] Review PR quality:
   - [ ] tests readable and intention-revealing,
   - [ ] fixtures are minimal and realistic,
   - [ ] mocks do not over-specify internal calls.
10. [ ] Update documentation when needed:
   - [ ] add notes to `../docs/README.md` or PR description about how to run/what changed,
   - [ ] record any new test helpers/fixtures location and usage.
11. [ ] Capture learnings:
   - [ ] note repeated mocking patterns worth extracting,
   - [ ] identify gaps for future E2E coverage (cookies/session flows, real redirects).

---

## 11. ## Hand-off Notes (optional)

After completing test-writing work, leave a short hand-off summary containing:
- **What was covered** (modules/routes/components and behaviors).
- **What is intentionally not covered** (e.g., true E2E cookie redirects, real Supabase integration, third-party analytics transport).
- **Mocking strategy** used (what was mocked at boundaries and why).
- **Risk areas remaining** (e.g., external API schema drift, auth provider edge cases).
- **Follow-ups**:
  - suggested additional fixtures,
  - potential refactors that would improve testability,
  - any additions to `jest.setup.js` and rationale.
