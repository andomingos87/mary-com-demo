import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Configuration for OTP
const OTP_CONFIG = {
  length: 6,
  expiresInMinutes: 5,
  maxAttempts: 3,
};

/**
 * Generate a cryptographically secure OTP code
 */
export function generateOtpCode(length: number = OTP_CONFIG.length): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

/**
 * Hash OTP code using a slow salted bcrypt hash.
 */
export async function hashOtpCode(code: string): Promise<string> {
  return bcrypt.hash(code, 12);
}

/**
 * Create and store a new OTP for a user
 */
export async function createOtp(
  userId: string,
  phoneNumber: string,
  channel: 'whatsapp' | 'sms' | 'email' = 'whatsapp',
  purpose: 'mfa' | 'recovery' | 'verification' = 'mfa'
): Promise<{ code: string; expiresAt: Date } | null> {
  const supabase = await createAdminClient();
  
  const code = generateOtpCode();
  const codeHash = await hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_CONFIG.expiresInMinutes * 60 * 1000);
  
  // Invalidate any existing unused OTPs for this user and purpose
  await supabase
    .from('otp_codes')
    .update({ is_used: true })
    .eq('user_id', userId)
    .eq('purpose', purpose)
    .eq('is_used', false);
  
  // Create new OTP
  const { error } = await supabase.from('otp_codes').insert({
    user_id: userId,
    code_hash: codeHash,
    channel,
    purpose,
    phone_number: phoneNumber,
    max_attempts: OTP_CONFIG.maxAttempts,
    expires_at: expiresAt.toISOString(),
  });
  
  if (error) {
    logger.error('Failed to create OTP', { error, userId });
    return null;
  }
  
  logger.info('OTP created', { userId, channel, purpose, expiresAt });
  return { code, expiresAt };
}

/**
 * Verify an OTP code for a user
 */
export async function verifyOtp(
  userId: string,
  code: string,
  purpose: 'mfa' | 'recovery' | 'verification' = 'mfa'
): Promise<{ success: boolean; message: string }> {
  const supabase = await createAdminClient();
  
  // Find active OTP
  const { data: otpRecords, error: findError } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('purpose', purpose)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (findError || !otpRecords || otpRecords.length === 0) {
    logger.warn('No valid OTP found', { userId, purpose });
    return { success: false, message: 'Código OTP inválido ou expirado' };
  }
  
  const otp = otpRecords[0];
  
  // Check max attempts
  if (otp.attempts >= otp.max_attempts) {
    logger.warn('OTP max attempts exceeded', { userId, purpose });
    return { success: false, message: 'Número máximo de tentativas excedido' };
  }
  
  // Old SHA-based records are invalidated to force rotation to bcrypt.
  if (typeof otp.code_hash === 'string' && !otp.code_hash.startsWith('$2')) {
    await supabase
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', otp.id);

    logger.warn('Legacy OTP hash invalidated', { userId, purpose, otpId: otp.id });
    return { success: false, message: 'Código expirado. Solicite um novo código para continuar.' };
  }

  const isCodeValid = await bcrypt.compare(code, otp.code_hash);

  // Verify code
  if (isCodeValid) {
    // Mark as used
    await supabase
      .from('otp_codes')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', otp.id);
    
    logger.info('OTP verified successfully', { userId, purpose });
    return { success: true, message: 'Código verificado com sucesso' };
  }
  
  // Increment attempts
  await supabase
    .from('otp_codes')
    .update({ attempts: otp.attempts + 1 })
    .eq('id', otp.id);
  
  const remainingAttempts = otp.max_attempts - otp.attempts - 1;
  logger.warn('Invalid OTP code', { userId, purpose, remainingAttempts });
  
  return {
    success: false,
    message: `Código incorreto. ${remainingAttempts} tentativa(s) restante(s)`,
  };
}

/**
 * Get remaining attempts for current OTP
 */
export async function getOtpRemainingAttempts(
  userId: string,
  purpose: 'mfa' | 'recovery' | 'verification' = 'mfa'
): Promise<number> {
  const supabase = await createAdminClient();
  
  const { data } = await supabase
    .from('otp_codes')
    .select('attempts, max_attempts')
    .eq('user_id', userId)
    .eq('purpose', purpose)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (!data) return 0;
  return data.max_attempts - data.attempts;
}

