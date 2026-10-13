import { describe, it, expect, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database } from '../db';
import { disablePostgresTemporarily } from '../db/postgres';
import { generateSessionToken } from './auth';
import { createEmailVerificationToken } from './email-verification';
import { emailConfirmationRequired } from './email-verification-gate';
import { POST as authPost } from '../../app/api/auth/route';
import { GET as verifyGet, POST as verifyPost } from '../../app/api/auth/verify-email/route';
import { POST as resendPost } from '../../app/api/auth/resend-verification/route';

const tag = Math.random().toString(36).slice(2, 8);

function ip() {
  return `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
}
function req(url: string, init: { method?: string; body?: unknown; cookie?: string } = {}) {
  return new NextRequest(url, {
    method: init.method || 'GET',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip(),
      'x-client-platform': 'mobile', // skips the browser-only reCAPTCHA
      ...(init.cookie ? { cookie: init.cookie } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}
async function register(email: string, password = 'a-good-password') {
  const res = await authPost(req('http://localhost/api/auth', { method: 'POST', body: { mode: 'register', businessName: `Biz ${tag}`, email, password } }));
  const json = await res.json();
  return { res, json };
}
const sessionCookie = (m: { role: string; id: string; workspaceId: string; sessionVersion?: number }) =>
  `kortex_admin_session=${generateSessionToken(m.role, m.id, m.workspaceId, undefined, m.sessionVersion || 0)}`;

afterAll(async () => {
  vi.unstubAllEnvs();
  disablePostgresTemporarily(1);
});

describe('sign-up asks for email confirmation', () => {
  it('creates the account unconfirmed, and a second sign-up with a confirmed address is refused', async () => {
    const email = `new-${tag}@example.com`;
    const first = await register(email);
    expect(first.res.status).toBe(201);
    expect(first.json.member.emailVerified).toBe(false);

    // still unconfirmed: another sign-up with the same address is allowed (typing an address does not make it yours)
    const second = await register(email);
    expect(second.res.status).toBe(201);

    await Database.confirmEmail(first.json.member.id);
    const third = await register(email);
    expect(third.res.status).toBe(409);
    expect(third.json.accountExists).toBe(true);
  });

  it('treats accounts from before confirmation existed as confirmed', async () => {
    const legacy = await Database.createTenantWorkspace({ businessName: `Legacy ${tag}`, ownerEmail: `legacy-${tag}@example.com`, password: 'x'.repeat(8) });
    expect(legacy.owner.emailVerified).toBeUndefined();
    expect(await Database.emailBelongsToConfirmedAccount(`legacy-${tag}@example.com`)).toBe(true);
    expect(await Database.emailBelongsToConfirmedAccount(`nobody-${tag}@example.com`)).toBe(false);
  });
});

describe('the link in the e-mail', () => {
  it('confirms at once in the browser that is signed in to that account', async () => {
    const { json } = await register(`same-${tag}@example.com`);
    const member = json.member;
    const token = createEmailVerificationToken(member.id, member.email);
    const res = await verifyGet(req(`http://localhost/api/auth/verify-email?token=${encodeURIComponent(token)}`, { cookie: sessionCookie(member) }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/dashboard?emailVerified=1');
    expect((await Database.findTeamMember(member.id))?.emailVerified).toBe(true);
  });

  it('asks for a new password in any other browser, and that password locks out the sign-up password', async () => {
    const email = `other-${tag}@example.com`;
    const { json } = await register(email, 'the-attackers-password');
    const member = json.member;
    // the person who typed the address also switched on two-factor with their own device
    await Database.updateTeamMember(member.id, { twoFactorEnabled: true, twoFactorSecret: 'ATTACKERSECRET', recoveryCodes: ['h1'] });
    const token = createEmailVerificationToken(member.id, member.email);

    const get = await verifyGet(req(`http://localhost/api/auth/verify-email?token=${encodeURIComponent(token)}`));
    expect(get.headers.get('location')).toContain('/verify-email?token=');
    expect((await Database.findTeamMember(member.id))?.emailVerified).toBe(false); // opening the link alone confirms nothing

    const tooShort = await verifyPost(req('http://localhost/api/auth/verify-email', { method: 'POST', body: { token, password: 'abc' } }));
    expect(tooShort.status).toBe(400);

    const post = await verifyPost(req('http://localhost/api/auth/verify-email', { method: 'POST', body: { token, password: 'the-owners-new-password' } }));
    expect(post.status).toBe(200);
    expect(post.headers.get('set-cookie')).toContain('kortex_admin_session=');

    const after = await Database.findTeamMember(member.id);
    expect(after?.emailVerified).toBe(true);
    expect(after?.twoFactorEnabled).toBe(false);
    expect((after?.sessionVersion || 0) > 0).toBe(true);
    expect(await Database.verifyTenantLogin(email, 'the-attackers-password')).toBeNull();
    expect(await Database.verifyTenantLogin(email, 'the-owners-new-password')).not.toBeNull();
  });

  it('refuses a link that is wrong, for another address, or already used', async () => {
    const { json } = await register(`bad-${tag}@example.com`);
    const member = json.member;
    const wrongAddress = createEmailVerificationToken(member.id, 'someone-else@example.com');
    const bad = await verifyPost(req('http://localhost/api/auth/verify-email', { method: 'POST', body: { token: wrongAddress, password: 'long-enough-pw' } }));
    expect(bad.status).toBe(400);
    const garbage = await verifyGet(req('http://localhost/api/auth/verify-email?token=garbage'));
    expect(garbage.headers.get('location')).toContain('status=invalid');

    const good = createEmailVerificationToken(member.id, member.email);
    await verifyPost(req('http://localhost/api/auth/verify-email', { method: 'POST', body: { token: good, password: 'long-enough-pw' } }));
    const again = await verifyPost(req('http://localhost/api/auth/verify-email', { method: 'POST', body: { token: good, password: 'another-long-pw' } }));
    expect(again.status).toBe(409);
  });
});

