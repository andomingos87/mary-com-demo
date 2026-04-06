-- H0.1: onboarding steps do fluxo de Ativo (Excalidraw)
-- Mantemos compatibilidade com os steps legados.

ALTER TYPE onboarding_step ADD VALUE IF NOT EXISTS 'asset_company_data';
ALTER TYPE onboarding_step ADD VALUE IF NOT EXISTS 'asset_matching_data';
ALTER TYPE onboarding_step ADD VALUE IF NOT EXISTS 'asset_team';
ALTER TYPE onboarding_step ADD VALUE IF NOT EXISTS 'asset_codename';
