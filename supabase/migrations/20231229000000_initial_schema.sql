-- 1. Schema de Auditoria (Audit Logs)
CREATE TYPE public.audit_action AS ENUM (
    'auth.login',
    'auth.logout',
    'auth.mfa_success',
    'auth.mfa_failed',
    'vdr.view_doc',
    'vdr.share_link',
    'vdr.revoke_access',
    'ai.prompt_sent',
    'ai.doc_generated',
    'project.created',
    'project.status_changed',
    'billing.subscription_updated'
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID, -- References auth.users(id) - will be added when auth is ready
    organization_id UUID,
    action public.audit_action NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    geo_location JSONB
);

-- Índices para performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_org_id ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- 2. Schema de Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
    key TEXT PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT false NOT NULL,
    description TEXT,
    rules JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Função para Log de Auditoria
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id UUID,
    p_org_id UUID,
    p_action public.audit_action,
    p_metadata JSONB,
    p_ip INET,
    p_ua TEXT
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, organization_id, action, metadata, ip_address, user_agent)
    VALUES (p_user_id, p_org_id, p_action, p_metadata, p_ip, p_ua)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

