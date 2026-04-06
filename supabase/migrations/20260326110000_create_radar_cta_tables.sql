-- =====================================================
-- GAP H2.2 - Radar CTAs (follow + NDA request)
-- =====================================================

CREATE TABLE public.investor_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.investor_follows IS 'Follow/favoritos do investidor no Radar.';

CREATE UNIQUE INDEX ux_investor_follows_unique_active
  ON public.investor_follows (investor_organization_id, project_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_investor_follows_investor_project
  ON public.investor_follows (investor_organization_id, project_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_investor_follows_asset_org
  ON public.investor_follows (asset_organization_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trigger_investor_follows_updated_at
  BEFORE UPDATE ON public.investor_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.investor_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investor members can view their follows"
  ON public.investor_follows
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND public.is_org_member(auth.uid(), investor_organization_id)
  );

CREATE POLICY "Investor members can create follows"
  ON public.investor_follows
  FOR INSERT
  WITH CHECK (
    deleted_at IS NULL
    AND created_by = auth.uid()
    AND public.is_org_member(auth.uid(), investor_organization_id)
  );

CREATE POLICY "Investor members can update follows"
  ON public.investor_follows
  FOR UPDATE
  USING (
    deleted_at IS NULL
    AND public.is_org_member(auth.uid(), investor_organization_id)
  )
  WITH CHECK (
    public.is_org_member(auth.uid(), investor_organization_id)
  );

-- =====================================================
-- NDA requests
-- =====================================================

CREATE TABLE public.nda_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  thesis_id UUID REFERENCES public.investment_theses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.nda_requests IS 'Solicitações de NDA iniciadas no Radar por investidores.';

CREATE UNIQUE INDEX ux_nda_requests_unique_active
  ON public.nda_requests (investor_organization_id, project_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_nda_requests_investor_status
  ON public.nda_requests (investor_organization_id, status, requested_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_nda_requests_asset_status
  ON public.nda_requests (asset_organization_id, status, requested_at DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trigger_nda_requests_updated_at
  BEFORE UPDATE ON public.nda_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.nda_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view NDA requests for investor or asset org"
  ON public.nda_requests
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      public.is_org_member(auth.uid(), investor_organization_id)
      OR public.is_org_member(auth.uid(), asset_organization_id)
    )
  );

CREATE POLICY "Investor members can create NDA requests"
  ON public.nda_requests
  FOR INSERT
  WITH CHECK (
    deleted_at IS NULL
    AND requested_by = auth.uid()
    AND public.is_org_member(auth.uid(), investor_organization_id)
  );

CREATE POLICY "Investor members can update their NDA requests"
  ON public.nda_requests
  FOR UPDATE
  USING (
    deleted_at IS NULL
    AND public.is_org_member(auth.uid(), investor_organization_id)
  )
  WITH CHECK (
    public.is_org_member(auth.uid(), investor_organization_id)
  );

CREATE POLICY "Asset owners/admins can review NDA requests"
  ON public.nda_requests
  FOR UPDATE
  USING (
    deleted_at IS NULL
    AND public.has_org_permission(
      auth.uid(),
      asset_organization_id,
      ARRAY['owner', 'admin']::public.member_role[]
    )
  )
  WITH CHECK (
    public.has_org_permission(
      auth.uid(),
      asset_organization_id,
      ARRAY['owner', 'admin']::public.member_role[]
    )
  );
