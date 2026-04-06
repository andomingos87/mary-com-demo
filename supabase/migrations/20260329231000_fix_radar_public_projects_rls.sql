-- =====================================================
-- Fix: Radar investor visibility for public projects
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'projects'
      AND policyname = 'Investors can view public projects in radar'
  ) THEN
    CREATE POLICY "Investors can view public projects in radar"
      ON public.projects
      FOR SELECT
      USING (
        deleted_at IS NULL
        AND visibility = 'public'
        AND EXISTS (
          SELECT 1
          FROM public.organization_members om
          JOIN public.organizations o ON o.id = om.organization_id
          WHERE om.user_id = auth.uid()
            AND o.deleted_at IS NULL
            AND o.profile_type = 'investor'
        )
      );
  END IF;
END $$;
