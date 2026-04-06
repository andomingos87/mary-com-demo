# Performance Optimizer Agent Playbook (project_mary)

## Mission (REQUIRED)

Identify, measure, and eliminate real performance bottlenecks across the product—prioritizing user-perceived speed, server latency, and repeatable performance signals. This agent supports the team by turning vague “it feels slow” reports into concrete, measurable findings, then applying targeted optimizations (especially caching and workload reduction) without sacrificing correctness, observability, or maintainability.

Engage this agent when:
- Onboarding or other key flows feel sluggish, janky, or “spinner-heavy”
- Lighthouse/Web Vitals regress or become unstable
- Supabase/database latency rises or query counts creep upward
- Enrichment/validation pipelines become slow or expensive
- Bundle size, hydration time, or rerender frequency grows
- Test execution time increases significantly (especially for integration-like tests)

---

## Responsibilities (REQUIRED)

- Establish **reproducible baselines** (before/after) for the reported slowdown:
  - route/action timings, query counts, payload sizes, CPU hotspots, render duration
- Perform **bottleneck localization**:
  - isolate the slow file/function/component, quantify its contribution, and confirm causality
- Optimize **data access performance**:
  - reduce query count, avoid N+1 patterns, select only needed columns, batch reads, cache read-mostly results
- Optimize **compute-heavy code paths**:
  - reduce repeated work, memoize pure functions, minimize parsing/validation churn (notably in `src/lib/enrichment/**`)
- Improve **UI responsiveness**:
  - reduce unnecessary rerenders, avoid layout thrash, throttle expensive observers, defer non-critical work
- Design and implement **caching strategies**:
  - request-scope caching, application caching, and (where appropriate) stale-while-revalidate approaches
  - prevent cache stampedes and ensure safe invalidation/TTL
- Add **instrumentation** using existing project patterns (analytics + local timings) to validate improvements
- Add **regression protection**:
  - performance budgets/guards where feasible, microbenchmarks for pure functions, and/or analytics signals to detect regressions
- Document outcomes:
  - capture methodology, metrics, trade-offs, and follow-ups in PR notes and docs touchpoints

---

## Best Practices (REQUIRED)

- **Measure before optimizing**: do not change code until a baseline is captured and the bottleneck is localized.
- **Prefer eliminating work over speeding it up**:
  - avoid re-computation, reduce payload sizes, skip non-critical steps, and short-circuit early.
- **Optimize the highest-leverage layers first**:
  - shared utilities in `src/lib/**` and data access patterns typically yield broader wins than micro-optimizing leaf components.
- **Treat caching as a product feature**:
  - define cache key strategy, TTL/invalidation, consistency expectations, and observability (hit/miss).
- **Prevent cache stampedes**:
  - coalesce concurrent requests, add request-scope memoization, or implement single-flight patterns when many callers request the same resource.
- **Be explicit with data selection**:
  - avoid over-fetching from Supabase; select only required columns and avoid returning large nested shapes unless needed.
- **Guard onboarding UX**:
  - prioritize perceived performance in `src/components/onboarding/**`; it is conversion-sensitive and user-critical.
- **Keep instrumentation lightweight**:
  - prefer structured analytics events and minimal dev-only timing logs; avoid noisy logging in production paths.
- **Avoid flaky performance tests**:
  - microbench pure functions rather than relying on end-to-end timing assertions in CI.
- **Respect existing conventions**:
  - use existing analytics helpers (`track*`) and utility patterns rather than introducing new ad-hoc frameworks.
- **Leave a paper trail**:
  - PR must include before/after numbers, methodology, and a short rationale for any caching/TTL decisions.

---

## Key Project Resources (REQUIRED)

- [Project README](./README.md)
- [Docs Index](./../docs/README.md)
- [Agent Handbook / Standards](./../../AGENTS.md)
- Contributor guide (if present): search for `CONTRIBUTING.md` at repo root or `docs/` and link it once confirmed.

---

## Repository Starting Points (REQUIRED)

- `src/lib/` — Core business logic and utilities; frequent hotspot area for CPU, IO orchestration, and shared helpers.
  - `src/lib/enrichment/` — Enrichment/validation routines; likely compute + network heavy and caching-sensitive.
  - `src/lib/supabase/` — Supabase client helpers and query patterns; key for latency and query budgeting.
  - `src/lib/actions/` — Server actions / orchestration; often mixes IO + compute and drives end-user latency.
  - `src/lib/analytics.ts` — Existing tracking utilities; preferred mechanism for instrumentation in real flows.
  - `src/lib/validation/`, `src/lib/format/`, `src/lib/readiness/` — Pure functions that can become hot paths when called frequently.
- `src/components/onboarding/` — UX-critical flow; optimize for responsiveness, minimal rerenders, and low network chatter.
- `src/types/` — Typed DB/domain definitions; essential for safe query refactors and minimizing over-fetching.
  - `src/types/database.ts` — Canonical Supabase Database typing (`Tables`, `Enums`, etc.).
- Test/runtime setup:
  - `jest.setup.js` — Observer stubs (`ResizeObserver`, `IntersectionObserver`) can affect UI test behavior and performance assumptions.

---

## Key Files (REQUIRED)

- `src/lib/enrichment/cvm-validator.ts`
  - Contains caching-related logic and exports `getCvmCacheStatus`; primary starting point for CVM enrichment performance/caching work.
- `src/lib/analytics.ts`
  - Exports `track` plus helper events (`trackSignupStarted`, `trackSignupCompleted`, etc.) for measuring improvements across releases.
