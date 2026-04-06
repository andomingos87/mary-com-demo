/**
 * @deprecated Esta API Route está DEPRECATED.
 * 
 * Use o Server Action `verifyMfaAction` de `@/lib/actions/auth` ao invés desta rota.
 * 
 * Motivo: O @supabase/ssr não persiste cookies corretamente após signInWithPassword
 * em API Routes. Server Actions resolvem este problema.
 * 
 * @see BUG-001-supabase-session-cookies.md
 * @see bug-001-auth-session-fix.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { verifyMfa } from '@/lib/auth/mfa';
import { logger } from '@/lib/logger';

/**
 * @deprecated Use `verifyMfaAction` from `@/lib/actions/auth` instead.
 */
export async function POST(request: NextRequest) {
  // Log deprecation warning
  logger.warn('DEPRECATED: /api/auth/verify-mfa is deprecated. Use verifyMfaAction Server Action instead.', {
    referer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
  });

  try {
    const { code, sessionId } = await request.json();
    
    // Validate input
    if (!code || !sessionId) {
      return NextResponse.json(
        { error: 'Código e ID da sessão são obrigatórios' },
        { status: 400, headers: { 'X-Deprecated': 'Use verifyMfaAction Server Action instead' } }
      );
    }
    
    // First, try to get user from Supabase Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let userId: string;
    
    if (user) {
      userId = user.id;
    } else {
      // If user is not authenticated, get user_id from session
      // This handles the case where user logged in but MFA is pending
      const adminSupabase = await createAdminClient();
      const { data: session, error: sessionError } = await adminSupabase
        .from('user_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .eq('is_active', true)
        .eq('mfa_verified', false)
        .single();
      
      if (sessionError || !session) {
        logger.warn('Invalid or expired session for MFA', { sessionId, error: sessionError?.message });
        return NextResponse.json(
          { error: 'Sessão inválida ou expirada. Faça login novamente.' },
          { status: 401, headers: { 'X-Deprecated': 'Use verifyMfaAction Server Action instead' } }
        );
      }
      
      userId = session.user_id;
    }
    
    // Check rate limit for MFA attempts
    const rateLimitResult = await checkRateLimit(userId, 'mfa_attempt');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Muitas tentativas. Solicite um novo código.',
          retryAfter: rateLimitResult.retryAfterSeconds,
        },
        { status: 429, headers: { 'X-Deprecated': 'Use verifyMfaAction Server Action instead' } }
      );
    }
    
    // Verify MFA code
    const mfaResult = await verifyMfa(userId, code, sessionId);
    
    if (!mfaResult.success) {
      logger.warn('MFA verification failed', { userId, message: mfaResult.message });
      return NextResponse.json(
        { 
          error: mfaResult.message,
          remainingAttempts: rateLimitResult.remainingAttempts - 1,
        },
        { status: 400, headers: { 'X-Deprecated': 'Use verifyMfaAction Server Action instead' } }
      );
    }
    
    // Reset rate limit on success
    await resetRateLimit(userId, 'mfa_attempt');
    
    logger.info('MFA verified successfully', { userId, sessionId });
    
    return NextResponse.json({
      success: true,
      message: 'Verificação concluída com sucesso',
      redirectTo: '/dashboard',
      _deprecated: 'This API route is deprecated. Use verifyMfaAction Server Action instead.',
    }, {
      headers: { 'X-Deprecated': 'Use verifyMfaAction Server Action instead' }
    });
  } catch (error) {
    logger.error('MFA verification error', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500, headers: { 'X-Deprecated': 'Use verifyMfaAction Server Action instead' } }
    );
  }
}
