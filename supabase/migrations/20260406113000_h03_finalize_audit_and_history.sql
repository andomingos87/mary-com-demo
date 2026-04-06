-- H0.3 finalization: explicit migration audit event + legacy status interpretation helper.

CREATE OR REPLACE FUNCTION public.map_legacy_project_status_for_history(p_status text)
RETURNS public.project_status
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT CASE
    WHEN p_status = 'spa' THEN 'dd_spa'::public.project_status
    ELSE p_status::public.project_status
  END
$function$;

COMMENT ON FUNCTION public.map_legacy_project_status_for_history(text)
IS 'Normaliza status legado para leitura histórica do pipeline H0.3 (spa -> dd_spa).';

INSERT INTO public.audit_logs (action, metadata)
SELECT
  'project.updated',
  jsonb_build_object(
    'event', 'pipeline.migration_5_to_12',
    'source', 'h03_finalize_audit_and_history',
    'legacy_mapping', jsonb_build_object('spa', 'dd_spa'),
    'helper_function', 'map_legacy_project_status_for_history',
    'executed_at', NOW()
  )
WHERE NOT EXISTS (
  SELECT 1
  FROM public.audit_logs
  WHERE metadata->>'event' = 'pipeline.migration_5_to_12'
);
