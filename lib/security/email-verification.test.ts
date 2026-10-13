import { describe, it, expect } from 'vitest';
import { createEmailVerificationToken, readEmailVerificationToken, EMAIL_VERIFICATION_TTL_MS } from './email-verification';
import { generateSessionToken } from './auth';

describe('email confirmation tokens', () => {
  it('round-trips the member and the address, in lower case', () => {
    const token = createEmailVerificationToken('tm_1', 'Person@Example.com');
    expect(readEmailVerificationToken(token)).toEqual({ memberId: 'tm_1', email: 'person@example.com' });
  });

  it('expires after 48 hours', () => {
    const now = 1_700_000_000_000;
    const token = createEmailVerificationToken('tm_1', 'a@b.co', now);
    expect(readEmailVerificationToken(token, now + EMAIL_VERIFICATION_TTL_MS - 1000)).not.toBeNull();
    expect(readEmailVerificationToken(token, now + EMAIL_VERIFICATION_TTL_MS + 1000)).toBeNull();
  });

  it('rejects a changed payload or signature', () => {
    const token = createEmailVerificationToken('tm_1', 'a@b.co');
    const [payload, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ t: 'ev', m: 'tm_other', e: 'a@b.co', x: Date.now() + 1e9 })).toString('base64url');
    expect(readEmailVerificationToken(`${forged}.${sig}`)).toBeNull();
    expect(readEmailVerificationToken(`${payload}.${sig.slice(0, -2)}xx`)).toBeNull();
    expect(readEmailVerificationToken('')).toBeNull();
    expect(readEmailVerificationToken('not-a-token')).toBeNull();
    expect(readEmailVerificationToken(undefined)).toBeNull();
  });

  it('is not interchangeable with a session token', () => {
    const session = generateSessionToken('owner', 'tm_1', 'ws_1');
    expect(readEmailVerificationToken(session)).toBeNull();
  });
});
