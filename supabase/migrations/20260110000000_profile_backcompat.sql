-- Migration: Profile Selection Backward Compatibility
-- Date: 2026-01-10
-- Purpose: Ensure orgs without profile_type go to profile_selection step
-- Related: ADR-001 Profile Selection on Landing

-- For existing organizations without profile_type that haven't completed onboarding,
-- force them to go through profile_selection step
UPDATE organizations
SET onboarding_step = 'profile_selection'
WHERE profile_type IS NULL
  AND onboarding_step != 'completed'
  AND onboarding_step != 'pending_review'
  AND deleted_at IS NULL;

-- Add comment for documentation
COMMENT ON TABLE organizations IS 'Organizations table with profile_type selection moved to signup flow (2026-01-10)';
