import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback handler for email confirmation and OAuth
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const token_hash = searchParams.get('token_hash');
  const token = searchParams.get('token'); // PKCE token alternativo
  const type = searchParams.get('type');
  const error_param = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // PRIMEIRO: Verificar se Supabase já processou e definiu sessão
  // Isso acontece quando o link de verificação /auth/v1/verify é usado
  const supabaseForSession = await createClient();
  const { data: sessionData } = await supabaseForSession.auth.getSession();

  // Se já tem sessão válida, redirecionar para destino
  if (sessionData?.session?.user) {
    // Verificar se é confirmação de email (usuário pode ir para login)
    // ou se deve ir direto para dashboard
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Se Supabase retornou erro diretamente
  if (error_param) {
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error_description || error_param)}`);
  }

  // Handle PKCE flow (email confirmation, password reset)
  // Aceita tanto token_hash quanto token
  const actualToken = token_hash || token;
  if (actualToken && type) {
    const supabase = await createClient();
    
    // Mapear type=signup para type=email
    const mappedType = type === 'signup' ? 'email' : type;

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: actualToken,
      type: mappedType as 'email' | 'recovery' | 'invite' | 'signup',
    });

    if (error) {
      // Redirect to error page
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
    
    // For password recovery, redirect to reset password page
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
    
    // For email confirmation (or signup), redirect to login with success message
    if (type === 'email' || type === 'signup') {
      return NextResponse.redirect(`${origin}/login?confirmed=true`);
    }
    
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Handle OAuth code exchange
  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

