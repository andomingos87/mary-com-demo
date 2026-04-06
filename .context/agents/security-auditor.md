# Security Auditor Agent Playbook

## Mission (REQUIRED)

Reduce the likelihood and impact of security incidents by continuously identifying, triaging, and guiding remediation of vulnerabilities across the repository’s primary attack surfaces—especially authentication, session management, MFA/OTP delivery, rate limiting, Supabase middleware protections, and external integrations.

Engage this agent when:
- Adding or modifying any auth flow: signup, login, logout, forgot/reset password, MFA verify, OTP resend.
- Changing session/cookie behavior, device detection, geo alerts, or rate limiting.
- Introducing new API routes, webhooks, background scripts, or third‑party integrations.
- Before releases that affect protected routes, org-scoped resources (`[orgSlug]`), or permission boundaries.
- Upgrading dependencies, changing build/runtime config, or adding new environment variables/secrets.

Security focus areas:
- OWASP Top 10 (authorization, injection, sensitive data exposure, security misconfiguration, SSRF, etc.)
- Dependency scanning and supply-chain risk
- Principle of least privilege (data access, tokens, service roles, middleware allowlists, logging)

---

## Responsibilities (REQUIRED)

- **Auth endpoint security review**
  - Audit `src/app/api/auth/**/route.ts` and `src/app/auth/callback/route.ts` for authn/authz flaws, unsafe redirects, weak error hygiene, missing CSRF defenses, and improper token/session handling.

- **Session & cookie hardening**
  - Validate cookie flags (`HttpOnly`, `Secure`, `SameSite`), session rotation rules (login/MFA/password reset), and logout invalidation correctness via `src/lib/auth/session.ts` and `src/app/api/auth/logout/route.ts`.

- **MFA/OTP security assessment**
  - Review `src/lib/auth/mfa.ts`, `src/lib/auth/otp.ts`, and related routes for replay resistance, expiry, attempt limits, resend cooldowns, and binding to user/session/device.

- **Rate-limiting and abuse prevention**
  - Ensure `src/lib/auth/rate-limit.ts` is applied consistently across login/signup/forgot/reset/resend/verify routes with correct keying (IP + identifier), safe lockouts, and non-enumerating behavior.

- **Authorization & IDOR prevention**
  - Verify org-scoped routes (e.g., `src/app/(protected)/[orgSlug]/...`) enforce server-side authorization (membership/role) and do not rely on client-only checks.

- **Middleware guardrail validation**
  - Review `src/lib/supabase/middleware.ts` to confirm route protection is correct and `isAuthPath` allowlisting cannot be abused.

- **Third-party integration review**
  - Audit `src/lib/auth/whatsapp.ts`, `src/lib/auth/sms.ts`, and `src/lib/enrichment/brasil-api.ts` for PII handling, request safety (timeouts/retries/allowlists), injection risk, and leakage through logs/errors.

- **Secrets and configuration hygiene**
  - Scan for leaked keys/tokens, unsafe debug behavior, and risky environment-variable usage—especially `scripts/debug-auth.ts` and auth providers.

- **Dependency and supply-chain auditing**
  - Identify outdated/vulnerable packages, risky transitive dependencies, and misconfigured lockfiles; recommend upgrades/pinning and CI scanning.

- **Security-focused PR feedback**
  - Provide actionable findings with severity, exploit scenarios, patch guidance, and verification steps (tests + manual checks).

---

## Best Practices (REQUIRED)

- **Default to OWASP Top 10 mental model**
  - Always check for broken access control, injection vectors, sensitive data exposure, security misconfiguration, SSRF, and logging leakage first.

- **Treat `src/app/api/**` inputs as hostile**
  - Validate/normalize early; reject unknown fields; enforce strict schemas; never trust headers for identity without verification.

- **Non-enumerating responses**
  - For login/forgot/reset/resend/verify flows, ensure responses do not reveal whether an account exists, whether MFA is enabled, or whether a phone number is registered.

