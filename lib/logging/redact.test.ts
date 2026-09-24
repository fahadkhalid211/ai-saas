import { describe, it, expect } from 'vitest';
import { redactString, redactValue, safeMeta, safePath } from './redact';

describe('redaction', () => {
  it('masks values under sensitive keys, at any depth', () => {
    const out = redactValue({
      email: 'a@b.com',
      password: 'hunter2',
      nested: { apiKey: 'abc', Authorization: 'Bearer xyz', cookie: 'kortex_admin_session=abc', ok: 1 },
      list: [{ token: 't' }, { fine: 'yes' }],
    }) as any;
    expect(out.password).toBe('[redacted]');
    expect(out.nested.apiKey).toBe('[redacted]');
    expect(out.nested.Authorization).toBe('[redacted]');
    expect(out.nested.cookie).toBe('[redacted]');
    expect(out.nested.ok).toBe(1);
    expect(out.list[0].token).toBe('[redacted]');
    expect(out.list[1].fine).toBe('yes');
    expect(out.email).toBe('a@b.com');
  });

  it('masks secrets that appear inside ordinary strings', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijk';
    const samples = [
      `session ${jwt} failed`,
      'key sk-proj-abcdefghijklmnopqrstuvwx used',
      'groq gsk_abcdefghijklmnopqrstuv',
      'google AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      'header Bearer abcdefghijklmnop12345',
      'connect postgresql://postgres:supersecret@155.248.251.71:5432/postgres failed',
      'GET /cb?code=4/0AbCdEf&state=xyz',
    ];
    for (const s of samples) {
      const out = redactString(s);
      expect(out).not.toMatch(/supersecret|4\/0AbCdEf|abcdefghijklmnopqrstuvwx\b|eyJzdWIi|AIzaSy|gsk_abc/);
    }
    expect(redactString('GET /cb?code=4/0AbCdEf&state=xyz')).toContain('code=[redacted]');
  });

  it('bounds string length, depth, array and key counts', () => {
    expect(redactString('x'.repeat(2000)).length).toBeLessThan(600);
    const deep: any = {};
    let cur = deep;
    for (let i = 0; i < 12; i++) cur = cur.a = {};
    expect(JSON.stringify(redactValue(deep))).toContain('[max-depth]');
    expect((redactValue(Array.from({ length: 100 }, (_, i) => i)) as unknown[]).length).toBe(21);
    const wide = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`k${i}`, i]));
    expect(Object.keys(redactValue(wide) as object).length).toBeLessThanOrEqual(41);
  });

  it('survives circular structures and errors', () => {
    const a: any = { name: 'a' };
    a.self = a;
    expect((redactValue(a) as any).self).toBe('[circular]');
    const e = redactValue(new Error('boom with sk-live-abcdefghijklmnopqrstuv')) as any;
    expect(e.name).toBe('Error');
    expect(e.message).not.toContain('abcdefghijklmnopqrstuv');
  });

  it('replaces an oversized meta object with a truncation marker', () => {
    const big = safeMeta({ blob: 'y'.repeat(400), more: Array.from({ length: 20 }, () => 'z'.repeat(400)) }, 2000) as any;
    expect(big.truncated).toBe(true);
    expect(safeMeta(null)).toBeNull();
    expect(safeMeta({ a: 1 })).toEqual({ a: 1 });
  });

  it('keeps query keys but never query values in paths', () => {
    expect(safePath('/api/x', '?token=abc123&page=2')).toBe('/api/x?token=…&page=…');
    expect(safePath('/api/x')).toBe('/api/x');
  });
});
