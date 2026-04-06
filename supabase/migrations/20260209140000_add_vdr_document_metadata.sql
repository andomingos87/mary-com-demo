-- =====================================================
-- VDR Document Metadata Enhancement
-- =====================================================
-- Adds new columns to vdr_documents and vdr_folders for:
-- - Visual code (EST-01, COM-02, etc.)
-- - Priority, status, risk classification
-- - Responsible assignment and due dates
-- - Tags and flags
-- - N1/N2/N3 validation system
-- - Multiple files and links per document
-- =====================================================

-- =====================================================
-- PART 1: Add columns to vdr_folders
-- =====================================================

-- Add code column to vdr_folders (e.g., EST, COM, FIN)
ALTER TABLE public.vdr_folders
  ADD COLUMN IF NOT EXISTS code VARCHAR(10);

-- Update existing default folders with codes
UPDATE public.vdr_folders SET code = 'FIN' WHERE slug = 'financeiro' AND code IS NULL;
UPDATE public.vdr_folders SET code = 'JUR' WHERE slug = 'juridico' AND code IS NULL;
UPDATE public.vdr_folders SET code = 'OPE' WHERE slug = 'operacional' AND code IS NULL;
UPDATE public.vdr_folders SET code = 'COM' WHERE slug = 'comercial' AND code IS NULL;
UPDATE public.vdr_folders SET code = 'RH' WHERE slug = 'rh' AND code IS NULL;
UPDATE public.vdr_folders SET code = 'OUT' WHERE slug = 'outros' AND code IS NULL;

-- =====================================================
-- PART 2: Add columns to vdr_documents
-- =====================================================

-- Visual code (EST-01, COM-02, etc.)
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS code VARCHAR(20);

-- Priority: critical, high, medium, low
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium';

-- Business Unit
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS business_unit VARCHAR(50);

-- Responsible user
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS responsible_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Start and due dates
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Risk: high, medium, low
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS risk VARCHAR(10);

-- Tags and flags as arrays
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS flags TEXT[] DEFAULT '{}';

-- N1 Validation (Asset level)
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS validation_n1 BOOLEAN DEFAULT false;

ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS validation_n1_at TIMESTAMPTZ;

ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS validation_n1_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- N2 Validation (Advisor level)
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS validation_n2 BOOLEAN DEFAULT false;

ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS validation_n2_at TIMESTAMPTZ;

ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS validation_n2_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- N3 Validation (Investor level)
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS validation_n3 BOOLEAN DEFAULT false;

ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS validation_n3_at TIMESTAMPTZ;

ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS validation_n3_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Sort order within folder
ALTER TABLE public.vdr_documents
  ADD COLUMN IF NOT EXISTS sort_order SMALLINT DEFAULT 0;

-- =====================================================
-- PART 3: Create vdr_document_files table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.vdr_document_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.vdr_documents(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(2048) NOT NULL,
  file_type VARCHAR(50),
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for document files
CREATE INDEX IF NOT EXISTS idx_vdr_document_files_document 
  ON public.vdr_document_files(document_id);

-- =====================================================
-- PART 4: Create vdr_document_links table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.vdr_document_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.vdr_documents(id) ON DELETE CASCADE,
  url VARCHAR(2048) NOT NULL,
  label VARCHAR(255),
  link_type VARCHAR(50) DEFAULT 'generic', -- linkedin, drive, dropbox, onedrive, generic
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for document links
CREATE INDEX IF NOT EXISTS idx_vdr_document_links_document 
  ON public.vdr_document_links(document_id);

-- =====================================================
-- PART 5: Indexes for new columns
-- =====================================================

-- Priority index
CREATE INDEX IF NOT EXISTS idx_vdr_docs_priority 
  ON public.vdr_documents(priority);

-- Status index (already exists but ensure it's there)
CREATE INDEX IF NOT EXISTS idx_vdr_docs_status 
  ON public.vdr_documents(status);

-- Risk index
CREATE INDEX IF NOT EXISTS idx_vdr_docs_risk 
  ON public.vdr_documents(risk) WHERE risk IS NOT NULL;

-- Responsible index
CREATE INDEX IF NOT EXISTS idx_vdr_docs_responsible 
  ON public.vdr_documents(responsible_id) WHERE responsible_id IS NOT NULL;

-- Due date index
CREATE INDEX IF NOT EXISTS idx_vdr_docs_due_date 
  ON public.vdr_documents(due_date) WHERE due_date IS NOT NULL;

-- Tags GIN index for array search
CREATE INDEX IF NOT EXISTS idx_vdr_docs_tags 
  ON public.vdr_documents USING GIN (tags);

-- Sort order index
CREATE INDEX IF NOT EXISTS idx_vdr_docs_sort_order 
  ON public.vdr_documents(folder_id, sort_order);

-- Code index for searching by code
CREATE INDEX IF NOT EXISTS idx_vdr_docs_code 
  ON public.vdr_documents(code) WHERE code IS NOT NULL;

-- =====================================================
-- PART 6: RLS for new tables
-- =====================================================

-- Enable RLS
ALTER TABLE public.vdr_document_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vdr_document_links ENABLE ROW LEVEL SECURITY;

-- vdr_document_files policies
-- SELECT: Users with VDR access can view files
CREATE POLICY "vdr_document_files_select" ON public.vdr_document_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vdr_documents d
      WHERE d.id = document_id
        AND public.has_vdr_access(auth.uid(), d.project_id, d.id)
    )
  );

