import { getZApiStatus, sendMessageViaZApi } from '@/lib/auth/providers/z-api';

describe('z-api provider', () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.Z_API_BASE_URL;
    delete process.env.Z_API_INSTANCE_ID;
    delete process.env.Z_API_TOKEN;
    delete process.env.Z_API_CLIENT_TOKEN;
    delete process.env.Z_API_MAX_RETRIES;
    delete process.env.Z_API_RETRY_BASE_DELAY_MS;
    delete process.env.Z_API_TIMEOUT_MS;
    delete process.env.WHATSAPP_FORCE_MOCK;
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('returns mock status when credentials are missing', () => {
    const status = getZApiStatus();
    expect(status).toEqual({ available: false, mode: 'mock' });
  });

  it('returns config error in production when credentials are missing', async () => {
    process.env.NODE_ENV = 'production';

    const result = await sendMessageViaZApi('+55 11 99999-9999', 'Mensagem teste');

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('config_error');
    expect(result.mode).toBe('mock');
  });

  it('sends message successfully in production mode', async () => {
    process.env.Z_API_BASE_URL = 'https://api.z-api.io';
    process.env.Z_API_INSTANCE_ID = 'instance-1';
    process.env.Z_API_TOKEN = 'token-1';
    process.env.Z_API_CLIENT_TOKEN = 'client-token-1';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: 'msg-123' }),
    });

    const result = await sendMessageViaZApi('+55 (11) 98888-7777', 'Mensagem teste');

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-123');
    expect(result.mode).toBe('production');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries transient failure and succeeds on next attempt', async () => {
    process.env.Z_API_BASE_URL = 'https://api.z-api.io';
    process.env.Z_API_INSTANCE_ID = 'instance-1';
    process.env.Z_API_TOKEN = 'token-1';
    process.env.Z_API_CLIENT_TOKEN = 'client-token-1';
    process.env.Z_API_MAX_RETRIES = '2';
    process.env.Z_API_RETRY_BASE_DELAY_MS = '1';

    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('temporary network failure'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'msg-retry-ok' }),
      });

    const result = await sendMessageViaZApi('+55 11 97777-6666', 'Mensagem retry');

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-retry-ok');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on auth error', async () => {
    process.env.Z_API_BASE_URL = 'https://api.z-api.io';
    process.env.Z_API_INSTANCE_ID = 'instance-1';
    process.env.Z_API_TOKEN = 'token-1';
    process.env.Z_API_CLIENT_TOKEN = 'client-token-1';
    process.env.Z_API_MAX_RETRIES = '3';

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'invalid token' }),
    });

    const result = await sendMessageViaZApi('+55 11 96666-5555', 'Mensagem auth');

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('auth_error');
    expect(result.retryable).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to mock mode when client token is missing', () => {
    process.env.Z_API_INSTANCE_ID = 'instance-1';
    process.env.Z_API_TOKEN = 'token-1';
    delete process.env.Z_API_CLIENT_TOKEN;

    const status = getZApiStatus();
    expect(status).toEqual({ available: false, mode: 'mock' });
  });
});
