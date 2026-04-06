-- =====================================================
-- FASE 2: Organizações, Perfis e RBAC
-- Migration: organizations_rbac_phase2
-- =====================================================
-- Este migration cria o schema completo para multi-tenancy
-- com organizações, membros, convites e regras de conflito.
-- =====================================================

-- =====================================================
-- PARTE 1: ENUMs / TYPES
-- =====================================================

-- Profile types (por organização)
-- Define o tipo de perfil que uma organização pode ter
CREATE TYPE public.organization_profile AS ENUM (
    'investor',   -- Investidor (PE, VC, FO, etc.)
    'asset',      -- Empresa/Ativo em processo M&A
    'advisor'     -- Advisor/Consultor
);

COMMENT ON TYPE public.organization_profile IS 'Tipo de perfil de uma organização: investor (investidor), asset (empresa/ativo), advisor (consultor)';

-- Member roles (hierarquia de permissões)
-- Define os papéis possíveis dentro de uma organização
CREATE TYPE public.member_role AS ENUM (
    'owner',      -- Controle total + billing
    'admin',      -- Gestão de membros + configurações
    'member',     -- Funcionalidades operacionais
    'viewer'      -- Apenas visualização
);

COMMENT ON TYPE public.member_role IS 'Papel do membro na organização: owner (controle total), admin (gestão), member (operacional), viewer (somente leitura)';

-- Verification status (se não existir - pode já existir da Fase 1)
DO $$ BEGIN
    CREATE TYPE public.verification_status AS ENUM (
        'pending',    -- Aguardando verificação
        'verified',   -- Verificado e aprovado
        'rejected',   -- Rejeitado (pode apelar)
        'completed'   -- Onboarding completo
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE public.verification_status IS 'Status de verificação: pending, verified, rejected, completed';

-- Advisor side (para regra de conflito)
-- Define de qual lado o advisor está em um projeto
CREATE TYPE public.advisor_side AS ENUM (
    'sell_side',  -- Lado do vendedor/ativo
    'buy_side'    -- Lado do comprador/investidor
);

COMMENT ON TYPE public.advisor_side IS 'Lado do advisor em um projeto M&A: sell_side (vendedor) ou buy_side (comprador)';

-- =====================================================
-- PARTE 2: TABELAS
-- =====================================================

-- Tabela: organizations
-- Representa uma organização/conta na plataforma
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    profile_type public.organization_profile NOT NULL,
    verification_status public.verification_status DEFAULT 'pending' NOT NULL,
    plan TEXT DEFAULT 'free' NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    logo_url TEXT,
    website TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ, -- soft delete
    
    -- Constraints
    CONSTRAINT organizations_name_min_length CHECK (char_length(name) >= 2),
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
    CONSTRAINT organizations_slug_min_length CHECK (char_length(slug) >= 3)
);

COMMENT ON TABLE public.organizations IS 'Organizações/contas na plataforma Mary';
COMMENT ON COLUMN public.organizations.slug IS 'Identificador único URL-friendly (lowercase, hífens permitidos)';
COMMENT ON COLUMN public.organizations.profile_type IS 'Tipo de perfil: investor, asset, ou advisor';
COMMENT ON COLUMN public.organizations.settings IS 'Configurações JSON personalizadas da organização';
COMMENT ON COLUMN public.organizations.deleted_at IS 'Soft delete - quando preenchido, organização está "excluída"';

-- Tabela: organization_members
-- Vínculo entre usuários e organizações
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.member_role NOT NULL DEFAULT 'member',
    verification_status public.verification_status DEFAULT 'pending' NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Unique constraint: um usuário só pode ser membro uma vez por organização
    CONSTRAINT organization_members_unique_user UNIQUE(organization_id, user_id)
);

COMMENT ON TABLE public.organization_members IS 'Membros de organizações com seus papéis e status';
COMMENT ON COLUMN public.organization_members.role IS 'Papel do membro: owner, admin, member, viewer';
COMMENT ON COLUMN public.organization_members.verification_status IS 'Status de verificação individual do membro';

-- Tabela: organization_invites
-- Convites pendentes para organizações
CREATE TABLE public.organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.member_role NOT NULL DEFAULT 'member',
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Unique constraint: um email só pode ter um convite pendente por organização
    CONSTRAINT organization_invites_unique_email UNIQUE(organization_id, email),
    -- Constraint: email deve ter formato válido
    CONSTRAINT organization_invites_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE public.organization_invites IS 'Convites pendentes para novas organizações (expiram em 7 dias)';
