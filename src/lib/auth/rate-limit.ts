/**
 * Rate Limiting Service
 * 
 * Implements rate limiting for authentication endpoints:
 * - Login: 5 attempts per 15 minutes
 * - MFA: 3 attempts per OTP
 * - Recovery: 3 attempts per hour
 * - OTP Request: 3 requests per 15 minutes
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/database';

type RateLimitAction = Database['public']['Enums']['rate_limit_action'];

// Rate limit configurations per action
const RATE_LIMIT_CONFIG: Record<RateLimitAction, {
  maxAttempts: number;
  windowMinutes: number;
  blockMinutes: number;
}> = {
  login: {
    maxAttempts: 5,
    windowMinutes: 15,
    blockMinutes: 30,
  },
  mfa_attempt: {
    maxAttempts: 3,
    windowMinutes: 5,
    blockMinutes: 15,
  },
  recovery_request: {
    maxAttempts: 3,
    windowMinutes: 60,
    blockMinutes: 60,
  },
  otp_request: {
    maxAttempts: 3,
    windowMinutes: 15,
    blockMinutes: 30,
  },
  signup: {
    maxAttempts: 5,
    windowMinutes: 60,
    blockMinutes: 60,
  },
  shared_link_attempt: {
    maxAttempts: 5,
    windowMinutes: 15,
    blockMinutes: 30,
  },
};

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil?: Date;
  retryAfterSeconds?: number;
  /** true when blocked due to infrastructure failure (RPC/DB), not actual rate limit */
  infraFailure?: boolean;
}

/**
 * Check rate limit for an action
 */
export async function checkRateLimit(
  identifier: string,
  action: RateLimitAction
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIG[action];
  const supabase = await createAdminClient();
  
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_max_attempts: config.maxAttempts,
      p_window_minutes: config.windowMinutes,
      p_block_minutes: config.blockMinutes,
    });
    
    if (error) {
      logger.error('Rate limit check failed', { error, identifier, action });
      // Fail-closed: bloqueia em caso de falha de infraestrutura
      return { allowed: false, remainingAttempts: 0, infraFailure: true };
    }
    
    const result = data?.[0];
    if (!result) {
      return { allowed: true, remainingAttempts: config.maxAttempts };
    }
    
    const blockedUntil = result.blocked_until ? new Date(result.blocked_until) : undefined;
    const retryAfterSeconds = blockedUntil
      ? Math.ceil((blockedUntil.getTime() - Date.now()) / 1000)
      : undefined;
    
    if (!result.allowed) {
      logger.warn('Rate limit exceeded', {
        identifier: maskIdentifier(identifier),
        action,
        blockedUntil,
      });
    }
    
    return {
      allowed: result.allowed,
      remainingAttempts: result.remaining_attempts,
      blockedUntil,
      retryAfterSeconds,
    };
  } catch (error) {
    logger.error('Rate limit check error', { error, identifier, action });
    // Fail-closed: bloqueia em caso de exceção
    return { allowed: false, remainingAttempts: 0, infraFailure: true };
  }
}

/**
 * Reset rate limit for an identifier and action
 * Used after successful authentication to clear failed attempts
 */
export async function resetRateLimit(
  identifier: string,
  action: RateLimitAction
): Promise<void> {
  const supabase = await createAdminClient();
  
  await supabase
    .from('rate_limits')
    .delete()
    .eq('identifier', identifier)
    .eq('action', action);
}

/**
 * Get rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  action: RateLimitAction
): Promise<{
  attempts: number;
  maxAttempts: number;
  blockedUntil?: Date;
}> {
  const config = RATE_LIMIT_CONFIG[action];
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .from('rate_limits')
    .select('attempts, blocked_until')
    .eq('identifier', identifier)
    .eq('action', action)
    .gt('window_end', new Date().toISOString())
    .order('window_start', { ascending: false })
    .limit(1)
    .single();
  
  return {
    attempts: data?.attempts || 0,
    maxAttempts: config.maxAttempts,
    blockedUntil: data?.blocked_until ? new Date(data.blocked_until) : undefined,
  };
}

/**
 * Middleware helper to check rate limit and return appropriate response
 */
export async function withRateLimit(
  identifier: string,
  action: RateLimitAction
): Promise<{
  proceed: boolean;
  response?: {
    status: number;
    body: {
      error: string;
      retryAfter?: number;
    };
  };
}> {
  const result = await checkRateLimit(identifier, action);
  
  if (!result.allowed) {
    return {
      proceed: false,
      response: {
        status: 429,
        body: {
          error: result.infraFailure
            ? 'Serviço temporariamente indisponível. Tente novamente em instantes.'
            : 'Muitas tentativas. Tente novamente mais tarde.',
          ...(result.infraFailure ? {} : { retryAfter: result.retryAfterSeconds }),
        },
      },
    };
  }
  
  return { proceed: true };
}

/**
 * Mask identifier for logging (privacy)
 */
function maskIdentifier(identifier: string): string {
  if (identifier.includes('@')) {
    // Email
    const [local, domain] = identifier.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  }
  if (identifier.match(/^\d+$/)) {
    // Phone number
    return identifier.substring(0, 4) + '****' + identifier.slice(-2);
  }
  // IP or other
  return identifier.substring(0, 4) + '***';
}

/**
 * Get human-readable rate limit message
 */
export function getRateLimitMessage(
  action: RateLimitAction,
  remainingAttempts: number,
  blockedUntil?: Date
): string {
  if (blockedUntil) {
    const minutes = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000);
    return `Muitas tentativas. Tente novamente em ${minutes} minuto(s).`;
  }
  
  const messages: Record<RateLimitAction, string> = {
    login: `Você tem ${remainingAttempts} tentativa(s) de login restante(s).`,
    mfa_attempt: `Você tem ${remainingAttempts} tentativa(s) de código restante(s).`,
    recovery_request: `Você pode solicitar recuperação mais ${remainingAttempts} vez(es).`,
    otp_request: `Você pode solicitar um novo código mais ${remainingAttempts} vez(es).`,
    signup: `Você tem ${remainingAttempts} tentativa(s) de cadastro restante(s).`,
    shared_link_attempt: `Você tem ${remainingAttempts} tentativa(s) restante(s).`,
  };
  
  return messages[action];
}

