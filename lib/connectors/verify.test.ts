import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyAiProviderConnection } from './verify';

describe('verifyAiProviderConnection', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // @ts-ignore
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    // @ts-ignore
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  it('does not reject groq with SSRF error even if customBaseUrl is localhost', async () => {
    // Mock global fetch so groq API call succeeds
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      if (String(url).includes('api.groq.com')) {
        return new Response(JSON.stringify({ data: [{ id: 'openai/gpt-oss-120b' }] }), { status: 200 });
      }
      return new Response('Not found', { status: 404 });
    });

    const result = await verifyAiProviderConnection('groq', 'gsk_test123456789', {
      customBaseUrl: 'http://localhost:11434',
      modelName: 'openai/gpt-oss-120b',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Groq Cloud API key verified successfully');
  });

  it('requires an API key for groq', async () => {
    const result = await verifyAiProviderConnection('groq', '');
    expect(result.success).toBe(false);
    expect(result.message).toContain('API key is required');
  });

  it('rejects custom provider if customBaseUrl is internal/localhost in production', async () => {
    const result = await verifyAiProviderConnection('custom', 'some-key', {
      customBaseUrl: 'http://localhost:11434',
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain('Access to internal and local hostnames is forbidden');
  });
});
