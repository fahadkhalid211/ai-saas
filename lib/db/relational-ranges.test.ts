import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => ({ query: vi.fn() }));

// Only the pool is faked; everything else in ./postgres stays real. No database is reached.
vi.mock('./postgres', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./postgres')>();
  return {
    ...actual,
    isPostgresConfigured: () => true,
    getPostgresPool: () => ({
      connect: async () => ({ query: h.query, release: () => undefined }),
    }),
  };
});

import { relationalUpsertAppointment, relationalUpdateAppointment, relationalGetAppointments } from './relational';
import { Database, type AppointmentData } from './index';

const exclusionViolation = () => Object.assign(new Error('conflicting key value violates exclusion constraint'), { code: '23P01' });

const apt: AppointmentData = {
  id: 'apt_1',
  assistantId: 'ast_1',
  name: 'A',
  email: 'a@b.co',
  date: '2026-10-26',
  timeSlot: '10:00 AM',
  durationMinutes: 30,
  status: 'confirmed',
  slotStart: '2026-10-26T10:00:00.000Z',
  slotEnd: '2026-10-26T10:30:00.000Z',
  createdAt: '2026-10-23T08:00:00.000Z',
};

// Every database and shared-cache URL is blanked, so this file can never reach a real database or Redis even when the
// shell exports them (the pool above is faked, but the JSON state's cloud sync reads these too).
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

beforeEach(() => {
  for (const k of REAL_BACKEND_ENV) vi.stubEnv(k, '');
  h.query.mockReset();
});

afterEach(() => {
  delete process.env.DB_RELATIONAL_MODE;
  vi.unstubAllEnvs();
});

describe('test isolation', () => {
  it('blanks every real database and cache URL', () => {
    for (const k of REAL_BACKEND_ENV) expect(process.env[k] || '').toBe('');
  });
});

