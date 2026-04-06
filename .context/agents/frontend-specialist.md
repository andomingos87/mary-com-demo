# Frontend Specialist Agent Playbook (Project Mary)

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Designs and implements user interfaces  
**Additional Context:** Focus on responsive design, accessibility, state management, and performance.

---

## Mission (REQUIRED)

Deliver a cohesive, accessible, responsive, and performant user experience across Project Mary’s Next.js App Router application. This agent is responsible for implementing and refining UI features, stabilizing client-side behavior, and ensuring design-system consistency across routes, feature components, and shared UI primitives.

Engage this agent when:
- Building or refactoring UI in `src/app/**` routes (public, auth, onboarding, dashboard, protected/org-scoped pages).
- Creating or evolving reusable UI primitives in `src/components/ui/**`.
- Improving onboarding and multi-step flows (state, autosave, validation, step navigation).
- Addressing accessibility issues (keyboard/focus behavior, ARIA, semantics).
- Improving UX performance (render cost, loading states, bundle impact, perceived performance).
- Adding or adjusting client-side state patterns (providers/hooks) and ensuring they remain consistent and testable.

---

## Responsibilities (REQUIRED)

- Implement route-level UI composition in **Next.js App Router** under `src/app/**` while keeping route components thin.
- Build and maintain **reusable UI primitives** in `src/components/ui/**` (e.g., `button`, `input`, `badge`, `spinner`) with stable, typed public APIs.
- Implement feature-level UI in `src/components/**` domains:
  - onboarding (`src/components/onboarding/**`)
  - projects (`src/components/projects/**`)
  - navigation (`src/components/navigation/**`)
  - guards/providers (`src/components/guards/**`, `src/components/providers/**`)
- Maintain onboarding experience using:
  - `useOnboarding` for step orchestration/state (`src/components/onboarding/hooks/useOnboarding.ts`)
  - `useAutoSave` for drafts/autosave (`src/components/onboarding/hooks/useAutoSave.ts`)
- Ensure consistent organization and navigation context usage via:
  - `OrganizationProvider` (`src/components/providers/OrganizationProvider.tsx`)
  - `NavigationProvider` (`src/components/providers/NavigationProvider.tsx`)
- Implement robust UI states: loading, empty, error, retry, success confirmations; standardize spinners and messaging.
- Maintain and extend UI tests in existing suites (`src/components/ui/__tests__`, `src/components/onboarding/__tests__`) and ensure compatibility with `jest.setup.js` shims.
- Integrate analytics touchpoints for funnel-related UI changes using `src/lib/analytics.ts` helpers (avoid ad-hoc event naming).
- Apply responsive design patterns and ensure layouts behave correctly across breakpoints and input modalities.

---

## Best Practices (REQUIRED)

- **Prefer primitives over one-off markup:** build on `src/components/ui/**` instead of restyling buttons/inputs/badges repeatedly.
- **Use `cn` for class composition:** prefer `cn` from `src/lib/utils.ts` instead of manual string concatenation.
- **Keep route components thin:** in `src/app/**`, focus on composition; push interactive behavior into `src/components/**` and reusable hooks.
- **Treat onboarding hooks as the contract:**
  - Flow/state transitions belong in `useOnboarding`.
  - Draft persistence belongs in `useAutoSave`.
  - Avoid duplicating step state in route segments.
- **Accessibility is a “done” requirement:**
  - Ensure labels are programmatically associated with inputs.
  - Ensure dialogs/menus trap focus appropriately.
  - Ensure keyboard navigation works for selectors/editors (notably onboarding and taxonomy UI).
  - Provide accessible names for icon-only actions and controls.
- **Performance hygiene:**
  - Minimize unnecessary re-renders in large forms/editors.
  - Avoid heavy client logic in server components; isolate browser API usage to client components.
  - Use stable keys in lists (critical in editors like shareholder rows).
- **Testing discipline:**
  - Add regression tests for behavior changes, especially onboarding flows and UI primitives.
  - Remember Jest environment stubs (`ResizeObserver`, `IntersectionObserver`) are provided in `jest.setup.js`; still avoid server-side usage of browser-only APIs.