-- INSERT: Managers can add files
CREATE POLICY "vdr_document_files_insert" ON public.vdr_document_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vdr_documents d
      WHERE d.id = document_id
        AND public.can_manage_vdr(auth.uid(), d.project_id)
    )
  );

-- UPDATE: Managers can update files
CREATE POLICY "vdr_document_files_update" ON public.vdr_document_files
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.vdr_documents d
      WHERE d.id = document_id
        AND public.can_manage_vdr(auth.uid(), d.project_id)
    )
  );

-- DELETE: Managers can delete files
CREATE POLICY "vdr_document_files_delete" ON public.vdr_document_files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.vdr_documents d
      WHERE d.id = document_id
        AND public.can_manage_vdr(auth.uid(), d.project_id)
    )
  );

-- vdr_document_links policies
-- SELECT: Users with VDR access can view links
CREATE POLICY "vdr_document_links_select" ON public.vdr_document_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vdr_documents d
      WHERE d.id = document_id
        AND public.has_vdr_access(auth.uid(), d.project_id, d.id)
    )
  );

-- INSERT: Managers can add links
CREATE POLICY "vdr_document_links_insert" ON public.vdr_document_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vdr_documents d
      WHERE d.id = document_id
        AND public.can_manage_vdr(auth.uid(), d.project_id)
    )
  );

-- UPDATE: Managers can update links
CREATE POLICY "vdr_document_links_update" ON public.vdr_document_links
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.vdr_documents d
      WHERE d.id = document_id
        AND public.can_manage_vdr(auth.uid(), d.project_id)
    )
  );

-- DELETE: Managers can delete links
CREATE POLICY "vdr_document_links_delete" ON public.vdr_document_links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.vdr_documents d
      WHERE d.id = document_id
        AND public.can_manage_vdr(auth.uid(), d.project_id)
    )
  );

-- =====================================================
-- PART 7: Add new default folders (Estratégia, Tecnologia)
-- =====================================================

-- Insert Estratégia and Tecnologia folders for all existing projects
INSERT INTO public.vdr_folders (project_id, name, slug, code, icon, sort_order, is_default)
SELECT p.id, d.name, d.slug, d.code, d.icon, d.sort_order, true
FROM public.projects p
CROSS JOIN (VALUES
  ('Estratégia', 'estrategia', 'EST', 'target', 0),
  ('Tecnologia', 'tecnologia', 'TEC', 'cpu', 5)
) AS d(name, slug, code, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.vdr_folders vf
  WHERE vf.project_id = p.id AND vf.slug = d.slug
);

-- Update sort order to make Estratégia first
UPDATE public.vdr_folders SET sort_order = 0 WHERE slug = 'estrategia';
UPDATE public.vdr_folders SET sort_order = 1 WHERE slug = 'comercial';
UPDATE public.vdr_folders SET sort_order = 2 WHERE slug = 'financeiro';
UPDATE public.vdr_folders SET sort_order = 3 WHERE slug = 'operacional';
UPDATE public.vdr_folders SET sort_order = 4 WHERE slug = 'tecnologia';
UPDATE public.vdr_folders SET sort_order = 5 WHERE slug = 'rh';
UPDATE public.vdr_folders SET sort_order = 6 WHERE slug = 'juridico';
UPDATE public.vdr_folders SET sort_order = 7 WHERE slug = 'outros';

