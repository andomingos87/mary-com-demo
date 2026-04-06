# Backend Specialist Agent Playbook

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Designs and implements server-side architecture  
**Additional Context:** Focus on APIs, microservices, database optimization, and authentication.

---

## Mission (REQUIRED)

Own and improve the server-side behavior of the product: authentication flows, authorization enforcement, API route handlers, and backend-facing domain utilities (notably BrasilAPI enrichment). Engage this agent whenever a change impacts:

- **API endpoints** and request/response contracts (`src/app/api/**/route.ts`)
- **Authentication lifecycle** (login/signup/logout/MFA/OTP/password reset/callback)
- **Authorization and route gating** (Supabase middleware + route access validation)
- **Database correctness and type safety** (Supabase-generated types and enum usage)
- **External integrations** and normalization stability (BrasilAPI CNPJ fetch + transforms)

Primary outcomes: secure and predictable backend behavior, stable contracts, consistent error handling, and type-safe persistence.

---

## Responsibilities (REQUIRED)

- Implement, modify, and deprecate **API route handlers** under `src/app/api/**/route.ts`.
- Maintain **auth endpoints**:
  - login, logout, signup
  - forgot/reset password flows
  - OTP resend
  - MFA verification
  - auth callback completion
- Enforce and evolve **authorization rules**:
  - route classification and gating in `src/lib/supabase/middleware.ts`
  - permission/business rules via `validateRouteAccess` in `src/lib/actions/navigation.ts`
  - permission typings in `src/types/navigation.ts`
- Build and maintain **backend domain utilities** in `src/lib/**` (keep route handlers thin).
- Own the **BrasilAPI enrichment integration**:
  - input validation and formatting (`cleanCnpj`, `isValidCnpjFormat`, `formatCnpj`)
  - data fetching (`fetchCnpjData`)
  - output normalization stability (`normalizeCompanyData`)
  - business rules (`isCompanyActive`, `getCnaeDivision`)
- Ensure **database operations remain type-safe** using `src/types/database.ts`:
  - `Database`, `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`
  - exported domain enums (e.g., `MemberRole`, `VerificationStatus`)
- Define and enforce **API error/response conventions** (status codes, stable error shapes, no provider leakage).
- Review backend-related PRs for **security**, **correctness**, and **consistency** (auth, permissions, secrets handling).

---

## Best Practices (REQUIRED)

- **Keep route handlers thin**: parse/validate input → call `src/lib/**` domain logic → return a response.
- **Validate before side effects**:
  - validate JSON body shape and required fields before calling Supabase or external APIs
  - for CNPJ, always `cleanCnpj` then `isValidCnpjFormat` before fetching
- **Use type-safe DB contracts** from `src/types/database.ts`:
  - reads: `Tables<"table">`
  - inserts: `TablesInsert<"table">`
  - updates: `TablesUpdate<"table">`
  - avoid ad-hoc row interfaces and stringly-typed enums
- **Centralize external calls**:
  - keep BrasilAPI calls inside `fetchCnpjData` (do not duplicate fetch logic elsewhere)
  - keep normalization in `normalizeCompanyData` to prevent schema drift
- **Do not leak sensitive info**:
  - never return raw Supabase/provider error objects
  - avoid user enumeration in OTP/password reset flows
  - treat tokens/OTPs as secrets (never log them)
