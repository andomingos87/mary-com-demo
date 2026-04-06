-- Add rate limit action for shared link password attempts (brute-force protection)
ALTER TYPE public.rate_limit_action ADD VALUE IF NOT EXISTS 'shared_link_attempt';

-- Add audit action for failed shared link validation attempts
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'vdr.shared_link_validation_failed';
