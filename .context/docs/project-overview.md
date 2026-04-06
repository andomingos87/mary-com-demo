# Project Overview (Project Mary)

Project Mary is a full‑stack web application that streamlines onboarding, authentication (including MFA), and organization/project management—so teams can move from “new user” to “active workspace” quickly and safely. It’s designed for product and operations teams who need guided onboarding flows, role-based access, and reliable data enrichment/validation to reduce manual back-and-forth.

For a deeper, machine-generated inventory of files, symbols, exports, and dependency graphs, see [`docs/codebase-map.json`](./codebase-map.json).

---

## Quick Facts

- **Repository root**: `C:\Users\asdom\OneDrive\Área de Trabalho\projects\project_mary`
- **Primary language**: TypeScript / TSX
- **Web framework**: Next.js (App Router)
- **Primary app entry**: [`src/app/`](../src/app)
- **Middleware entry**: [`src/middleware.ts`](../src/middleware.ts)
- **Business logic (actions/use-cases)**: [`src/lib/actions/`](../src/lib/actions)
- **Shared types (DB + domain)**: [`src/types/`](../src/types)

---

## What the App Does (High Level)

Project Mary focuses on a few core product capabilities:

- **Authentication & account security**
  - Login, signup, logout, password reset
  - **MFA verification** flows and device/rate-limit protections

- **Onboarding**
  - Guided step-by-step onboarding wizard
  - Progress tracking and step validation
  - Eligibility/terms acceptance and review states (e.g., pending review)

- **Organizations & memberships**
  - Organization creation and slug availability checks
  - Member roles/permissions and navigation contexts
  - Invites (send/accept/cancel) and membership management

- **Projects**
  - Creating, updating, listing, and status transitions
  - Domain metadata structures (taxonomy, readiness checklists, field metadata)

- **Radar discovery (investor)**
  - Opportunity listing based on active thesis + score ordering
  - Pre-NDA teaser preview and CTA-driven relationship start (follow/NDA request)

- **Data enrichment & validation**
  - Integrations for company/address enrichment (e.g., CNPJ/CEP-related utilities)
  - Confidence scoring across enrichment sources

---

## Key Entry Points

### Next.js application (App Router)
- **Routes, layouts, and page-level UI composition**  
  [`src/app/`](../src/app)

Notable route groups/patterns:
- Public pages: `src/app/login`, `src/app/signup`, `src/app/forgot-password`, etc.
- Protected areas: `src/app/(protected)/...` (role/org-scoped content)

### Middleware
- **Cross-cutting routing/session protection**
  - [`src/middleware.ts`](../src/middleware.ts)

Middleware typically enforces:
- Access control for protected routes
- Session presence and routing rules
- Context/setup used by navigation and protected route groups

### Server-side API routes (auth-focused)
- [`src/app/api/auth/login/`](../src/app/api/auth/login)
- [`src/app/api/auth/logout/`](../src/app/api/auth/logout)
- [`src/app/api/auth/signup/`](../src/app/api/auth/signup)
- [`src/app/api/auth/verify-mfa/`](../src/app/api/auth/verify-mfa)
- [`src/app/api/auth/forgot-password/`](../src/app/api/auth/forgot-password)
- [`src/app/api/auth/reset-password/`](../src/app/api/auth/reset-password)
- [`src/app/api/auth/resend-otp/`](../src/app/api/auth/resend-otp)

### Operational/debug scripts
Node scripts for maintenance and troubleshooting:
- [`scripts/debug/debug-auth.ts`](../scripts/debug/debug-auth.ts)
- [`scripts/debug/fix-user.ts`](../scripts/debug/fix-user.ts)
- [`scripts/debug/cleanup-corrupted-user.ts`](../scripts/debug/cleanup-corrupted-user.ts)
- [`scripts/debug/test-new-user.ts`](../scripts/debug/test-new-user.ts)

These are useful when diagnosing auth/session problems or cleaning up inconsistent user records in development/testing environments.

---

## Code Organization & Architecture

