# Security

This document describes the security guardrails for Project Mary’s application and supporting services. It is intended to help developers implement features safely, review changes effectively, and operate the system in a compliant manner.

For broader system context, see: [architecture.md](./architecture.md)

---

## Security principles

- **Least privilege by default**: Code should access only the minimum data and permissions required for a user’s current organization and role.
- **Defense in depth**: Enforce access control at multiple layers (UI guards, middleware routing checks, server actions, and database policies).
- **Secure-by-default endpoints**: All API routes and server actions must validate authentication, authorization, and input before performing side effects.
- **Auditability**: Sensitive actions should produce an audit trail suitable for incident investigation and compliance review.
- **Data minimization**: Collect and retain only what is necessary for product operation and legal obligations.

---

## Threat model (high-level)

Common risks and expected controls in this codebase:

- **Unauthorized access to protected routes**  
  Controls: route protection in middleware, session validation, role checks, organization scoping.

- **Privilege escalation (horizontal/vertical)**  
  Controls: server-side permission evaluation (do not rely on UI), organization membership verification, role permission mapping.

- **Account takeover**  
  Controls: MFA flow support, suspicious device/country change checks, rate limiting, robust password reset.

- **Token/session leakage**  
  Controls: HTTP-only cookies (where applicable), short-lived tokens, avoid logging tokens, secure headers.

- **Sensitive data exposure (PII/company identifiers)**  
  Controls: encryption in transit and at rest, restricted logging, data classification, least-privilege access to admin keys.

- **Abuse and automation** (credential stuffing, OTP brute force)  
  Controls: rate limiting on auth endpoints, lockouts/backoff strategies (where implemented), alerting/monitoring.

---

## Secure development requirements

### Input validation

Validate request bodies and query params at API boundaries.

- Prefer shared validators in `src/lib/validation/**` where available.
- Treat any external data sources (enrichment providers, webhooks, OAuth callbacks) as untrusted input.

### Secrets handling

- Never commit `.env` files, API keys, private URLs, or service role keys.
- Use environment variables and a secret manager in deployed environments.
- Do not paste secrets into tickets, PR descriptions, or chat logs.

### Logging rules

Do **not** log:

- passwords
- OTPs / MFA codes
- access tokens / refresh tokens
- password reset tokens
- invite acceptance tokens
- full email contents (especially links containing tokens)
- full PII fields unless strictly required and explicitly approved

