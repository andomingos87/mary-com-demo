-- =====================================================
-- Fix RLS for Radar Follow soft-delete (Option A)
-- =====================================================
-- Context:
-- "Desseguir" performs UPDATE setting deleted_at + updated_by.
-- We keep a single UPDATE policy and make soft-delete intent explicit.

DROP POLICY IF EXISTS "Investor members can update follows" ON public.investor_follows;

CREATE POLICY "Investor members can update follows"
  ON public.investor_follows
  FOR UPDATE
  USING (
    deleted_at IS NULL
    AND public.is_org_member(auth.uid(), investor_organization_id)
  )
  WITH CHECK (
    public.is_org_member(auth.uid(), investor_organization_id)
    AND (
      deleted_at IS NULL
      OR updated_by = auth.uid()
    )
  );
