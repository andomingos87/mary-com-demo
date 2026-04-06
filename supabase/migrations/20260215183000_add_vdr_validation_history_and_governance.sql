-- =====================================================
-- VDR Fase 2 - Validation History + Governance Alignment
-- =====================================================

CREATE TABLE IF NOT EXISTS public.vdr_document_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.vdr_documents(id) ON DELETE CASCADE,
  validation_level TEXT NOT NULL CHECK (validation_level IN ('N1', 'N2', 'N3')),
  approved BOOLEAN NOT NULL DEFAULT true,
  validated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  content_hash TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vdr_doc_validations_project_time
  ON public.vdr_document_validations(project_id, validated_at DESC);

CREATE INDEX IF NOT EXISTS vdr_doc_validations_document_time
  ON public.vdr_document_validations(document_id, validated_at DESC);

CREATE INDEX IF NOT EXISTS vdr_doc_validations_level
  ON public.vdr_document_validations(validation_level);

ALTER TABLE public.vdr_document_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vdr_document_validations_select" ON public.vdr_document_validations
  FOR SELECT USING (
    public.has_vdr_access(auth.uid(), project_id, document_id)
    OR public.can_manage_vdr(auth.uid(), project_id)
  );

CREATE OR REPLACE FUNCTION public.log_vdr_document_validation(
  p_document_id UUID,
  p_level TEXT,
  p_approved BOOLEAN DEFAULT true,
  p_note TEXT DEFAULT NULL,
  p_content_hash TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_project_id UUID;
  v_user_id UUID;
  v_user_org_id UUID;
  v_project_org_id UUID;
  v_user_profile TEXT;
  v_user_role public.member_role;
  v_row_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT d.project_id INTO v_project_id
  FROM public.vdr_documents d
  WHERE d.id = p_document_id;

  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Documento não encontrado';
  END IF;

  SELECT p.organization_id INTO v_project_org_id
  FROM public.projects p
  WHERE p.id = v_project_id;

  SELECT om.organization_id, om.role, o.profile_type
  INTO v_user_org_id, v_user_role, v_user_profile
  FROM public.organization_members om
  JOIN public.organizations o ON o.id = om.organization_id
  WHERE om.user_id = v_user_id
  LIMIT 1;

  IF UPPER(p_level) = 'N1' THEN
    IF v_user_profile != 'asset' OR v_user_org_id IS DISTINCT FROM v_project_org_id THEN
      RAISE EXCEPTION 'Sem permissão para validar N1';
    END IF;
  ELSIF UPPER(p_level) = 'N2' THEN
    IF v_user_profile != 'advisor' OR NOT EXISTS (
      SELECT 1
      FROM public.advisor_project_assignments apa
      JOIN public.organization_members om ON om.id = apa.advisor_member_id
      WHERE om.user_id = v_user_id
        AND apa.project_id = v_project_id
    ) THEN
      RAISE EXCEPTION 'Sem permissão para validar N2';
    END IF;
  ELSIF UPPER(p_level) = 'N3' THEN
    IF v_user_role NOT IN ('owner', 'admin') OR v_user_org_id IS DISTINCT FROM v_project_org_id THEN
      RAISE EXCEPTION 'Sem permissão para validar N3';
    END IF;
  ELSE
    RAISE EXCEPTION 'Nível inválido';
  END IF;

  INSERT INTO public.vdr_document_validations (
    project_id,
    document_id,
    validation_level,
    approved,
    validated_by,
    content_hash,
    source,
    metadata
  ) VALUES (
    v_project_id,
    p_document_id,
    UPPER(p_level),
    p_approved,
    v_user_id,
    p_content_hash,
    'manual',
    jsonb_build_object('note', p_note)
  )
  RETURNING id INTO v_row_id;

  RETURN v_row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.validate_vdr_document(
  p_document_id UUID,
  p_level TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_hash TEXT;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Keep metadata chain in vdr_documents for fast UI rendering
  IF p_level = 'n1' THEN
    UPDATE public.vdr_documents
    SET validation_n1 = true,
        validation_n1_at = now(),
        validation_n1_by = v_user_id,
        updated_at = now()
    WHERE id = p_document_id;
  ELSIF p_level = 'n2' THEN
    UPDATE public.vdr_documents
    SET validation_n2 = true,
        validation_n2_at = now(),
        validation_n2_by = v_user_id,
        updated_at = now()
    WHERE id = p_document_id;
  ELSIF p_level = 'n3' THEN
    UPDATE public.vdr_documents
    SET validation_n3 = true,
        validation_n3_at = now(),
        validation_n3_by = v_user_id,
        updated_at = now()
    WHERE id = p_document_id;
  ELSE
    RETURN false;
  END IF;

  -- Hash simplificado para trilha (fase 2)
  SELECT encode(digest(coalesce(name, '') || '|' || coalesce(external_url, ''), 'sha256'), 'hex')
  INTO v_hash
  FROM public.vdr_documents
  WHERE id = p_document_id;

  PERFORM public.log_vdr_document_validation(
    p_document_id,
    UPPER(p_level),
    true,
    NULL,
    v_hash
  );

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.unvalidate_vdr_document(
  p_document_id UUID,
  p_level TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_project_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT project_id INTO v_project_id
  FROM public.vdr_documents
  WHERE id = p_document_id;

  IF v_project_id IS NULL OR NOT public.can_manage_vdr(v_user_id, v_project_id) THEN
    RETURN false;
  END IF;

  IF p_level = 'n1' THEN
    UPDATE public.vdr_documents
    SET validation_n1 = false,
        validation_n1_at = NULL,
        validation_n1_by = NULL,
        updated_at = now()
    WHERE id = p_document_id;
  ELSIF p_level = 'n2' THEN
    UPDATE public.vdr_documents
    SET validation_n2 = false,
        validation_n2_at = NULL,
        validation_n2_by = NULL,
        updated_at = now()
    WHERE id = p_document_id;
  ELSIF p_level = 'n3' THEN
    UPDATE public.vdr_documents
    SET validation_n3 = false,
        validation_n3_at = NULL,
        validation_n3_by = NULL,
        updated_at = now()
    WHERE id = p_document_id;
  ELSE
    RETURN false;
  END IF;

  PERFORM public.log_vdr_document_validation(
    p_document_id,
    UPPER(p_level),
    false,
    NULL,
    NULL
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
