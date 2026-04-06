-- =====================================================
-- Optimize VDR engagement aggregation by investor
-- =====================================================
-- Moves aggregation to the database to avoid loading
-- unbounded vdr_access_logs rows in application memory.

CREATE OR REPLACE FUNCTION public.get_vdr_engagement_by_investor(
  p_project_id UUID
) RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  organization_slug TEXT,
  total_views BIGINT,
  total_duration_seconds BIGINT,
  unique_documents BIGINT,
  last_access_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Cross-organization engagement metrics are manager-only.
  IF auth.uid() IS NULL OR NOT public.can_manage_vdr(auth.uid(), p_project_id) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    l.organization_id,
    o.name::TEXT AS organization_name,
    o.slug::TEXT AS organization_slug,
    COUNT(*) FILTER (WHERE l.action = 'view_start')::BIGINT AS total_views,
    COALESCE(SUM(l.duration_seconds), 0)::BIGINT AS total_duration_seconds,
    COUNT(DISTINCT l.document_id)::BIGINT AS unique_documents,
    MAX(l.started_at) AS last_access_at
  FROM public.vdr_access_logs l
  JOIN public.organizations o ON o.id = l.organization_id
  WHERE l.project_id = p_project_id
    AND l.organization_id IS NOT NULL
  GROUP BY l.organization_id, o.name, o.slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Helps grouped scans by project and investor organization.
CREATE INDEX IF NOT EXISTS vdr_access_logs_project_org_started_at
  ON public.vdr_access_logs(project_id, organization_id, started_at DESC)
  WHERE organization_id IS NOT NULL;