describe('booking ranges in the relational layer', () => {
  it('upsert writes slot_start and slot_end with the ISO values', async () => {
    h.query.mockResolvedValue({ rows: [], rowCount: 1 });
    await relationalUpsertAppointment(apt);

    const [sql, params] = h.query.mock.calls[0];
    expect(sql).toContain('slot_start');
    expect(sql).toContain('slot_end');
    expect(params).toContain('2026-10-26T10:00:00.000Z');
    expect(params).toContain('2026-10-26T10:30:00.000Z');
  });

  it('upsert stores null ranges when the time could not be read', async () => {
    h.query.mockResolvedValue({ rows: [], rowCount: 1 });
    await relationalUpsertAppointment({ ...apt, slotStart: undefined, slotEnd: undefined });

    const [sql, params] = h.query.mock.calls[0];
    // column count and placeholder count must agree: 22 columns now
    expect((sql.match(/\$\d+/g) as string[]).filter((p, i, all) => all.indexOf(p) === i)).toHaveLength(params.length);
    expect(params.filter((p: unknown) => p === null).length).toBeGreaterThanOrEqual(2);
  });

  it('upsert turns an exclusion violation (23P01) into SLOT_CONFLICT', async () => {
    h.query.mockRejectedValue(exclusionViolation());
    await expect(relationalUpsertAppointment(apt)).rejects.toMatchObject({ code: 'SLOT_CONFLICT' });
  });

  it('update turns an exclusion violation (23P01) into SLOT_CONFLICT', async () => {
    h.query.mockRejectedValue(exclusionViolation());
    await expect(relationalUpdateAppointment('apt_1', { status: 'confirmed' })).rejects.toMatchObject({ code: 'SLOT_CONFLICT' });
  });

  it('update still turns a unique violation (23505) into SLOT_CONFLICT', async () => {
    h.query.mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }));
    await expect(relationalUpdateAppointment('apt_1', { status: 'confirmed' })).rejects.toMatchObject({ code: 'SLOT_CONFLICT' });
  });

  it('update leaves other database errors alone', async () => {
    h.query.mockRejectedValue(Object.assign(new Error('boom'), { code: '08006' }));
    await expect(relationalUpdateAppointment('apt_1', { status: 'confirmed' })).rejects.toMatchObject({ code: '08006' });
  });

  it('update writes the range and the external clash marker from the patch', async () => {
    h.query.mockResolvedValue({ rows: [], rowCount: 1 });
    await relationalUpdateAppointment('apt_1', {
      slotStart: '2026-10-27T09:00:00.000Z',
      slotEnd: '2026-10-27T09:30:00.000Z',
      externalClashAt: '2026-10-23T09:00:00.000Z',
    });

    const [sql, params] = h.query.mock.calls[0];
    expect(sql).toContain('slot_start =');
    expect(sql).toContain('slot_end =');
    expect(sql).toContain('external_clash_at =');
    expect(params).toEqual(expect.arrayContaining(['2026-10-27T09:00:00.000Z', '2026-10-27T09:30:00.000Z', '2026-10-23T09:00:00.000Z']));
  });

  it('update can clear the external clash marker with null', async () => {
    h.query.mockResolvedValue({ rows: [], rowCount: 1 });
    await relationalUpdateAppointment('apt_1', { externalClashAt: null as unknown as undefined });

    const [sql, params] = h.query.mock.calls[0];
    expect(sql).toContain('external_clash_at =');
    expect(params).toContain(null);
  });

  it('update without range fields does not touch them', async () => {
    h.query.mockResolvedValue({ rows: [], rowCount: 1 });
    await relationalUpdateAppointment('apt_1', { status: 'cancelled' });

    const [sql] = h.query.mock.calls[0];
    expect(sql).not.toContain('slot_start');
    expect(sql).not.toContain('external_clash_at');
  });

  it('reading a row returns slot_start, slot_end and external_clash_at as ISO strings', async () => {
    const created = new Date('2026-10-23T08:00:00.000Z');
    h.query.mockResolvedValue({
      rows: [{
        id: 'apt_1', assistant_id: 'ast_1', name: 'A', email: 'a@b.co', date: '2026-10-26', time_slot: '10:00 AM',
        status: 'confirmed', created_at: created, updated_at: created,
        slot_start: new Date('2026-10-26T10:00:00.000Z'),
        slot_end: new Date('2026-10-26T10:30:00.000Z'),
        external_clash_at: new Date('2026-10-23T09:00:00.000Z'),
      }],
    });
    const [got] = await relationalGetAppointments('ast_1');
    expect(got.slotStart).toBe('2026-10-26T10:00:00.000Z');
    expect(got.slotEnd).toBe('2026-10-26T10:30:00.000Z');
    expect(got.externalClashAt).toBe('2026-10-23T09:00:00.000Z');
  });

  it('a row without range columns reads as undefined, not an empty string', async () => {
    const created = new Date('2026-10-23T08:00:00.000Z');
    h.query.mockResolvedValue({
      rows: [{ id: 'apt_1', assistant_id: 'ast_1', name: 'A', email: 'a@b.co', date: '2026-10-26', time_slot: '10:00 AM', status: 'confirmed', created_at: created, slot_start: null, slot_end: null, external_clash_at: null }],
    });
    const [got] = await relationalGetAppointments('ast_1');
    expect(got.slotStart).toBeUndefined();
    expect(got.slotEnd).toBeUndefined();
    expect(got.externalClashAt).toBeUndefined();
  });
});

// These go through Database but stop at the first relational error, so the shared JSON state is never read or written.
describe('Database.saveAppointment / updateAppointmentStatus when the slot is taken', () => {
  beforeEach(() => {
    process.env.DB_RELATIONAL_MODE = 'true';
  });

  it('saveAppointment hands the range to the INSERT and reports SLOT_CONFLICT on an overlap', async () => {
    h.query.mockRejectedValue(exclusionViolation());
    await expect(
      Database.saveAppointment({
        assistantId: 'ast_1', name: 'A', email: 'a@b.co', date: '2026-10-26', timeSlot: '10:00 AM',
        slotStart: '2026-10-26T10:00:00.000Z', slotEnd: '2026-10-26T10:30:00.000Z',
      }),
    ).rejects.toMatchObject({ code: 'SLOT_CONFLICT' });
    const [sql, params] = h.query.mock.calls[0];
    expect(sql).toContain('INSERT INTO kortex_appointments');
    expect(params).toEqual(expect.arrayContaining(['2026-10-26T10:00:00.000Z', '2026-10-26T10:30:00.000Z']));
  });

  it('un-cancelling a booking whose slot was rebooked reports SLOT_CONFLICT and writes nothing else', async () => {
    h.query.mockRejectedValue(exclusionViolation());
    await expect(Database.updateAppointmentStatus('apt_1', 'confirmed')).rejects.toMatchObject({ code: 'SLOT_CONFLICT' });
    // only the one failed UPDATE: no fallback write of the status to the JSON state
    expect(h.query).toHaveBeenCalledTimes(1);
  });
});
