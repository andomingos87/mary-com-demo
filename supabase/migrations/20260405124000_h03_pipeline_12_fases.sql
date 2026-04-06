-- H0.3: expand project pipeline from 5 to 12 phases (+2 exits)
-- Important: ALTER TYPE ... ADD VALUE should run as independent statements in Postgres.

ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'screening';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'cim_dfs';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'ioi';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'management_meetings';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'dd_spa';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'signing';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'cps';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'closing';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'disclosure';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'closed_won';

-- Rename semantic stage usage in data
UPDATE public.projects
SET status = 'dd_spa'::public.project_status
WHERE status::text = 'spa';

-- Expand write contract to the new canonical statuses
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_e4_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_h03_check
  CHECK (
    status::text IN (
      'screening',
      'teaser',
      'nda',
      'cim_dfs',
      'ioi',
      'management_meetings',
      'nbo',
      'dd_spa',
      'signing',
      'cps',
      'closing',
      'disclosure',
      'closed_won',
      'closed_lost'
    )
  );

ALTER TABLE public.projects
  ALTER COLUMN status SET DEFAULT 'screening'::public.project_status;
