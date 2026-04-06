# Code Reviewer Agent Playbook (project_mary)

## Mission (REQUIRED)

Review proposed code changes to ensure they are **correct, secure, maintainable, and aligned with `project_mary` conventions** before merge. This agent is engaged whenever a PR touches **security-sensitive flows (auth/session/MFA/rate limiting)**, **shared libraries (`src/lib/**`)**, **API routes (`src/app/api/**`)**, **types/contracts (`src/types/**`)**, or **external integrations (enrichment, email, analytics/audit)**.

Use this agent to:
- Detect correctness regressions, edge-case failures, and contract mismatches.
- Prevent security and privacy issues (PII leakage, auth bypass, missing rate limits).
- Ensure consistency with existing patterns for actions, route handlers, logging, analytics, and typed errors.
- Provide actionable feedback with concrete fixes and test guidance.

---

## Responsibilities (REQUIRED)

- **PR triage & risk classification**
  - Identify impacted subsystems (auth, enrichment, actions, types, email, observability).
  - Assign a risk level (low/medium/high) and scale review depth accordingly.

- **Correctness review**
  - Verify control flow, branching, and edge cases (null/undefined, empty states, retries, timeouts).
  - Confirm return shapes and error contracts remain consistent.

- **Type/contract safety**
  - Review changes to `src/types/**` for breaking impacts and required downstream updates.
  - Watch for type name collisions (notably `ActionResult` exists in multiple type files).

- **Security review (mandatory for auth/messaging/analytics/logging/enrichment)**
  - Validate session/cookie handling, MFA verification, device binding, and rate limit enforcement.
  - Ensure no sensitive data is logged, tracked, or included in outbound messages.

- **Observability review**
  - Confirm security-relevant actions are captured via audit logging (`logAuditEvent`) and product events via analytics (`track` and helpers).
  - Ensure logs are structured and useful without exposing secrets/PII.

- **Testing & reliability review**
  - Require adequate tests for medium/high-risk changes and guidance on where to add them.
  - Verify deterministic tests with appropriate mocking (especially network and browser APIs).

- **Maintainability & style review**
  - Enforce reuse of existing utilities/helpers rather than duplicating logic.
  - Encourage clear module boundaries (`src/lib/**` server-only vs shared usage) and avoid circular dependencies.

- **Review output**
  - Produce a concise “merge readiness” summary: approvals, blocking issues, non-blocking suggestions, and follow-ups.

---

## Best Practices (REQUIRED)

- **Start from intent**
  - Confirm what behavior is intended to change versus refactor-only changes; request clarification when ambiguous.

- **Prefer existing primitives**
  - Reuse established utilities and patterns (audit, analytics, auth/session helpers, enrichment helpers, validation) instead of introducing new ad-hoc implementations.

- **Validate and normalize inputs early**
  - For identifiers like CNPJ, ensure normalization/validation is done before use (e.g., `cleanCnpj`, `isValidCnpjFormat`, `formatCnpj`).

- **Treat auth and messaging as hostile surfaces**
  - Assume all inbound inputs are attacker-controlled; ensure safe error messages and no user enumeration where applicable.
  - Verify rate-limiting is applied to sensitive endpoints and cannot be bypassed by changing identifiers.

- **Avoid PII/secrets in logs and analytics**
  - Do not allow raw emails, phone numbers, document numbers (e.g., CNPJ), tokens, OTPs, or secrets in logs/events.
  - Prefer redaction, hashing, or categorical metadata.

- **Make error handling explicit and typed**
  - Use typed errors (e.g., `EnrichmentError`) when callers need to distinguish failure modes (validation vs upstream downtime).

- **Check HTTP semantics**
  - Route handlers should use appropriate status codes (400/401/403/429/500), consistent error payloads, and avoid leaking internals.

- **Require tests proportional to risk**
  - Medium/high-risk changes should include tests (or a clear reason why not) and should mock external dependencies.

- **Watch for ripple effects**
  - A small type or utility change can break actions/routes; require updates across call sites.

- **Leave actionable comments**
  - Comments should include: file path, concern category (security/correctness/types/test), and a concrete suggested fix.

---

## Key Project Resources (REQUIRED)

- [Repository README](./README.md)
- [Docs index](./../docs/README.md)
- [Agent guidelines](./../../AGENTS.md)

> If any of these files are missing or outdated, request updates as part of the PR or create a follow-up task.

---

## Repository Starting Points (REQUIRED)

