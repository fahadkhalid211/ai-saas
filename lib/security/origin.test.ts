import { describe, it, expect, afterEach, vi } from 'vitest';
import { canonicalOrigin } from './origin';

const req = (url: string) => new Request(url);

describe('canonicalOrigin', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the configured origin for the same site (apex <-> www)', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://www.crescelo.com');
    expect(canonicalOrigin(req('https://crescelo.com/api/auth/oauth/google'))).toBe('https://www.crescelo.com');
  });

  it('ignores a stale value that points at another domain', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://kortex-old.vercel.app');
    expect(canonicalOrigin(req('https://www.crescelo.com/api/auth/oauth/google'))).toBe('https://www.crescelo.com');
  });

  it('accepts a value without a scheme and ignores garbage', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'www.crescelo.com');
    expect(canonicalOrigin(req('https://crescelo.com/x'))).toBe('https://www.crescelo.com');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://');
    expect(canonicalOrigin(req('https://crescelo.com/x'))).toBe('https://crescelo.com');
  });

  it('uses the request origin in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://www.crescelo.com');
    expect(canonicalOrigin(req('http://localhost:3000/x'))).toBe('http://localhost:3000');
  });
});
