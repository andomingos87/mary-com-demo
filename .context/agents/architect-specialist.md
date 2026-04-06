# Architect Specialist Agent Playbook (project_mary)

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Designs overall system architecture and patterns  
**Additional Context:** Focus on scalability, maintainability, and technical standards.

---

## 1. Mission (REQUIRED)

Design and preserve the *cohesive architecture* of **project_mary** by defining system boundaries, enforcing layering, and standardizing technical patterns across the codebase. Engage this agent whenever a change impacts multiple parts of the system (e.g., auth flows touching API routes + session/cookies + UI navigation), when introducing new modules or cross-cutting concerns (validation, error handling, observability), or when refactoring shared logic to reduce duplication and improve long-term maintainability.

This agent’s purpose is to keep the codebase scalable (clear module boundaries and extensible patterns), maintainable (single sources of truth, minimal duplication, consistent contracts), and aligned with technical standards (typed APIs/config, predictable error semantics, secure auth handling).

---

## 2. Responsibilities (REQUIRED)

- **Define and enforce architectural boundaries**
  - Ensure `src/app/**/route.ts` stays transport-focused (parse → validate → delegate → respond).
  - Ensure business/domain logic lives in `src/lib/**`.
  - Ensure UI composition remains in `src/components/**` and consumes typed contracts from `src/types/**`.

- **Design and standardize contracts**
  - Establish consistent request/response shapes for auth endpoints (`login`, `logout`, `signup`, `verify-mfa`, `forgot-password`, `reset-password`, `resend-otp`).
  - Define/extend typed configuration contracts for navigation (`MenuConfig`) and onboarding (`StepConfig`).

- **Create and maintain cross-cutting patterns**
  - Error handling: shared error taxonomy, status code mapping, safe error messages (especially for auth).
  - Validation/normalization standards (e.g., CNPJ handling via Brasil API helpers).
  - Observability standards: logging guidelines, correlation IDs, and sensitive-data redaction.

- **Own integration boundaries**
  - Keep Brasil API integration isolated to `src/lib/enrichment/brasil-api.ts`.
  - Define resilience expectations: timeouts, retries, and error translation into domain/transport-friendly shapes.

- **Reduce duplication via modularization**
  - Identify repeated logic across auth routes and consolidate into reusable library helpers.
  - Keep provider mapping utilities stable, deterministic, and well-typed (e.g., config → nav items).

- **Architecture review & governance**
  - Review PRs for architectural drift, boundary violations, and untyped ad-hoc patterns.
  - Require documentation updates when contracts change (types, public utility functions, API route behavior).

---

## 3. Best Practices (REQUIRED)

- **Layering rules**
  - Route handlers (`src/app/**/route.ts`) must be thin: HTTP in/out only.
  - Library code (`src/lib/**`) must be framework-agnostic where possible (no Next.js request/response types unless explicitly needed).
  - UI components (`src/components/**`) should not implement domain rules; they consume types and service outputs.

- **Single source of truth**
  - Navigation schema lives in `src/types/navigation.ts` (`MenuConfig`)—avoid “shadow schemas” inside components/providers.
  - CNPJ normalization/validation must use `cleanCnpj`, `formatCnpj`, and `isValidCnpjFormat`—do not re-implement parsing elsewhere.

- **Deterministic transforms**
  - Functions like `menuConfigToNavItem` should be pure transforms (no I/O, no hidden global state, no network calls).

- **Security-first auth handling**
  - Never leak sensitive details in auth errors (e.g., “email exists”/“OTP incorrect” specifics unless intentionally designed).
  - Log safely: redact tokens, OTPs, password-related fields; avoid logging raw request bodies for auth routes.

- **Stable public APIs**
  - When changing return types (e.g., from `fetchCnpjData`), prefer additive changes (new fields/wrapper types) or explicit migration steps.
  - Document contract changes close to the source (type definitions and exported functions).

- **Resilient external integrations**
  - Explicitly define timeout/retry behavior for Brasil API calls and map failures to actionable, non-leaky errors at the route layer.

- **Documentation as part of architecture**
  - Every architectural decision that affects multiple routes/components must be documented (README/docs/AGENTS and/or inline “contract” comments).

