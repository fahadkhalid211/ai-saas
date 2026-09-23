import { describe, it, expect, afterAll } from 'vitest';
import { safeAvatarUrl } from '../security/oauth';

const PHOTO = 'https://lh3.googleusercontent.com/a/abc123=s96-c';
const created: string[] = [];

describe('safeAvatarUrl', () => {
  it('accepts Google profile photos only', () => {
    expect(safeAvatarUrl(PHOTO)).toBe(PHOTO);
    expect(safeAvatarUrl('http://lh3.googleusercontent.com/a/x')).toBeUndefined();
    expect(safeAvatarUrl('https://evil.example.com/a.png')).toBeUndefined();
    expect(safeAvatarUrl('https://googleusercontent.com.evil.com/a.png')).toBeUndefined();
    expect(safeAvatarUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeAvatarUrl(undefined)).toBeUndefined();
  });
});

describe('Google sign-in fills in the person\'s name and photo', () => {
  afterAll(async () => {
    const { Database } = await import('./index');
    for (const id of created) await (Database as any).deleteWorkspace?.(id);
  });

  it('names a new owner after the person (not the business) and stores the photo', async () => {
    const { Database } = await import('./index');
    const email = `oauth-new-${Date.now()}@example.com`;
    const r = await Database.findOrCreateOAuthTenant({ email, name: 'Ada Lovelace', provider: 'google', providerId: 'g1', picture: PHOTO });
    created.push(r.workspace.id);
    expect(r.isNewUser).toBe(true);
    expect(r.member.name).toBe('Ada Lovelace');
    expect(r.member.avatarUrl).toBe(PHOTO);
  });

  it('repairs an auto-generated name on the next sign-in but never overwrites a photo the user chose', async () => {
    const { Database } = await import('./index');
    const email = `oauth-again-${Date.now()}@example.com`;
    const first = await Database.findOrCreateOAuthTenant({ email, provider: 'google', providerId: 'g2' });
    created.push(first.workspace.id);
    expect(first.member.name).toBe(first.workspace.name);

    const second = await Database.findOrCreateOAuthTenant({ email, name: 'Grace Hopper', provider: 'google', providerId: 'g2', picture: PHOTO });
    expect(second.isNewUser).toBe(false);
    expect(second.member.name).toBe('Grace Hopper');
    expect(second.member.avatarUrl).toBe(PHOTO);

    second.member.avatarUrl = 'https://example.com/mine.png';
    second.member.name = 'Grace (custom)';
    const third = await Database.findOrCreateOAuthTenant({
      email,
      name: 'Someone Else',
      provider: 'google',
      providerId: 'g2',
      picture: 'https://lh3.googleusercontent.com/a/other',
    });
    expect(third.member.name).toBe('Grace (custom)');
    expect(third.member.avatarUrl).toBe('https://example.com/mine.png');
  });
});