- **Use explicit HTTP status codes** and stable error messaging:
  - `400` invalid input, `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict, `500` unexpected
- **Authorization is layered**:
  - middleware is the *first gate* (`src/lib/supabase/middleware.ts`)
  - business permission checks are the *second gate* (`validateRouteAccess`)
- **Additive changes when possible**:
  - especially for normalized enrichment outputs consumed downstream
- **Prefer shared modules** in `src/lib/**` over duplicating logic across `route.ts` files.
- **Document backend behavior** when changed:
  - endpoints, payloads, expected responses, and permission rules

---

## Key Project Resources (REQUIRED)

- [Project README](./README.md)
- [Docs index](./../docs/README.md)
- [Agent handbook / AGENTS](./../../AGENTS.md)

*(If any of the above paths do not exist in the repo, create/repair the corresponding index file and link it from `README.md`.)*

---

## Repository Starting Points (REQUIRED)

- `src/app/api/` — Next.js Route Handlers (server endpoints). Auth endpoints live under `src/app/api/auth/*/route.ts`.
- `src/app/auth/callback/` — Auth callback completion route (`route.ts`) for provider or magic-link flows.
- `src/lib/supabase/` — Supabase-related middleware and helpers. Key file: `middleware.ts`.
- `src/lib/actions/` — Server actions/shared backend logic. Key file: `navigation.ts` for access validation.
- `src/lib/enrichment/` — External data enrichment modules (BrasilAPI). Key file: `brasil-api.ts`.
- `src/types/` — Shared TypeScript types:
  - `database.ts` (Supabase DB typing source of truth)
  - `navigation.ts` (route permission typing)
- `src/components/onboarding/` — Backend-adjacent flow; often couples to persistence and enrichment outputs.

---

## Key Files (REQUIRED)

### API/Auth route handlers (Next.js)
- `src/app/api/auth/login/route.ts` — Login endpoint; contains `getProjectRef` and `POST`.
- `src/app/api/auth/logout/route.ts` — Logout endpoint (session termination).
- `src/app/api/auth/signup/route.ts` — Signup endpoint.
- `src/app/api/auth/forgot-password/route.ts` — Starts password reset flow.
- `src/app/api/auth/reset-password/route.ts` — Completes password reset.
- `src/app/api/auth/resend-otp/route.ts` — Reissues OTP.
- `src/app/api/auth/verify-mfa/route.ts` — MFA verification endpoint.
- `src/app/auth/callback/route.ts` — Auth callback completion (`GET`).

### Authorization & routing rules
- `src/lib/supabase/middleware.ts` — Route classification (`getRouteType`) and edge gating.
- `src/lib/actions/navigation.ts` — Business permission logic (`validateRouteAccess`).
- `src/types/navigation.ts` — Route permission/result types (`RoutePermission`, `RouteValidationResult`).

### External integration: BrasilAPI enrichment
- `src/lib/enrichment/brasil-api.ts` — CNPJ utilities, fetch, normalization, and business helpers.
- `src/lib/enrichment/types.ts` — BrasilAPI response typings.

### Database typing
- `src/types/database.ts` — Canonical DB types and exported enums:
  - `Database`, `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`
  - `OrganizationProfile`, `MemberRole`, `VerificationStatus`, `AdvisorSide`

---

## Architecture Context (optional)

- **Controllers / Route Handlers**
  - **Directories:** `src/app/api/auth/**`, `src/app/auth/callback/`
  - **Key exports:** multiple `GET`/`POST` route handler exports (Next.js Route Handlers)
  - **Guideline:** IO-only; delegate business logic to `src/lib/**`.

- **Authorization Layer**
  - **Directories:** `src/lib/supabase/`, `src/lib/actions/`, `src/types/`
  - **Key exports:**
    - `getRouteType` (`src/lib/supabase/middleware.ts`)
    - `validateRouteAccess` (`src/lib/actions/navigation.ts`)
    - `RoutePermission`, `RouteValidationResult` (`src/types/navigation.ts`)
  - **Guideline:** middleware for coarse gating; actions/types for fine-grained permissions.

- **Integrations / Enrichment**
  - **Directories:** `src/lib/enrichment/`
  - **Key exports:**
    - `cleanCnpj`, `formatCnpj`, `isValidCnpjFormat`, `fetchCnpjData`, `isCompanyActive`, `getCnaeDivision`
    - types: `BrasilApiCnpjResponse`, etc.
  - **Guideline:** single integration module; stable normalized output.

- **Persistence / Schema Typing**
  - **Directories:** `src/types/`
  - **Key exports:** `Database`, `Tables*`, `Enums`, domain enums
  - **Guideline:** treat as the authoritative schema contract for backend code.

---

## Key Symbols for This Agent (REQUIRED)

### Auth / Route Handlers
- [`GET`](./src/app/auth/callback/route.ts) — Auth callback completion handler.
- [`POST`](./src/app/api/auth/login/route.ts) — Login handler.
- [`getProjectRef`](./src/app/api/auth/login/route.ts) — Environment/project reference helper used by login flow.
- [`POST`](./src/app/api/auth/logout/route.ts) — Logout handler.
- [`POST`](./src/app/api/auth/signup/route.ts) — Signup handler.
- [`POST`](./src/app/api/auth/forgot-password/route.ts) — Forgot password handler.
- [`POST`](./src/app/api/auth/reset-password/route.ts) — Reset password handler.
- [`POST`](./src/app/api/auth/resend-otp/route.ts) — Resend OTP handler.
- [`POST`](./src/app/api/auth/verify-mfa/route.ts) — Verify MFA handler.

### Authorization
- [`getRouteType`](./src/lib/supabase/middleware.ts) — Route classification used by middleware gating.
- [`validateRouteAccess`](./src/lib/actions/navigation.ts) — Permission/business rule validator.
- [`RoutePermission`](./src/types/navigation.ts) — Permission model for routes.
- [`RouteValidationResult`](./src/types/navigation.ts) — Standard permission validation result shape.

### BrasilAPI enrichment
- [`cleanCnpj`](./src/lib/enrichment/brasil-api.ts)
- [`formatCnpj`](./src/lib/enrichment/brasil-api.ts)
- [`isValidCnpjFormat`](./src/lib/enrichment/brasil-api.ts)
- [`fetchCnpjData`](./src/lib/enrichment/brasil-api.ts)
- [`normalizeCompanyData`](./src/lib/enrichment/brasil-api.ts)
- [`isCompanyActive`](./src/lib/enrichment/brasil-api.ts)
- [`getCnaeDivision`](./src/lib/enrichment/brasil-api.ts)
- [`BrasilApiCnpjResponse`](./src/lib/enrichment/types.ts)
- [`BrasilApiCnae`](./src/lib/enrichment/types.ts)
- [`BrasilApiShareholder`](./src/lib/enrichment/types.ts)

### Database typing
- [`Database`](./src/types/database.ts)
- [`Tables`](./src/types/database.ts)
- [`TablesInsert`](./src/types/database.ts)
- [`TablesUpdate`](./src/types/database.ts)
- [`Enums`](./src/types/database.ts)
- [`OrganizationProfile`](./src/types/database.ts)
- [`MemberRole`](./src/types/database.ts)
- [`VerificationStatus`](./src/types/database.ts)
- [`AdvisorSide`](./src/types/database.ts)

---

## Documentation Touchpoints (REQUIRED)

Update or consult these when backend behavior changes:

- [Project README](./README.md) — setup, environment variables, run instructions, high-level architecture notes.
- [Docs index](./../docs/README.md) — central documentation navigation (add new backend docs here).
- [Agent handbook / AGENTS](./../../AGENTS.md) — agent roles, boundaries, and handoffs.
- (Recommended if not present) `docs/backend-api.md` — authoritative list of endpoints, auth requirements, payloads, and error shapes.
- (Recommended if not present) `docs/auth.md` — end-to-end auth flow diagrams: login → callback → MFA/OTP → session → logout.
- (Recommended if not present) `docs/authorization.md` — how `middleware.ts` and `validateRouteAccess` interact.

---

## Collaboration Checklist (REQUIRED)

1. [ ] Confirm the change scope: endpoint contract, auth flow, permissions, DB types, or integration behavior.
2. [ ] Identify impacted entry points:
   - [ ] `src/app/api/**/route.ts` endpoints
   - [ ] `src/app/auth/callback/route.ts`
   - [ ] `src/lib/supabase/middleware.ts`
   - [ ] `src/lib/actions/navigation.ts`
3. [ ] Validate assumptions against existing behavior:
   - [ ] how routes are classified (`getRouteType`)
   - [ ] how access is validated (`validateRouteAccess` + `RouteValidationResult`)
4. [ ] Implement with repo conventions:
   - [ ] keep handlers thin; move logic into `src/lib/**`
   - [ ] validate inputs before side effects (Supabase/remote fetch)
   - [ ] use `src/types/database.ts` for all persistence typing
5. [ ] Security review:
   - [ ] no provider error leakage
   - [ ] no secrets/tokens logged
   - [ ] avoid user enumeration for OTP/reset flows
   - [ ] ensure correct `401` vs `403` usage
6. [ ] Regression-check auth end-to-end:
   - [ ] login → callback → access protected routes → logout
   - [ ] password reset initiation and completion (if touched)
   - [ ] MFA/OTP flows (if touched)
7. [ ] Update documentation touchpoints:
   - [ ] `README.md` and/or `docs/**` for new endpoints or changed behavior
   - [ ] `AGENTS.md` if ownership boundaries or workflows changed
8. [ ] PR hygiene:
   - [ ] include QA notes (routes touched, expected status codes, edge cases)
   - [ ] include migration/rollout notes if response shapes or permissions changed
9. [ ] Capture learnings:
   - [ ] add follow-up tasks for missing tests, rate limiting, or cleanup discovered during work

---

## Hand-off Notes (optional)

After completing backend work, leave a concise hand-off comment (PR description or `docs/` note) covering:

- **What changed:** routes added/modified, auth behavior changes, middleware/permission updates, enrichment normalization changes.
- **Contracts:** request/response examples and status codes for any updated endpoint.
- **Risk areas:** redirect/callback assumptions (especially around environment/project reference), backward compatibility of normalized outputs, or any known edge cases.
- **Follow-ups:** missing tests, rate-limit/abuse controls for OTP/reset endpoints, documentation gaps, or schema/type regeneration steps if DB types changed.

---

## Cross-References

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
