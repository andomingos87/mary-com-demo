import { logger } from '@/lib/logger';

export type ZApiErrorCode =
  | 'config_error'
  | 'auth_error'
  | 'timeout_error'
  | 'network_error'
  | 'provider_error'
  | 'validation_error';

export interface ZApiSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: ZApiErrorCode;
  retryable: boolean;
  mode: 'production' | 'mock';
}

interface ZApiConfig {
  baseUrl: string;
  instanceId: string;
  token: string;
  clientToken: string;
  timeoutMs: number;
  maxRetries: number;
  retryBaseDelayMs: number;
  forceMock: boolean;
  missingRequiredConfig: boolean;
  mode: 'production' | 'mock';
}

interface ZApiErrorResponse {
  error?: string;
  message?: string;
}

function parsePositiveInt(rawValue: string | undefined, fallback: number): number {
  if (!rawValue) return fallback;
  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getZApiConfig(): ZApiConfig {
  const baseUrl = process.env.Z_API_BASE_URL || 'https://api.z-api.io';
  const instanceId = process.env.Z_API_INSTANCE_ID || '';
  const token = process.env.Z_API_TOKEN || '';
  const clientToken = process.env.Z_API_CLIENT_TOKEN || '';
  const forceMock = process.env.WHATSAPP_FORCE_MOCK === 'true';
  const missingRequiredConfig = !instanceId || !token || !clientToken;
  const mode: 'production' | 'mock' = !forceMock && !missingRequiredConfig ? 'production' : 'mock';

  return {
    baseUrl,
    instanceId,
    token,
    clientToken,
    timeoutMs: parsePositiveInt(process.env.Z_API_TIMEOUT_MS, 8000),
    maxRetries: parsePositiveInt(process.env.Z_API_MAX_RETRIES, 2),
    retryBaseDelayMs: parsePositiveInt(process.env.Z_API_RETRY_BASE_DELAY_MS, 400),
    forceMock,
    missingRequiredConfig,
    mode,
  };
}

function classifyProviderError(status: number): { code: ZApiErrorCode; retryable: boolean } {
  if (status === 400 || status === 422) return { code: 'validation_error', retryable: false };
  if (status === 401 || status === 403) return { code: 'auth_error', retryable: false };
  if (status === 408 || status === 429 || status >= 500) return { code: 'provider_error', retryable: true };
  return { code: 'provider_error', retryable: false };
}

function normalizePhone(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(baseDelayMs: number, attempt: number): number {
  return baseDelayMs * Math.pow(2, attempt - 1);
}

function isRetryableError(errorCode: ZApiErrorCode | undefined): boolean {
  return errorCode === 'timeout_error' || errorCode === 'network_error' || errorCode === 'provider_error';
}

async function sendRequestWithTimeout(
  url: string,
  body: { phone: string; message: string },
  config: ZApiConfig
): Promise<ZApiSendResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.clientToken ? { 'Client-Token': config.clientToken } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      let parsedError: ZApiErrorResponse | null = null;
      try {
        parsedError = (await response.json()) as ZApiErrorResponse;
      } catch {
        parsedError = null;
      }

      const classified = classifyProviderError(response.status);
      return {
        success: false,
        errorCode: classified.code,
        retryable: classified.retryable,
        mode: config.mode,
        error: parsedError?.message || parsedError?.error || `Z-API returned HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as Record<string, unknown>;
    const rawMessageId = data.messageId || data.zapId || data.id || data.zaapId;
    const messageId = typeof rawMessageId === 'string' ? rawMessageId : `zapi_${Date.now()}`;

    return {
      success: true,
      messageId,
      retryable: false,
      mode: config.mode,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        errorCode: 'timeout_error',
        retryable: true,
        mode: config.mode,
        error: `Timeout ao enviar mensagem para Z-API (${config.timeoutMs}ms)`,
      };
    }

    return {
      success: false,
      errorCode: 'network_error',
      retryable: true,
      mode: config.mode,
      error: error instanceof Error ? error.message : 'Falha de rede ao enviar mensagem para Z-API',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendMessageViaZApi(phoneNumber: string, message: string): Promise<ZApiSendResult> {
  const config = getZApiConfig();

  if (config.mode === 'mock') {
    if (process.env.NODE_ENV === 'production' && config.missingRequiredConfig) {
      logger.error('Z-API unavailable in production due to missing env config', {
        missingInstanceId: !config.instanceId,
        missingToken: !config.token,
        missingClientToken: !config.clientToken,
      });
      return {
        success: false,
        errorCode: 'config_error',
        retryable: false,
        mode: 'mock',
        error: 'Configuração da Z-API ausente em produção',
      };
    }

    logger.info('[MOCK] Z-API message would be sent', {
      phoneNumber,
      messagePreview: message.slice(0, 80),
    });

    return {
      success: true,
      messageId: `mock_zapi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      retryable: false,
      mode: 'mock',
    };
  }

  const url = `${config.baseUrl.replace(/\/$/, '')}/instances/${config.instanceId}/token/${config.token}/send-text`;
  const payload = {
    phone: normalizePhone(phoneNumber),
    message,
  };

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt += 1) {
    const result = await sendRequestWithTimeout(url, payload, config);
    if (result.success || !isRetryableError(result.errorCode) || attempt > config.maxRetries) {
      return result;
    }

    const delayMs = getRetryDelayMs(config.retryBaseDelayMs, attempt);
    logger.warn('Z-API transient error, retrying', {
      attempt,
      maxRetries: config.maxRetries,
      delayMs,
      errorCode: result.errorCode,
      error: result.error,
    });
    await sleep(delayMs);
  }

  return {
    success: false,
    errorCode: 'provider_error',
    retryable: false,
    mode: config.mode,
    error: 'Falha desconhecida ao enviar mensagem para Z-API',
  };
}

export function getZApiStatus(): { available: boolean; mode: 'production' | 'mock' } {
  const config = getZApiConfig();
  return {
    available: config.mode === 'production',
    mode: config.mode,
  };
}
