# Project Mary Glossary

This document defines the core terminology used throughout **Project Mary** (UI, API routes, server actions, and shared types). It helps developers and non-technical stakeholders align on **what** the system models (domain entities), **who** uses it (actors/personas), and **how** those concepts appear in the codebase.

Project Mary is an organization- and project-centric platform with:

- **Authentication & account security** (login, MFA, device checks, rate limiting)
- **Onboarding flows** for different profiles (investor/asset/advisor)
- **Organization membership and invitations**
- **Projects** with objectives/status and “readiness” scoring/checklists
- **Enrichment** (company lookups/validation, logo, CVM checks, Brazil-specific identifiers)
- **Navigation/authorization** enforced through role-based permissions and route validation

Cross-reference: see [project-overview.md](./project-overview.md) for architecture and major modules.

---

## Type Definitions (Shared Contracts)

These exported types/interfaces act as the shared contract between UI components, server actions, and database access. Links point to their source locations.

### Onboarding types (`src/types/onboarding.ts`)

- [`ActionResult`](../src/types/onboarding.ts) — Common “result wrapper” used by onboarding helpers and/or actions.
- [`StartOnboardingResult`](../src/types/onboarding.ts) — Output of starting onboarding (state + next steps).
- [`StartOnboardingOptions`](../src/types/onboarding.ts) — Options used to initialize onboarding.
- [`ExistingOrgData`](../src/types/onboarding.ts) — Data returned when an org may already exist (e.g., by identifier/domain).
- [`ExistingOrgCheck`](../src/types/onboarding.ts) — Result of “does this org already exist?” checks.
- [`EnrichedCnpjData`](../src/types/onboarding.ts) — Structured enrichment payload for Brazilian CNPJ-related data.
- [`EnrichedWebsiteDataResult`](../src/types/onboarding.ts) — Website-based enrichment output (company details inferred from domain).
- [`GeneratedDescriptionResult`](../src/types/onboarding.ts) — Result for generated text (e.g., company description).
- [`ProfileDetailsInputBase`](../src/types/onboarding.ts) — Base shape for onboarding profile details inputs.
- [`InvestorProfileDetails`](../src/types/onboarding.ts) — Details captured for the investor profile.
- [`AssetProfileDetails`](../src/types/onboarding.ts) — Details captured for the asset profile.
- [`AdvisorProfileDetails`](../src/types/onboarding.ts) — Details captured for the advisor profile.
- [`ProfileDetailsInput`](../src/types/onboarding.ts) — Union/alias for profile-specific detail inputs.
- [`EligibilityInput`](../src/types/onboarding.ts) — Inputs for eligibility rules (what qualifies a user/org).
- [`EligibilityResult`](../src/types/onboarding.ts) — Eligibility evaluation result.
- [`OnboardingProgressResult`](../src/types/onboarding.ts) — Progress summary returned to UI.
- [`StepValidation`](../src/types/onboarding.ts) — Step-level validation results.
- [`StepValidationMap`](../src/types/onboarding.ts) — Map of step → validation.
- [`OnboardingState`](../src/types/onboarding.ts) — Onboarding finite-state representation.

Related step utilities:
- `getNextStep`, `getPreviousStep`, `calculateProgress` @ [`src/types/onboarding.ts`](../src/types/onboarding.ts)

---

### Project / readiness / taxonomy types (`src/types/projects.ts`)

