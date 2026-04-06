-- Temporary MVP table for 3-level epic validation flow
CREATE TABLE IF NOT EXISTS public.epic_validation_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id text NOT NULL,
  epic_title text NOT NULL,
  user_name text NOT NULL CHECK (user_name IN ('Anderson', 'Cassio', 'Leonardo')),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  general_comment text,
  final_status text NOT NULL DEFAULT 'Pendencias' CHECK (final_status IN ('Aprovado', 'Reprovado', 'Pendencias')),
  final_comment text,
  pendencias text,
  progress_percent integer NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (epic_id, user_name)
);

ALTER TABLE public.epic_validation_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "epic_validation_responses_select_all" ON public.epic_validation_responses;
CREATE POLICY "epic_validation_responses_select_all"
  ON public.epic_validation_responses
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "epic_validation_responses_insert_all" ON public.epic_validation_responses;
CREATE POLICY "epic_validation_responses_insert_all"
  ON public.epic_validation_responses
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "epic_validation_responses_update_all" ON public.epic_validation_responses;
CREATE POLICY "epic_validation_responses_update_all"
  ON public.epic_validation_responses
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
