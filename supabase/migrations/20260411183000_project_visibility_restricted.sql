-- Terceiro modo de visibilidade: Restrito (convite a investidores, fora do Radar geral).
-- Privado / Restrito não entram no Radar; apenas 'public' (Radar Mary).

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_visibility_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_visibility_check
  CHECK (visibility = ANY (ARRAY['public'::text, 'private'::text, 'restricted'::text]));