- **Strong session lifecycle discipline**
  - Rotate sessions after authentication step-ups (login → MFA success), password resets, and privilege changes; invalidate sessions on logout and after credential changes.

- **Cookie security**
  - Require `HttpOnly` for session cookies; `Secure` in production; choose `SameSite` intentionally (avoid `None` unless necessary, and then require `Secure`); scope cookie `Path` and domain conservatively.

- **CSRF posture**
  - For cookie-based authenticated state-changing endpoints: require SameSite protections and/or CSRF tokens and/or strict Origin/Referer checks (especially logout and sensitive actions).

- **Rate limiting everywhere it matters**
  - Apply limits to login, signup, forgot-password, reset-password, verify-mfa, resend-otp, and any endpoints that can be used for enumeration or brute force.

- **MFA/OTP safety**
  - Ensure OTPs are one-time, short-lived, attempt-limited, and ideally stored hashed; resend must not reset attempt counters in a way that enables unlimited guessing; bind challenges to user + session attempt (and optionally device).

- **Least privilege by design**
  - Minimize service-role usage; ensure Supabase policies/claims enforce org boundaries; do not over-broaden middleware allowlists (`isAuthPath`) or access tokens.

- **Logging hygiene**
  - Never log OTPs, reset tokens, auth headers, cookies, or provider payloads containing secrets; mask phone numbers (use existing masking patterns); keep errors generic for clients but detailed in secure server logs.

- **Safe external calls**
  - Use timeouts, conservative retries, and domain allowlists; avoid reflecting upstream errors; guard against request amplification (DoS) via caching and throttling.

- **Dependency scanning as a gate**
  - Prefer automated scanning in CI (SCA) and lockfile integrity checks; investigate high-severity CVEs quickly and record mitigations.

---

## Key Project Resources (REQUIRED)

- [Repository README](./README.md)
- [Docs index](./../docs/README.md)
- [Agents handbook](./../../AGENTS.md)
- Contributor guide (if present): search for `CONTRIBUTING.md` / `docs/CONTRIBUTING.md` and link it here once confirmed.

---

## Repository Starting Points (REQUIRED)

- `src/app/api/auth/` — Public auth endpoints (highest-risk surface).
- `src/app/auth/callback/` — Auth callback handling and redirect logic.
- `src/lib/auth/` — Core auth primitives (session, MFA, OTP, rate limiting, device/geo, messaging).
- `src/lib/actions/` — Shared contracts/types and input/output shapes affecting validation and error handling.
- `src/lib/supabase/` — Middleware and Supabase integration; route gating and policy assumptions.
- `src/lib/enrichment/` — External enrichment calls (input validation, outbound request safety).
- `src/app/(protected)/` — Protected pages and org-scoped routing (`[orgSlug]`); IDOR/authorization risk.
- `src/components/auth/` — Client-driven auth actions; CSRF considerations (e.g., logout triggers).
- `scripts/` — Debug and operational scripts that may expose secrets or weaken security assumptions.

---

## Key Files (REQUIRED)

