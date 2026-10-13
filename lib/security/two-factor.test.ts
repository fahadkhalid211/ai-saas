import { describe, it, expect } from 'vitest';
import { checkSecondFactor, hashRecoveryCodes } from './two-factor';
import { generateBase32Secret, generateTotpCode } from './totp';
import { encryptSecret } from './crypto';
import type { TeamMemberData } from '@/lib/db';

const secret = generateBase32Secret(32);
const member = (extra: Partial<TeamMemberData> = {}): TeamMemberData => ({
  id: 'tm_1', workspaceId: 'ws', name: 'A', email: 'a@b.co', role: 'owner', status: 'active', createdAt: '',
  twoFactorEnabled: true, twoFactorSecret: encryptSecret(secret), ...extra,
});

describe('checkSecondFactor', () => {
  it('accepts a current code and refuses the same code again', () => {
    const code = generateTotpCode(secret);
    const first = checkSecondFactor(member(), code);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const replay = checkSecondFactor(member(first.updates), code);
    expect(replay.ok).toBe(false);
  });

  it('accepts code with spaces or dashes as copied from Google Authenticator', () => {
    const code = generateTotpCode(secret);
    const formatted = `${code.slice(0, 3)} ${code.slice(3)}`;
    const result = checkSecondFactor(member(), formatted);
    expect(result.ok).toBe(true);
  });

  it('rejects a wrong code', () => {
    expect(checkSecondFactor(member(), 'nonsense').ok).toBe(false);
  });

  it('accepts a hashed recovery code exactly once', () => {
    const [h] = hashRecoveryCodes(['ABCD-1234']);
    expect(h.startsWith('h1:')).toBe(true);
    const m = member({ recoveryCodes: [h, ...hashRecoveryCodes(['EEEE-0000'])] });
    const r = checkSecondFactor(m, 'abcd-1234');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.updates.recoveryCodes).toHaveLength(1);
    expect(checkSecondFactor(member({ recoveryCodes: (r as any).updates.recoveryCodes }), 'ABCD-1234').ok).toBe(false);
  });

  it('still honours a legacy plain-text recovery code', () => {
    expect(checkSecondFactor(member({ recoveryCodes: ['AAAA-1111'] }), 'aaaa-1111').ok).toBe(true);
  });
});
