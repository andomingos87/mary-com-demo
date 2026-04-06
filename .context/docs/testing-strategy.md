# Testing Strategy

This repository uses a **layered testing approach** to balance fast feedback for developers with high confidence in critical user journeys (auth, onboarding, projects, dashboard). The goal is to **test the right thing at the right level**:

- **Unit tests** for deterministic, pure logic.
- **Integration tests** for orchestration across modules and boundaries (actions/API routes/auth/Supabase clients).
- **UI/component tests** for shared UI primitives and key screens, focusing on behavior and accessibility.
- **Minimal E2E tests** for business-critical flows only (recommended if/when an E2E harness is introduced).

> Related: PR/CI expectations are documented in **[development-workflow.md](./development-workflow.md)**.

---

## Guiding Principles

### 1) Prefer fast, deterministic tests
- Keep unit tests free of network/database calls.
- Mock external services at module boundaries.
- Avoid time-based flakiness (freeze time when needed).

### 2) Test behavior, not implementation details
- UI tests should assert what a user can observe and do (roles, labels, text, navigation).
- Avoid brittle assertions tied to DOM structure or private component internals.

### 3) Regression-first mindset
Every bug fix should include a test that:
1. reproduces the issue, and  
2. proves the fix.

### 4) Protect high-risk domains with targeted coverage
Certain areas require stronger test guarantees due to security/business impact:
- **Auth + session/middleware**
- **Onboarding progress + validation**
- **Readiness scoring + taxonomy**
- **Permissions/navigation decisions**

---

## What to Test (by Area)

### Authentication & Session
**Why:** Security-sensitive and prone to edge cases.  
**Where:**
- `src/middleware.ts`
- `src/lib/auth/*`
- `src/lib/supabase/middleware.ts`
- `src/app/api/auth/*` (login/signup/logout/MFA/reset flows)

**Test focus:**
- Correct route gating (protected vs auth vs onboarding vs admin/advisor paths)
- MFA flows and OTP verification
- Session refresh/update behavior
- Rate limiting / device checks (where applicable)

---

### Onboarding
**Why:** Complex multi-step workflow with validations and state transitions.  
**Where:**
- UI: `src/components/onboarding/*` (e.g., `OnboardingWizard.tsx`)
- Logic: `src/types/onboarding.ts` (step/progress calculations)
- Actions: `src/lib/actions/onboarding.ts`

**Test focus:**
- Step validation rules and transitions (`getNextStep`, `calculateProgress`, etc.)
- “Pending review” and completion flows
- Server actions orchestrating validation → persistence → audit/logging

---

### Enrichment & Readiness Scoring
**Why:** Impacts decision-making; interacts with external sources.  
**Where:**
- `src/lib/enrichment/*`
- `src/lib/readiness/*`
- Taxonomy: `src/lib/taxonomy/*`

**Test focus:**
- Scoring calculations are deterministic and stable
- Enrichment orchestration works while external calls are mocked
- Confidence/coverage calculations behave correctly for edge cases

---

### Shared UI Primitives
**Why:** Used widely; regressions affect many screens.  
**Where:** `src/components/ui/*` and `src/components/ui/__tests__/*`

**Test focus:**
- Accessibility and correct semantics (labels, roles, keyboard behavior where relevant)
- Visual-state behavior that affects users (disabled, loading, error states)
- Avoid snapshot-only tests unless they add meaningful protection

---

## Test Types

### Unit Tests

**Purpose:** Validate pure logic quickly and deterministically.

**Frameworks/stack:**
- Jest
- (For React UI tests) `jest-environment-jsdom`
- Recommended: `@testing-library/react` + `@testing-library/jest-dom`

**Typical targets:**
- Utilities and helpers:
  - `src/lib/**`
  - `src/lib/validation/**`
  - `src/lib/format/**`
  - `src/lib/taxonomy/**`
  - `src/lib/readiness/**`
- Type-driven logic:
  - `src/types/**` (e.g., onboarding progress computations)

**Conventions (naming & placement):**
- `*.test.ts` for TypeScript modules
- `*.test.tsx` for React components
- Common pattern: colocated `__tests__` directories, e.g.:
  - `src/lib/actions/__tests__`
  - `src/lib/enrichment/__tests__`
  - `src/components/ui/__tests__`
  - `src/components/onboarding/__tests__`

**DOM polyfills:**
- `jest.setup.js` stubs browser APIs needed by JSDOM (e.g., `ResizeObserver`, `IntersectionObserver`).
- If a new dependency requires another missing browser API, add a minimal stub there.

---