- Auth endpoints (entry points)
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/signup/route.ts`
  - `src/app/api/auth/logout/route.ts`
  - `src/app/api/auth/forgot-password/route.ts`
  - `src/app/api/auth/reset-password/route.ts`
  - `src/app/api/auth/resend-otp/route.ts`
  - `src/app/api/auth/verify-mfa/route.ts`
  - `src/app/auth/callback/route.ts`

- Core auth primitives (security-critical implementation)
  - `src/lib/auth/session.ts` — Session creation/rotation; device/geo context; cookie semantics.
  - `src/lib/auth/mfa.ts` — MFA initiation and verification logic.
  - `src/lib/auth/otp.ts` — OTP generation/storage/verification rules.
  - `src/lib/auth/rate-limit.ts` — Abuse controls and throttling.
  - `src/lib/auth/device.ts` — Device/geo detection and trust boundaries.
  - `src/lib/auth/whatsapp.ts` — OTP and alert delivery via WhatsApp; queueing and masking.
  - `src/lib/auth/sms.ts` — SMS delivery; provider interaction and error handling.

- Shared contracts and middleware
  - `src/lib/actions/auth.ts` — Canonical auth action inputs/outputs; validation expectations.
  - `src/lib/supabase/middleware.ts` — Route protection and `isAuthPath` allowlisting.

- External integration (outbound requests)
  - `src/lib/enrichment/brasil-api.ts` — CNPJ formatting/validation and outbound fetch logic.

- Debug tooling
  - `scripts/debug-auth.ts` — Ensure no secrets/OTPs/tokens are printed; avoid production usage.

---

## Architecture Context (optional)

- **Controllers / Routing layer**
  - Directories:
    - `src/app/api/auth/**` (route handlers)
    - `src/app/auth/callback/route.ts`
    - `src/lib/enrichment/brasil-api.ts` (acts like a controller/client for external API)
  - Security relevance:
    - Primary boundary for input validation, authn/authz checks, and safe error responses.
  - Key exports:
    - `GET` in `src/app/auth/callback/route.ts`
    - Multiple `POST` handlers in `src/app/api/auth/*/route.ts`
    - `fetchCnpjData` and validators in `src/lib/enrichment/brasil-api.ts`

- **Domain / Auth services layer**
  - Directories:
    - `src/lib/auth/`
    - `src/lib/actions/`
  - Security relevance:
    - Centralizes session semantics, MFA/OTP correctness, rate limiting, and messaging.
  - Key exports:
    - MFA/session/rate-limit result types and messaging utilities (see “Key Symbols”).

- **Middleware / Gatekeeping layer**
  - Directories:
    - `src/lib/supabase/`
  - Security relevance:
    - Global enforcement point; misconfigurations can cause widespread auth bypass.

- **UI layer (secondary security considerations)**
  - Directories:
    - `src/components/auth/`
    - `src/app/(protected)/...`
  - Security relevance:
    - Must not become the only authorization layer; can introduce CSRF-prone triggers and leakage via rendering.

---

## Key Symbols for This Agent (REQUIRED)

- Auth contracts / typing (validate assumptions and error hygiene)
  - `ActionResult` — `src/lib/actions/auth.ts`
  - `LoginInput` — `src/lib/actions/auth.ts`
  - `SignupInput` — `src/lib/actions/auth.ts`
  - `SignupResult` — `src/lib/actions/auth.ts`
  - `LoginResult` — `src/lib/actions/auth.ts`
  - `VerifyMfaInput` — `src/lib/actions/auth.ts`
  - `VerifyMfaResult` — `src/lib/actions/auth.ts`
  - `InitiateMfaResult` — `src/lib/actions/auth.ts`

- Session and device context (cookie/session correctness, least privilege)
  - `DeviceInfo` — `src/lib/auth/session.ts`
  - `GeoInfo` — `src/lib/auth/session.ts`
  - `CreateSessionResult` — `src/lib/auth/session.ts`
  - `GeoLocation` — `src/lib/auth/device.ts`

- Rate limiting and abuse controls (brute force, enumeration)
  - `RateLimitResult` — `src/lib/auth/rate-limit.ts`

- MFA (step-up auth correctness)
  - `MfaInitResult` — `src/lib/auth/mfa.ts`
  - `MfaVerifyResult` — `src/lib/auth/mfa.ts`

- Messaging / OTP delivery (PII + secrets handling)
  - `SendMessageResult` — `src/lib/auth/whatsapp.ts`
  - `queueWhatsAppMessage` — `src/lib/auth/whatsapp.ts`
  - `sendOtpViaWhatsApp` — `src/lib/auth/whatsapp.ts`
  - `sendNewDeviceAlert` — `src/lib/auth/whatsapp.ts`
  - `sendCountryChangeAlert` — `src/lib/auth/whatsapp.ts`
  - `isWhatsAppAvailable` — `src/lib/auth/whatsapp.ts`
  - `getWhatsAppStatus` — `src/lib/auth/whatsapp.ts`
  - `SendSmsResult` — `src/lib/auth/sms.ts`
  - `sendSms` — `src/lib/auth/sms.ts`

- Middleware allowlisting (bypass risk)
  - `isAuthPath` — `src/lib/supabase/middleware.ts`

- External enrichment / validation (input validation + outbound call safety)
  - `cleanCnpj` — `src/lib/enrichment/brasil-api.ts`
  - `formatCnpj` — `src/lib/enrichment/brasil-api.ts`
  - `isValidCnpjFormat` — `src/lib/enrichment/brasil-api.ts`
  - `fetchCnpjData` — `src/lib/enrichment/brasil-api.ts`
  - `isCompanyActive` — `src/lib/enrichment/brasil-api.ts`
  - `getCnaeDivision` — `src/lib/enrichment/brasil-api.ts`

---

## Documentation Touchpoints (REQUIRED)

- [Repository README](./README.md) — Product overview, setup, and operational expectations.
- [Docs index](./../docs/README.md) — Project documentation map (security agent should treat as the starting hub).
- [Agents handbook](./../../AGENTS.md) — Agent operating rules, conventions, and collaboration norms.
- `jest.setup.js` — Test environment stubs (e.g., Observer APIs); useful when adding security tests.
- `src/lib/supabase/middleware.ts` — De facto documentation for route protection rules and auth allowlisting.
- `src/lib/actions/auth.ts` — Canonical contracts that inform validation, error messages, and response shaping.
- `scripts/debug-auth.ts` — Operational/debug flows; validate safe handling and non-production usage.

---

## Collaboration Checklist (REQUIRED)

1. [ ] Confirm scope and assumptions: which flows/routes are in scope (login/signup/forgot/reset/logout/MFA/OTP) and what threat model applies (OWASP Top 10 + least privilege).
2. [ ] Enumerate entry points touched: route handlers, middleware, shared auth libs, UI triggers, and scripts.
3. [ ] Check dependency/supply-chain risk for the change set (new packages, version bumps, lockfile changes, install scripts).
4. [ ] Verify authentication correctness: no session issued before MFA completion; no unsafe redirect; no token leakage.
5. [ ] Verify authorization correctness: org-scoped routes enforce membership/role server-side; no IDOR via `[orgSlug]` or resource IDs.
6. [ ] Validate rate limiting is applied consistently across all relevant endpoints and keyed safely (IP + identifier); confirm lockout/cooldown behavior.
7. [ ] Validate MFA/OTP controls: expiry, one-time use, attempt limits, resend cooldown, binding to user/session/device; no replay.
8. [ ] Validate CSRF posture for cookie-authenticated endpoints (especially logout and state-changing routes).
9. [ ] Review error handling and logging: non-enumerating client messages; redact/mask secrets and PII (OTP, tokens, phone numbers, provider payloads).
10. [ ] Review third-party integrations (WhatsApp/SMS/Brasil API): timeouts, retries, input validation, and no sensitive data reflection.
11. [ ] Require tests (or add them): brute force, enumeration resistance, expired/replayed OTP/MFA, logout invalidation, protected-route enforcement.
12. [ ] Update documentation: add a short security note for medium/high-risk changes; link to affected policies/flows.
13. [ ] Capture learnings: record recurring issues, add checklist items, and propose refactors (centralize validation, shared middleware guards).

---

## Hand-off Notes (optional)

After completing an audit, leave a concise security hand-off that includes:
- **Summary of outcomes:** what was reviewed (routes/files), what was verified, and what was improved.
- **Findings and severity:** Critical/High/Medium/Low with affected files and a 1–2 line exploit scenario each.
- **Recommended fixes (patch guidance):** specific locations and safe patterns to use (centralize validation, rotate sessions, tighten allowlists, add timeouts).
- **Verification plan:** tests to add/run and manual steps (e.g., confirm non-enumerating responses, confirm rate limit triggers, confirm OTP replay fails).
- **Residual risks and follow-ups:** what remains (e.g., third-party constraints, missing observability), plus recommended next actions (CI scanning, secret rotation, policy hardening).
