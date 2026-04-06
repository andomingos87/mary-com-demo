# Architecture

This document describes the high-level architecture of **Project Mary** and how code is organized, how requests flow through the system, and where to place new functionality.

Project Mary is a **single Next.js application (App Router)** that combines server-rendered UI, API route handlers, and server-side “actions” in one deployable unit. Internally it follows a **modular monolith** approach: UI and route files are kept thin, while core business logic, integrations, and shared contracts are centralized under `src/lib/**` and `src/types/**`.

---

## Goals and design principles

### What the architecture optimizes for

- **Fast iteration**: UI, API, and server logic live together, avoiding microservice overhead.
- **Clear seams**: route handlers and pages delegate to reusable modules (actions/libs) rather than embedding business logic in routes.
- **Typed contracts**: database and domain types are centralized in `src/types/**` and reused across UI + server.
- **Security by construction**: protected routes are gated in middleware and enforced again in server-side actions.

### What to avoid

- Business rules inside route handlers (`src/app/**/route.ts`) or React components.
- Importing UI (`src/app`, `src/components`) from domain modules (`src/lib`).
- Tight cross-domain coupling inside `src/lib` (prefer domain-focused modules/files).

---

## System overview (modular monolith)

**Topology:** One Next.js application containing:

- **UI routes** via App Router (`src/app/**`)
- **API endpoints** via route handlers (`src/app/api/**`)
- **Middleware** for request gating (`src/middleware.ts`)
- **Server-side domain operations** via action modules (`src/lib/actions/**`)
- **Cross-cutting libraries and integrations** (`src/lib/**`)
- **Shared contracts/types** (`src/types/**`)

---

## Directory structure and responsibilities

### `src/app/**` — Routes (UI + API)
- **UI pages/layouts** (`page.tsx`, `layout.tsx`) compose components and call server actions for data and mutations.
- **API route handlers** (`src/app/api/**/route.ts`) act as controller entry points and should delegate to action/lib modules.
- **Auth callback route** (`src/app/auth/callback/**`) completes OAuth/session exchanges and redirects.

Related entry points:
- [`src/app/api/auth/login/route.ts`](../src/app/api/auth/login/route.ts)
- [`src/app/api/auth/signup/route.ts`](../src/app/api/auth/signup/route.ts)
- [`src/app/api/auth/logout/route.ts`](../src/app/api/auth/logout/route.ts)
- [`src/app/api/auth/verify-mfa/route.ts`](../src/app/api/auth/verify-mfa/route.ts)
- [`src/app/auth/callback/route.ts`](../src/app/auth/callback/route.ts)

### `src/components/**` — UI building blocks
Reusable React components, including:
- UI primitives (`src/components/ui/**`)
- Feature components (e.g., onboarding wizard, dashboards, navigation, guards/providers)

Examples:
- [`src/components/onboarding/OnboardingWizard.tsx`](../src/components/onboarding/OnboardingWizard.tsx)
- [`src/components/dashboard/AssetDashboard.tsx`](../src/components/dashboard/AssetDashboard.tsx)

### `src/lib/actions/**` — Application services (server actions)
These modules provide high-level operations used by UI and route handlers. They orchestrate:
- authorization + validation
- database writes/reads via Supabase
- audit logging
- enrichment calls (best-effort)
- readiness scoring and other computations

Common action domains:
- Auth: `src/lib/actions/auth.ts`
- Onboarding: `src/lib/actions/onboarding.ts`
- Organizations: `src/lib/actions/organizations.ts`
- Members/invites: `src/lib/actions/members.ts`, `src/lib/actions/invites.ts`
- Projects/readiness: `src/lib/actions/projects.ts`, `src/lib/actions/readiness.ts`
- Radar discovery: `src/lib/actions/radar.ts`
- Navigation/permissions: `src/lib/actions/navigation.ts`

Notable exported examples:
- [`acceptInvite`](../src/lib/actions/invites.ts)
- [`acceptTerms`](../src/lib/actions/onboarding.ts)
- [`calculateReadinessScore`](../src/lib/actions/readiness.ts)
- [`changeProjectStatus`](../src/lib/actions/projects.ts)

### `src/lib/**` — Domain & platform libraries
Cross-cutting and reusable modules such as:
- **Supabase integration**: `src/lib/supabase/**`
- **Enrichment**: `src/lib/enrichment/**`
- **Email**: `src/lib/email/**`, templates in `src/lib/email/templates/**`
- **Auth utilities**: `src/lib/auth/**` (e.g., MFA, device checks, rate limiting)
- **Readiness scoring**: `src/lib/readiness/**`
- **Validation**: `src/lib/validation/**`
- **Analytics**: `src/lib/analytics.ts`
- **Audit**: `src/lib/audit.ts`
- **Formatting/constants/taxonomy**: `src/lib/format/**`, `src/lib/constants/**`, `src/lib/taxonomy/**`

Key integration helpers:
- [`createClient`](../src/lib/supabase/server.ts), [`createAdminClient`](../src/lib/supabase/server.ts)
- [`src/lib/supabase/middleware.ts`](../src/lib/supabase/middleware.ts)