- [`CreateProjectInput`](../src/types/projects.ts) — Inputs to create a project (used by actions/forms).
- [`UpdateProjectInput`](../src/types/projects.ts) — Inputs to update a project.
- [`ListProjectsFilters`](../src/types/projects.ts) — Filters for project listing (UI/search).
- [`FieldSource`](../src/types/projects.ts) — Describes where a field value comes from (user entry vs enrichment, etc.).
- [`FieldMetadataLevel`](../src/types/projects.ts) — Metadata “level” classification used by readiness scoring.
- [`FieldMetadata`](../src/types/projects.ts) — Metadata attached to fields for readiness/scoring.
- [`ProjectFieldMetadata`](../src/types/projects.ts) — Convenience type for metadata keyed to project fields.
- [`ReadinessChecklistItem`](../src/types/projects.ts) — A single checklist item used in readiness.
- [`ReadinessResult`](../src/types/projects.ts) — Summary of readiness evaluation (score + coverage/confidence).
- [`ReadinessData`](../src/types/projects.ts) — Raw readiness inputs used to compute results.
- [`TaxonomyNode`](../src/types/projects.ts) — Node in the MAICS taxonomy tree.
- [`TaxonomyTree`](../src/types/projects.ts) — Root container for taxonomy nodes.
- [`TaxonomySelection`](../src/types/projects.ts) — Selected taxonomy path/codes for a project.
- [`ProjectWithDetails`](../src/types/projects.ts) — Project plus joined/derived detail fields.
- [`ProjectSummary`](../src/types/projects.ts) — Lightweight representation for lists/cards.
- [`ActionResult`](../src/types/projects.ts) — Shared “result wrapper” used in project-related flows.

Related helpers:
- `isValidCodename`, `formatTaxonomyPath`, `getLevelFromCode` @ [`src/types/projects.ts`](../src/types/projects.ts)

---

### Navigation & authorization types (`src/types/navigation.ts`)

- [`NavigationItem`](../src/types/navigation.ts) — A single UI navigation entry (label, route, permissions).
- [`NavigationContext`](../src/types/navigation.ts) — Context used to build/validate navigation.
- [`RoutePermission`](../src/types/navigation.ts) — Permission required to access a route.
- [`OrganizationContext`](../src/types/navigation.ts) — Org-scoped navigation context.
- [`MembershipContext`](../src/types/navigation.ts) — Membership/role context.
- [`CalculatedPermissions`](../src/types/navigation.ts) — Derived permission set used in guards/middleware.
- [`FullNavigationContext`](../src/types/navigation.ts) — Aggregated context used to compute menus.
- [`RouteValidationResult`](../src/types/navigation.ts) — Outcome of route guard checks.
- [`MiddlewareSessionData`](../src/types/navigation.ts) — Session data shape used by middleware.
- [`NavKey`](../src/types/navigation.ts) — Key used to reference a menu/route configuration.
- [`MenuConfig`](../src/types/navigation.ts) — Structure describing per-profile menus.

Related helper:
- `getMenuByProfile` @ [`src/types/navigation.ts`](../src/types/navigation.ts)

---

### Database contract types (`src/types/database.ts`)

These types represent the Supabase/Postgres schema contract and common derived helpers.

- [`Json`](../src/types/database.ts) — JSON value representation used by generated database types.
- [`Database`](../src/types/database.ts) — Full database schema typing.
- [`Tables`](../src/types/database.ts) / [`TablesInsert`](../src/types/database.ts) / [`TablesUpdate`](../src/types/database.ts) — Generic helpers for typed table rows and mutations.
- [`Enums`](../src/types/database.ts) — Enum map exported from the DB schema types.
- [`OrganizationWithMembership`](../src/types/database.ts) — Joined org + membership view for the signed-in user.
- [`UserOrganization`](../src/types/database.ts) — User-to-organization relation view.
- [`RolePermissions`](../src/types/database.ts) — Permission sets per role.
- [`OrganizationAddress`](../src/types/database.ts) — Address fields for an organization.
- [`OrganizationShareholder`](../src/types/database.ts) — Shareholder fields (notably important for Brazil/CNPJ flows).
- [`OnboardingData`](../src/types/database.ts) — Persisted onboarding payload.
- [`OnboardingProgress`](../src/types/database.ts) — Persisted progress/state tracking.
- [`UserProject`](../src/types/database.ts) — User-to-project association.
- [`Organization`](../src/types/database.ts), [`OrganizationInsert`](../src/types/database.ts), [`OrganizationUpdate`](../src/types/database.ts) — Organization row and mutation types.
- [`Project`](../src/types/database.ts), [`ProjectInsert`](../src/types/database.ts), [`ProjectUpdate`](../src/types/database.ts) — Project row and mutation types.
- [`AdvisorProjectAssignment`](../src/types/database.ts), [`AdvisorProjectAssignmentInsert`](../src/types/database.ts) — Advisor ↔ project assignment types.

