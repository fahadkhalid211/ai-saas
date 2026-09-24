import { describe, it, expect, beforeAll } from 'vitest';

const KEY = 'oauth-test-key-'.padEnd(40, 'x');

function req(url: string, init: RequestInit = {}) {
  return new Request(`http://localhost${url}`, init);
}
const ctx = (provider: string) => ({ params: Promise.resolve({ provider }) });

describe('sign-in routes never trust what a browser sends', () => {
  beforeAll(() => {
    process.env.ADMIN_API_KEY = KEY;
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  });

  it('enterprise SSO cannot sign anyone in', async () => {
    const { POST, GET } = await import('../../app/api/auth/sso/route');
    const res = await POST(req('/api/auth/sso', { method: 'POST' }));
    expect(res.status).toBe(501);
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(await (await GET(req('/api/auth/sso'))).json()).toEqual({ ssoEnabled: false });
  });

  it('a posted e-mail, id token or "credential" does not create a session for google or apple', async () => {
    const { POST } = await import('../../app/api/auth/oauth/[provider]/route');
    for (const provider of ['google', 'apple']) {
      const res = await POST(req(`/api/auth/oauth/${provider}`, { method: 'POST' }));
      expect(res.status).toBe(405);
      expect(res.headers.get('set-cookie')).toBeNull();
    }
  });

  it('sign in with Apple is switched off (its callback issues no session)', async () => {
    const { GET } = await import('../../app/api/auth/oauth/[provider]/route');
    const res = await GET(req('/api/auth/oauth/apple?code=abc&id_token=eyJhbGciOiJub25lIn0.e30.'), ctx('apple'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login?message=');
    expect(res.headers.get('set-cookie') || '').not.toContain('kortex_admin_session');
  });

  it('starts Google sign-in with state + PKCE and binds it to the browser with a cookie', async () => {
    const { GET } = await import('../../app/api/auth/oauth/[provider]/route');
    const res = await GET(req('/api/auth/oauth/google'), ctx('google'));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get('location')!);
    expect(location.origin).toBe('https://accounts.google.com');
    const state = location.searchParams.get('state')!;
    expect(state.length).toBeGreaterThanOrEqual(24);
    expect(location.searchParams.get('code_challenge_method')).toBe('S256');
    expect(location.searchParams.get('code_challenge')).toBeTruthy();
    const cookie = res.headers.get('set-cookie')!;
    expect(cookie).toContain(`crescelo_oauth=${state}.`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
  });

  it('rejects a Google callback whose state does not match this browser (login CSRF)', async () => {
    const { GET } = await import('../../app/api/auth/oauth/[provider]/route');
    const noCookie = await GET(req('/api/auth/oauth/google?code=abc&state=forged'), ctx('google'));
    expect(noCookie.headers.get('location')).toContain('/login?message=');
    expect(noCookie.headers.get('set-cookie') || '').not.toContain('kortex_admin_session=ey');

    const wrongState = await GET(
      req('/api/auth/oauth/google?code=abc&state=forged', { headers: { cookie: 'crescelo_oauth=realstate.verifier' } }),
      ctx('google')
    );
    expect(wrongState.headers.get('location')).toContain('/login?message=');
    expect(wrongState.headers.get('set-cookie') || '').not.toContain('kortex_admin_session=ey');
  });
});