This repository follows a layered structure that keeps UI, routing, and business logic separate.

### `src/app/` — App Router routes and composition
- Route segments, layouts, and page components
- Protected route groups under `(protected)`
- API route handlers under `api/`

### `src/components/` — Reusable UI components (feature + primitives)
Common sub-areas:
- `src/components/ui/` — UI primitives (buttons, badges, etc.)
- `src/components/onboarding/` — onboarding wizard components and hooks
- `src/components/dashboard/` — dashboard modules and views
- `src/components/navigation/` — menus, navigation shells, and related logic
- `src/components/auth/` — authentication UI components

Example high-usage component:
- `src/components/onboarding/OnboardingWizard.tsx` (imported by multiple routes/components)

### `src/lib/` — Utilities, integrations, and business logic
Key sub-areas:
- `src/lib/actions/` — **use-case style functions** (server-side operations)
  - Auth, onboarding, organizations, projects, invites, readiness scoring, etc.
- `src/lib/supabase/` — Supabase clients and middleware helpers
- `src/lib/auth/` — auth helpers (MFA, device checks, rate limiting)
- `src/lib/enrichment/` — enrichment logic and external lookups/validators
- `src/lib/validation/` — validation utilities (e.g., email checks)
- `src/lib/email/` — email sending and templates
- `src/lib/analytics.ts` — tracking utilities
- `src/lib/format/` — formatting helpers (e.g., currency)
- `src/lib/taxonomy/` — taxonomy tree building and search utilities
- `src/lib/readiness/` — readiness scoring helpers
- `src/lib/radar/` — radar score helpers

### `src/types/` — Shared domain + database typing
- Domain-specific types (projects, onboarding, navigation)
- Database types (generated/maintained typing for Supabase schema)

Examples:
- `src/types/database.ts` — DB schema types and helper functions (roles, onboarding state)
- `src/types/projects.ts` — project inputs, readiness structures, taxonomy types
- `src/types/onboarding.ts` — onboarding steps, validation map, progress calculations
- `src/types/navigation.ts` — navigation context, permission computation structures

---

## “Actions” Layer (Business Operations)

The `src/lib/actions/` directory is the primary “application layer” API used by UI and route handlers. Actions typically:
- Validate inputs
- Call Supabase/database operations
- Apply business rules (permissions, status transitions)
- Orchestrate enrichment or readiness scoring
- Return typed results (commonly an `ActionResult` pattern)