If you need traceability, use audit events (see [Audit trail](#audit-trail)) and record only: actor, action, target identifiers, timestamp, and outcome.

### Dependency hygiene

- Keep dependencies updated and respond quickly to security advisories.
- Run automated checks in CI when available (audit tooling, SAST, dependency scanning).

### Security-sensitive areas

Changes in the following areas should be treated as security-critical and require careful review:

- `src/lib/auth/**`
- `src/middleware.ts`
- `src/app/api/auth/**`
- any use of `createAdminClient()` (service role)

---

## Security enforcement layers (where to look in the repo)

Project Mary relies on multiple layers of security controls. When implementing or reviewing a feature, verify each applicable layer:

### 1) Routing and session gating

Primary entry points:

- `src/middleware.ts`
- `src/lib/supabase/middleware.ts` (protected/auth path detection)
- UI guards: `src/components/guards/**` (UX-only; not sufficient by itself)

**Rule:** UI guards are not an authorization boundary. The server must enforce access.

### 2) Authentication flows (API)

Auth endpoints live under:

- `src/app/api/auth/**`  
  Includes: login/logout/signup, OTP resend, password reset, MFA verification.
- `src/app/auth/callback/**`  
  OAuth/session callback handling (if configured).

**Rule:** Treat any callback/session exchange code as high risk.

### 3) Authorization and organization scoping

Key modules:

- Navigation and permission evaluation:
  - `src/types/navigation.ts` (permission structures)
  - `src/lib/actions/navigation.ts` (checks, e.g. `checkAdminAccess`)
- Membership & roles:
  - `src/types/database.ts` (e.g. `MemberRole`, `RolePermissions`)

**Rule:** All reads/writes must be scoped to the active organization and validated server-side.

### 4) Audit trail

- `src/lib/audit.ts` (audit action enum + logging helpers)

**Rule:** Privileged operations and sensitive state transitions must emit audit events.

### 5) Abuse protections

- Rate limiting: `src/lib/auth/rate-limit.ts` (e.g. `checkRateLimit`)
- Device/country change checks: `src/lib/auth/device.ts` (e.g. `checkCountryChange`)

**Rule:** Auth endpoints must apply abuse controls where relevant (login, OTP resend, MFA verify, forgot/reset password).

### 6) Data access and elevated credentials

Supabase clients:

- `src/lib/supabase/server.ts`
  - `createClient()` (end-user scoped)
  - `createAdminClient()` (service-role scoped; restricted usage)

**Rule:** Avoid `createAdminClient()` unless strictly necessary. If used, justify it and ensure authorization + audit logging exists.

---

## Authentication & Authorization

Project Mary implements authentication and authorization primarily through Supabase-backed sessions and application-level permission checks, with explicit support for multi-factor verification flows.

### Identity provider(s)

- **Supabase Auth** is the primary identity system.
- Server-side clients are created via:
  - `src/lib/supabase/server.ts` → `createClient()` (user-scoped)
  - `src/lib/supabase/server.ts` → `createAdminClient()` (service-role; minimize use)

### Session and token strategy

- Server-side session access is performed via the Supabase server client.
- Session persistence is typically managed by Supabase using cookies in a Next.js environment.

**Rules**
- Do not expose access/refresh tokens to the browser unnecessarily.
- Do not store tokens in `localStorage` unless explicitly required and reviewed; prefer HTTP-only cookies.
- Protected routes must verify session server-side (middleware + server actions).

### MFA (multi-factor authentication)

- MFA verification endpoints exist under `src/app/api/auth/verify-mfa/**`.
- MFA utilities are located in `src/lib/auth/mfa.ts`.

**Developer expectations**
- MFA checks must occur server-side.
- OTPs or verification codes must never be logged.
- Apply rate limiting and replay protection to MFA verify and resend endpoints (where applicable).

### Authorization model (roles, organizations, permissions)

The application is multi-tenant and organization-scoped.

Common protected route patterns:

- `src/app/(protected)/[orgSlug]/**`
- `src/app/dashboard/organizations/**` (organization selection/membership workflows)

Permission evaluation and route gating:

- `src/types/navigation.ts` (route permission structures)
- `src/lib/actions/navigation.ts` (permission checks, e.g. `checkAdminAccess`)
- Role types: `src/types/database.ts` (`MemberRole`, `RolePermissions`)

**Policy requirements**
- All data reads/writes must be scoped to the active organization and validated server-side.
- Hiding UI elements is not sufficient for authorization.
- Elevated operations must:
  1. verify role/permission server-side,
  2. record an audit event,
  3. avoid using the admin client unless strictly necessary.

### Protected route enforcement

Middleware (`src/middleware.ts`) should:

- identify protected vs auth routes,
- ensure a valid session exists for protected routes,
- redirect unauthenticated users to login and prevent authenticated users from hitting auth-only screens (when applicable).

When adding new protected routes, ensure they follow the existing conventions (folder placement under `(protected)` and/or middleware path matching).

---

## Secrets & Sensitive Data

### Data classification (recommended)

Use these classifications when designing features and logging:

- **Public**: marketing copy, public taxonomy labels.
- **Internal**: feature flags, non-sensitive configuration.
- **Confidential**: organization profile details, onboarding data, project metadata, invites.
- **Restricted**: authentication artifacts (password reset tokens, OTPs), service-role keys, encryption keys, audit logs with sensitive context, regulated identifiers.

When in doubt:
- treat user/org data as **Confidential**
- treat auth artifacts and credentials as **Restricted**

### Secret sources and storage

- Environment variables are the expected mechanism for config/secrets (local `.env` for dev; managed secret store in production).
- Supabase keys:
  - Public anon key may be present in client-safe config but should still be handled carefully.
  - **Service role key must never be exposed to the client bundle.**
  - `createAdminClient()` indicates elevated credentials; usage must be minimized and reviewed.

**Policy requirements**
- Do not commit secrets.
- Do not share secrets in PRs, tickets, or logs.
- In production, use a managed secret manager and inject via runtime environment.

### Rotation and lifecycle

Minimum expectations:

- **Service credentials (service role, API keys)**: rotate at least every 90 days; immediately upon suspected exposure; and upon team offboarding where applicable.
- **Email provider credentials** (see `src/lib/email/**`): rotate at least every 90 days.
- **Third-party enrichment provider keys** (see `src/lib/enrichment/**`): rotate at least every 90 days or per provider requirements.

Rotation must include updating deployed environment variables and confirming old credentials are revoked.

### Encryption practices

- **In transit**: enforce HTTPS in all non-local environments.
- **At rest**: rely on managed database/storage encryption (e.g., Supabase/Postgres). If application-level encryption is added, document:
  - algorithm,
  - key management,
  - rotation,
  - migration strategy.
- **Hashing**: never store plaintext passwords; rely on Supabase Auth. Hash stored tokens where feasible.

### Sensitive flows to treat as “high risk”

These areas should receive extra scrutiny in design and code review:

- Auth endpoints: `src/app/api/auth/**`
- MFA verification/resend
- Forgot/reset password flows
- Invite acceptance and membership changes:
  - `src/lib/actions/invites.ts`
  - `src/lib/actions/members.ts`
- Admin-only access checks (e.g. `checkAdminAccess`)
- Any use of `createAdminClient()`

---

## Compliance & Policies

- **Privacy-by-design**: minimize collection, restrict access by organization and role, and keep retention periods explicit for any new stored data.
- **Auditability requirement**: privileged operations and sensitive state transitions must be traceable via audit events (`src/lib/audit.ts`).
- **Access control evidence**: changes to roles/permissions must be documented in PRs and map clearly to `RolePermissions` and route permissions in code.
- **Incident evidence**: retain logs/audit events sufficient to reconstruct who did what and when, without storing restricted secrets.

Regulatory alignment (as applicable):

- GDPR/LGPD-style obligations (access, deletion, retention) when handling personal data.
- SOC2-style controls (access management, change management, monitoring) if pursuing assurance.

If a formal compliance program is required, add a dedicated evidence directory and list required artifacts (access reviews, key rotation logs, incident reports, penetration test summaries, etc.).

---

## Incident Response

### Reporting and escalation

Treat any suspected compromise of authentication, tokens, service-role credentials, or mass data access as a **SEV-1**.

Escalate immediately to the project owners and the security contacts defined by your organization (on-call rotation, security team, or designated maintainers).

### Initial triage checklist (developer-focused)

1. **Contain**
   - Disable or rotate potentially exposed keys (Supabase service role, third-party API keys).
   - Temporarily block suspicious IPs or tighten rate limits (where supported).
   - If abuse is tied to a specific endpoint under `src/app/api/auth/**`, consider temporarily disabling it behind a feature flag or middleware rule.

2. **Assess scope**
   - Identify affected users/orgs and timeframe.
   - Check audit events (via `src/lib/audit.ts` usage) for privileged actions.
   - Review auth logs and rate-limit telemetry (if available).

3. **Eradicate & recover**
   - Patch the root cause (authorization bypass, token leak, missing validation).
   - Rotate secrets and invalidate sessions if necessary.
   - Restore integrity (revert unauthorized changes).

4. **Post-incident**
   - Document timeline, impact, root cause, and corrective actions.
   - Add regression tests and monitoring to prevent recurrence.

### Tooling expectations

- **Audit logging**: privileged operations should emit audit events.
- **Monitoring/alerting** (implementation-dependent): alerts should exist for spikes in failed logins, OTP requests, and permission-denied events.

---

## Related resources

- [architecture.md](./architecture.md)