### `src/types/**` — Shared contracts
Central place for:
- Database schema types (notably `src/types/database.ts`)
- Domain DTOs and helpers:
  - onboarding (`src/types/onboarding.ts`)
  - projects/readiness/taxonomy (`src/types/projects.ts`)
  - navigation/permissions (`src/types/navigation.ts`)

These types are used across both server and UI. Keep them stable and free of UI-specific concerns.

### `src/middleware.ts` — Request gating
Global middleware is the first pivot for most requests:
- decides whether a path is protected
- applies auth/session context checks (in conjunction with `src/lib/supabase/middleware.ts`)
- enforces routing behavior for auth flows vs protected areas

Entry point:
- [`src/middleware.ts`](../src/middleware.ts)

### `scripts/**` — Operational tooling
One-off maintenance/debug scripts (non-production):
- [`scripts/debug/debug-auth.ts`](../scripts/debug/debug-auth.ts)
- [`scripts/debug/fix-user.ts`](../scripts/debug/fix-user.ts)
- [`scripts/debug/cleanup-corrupted-user.ts`](../scripts/debug/cleanup-corrupted-user.ts)
- [`scripts/debug/test-new-user.ts`](../scripts/debug/test-new-user.ts)

---

## Architectural layers

This is the practical “layering” used throughout the repo:

1. **Presentation (UI)** — `src/app/**`
2. **Component Library** — `src/components/**`
3. **Controllers / Entry points** — `src/app/api/**`, `src/app/auth/callback/**`
4. **Middleware / Gatekeeping** — `src/middleware.ts`, `src/lib/supabase/middleware.ts`
5. **Application Services (Server Actions)** — `src/lib/actions/**`
6. **Domain & Platform Libraries** — `src/lib/**`
7. **Integration Layer** — `src/lib/supabase/**`, `src/lib/enrichment/**`, `src/lib/email/**`
8. **Contracts / Types** — `src/types/**`

**Dependency rule of thumb:** dependencies should generally point “down” this list. UI should call actions/libs; libs should not depend on UI.

---

## Request lifecycle (typical flow)

### 1) UI navigation (page load / server rendering)

1. Browser requests a page
2. `src/middleware.ts` runs:
   - determines whether route is protected or public
   - ensures session context when required
3. Next.js renders the route (`src/app/.../page.tsx`, layouts)
4. Page/components call server actions (`src/lib/actions/**`) for data/mutations
5. Actions use:
   - Supabase clients (`src/lib/supabase/**`) to access Postgres/Auth
   - domain helpers (`src/lib/**`) for enrichment, validation, audit, analytics, etc.

### 2) API request (route handler)

1. Client calls `src/app/api/**/route.ts`
2. Route handler acts as a thin controller:
   - parse/validate request
   - delegate to `src/lib/actions/**` or `src/lib/**`
   - return a `Response`
3. Actions/libs perform DB and integration work

---

## Major domains (bounded contexts)

Although deployed as one app, the codebase has clear functional boundaries:

### Authentication & MFA
- Entry points: `src/app/api/auth/**`, `src/app/auth/callback/**`, middleware
- Core logic: `src/lib/auth/**` (MFA, device checks, rate limiting)
- Key files:
  - `src/lib/auth/mfa.ts`
  - `src/lib/auth/device.ts`
  - `src/lib/auth/rate-limit.ts`

### Organizations & membership
- Core logic:
  - `src/lib/actions/organizations.ts`
  - `src/lib/actions/members.ts`
  - `src/lib/actions/invites.ts`
  - `src/lib/actions/navigation.ts`
- Contracts:
  - `src/types/navigation.ts`
  - `src/types/database.ts` (roles/permissions)

### Onboarding
- UI: `src/components/onboarding/**`
- Core logic: `src/lib/actions/onboarding.ts`
- Contracts/utilities: `src/types/onboarding.ts` (steps, validation/progress helpers)

### Projects & readiness scoring
- Core logic:
  - `src/lib/actions/projects.ts`
  - `src/lib/actions/readiness.ts`
  - scoring model: `src/lib/readiness/score.ts`
- Contracts: `src/types/projects.ts`
- **Module docs:** [`modules/projects/`](../modules/projects/README.md) — documentação detalhada do domínio

### Radar discovery (investor)
- Core logic:
  - `src/lib/actions/radar.ts`
  - `src/lib/radar/score.ts`
- UI flow:
  - `src/app/(protected)/[orgSlug]/radar/page.tsx`
  - `src/components/radar/OpportunitiesList.tsx`
- Data/contract:
  - `src/types/radar.ts`
  - `supabase/migrations/20260326110000_create_radar_cta_tables.sql` (`nda_requests`, `investor_follows`)

### Enrichment
- Core logic: `src/lib/enrichment/**`
- Design: best-effort calls to external providers, normalized result types, explicit confidence/status
- Notable types/errors:
  - `EnrichmentError` in `src/lib/enrichment/types.ts`

---

## External dependencies and integration points