Related helpers:
- `hasRoleLevel`, `getRolePermissions`, `getOnboardingProgress`, `isOnboardingComplete`, `isOnboardingPendingReview` @ [`src/types/database.ts`](../src/types/database.ts)

---

### Enrichment types (`src/lib/enrichment/types.ts`)

- [`BrasilApiShareholder`](../src/lib/enrichment/types.ts) — Shareholder shape returned by BrasilAPI.
- [`BrasilApiCnae`](../src/lib/enrichment/types.ts) — CNAE classification record.
- [`BrasilApiCnpjResponse`](../src/lib/enrichment/types.ts) — BrasilAPI CNPJ response shape.
- [`ClearbitLogoResult`](../src/lib/enrichment/types.ts) — Result for logo lookups.
- [`EnrichmentStatus`](../src/lib/enrichment/types.ts) — Status of an enrichment call (success/partial/failure).
- [`CvmParticipantType`](../src/lib/enrichment/types.ts) — Participant categories used for CVM validation flows.

---

## Enumerations

Exported enums (and enum-like unions) that shape behavior across authorization, onboarding, enrichment, and project lifecycle.

### Database enums (`src/types/database.ts`)

- [`MemberRole`](../src/types/database.ts) — Role assigned to an organization member (used in guards/navigation/actions).
- [`VerificationStatus`](../src/types/database.ts) — Verification state for entities/steps (used for review/approval flows).
- [`AdvisorSide`](../src/types/database.ts) — Advisor “side” classification (used in advisor onboarding/assignment).
- [`AuditAction`](../src/types/database.ts) — Audit event action codes stored/logged.
- [`OnboardingStep`](../src/types/database.ts) — Enumerates steps in onboarding.
- [`CvmParticipantType`](../src/types/database.ts) — CVM participant type codes stored in DB.
- [`ProjectStatus`](../src/types/database.ts) — Project lifecycle statuses (used by UI, filters, actions).
- [`ProjectObjective`](../src/types/database.ts) — Project objective classification.
- [`TaxonomyMaics`](../src/types/database.ts) — Taxonomy codes/entries (MAICS sector classification).

### Application enums / union types

- [`AuditAction`](../src/lib/audit.ts) — Audit action identifiers used by logging utilities (mirrors DB enum usage).
- [`AnalyticsEvent`](../src/lib/analytics.ts) — Analytics event names emitted during signup/onboarding flows.
- [`CurrencyCode`](../src/lib/format/currency.ts) — Supported currency codes for formatting and display.
- [`SectorCode`](../src/lib/constants/sectors.ts) — Internal sector codes used in taxonomy/selection logic.

---

## Core Terms

Key concepts, what they mean in the product, and where they show up in the code.

### Organization (Org)
A tenant/account boundary representing a real-world company or entity.

- Code surfaces:
  - DB types: `Organization*` @ [`src/types/database.ts`](../src/types/database.ts)
  - Routes: `src/app/(protected)/[orgSlug]/...`
  - Actions: `src/lib/actions/organizations.ts`

### Organization Member / Membership
A user’s relationship to an organization, including role and permissions.

- Code surfaces:
  - DB types: `OrganizationMember*`, `RolePermissions` @ [`src/types/database.ts`](../src/types/database.ts)
  - Navigation context: [`src/types/navigation.ts`](../src/types/navigation.ts)
  - Guards: `src/components/guards/*`

### Invite
A mechanism to add members to an organization (typically via email).

- Code surfaces:
  - Actions: `acceptInvite`, `cancelInvite` @ `src/lib/actions/invites.ts`
  - Email templates: `src/lib/email/templates/*`
  - DB types: `OrganizationInvite*` @ [`src/types/database.ts`](../src/types/database.ts)

### Project
A scoped work item owned by an organization, with status/objective and associated readiness signals.

- Code surfaces:
  - Types: [`src/types/projects.ts`](../src/types/projects.ts)
  - DB enums: `ProjectStatus`, `ProjectObjective` @ [`src/types/database.ts`](../src/types/database.ts)
  - Routes: `src/app/(protected)/[orgSlug]/projects/[codename]`
  - Actions: `src/lib/actions/projects.ts`