COMMENT ON COLUMN public.organization_invites.token IS 'Token único para aceitar o convite';
COMMENT ON COLUMN public.organization_invites.expires_at IS 'Data de expiração do convite (padrão: 7 dias)';

-- Tabela: advisor_project_assignments
-- Vincula advisors a projetos com lado específico (sell/buy)
CREATE TABLE public.advisor_project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_member_id UUID NOT NULL REFERENCES public.organization_members(id) ON DELETE CASCADE,
    project_id UUID NOT NULL, -- FK será adicionada na Fase 4 quando tabela projects existir
    side public.advisor_side NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Unique constraint: um advisor só pode ter um assignment por projeto
    CONSTRAINT advisor_assignments_unique UNIQUE(advisor_member_id, project_id)
);

COMMENT ON TABLE public.advisor_project_assignments IS 'Assignments de advisors a projetos M&A com lado (sell/buy)';
COMMENT ON COLUMN public.advisor_project_assignments.side IS 'Lado do advisor: sell_side ou buy_side';
COMMENT ON COLUMN public.advisor_project_assignments.project_id IS 'ID do projeto (FK será adicionada na Fase 4)';

-- =====================================================
-- PARTE 3: ÍNDICES
-- =====================================================

-- Índices para organizations
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_profile_type ON public.organizations(profile_type);
CREATE INDEX idx_organizations_verification ON public.organizations(verification_status);
CREATE INDEX idx_organizations_created_by ON public.organizations(created_by);
CREATE INDEX idx_organizations_active ON public.organizations(id) WHERE deleted_at IS NULL;

-- Índices para organization_members
CREATE INDEX idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_org_members_role ON public.organization_members(role);
CREATE INDEX idx_org_members_org_user ON public.organization_members(organization_id, user_id);

-- Índices para organization_invites
CREATE INDEX idx_org_invites_org_id ON public.organization_invites(organization_id);
CREATE INDEX idx_org_invites_email ON public.organization_invites(email);
CREATE INDEX idx_org_invites_token ON public.organization_invites(token);
CREATE INDEX idx_org_invites_expires ON public.organization_invites(expires_at);

-- Índices para advisor_project_assignments
CREATE INDEX idx_advisor_assignments_member ON public.advisor_project_assignments(advisor_member_id);
CREATE INDEX idx_advisor_assignments_project ON public.advisor_project_assignments(project_id);
CREATE INDEX idx_advisor_assignments_side ON public.advisor_project_assignments(side);

-- =====================================================
-- PARTE 4: FUNÇÕES HELPER
-- =====================================================

-- Função: is_org_member
-- Verifica se um usuário é membro de uma organização
CREATE OR REPLACE FUNCTION public.is_org_member(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.organization_members om
        JOIN public.organizations o ON o.id = om.organization_id
        WHERE om.user_id = p_user_id 
          AND om.organization_id = p_org_id
          AND o.deleted_at IS NULL
    );
END;
$$;

COMMENT ON FUNCTION public.is_org_member IS 'Verifica se usuário é membro de uma organização (considera soft delete)';

-- Função: get_user_role
-- Obtém o papel do usuário em uma organização
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID, p_org_id UUID)
RETURNS public.member_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_role public.member_role;
BEGIN
    SELECT om.role INTO v_role 
    FROM public.organization_members om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.user_id = p_user_id 
      AND om.organization_id = p_org_id
      AND o.deleted_at IS NULL;
    
    RETURN v_role;
END;
$$;

COMMENT ON FUNCTION public.get_user_role IS 'Retorna o papel (role) do usuário em uma organização';