describe('Google sign-in never lands in an unconfirmed account', () => {
  it('creates a separate workspace instead of merging, and merges into a confirmed account', async () => {
    const email = `google-${tag}@example.com`;
    const { json } = await register(email, 'attacker-known-pw'); // unconfirmed
    const res = await Database.findOrCreateOAuthTenant({ email, name: 'Real Owner', provider: 'google' });
    expect(res.isNewUser).toBe(true);
    expect(res.workspace.id).not.toBe(json.workspace.id);
    expect(res.member.id).not.toBe(json.member.id);
    expect(res.member.emailVerified).toBe(true);

    // the next Google sign-in finds the confirmed account, not the unconfirmed one
    const again = await Database.findOrCreateOAuthTenant({ email, name: 'Real Owner', provider: 'google' });
    expect(again.isNewUser).toBe(false);
    expect(again.workspace.id).toBe(res.workspace.id);

    // an account that was confirmed first is still joined as before
    const other = await register(`confirmed-${tag}@example.com`);
    await Database.confirmEmail(other.json.member.id);
    const merged = await Database.findOrCreateOAuthTenant({ email: `confirmed-${tag}@example.com`, provider: 'google' });
    expect(merged.isNewUser).toBe(false);
    expect(merged.workspace.id).toBe(other.json.workspace.id);
  });
});

describe('asking for the e-mail again, and what waits for confirmation', () => {
  it('needs a signed-in, unconfirmed account', async () => {
    const anon = await resendPost(req('http://localhost/api/auth/resend-verification', { method: 'POST' }));
    expect(anon.status).toBe(401);

    const { json } = await register(`resend-${tag}@example.com`);
    const res = await resendPost(req('http://localhost/api/auth/resend-verification', { method: 'POST', cookie: sessionCookie(json.member) }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.simulated).toBe(true); // no e-mail service in the tests
  });

  it('holds back trials only when an e-mail service can deliver the link', async () => {
    const { json } = await register(`gate-${tag}@example.com`);
    expect(await emailConfirmationRequired(json.member.id)).toBeNull(); // nothing configured: never lock a customer out

    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    const blocked = await emailConfirmationRequired(json.member.id);
    expect(blocked?.status).toBe(403);
    expect((await blocked!.json()).emailVerificationRequired).toBe(true);

    await Database.confirmEmail(json.member.id);
    expect(await emailConfirmationRequired(json.member.id)).toBeNull();
    vi.unstubAllEnvs();
  });
});
