import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { getZApiStatus, sendMessageViaZApi } from '@/lib/auth/providers/z-api';
import type { Database } from '@/types/database';

type WhatsAppTemplateType = Database['public']['Enums']['whatsapp_template_type'];
type WhatsAppMessageStatus = Database['public']['Enums']['whatsapp_message_status'];

// Template definitions for WhatsApp OTP and security alerts.
const TEMPLATES = {
  otp_mfa: {
    message: (params: { code: string }) =>
      `[Mary] Seu código de verificação é: ${params.code}. Válido por 5 minutos. Não compartilhe este código.`,
  },
  otp_recovery: {
    message: (params: { code: string }) =>
      `[Mary] Seu código de recuperação é: ${params.code}. Válido por 5 minutos. Se você não solicitou, ignore esta mensagem.`,
  },
  new_device_alert: {
    message: (params: { device: string; location: string; time: string }) =>
      `[Mary] Novo dispositivo detectado. Dispositivo: ${params.device}. Local: ${params.location}. Horário: ${params.time}.`,
  },
  country_change_alert: {
    message: (params: { country: string; time: string }) =>
      `[Mary] Detectamos acesso de outro país. País: ${params.country}. Horário: ${params.time}. Se não foi você, altere sua senha.`,
  },
  session_invalidated: {
    message: (params: { device: string; time: string }) =>
      `[Mary] Sua sessão foi invalidada no dispositivo ${params.device} às ${params.time}. Faça login novamente para continuar.`,
  },
};

function renderTemplateMessage(templateType: WhatsAppTemplateType, templateParams: Record<string, string>): string | null {
  switch (templateType) {
    case 'otp_mfa': {
      const code = templateParams.code;
      return code ? TEMPLATES.otp_mfa.message({ code }) : null;
    }
    case 'otp_recovery': {
      const code = templateParams.code;
      return code ? TEMPLATES.otp_recovery.message({ code }) : null;
    }
    case 'new_device_alert': {
      const { device, location, time } = templateParams;
      return device && location && time ? TEMPLATES.new_device_alert.message({ device, location, time }) : null;
    }
    case 'country_change_alert': {
      const { country, time } = templateParams;
      return country && time ? TEMPLATES.country_change_alert.message({ country, time }) : null;
    }
    case 'session_invalidated': {
      const { device, time } = templateParams;
      return device && time ? TEMPLATES.session_invalidated.message({ device, time }) : null;
    }
    default:
      return null;
  }
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a WhatsApp message via dedicated Z-API provider adapter.
 */
async function sendWhatsAppMessage(
  phoneNumber: string,
  templateType: WhatsAppTemplateType,
  templateParams: Record<string, string>
): Promise<SendMessageResult> {
  const messageText = renderTemplateMessage(templateType, templateParams);
  if (!messageText) {
    return { success: false, error: `Invalid template payload for ${templateType}` };
  }

  try {
    const result = await sendMessageViaZApi(phoneNumber, messageText);

    if (!result.success) {
      logger.error('Failed to send WhatsApp message via Z-API', {
        phoneNumber,
        templateType,
        errorCode: result.errorCode,
        error: result.error,
      });
      return {
        success: false,
        error: result.error || 'Failed to send WhatsApp message',
      };
    }

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    logger.error('Failed to send WhatsApp message', { error, phoneNumber, templateType });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Queue a WhatsApp message for sending
 * Messages are stored in the database for tracking and retry
 */
export async function queueWhatsAppMessage(
  userId: string | null,
  phoneNumber: string,
  templateType: WhatsAppTemplateType,
  templateParams: Record<string, string>
): Promise<{ success: boolean; messageId?: string }> {
  const supabase = await createAdminClient();
  
  // Create message record
  const { data: message, error: insertError } = await supabase
    .from('whatsapp_messages')
    .insert({
      user_id: userId,
      phone_number: phoneNumber,
      template_type: templateType,
      template_params: templateParams,
      status: 'pending',
    })
    .select()
    .single();
  
  if (insertError || !message) {
    logger.error('Failed to queue WhatsApp message', { insertError, userId, phoneNumber });
    return { success: false };
  }
  
  // Attempt to send immediately
  const result = await sendWhatsAppMessage(phoneNumber, templateType, templateParams);
  
  // Update message status
  const providerStatus = getZApiStatus();
  const newStatus: WhatsAppMessageStatus = result.success
    ? (providerStatus.mode === 'mock' ? 'mock_sent' : 'sent')
    : 'failed';
  
  await supabase
    .from('whatsapp_messages')
    .update({
      status: newStatus,
      provider_message_id: result.messageId,
      error_message: result.error,
      sent_at: result.success ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', message.id);
  
  return {
    success: result.success,
    messageId: message.id,
  };
}

/**
 * Send OTP via WhatsApp
 */
export async function sendOtpViaWhatsApp(
  userId: string,
  phoneNumber: string,
  code: string,
  purpose: 'mfa' | 'recovery' = 'mfa'
): Promise<boolean> {
  const templateType: WhatsAppTemplateType = purpose === 'mfa' ? 'otp_mfa' : 'otp_recovery';
  
  const result = await queueWhatsAppMessage(userId, phoneNumber, templateType, { code });
  
  if (result.success) {
    // Log audit event
    const supabase = await createAdminClient();
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'auth.otp_sent',
      metadata: {
        channel: 'whatsapp',
        purpose,
        phone_number_masked: maskPhoneNumber(phoneNumber),
      },
    });
  }
  
  return result.success;
}

/**
 * Send new device alert via WhatsApp
 */
export async function sendNewDeviceAlert(
  userId: string,
  phoneNumber: string,
  deviceInfo: { device: string; location: string }
): Promise<boolean> {
  const result = await queueWhatsAppMessage(userId, phoneNumber, 'new_device_alert', {
    device: deviceInfo.device,
    location: deviceInfo.location,
    time: new Date().toLocaleString('pt-BR'),
  });
  
  return result.success;
}

/**
 * Send country change alert via WhatsApp
 */
export async function sendCountryChangeAlert(
  userId: string,
  phoneNumber: string,
  country: string
): Promise<boolean> {
  const result = await queueWhatsAppMessage(userId, phoneNumber, 'country_change_alert', {
    country,
    time: new Date().toLocaleString('pt-BR'),
  });
  
  return result.success;
}

/**
 * Mask phone number for logging (privacy)
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length < 8) return '***';
  return phone.slice(0, 4) + '****' + phone.slice(-2);
}

/**
 * Check if WhatsApp integration is available
 */
export function isWhatsAppAvailable(): boolean {
  return getZApiStatus().available;
}

/**
 * Get WhatsApp integration status
 */
export function getWhatsAppStatus(): {
  available: boolean;
  mode: 'production' | 'mock';
} {
  return getZApiStatus();
}

