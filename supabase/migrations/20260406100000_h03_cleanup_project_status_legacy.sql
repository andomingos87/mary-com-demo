-- H0.3 cleanup: remove legacy values from project_status operational type
-- and keep only canonical 14 status values in the enum used by projects.status.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'project_status_legacy'
  ) THEN
    EXECUTE 'ALTER TYPE public.project_status RENAME TO project_status_legacy';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'project_status'
  ) THEN
    EXECUTE $enum$
      CREATE TYPE public.project_status AS ENUM (
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
    $enum$;
  END IF;
END $$;

DROP TRIGGER IF EXISTS revoke_vdr_on_project_close ON public.projects;

ALTER TABLE public.projects
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.projects
  ALTER COLUMN status TYPE public.project_status
  USING (
    CASE status::text
      WHEN 'draft' THEN 'screening'
      WHEN 'active' THEN 'nda'
      WHEN 'paused' THEN 'nda'
      WHEN 'closed' THEN 'dd_spa'
      WHEN 'archived' THEN 'closed_lost'
      WHEN 'spa' THEN 'dd_spa'
      ELSE status::text
    END
  )::public.project_status;

ALTER TABLE public.projects
  ALTER COLUMN status SET DEFAULT 'screening'::public.project_status;

-- Keep write contract explicit on canonical statuses
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_h03_check;

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

-- Technical migration audit event for traceability
INSERT INTO public.audit_logs (action, metadata)
VALUES (
  'project.updated',
  jsonb_build_object(
    'event', 'pipeline.migration_5_to_12_cleanup',
    'source_type', 'project_status_legacy',
    'target_type', 'project_status',
    'mapped_legacy_values', jsonb_build_array('draft', 'active', 'paused', 'closed', 'archived', 'spa'),
    'executed_at', NOW()
  )
);

-- Update compatibility trigger function to canonical default
CREATE OR REPLACE FUNCTION public.sync_projects_legacy_compat()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
begin
  if new.organization_id is null and new.asset_org_id is not null then
    new.organization_id := new.asset_org_id;
  end if;
  if new.asset_org_id is null and new.organization_id is not null then
    new.asset_org_id := new.organization_id;
  end if;

  if new.name is null then
    new.name := coalesce(new.codename, 'projeto');
  end if;
  if new.objective is null then
    new.objective := 'sale'::public.project_objective;
  end if;
  if new.status is null then
    new.status := 'screening'::public.project_status;
  end if;

  return new;
end;
$function$;

-- Recreate close trigger with canonical terminal statuses
CREATE OR REPLACE FUNCTION public.revoke_vdr_access_on_project_close()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.status IN ('closed_won', 'closed_lost')
     AND (OLD.status IS NULL OR OLD.status NOT IN ('closed_won', 'closed_lost')) THEN
    UPDATE public.vdr_access_permissions
    SET
      revoked_at = NOW(),
      revoked_by = COALESCE(NEW.updated_by, auth.uid())
    WHERE
      project_id = NEW.id
      AND revoked_at IS NULL;

    UPDATE public.vdr_shared_links
    SET
      is_active = false,
      revoked_at = NOW(),
      revoked_by = COALESCE(NEW.updated_by, auth.uid())
    WHERE
      project_id = NEW.id
      AND is_active = true;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER revoke_vdr_on_project_close
AFTER UPDATE ON public.projects
FOR EACH ROW
WHEN (
  NEW.status IN ('closed_won'::public.project_status, 'closed_lost'::public.project_status)
  AND OLD.status IS DISTINCT FROM NEW.status
)
EXECUTE FUNCTION public.revoke_vdr_access_on_project_close();

-- Rebind RPC return type to the canonical project_status type
DROP FUNCTION IF EXISTS public.get_user_projects(uuid);

CREATE OR REPLACE FUNCTION public.get_user_projects(p_user_id uuid)
RETURNS TABLE(
  project_id uuid,
  codename text,
  objective project_objective,
  status project_status,
  organization_id uuid,
  access_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS project_id,
    p.codename,
    p.objective,
    p.status,
    p.organization_id,
    CASE
      WHEN om.role IN ('owner', 'admin') THEN 'org_admin'
      WHEN pm.role IS NOT NULL THEN pm.role::TEXT
      ELSE 'none'
    END AS access_type
  FROM projects p
  JOIN organization_members om ON om.organization_id = p.organization_id AND om.user_id = p_user_id
  LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = p_user_id
  WHERE p.deleted_at IS NULL
    AND (
      om.role IN ('owner', 'admin')
      OR pm.user_id IS NOT NULL
      OR p.visibility = 'public'
    );
END;
$function$;

DROP TYPE IF EXISTS public.project_status_legacy;
