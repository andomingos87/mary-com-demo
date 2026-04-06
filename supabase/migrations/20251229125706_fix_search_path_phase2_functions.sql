-- =====================================================
-- FIX: search_path para funções da Fase 2
-- =====================================================
-- Corrige o warning de security "Function Search Path Mutable"
-- adicionando SET search_path = '' às funções.
-- =====================================================

-- Recriar is_org_member com search_path fixo
CREATE OR REPLACE FUNCTION public.is_org_member(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
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

-- Recriar get_user_role com search_path fixo
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID, p_org_id UUID)
RETURNS public.member_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
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

-- Recriar has_org_permission com search_path fixo
CREATE OR REPLACE FUNCTION public.has_org_permission(
    p_user_id UUID, 
    p_org_id UUID, 
    p_required_roles public.member_role[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
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

-- Recriar check_advisor_conflict com search_path fixo
CREATE OR REPLACE FUNCTION public.check_advisor_conflict(
    p_advisor_member_id UUID,
    p_project_id UUID,
    p_requested_side public.advisor_side
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
    v_existing_side public.advisor_side;
BEGIN
    SELECT side INTO v_existing_side
    FROM public.advisor_project_assignments
    WHERE advisor_member_id = p_advisor_member_id 
      AND project_id = p_project_id;
    
    IF v_existing_side IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN v_existing_side != p_requested_side;
END;
$$;

-- Recriar get_user_organizations com search_path fixo
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
SET search_path = ''
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

-- Recriar count_org_owners com search_path fixo
CREATE OR REPLACE FUNCTION public.count_org_owners(p_org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
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

-- Recriar count_pending_invites com search_path fixo
CREATE OR REPLACE FUNCTION public.count_pending_invites(p_org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
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

-- Recriar update_updated_at_column com search_path fixo
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Recriar validate_owner_removal com search_path fixo
CREATE OR REPLACE FUNCTION public.validate_owner_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF (TG_OP = 'DELETE' AND OLD.role = 'owner') OR 
       (TG_OP = 'UPDATE' AND OLD.role = 'owner' AND NEW.role != 'owner') THEN
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

-- Recriar cleanup_expired_invites com search_path fixo
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    DELETE FROM public.organization_invites
    WHERE organization_id = NEW.organization_id
      AND expires_at < now();
    
    RETURN NEW;
END;
$$;

-- Recriar validate_invite_limit com search_path fixo
CREATE OR REPLACE FUNCTION public.validate_invite_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
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