### Codename / Slug
Human-readable identifiers used in routes and uniqueness checks:
- **Project codename** identifies a project in URLs.
- **Organization slug** identifies an organization in URLs.

- Code surfaces:
  - Availability checks: `checkCodenameAvailability` (projects), `checkSlugAvailability` (organizations)
  - Validation: `isValidCodename` @ [`src/types/projects.ts`](../src/types/projects.ts)

### Onboarding
The guided workflow to collect profile/org data, validate it, enrich it, and reach a usable system state.

- Code surfaces:
  - UI: `src/components/onboarding/*` (wizard/steps)
  - Server actions: `src/lib/actions/onboarding.ts`
  - Persistence: `OnboardingData`, `OnboardingProgress` @ [`src/types/database.ts`](../src/types/database.ts)

### Onboarding Step
A discrete stage within onboarding (captured as an enum in DB types).

- Code surfaces:
  - Enum: `OnboardingStep` @ [`src/types/database.ts`](../src/types/database.ts)
  - Step transitions: `getNextStep`, `getPreviousStep` @ [`src/types/onboarding.ts`](../src/types/onboarding.ts)
  - Step routes: `src/app/onboarding/[step]`

### Profile (Investor / Asset / Advisor)
A persona-specific mode that changes required onboarding fields, navigation menus, and permissions.

- Code surfaces:
  - Profile detail types: `InvestorProfileDetails`, `AssetProfileDetails`, `AdvisorProfileDetails` @ [`src/types/onboarding.ts`](../src/types/onboarding.ts)
  - Menu selection: `getMenuByProfile` @ [`src/types/navigation.ts`](../src/types/navigation.ts)

### Eligibility
Rule evaluation determining whether a user/org qualifies for a given flow (e.g., feature access or onboarding gating).

- Code surfaces:
  - Types: `EligibilityInput`, `EligibilityResult` @ [`src/types/onboarding.ts`](../src/types/onboarding.ts)
  - Enforcement: onboarding action logic in `src/lib/actions/onboarding.ts`

### Readiness Score / Readiness Checklist
A scoring system and checklist that measure how “complete” or “investment-ready” a project’s data is, based on metadata level and coverage.

- Code surfaces:
  - Scoring utilities: `src/lib/readiness/score.ts`
  - Action: `calculateReadinessScore` @ `src/lib/actions/readiness.ts`
  - Types: `ReadinessResult`, `ReadinessChecklistItem` @ [`src/types/projects.ts`](../src/types/projects.ts)

### Radar Score
A Radar-specific matching score (0-100) used to rank opportunities against the investor's active thesis.

- Code surfaces:
  - Scoring engine: `src/lib/radar/score.ts`
  - Orchestration and threshold/fallback: `src/lib/actions/radar.ts`
  - Card contract: `src/types/radar.ts`

### Teaser (Radar)
Pre-NDA preview content shown to investors before requesting NDA for an opportunity.

- Code surfaces:
  - UI/CTA dialog: `src/components/radar/OpportunitiesList.tsx`
  - Teaser state assembly (`canViewTeaser`, `teaserSummary`): `src/lib/actions/radar.ts`
  - Contract: `src/types/radar.ts`

### NDA Request (Radar)
Formal request initiated by investor in Radar to advance relationship under confidentiality workflow.

- Code surfaces:
  - Server action: `requestNdaForOpportunity` in `src/lib/actions/radar.ts`
  - Persistence/RLS: `supabase/migrations/20260326110000_create_radar_cta_tables.sql`
  - CTA states: `hasNdaRequest`, `canRequestNda` in `src/components/radar/OpportunitiesList.tsx`

### Field Metadata (L1/L2/…)
Classification/metadata attached to fields used to calculate coverage and confidence (readiness).

- Code surfaces:
  - Types: `FieldMetadata`, `FieldMetadataLevel` @ [`src/types/projects.ts`](../src/types/projects.ts)
  - Application: `applyFieldMetadata`, `applyBulkL1Metadata` @ `src/lib/readiness/score.ts`