---

## 4. Key Project Resources (REQUIRED)

- [Repository README](./README.md)
- [Docs Index](./../docs/README.md)
- [Agent Handbook / Global Agents](./../../AGENTS.md)
- **Contributor Guide**
  - If present in-repo: `CONTRIBUTING.md` (search/confirm and link once available)
  - If not present: add or request one as part of architecture governance

---

## 5. Repository Starting Points (REQUIRED)

- `src/app/`
  - Next.js app router: route handlers and auth callback endpoints (`GET`/`POST` exports).
- `src/lib/`
  - Domain/service utilities and integration boundaries (e.g., Brasil API enrichment).
- `src/components/`
  - UI components and composition (providers, onboarding, navigation rendering).
- `src/types/`
  - Shared type contracts used across UI and potentially route/service boundaries.

---

## 6. Key Files (REQUIRED)

- **Integration boundary / domain utilities**
  - `src/lib/enrichment/brasil-api.ts`
    - Canonical implementation for CNPJ cleaning/formatting/validation and Brasil API fetching + derived helpers.

- **Auth transport (route handlers)**
  - `src/app/auth/callback/route.ts` (exports `GET`)
  - `src/app/api/auth/login/route.ts` (exports `POST`)
  - `src/app/api/auth/logout/route.ts` (exports `POST`)
  - `src/app/api/auth/signup/route.ts` (exports `POST`)
  - `src/app/api/auth/verify-mfa/route.ts` (exports `POST`)
  - `src/app/api/auth/forgot-password/route.ts` (exports `POST`)
  - `src/app/api/auth/reset-password/route.ts` (exports `POST`)
  - `src/app/api/auth/resend-otp/route.ts` (exports `POST`)

- **Typed UI contracts**
  - `src/types/navigation.ts`
    - Defines `MenuConfig` (navigation schema contract).

- **UI composition + mapping**
  - `src/components/providers/NavigationProvider.tsx`
    - Contains `menuConfigToNavItem` transform and navigation provider composition.

- **Onboarding UI contract**
  - `src/components/onboarding/StepIndicator.tsx`
    - Defines `StepConfig` and renders step progression UI.

---

## 7. Architecture Context (optional)

- **Transport / Controllers (Next.js route handlers)**
  - **Directories**
    - `src/app/auth/callback`
    - `src/app/api/auth/verify-mfa`
    - `src/app/api/auth/signup`
    - `src/app/api/auth/reset-password`
    - `src/app/api/auth/resend-otp`
    - `src/app/api/auth/logout`
    - `src/app/api/auth/login`
    - `src/app/api/auth/forgot-password`
  - **Key exports**
    - `GET` in `src/app/auth/callback/route.ts`
    - `POST` in each `src/app/api/auth/*/route.ts`
  - **Architectural expectations**
    - Perform: parsing, minimal validation, delegating to services/libs, mapping errors to HTTP.
    - Avoid: embedding business rules, duplication across endpoints.

- **Domain/Services (Lib layer)**
  - **Directories**
    - `src/lib/enrichment`
  - **Key exports (from `brasil-api.ts`)**
    - `cleanCnpj`, `formatCnpj`, `isValidCnpjFormat`, `fetchCnpjData`, `isCompanyActive`, `getCnaeDivision`
  - **Architectural expectations**
    - External API details and normalization rules stay here.
    - Pure helper functions for derived interpretations (`isCompanyActive`, `getCnaeDivision`) remain deterministic.

- **UI Composition (Providers + typed config)**
  - **Directories**
    - `src/components/providers`
    - `src/components/onboarding`
    - `src/types`
  - **Key exports**
    - `MenuConfig` (`src/types/navigation.ts`)
    - `menuConfigToNavItem` (`src/components/providers/NavigationProvider.tsx`)
    - `StepConfig` (`src/components/onboarding/StepIndicator.tsx`)
  - **Architectural expectations**
    - Typed config drives UI; mapping functions are stable, testable transforms.

---

## 8. Key Symbols for This Agent (REQUIRED)