A few notable exports (sample):
- Invites: [`acceptInvite`](../src/lib/actions/invites.ts#L230)
- Onboarding: [`acceptTerms`](../src/lib/actions/onboarding.ts#L1302)
- Readiness: [`calculateReadinessScore`](../src/lib/actions/readiness.ts#L55)
- Projects: [`changeProjectStatus`](../src/lib/actions/projects.ts#L508)
- Organizations: [`checkSlugAvailability`](../src/lib/actions/organizations.ts#L369)

Tip: When adding a new business operation, prefer putting it in `src/lib/actions/` and calling it from route handlers/components rather than embedding direct DB logic in UI.

---

## Supabase Integration

Supabase is used for data access and (likely) authentication/session management, with server-side helpers exposed in:

- [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts)
  - `createClient` — standard server client
  - `createAdminClient` — elevated privileges (admin/service role) for server operations

Middleware and route protection support also exist under:
- `src/lib/supabase/middleware.ts` (helpers like `isProtectedPath`, `isAuthPath`)

---

## Authentication & MFA

Auth functionality is split across:
- **API routes** under `src/app/api/auth/*`
- **Auth utilities** under `src/lib/auth/*` (MFA, device logic, rate limiting)
- **UI** under `src/app/*` (login/signup/verify MFA) and `src/components/auth/*`

Key areas:
- MFA verification endpoint: [`src/app/api/auth/verify-mfa/`](../src/app/api/auth/verify-mfa)
- MFA helpers: `src/lib/auth/mfa.ts`
- Device/country change checks: `src/lib/auth/device.ts`
- Rate limiting: `src/lib/auth/rate-limit.ts`

---

## Onboarding Flow (Where to Look)

If you want to understand the end-to-end onboarding flow:

1. **Start in the UI**
   - Route: `src/app/onboarding/*` (including dynamic steps under `src/app/onboarding/[step]`)
   - Components: `src/components/onboarding/*`
   - Central wizard: `src/components/onboarding/OnboardingWizard.tsx`

2. **Follow the business logic**
   - Actions: `src/lib/actions/onboarding.ts`

3. **Check types & step logic**
   - Types and progress helpers: `src/types/onboarding.ts`
     - Includes step navigation (`getNextStep`, `getPreviousStep`) and progress calculation (`calculateProgress`)

---

## Projects, Taxonomy, and Readiness

Project-related domain logic spans types + scoring + actions:

- Project domain types: [`src/types/projects.ts`](../src/types/projects.ts)
  - `CreateProjectInput`, `UpdateProjectInput`, readiness structures, taxonomy types, codename validation
- Taxonomy utilities: `src/lib/taxonomy/maics.ts`
  - Tree building, search, formatting paths, level parsing
- Readiness scoring: `src/lib/readiness/score.ts`
  - Field metadata application and scoring utilities
- Project operations: `src/lib/actions/projects.ts`

> **Documentação detalhada:** Para entidades, fluxos, API reference e data model do módulo de Projetos, consulte [`modules/projects/`](../modules/projects/README.md).

---

## UI Component Conventions

- **UI primitives** live in `src/components/ui/`
  - Examples: `badge.tsx`, `button.tsx`
- **Feature groups** live in `src/components/<feature>/`
  - onboarding, dashboard, navigation, auth, projects

Testing patterns exist under `__tests__` directories, and the Jest environment is configured with shims like `ResizeObserver` and `IntersectionObserver` in:
- [`jest.setup.js`](../jest.setup.js)

---

## Analytics, Email, and Enrichment

- **Analytics**: [`src/lib/analytics.ts`](../src/lib/analytics.ts)
  - Central `track()` function plus event-specific helpers (e.g., onboarding completed)
- **Email**:
  - Sending: `src/lib/email/*`
  - Templates: `src/lib/email/templates/*` (e.g., invite email template)
- **Enrichment**: `src/lib/enrichment/*`
  - Lookups/validators, confidence scoring, and error types (e.g., `EnrichmentError`)

---

## Getting Started Checklist (Developer)

1. **Install prerequisites**
   - Node.js (LTS recommended)
   - Environment variables for Supabase/auth/email/enrichment integrations

2. **Install dependencies**
   - `npm install` (or your team’s package manager)

3. **Configure environment**
   - Create/update `.env.local` with Supabase keys and callback URLs used by auth routes

4. **Run locally**
   - `npm run dev`
   - Validate critical flows: signup → onboarding wizard → dashboard

5. **Run tests (if configured)**
   - Use the test script from `package.json`
   - Jest setup is present (`jest.setup.js`)

6. **Learn the architecture**
   - Read [`docs/architecture.md`](./architecture.md)
   - Use [`docs/codebase-map.json`](./codebase-map.json) to locate relevant modules quickly

---

## Where to Add New Code (Rules of Thumb)

- **New UI element used across multiple screens** → `src/components/ui/`
- **Feature UI** (onboarding/dashboard/projects/navigation/auth) → `src/components/<feature>/`
- **New route/page** → `src/app/<route>/`
- **New business operation / use-case** → `src/lib/actions/<domain>.ts`
- **New integration or helper** (validation/enrichment/email/format) → `src/lib/<area>/`
- **New shared types** → `src/types/<domain>.ts` (and DB-related typing in `src/types/database.ts`)

---

## Related Documentation

- [`docs/architecture.md`](./architecture.md)
- [`docs/development-workflow.md`](./development-workflow.md)
- [`docs/tooling.md`](./tooling.md)
- [`docs/codebase-map.json`](./codebase-map.json)
