/**
 * Server Actions - Organizations, RBAC, Onboarding & Projects (Fase 2, 3 & 4)
 *
 * Este módulo exporta todas as Server Actions relacionadas ao
 * sistema de organizações, membros, convites, advisors, onboarding e projetos.
 *
 * @module actions
 */

// Organizations CRUD (2.2.1-2.2.5)
export {
  createOrganization,
  getUserOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  checkSlugAvailability,
  generateUniqueSlug,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
} from './organizations'

// Members (2.2.6, 2.2.10, 2.2.11)
export {
  listOrganizationMembers,
  updateMemberRole,
  removeMember,
  getCurrentMembership,
  leaveOrganization,
  type MemberWithUser,
  type UpdateMemberInput,
} from './members'

// Invites (2.2.7-2.2.9)
export {
  createInvite,
  acceptInvite,
  cancelInvite,
  listPendingInvites,
  getInviteByToken,
  resendInvite,
  type CreateInviteInput,
  type InviteWithOrganization,
} from './invites'

// Advisor (2.2.12)
export {
  checkAdvisorConflict,
  createAdvisorAssignment,
  removeAdvisorAssignment,
  listProjectAdvisors,
  getAdvisorAssignments,
  type ConflictCheckResult,
  type CreateAssignmentInput,
} from './advisor'

// Onboarding (3.3)
export {
  startOnboarding,
  enrichFromCnpjAction,
  enrichFromWebsiteAction,
  generateDescriptionAction,
  saveProfileDetails,
  submitEligibility,
  completeOnboarding,
  getOnboardingProgress,
  confirmOnboardingData,
  acceptTerms,
} from './onboarding'

// Thesis (H2.1)
export {
  listTheses,
  getActiveThesis,
  createThesis,
  updateThesis,
  activateThesis,
  deleteThesis,
} from './thesis'

// Radar (H2.2)
export {
  listRadarOpportunities,
  toggleFollowOpportunity,
  requestNdaForOpportunity,
} from './radar'

// Common types
export type { ActionResult } from './organizations'

// Onboarding types
export type {
  StartOnboardingResult,
  EnrichedCnpjData,
  EnrichedWebsiteDataResult,
  GeneratedDescriptionResult,
  ProfileDetailsInput,
  InvestorProfileDetails,
  AssetProfileDetails,
  AdvisorProfileDetails,
  EligibilityInput,
  EligibilityResult,
  OnboardingProgressResult,
} from '@/types/onboarding'

// Thesis types
export type {
  ActiveThesisState,
  ActiveThesisMetadata,
  ActiveThesisResponse,
  ThesisCriteria,
  CreateThesisInput,
  UpdateThesisInput,
  ThesisMutationOptions,
  ThesisListItem,
} from '@/types/thesis'

// Radar types
export type {
  RadarCtaState,
  RadarOpportunity,
  RadarState,
  RadarResult,
  RadarQueryOptions,
  ToggleFollowInput,
  ToggleFollowResult,
  RequestNdaInput,
  RequestNdaResult,
} from '@/types/radar'

// Authentication (BUG-001 Fix)
export {
  loginAction,
  signupAction,
  verifyMfaAction,
  logoutAction,
  resendOtpAction,
  type LoginInput,
  type LoginResult,
  type SignupInput,
  type SignupResult,
  type VerifyMfaInput,
  type VerifyMfaResult,
} from './auth'

// Projects (4.2.1)
export {
  createProject,
  getProject,
  getProjectByCodename,
  listProjects,
  updateProject,
  changeProjectStatus,
  deleteProject,
  checkCodenameAvailability,
} from './projects'

// Taxonomy (4.2.2)
export {
  getTaxonomyTree,
  getTaxonomyByLevel,
  searchTaxonomy,
  getTaxonomyNode,
  getTaxonomyFullPath,
  getL1Sectors,
  getTaxonomyChildren,
} from './taxonomy'

// Readiness (4.2.3)
export {
  calculateReadinessScore,
  updateProjectReadiness,
  getReadinessChecklist,
  validateField,
  auditField,
  getFieldValidationStatus,
} from './readiness'

// Geographies (TASK-012)
export {
  getGeographies,
  getGeographiesByType,
  getGeographyChildren,
  getGeographyHierarchy,
  getGeographyByCode,
  getContinents,
  getCountries,
  getStates,
  countryHasStates,
} from './geographies'

// Eligibility (TASK-013)
export {
  submitManualReviewRequest,
  type ManualReviewRequest,
  type ManualReviewResult,
} from './eligibility'

// Project Members (SPEC-001)
export {
  addProjectMember,
  removeProjectMember,
  listProjectMembers,
  updateProjectMemberRole,
  checkProjectAccess,
} from './project-members'

// Project Invites (SPEC-001)
export {
  createProjectInvite,
  acceptProjectInvite,
  cancelProjectInvite,
  listProjectInvites,
  resendProjectInvite,
  getProjectInviteByToken,
} from './project-invites'

// Notifications (SPEC-001)
export {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from './notifications'

// Project Types
export type {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsFilters,
  ProjectWithDetails,
  ProjectSummary,
  ReadinessResult,
  ReadinessChecklistItem,
  TaxonomyNode,
  TaxonomyTree,
  TaxonomySelection,
  FieldMetadata,
  ProjectFieldMetadata,
  ProjectVisibility,
  ProjectMemberRole,
  ProjectMember,
  ProjectMemberWithUser,
  ProjectInvite,
  ProjectInviteWithDetails,
} from '@/types/projects'

// Notification Types
export type {
  NotificationType,
  Notification,
  CreateNotificationInput,
} from '@/types/notifications'

// Geography Types
export type {
  Geography,
  GeographyType,
  GeographyNode,
  GeographyHierarchy,
  GeographySelection,
  GeographySelectionFlat,
  GeographySelectorProps,
} from '@/types/geography'