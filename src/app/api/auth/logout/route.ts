import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { invalidateAllSessions } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user before logout
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Invalidate all sessions
      await invalidateAllSessions(user.id);
      
      // Log audit event
      const adminSupabase = await createAdminClient();
      await adminSupabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'auth.logout',
        metadata: {},
      });
      
      logger.info('User logged out', { userId: user.id });
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
      redirectTo: '/login',
    });
  } catch (error) {
    logger.error('Logout error', { error });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

