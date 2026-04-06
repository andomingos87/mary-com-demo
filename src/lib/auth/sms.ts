/**
 * SMS Provider - Alternative to WhatsApp for OTP delivery
 * 
 * This module provides a fallback SMS provider when WhatsApp is not available.
 * In development, it uses a mock provider that logs OTPs to the console.
 * 
 * For production, integrate with providers like:
 * - Twilio
 * - AWS SNS
 * - MessageBird
 * - Vonage (Nexmo)
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// SMS Provider configuration
const SMS_CONFIG = {
  provider: process.env.SMS_PROVIDER || 'mock', // 'twilio', 'aws', 'mock'
  // Twilio config
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  // Mock mode
  mockMode: process.env.SMS_PROVIDER !== 'twilio' && process.env.SMS_PROVIDER !== 'aws',
};

interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS using configured provider
 */
async function sendSms(
  phoneNumber: string,
  message: string
): Promise<SendSmsResult> {
  // Mock mode for development
  if (SMS_CONFIG.mockMode) {
    logger.info('[MOCK SMS] Message would be sent', {
      phoneNumber,
      message,
    });
    
    // In development, also log to console for easy testing
    console.log('\n========================================');
    console.log('📱 MOCK SMS MESSAGE');
    console.log('----------------------------------------');
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log('========================================\n');
    
    return {
      success: true,
      messageId: `mock_sms_${Date.now()}`,
    };
  }
  
  // Twilio provider
  if (SMS_CONFIG.provider === 'twilio') {
    return sendViaTwilio(phoneNumber, message);
  }
  
  // AWS SNS provider
  if (SMS_CONFIG.provider === 'aws') {
    return sendViaAwsSns(phoneNumber, message);
  }
  
  return { success: false, error: 'No SMS provider configured' };
}

/**
 * Send SMS via Twilio
 */
async function sendViaTwilio(
  phoneNumber: string,
  message: string
): Promise<SendSmsResult> {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SMS_CONFIG.twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${SMS_CONFIG.twilioAccountSid}:${SMS_CONFIG.twilioAuthToken}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: SMS_CONFIG.twilioPhoneNumber,
          To: phoneNumber,
          Body: message,
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Twilio API error');
    }
    
    const data = await response.json();
    return { success: true, messageId: data.sid };
  } catch (error) {
    logger.error('Twilio SMS failed', { error, phoneNumber });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send SMS via AWS SNS (placeholder)
 */
async function sendViaAwsSns(
  phoneNumber: string,
  message: string
): Promise<SendSmsResult> {
  // AWS SNS implementation would go here
  // For now, return mock result
  logger.warn('AWS SNS not implemented, using mock');
  return {
    success: true,
    messageId: `aws_mock_${Date.now()}`,
  };
}

/**
 * Send OTP via SMS
 */
export async function sendOtpViaSms(
  userId: string,
  phoneNumber: string,
  code: string,
  purpose: 'mfa' | 'recovery' = 'mfa'
): Promise<boolean> {
  const messageTemplates = {
    mfa: `[Mary] Seu código de verificação é: ${code}. Válido por 5 minutos. Não compartilhe este código.`,
    recovery: `[Mary] Seu código de recuperação é: ${code}. Válido por 5 minutos. Se você não solicitou, ignore esta mensagem.`,
  };
  
  const message = messageTemplates[purpose];
  const result = await sendSms(phoneNumber, message);
  
  if (result.success) {
    // Log audit event
    const supabase = await createAdminClient();
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'auth.otp_sent',
      metadata: {
        channel: 'sms',
        purpose,
        phone_number_masked: maskPhoneNumber(phoneNumber),
        provider: SMS_CONFIG.provider,
      },
    });
  }
  
  return result.success;
}

/**
 * Mask phone number for logging
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length < 8) return '***';
  return phone.slice(0, 4) + '****' + phone.slice(-2);
}

/**
 * Get SMS provider status
 */
export function getSmsProviderStatus(): {
  provider: string;
  available: boolean;
  mode: 'production' | 'mock';
} {
  return {
    provider: SMS_CONFIG.provider,
    available: !SMS_CONFIG.mockMode,
    mode: SMS_CONFIG.mockMode ? 'mock' : 'production',
  };
}

