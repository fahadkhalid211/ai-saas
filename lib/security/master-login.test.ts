import { describe, it, expect, beforeAll } from 'vitest';

const KEY = 'master-test-key-'.padEnd(40, 'x');
let n = 0;

function post(url: string, body: unknown) {
  return new Request(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.9.0.${++n}` },
    body: JSON.stringify(body),
  });
}

describe('master sign-in', () => {
  beforeAll(() => {
    process.env.ADMIN_API_KEY = KEY;
    delete process.env.MASTER_ADMIN_EMAIL;
  });

  it('needs both the master e-mail and the key', async () => {
    const { POST } = await import('../../app/api/master/auth/route');
    const ok = await POST(post('/api/master/auth', { email: 'ItsFahad9@gmail.com', key: KEY }));
    expect(ok.status).toBe(200);
    expect(ok.headers.get('set-cookie')).toContain('kortex_admin_session=');
    expect(await ok.json()).toMatchObject({ success: true, isMasterAdmin: true, member: { email: 'itsfahad9@gmail.com' } });

    const wrongEmail = await POST(post('/api/master/auth', { email: 'someone@else.com', key: KEY }));
    const wrongKey = await POST(post('/api/master/auth', { email: 'itsfahad9@gmail.com', key: 'nope' }));
    const noEmail = await POST(post('/api/master/auth', { key: KEY }));
    for (const r of [wrongEmail, wrongKey, noEmail]) {
      expect(r.status).toBe(401);
      expect(r.headers.get('set-cookie')).toBeNull();
    }
    // Same body for every failure, so the response does not say which half was wrong.
    expect(await wrongEmail.json()).toEqual(await wrongKey.json());
  });

  it('throttles repeated attempts from one address', async () => {
    const { POST } = await import('../../app/api/master/auth/route');
    const mk = () =>
      new Request('http://localhost/api/master/auth', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.8.8.8' },
        body: JSON.stringify({ email: 'x@y.com', key: 'bad' }),
      });
    const codes: number[] = [];
    for (let i = 0; i < 8; i++) codes.push((await POST(mk())).status);
    // Wrong guesses are refused, then the limiter (5 a minute) starts answering 429.
    expect(codes[0]).toBe(401);
    expect(codes[7]).toBe(429);
  });

  it('is no longer accepted by the customer sign-in route', async () => {
    const { POST } = await import('../../app/api/auth/route');
    const viaKey = await POST(post('/api/auth', { mode: 'admin', key: KEY }));
    expect(viaKey.status).toBe(400);
    expect(viaKey.headers.get('set-cookie')).toBeNull();
    const viaPassword = await POST(post('/api/auth', { password: KEY }));
    expect(viaPassword.status).toBe(400);
  });
});