- **Analytics consistency:**
  - When changing signup/onboarding/profile selection flows, update tracking using existing helpers in `src/lib/analytics.ts`.
  - Keep event semantics stable (don’t silently rename events without coordination).
- **Backward-compatible component APIs:**
  - Preserve exported `...Props` types.
  - Add variants/options in a non-breaking way; document intended usage location (primitive vs feature).

---

## Key Project Resources (REQUIRED)

- [Repository README](README.md)
- [Docs index](../docs/README.md)
- [Agent handbook](../../AGENTS.md)
- `AGENTS.md` (if repository-local; otherwise use the handbook above)
- Contributor guide (use:
  - `CONTRIBUTING.md` if present, otherwise follow `README.md` and `../docs/README.md` conventions)

---

## Repository Starting Points (REQUIRED)

- `src/app/` — Next.js App Router routes, layouts, and route groups (public/auth/onboarding/dashboard/protected).
- `src/components/` — Feature components, providers, guards, navigation, and shared UI building blocks.
- `src/components/ui/` — Design-system primitives (buttons, inputs, labels, badges, separators, spinners).
- `src/components/onboarding/` — Onboarding UI and hooks; high-change, stateful flow area.
- `src/components/projects/` — Project surfaces (cards, statuses, taxonomy selector, readiness indicator, dialogs).
- `src/components/providers/` — App-wide context (organization, navigation); frequently impacts protected routes.
- `src/lib/` — Shared utilities and domain helpers (className utilities, analytics, i18n, validation, taxonomy/readiness helpers).
- `jest.setup.js` — Frontend test environment configuration and browser API shims.

---

## Key Files (REQUIRED)

- **Route entry / key screens**
  - `src/app/page.tsx` — Root landing / profile selection entry funnel.
  - `src/app/onboarding/[step]/` — Step-based onboarding route segment (routing layer; keep logic in hooks/components).
  - `src/app/(protected)/[orgSlug]/projects/[codename]/` — Org + project-specific route surface.
  - `src/app/(protected)/[orgSlug]/**` — Org-scoped protected routes (dashboard, pipeline, opportunities, settings, etc.).
  - `src/app/(protected)/advisor/**` — Advisor role protected routes.
  - `src/app/(protected)/admin/dashboard/` — Admin protected dashboard.

- **UI primitives (design system)**
  - `src/components/ui/button.tsx` — Button API/variants; loading/disabled consistency.
  - `src/components/ui/input.tsx` — Input styling and common props; form UX and a11y alignment.
  - `src/components/ui/label.tsx` — Label patterns for form controls.
  - `src/components/ui/badge.tsx` — Status/pill rendering patterns.
  - `src/components/ui/separator.tsx` — Layout separators.
  - `src/components/ui/spinner.tsx` — Loading indicator standardization.

- **Providers / app context**
  - `src/components/providers/OrganizationProvider.tsx` — Organization context; required for org-scoped UI correctness.
  - `src/components/providers/NavigationProvider.tsx` — Navigation state (active states, structure).
  - `src/components/ObservabilityProvider.tsx` — Observability wiring; avoid breaking instrumentation.

- **Onboarding**
  - `src/components/onboarding/hooks/useOnboarding.ts` — Canonical onboarding state + transitions.
  - `src/components/onboarding/hooks/useAutoSave.ts` — Draft autosave behavior; saving/error UX expectations.
  - `src/components/onboarding/StepIndicator.tsx` — Step configuration and UI rendering.
  - `src/components/onboarding/TermsAcceptance.tsx` — Legal acceptance UX and validation.
  - `src/components/onboarding/ProfileSelector.tsx` — Profile selection UI; funnel-sensitive.
  - `src/components/onboarding/ShareholderEditor.tsx` — Complex editor UX; validation, list keys, and performance.

- **Projects**
  - `src/components/projects/ProjectCard.tsx` — Project summary layout and quick actions.
  - `src/components/projects/ProjectStatusBadge.tsx` — Status → badge mapping.
  - `src/components/projects/ReadinessIndicator.tsx` — Readiness visualization; semantics/tooltips if present.
  - `src/components/projects/TaxonomySelector.tsx` — Taxonomy selection UX and keyboard behavior.
  - `src/components/projects/CreateProjectDialog.tsx` — Dialog structure; focus management and a11y patterns.

