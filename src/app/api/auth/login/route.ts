/**
 * @deprecated Esta API Route está DEPRECATED.
 * 
 * Use o Server Action `loginAction` de `@/lib/actions/auth` ao invés desta rota.
 * 
 * Motivo: O @supabase/ssr não persiste cookies corretamente após signInWithPassword
 * em API Routes. Server Actions resolvem este problema.
 * 
 * @see BUG-001-supabase-session-cookies.md
 * @see bug-001-auth-session-fix.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { 
  createSession, 
  generateDeviceFingerprint, 
  parseUserAgent 
} from '@/lib/auth/session';
import { getGeoLocation, isKnownDevice, handleNewDevice } from '@/lib/auth/device';
import { initiateMfa } from '@/lib/auth/mfa';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/database';

// Get the project ref from the Supabase URL
function getProjectRef(url: string): string {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : '';
}

/**
 * @deprecated Use `loginAction` from `@/lib/actions/auth` instead.
 */
export async function POST(request: NextRequest) {
  // Log deprecation warning
  logger.warn('DEPRECATED: /api/auth/login is deprecated. Use loginAction Server Action instead.', {
    referer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
  });

  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400, headers: { 'X-Deprecated': 'Use loginAction Server Action instead' } }
      );
    }
    
    // Get client info
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    
    // Check rate limit
    const rateLimitResult = await checkRateLimit(email, 'login');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Muitas tentativas de login. Tente novamente mais tarde.',
          retryAfter: rateLimitResult.retryAfterSeconds,
        },
        { status: 429, headers: { 'X-Deprecated': 'Use loginAction Server Action instead' } }
      );
    }
    
    // Create Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // We'll handle cookies manually
          },
        },
      }
    );
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Log for debugging
    logger.info('signInWithPassword result', { 
      hasSession: !!data.session, 
      hasUser: !!data.user,
      error: error?.message,
      sessionAccessToken: data.session?.access_token ? 'present' : 'missing',
    });
    
    if (error) {
      logger.warn('Login failed', { email, error: error.message });
      return NextResponse.json(
        { 
          error: 'E-mail ou senha incorretos',
          remainingAttempts: rateLimitResult.remainingAttempts - 1,
        },
        { status: 401, headers: { 'X-Deprecated': 'Use loginAction Server Action instead' } }
      );
    }
    
    if (!data.user) {
      return NextResponse.json(
        { error: 'Falha na autenticação' },
        { status: 401, headers: { 'X-Deprecated': 'Use loginAction Server Action instead' } }
      );
    }
    
    // Reset rate limit on successful login
    await resetRateLimit(email, 'login');
    
    // Get geo-location
    const geoLocation = await getGeoLocation(ip);
    
    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(userAgent, ip, acceptLanguage);
    const deviceInfo = parseUserAgent(userAgent);
    
    // Check if this is a new device
    const knownDevice = await isKnownDevice(data.user.id, deviceFingerprint);
    
    // Create session (this will invalidate previous sessions)
    const sessionResult = await createSession(
      data.user.id,
      { fingerprint: deviceFingerprint, ...deviceInfo },
      { ip, countryCode: geoLocation.countryCode, city: geoLocation.city }
    );
    
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: sessionResult.error || 'Falha ao criar sessão' },
        { status: 500, headers: { 'X-Deprecated': 'Use loginAction Server Action instead' } }
      );
    }
    
    // Handle new device notification
    if (!knownDevice) {
      await handleNewDevice(data.user.id, deviceInfo, geoLocation);
    }
    
    // Log audit event
    const adminSupabase = await createAdminClient();
    await adminSupabase.from('audit_logs').insert({
      user_id: data.user.id,
      action: 'auth.login',
      metadata: {
        email,
        is_new_device: !knownDevice,
        country: geoLocation.countryCode,
        session_id: sessionResult.sessionId,
        deprecated_api_route: true, // Flag para indicar uso de rota deprecated
      },
      ip_address: ip,
      user_agent: userAgent,
    });
    
    // Initiate MFA
    const mfaResult = await initiateMfa(data.user.id, 'whatsapp');
    
    logger.info('User logged in, MFA initiated', { 
      userId: data.user.id, 
      sessionId: sessionResult.sessionId,
      mfaChannel: mfaResult.channel,
    });
    
    // Create response with deprecation header
    const response = NextResponse.json({
      success: true,
      requiresMfa: true,
      mfaChannel: mfaResult.channel,
      mfaExpiresAt: mfaResult.expiresAt?.toISOString(),
      sessionId: sessionResult.sessionId,
      isNewDevice: !knownDevice,
      countryChanged: sessionResult.countryChanged,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      _deprecated: 'This API route is deprecated. Use loginAction Server Action instead.',
    }, {
      headers: { 'X-Deprecated': 'Use loginAction Server Action instead' }
    });
    
    // Manually set the auth cookie since Supabase SSR doesn't call setAll after signInWithPassword
    if (data.session) {
      const projectRef = getProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL!);
      const cookieName = `sb-${projectRef}-auth-token`;
      
      // Create the session data that Supabase expects (same format as supabase-js stores)
      const sessionData = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
        user: data.session.user,
      };
      
      // Store as JSON string (Supabase SSR will handle encoding)
      const cookieValue = JSON.stringify(sessionData);
      
      // Set the cookie
      response.cookies.set(cookieName, cookieValue, {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false, // Supabase needs to access this from JS
        maxAge: 60 * 60 * 24 * 365, // 1 year (same as Supabase default)
      });
      
      logger.info('Auth cookie set', { cookieName });
    }
    
    return response;
  } catch (error) {
    logger.error('Login error', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500, headers: { 'X-Deprecated': 'Use loginAction Server Action instead' } }
    );
  }
}
