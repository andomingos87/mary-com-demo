import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const LOCALE_COOKIE = 'NEXT_LOCALE';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  // Persist locale from Accept-Language on first visit (no cookie yet)
  if (!request.cookies.get(LOCALE_COOKIE)?.value) {
    const acceptLang = request.headers.get('Accept-Language');
    const preferred = acceptLang?.split(',')[0]?.split('-')[0]?.toLowerCase();
    let locale = 'pt-br';
    if (preferred === 'en') locale = 'en-us';
    else if (preferred === 'es') locale = 'es';
    else if (preferred === 'pt') locale = 'pt-br';
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  }
  return response;
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/forgot-password',
    '/verify-mfa',
    '/validacao-epicos/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/advisor/:path*',
    '/demo/:path*',
    '/:orgSlug((?!api|auth|_next|login|signup|forgot-password|reset-password|verify-mfa|onboarding|dashboard|profile|settings|admin|advisor|terms|privacy|docs|vdr|validacao-epicos|design-system|demo|favicon.ico|.*\\..*).*)',
    '/:orgSlug((?!api|auth|_next|login|signup|forgot-password|reset-password|verify-mfa|onboarding|dashboard|profile|settings|admin|advisor|terms|privacy|docs|vdr|validacao-epicos|design-system|demo|favicon.ico|.*\\..*).*)/:path*',
  ],
};
