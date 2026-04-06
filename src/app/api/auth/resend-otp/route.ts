import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { resendMfaCode } from '@/lib/auth/mfa';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { channel } = await request.json();
    
    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    // Check rate limit for OTP requests
    const rateLimitResult = await checkRateLimit(user.id, 'otp_request');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Você já solicitou muitos códigos. Aguarde um momento.',
          retryAfter: rateLimitResult.retryAfterSeconds,
        },
        { status: 429 }
      );
    }
    
    // Resend MFA code
    const result = await resendMfaCode(user.id, channel);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Falha ao enviar código' },
        { status: 500 }
      );
    }
    
    logger.info('OTP resent', { userId: user.id, channel: result.channel });
    
    return NextResponse.json({
      success: true,
      message: 'Novo código enviado',
      channel: result.channel,
      expiresAt: result.expiresAt?.toISOString(),
    });
  } catch (error) {
    logger.error('Resend OTP error', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

