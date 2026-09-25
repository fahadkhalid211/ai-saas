import { describe, it, expect } from 'vitest';
import { createPendingTwoFactorCookie, readPendingTwoFactor, verifySessionToken } from './auth';

const reqWith = (cookie: string) => new Request('http://x/api/auth', { headers: { cookie } });
const valueOf = (setCookie: string) => setCookie.split(';')[0];

describe('pending two-factor challenge cookie', () => {
  it('round-trips the member and workspace', () => {
    const c = valueOf(createPendingTwoFactorCookie('tm_1', 'ws_1'));
    expect(readPendingTwoFactor(reqWith(c))).toEqual({ memberId: 'tm_1', workspaceId: 'ws_1' });
  });

  it('rejects a tampered payload', () => {
    const c = valueOf(createPendingTwoFactorCookie('tm_1', 'ws_1'));
    const [name, rest] = c.split('=');
    const [, sig] = rest.split('.');
    const forged = Buffer.from(JSON.stringify({ memberId: 'tm_owner', workspaceId: 'ws_1', exp: Date.now() + 1e6 })).toString('base64url');
    expect(readPendingTwoFactor(reqWith(`${name}=${forged}.${sig}`))).toBeNull();
  });

  it('is not accepted as a session', () => {
    const token = valueOf(createPendingTwoFactorCookie('tm_1', 'ws_1')).split('=')[1];
    expect(verifySessionToken(token)).toBe(false);
  });

  it('is absent without the cookie', () => {
    expect(readPendingTwoFactor(reqWith(''))).toBeNull();
  });
});
