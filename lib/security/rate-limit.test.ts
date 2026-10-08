import { describe, it, expect } from 'vitest';
import { checkRateLimit, enforceRateLimit, getClientIp } from './rate-limit';

describe('Rate Limiting Module', () => {
  it('trusts cf-connecting-ip only when the deployment says Cloudflare is in front (TRUST_CLOUDFLARE)', () => {
    const req = () => new Request('http://localhost', { headers: { 'cf-connecting-ip': '203.0.113.195', 'x-forwarded-for': '9.9.9.9' } });
    const original = process.env.TRUST_CLOUDFLARE;
    try {
      // anywhere else the caller can send any value, which would give every request its own rate-limit bucket
      delete process.env.TRUST_CLOUDFLARE;
      expect(getClientIp(req())).toBe('untrusted-direct-client');
      process.env.TRUST_CLOUDFLARE = 'true';
      expect(getClientIp(req())).toBe('203.0.113.195');
    } finally {
      if (original === undefined) delete process.env.TRUST_CLOUDFLARE;
      else process.env.TRUST_CLOUDFLARE = original;
    }
  });

  it('should ignore spoofable x-forwarded-for/x-real-ip when no trusted proxy is configured', () => {
    // Without Cloudflare or an explicit trusted-proxy signal, these headers
    // are entirely attacker-controlled and must not be used to identify a
    // client for rate-limiting purposes (otherwise limits are trivially
    // bypassed by rotating a fake header per request).
    const req1 = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
    });
    expect(getClientIp(req1)).toBe('untrusted-direct-client');

    const req2 = new Request('http://localhost', {
      headers: { 'x-real-ip': '198.51.100.4' },
    });
    expect(getClientIp(req2)).toBe('untrusted-direct-client');

    const req3 = new Request('http://localhost');
    expect(getClientIp(req3)).toBe('untrusted-direct-client');
  });

  it('should trust x-forwarded-for/x-real-ip when TRUST_PROXY_HEADERS is explicitly enabled', () => {
    const original = process.env.TRUST_PROXY_HEADERS;
    process.env.TRUST_PROXY_HEADERS = 'true';
    try {
      const req1 = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
      });
      expect(getClientIp(req1)).toBe('203.0.113.195');

      const req2 = new Request('http://localhost', {
        headers: { 'x-real-ip': '198.51.100.4' },
      });
      expect(getClientIp(req2)).toBe('198.51.100.4');
    } finally {
      if (original === undefined) delete process.env.TRUST_PROXY_HEADERS;
      else process.env.TRUST_PROXY_HEADERS = original;
    }
  });

  it('should allow requests within limit and track remaining quota', () => {
    const key = `test_key_${Date.now()}_allow`;
    const opts = { windowMs: 10000, max: 3 };

    const first = checkRateLimit(key, opts);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);

    const second = checkRateLimit(key, opts);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);

    const third = checkRateLimit(key, opts);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    const fourth = checkRateLimit(key, opts);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it('enforceRateLimit should return null for allowed requests and 429 when quota is exhausted', () => {
    const keyPrefix = `test_enforce_${Date.now()}`;
    const opts = { windowMs: 10000, max: 2 };
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '192.168.1.50' },
    });

    const call1 = enforceRateLimit(req, keyPrefix, opts);
    expect(call1.errorResponse).toBeNull();
    expect(call1.remaining).toBe(1);

    const call2 = enforceRateLimit(req, keyPrefix, opts);
    expect(call2.errorResponse).toBeNull();
    expect(call2.remaining).toBe(0);

    const call3 = enforceRateLimit(req, keyPrefix, opts);
    expect(call3.errorResponse).not.toBeNull();
    expect(call3.errorResponse?.status).toBe(429);
    expect(call3.errorResponse?.headers.get('X-RateLimit-Remaining')).toBe('0');
  });
});