### Supabase (Auth + Postgres + RPC)
- Clients:
  - [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts)
- Middleware helpers:
  - [`src/lib/supabase/middleware.ts`](../src/lib/supabase/middleware.ts)
- Expected behavior:
  - protected routes and mutations generally treat Supabase errors as hard failures
  - surface actionable error messages to UI via action results

### Data enrichment providers (best-effort)
- BrasilAPI (CNPJ): `src/lib/enrichment/brasil-api.ts`
- ViaCEP (CEP): `src/lib/enrichment/viacep.ts`
- Clearbit Logo check: `src/lib/enrichment/clearbit-logo.ts`
- CVM validation: `src/lib/enrichment/cvm-validator.ts`

**Guideline:** enrichment should not corrupt onboarding state. Prefer explicit “unknown/unverified” statuses over failing flows.

### Email delivery
- Sending logic: `src/lib/email/**`
- Templates: `src/lib/email/templates/**` (e.g., invite emails)

**Guideline:** handle partial success (e.g., invite created but email failed) and support resends.

### Analytics/telemetry
- Tracking: [`src/lib/analytics.ts`](../src/lib/analytics.ts)

**Guideline:** analytics should be non-blocking; failures must not break user flows.

---

## Key patterns used

| Pattern | Where | How it’s used |
|--------|-------|---------------|
| Layered architecture | `src/app/**` → `src/lib/actions/**` → `src/lib/**` → integrations | UI/routes remain thin; actions/libs contain reusable logic |
| Route handlers as controllers | `src/app/api/**`, `src/app/auth/callback/**` | Parse request, delegate to actions/libs, return response |
| Middleware gatekeeper | `src/middleware.ts`, `src/lib/supabase/middleware.ts` | Centralized routing/session checks for protected/auth paths |
| Service façade via actions | `src/lib/actions/*.ts` | Stable, testable entry points for domain operations |
| Integration adapters | `src/lib/supabase/**`, `src/lib/enrichment/**`, `src/lib/email/**` | Isolate external APIs behind normalized functions/types |
| Typed permissions/navigation | `src/types/navigation.ts`, `src/lib/actions/navigation.ts` | Permissions derived from typed contexts; used by guards and server-side checks |

---

## Diagrams

```mermaid
flowchart TD
  U[User Browser] -->|HTTP| M[src/middleware.ts]
  M -->|Public| UI[src/app/* (Pages/Layouts)]
  M -->|Protected| G[Guards/Providers]
  G --> UI

  UI -->|invoke| A[src/lib/actions/*]
  API[src/app/api/*] --> A

  A --> L[src/lib/* (audit, analytics, enrichment, validation)]
  A --> S[src/lib/supabase/*]
  S --> DB[(Supabase Postgres)]
  S --> AUTH[(Supabase Auth)]

  L --> EXT[External APIs<br/>BrasilAPI/ViaCEP/Clearbit/CVM]
  L --> MAIL[Email Provider]
  L --> AN[Analytics Sink]
```

---

## Practical implementation guidelines

### Where to add new code

- **New UI page/flow**: `src/app/<segment>/...` + components under `src/components/<feature>/...`
- **New domain operation (mutation or orchestrated read)**: add/extend a module in `src/lib/actions/<domain>.ts`
- **New integration/provider**: add a wrapper under `src/lib/<integration>/...` (e.g., `src/lib/enrichment/<provider>.ts`)
- **New shared types**: add to the relevant `src/types/<domain>.ts`, keep UI-free

### Recommended calling pattern (UI → actions)

Keep UI thin—call an action and render based on its result:

```ts
import { acceptInvite } from "@/lib/actions/invites";

const result = await acceptInvite({ token });

if (!result.success) {
  // render error state
}
// render success state
```

> Exact signatures vary by action; many operations return an `ActionResult`-style shape.

### Authorization: defense in depth

- Middleware gates navigation and obvious access boundaries.
- **Server actions must still enforce authorization** (middleware alone is not a security boundary).
- UI guards are helpful for UX, not for trust.

### Enrichment: treat as optional

- Use explicit statuses/confidence (see enrichment types).
- Timeouts/rate limits should degrade gracefully.
- Never let enrichment failures create inconsistent DB state.

---

## Risks and constraints

- **Authorization drift**: permissions are referenced in middleware, guards, and actions. Keep the authoritative enforcement in server-side actions (and DB policies where applicable).
- **Enrichment reliability**: third-party APIs can be unstable; rely on explicit error/status modeling (e.g., `EnrichmentError`) rather than throwing untyped errors.
- **Coupling within `src/lib`**: avoid cyclic imports; keep modules domain-focused and don’t import “up” into UI.
- **Operational scripts**: powerful scripts in `scripts/**` should be documented and guarded (environment checks, least-privilege credentials).

---

## Related documentation

- [`docs/project-overview.md`](./project-overview.md) — product context and major modules
- [`docs/data-flow.md`](./data-flow.md) — end-to-end flows (auth, onboarding, enrichment, projects)
- [`docs/codebase-map.json`](./codebase-map.json) — symbol inventory and dependency graph
