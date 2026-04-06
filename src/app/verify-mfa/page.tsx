import { redirect } from 'next/navigation';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { initiateMfaAction } from '@/lib/actions/auth';
import { MfaForm } from './mfa-form';

export default async function VerifyMfaPage() {
  // Get authenticated user from cookies (Server Component)
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // If no user, redirect to login
  if (error || !user) {
    redirect('/login');
  }

  // Guardrail: if user already has an active MFA-verified custom session,
  // avoid creating a new MFA cycle when this page is re-rendered.
  const adminSupabase = await createAdminClient();
  const { data: activeVerifiedSession } = await adminSupabase
    .from('user_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .eq('mfa_verified', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeVerifiedSession) {
    redirect('/dashboard');
  }

  // User is authenticated - initiate MFA
  const mfaResult = await initiateMfaAction(user.id);

  // If MFA initiation failed, redirect to login with error
  if (!mfaResult.success) {
    redirect('/login?error=mfa_failed');
  }

  // Render MFA form with session data
  return (
    <MfaForm
      sessionId={mfaResult.data!.sessionId}
      channel={(mfaResult.data!.mfaChannel as 'whatsapp' | 'sms') || 'whatsapp'}
      testOtpCode={mfaResult.data?.testOtpCode}
    />
  );
}

// Loading state while Server Component loads
export function generateMetadata() {
  return {
    title: 'Verificação MFA - Mary',
  };
}