-- =====================================================
-- PART 8: Validation function
-- =====================================================

-- Function to validate a document at a specific level
-- Returns true if validation was successful, false otherwise
CREATE OR REPLACE FUNCTION public.validate_vdr_document(
  p_document_id UUID,
  p_level TEXT, -- 'n1', 'n2', 'n3'
  p_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_project_id UUID;
  v_user_org_id UUID;
  v_project_org_id UUID;
  v_user_profile VARCHAR(20);
  v_can_validate BOOLEAN := false;
BEGIN
  -- Get the user ID
  v_user_id := COALESCE(p_user_id, auth.uid());
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get project ID for the document
  SELECT project_id INTO v_project_id
  FROM public.vdr_documents
  WHERE id = p_document_id;
  
  IF v_project_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get user's primary organization and profile type
  SELECT om.organization_id, o.profile_type
  INTO v_user_org_id, v_user_profile
  FROM public.organization_members om
  JOIN public.organizations o ON o.id = om.organization_id
  WHERE om.user_id = v_user_id
  LIMIT 1;

  -- Get project's organization
  SELECT organization_id INTO v_project_org_id
  FROM public.projects
  WHERE id = v_project_id;

  -- Check validation permission based on level
  IF p_level = 'n1' THEN
    -- N1: User must be member of the project's organization (asset)
    v_can_validate := EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = v_user_id
        AND om.organization_id = v_project_org_id
    );
  ELSIF p_level = 'n2' THEN
    -- N2: User must be an advisor with access to the project
    v_can_validate := v_user_profile = 'advisor' AND EXISTS (
      SELECT 1 FROM public.advisor_project_assignments apa
      JOIN public.organization_members om ON om.id = apa.advisor_member_id
      WHERE om.user_id = v_user_id
        AND apa.project_id = v_project_id
    );
  ELSIF p_level = 'n3' THEN
    -- N3: User must be an investor with VDR access
    v_can_validate := v_user_profile = 'investor' AND 
      public.has_vdr_access(v_user_id, v_project_id, p_document_id);
  END IF;

  IF NOT v_can_validate THEN
    RETURN false;
  END IF;

  -- Perform the validation update
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
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to remove validation from a document
CREATE OR REPLACE FUNCTION public.unvalidate_vdr_document(
  p_document_id UUID,
  p_level TEXT, -- 'n1', 'n2', 'n3'
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

  -- Get project ID for the document
  SELECT project_id INTO v_project_id
  FROM public.vdr_documents
  WHERE id = p_document_id;
  
  IF v_project_id IS NULL THEN
    RETURN false;
  END IF;

  -- Only managers can remove validation
  IF NOT public.can_manage_vdr(v_user_id, v_project_id) THEN
    RETURN false;
  END IF;

  -- Remove the validation
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
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =====================================================
-- PART 9: Helper function to generate next document code
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_vdr_document_code(
  p_folder_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_folder_code VARCHAR(10);
  v_next_number INTEGER;
  v_new_code TEXT;
BEGIN
  -- Get folder code
  SELECT code INTO v_folder_code
  FROM public.vdr_folders
  WHERE id = p_folder_id;

  IF v_folder_code IS NULL THEN
    v_folder_code := 'DOC';
  END IF;

  -- Get next number for this folder
  SELECT COALESCE(MAX(
    CASE 
      WHEN code ~ ('^' || v_folder_code || '-[0-9]+$')
      THEN CAST(SUBSTRING(code FROM v_folder_code || '-([0-9]+)$') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1 INTO v_next_number
  FROM public.vdr_documents
  WHERE folder_id = p_folder_id;

  -- Format as CODE-XX (e.g., EST-01, COM-02)
  v_new_code := v_folder_code || '-' || LPAD(v_next_number::TEXT, 2, '0');

  RETURN v_new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =====================================================
-- End of VDR Document Metadata Enhancement Migration
-- =====================================================
