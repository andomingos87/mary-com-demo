-- Enable RLS on audit_logs to prevent anon/authenticated writes
-- Only service role (used server-side) can INSERT; RLS blocks anon/auth by default
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- No INSERT policy for anon/authenticated - they cannot write
-- Service role bypasses RLS, so server-side audit writes via createAdminClient continue to work

-- Optional: allow org admins to SELECT their org's audit logs (for compliance dashboards)
-- For now we keep SELECT restricted; add later if needed:
-- CREATE POLICY "org_admins_select_audit" ON public.audit_logs
--   FOR SELECT USING (
--     organization_id IN (
--       SELECT organization_id FROM organization_members
--       WHERE user_id = auth.uid() AND role IN ('owner','admin')
--     )
--   );
