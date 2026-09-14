import { describe, it, expect } from 'vitest';
import { checkRateLimit, enforceRateLimit, getClientIp } from './rate-limit';

describe('Rate Limiting Module', () => {
  it('should extract client IP from request headers', () => {
    const req1 = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
    });
    expect(getClientIp(req1)).toBe('203.0.113.195');

    const req2 = new Request('http://localhost', {
      headers: { 'x-real-ip': '198.51.100.4' },
    });
    expect(getClientIp(req2)).toBe('198.51.100.4');

    const req3 = new Request('http://localhost');
    expect(getClientIp(req3)).toBe('127.0.0.1');
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