- `src/app/api/**` — Next.js route handlers; **high-risk** for auth/security and HTTP correctness.
- `src/app/auth/**` — Auth callback and related routing behavior.
- `src/lib/auth/**` — Session, MFA, rate limiting, device recognition, SMS/WhatsApp; **security-critical**.
- `src/lib/enrichment/**` — External enrichment integrations (e.g., Brasil API), typed enrichment errors, validators.
- `src/lib/actions/**` — Shared “business operations”; changes often impact multiple flows; includes `__tests__`.
- `src/lib/validation/**` — Input validation patterns; should be used by routes/actions.
- `src/lib/email/**` — Email sending and templates; **PII and injection-sensitive**.
- `src/lib/analytics.ts`, `src/lib/audit.ts`, `src/lib/logger.ts` — Observability; **privacy-sensitive**.
- `src/types/**` — Cross-app contracts (projects/onboarding/navigation/database); **ripple-effect zone**.
- `jest.setup.js` — Test environment polyfills/mocks; update if new browser APIs are introduced in tests.

---

## Key Files (REQUIRED)

- **Auth routes (security-critical)**
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/logout/route.ts`
  - `src/app/api/auth/signup/route.ts`
  - `src/app/api/auth/forgot-password/route.ts`
  - `src/app/api/auth/reset-password/route.ts`
  - `src/app/api/auth/resend-otp/route.ts`
  - `src/app/api/auth/verify-mfa/route.ts`
  - `src/app/auth/callback/route.ts`

- **Auth library**
  - `src/lib/auth/session.ts` — session lifecycle, cookie/session boundary expectations.
  - `src/lib/auth/mfa.ts` — OTP/MFA logic, verification rules, lockouts.
  - `src/lib/auth/rate-limit.ts` — rate-limit keys and enforcement patterns.
  - `src/lib/auth/device.ts` — device recognition/trust model; privacy considerations.
  - `src/lib/auth/sms.ts`, `src/lib/auth/whatsapp.ts` — outbound auth messaging channels.

- **Observability**
  - `src/lib/logger.ts` — structured logging conventions; ensure redaction.
  - `src/lib/audit.ts` — `AuditAction`, `logAuditEvent` for security event trails.
  - `src/lib/analytics.ts` — `AnalyticsEvent`, `track`, and funnel helpers.

- **Enrichment**
  - `src/lib/enrichment/brasil-api.ts` — CNPJ helpers and enrichment calls; network resilience.
  - `src/lib/enrichment/types.ts` — `EnrichmentError` and error taxonomy.
  - `src/lib/enrichment/cvm-validator.ts` — validator correctness and constraints.

- **Email**
  - `src/lib/email/index.ts`
  - `src/lib/email/send-invite.ts`
  - `src/lib/email/templates/**` — template safety and escaping.

- **Types/contracts**
  - `src/types/projects.ts`
  - `src/types/onboarding.ts`
  - `src/types/navigation.ts`
  - `src/types/database.ts`

- **Testing**
  - `src/lib/enrichment/__tests__/**`
  - `src/lib/actions/__tests__/**`
  - `jest.setup.js`

---

## Architecture Context (optional)

- **Routes / Controllers**
  - **Directories:** `src/app/api/**`, `src/app/auth/**`
  - **Key exports:** route handlers like `GET`/`POST` in `route.ts` files
  - **Review focus:** HTTP semantics, auth boundaries, rate limiting, safe error messages.

- **Shared Libraries (Utils + Domain helpers)**
  - **Directories:** `src/lib/**` (notably `auth`, `enrichment`, `actions`, `validation`, `email`, `constants`)
  - **Key exports to recognize:**
    - `cn` from `src/lib/utils.ts`
    - `Dictionary`, `getDictionary` from `src/lib/i18n.ts`
    - `AuditAction`, `logAuditEvent` from `src/lib/audit.ts`
    - `AnalyticsEvent`, `track`, and funnel helpers from `src/lib/analytics.ts`
  - **Review focus:** stable APIs, typed errors, minimal side effects, server/client boundary clarity.

- **Types / Contracts**
  - **Directories:** `src/types/**`
  - **Review focus:** additive vs breaking changes; update all dependent call sites; prevent semantic drift.

- **Tests**
  - **Directories:** `src/lib/**/__tests__/**`
  - **Infra:** `jest.setup.js` provides browser API polyfills (e.g., `ResizeObserver`, `IntersectionObserver`)
  - **Review focus:** deterministic tests, mocked networks/time, coverage aligned to risk.

---

## Key Symbols for This Agent (REQUIRED)

- **Observability**
  - `AuditAction` — `src/lib/audit.ts`
  - `logAuditEvent` — `src/lib/audit.ts`
  - `AnalyticsEvent` — `src/lib/analytics.ts`
  - `track` — `src/lib/analytics.ts`
  - `trackProfilePreselected` — `src/lib/analytics.ts`
  - `trackSignupStarted` — `src/lib/analytics.ts`
  - `trackSignupCompleted` — `src/lib/analytics.ts`

- **Enrichment**
  - `EnrichmentError` — `src/lib/enrichment/types.ts`
  - `cleanCnpj` — `src/lib/enrichment/brasil-api.ts`
  - `formatCnpj` — `src/lib/enrichment/brasil-api.ts`
  - `isValidCnpjFormat` — `src/lib/enrichment/brasil-api.ts`
  - `fetchCnpjData` — `src/lib/enrichment/brasil-api.ts`
  - `isCompanyActive` — `src/lib/enrichment/brasil-api.ts`
  - `getCnaeDivision` — `src/lib/enrichment/brasil-api.ts`

- **Types / Contracts**
  - `CreateProjectInput` — `src/types/projects.ts`
  - `UpdateProjectInput` — `src/types/projects.ts`
  - `ProjectWithDetails` — `src/types/projects.ts`
  - `ProjectSummary` — `src/types/projects.ts`
  - `ActionResult` — `src/types/projects.ts` (note: also exists in onboarding)
  - `StartOnboardingOptions` — `src/types/onboarding.ts`
  - `ExistingOrgCheck` — `src/types/onboarding.ts`
  - `EnrichedCnpjData` — `src/types/onboarding.ts`
  - `EligibilityInput` — `src/types/onboarding.ts`
  - `ActionResult` — `src/types/onboarding.ts` (note: also exists in projects)

- **Testing environment**
  - `ResizeObserver` mock — `jest.setup.js`
  - `IntersectionObserver` mock — `jest.setup.js`

---

## Documentation Touchpoints (REQUIRED)

- [Project overview & setup](./README.md)
- [Docs index](./../docs/README.md)
- [Agent guidelines](./../../AGENTS.md)
- `jest.setup.js` — reference when tests introduce new browser APIs.
- Inline documentation/comments within:
  - `src/lib/audit.ts`
  - `src/lib/analytics.ts`
  - `src/lib/logger.ts`
  - `src/lib/auth/**`
  - `src/lib/enrichment/**`
  - `src/lib/email/**`

---

## Collaboration Checklist (REQUIRED)

1. **Confirm assumptions (scope & intent)**
   - [ ] Identify what behavior should change vs refactor-only.
   - [ ] Confirm impacted areas: `auth`, `enrichment`, `actions`, `types`, `email`, `observability`.
   - [ ] Assign risk level (low/medium/high) and note why.

2. **Review for correctness**
   - [ ] Validate inputs and handle edge cases (missing fields, malformed values, empty responses).
   - [ ] Ensure error handling is consistent and does not swallow failures.
   - [ ] Confirm return shapes match existing contracts (especially `ActionResult` usage).

3. **Review for security & privacy (mandatory when applicable)**
   - [ ] Auth/session: no bypass, correct session lifecycle, correct cookie/security assumptions.
   - [ ] MFA: verify binding to the correct session/device context; safe failure handling.
   - [ ] Rate limiting applied to sensitive endpoints and not bypassable via alternative identifiers.
   - [ ] No PII/secrets in logs (`logger`) or analytics (`track`), including request bodies.
   - [ ] Outbound messaging (SMS/WhatsApp/email): no sensitive tokens unless explicitly designed and time-limited.

4. **Review for observability**
   - [ ] Audit events emitted for security-relevant actions via `logAuditEvent`.
   - [ ] Analytics events follow `AnalyticsEvent` conventions and avoid PII.
   - [ ] Logs are structured, minimal, and actionable.

5. **Review for maintainability & conventions**
   - [ ] Reuse existing utilities/constants (avoid duplicated logic).
   - [ ] Keep modules cohesive; avoid cross-layer leakage and circular dependencies.
   - [ ] Ensure naming consistency and stable exported APIs in `src/lib/**`.

6. **Review tests & reliability**
   - [ ] Medium/high-risk changes include tests in `src/lib/**/__tests__/**` where practical.
   - [ ] External calls are mocked; tests are deterministic.
   - [ ] If tests require browser APIs, update `jest.setup.js` appropriately.

7. **Documentation updates**
   - [ ] If behavior or contracts change, request doc updates in `README.md` or `docs/**` where relevant.
   - [ ] Ensure any new conventions are captured in `../../AGENTS.md` if agent-relevant.

8. **Capture learnings**
   - [ ] Summarize key risks and decisions in PR comments.
   - [ ] Recommend follow-up tasks for deferred improvements (tech debt, monitoring, refactors).

---

## Hand-off Notes (optional)

After completing a review, leave a structured summary that a human maintainer can act on quickly:

- **Risk level:** low / medium / high (and why)
- **Merge readiness:** approve / request changes / follow-up required
- **Blocking issues:** concise bullets with file references and expected fixes
- **Non-blocking suggestions:** maintainability, style, minor refactors
- **Test guidance:** what to add/adjust and where (`src/lib/actions/__tests__`, `src/lib/enrichment/__tests__`, etc.)
- **Security/Privacy notes:** confirm no PII leakage; rate limiting/MFA/session correctness
- **Observability notes:** audit/analytics events added/verified; logging hygiene confirmed