### Integration Tests

**Purpose:** Validate module interactions (action → validation → client → side effects), while keeping external I/O controlled.

**Framework:** Jest (integration suites run in Jest as well)

**Typical targets/scenarios:**
- Server actions under `src/lib/actions/*`
- Auth API routes under `src/app/api/auth/*`
- Middleware and routing logic:
  - `src/middleware.ts`
  - `src/lib/supabase/middleware.ts`
- Enrichment orchestration:
  - `src/lib/enrichment/*` (mock external calls but keep orchestration real)

**Conventions:**
- Use either:
  - `*.test.ts`, or
  - `*.integration.test.ts` (recommended if you want to distinguish slower suites)
- Prefer colocating under `__tests__` near the module under test.

**Mocking expectations:**
- Mock:
  - Supabase client creation (`src/lib/supabase/server.ts`)
  - network fetches / third-party SDKs (enrichment, email)
- Keep:
  - input validation logic real
  - orchestration logic real
  - error handling and branching real

> If a test truly needs environment variables (e.g., to initialize a client), document required variables and provide safe local defaults. Prefer mocking for most cases.

---

### E2E Tests (Recommended, Not Standardized Yet)

There is **no standardized E2E harness currently defined** in the repository structure.

**Recommendation (if/when added):**
- Use **Playwright** for Next.js E2E coverage.

**What to cover (minimal set):**
- Signup → email/OTP/MFA verification → first login
- Onboarding wizard completion → pending review → completion
- Protected routes + role-based navigation and access control

**Suggested conventions:**
- `e2e/**/*.spec.ts` (Playwright default convention)

**Infrastructure requirements:**
- Dedicated test environment (separate Supabase project/schema)
- Seed/cleanup scripts and stable test accounts
- CI artifacts (traces/videos) on failure for debugging

---

## Running Tests

All tests:
```bash
npm run test
```

Watch mode:
```bash
npm run test -- --watch
```

Coverage:
```bash
npm run test -- --coverage
```

Run a single test file:
```bash
npm run test -- src/components/ui/__tests__/Label.test.tsx
```

Run tests matching a name/pattern:
```bash
npm run test -- --testNamePattern="onboarding"
```

> If repository scripts differ, align these commands with `package.json` (e.g., `test`, `test:watch`, `test:coverage`) while keeping the usage patterns consistent.

---

## Quality Gates

### Required checks before merging
- ESLint must pass
- Prettier formatting must be consistent
- TypeScript typecheck must pass
- Jest test suite must pass

### Coverage expectations
- **Overall:** maintain or improve baseline; avoid merging changes that reduce coverage without justification.
- **New/changed logic-heavy code:** target **80%+** line/branch coverage.
- **UI components:** prioritize meaningful behavior tests over chasing branch coverage.

### Areas that must be tested (high-impact)
No exceptions without explicit approval:
- Auth flows:
  - `src/app/api/auth/*`, `src/lib/auth/*`
- Onboarding validation/progress:
  - `src/types/onboarding.ts`, `src/lib/actions/onboarding.ts`, onboarding components
- Readiness scoring and taxonomy:
  - `src/lib/readiness/*`, `src/lib/taxonomy/*`
- Permissions/navigation decisions:
  - `src/types/navigation.ts`, route guards and middleware logic

### Stability rules
- No network calls in unit tests (mock external services).
- Integration tests must be deterministic:
  - freeze time where needed
  - avoid order-dependent tests
- Tests must be parallel-safe and isolated.

---

## Troubleshooting

### `ResizeObserver` / `IntersectionObserver` errors
These are polyfilled in `jest.setup.js`.

If a new UI dependency uses another browser API not available in JSDOM:
- add a lightweight stub to `jest.setup.js`
- keep it minimal (enough to satisfy the dependency without changing test behavior)

### Missing environment variables in CI
Symptoms often show up in integration-style tests that initialize auth/Supabase clients.

Preferred solutions:
- mock client creation for unit tests and most integration tests
- for true integration tests, document required env vars (and provide safe defaults for local runs)

### Long-running tests
If a suite becomes slow:
- move pure logic into unit tests
- keep integration tests focused on orchestration (mock external I/O)
- avoid globally increasing Jest timeouts unless unavoidable (it can mask real issues)

### Unstable UI assertions
Use Testing Library best practices:
- prefer `getByRole`, `getByLabelText`, `findByText`
- use `findBy…` and `waitFor` for async transitions
- avoid brittle queries tied to DOM structure or CSS selectors

---

## Related Resources

- **[development-workflow.md](./development-workflow.md)**
