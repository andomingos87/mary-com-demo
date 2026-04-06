-- E4 (B4.1 + H4.2): project status contract + audit actions
-- Safe migration strategy:
-- 1) expand enum values
-- 2) remap legacy rows
-- 3) enforce canonical statuses via CHECK
-- 4) register new audit actions

-- Canonical project statuses for E4
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'teaser';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'nda';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'nbo';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'spa';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'closed_lost';

-- Map legacy statuses to canonical stages
UPDATE public.projects
SET status = CASE status::text
  WHEN 'draft' THEN 'teaser'::public.project_status
  WHEN 'active' THEN 'nda'::public.project_status
  WHEN 'paused' THEN 'nda'::public.project_status
  WHEN 'closed' THEN 'spa'::public.project_status
  WHEN 'archived' THEN 'closed_lost'::public.project_status
  ELSE status
END
WHERE status::text IN ('draft', 'active', 'paused', 'closed', 'archived');

-- Keep old enum values for backward compatibility in type metadata,
-- but block new writes outside canonical set.
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_e4_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_e4_check
  CHECK (status::text IN ('teaser', 'nda', 'nbo', 'spa', 'closed_lost'));

ALTER TABLE public.projects
  ALTER COLUMN status SET DEFAULT 'teaser'::public.project_status;

-- Audit actions required by E4 contract
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'project.visibility_changed';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'project.creation_blocked_no_nda';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'project.created_from_nda';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'project.stage_changed';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'project.stage_rollback';