### Taxonomy (MAICS)
A hierarchical industry classification used to categorize projects/organizations and enable filtering/search.

- Code surfaces:
  - Builder/search: `src/lib/taxonomy/maics.ts`
  - Types: `TaxonomyNode`, `TaxonomySelection` @ [`src/types/projects.ts`](../src/types/projects.ts)
  - DB enum/type: `TaxonomyMaics` @ [`src/types/database.ts`](../src/types/database.ts)

### Enrichment
Automated data augmentation from external sources (e.g., BrasilAPI for CNPJ, ViaCEP for CEP, Clearbit logo, CVM checks).

- Code surfaces:
  - Libraries: `src/lib/enrichment/*`
  - Onboarding outputs: `EnrichedCnpjData`, `EnrichedWebsiteDataResult` @ [`src/types/onboarding.ts`](../src/types/onboarding.ts)

### Audit Log / Audit Event
Recorded, structured events for sensitive actions (tracking who changed what).

- Code surfaces:
  - Utility: `logAuditEvent`, `AuditAction` @ [`src/lib/audit.ts`](../src/lib/audit.ts)
  - Readiness auditing: `auditField` @ `src/lib/actions/readiness.ts`

### Analytics Event
Product analytics events emitted during key user flows (signup start/complete, onboarding step completion).

- Code surfaces:
  - Tracking: `track*`, `AnalyticsEvent` @ [`src/lib/analytics.ts`](../src/lib/analytics.ts)

### MFA (Multi-Factor Authentication)
Additional verification step for authentication; includes verification endpoints and callback handlers.

- Code surfaces:
  - API route: `src/app/api/auth/verify-mfa`
  - Page: `src/app/verify-mfa`
  - Helpers: `src/lib/auth/*` (notably `src/lib/auth/mfa.ts`)

---

## Acronyms & Abbreviations

- **CNPJ** — *Cadastro Nacional da Pessoa Jurídica* (Brazilian company identifier).  
  Used in enrichment and onboarding (`src/lib/enrichment/brasil-api.ts`, `src/types/onboarding.ts`).

- **CNAE** — *Classificação Nacional de Atividades Econômicas* (Brazilian economic activity classification).  
  Used for mapping to MAICS taxonomy (`src/lib/taxonomy/maics.ts`, enrichment types).

- **CEP** — Brazilian postal code.  
  Used in address enrichment/validation (`src/lib/enrichment/viacep.ts`).

- **CVM** — *Comissão de Valores Mobiliários* (Brazilian securities regulator).  
  Used for participant validation (`src/lib/enrichment/cvm-validator.ts`, `CvmParticipantType` types).

- **MFA** — Multi-Factor Authentication.  
  Used in auth routes and helpers (`src/lib/auth/mfa.ts`, `src/app/api/auth/verify-mfa`).

- **RBAC** — Role-Based Access Control.  
  Implemented through roles/permissions/navigation context (`src/types/database.ts`, `src/types/navigation.ts`).

- **NDA** — Non-Disclosure Agreement.  
  In Radar, represented by request records and status transitions in `nda_requests`.

- **VDR** — Virtual Data Room (document sharing in investment workflows).  
  Appears as an app route area: `src/app/(protected)/[orgSlug]/assetvdr`.

---

## Personas / Actors

Workflows vary based on the actor’s organization role and selected profile.

### Organization Admin
- Goal: Manage organization settings, members, roles, and access.
- Key workflows: invite/cancel members, manage org profile, ensure compliance/verification.
- Code surfaces:
  - Admin checks: `checkAdminAccess` @ `src/lib/actions/navigation.ts`
  - RBAC types: `MemberRole`, `RolePermissions` @ [`src/types/database.ts`](../src/types/database.ts)
  - Org settings routes under `src/app/(protected)/[orgSlug]/settings`

### Member (Non-admin)
- Goal: Collaborate within an organization with limited permissions.
- Key workflows: access assigned projects, complete onboarding requirements, view dashboards.
- Code surfaces:
  - Navigation guards/menus: [`src/types/navigation.ts`](../src/types/navigation.ts)
  - Protected routes under `src/app/(protected)`

