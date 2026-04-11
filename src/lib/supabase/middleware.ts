import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/** Edge-compatible admin client for session validation (bypasses RLS) */
function createMiddlewareAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ============================================
// Route Configuration
// ============================================

/** Routes that require authentication */
const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings', '/onboarding', '/admin', '/advisor', '/validacao-epicos'];

/** Auth routes that should redirect if already logged in */
const AUTH_PATHS = ['/login', '/signup', '/forgot-password'];

const MARY_SESSION_COOKIE_NAME = 'mary_session_id';
const MARY_SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

// ============================================
// Helper Functions
// ============================================

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((path) => pathname.startsWith(path));
}

function isMfaPath(pathname: string): boolean {
  return pathname.startsWith('/verify-mfa');
}

/** Demo estático: não usa Supabase nem sessão; evita ruído no terminal sem `.env.local`. */
function isPublicDemoPath(pathname: string): boolean {
  return pathname === '/demo' || pathname.startsWith('/demo/')
}

function isDynamicOrgPath(pathname: string): boolean {
  // Matches /:orgSlug/* pattern (but not /login, /signup, etc.)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 1) return false;
  
  // Check if first segment is NOT a known static route
  const staticRoutes = ['login', 'signup', 'forgot-password', 'reset-password', 'verify-mfa', 'onboarding', 'admin', 'advisor', 'api', 'auth', 'dashboard', 'terms', 'privacy', 'docs', 'vdr', 'validacao-epicos', 'design-system', 'demo'];
  return !staticRoutes.includes(segments[0]);
}

function extractOrgSlug(pathname: string): string | null {
  if (!isDynamicOrgPath(pathname)) return null;
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] || null;
}

// ============================================
// Main Middleware Function
// ============================================

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isPublicDemoPath(pathname)) {
      return NextResponse.next({ request });
    }
    console.warn(
      `[Middleware] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes — sessão ignorada para ${pathname}. Configure .env.local para auth completo.`
    );
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const marySessionId = request.cookies.get(MARY_SESSION_COOKIE_NAME)?.value;

  /** Load user_sessions row and require is_active, expires_at in future, mfa_verified */
  async function validateMarySession(
    sessionId: string | undefined,
    userId: string
  ): Promise<boolean> {
    if (!sessionId || !process.env.SUPABASE_SERVICE_ROLE_KEY) return false;
    try {
      const admin = createMiddlewareAdminClient();
      const { data, error } = await admin
        .from('user_sessions')
        .select('id, is_active, expires_at, mfa_verified')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
      if (error || !data) return false;
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const valid =
        data.is_active === true &&
        data.mfa_verified === true &&
        expiresAt > now;
      if (!valid) return false;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Attempt to recover a valid MFA-verified custom session when cookie is missing/stale.
   * Returns true when the cookie was restored.
   */
  async function recoverMarySession(userId: string): Promise<string | null> {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
    try {
      const admin = createMiddlewareAdminClient();
      const { data, error } = await admin
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('mfa_verified', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      supabaseResponse.cookies.set(MARY_SESSION_COOKIE_NAME, data.id, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: MARY_SESSION_COOKIE_MAX_AGE_SECONDS,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Recovered mary_session_id from fallback session', {
          userId: userId.substring(0, 8) + '...',
          recoveredSessionId: data.id.substring(0, 8) + '...',
        });
      }

      return data.id;
    } catch {
      return null;
    }
  }

  async function redirectWithOptionalCookieCleanup(path: string, clearSessionCookie = false) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    const response = NextResponse.redirect(url);
    if (clearSessionCookie) {
      response.cookies.delete(MARY_SESSION_COOKIE_NAME);
    }
    return response;
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    const isRelevantPath = isProtectedPath(pathname) || isAuthPath(pathname) || isDynamicOrgPath(pathname);
    if (isRelevantPath || userError) {
      console.log('[Middleware]', {
        path: pathname,
        hasUser: !!user,
        userId: user?.id?.substring(0, 8) + '...',
        userError: userError?.message,
        isDynamicOrg: isDynamicOrgPath(pathname),
        orgSlug: extractOrgSlug(pathname),
      });
    }
  }

  // ============================================
  // 1. Handle Auth Paths (login, signup, etc.)
  // ============================================
  if (isAuthPath(pathname) && user) {
    // Must have valid MFA-verified session to stay on auth pages → redirect to dashboard
    const sessionValid = await validateMarySession(marySessionId, user.id);
    if (sessionValid) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    const recoveredSessionId = await recoverMarySession(user.id);
    if (recoveredSessionId) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      const response = NextResponse.redirect(url);
      response.cookies.set(MARY_SESSION_COOKIE_NAME, recoveredSessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: MARY_SESSION_COOKIE_MAX_AGE_SECONDS,
      });
      return response;
    }
    // No valid session → send to verify-mfa
    return redirectWithOptionalCookieCleanup('/verify-mfa', true);
  }

  // ============================================
  // 2. Handle MFA Path
  // ============================================
  if (isMfaPath(pathname)) {
    // Allow access to MFA page even without full auth
    return supabaseResponse;
  }

  // ============================================
  // 3. Handle Protected Paths
  // ============================================
  if (isProtectedPath(pathname) && !user) {
    // Redirect unauthenticated users to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete(MARY_SESSION_COOKIE_NAME);
    return response;
  }

  // ============================================
  // 3.1 Validate custom session + MFA for authenticated users
  // ============================================
  if (user) {
    const sessionValid = await validateMarySession(marySessionId, user.id);
    if (!sessionValid) {
      const recoveredSessionId = await recoverMarySession(user.id);
      if (recoveredSessionId) {
        return supabaseResponse;
      }
      if (isProtectedPath(pathname) || isDynamicOrgPath(pathname)) {
        return redirectWithOptionalCookieCleanup('/verify-mfa', true);
      }
      return supabaseResponse;
    }
  }

  // ============================================
  // 4. Handle Unauthenticated Dynamic Org Paths
  // ============================================
  if (isDynamicOrgPath(pathname) && !user) {
    // Redirect to login for dynamic org paths
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete(MARY_SESSION_COOKIE_NAME);
    return response;
  }

  return supabaseResponse;
}
