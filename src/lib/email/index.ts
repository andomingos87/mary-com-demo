/**
 * Email Service - Abstração para envio de emails transacionais
 * 
 * Este módulo fornece uma camada de abstração para envio de emails.
 * Em desenvolvimento, usa um modo mock que loga os emails no console.
 * Em produção, integra com Brevo (SendInBlue).
 * 
 * Configuração via variáveis de ambiente:
 * - EMAIL_PROVIDER: 'brevo' | 'mock' (default: 'mock')
 * - BREVO_API_KEY: Chave de API da Brevo
 * - EMAIL_FROM_ADDRESS: Email de origem (default: noreply@mary.com.br)
 * - EMAIL_FROM_NAME: Nome de origem (default: Mary Platform)
 */

import { logger } from '@/lib/logger';

// ============================================
// Configuration
// ============================================

export const EMAIL_CONFIG = {
  provider: process.env.EMAIL_PROVIDER || 'mock',
  brevoApiKey: process.env.BREVO_API_KEY || '',
  fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@mary.com.br',
  fromName: process.env.EMAIL_FROM_NAME || 'Mary Platform',
  mockMode: !process.env.BREVO_API_KEY || process.env.EMAIL_PROVIDER === 'mock',
  // Base URL for links in emails
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// ============================================
// Types
// ============================================

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  name: string;
  content: string; // Base64 encoded
  contentType: string;
}

export interface SendEmailParams {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: EmailAttachment[];
  tags?: string[];
  templateId?: number; // For Brevo template-based emails
  templateParams?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================
// Email Service
// ============================================

/**
 * Send email using configured provider
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  // Mock mode for development
  if (EMAIL_CONFIG.mockMode) {
    return sendMockEmail(params);
  }

  // Brevo provider
  if (EMAIL_CONFIG.provider === 'brevo') {
    return sendViaBrevo(params);
  }

  return { success: false, error: 'No email provider configured' };
}

/**
 * Mock email sender for development
 */
async function sendMockEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const recipients = Array.isArray(params.to) ? params.to : [params.to];
  const messageId = `mock_email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  logger.info('[MOCK EMAIL] Message would be sent', {
    messageId,
    to: recipients.map(r => r.email),
    subject: params.subject,
    tags: params.tags,
  });

  // Log to console for easy development testing
  console.log('\n========================================');
  console.log('📧 MOCK EMAIL MESSAGE');
  console.log('----------------------------------------');
  console.log(`Message ID: ${messageId}`);
  console.log(`From: ${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromAddress}>`);
  console.log(`To: ${recipients.map(r => r.name ? `${r.name} <${r.email}>` : r.email).join(', ')}`);
  console.log(`Subject: ${params.subject}`);
  if (params.tags?.length) {
    console.log(`Tags: ${params.tags.join(', ')}`);
  }
  console.log('----------------------------------------');
  console.log('HTML Content Preview:');
  console.log('----------------------------------------');
  // Strip HTML tags for console preview
  const textPreview = params.textContent || 
    params.htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 500);
  console.log(textPreview);
  console.log('========================================\n');

  return {
    success: true,
    messageId,
  };
}

/**
 * Send email via Brevo (SendInBlue) API
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 */
async function sendViaBrevo(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const recipients = Array.isArray(params.to) ? params.to : [params.to];

    const payload: Record<string, unknown> = {
      sender: {
        name: EMAIL_CONFIG.fromName,
        email: EMAIL_CONFIG.fromAddress,
      },
      to: recipients.map(r => ({
        email: r.email,
        name: r.name || r.email.split('@')[0],
      })),
      subject: params.subject,
    };

    // Use template or direct content
    if (params.templateId) {
      payload.templateId = params.templateId;
      if (params.templateParams) {
        payload.params = params.templateParams;
      }
    } else {
      payload.htmlContent = params.htmlContent;
      if (params.textContent) {
        payload.textContent = params.textContent;
      }
    }

    // Optional fields
    if (params.replyTo) {
      payload.replyTo = {
        email: params.replyTo.email,
        name: params.replyTo.name,
      };
    }

    if (params.cc?.length) {
      payload.cc = params.cc.map(r => ({
        email: r.email,
        name: r.name,
      }));
    }

    if (params.bcc?.length) {
      payload.bcc = params.bcc.map(r => ({
        email: r.email,
        name: r.name,
      }));
    }

    if (params.attachments?.length) {
      payload.attachment = params.attachments.map(a => ({
        name: a.name,
        content: a.content,
        contentType: a.contentType,
      }));
    }

    if (params.tags?.length) {
      payload.tags = params.tags;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': EMAIL_CONFIG.brevoApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Brevo API error: ${response.status}`);
    }

    const data = await response.json();

    logger.info('Email sent via Brevo', {
      messageId: data.messageId,
      to: recipients.map(r => r.email),
      subject: params.subject,
    });

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    logger.error('Brevo email failed', { error, subject: params.subject });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get email provider status
 */
export function getEmailProviderStatus(): {
  provider: string;
  available: boolean;
  mode: 'production' | 'mock';
  fromAddress: string;
} {
  return {
    provider: EMAIL_CONFIG.provider,
    available: !EMAIL_CONFIG.mockMode,
    mode: EMAIL_CONFIG.mockMode ? 'mock' : 'production',
    fromAddress: EMAIL_CONFIG.fromAddress,
  };
}