### Investor Profile User
- Goal: Evaluate opportunities and track pipeline/projects from an investor perspective.
- Key workflows: complete investor onboarding, browse opportunities/pipeline, assess readiness.
- Code surfaces:
  - Onboarding types: `InvestorProfileDetails` @ [`src/types/onboarding.ts`](../src/types/onboarding.ts)
  - Menu selection: `getMenuByProfile` @ [`src/types/navigation.ts`](../src/types/navigation.ts)

### Asset Profile User (Issuer/Company)
- Goal: Prepare and present project/company information; improve readiness score; share required data.
- Key workflows: provide structured data, confirm enrichment results, progress through onboarding steps.
- Code surfaces:
  - Onboarding types: `AssetProfileDetails` @ [`src/types/onboarding.ts`](../src/types/onboarding.ts)
  - Readiness scoring: `src/lib/readiness/score.ts`
  - Dashboard: `src/components/dashboard/AssetDashboard.tsx`

### Advisor
- Goal: Support organizations/projects (advisory services), avoid conflicts, manage assignments.
- Key workflows: complete advisor onboarding, accept assignments, perform reviews/assistance.
- Code surfaces:
  - Advisor actions: `checkAdvisorConflict` @ `src/lib/actions/advisor.ts`
  - Assignment types: `AdvisorProjectAssignment*` @ [`src/types/database.ts`](../src/types/database.ts)
  - Onboarding types: `AdvisorProfileDetails` @ [`src/types/onboarding.ts`](../src/types/onboarding.ts)

---

## Domain Rules & Invariants

Rules enforced explicitly (validation functions/actions) or implicitly (DB constraints + typed enums).

### Identity & uniqueness

- **Organization slug must be unique**  
  Enforced via slug availability checks (`checkSlugAvailability` in `src/lib/actions/organizations.ts`) and routing (`[orgSlug]` protected routes).

- **Project codename must be valid and unique**  
  Validation helper: `isValidCodename` @ [`src/types/projects.ts`](../src/types/projects.ts)  
  Availability check: `checkCodenameAvailability` in `src/lib/actions/projects.ts`

### Onboarding state machine

- **Onboarding progresses through discrete steps**  
  Enum: `OnboardingStep` @ [`src/types/database.ts`](../src/types/database.ts)  
  Transitions: `getNextStep`, `getPreviousStep` @ [`src/types/onboarding.ts`](../src/types/onboarding.ts)

- **Completion and review gating**  
  Persisted progress includes “complete” and “pending review” concepts:
  - `isOnboardingComplete`
  - `isOnboardingPendingReview`  
  (Helpers in [`src/types/database.ts`](../src/types/database.ts))

### Authorization (RBAC)

- **Access is role- and context-dependent**  
  Navigation and route access depend on membership and derived permissions:
  - `CalculatedPermissions`, `RouteValidationResult` @ [`src/types/navigation.ts`](../src/types/navigation.ts)

- **Admin operations require explicit checks**  
  Example: `checkAdminAccess` in `src/lib/actions/navigation.ts`

### Readiness scoring invariants

- **Readiness is derived from field coverage + metadata level**  
  Computed in `src/lib/readiness/score.ts` and returned as `ReadinessResult` @ [`src/types/projects.ts`](../src/types/projects.ts)

- **Auditability of key data changes**  
  Sensitive changes may be audited:
  - `auditField` @ `src/lib/actions/readiness.ts`
  - `logAuditEvent` @ [`src/lib/audit.ts`](../src/lib/audit.ts)

### Brazil-specific enrichment and compliance

- **CNPJ normalization/validation**  
  Cleaning: `cleanCnpj` @ `src/lib/enrichment/brasil-api.ts`  
  Response types: `BrasilApiCnpjResponse` @ [`src/lib/enrichment/types.ts`](../src/lib/enrichment/types.ts)

- **CEP normalization**  
  Cleaning: `cleanCep` @ `src/lib/enrichment/viacep.ts`

- **CVM registration checks**  
  Validator: `checkCvmRegistration` @ `src/lib/enrichment/cvm-validator.ts`

---

## Related Resources

- [project-overview.md](./project-overview.md)
