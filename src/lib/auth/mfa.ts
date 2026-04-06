/**
 * MFA (Multi-Factor Authentication) Service
 * 
 * Handles the complete MFA flow:
 * 1. Generate OTP after primary authentication
 * 2. Send OTP via WhatsApp (preferred) or SMS (fallback)
 * 3. Verify OTP and mark session as MFA verified
 */

import { createOtp, verifyOtp as verifyOtpCode } from './otp';
import { sendOtpViaWhatsApp, isWhatsAppAvailable } from './whatsapp';
import { sendOtpViaSms } from './sms';
import { shouldExposeOtpInUi } from './mfa-test-mode';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export type MfaChannel = 'whatsapp' | 'sms' | 'email';

interface MfaInitResult {
  success: boolean;
  channel: MfaChannel;
  expiresAt?: Date;
  testOtpCode?: string;
  error?: string;
}

interface MfaVerifyResult {
  success: boolean;
  message: string;
  sessionId?: string;
}

/**
 * Initialize MFA for a user after primary authentication
 */
export async function initiateMfa(
  userId: string,
  preferredChannel: MfaChannel = 'whatsapp'
): Promise<MfaInitResult> {
  const supabase = await createAdminClient();
  
  // Get user profile with phone number
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('phone_number, whatsapp_number, whatsapp_verified')
    .eq('user_id', userId)
    .single();
  
  if (profileError || !profile) {
    logger.error('Failed to get user profile for MFA', { userId, profileError });
    return {
      success: false,
      channel: preferredChannel,
      error: 'Perfil de usuário não encontrado',
    };
  }
  
  // Determine phone number to use
  const resolvedPhoneNumber = preferredChannel === 'whatsapp'
    ? profile.whatsapp_number || profile.phone_number
    : profile.phone_number || profile.whatsapp_number;
  // Test mode fallback: allows QA users without profile phone to validate MFA UI flow.
  const phoneNumber = resolvedPhoneNumber || (shouldExposeOtpInUi() ? '+5511999999999' : null);
  
  if (!phoneNumber) {
    return {
      success: false,
      channel: preferredChannel,
      error: 'Número de telefone não cadastrado',
    };
  }
  
  // Determine actual channel to use
  let actualChannel: MfaChannel = preferredChannel;
  if (preferredChannel === 'whatsapp' && !isWhatsAppAvailable()) {
    // Fallback to SMS if WhatsApp is not configured
    actualChannel = 'sms';
    logger.info('Falling back to SMS as WhatsApp is not available', { userId });
  }
  
  // Generate OTP
  const otpResult = await createOtp(userId, phoneNumber, actualChannel, 'mfa');
  if (!otpResult) {
    return {
      success: false,
      channel: actualChannel,
      error: 'Falha ao gerar código de verificação',
    };
  }
  
  // Send OTP via appropriate channel
  let sendSuccess = false;
  if (actualChannel === 'whatsapp') {
    sendSuccess = await sendOtpViaWhatsApp(userId, phoneNumber, otpResult.code, 'mfa');
  } else {
    sendSuccess = await sendOtpViaSms(userId, phoneNumber, otpResult.code, 'mfa');
  }
  
  if (!sendSuccess) {
    return {
      success: false,
      channel: actualChannel,
      error: 'Falha ao enviar código de verificação',
    };
  }
  
  logger.info('MFA initiated', { userId, channel: actualChannel });
  
  // Return code for UI display in test mode
  const showCodeInUI = process.env.SHOW_MFA_CODE === 'true';
  const canExposeInUi = shouldExposeOtpInUi();

  if (showCodeInUI) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('SHOW_MFA_CODE está habilitado em produção — OTP não será logado. Desabilite esta variável em produção.', { userId });
    } else {
      logger.info('MFA test mode: OTP code', { userId, code: otpResult.code });
    }
  }

  return {
    success: true,
    channel: actualChannel,
    expiresAt: otpResult.expiresAt,
    testOtpCode: canExposeInUi ? otpResult.code : undefined,
  };
}

/**
 * Verify MFA code and mark session as verified
 */
export async function verifyMfa(
  userId: string,
  code: string,
  sessionId: string
): Promise<MfaVerifyResult> {
  const supabase = await createAdminClient();
  
  // Verify OTP code
  const verifyResult = await verifyOtpCode(userId, code, 'mfa');
  
  if (!verifyResult.success) {
    // Log failed attempt
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'auth.mfa_failed',
      metadata: { reason: verifyResult.message },
    });
    
    return {
      success: false,
      message: verifyResult.message,
    };
  }
  
  // Mark session as MFA verified
  const { error: updateError } = await supabase
    .from('user_sessions')
    .update({ mfa_verified: true })
    .eq('id', sessionId)
    .eq('user_id', userId);
  
  if (updateError) {
    logger.error('Failed to update session MFA status', { updateError, sessionId });
    return {
      success: false,
      message: 'Erro ao atualizar sessão',
    };
  }
  
  // Log successful MFA
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'auth.mfa_success',
    metadata: { session_id: sessionId },
  });
  
  logger.info('MFA verified successfully', { userId, sessionId });
  
  return {
    success: true,
    message: 'Verificação concluída com sucesso',
    sessionId,
  };
}

/**
 * Resend MFA code
 */
export async function resendMfaCode(
  userId: string,
  channel?: MfaChannel
): Promise<MfaInitResult> {
  // Simply re-initiate MFA
  return initiateMfa(userId, channel);
}

/**
 * Check if user has MFA enabled
 */
export async function isMfaEnabled(userId: string): Promise<boolean> {
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .from('user_profiles')
    .select('mfa_enabled')
    .eq('user_id', userId)
    .single();
  
  // MFA is mandatory per requirements, default to true
  return data?.mfa_enabled ?? true;
}

/**
 * Check if current session has completed MFA
 */
export async function isSessionMfaVerified(sessionId: string): Promise<boolean> {
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .from('user_sessions')
    .select('mfa_verified')
    .eq('id', sessionId)
    .eq('is_active', true)
    .single();
  
  return data?.mfa_verified ?? false;
}

