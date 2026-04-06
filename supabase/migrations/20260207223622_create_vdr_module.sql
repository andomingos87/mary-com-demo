-- =====================================================
-- VDR Module - Consolidated Migration
-- =====================================================
-- Creates all VDR tables, functions, RLS policies, and indexes
-- Part of VDR Fase 0 - Ativação
-- =====================================================

-- =====================================================
-- PART 1: Helper Functions
-- =====================================================

-- Function to check if user is owner/admin of the project's organization
-- Used for DELETE policies (more restrictive than can_manage_vdr)
CREATE OR REPLACE FUNCTION public.is_project_owner_org(
  p_user_id UUID,
  p_project_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members om
    JOIN public.projects p ON p.organization_id = om.organization_id
    WHERE om.user_id = p_user_id
      AND p.id = p_project_id
      AND om.role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =====================================================
-- PART 2: VDR Tables
-- =====================================================

-- Table: vdr_folders
-- Stores folders for organizing documents within a project's VDR
CREATE TABLE IF NOT EXISTS public.vdr_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order SMALLINT DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: vdr_documents
-- Stores document references (external URLs) within VDR folders
CREATE TABLE IF NOT EXISTS public.vdr_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES public.vdr_folders(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  external_url VARCHAR(2048) NOT NULL,
  file_type VARCHAR(50),
  file_size_bytes BIGINT,
  metadata JSONB,
  is_confidential BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Table: vdr_access_permissions
-- Granular access control for VDR by project, folder, or document
CREATE TABLE IF NOT EXISTS public.vdr_access_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.vdr_documents(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.vdr_folders(id) ON DELETE CASCADE,
  grantee_org_id UUID REFERENCES public.organizations(id),
  grantee_user_id UUID REFERENCES auth.users(id),
  permission_type VARCHAR(20) NOT NULL, -- view, download, share
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  CONSTRAINT at_least_one_grantee CHECK (grantee_org_id IS NOT NULL OR grantee_user_id IS NOT NULL)
);

-- Table: vdr_shared_links
-- Shareable links with tokens for external access to documents/folders
CREATE TABLE IF NOT EXISTS public.vdr_shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(64) NOT NULL UNIQUE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.vdr_documents(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.vdr_folders(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  view_count INTEGER DEFAULT 0,
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  metadata JSONB
);

-- Table: vdr_access_logs
-- Immutable audit trail of all VDR actions
CREATE TABLE IF NOT EXISTS public.vdr_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.vdr_documents(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES public.vdr_folders(id) ON DELETE SET NULL,
  shared_link_id UUID REFERENCES public.vdr_shared_links(id) ON DELETE SET NULL,
  session_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- view_start, view_end, download, print_attempt
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB
);

-- Table: vdr_qa_messages
-- Q&A messages linked to documents, with thread support
CREATE TABLE IF NOT EXISTS public.vdr_qa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.vdr_documents(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.vdr_qa_messages(id), -- Self-reference for threads
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_org_id UUID NOT NULL REFERENCES public.organizations(id),
  content TEXT NOT NULL,
  is_confidential BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- PART 3: Indexes
-- =====================================================

-- vdr_folders indexes
CREATE INDEX IF NOT EXISTS vdr_folders_project_sort ON public.vdr_folders(project_id, sort_order);

-- vdr_documents indexes
CREATE INDEX IF NOT EXISTS vdr_documents_project_folder ON public.vdr_documents(project_id, folder_id);
CREATE INDEX IF NOT EXISTS vdr_documents_deleted_at ON public.vdr_documents(deleted_at) WHERE deleted_at IS NULL;

-- vdr_shared_links indexes (token uniqueness is already enforced by UNIQUE constraint)
CREATE INDEX IF NOT EXISTS vdr_shared_links_project ON public.vdr_shared_links(project_id);

-- vdr_access_logs indexes
CREATE INDEX IF NOT EXISTS vdr_access_logs_project_time ON public.vdr_access_logs(project_id, started_at DESC);
CREATE INDEX IF NOT EXISTS vdr_access_logs_session ON public.vdr_access_logs(session_id);

-- vdr_qa_messages indexes
CREATE INDEX IF NOT EXISTS vdr_qa_messages_document ON public.vdr_qa_messages(document_id, parent_id);
CREATE INDEX IF NOT EXISTS vdr_qa_messages_project ON public.vdr_qa_messages(project_id);

-- =====================================================
-- PART 4: Triggers
-- =====================================================

-- updated_at triggers (reusing existing function from organizations_rbac_phase2)
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vdr_folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vdr_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vdr_qa_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PART 5: RPC Functions (SECURITY DEFINER)
-- =====================================================

-- Function: has_vdr_access
-- Checks if a user has access to VDR content (view permission)
-- Access granted if: member of project's org OR sell-side advisor OR explicit permission
CREATE OR REPLACE FUNCTION public.has_vdr_access(
  p_user_id UUID,
  p_project_id UUID,
  p_document_id UUID DEFAULT NULL,
  p_folder_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    -- User is member of the organization that owns the project
    SELECT 1 FROM public.organization_members om
    JOIN public.projects p ON p.organization_id = om.organization_id
    WHERE om.user_id = p_user_id AND p.id = p_project_id
  ) OR EXISTS (
    -- User is a sell-side advisor for this project
    -- Note: Uses advisor_project_assignments with JOIN to organization_members
    SELECT 1 FROM public.advisor_project_assignments apa
    JOIN public.organization_members om ON om.id = apa.advisor_member_id
    WHERE om.user_id = p_user_id
      AND apa.project_id = p_project_id
      AND apa.side = 'sell_side'
  ) OR EXISTS (
    -- User has explicit permission (not revoked, not expired)
    SELECT 1 FROM public.vdr_access_permissions vap
    WHERE vap.project_id = p_project_id
      AND vap.revoked_at IS NULL
      AND (vap.expires_at IS NULL OR vap.expires_at > now())
      AND (
        vap.grantee_user_id = p_user_id
        OR vap.grantee_org_id IN (
          SELECT organization_id FROM public.organization_members 
          WHERE user_id = p_user_id
        )
      )
      AND (p_document_id IS NULL OR vap.document_id IS NULL OR vap.document_id = p_document_id)
      AND (p_folder_id IS NULL OR vap.folder_id IS NULL OR vap.folder_id = p_folder_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: can_manage_vdr
-- Checks if a user can manage VDR content (create, update, grant access)
-- Management allowed if: owner/admin of project's org OR sell-side advisor
CREATE OR REPLACE FUNCTION public.can_manage_vdr(
  p_user_id UUID,
  p_project_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    -- User is owner/admin of the organization that owns the project
    SELECT 1 FROM public.organization_members om
    JOIN public.projects p ON p.organization_id = om.organization_id
    WHERE om.user_id = p_user_id 
      AND p.id = p_project_id
      AND om.role IN ('owner', 'admin')
  ) OR EXISTS (
    -- User is a sell-side advisor for this project
    SELECT 1 FROM public.advisor_project_assignments apa
    JOIN public.organization_members om ON om.id = apa.advisor_member_id
    WHERE om.user_id = p_user_id
      AND apa.project_id = p_project_id
      AND apa.side = 'sell_side'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: log_vdr_access
-- SECURITY DEFINER function to insert access logs (bypasses RLS)
CREATE OR REPLACE FUNCTION public.log_vdr_access(
  p_project_id UUID,
  p_document_id UUID DEFAULT NULL,
  p_folder_id UUID DEFAULT NULL,
  p_shared_link_id UUID DEFAULT NULL,
  p_action TEXT DEFAULT 'view_start',
  p_session_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID;
  v_org_id UUID;
BEGIN
  -- Get current user (may be NULL for public access)
  v_user_id := auth.uid();
  
  -- Get user's organization if authenticated
  IF v_user_id IS NOT NULL THEN
    SELECT organization_id INTO v_org_id
    FROM public.organization_members 
    WHERE user_id = v_user_id 
    LIMIT 1;
  END IF;

  INSERT INTO public.vdr_access_logs (
    project_id, document_id, folder_id, shared_link_id,
    user_id, organization_id, action, session_id,
    ip_address, user_agent, metadata
  ) VALUES (
    p_project_id, p_document_id, p_folder_id, p_shared_link_id,
    v_user_id, v_org_id, p_action, p_session_id,
    p_ip_address, p_user_agent, p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: end_vdr_session
-- SECURITY DEFINER function to end a viewing session
CREATE OR REPLACE FUNCTION public.end_vdr_session(
  p_session_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.vdr_access_logs
  SET 
    ended_at = now(),
    duration_seconds = EXTRACT(EPOCH FROM (now() - started_at))::integer
  WHERE session_id = p_session_id
    AND ended_at IS NULL
    AND action = 'view_start';
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =====================================================
-- PART 6: Row Level Security Policies
-- =====================================================

-- Enable RLS on all VDR tables
ALTER TABLE public.vdr_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vdr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vdr_access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vdr_shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vdr_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vdr_qa_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- vdr_folders Policies
-- =====================================================

-- SELECT: Users with VDR access can view folders
CREATE POLICY "vdr_folders_select" ON public.vdr_folders
  FOR SELECT USING (public.has_vdr_access(auth.uid(), project_id));

-- INSERT: Managers can create folders
CREATE POLICY "vdr_folders_insert" ON public.vdr_folders
  FOR INSERT WITH CHECK (public.can_manage_vdr(auth.uid(), project_id));

-- UPDATE: Managers can update folders
CREATE POLICY "vdr_folders_update" ON public.vdr_folders
  FOR UPDATE USING (public.can_manage_vdr(auth.uid(), project_id));

-- DELETE: Only project owner org admins, and not default folders
CREATE POLICY "vdr_folders_delete" ON public.vdr_folders
  FOR DELETE USING (
    public.is_project_owner_org(auth.uid(), project_id)
    AND is_default IS NOT TRUE
  );

-- =====================================================
-- vdr_documents Policies
-- =====================================================

-- SELECT: Users with VDR access can view active, non-deleted documents
CREATE POLICY "vdr_documents_select" ON public.vdr_documents
  FOR SELECT USING (
    public.has_vdr_access(auth.uid(), project_id, id)
    AND deleted_at IS NULL
    AND (status IS NULL OR status != 'deleted')
  );

-- INSERT: Managers can add documents
CREATE POLICY "vdr_documents_insert" ON public.vdr_documents
  FOR INSERT WITH CHECK (public.can_manage_vdr(auth.uid(), project_id));

-- UPDATE: Managers can update non-deleted documents
CREATE POLICY "vdr_documents_update" ON public.vdr_documents
  FOR UPDATE USING (
    public.can_manage_vdr(auth.uid(), project_id)
    AND deleted_at IS NULL
  );

-- DELETE: Only project owner org admins (soft delete via deleted_at is preferred)
CREATE POLICY "vdr_documents_delete" ON public.vdr_documents
  FOR DELETE USING (public.is_project_owner_org(auth.uid(), project_id));

-- =====================================================
-- vdr_access_permissions Policies
-- =====================================================

-- SELECT: Managers see all; grantees see their own
CREATE POLICY "vdr_access_permissions_select" ON public.vdr_access_permissions
  FOR SELECT USING (
    public.can_manage_vdr(auth.uid(), project_id)
    OR grantee_user_id = auth.uid()
    OR grantee_org_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Managers can grant access
CREATE POLICY "vdr_access_permissions_insert" ON public.vdr_access_permissions
  FOR INSERT WITH CHECK (public.can_manage_vdr(auth.uid(), project_id));

-- UPDATE: Managers can revoke access (update revoked_at)
CREATE POLICY "vdr_access_permissions_update" ON public.vdr_access_permissions
  FOR UPDATE USING (public.can_manage_vdr(auth.uid(), project_id));

-- No DELETE policy - use soft revoke via revoked_at

-- =====================================================
-- vdr_shared_links Policies
-- =====================================================

-- SELECT: Managers see all; creators see their own
CREATE POLICY "vdr_shared_links_select" ON public.vdr_shared_links
  FOR SELECT USING (
    public.can_manage_vdr(auth.uid(), project_id)
    OR created_by = auth.uid()
  );

-- INSERT: Managers can create links
CREATE POLICY "vdr_shared_links_insert" ON public.vdr_shared_links
  FOR INSERT WITH CHECK (public.can_manage_vdr(auth.uid(), project_id));

-- UPDATE: Managers or creators can revoke active links
CREATE POLICY "vdr_shared_links_update" ON public.vdr_shared_links
  FOR UPDATE USING (
    (public.can_manage_vdr(auth.uid(), project_id) OR created_by = auth.uid())
    AND is_active = true
  );

-- No DELETE policy - use soft revoke

-- =====================================================
-- vdr_access_logs Policies
-- =====================================================

-- SELECT: Managers see all logs; users see their own
CREATE POLICY "vdr_access_logs_select" ON public.vdr_access_logs
  FOR SELECT USING (
    public.can_manage_vdr(auth.uid(), project_id)
    OR user_id = auth.uid()
  );

-- INSERT: Controlled via SECURITY DEFINER function (log_vdr_access)
-- Allow all inserts since the function handles authorization
CREATE POLICY "vdr_access_logs_insert" ON public.vdr_access_logs
  FOR INSERT WITH CHECK (true);

-- UPDATE: Controlled via SECURITY DEFINER function (end_vdr_session)
CREATE POLICY "vdr_access_logs_update" ON public.vdr_access_logs
  FOR UPDATE USING (true);

-- No DELETE policy - audit trail is immutable

-- =====================================================
-- vdr_qa_messages Policies
-- =====================================================

-- SELECT: Author sees own; managers see all; others see non-confidential if they have access
CREATE POLICY "vdr_qa_messages_select" ON public.vdr_qa_messages
  FOR SELECT USING (
    author_id = auth.uid()
    OR public.can_manage_vdr(auth.uid(), project_id)
    OR (
      is_confidential IS NOT TRUE
      AND public.has_vdr_access(auth.uid(), project_id, document_id)
    )
  );

-- INSERT: Users with document access can post; confidential only by managers
CREATE POLICY "vdr_qa_messages_insert" ON public.vdr_qa_messages
  FOR INSERT WITH CHECK (
    public.has_vdr_access(auth.uid(), project_id, document_id)
    AND (
      is_confidential IS NOT TRUE
      OR public.can_manage_vdr(auth.uid(), project_id)
    )
  );

-- UPDATE: Author can edit; managers can mark resolved
CREATE POLICY "vdr_qa_messages_update" ON public.vdr_qa_messages
  FOR UPDATE USING (
    author_id = auth.uid()
    OR public.can_manage_vdr(auth.uid(), project_id)
  );

-- DELETE: Author or managers can delete
CREATE POLICY "vdr_qa_messages_delete" ON public.vdr_qa_messages
  FOR DELETE USING (
    author_id = auth.uid()
    OR public.can_manage_vdr(auth.uid(), project_id)
  );

-- =====================================================
-- PART 7: Seed Default Folders for Existing Projects
-- =====================================================

-- Insert default folders for all existing projects that don't have VDR folders yet
INSERT INTO public.vdr_folders (project_id, name, slug, icon, sort_order, is_default)
SELECT p.id, d.name, d.slug, d.icon, d.sort_order, true
FROM public.projects p
CROSS JOIN (VALUES
  ('Financeiro', 'financeiro', 'wallet', 1),
  ('Jurídico', 'juridico', 'scale', 2),
  ('Operacional', 'operacional', 'cog', 3),
  ('Comercial', 'comercial', 'briefcase', 4),
  ('Recursos Humanos', 'rh', 'users', 5),
  ('Outros', 'outros', 'folder', 6)
) AS d(name, slug, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.vdr_folders vf
  WHERE vf.project_id = p.id AND vf.is_default = true
);

-- =====================================================
-- End of VDR Module Migration
-- =====================================================
