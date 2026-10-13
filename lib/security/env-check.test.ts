import { describe, it, expect } from 'vitest';
import { findWeakSettings } from './env-check';

const strong = 'a8f3c1d9e07b4a62915fd03ce8b7a4d1';
const good = {
  ADMIN_API_KEY: strong,
  ENCRYPTION_SECRET: strong.split('').reverse().join(''),
  CRON_SECRET: 'b1d7f0a93c5e4826a0f1c3d5e7b94a28',
  DATABASE_URL: 'postgres://app:pw@db.internal/app?sslmode=require',
  UPSTASH_REDIS_REST_URL: 'https://x.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 't',
};

describe('findWeakSettings', () => {
  it('has nothing to report for a sound configuration', () => {
    expect(findWeakSettings({ ...good, DATABASE_URL: 'postgres://app:pw@10.0.0.5/app' })).toEqual([]);
  });

  it('fails the shipped placeholder values and a short master key', () => {
    const names = (env: Record<string, string>) => findWeakSettings(env).filter((p) => p.severity === 'fail').map((p) => p.name);
    expect(names({ ...good, ADMIN_API_KEY: 'kortex_admin_super_secret_key_change_me_in_prod' })).toContain('ADMIN_API_KEY');
    expect(names({ ...good, ADMIN_API_KEY: 'shortkey' })).toContain('ADMIN_API_KEY');
    expect(names({ ...good, ENCRYPTION_SECRET: 'kortex-ai-default-encryption-salt-2026' })).toContain('ENCRYPTION_SECRET');
  });

  it('fails missing required secrets', () => {
    const missing = findWeakSettings({}).filter((p) => p.severity === 'fail').map((p) => p.name);
    expect(missing).toEqual(expect.arrayContaining(['ADMIN_API_KEY', 'ENCRYPTION_SECRET']));
  });

  it('warns when one secret does the work of two', () => {
    const p = findWeakSettings({ ...good, ENCRYPTION_SECRET: good.ADMIN_API_KEY });
    expect(p.some((x) => x.name === 'ENCRYPTION_SECRET' && x.severity === 'warn')).toBe(true);
  });

  it('fails a remote database without TLS and warns about the superuser', () => {
    const remote = findWeakSettings({ ...good, DATABASE_URL: 'postgres://postgres:pw@203.0.113.9:5432/app?sslmode=disable' });
    expect(remote.some((x) => x.name === 'DATABASE_URL' && x.severity === 'fail')).toBe(true);
    expect(remote.some((x) => x.name === 'DATABASE_URL' && x.severity === 'warn')).toBe(true);
    // the same setting on a private network is not a failure
    const local = findWeakSettings({ ...good, DATABASE_URL: 'postgres://app:pw@localhost:5432/app?sslmode=disable' });
    expect(local.some((x) => x.severity === 'fail')).toBe(false);
  });

  it('warns when the database connection is encrypted but the server is not verified', () => {
    const remote = 'postgres://app:pw@203.0.113.9:5432/app?sslmode=require';
    expect(findWeakSettings({ ...good, DATABASE_URL: remote }).some((x) => x.name === 'DATABASE_SSL_CA')).toBe(true);
    expect(findWeakSettings({ ...good, DATABASE_URL: remote, DATABASE_SSL_CA: '-----BEGIN CERTIFICATE-----' }).some((x) => x.name === 'DATABASE_SSL_CA')).toBe(false);
  });

  it('never repeats a secret value in what it reports', () => {
    const secretValue = 'kortex_admin_super_secret_key_change_me_in_prod';
    expect(JSON.stringify(findWeakSettings({ ...good, ADMIN_API_KEY: secretValue }))).not.toContain(secretValue);
  });
});
