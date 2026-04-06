# Documentation Home (`docs/README.md`)

Welcome to the **living documentation** for **project_mary**. The `docs/` folder is intended to be the **first stop for developers** joining or actively working on the codebase: high-level orientation first, then deeper dives into architecture, workflows, testing, and domain rules.

---

## What this repository is (at a glance)

**project_mary** is a **Next.js (App Router) + TypeScript** application with:

- **Routes/UI** under `src/app/**` and reusable **components** under `src/components/**`
- A large set of **server-side actions and utilities** under `src/lib/**`
- **Supabase** for authentication and data access (`src/lib/supabase/**`, `supabase/**`)
- Dedicated modules for **onboarding**, **navigation/permissions**, **enrichment**, **email**, and **readiness scoring**
- **Jest** for unit tests (`jest.config.js`, `jest.setup.js`) and colocated tests in `__tests__` folders

---

## Start here (recommended reading order)

1. **Project Overview** → what the app does and the main product flows  
   - [`docs/project-overview.md`](./project-overview.md)

2. **Architecture Notes** → boundaries, modules, and how “lib/actions/components/app” fit together  
   - [`docs/architecture.md`](./architecture.md)

3. **Development Workflow** → how to run locally, branching, scripts, and conventions  
   - [`docs/development-workflow.md`](./development-workflow.md)

4. **Testing Strategy** → how tests are structured and what’s covered  
   - [`docs/testing-strategy.md`](./testing-strategy.md)

5. **Glossary & Domain Concepts** → roles, onboarding steps, organizations/projects, readiness, etc.  
   - [`docs/glossary.md`](./glossary.md)

6. **Data Flow & Integrations** → Supabase, enrichment providers, email templates, etc.  
   - [`docs/data-flow.md`](./data-flow.md)

7. **Security & Compliance Notes** → auth model (including MFA), rate limiting, audit logging  
   - [`docs/security.md`](./security.md)

8. **Tooling & Productivity Guide** → scripts, helpers, and developer ergonomics  
   - [`docs/tooling.md`](./tooling.md)

---

## Documentation index

### Core guides

- [Project Overview](./project-overview.md)
- [Architecture Notes](./architecture.md)
- [Development Workflow](./development-workflow.md)
- [Testing Strategy](./testing-strategy.md)
- [Glossary & Domain Concepts](./glossary.md)
- [Data Flow & Integrations](./data-flow.md)
- [Security & Compliance Notes](./security.md)
- [Tooling & Productivity Guide](./tooling.md)

---

## Repository map (what lives where)

### Application & UI

- `src/app/`  
  Next.js App Router routes, including:
  - auth routes (`src/app/login`, `src/app/signup`, `src/app/forgot-password`, etc.)
  - onboarding routes (`src/app/onboarding`, `src/app/onboarding/[step]`, `pending-review`)
  - protected org-scoped routes (`src/app/(protected)/[orgSlug]/**`)
- `src/components/`  
  UI building blocks and domain components, including:
  - `src/components/onboarding/**` (wizard, hooks, UI for onboarding)
  - `src/components/dashboard/**`
  - `src/components/projects/**`
  - `src/components/navigation/**`
  - `src/components/ui/**` (shared UI primitives, some with tests)

### Business logic, services, and shared utilities

- `src/lib/`  
  “Backend-ish” code used by routes/actions/components:
  - `src/lib/actions/**` — server actions (organizations, invites, auth, onboarding, projects, readiness, etc.)
  - `src/lib/auth/**` — MFA, device checks, rate limiting, auth helpers
  - `src/lib/enrichment/**` — data enrichment + external lookups, confidence scoring, etc.
  - `src/lib/email/**` — email senders + templates
  - `src/lib/readiness/**` — readiness scoring algorithms/metadata
  - `src/lib/supabase/**` — Supabase server client/middleware helpers
  - `src/lib/taxonomy/**` — taxonomy tree/search + mapping (e.g., MAICS/CNAE utilities)
  - `src/lib/format/**`, `src/lib/constants/**`, `src/lib/validation/**`

