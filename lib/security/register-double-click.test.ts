import { describe, it, expect, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database } from '../db';
import { disablePostgresTemporarily } from '../db/postgres';
import { POST as authPost } from '../../app/api/auth/route';

const tag = Math.random().toString(36).slice(2, 8);

function register(body: Record<string, unknown>) {
  return authPost(
    new NextRequest('http://localhost/api/auth', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
        'x-client-platform': 'mobile', // skips the browser-only reCAPTCHA
      },
      body: JSON.stringify({ mode: 'register', ...body }),
    }),
  );
}

afterAll(() => {
  vi.unstubAllEnvs();
  disablePostgresTemporarily(1);
});

describe('clicking "Create account" several times', () => {
  it('makes one workspace, and every click gets that same account back', async () => {
    const email = `dbl-${tag}@example.com`;
    const before = (await Database.getState()).workspaces.length;

    const responses = await Promise.all(
      Array.from({ length: 8 }, () => register({ businessName: `Dbl ${tag}`, email, password: 'a-good-password' })),
    );
    const bodies = await Promise.all(responses.map((r) => r.json()));

    expect(responses.every((r) => r.status === 201)).toBe(true);
    expect(new Set(bodies.map((b) => b.workspace.id)).size).toBe(1);
    expect((await Database.getState()).workspaces.length).toBe(before + 1);
  });

  it('does not hand a new account to someone who sends the same address with a different password', async () => {
    const email = `dbl2-${tag}@example.com`;
    const [mine, theirs] = await Promise.all([
      register({ businessName: `Mine ${tag}`, email, password: 'my-own-password' }),
      register({ businessName: `Mine ${tag}`, email, password: 'someone-elses-password' }),
    ]);
    const a = await mine.json();
    const b = await theirs.json();
    expect(a.workspace.id).not.toBe(b.workspace.id);
    expect(a.token).not.toBe(b.token);
  });
});
