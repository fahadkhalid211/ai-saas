import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => ({ query: vi.fn(), failRefresh: false }));

// The pool is faked (no database is reached). The shared state is read from the local data folder (cloud sync off), and
// that read can be made to throw, standing in for any failure while refreshing the in-memory copy after a write.
vi.mock('./postgres', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./postgres')>();
  return {
    ...actual,
    isPostgresConfigured: () => true,
    getPostgresPool: () => ({ connect: async () => ({ query: h.query, release: () => undefined }) }),
  };
});
vi.mock('./cloud', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./cloud')>();
  return { ...actual, isCloudDbConfigured: () => false };
});
vi.mock('./storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./storage')>();
  return {
    ...actual,
    ensureDirectory: (dir: string) => {
      if (h.failRefresh) throw new Error('state refresh failed');
      return actual.ensureDirectory(dir);
    },
  };
});

import { Database } from './index';

const REAL_BACKEND_ENV = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

const created = new Date('2026-10-23T08:00:00.000Z');
const row = {
  id: 'apt_refresh', assistant_id: 'ast_refresh', name: 'A', email: 'a@b.co', date: '2026-10-26', time_slot: '11:00 AM',
  status: 'confirmed', created_at: created, updated_at: created, slot_start: null, slot_end: null, external_clash_at: null,
};

beforeEach(() => {
  for (const k of REAL_BACKEND_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', 'true');
  h.query.mockReset();
  h.failRefresh = true;
  // writes report one row; the read-back returns the stored row
  h.query.mockImplementation(async (sql: string) => (sql.trim().startsWith('SELECT') ? { rows: [row], rowCount: 1 } : { rows: [], rowCount: 1 }));
});

afterEach(() => {
  h.failRefresh = false;
  vi.unstubAllEnvs();
});

describe('a stored write is never reported as failed because the cache refresh after it failed', () => {
  it('saveAppointment returns the booking', async () => {
    const saved = await Database.saveAppointment({ assistantId: 'ast_refresh', name: 'A', email: 'a@b.co', date: '2026-10-26', timeSlot: '10:00 AM' });
    expect(saved.id).toMatch(/^apt_/);
    expect(h.query).toHaveBeenCalledTimes(1);
    expect(h.query.mock.calls[0][0]).toContain('INSERT INTO kortex_appointments');
  });

  it('updateAppointment returns the row read back from Postgres', async () => {
    const updated = await Database.updateAppointment('apt_refresh', { timeSlot: '11:00 AM' });
    expect(updated?.id).toBe('apt_refresh');
    expect(updated?.timeSlot).toBe('11:00 AM');
  });

  it('updateAppointmentStatus returns true', async () => {
    await expect(Database.updateAppointmentStatus('apt_refresh', 'cancelled')).resolves.toBe(true);
  });
});

describe('updateAppointment read-back', () => {
  it('a failing read-back is handled inside the relational branch (refused as DB_UNAVAILABLE), not leaked as a raw error', async () => {
    h.failRefresh = false; // the cache has no copy of the row, so the result is read back from Postgres
    h.query.mockImplementation(async (sql: string) => {
      if (sql.trim().startsWith('SELECT')) throw Object.assign(new Error('read failed'), { code: 'XX000' });
      return { rows: [], rowCount: 1 };
    });
    await expect(Database.updateAppointment('apt_refresh', { notes: 'x' })).rejects.toMatchObject({ code: 'DB_UNAVAILABLE' });
  });
});
