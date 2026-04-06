# Development Workflow

This document describes the day-to-day development workflow for this repository: how work is picked up, implemented, validated, reviewed, and merged.

The codebase is a **Next.js (App Router)** web application with **server actions** and **API routes** under `src/app`, UI components under `src/components`, and shared domain logic in `src/lib` and `src/types`.

Related docs:
- **Testing:** [testing-strategy.md](./testing-strategy.md)
- **Tooling / environment:** [tooling.md](./tooling.md)

---

## Typical Development Loop

### 1) Pick up work
- Start from a small, well-scoped task (bug fix, UX improvement, refactor, feature slice).
- Confirm expected behavior and acceptance criteria:
  - Which screens/routes are affected
  - Edge cases (permissions, invalid inputs, network failures)
  - Any analytics/audit expectations (if applicable)

### 2) Create a focused branch
- Branch from the primary integration branch (typically `main`—see [Branching & Releases](#branching--releases)).
- Keep changes cohesive: aim for one “reason to change” per PR when possible.

### 3) Implement using repo conventions

#### UI and routing
- **App routes:** `src/app/**`
  - Auth flows: `src/app/login`, `src/app/signup`, etc.
  - Protected areas: `src/app/(protected)/**`
  - Onboarding routes: `src/app/onboarding/**` (including dynamic steps under `src/app/onboarding/[step]`)
- **Reusable UI primitives:** `src/components/ui/**`
- **Feature-level UI:** `src/components/<feature>/**`
  - Examples: onboarding, dashboard, projects, auth, navigation, guards

#### Server-side logic
- **Server actions:** `src/lib/actions/**`
  - Examples: `src/lib/actions/auth.ts`, `src/lib/actions/onboarding.ts`, `src/lib/actions/projects.ts`
- **Shared utilities / integrations:** `src/lib/**`
  - Examples: Supabase (`src/lib/supabase/**`), enrichment (`src/lib/enrichment/**`), validation (`src/lib/validation/**`), formatting (`src/lib/format/**`), email (`src/lib/email/**`)
- **Shared types (domain + DB):** `src/types/**`
  - Notable: `src/types/database.ts`, `src/types/onboarding.ts`, `src/types/projects.ts`

**Guiding principle:** Prefer extending existing patterns rather than introducing new abstractions.

### 4) Validate locally
Before opening a PR (or before requesting review), run the application and validate:
- Build/lint/typecheck/tests (see [Local Development](#local-development))
- Happy path + failure cases for the area you touched

If your change touches **onboarding**, **auth**, **enrichment**, or **readiness scoring**, sanity-check:
- invalid input handling
- permission/role boundaries
- network/service failures
- “partial state” scenarios (e.g., incomplete onboarding)

### 5) Open a PR early
- Open as **Draft** while iterating to get early feedback.
- Include:
  - what changed and why
  - key files/areas touched
  - how reviewers can validate locally
  - screenshots/recordings for UI changes (when relevant)

### 6) Review, iterate, and merge
- Address review feedback promptly.
- Keep PRs easy to review:
  - split follow-up cleanups into separate PRs
  - avoid bundling refactors with unrelated feature work unless necessary
- Merge only when checks are green and the change is well understood.

---

## Branching & Releases

### Branching model
- **Trunk-based development**
  - The default branch (often `main`) is the integration branch and should remain green.
  - Feature work happens on short-lived branches and is merged via PR.

### Branch naming
Use a consistent prefix:
- `feat/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`
- `refactor/<short-description>`
- `docs/<short-description>`

Examples:
- `feat/onboarding-data-confirmation`
- `fix/mfa-otp-validation`
- `refactor/readiness-score-calculation`
- `docs/update-testing-strategy`

### PR sizing
- Prefer small-to-medium PRs that are reviewable in one sitting.
- Split large changes into incremental PRs (optionally behind feature flags or isolated refactors).

### Release cadence
- Ship continuously when possible (merge to trunk once reviewed and green).
- If scheduled releases are used, keep release branches short-lived and backport only critical fixes.

### Tagging conventions
- Releases: `v<MAJOR>.<MINOR>.<PATCH>` (e.g., `v1.4.2`)
- Pre-releases: `v<MAJOR>.<MINOR>.<PATCH>-rc.<N>` (e.g., `v1.4.0-rc.1`)

---

## Local Development

### Install dependencies
```bash
npm install
```

### Run the dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Start production server (after build)
```bash
npm run start
```

### Run tests
```bash
npm test
```

### Run tests in watch mode (if configured)
```bash
npm run test:watch
```

### Lint / typecheck (if configured)
```bash
npm run lint
npm run typecheck
```

#### Notes
- Auth and data flows rely on Supabase (`src/lib/supabase/**`). Ensure your local environment variables are configured as described in **[tooling.md](./tooling.md)**.
- If you’re working on onboarding flows, you will commonly touch:
  - UI: `src/components/onboarding/**`
  - Routes: `src/app/onboarding/**`
  - Actions: `src/lib/actions/onboarding.ts`
  - Types/state: `src/types/onboarding.ts`

---

## Code Review Expectations

Code review exists to keep trunk stable, maintain consistency, and reduce regressions—especially in critical areas like auth, onboarding, permissions, and readiness scoring.

### Reviewer/Author checklist

#### Correctness & product behavior
- Change matches intended UX and business rules.
- Error states are handled:
  - network failures
  - missing permissions
  - invalid inputs
- No sensitive data is logged or exposed to the client.

#### Architecture & consistency
- UI changes follow component patterns:
  - primitives in `src/components/ui/**`
  - feature components in `src/components/<feature>/**`
- Server-side work uses:
  - `src/lib/actions/**` for actions
  - shared utilities in `src/lib/**` rather than duplicated logic
- Types are added/updated in `src/types/**` and kept consistent across actions/components.

#### Testing
- Appropriate tests are added/updated.
- Existing tests pass locally and in CI.
- Test scope matches risk (see **[testing-strategy.md](./testing-strategy.md)**).

#### Quality & maintainability
- Code is readable and named clearly.
- No dead code, debug prints, or commented-out blocks left behind.
- Follow-up work is tracked explicitly (issue/ticket), not left implicit.

#### Performance & security (as applicable)
- Avoid unnecessary client-side work or repeated requests.
- Access control and protected routes are respected (especially under `src/app/(protected)/**`).
- Rate limiting / abuse considerations are respected when touching auth flows (see `src/lib/auth/**`).

### Approvals and collaboration
- Prefer **at least one approving review** before merging.
- Use a second reviewer for higher-risk areas (auth, onboarding, permissions, anything “billing-like”).
- Resolve all blocking comments; keep discussion threads tidy (implement or document why not).
- If collaborating with agents or automation, follow guidance in **`AGENTS.md`** (task structure, handoffs, workflow expectations).

---

## Onboarding Tasks (Optional)

Recommended first tasks for new contributors:

### Run the app end-to-end
- Complete a basic auth flow: signup/login/logout.
- Navigate onboarding pages and confirm routing under `src/app/onboarding/**`.

### Make a small, safe change
- Improve a UI primitive in `src/components/ui/**` and update/add a test.
- Fix a validation edge case in `src/lib/validation/**`.

### Read “how we test” and “how we run”
- Start with **[testing-strategy.md](./testing-strategy.md)** and **[tooling.md](./tooling.md)**.

### Operational awareness (team-specific)
- Ask for links to dashboards/runbooks (CI, hosting, Supabase project, error tracking) if they’re maintained outside the repo.

---

## Related Resources

- [testing-strategy.md](./testing-strategy.md)
- [tooling.md](./tooling.md)
