import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { invalidateAllSessions } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Validate input
    if (!password) {
      return NextResponse.json(
        { error: 'Nova senha é obrigatória' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get current user (must be authenticated via recovery link)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Link de recuperação inválido ou expirado' },
        { status: 401 }
      );
    }
    
    // Update password
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      logger.error('Password reset failed', { userId: user.id, error: error.message });
      return NextResponse.json(
        { error: 'Falha ao atualizar senha' },
        { status: 400 }
      );
    }
    
    // Invalidate all existing sessions for security
    await invalidateAllSessions(user.id);
    
    // Log audit event
    const adminSupabase = await createAdminClient();
    await adminSupabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'auth.recovery_completed',
      metadata: {
        sessions_invalidated: true,
      },
    });
    
    logger.info('Password reset completed', { userId: user.id });
    
    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso. Faça login novamente.',
      redirectTo: '/login',
    });
  } catch (error) {
    logger.error('Reset password error', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

