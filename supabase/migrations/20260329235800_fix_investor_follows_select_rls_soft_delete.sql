-- =====================================================
-- Fix RLS SELECT visibility after follow soft-delete
-- =====================================================
-- Context:
-- Soft-delete updates deleted_at, and PostgREST can require row visibility
-- after update flow. Keep access scoped by org membership.

DROP POLICY IF EXISTS "Investor members can view their follows" ON public.investor_follows;

CREATE POLICY "Investor members can view their follows"
  ON public.investor_follows
  FOR SELECT
  USING (
    public.is_org_member(auth.uid(), investor_organization_id)
  );
