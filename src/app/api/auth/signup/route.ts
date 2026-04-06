import { NextRequest, NextResponse } from 'next/server';

/**
 * @deprecated This API Route is deprecated. Use Server Actions (`src/lib/actions/auth.ts`) instead.
 * Handles user signup.
 * 
 * The PKCE code_verifier is NOT persisted in cookies when using API Routes,
 * which causes the email confirmation callback to fail.
 * 
 * @see BUG-001-supabase-session-cookies.md
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { error: 'Deprecated. Use Server Actions for signup.' },
    { status: 410 }
  );
  response.headers.set('X-Deprecated', 'true');
  return response;
}

