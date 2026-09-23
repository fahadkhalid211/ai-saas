import { describe, it, expect, afterEach } from 'vitest';
import { resolvePostgresConnection } from './postgres';

describe('resolvePostgresConnection', () => {
  afterEach(() => {
    delete process.env.DATABASE_SSL_CA;
  });

  it('treats sslmode=disable on a public host as no TLS and strips the parameter', () => {
    const r = resolvePostgresConnection('postgresql://u:p@155.248.251.71:5432/postgres?sslmode=disable');
    expect(r.mode).toBe('off');
    expect(r.ssl).toBe(false);
    expect(r.connectionString).not.toContain('sslmode');
    expect(r.host).toBe('155.248.251.71');
  });

  it('encrypts without verifying for sslmode=require (so a self-signed certificate still works)', () => {
    const r = resolvePostgresConnection('postgresql://u:p@db.example.com:5432/postgres?sslmode=require');
    expect(r.mode).toBe('encrypted');
    expect(r.ssl).toEqual({ rejectUnauthorized: false });
    expect(r.connectionString).not.toContain('sslmode');
  });

  it('verifies the server certificate for verify-full or when a CA is provided', () => {
    expect(resolvePostgresConnection('postgresql://u:p@db.example.com/postgres?sslmode=verify-full')).toMatchObject({
      mode: 'verified',
      ssl: { rejectUnauthorized: true },
    });
    process.env.DATABASE_SSL_CA = '-----BEGIN CERTIFICATE-----\\nabc\\n-----END CERTIFICATE-----';
    const r = resolvePostgresConnection('postgresql://u:p@db.example.com/postgres?sslmode=require');
    expect(r.mode).toBe('verified');
    expect(r.ssl).toMatchObject({ rejectUnauthorized: true });
    expect((r.ssl as { ca?: string }).ca).toContain('\n');
  });

  it('does not force TLS on localhost or private-network hosts when nothing is specified', () => {
    for (const host of ['localhost', '127.0.0.1', '10.0.0.5', '192.168.1.9', '172.20.1.2', 'db']) {
      expect(resolvePostgresConnection(`postgresql://u:p@${host}:5432/postgres`).mode).toBe('off');
    }
  });

  it('defaults to encrypted for a public host with no sslmode', () => {
    expect(resolvePostgresConnection('postgresql://u:p@db.example.com:5432/postgres').mode).toBe('encrypted');
  });

  it('keeps the credentials and database name intact', () => {
    const r = resolvePostgresConnection('postgresql://app:s3cr%40t@db.example.com:5432/crescelo?sslmode=require&connect_timeout=5');
    const u = new URL(r.connectionString);
    expect(u.username).toBe('app');
    expect(decodeURIComponent(u.password)).toBe('s3cr@t');
    expect(u.pathname).toBe('/crescelo');
    expect(u.searchParams.get('connect_timeout')).toBe('5');
  });
});