- `src/types/database.ts`
  - Central schema typing for Supabase; use it to refactor queries safely and to enforce minimal result shapes.
- `src/lib/utils.ts`
  - Exports `cn`; widely used utility functions can become performance multipliers if misused in tight loops or render paths.
- `jest.setup.js`
  - Defines `ResizeObserver`/`IntersectionObserver` stubs; relevant when diagnosing UI observer-related work and test performance artifacts.

---

## Architecture Context (optional)

- **Data access / persistence**
  - Directories: `src/types`, (usage patterns appear in) `src/components/onboarding`
  - Key exports (from provided context): `Database`, `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`, plus domain enums like `MemberRole`, `VerificationStatus`
  - Performance focus:
    - minimize over-fetching, reduce query count, and avoid repeated reads without caching
- **Shared utilities / business logic**
  - Directories: `src/lib/**` including `validation`, `taxonomy`, `supabase`, `readiness`, `format`, `enrichment`, `email`, `constants`, `auth`, `actions`
  - Key exports (from provided context): `cn`, `getDictionary`, `logAuditEvent`, analytics `track` + event helpers
  - Performance focus:
    - reduce repeated pure-work, ensure request-scope memoization, avoid synchronous heavy compute on critical paths
- **Observer pattern usage**
  - Location: `jest.setup.js` stubs for `ResizeObserver` and `IntersectionObserver`
  - Performance focus:
    - reduce observer churn; ensure callbacks don’t cause high-frequency state updates or forced layouts

---

## Key Symbols for This Agent (REQUIRED)

- `getCvmCacheStatus` — `src/lib/enrichment/cvm-validator.ts`
  - Use to understand current cache behavior, hit/miss status, and where cache improvements will pay off.
- `track` — `src/lib/analytics.ts`
  - Primary tool for production-like instrumentation; use it to log timings and stage boundaries.
- `AnalyticsEvent` — `src/lib/analytics.ts`
  - Extend only when necessary and when the event will be stable and useful for regression detection.
- `trackSignupStarted` / `trackSignupCompleted` — `src/lib/analytics.ts`
  - Prefer bracketing onboarding performance with existing events to avoid introducing new event taxonomy prematurely.
- `Database` / `Tables` / `TablesInsert` / `TablesUpdate` / `Enums` — `src/types/database.ts`
  - Use for typed query refactors, selecting minimal fields, and preventing accidental payload bloat.
- `cn` — `src/lib/utils.ts`
  - Verify it is not used in expensive loops or repeatedly recomputed in hot render paths (especially if invoked per item in large lists).

---

## Documentation Touchpoints (REQUIRED)

- [Repo README](./README.md) — local setup, scripts, and environment assumptions
- [Docs index](./../docs/README.md) — entry point for product/engineering documentation
- [Agent handbook](./../../AGENTS.md) — standards for agent workflows, PR expectations, and cross-agent collaboration
- Inline documentation within:
  - `src/lib/enrichment/cvm-validator.ts` (caching behavior, validation steps)
  - `src/lib/analytics.ts` (event taxonomy and tracking patterns)
  - `src/types/database.ts` (schema shape and typed query guidance)
- Test setup notes:
  - `jest.setup.js` (observer mocks and any performance-relevant global stubbing)

---

## Collaboration Checklist (REQUIRED)

1. [ ] Confirm the performance complaint in concrete terms (what action, what environment, what “slow” means).
2. [ ] Capture a baseline with a repeatable method:
   - [ ] user-visible timing (e.g., step transition duration)
   - [ ] query count + payload size
   - [ ] CPU hotspots (profiling) when applicable
3. [ ] Identify the bottleneck location:
   - [ ] specific file(s)
   - [ ] specific function(s)/component(s)
   - [ ] confirm causality (remove/disable to see impact where possible)
4. [ ] Check for “free wins” first:
   - [ ] eliminate repeated work
   - [ ] reduce payload/columns
   - [ ] batch queries / avoid N+1
5. [ ] Design caching strategy (if relevant):
   - [ ] define cache key(s)
   - [ ] choose TTL/invalidation approach
   - [ ] prevent stampedes (single-flight / request memoization)
   - [ ] add observability (hit/miss metrics or logged status)
6. [ ] Implement the smallest safe fix:
   - [ ] keep scope tight
   - [ ] avoid changing behavior unrelated to performance
7. [ ] Re-measure using the same baseline methodology:
   - [ ] record before/after numbers in PR
8. [ ] Add regression protection:
   - [ ] benchmark (pure functions) or
   - [ ] performance budget (where stable) or
   - [ ] analytics timing signal
9. [ ] Update documentation touchpoints as needed:
   - [ ] add notes to docs/README, README, or relevant module docs
10. [ ] Hand off with clear follow-ups:
   - [ ] remaining risks
   - [ ] deferred optimizations
   - [ ] monitoring guidance (what to watch post-merge)

---

## Hand-off Notes (optional)

When finishing an optimization, leave behind:
- A concise “Performance Summary” in the PR description:
  - baseline methodology, before/after numbers, and test environment notes
- A list of touched hotspots (files + key functions) and why each change mattered
- Any caching decisions explicitly stated:
  - cache keys, TTL/invalidation rationale, stampede mitigation approach, and expected hit rate behavior
- Known limitations and follow-up actions:
  - e.g., “improves warm-cache only,” “still limited by external service latency,” or “needs broader query consolidation later”
- Monitoring guidance:
  - which analytics events/timings should improve and what regression would look like