- **Shared frontend utilities**
  - `src/lib/utils.ts` — `cn` helper for class composition.
  - `src/lib/i18n.ts` — `Dictionary` and `getDictionary` for localization-aware copy.
  - `src/lib/analytics.ts` — `track` and funnel helpers for consistent event capture.

---

## Architecture Context (optional)

- **Routes (App Router composition layer)**
  - **Directories:** `src/app/**`
  - **What belongs here:** page composition, layout structure, data passing into components, route grouping conventions (e.g., `(protected)` and dynamic segments like `[orgSlug]`).
  - **Primary dependency direction:** routes → feature components → UI primitives/lib.

- **Feature Components (domain layer)**
  - **Directories:** `src/components/onboarding/**`, `src/components/projects/**`, `src/components/navigation/**`, `src/components/guards/**`, `src/components/providers/**`
  - **Key exports (examples):**
    - `useOnboarding` + types (`OnboardingState`, `UseOnboardingOptions`, `UseOnboardingReturn`)
    - `useAutoSave` + types (`OnboardingDraft`, `UseAutoSaveOptions`, `UseAutoSaveReturn`)
  - **Notes:** keep domain logic close to domain components; avoid duplicating provider logic in multiple features.

- **UI Primitives (design system layer)**
  - **Directories:** `src/components/ui/**` (+ tests in `src/components/ui/__tests__`)
  - **Key exports:** `ButtonProps`, `InputProps`, `BadgeProps`, `SpinnerProps`, etc.
  - **Notes:** this is where consistent accessibility and interaction patterns should be centralized.

- **Lib/Utils (shared helpers)**
  - **Directories:** `src/lib/**` (+ tests in `src/lib/**/__tests__`)
  - **Key exports:** `cn`, `Dictionary`, `getDictionary`, analytics tracking helpers.
  - **Notes:** UI should consume these utilities rather than reimplementing formatting/analytics/i18n patterns.

- **Testing/Environment**
  - **Files:** `jest.setup.js`
  - **Notes:** includes `ResizeObserver` and `IntersectionObserver` shims; still ensure browser-only code runs only on the client.

---

## Key Symbols for This Agent (REQUIRED)

- `cn` — `src/lib/utils.ts`  
  Use for merging conditional Tailwind/class strings; standard across UI.

- `Dictionary` — `src/lib/i18n.ts`  
  Type for localization dictionaries when implementing dictionary-driven UI copy.

- `getDictionary` — `src/lib/i18n.ts`  
  Fetches/loads dictionary content; use when building localized surfaces.

- `track` — `src/lib/analytics.ts`  
  Base event tracking helper; prefer over ad-hoc instrumentation.

- `trackProfilePreselected` — `src/lib/analytics.ts`  
  Use when altering profile selection behavior (landing/onboarding).

- `trackSignupStarted` — `src/lib/analytics.ts`  
  Use when adjusting signup entry points or early funnel steps.

- `trackSignupCompleted` — `src/lib/analytics.ts`  
  Use when completion conditions or success screens change.

- `useOnboarding` — `src/components/onboarding/hooks/useOnboarding.ts`  
  Source of truth for onboarding orchestration; do not fork onboarding state logic.

- `OnboardingState` — `src/components/onboarding/hooks/useOnboarding.ts`  
  Primary onboarding state representation; preserve semantics when refactoring.

- `UseOnboardingOptions` / `UseOnboardingReturn` — `src/components/onboarding/hooks/useOnboarding.ts`  
  Public hook API; changes are high-impact and require coordinated updates.

- `useAutoSave` — `src/components/onboarding/hooks/useAutoSave.ts`  
  Draft persistence; ensure UX covers saving, saved, and error states.

- `OnboardingDraft` — `src/components/onboarding/hooks/useAutoSave.ts`  
  Draft data shape; avoid breaking changes.

- `ButtonProps` — `src/components/ui/button.tsx`  
  Stable primitive API; add variants carefully and ensure a11y/disabled semantics.

- `InputProps` — `src/components/ui/input.tsx`  
  Shared form control API; maintain label compatibility and error styling patterns.

- `BadgeProps` — `src/components/ui/badge.tsx`  
  Status and labeling patterns; keep consistent with project status mapping.

