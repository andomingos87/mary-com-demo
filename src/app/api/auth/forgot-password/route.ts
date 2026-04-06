import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }
    
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit (3 requests per hour)
    const rateLimitResult = await checkRateLimit(email, 'recovery_request');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Muitas solicitações de recuperação. Tente novamente mais tarde.',
          retryAfter: rateLimitResult.retryAfterSeconds,
        },
        { status: 429 }
      );
    }
    
    const supabase = await createClient();
    
    // Send password reset email
    // Link expires in 15 minutes (configured in Supabase dashboard)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });
    
    if (error) {
      logger.warn('Password reset request failed', { email, error: error.message });
      // Don't reveal if email exists or not for security
    }
    
    // Log audit event
    const adminSupabase = await createAdminClient();
    await adminSupabase.from('audit_logs').insert({
      action: 'auth.recovery_requested' as const,
      metadata: {
        email_masked: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      },
      ip_address: ip,
    });
    
    logger.info('Password reset requested', { email: email.substring(0, 3) + '***' });
    
    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação. O link expira em 15 minutos.',
    });
  } catch (error) {
    logger.error('Forgot password error', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