-- Função: has_org_permission
-- Verifica se o usuário tem permissão específica em uma organização
CREATE OR REPLACE FUNCTION public.has_org_permission(
    p_user_id UUID, 
    p_org_id UUID, 
    p_required_roles public.member_role[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_role public.member_role;
BEGIN
    v_role := public.get_user_role(p_user_id, p_org_id);
    
    IF v_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN v_role = ANY(p_required_roles);
END;
$$;

COMMENT ON FUNCTION public.has_org_permission IS 'Verifica se usuário tem um dos papéis especificados na organização';

-- Função: check_advisor_conflict
-- Verifica se há conflito de lado para um advisor em um projeto
CREATE OR REPLACE FUNCTION public.check_advisor_conflict(
    p_advisor_member_id UUID,
    p_project_id UUID,
    p_requested_side public.advisor_side
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_existing_side public.advisor_side;
BEGIN
    SELECT side INTO v_existing_side
    FROM public.advisor_project_assignments
    WHERE advisor_member_id = p_advisor_member_id 
      AND project_id = p_project_id;
    
    -- Se não existe assignment, não há conflito
    IF v_existing_side IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Se já existe e é diferente do solicitado, há conflito
    RETURN v_existing_side != p_requested_side;
END;
$$;

COMMENT ON FUNCTION public.check_advisor_conflict IS 'Verifica se advisor tem conflito de lado (sell/buy) em um projeto';

-- Função: get_user_organizations
-- Lista todas as organizações de um usuário
CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name TEXT,
    organization_slug TEXT,
    profile_type public.organization_profile,
    user_role public.member_role,
    verification_status public.verification_status
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.slug,
        o.profile_type,
        om.role,
        om.verification_status
    FROM public.organizations o
    JOIN public.organization_members om ON o.id = om.organization_id
    WHERE om.user_id = p_user_id
      AND o.deleted_at IS NULL
    ORDER BY om.joined_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_user_organizations IS 'Lista todas as organizações de um usuário com seus papéis';

-- Função: count_org_owners
-- Conta quantos owners existem em uma organização
CREATE OR REPLACE FUNCTION public.count_org_owners(p_org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.organization_members
    WHERE organization_id = p_org_id
      AND role = 'owner';
    
    RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.count_org_owners IS 'Conta o número de owners em uma organização';

-- Função: count_pending_invites
-- Conta convites pendentes de uma organização
CREATE OR REPLACE FUNCTION public.count_pending_invites(p_org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.organization_invites
    WHERE organization_id = p_org_id
      AND expires_at > now();
    
    RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.count_pending_invites IS 'Conta convites pendentes (não expirados) de uma organização';

-- =====================================================
-- PARTE 5: TRIGGERS
-- =====================================================

-- Trigger function: atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Trigger: organizations updated_at
CREATE TRIGGER trigger_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: organization_members updated_at
CREATE TRIGGER trigger_org_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger function: validar que não pode remover último owner
CREATE OR REPLACE FUNCTION public.validate_owner_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Se está deletando um owner ou alterando de owner para outro role
    IF (TG_OP = 'DELETE' AND OLD.role = 'owner') OR 
       (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner') THEN
        -- Verificar se é o último owner
        IF public.count_org_owners(OLD.organization_id) <= 1 THEN
            RAISE EXCEPTION 'Cannot remove the last owner of an organization';
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger: validar remoção de owner
CREATE TRIGGER trigger_validate_owner_removal
    BEFORE DELETE OR UPDATE ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_owner_removal();

-- Trigger function: limpar convites expirados ao inserir novo
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Limpar convites expirados da mesma organização
    DELETE FROM public.organization_invites
    WHERE organization_id = NEW.organization_id
      AND expires_at < now();
    
    RETURN NEW;
END;
$$;

-- Trigger: limpar convites expirados
CREATE TRIGGER trigger_cleanup_expired_invites
    BEFORE INSERT ON public.organization_invites
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_expired_invites();

-- Trigger function: validar limite de convites pendentes (max 10)
CREATE OR REPLACE FUNCTION public.validate_invite_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
    v_max_invites INTEGER := 10;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.organization_invites
    WHERE organization_id = NEW.organization_id
      AND expires_at > now();
    
    IF v_count >= v_max_invites THEN
        RAISE EXCEPTION 'Organization has reached maximum pending invites limit (%)' , v_max_invites;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger: validar limite de convites
CREATE TRIGGER trigger_validate_invite_limit
    BEFORE INSERT ON public.organization_invites
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_invite_limit();

-- =====================================================
-- PARTE 6: RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_project_assignments ENABLE ROW LEVEL SECURITY;

-- ----------------
-- ORGANIZATIONS
-- ----------------

-- SELECT: Usuário é membro da organização
CREATE POLICY "Users can view their organizations"
    ON public.organizations
    FOR SELECT
    USING (
        deleted_at IS NULL 
        AND public.is_org_member(auth.uid(), id)
    );

-- INSERT: Qualquer usuário autenticado pode criar organização
CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND created_by = auth.uid()
    );

-- UPDATE: Owner ou Admin podem atualizar
CREATE POLICY "Owners and admins can update organizations"
    ON public.organizations
    FOR UPDATE
    USING (
        deleted_at IS NULL
        AND public.has_org_permission(auth.uid(), id, ARRAY['owner', 'admin']::public.member_role[])
    )
    WITH CHECK (
        deleted_at IS NULL
        AND public.has_org_permission(auth.uid(), id, ARRAY['owner', 'admin']::public.member_role[])
    );

-- DELETE: Apenas owner pode soft-delete (na verdade é UPDATE de deleted_at)
CREATE POLICY "Only owners can delete organizations"
    ON public.organizations
    FOR DELETE
    USING (
        public.get_user_role(auth.uid(), id) = 'owner'
    );

-- ----------------
-- ORGANIZATION_MEMBERS
-- ----------------

-- SELECT: Membros da mesma organização podem ver outros membros
CREATE POLICY "Members can view other members in their org"
    ON public.organization_members
    FOR SELECT
    USING (
        public.is_org_member(auth.uid(), organization_id)
    );

-- INSERT: Owner/Admin podem adicionar membros
CREATE POLICY "Owners and admins can add members"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (
        public.has_org_permission(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.member_role[])
    );

-- UPDATE: Owner/Admin podem atualizar (exceto próprio role)
CREATE POLICY "Owners and admins can update members"
    ON public.organization_members
    FOR UPDATE
    USING (
        public.has_org_permission(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.member_role[])
        AND user_id != auth.uid() -- Não pode alterar próprio role
    )
    WITH CHECK (
        public.has_org_permission(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.member_role[])
    );

-- DELETE: Owner/Admin podem remover membros
CREATE POLICY "Owners and admins can remove members"
    ON public.organization_members
    FOR DELETE
    USING (
        public.has_org_permission(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.member_role[])
        AND user_id != auth.uid() -- Não pode remover a si mesmo
    );

-- ----------------
-- ORGANIZATION_INVITES
-- ----------------

-- SELECT: Owner/Admin podem ver convites da organização
CREATE POLICY "Owners and admins can view invites"
    ON public.organization_invites
    FOR SELECT
    USING (
        public.has_org_permission(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.member_role[])
    );

-- INSERT: Owner/Admin podem criar convites
CREATE POLICY "Owners and admins can create invites"
    ON public.organization_invites
    FOR INSERT
    WITH CHECK (
        public.has_org_permission(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.member_role[])
        AND invited_by = auth.uid()
    );

-- DELETE: Owner/Admin podem cancelar convites OU o próprio convidado pode recusar
CREATE POLICY "Owners, admins, or invitee can delete invites"
    ON public.organization_invites
    FOR DELETE
    USING (
        public.has_org_permission(auth.uid(), organization_id, ARRAY['owner', 'admin']::public.member_role[])
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- ----------------
-- ADVISOR_PROJECT_ASSIGNMENTS
-- ----------------

-- SELECT: Membros da organização do advisor podem ver
CREATE POLICY "Org members can view advisor assignments"
    ON public.advisor_project_assignments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.id = advisor_project_assignments.advisor_member_id
              AND public.is_org_member(auth.uid(), om.organization_id)
        )
    );

-- INSERT: Owner/Admin da org do advisor podem criar
CREATE POLICY "Owners and admins can create advisor assignments"
    ON public.advisor_project_assignments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.id = advisor_project_assignments.advisor_member_id
              AND public.has_org_permission(auth.uid(), om.organization_id, ARRAY['owner', 'admin']::public.member_role[])
        )
        -- Verificar que não há conflito de lado
        AND NOT public.check_advisor_conflict(advisor_member_id, project_id, side)
    );

-- DELETE: Owner/Admin podem remover assignments
CREATE POLICY "Owners and admins can delete advisor assignments"
    ON public.advisor_project_assignments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.id = advisor_project_assignments.advisor_member_id
              AND public.has_org_permission(auth.uid(), om.organization_id, ARRAY['owner', 'admin']::public.member_role[])
        )
    );

-- =====================================================
-- PARTE 7: ATUALIZAR AUDIT_ACTION ENUM
-- =====================================================

-- Adicionar novos tipos de ação para RBAC ao enum audit_action
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.created';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.updated';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.deleted';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.member_added';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.member_removed';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.member_role_changed';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.invite_sent';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.invite_accepted';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.invite_cancelled';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'org.invite_expired';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'advisor.assigned';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'advisor.unassigned';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'advisor.conflict_blocked';