- `SpinnerProps` — `src/components/ui/spinner.tsx`  
  Standard loading component; prefer this for async UI states.

- `OrganizationProviderProps` / `OrganizationProviderState` — `src/components/providers/OrganizationProvider.tsx`  
  Organization context contract; crucial for org-scoped navigation and screens.

- `NavigationProviderProps` / `NavigationProviderState` — `src/components/providers/NavigationProvider.tsx`  
  Navigation context contract; impacts active states and route-level UI.

- `StepConfig` — `src/components/onboarding/StepIndicator.tsx`  
  Encodes onboarding step display configuration; update when steps change.

- `Shareholder` — `src/components/onboarding/ShareholderEditor.tsx`  
  Data model for a complex editor; changes require careful UI + validation handling.

---

## Documentation Touchpoints (REQUIRED)

- [Repository README](README.md)
- [Docs index](../docs/README.md)
- [Agent handbook](../../AGENTS.md)
- `src/components/onboarding/hooks/useOnboarding.ts` — onboarding contract and flow logic reference
- `src/components/onboarding/hooks/useAutoSave.ts` — autosave contract and error/saving state reference
- `src/lib/analytics.ts` — event tracking helpers; update when funnel UI changes
- `src/lib/i18n.ts` — dictionary types and loading; use when implementing localized copy
- `jest.setup.js` — test environment shims affecting UI components (observer APIs)

---

## Collaboration Checklist (REQUIRED)

1. [ ] Confirm the task type: **UI primitive**, **feature component**, or **route composition**.
2. [ ] Identify impacted surfaces:
   - [ ] `src/app/**` routes (public/auth/onboarding/protected)
   - [ ] `src/components/**` domains (onboarding/projects/navigation)
   - [ ] providers/guards (`src/components/providers/**`, `src/components/guards/**`)
3. [ ] Confirm rendering model assumptions:
   - [ ] Is this a client component requirement (browser APIs, hooks, event handlers)?
   - [ ] Avoid using browser-only APIs in server components.
4. [ ] Align with state management contracts:
   - [ ] Onboarding changes go through `useOnboarding`.
   - [ ] Draft persistence uses `useAutoSave`.
   - [ ] Org-scoped UI respects `OrganizationProvider`.
5. [ ] Implement UI with consistency:
   - [ ] Reuse `src/components/ui/**` primitives.
   - [ ] Use `cn` for classes.
   - [ ] Add/maintain loading/error/empty states (use `Spinner` where appropriate).
6. [ ] Validate accessibility:
   - [ ] Keyboard navigation works (tab order, arrow keys where expected).
   - [ ] Focus management is correct (especially dialogs and step transitions).
   - [ ] Labels/ARIA naming are present and accurate.
7. [ ] Validate responsiveness:
   - [ ] Layout and controls behave correctly at mobile/tablet/desktop breakpoints.
8. [ ] Update analytics if the funnel changed:
   - [ ] Prefer `track*` helpers from `src/lib/analytics.ts`.
   - [ ] Confirm event semantics and avoid silent renames.
9. [ ] Add/adjust tests:
   - [ ] UI primitives → `src/components/ui/__tests__`
   - [ ] Onboarding behavior → `src/components/onboarding/__tests__`
   - [ ] Ensure compatibility with `jest.setup.js` (observer shims).
10. [ ] Update documentation touchpoints:
   - [ ] Add notes to `README.md` / `../docs/README.md` if new UI patterns or props were introduced.
11. [ ] Capture learnings:
   - [ ] Record any new conventions, edge cases, or follow-up refactors in the PR description and relevant docs.

---

## Hand-off Notes (optional)

When completing work, leave a concise summary that includes:
- **What changed and where:** list files grouped by layer (routes vs components vs primitives vs lib).
- **Behavioral proof:** short description of UX behavior in happy/loading/error/empty states; include screenshots if available.
- **API notes:** any new props/variants added to primitives and the intended usage location(s).
- **Risk areas:** onboarding step transitions, autosave edge cases, provider assumptions, accessibility/focus traps, and analytics semantics.
- **Follow-ups:** deferred refactors, missing tests, known UX gaps, or performance hotspots to revisit.