### Types and schema

- `src/types/**`  
  Central type definitions (projects, onboarding, navigation, database types). Notable:
  - `src/types/database.ts` — Supabase DB typing
  - `src/types/onboarding.ts`, `src/types/projects.ts`, `src/types/navigation.ts`

### Infrastructure & configuration

- `supabase/` — migrations, config, and Supabase-related assets
- `next.config.mjs`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`
- `jest.config.js`, `jest.setup.js`
- `scripts/` — maintenance/debug scripts (e.g., user/auth cleanup and checks)

---

## Architectural conventions (quick notes)

This repo typically follows a practical separation:

- **Components** (`src/components/**`)  
  Presentational + orchestration logic for UI.
- **Controllers / Route handlers** (`src/app/api/**`, select route modules)  
  Entry points for HTTP and auth callbacks.
- **Utils / Services** (`src/lib/**`)  
  Cross-cutting logic: Supabase access, enrichment, readiness scoring, validation, emailing, auditing.

Common “where do I find X?” lookups:

- Onboarding UI → `src/components/onboarding/**` + `src/app/onboarding/**`
- Invite acceptance logic → `src/lib/actions/invites.ts` (e.g., `acceptInvite`)
- Permissions/navigation computation → `src/types/navigation.ts` + `src/lib/actions/navigation.ts`
- MFA → `src/lib/auth/mfa.ts` + auth API routes in `src/app/api/auth/**`

---

## How to use these docs effectively

- Use **Project Overview** to understand product intent and primary workflows.
- Use **Architecture Notes** before making structural changes (new modules, new integrations, new flows).
- Use **Testing Strategy** before adding tests—match existing patterns and tooling.
- Use **Security** notes before touching auth, onboarding verification, invites, auditing, or anything involving PII.

---

## Contributing to docs

This documentation is intended to be **kept current as the code evolves**.

When you add or change a feature, update the relevant guide(s):

- New API/integration → `data-flow.md`
- New auth behavior / permissions / rate limiting → `security.md`
- New domain entity or workflow → `glossary.md` + `project-overview.md`
- New scripts or tooling → `tooling.md`
- New architectural boundaries or refactors → `architecture.md`

Guidelines:

- Keep docs **actionable** (include file paths and where to make changes)
- Keep docs **specific** (name key modules/functions when they’re stable)
- Keep ephemeral details out of core guides (prefer linking to code or stable directories)

---

## Related files (entry points you’ll commonly open)

- Next.js middleware: `src/middleware.ts`
- Supabase server client: `src/lib/supabase/server.ts`
- Navigation/permissions: `src/types/navigation.ts`, `src/lib/actions/navigation.ts`
- Onboarding engine: `src/components/onboarding/OnboardingWizard.tsx`, `src/lib/actions/onboarding.ts`
- Enrichment core: `src/lib/enrichment/index.ts`, `src/lib/enrichment/types.ts`
- Email templates/senders: `src/lib/email/templates/**`, `src/lib/email/send-invite.ts`
- Readiness scoring: `src/lib/readiness/score.ts`, `src/lib/actions/readiness.ts`

---

## Document map (for maintainers)

| Guide | File | Focus |
| --- | --- | --- |
| Project Overview | `docs/project-overview.md` | Product intent, main flows, “what is Mary” |
| Architecture Notes | `docs/architecture.md` | Module boundaries, dependency direction, key subsystems |
| Development Workflow | `docs/development-workflow.md` | Local dev, scripts, conventions, CI expectations |
| Testing Strategy | `docs/testing-strategy.md` | Jest setup, unit test patterns, what to test where |
| Glossary & Domain Concepts | `docs/glossary.md` | Roles, entities, onboarding steps, readiness concepts |
| Data Flow & Integrations | `docs/data-flow.md` | Supabase + enrichment/email/integrations and data movement |
| Security & Compliance Notes | `docs/security.md` | Auth/MFA, auditing, rate limits, sensitive data handling |
| Tooling & Productivity Guide | `docs/tooling.md` | Scripts, debugging utilities, common maintenance tasks |
