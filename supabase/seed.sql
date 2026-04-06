-- Seed inicial de Feature Flags
INSERT INTO public.feature_flags (key, is_enabled, description)
VALUES 
    ('maintenance_mode', false, 'Trava global de manutenção da plataforma'),
    ('ai_generation_enabled', true, 'Habilita geração de documentos via Mary AI')
ON CONFLICT (key) DO NOTHING;

-- Exemplo de log de auditoria (opcional para seed, mas solicitado no plano)
-- Nota: uuid_generate_v4() pode precisar da extensão 'uuid-ossp' ou apenas gen_random_uuid()
INSERT INTO public.audit_logs (action, metadata)
VALUES ('project.created', '{"info": "Seed example log"}'::jsonb);

