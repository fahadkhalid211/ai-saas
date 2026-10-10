import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verifyRecaptchaToken } from './recaptcha';

describe('verifyRecaptchaToken', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('bypasses gracefully when RECAPTCHA_SECRET_KEY is empty or not set', async () => {
    delete process.env.RECAPTCHA_SECRET_KEY;
    const res = await verifyRecaptchaToken('any-token');
    expect(res.success).toBe(true);
    expect(res.bypassed).toBe(true);
  });

  it('permits missing token in resilient mode (default) when adblockers prevent token', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'secret-test-key';
    delete process.env.RECAPTCHA_ENFORCE_STRICT;

    const res = await verifyRecaptchaToken(null);
    expect(res.success).toBe(true);
    expect(res.bypassed).toBe(true);

    const emptyRes = await verifyRecaptchaToken('   ');
    expect(emptyRes.success).toBe(true);
    expect(emptyRes.bypassed).toBe(true);
  });

  it('rejects missing token when RECAPTCHA_ENFORCE_STRICT is true', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'secret-test-key';
    process.env.RECAPTCHA_ENFORCE_STRICT = 'true';

    const res = await verifyRecaptchaToken(null);
    expect(res.success).toBe(false);
    expect(res.error).toBe('reCAPTCHA verification token is missing or invalid.');
  });

  it('succeeds when Google API returns success with a high score', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'secret-test-key';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'register',
        hostname: 'crescelo.com',
      }),
    } as any);

    const res = await verifyRecaptchaToken('valid-token', '1.2.3.4');
    expect(res.success).toBe(true);
    expect(res.score).toBe(0.9);
    expect(res.hostname).toBe('crescelo.com');
  });

  it('blocks request when Google API detects low bot score (< 0.3)', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'secret-test-key';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        score: 0.1,
        action: 'register',
      }),
    } as any);

    const res = await verifyRecaptchaToken('bot-token');
    expect(res.success).toBe(false);
    expect(res.error).toContain('bot score too low');
  });

  it('bypasses when Google returns invalid-input-secret (protecting SaaS from misconfigured key)', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'wrong-secret-key';
    process.env.RECAPTCHA_ENFORCE_STRICT = 'true';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        'error-codes': ['invalid-input-secret'],
      }),
    } as any);

    const res = await verifyRecaptchaToken('token-123');
    expect(res.success).toBe(true);
    expect(res.bypassed).toBe(true);
  });

  it('fails open when Google verification network fails or times out', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'secret-test-key';

    global.fetch = vi.fn().mockRejectedValue(new Error('Network connection timeout'));

    const res = await verifyRecaptchaToken('token-123');
    expect(res.success).toBe(true);
    expect(res.bypassed).toBe(true);
  });
});
