-- =====================================================
-- GAP H2.1 - Investment Theses CRUD (Investor)
-- =====================================================

CREATE TABLE public.investment_theses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  summary TEXT,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.investment_theses IS 'Teses de investimento por organização investor.';
COMMENT ON COLUMN public.investment_theses.criteria IS 'Critérios de matching para Radar (MVP em JSONB).';

-- Regra de negócio: no máximo uma tese ativa por organização (desconsidera soft-deleted)
CREATE UNIQUE INDEX ux_investment_theses_one_active_per_org
  ON public.investment_theses (organization_id)
  WHERE is_active = true AND deleted_at IS NULL;

-- Índices de leitura
CREATE INDEX idx_investment_theses_org_active_updated
  ON public.investment_theses (organization_id, is_active, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_investment_theses_org_deleted
  ON public.investment_theses (organization_id, deleted_at);

-- Trigger updated_at (função já existente no schema base)
CREATE TRIGGER trigger_investment_theses_updated_at
  BEFORE UPDATE ON public.investment_theses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS Policies
-- =====================================================
ALTER TABLE public.investment_theses ENABLE ROW LEVEL SECURITY;

-- SELECT: membro da organização e registro não deletado
CREATE POLICY "Members can view investment theses from their org"
  ON public.investment_theses
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND public.is_org_member(auth.uid(), organization_id)
  );

-- INSERT: membro da organização, com created_by do usuário autenticado
CREATE POLICY "Members can create investment theses in their org"
  ON public.investment_theses
  FOR INSERT
  WITH CHECK (
    deleted_at IS NULL
    AND created_by = auth.uid()
    AND public.is_org_member(auth.uid(), organization_id)
  );

-- UPDATE: membro da organização
CREATE POLICY "Members can update investment theses from their org"
  ON public.investment_theses
  FOR UPDATE
  USING (
    deleted_at IS NULL
    AND public.is_org_member(auth.uid(), organization_id)
  )
  WITH CHECK (
    deleted_at IS NULL
    AND public.is_org_member(auth.uid(), organization_id)
  );

-- DELETE físico é restrito a owner/admin; fluxo de app deve usar soft delete (UPDATE deleted_at)
CREATE POLICY "Owners and admins can delete investment theses"
  ON public.investment_theses
  FOR DELETE
  USING (
    public.has_org_permission(
      auth.uid(),
      organization_id,
      ARRAY['owner', 'admin']::public.member_role[]
    )
  );