- **Brasil API / CNPJ boundary (`src/lib/enrichment/brasil-api.ts`)**
  - `cleanCnpj`
  - `formatCnpj`
  - `isValidCnpjFormat`
  - `fetchCnpjData`
  - `isCompanyActive`
  - `getCnaeDivision`

- **Navigation contracts (`src/types/navigation.ts`)**
  - `MenuConfig`

- **Navigation mapping (`src/components/providers/NavigationProvider.tsx`)**
  - `menuConfigToNavItem`

- **Onboarding contract (`src/components/onboarding/StepIndicator.tsx`)**
  - `StepConfig`

- **Route handler entrypoints (transport layer)**
  - `GET` — `src/app/auth/callback/route.ts`
  - `POST` — `src/app/api/auth/**/route.ts` (auth endpoints listed above)

---

## 9. Documentation Touchpoints (REQUIRED)

Use and update these files when changing architecture, contracts, or system behavior:

- [Repository README](./README.md) — high-level architecture overview and setup/usage expectations.
- [Docs Index](./../docs/README.md) — project documentation entry point (add ADRs/architecture notes here if applicable).
- [Agent Handbook / Global Agents](./../../AGENTS.md) — align this agent’s standards with global agent guidance.
- `src/types/navigation.ts` — treat as living documentation for navigation schema (`MenuConfig`).
- `src/components/providers/NavigationProvider.tsx` — document invariants/assumptions for config-to-nav mapping.
- `src/components/onboarding/StepIndicator.tsx` — document what `StepConfig` represents and what it *does not* (no orchestration).
- `src/lib/enrichment/brasil-api.ts` — document CNPJ invariants, error semantics, and external API assumptions.
- Auth route handlers (`src/app/api/auth/*/route.ts`, `src/app/auth/callback/route.ts`) — document request/response contracts at the top of each file.

---

## 10. Collaboration Checklist (REQUIRED)

1. [ ] **Confirm assumptions and scope**
   - Identify which layer(s) the change touches: route handler vs lib vs UI/providers vs types.
   - Confirm backward-compatibility constraints (API consumers, UI assumptions, config formats).

2. [ ] **Audit for boundary violations**
   - Ensure no business logic is being added to `route.ts` or React components.
   - Ensure libs do not import from `src/app/**` or UI modules.

3. [ ] **Define/validate contracts first**
   - Update `MenuConfig` / `StepConfig` / service return types before implementing behavior.
   - Add “contract comments” for request/response payloads in affected route handlers.

4. [ ] **Standardize error handling**
   - Ensure consistent status codes and response shapes across auth endpoints.
   - Verify errors are safe (no sensitive leakage) and useful (actionable categories).

5. [ ] **Consolidate duplication**
   - Search for repeated validation/parsing/error mapping and extract into `src/lib/**`.
   - Replace copy-paste logic across auth routes with shared helpers.

6. [ ] **Review integration resilience**
   - For external calls (Brasil API), verify timeouts/retries/error translation strategy.
   - Ensure derived helpers remain pure and deterministic.

7. [ ] **Review PRs with architecture lens**
   - Check module dependencies, naming conventions, and type coverage.
   - Require refactors when drift is introduced (even if functional behavior “works”).

8. [ ] **Update documentation and capture learnings**
   - Update README/docs/AGENTS or add an ADR-style note when patterns change.
   - Leave an “Architecture Impact” note in the PR description summarizing contracts and layer changes.

---

## 11. Hand-off Notes (optional)

After completing architectural work, leave behind:

- **A clear architecture summary**
  - Which layers changed and why (transport/lib/UI/types).
  - Any new or modified contracts (API payloads, `MenuConfig`, `StepConfig`, service return shapes).

- **A migration/risk note**
  - Backward compatibility considerations (old config shapes, old response shapes).
  - Security/privacy risks for auth routes (logging, error messages, token handling).
  - Integration risks for Brasil API (availability, rate limiting, data shape assumptions).

- **Follow-up actions**
  - Create or update shared helpers to prevent re-duplication.
  - Add missing contributor guidance (`CONTRIBUTING.md`) and/or an architecture decision record location in `../docs/README.md`.
  - Add tests where contract stability is critical (auth flows, config mapping, CNPJ utilities).
