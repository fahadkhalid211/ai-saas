import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => ({ query: vi.fn(), configured: true }));

// Only the pool and the "configured" check are faked; everything else in ./postgres stays real.
// No database is reached, and vitest.config.ts gives every run its own DATA_DIR for the JSON state.
vi.mock('./postgres', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./postgres')>();
  return {
    ...actual,
    isPostgresConfigured: () => h.configured,
    getPostgresPool: () => ({
      connect: async () => ({ query: h.query, release: () => undefined }),
    }),
  };
});

import { Database, isRelationalModeRequired } from './index';
import { BookingUnavailableError } from '../appointments/errors';

const connectionError = () => Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), { code: 'ECONNREFUSED' });
const exclusionViolation = () => Object.assign(new Error('conflicting key value violates exclusion constraint'), { code: '23P01' });

const booking = (email: string) => ({
  assistantId: 'ast_fail_closed',
  name: 'A',
  email,
  date: '2026-10-26',
  timeSlot: '10:00 AM',
  slotStart: '2026-10-26T10:00:00.000Z',
  slotEnd: '2026-10-26T10:30:00.000Z',
});

const jsonHas = async (email: string) => {
  const all = await Database.getAppointments();
  return all.some((a) => a.email === email);
};

beforeEach(() => {
  h.query.mockReset();
  h.configured = true;
});

afterEach(() => {
  delete process.env.DB_RELATIONAL_MODE;
});

describe('isRelationalModeRequired', () => {
  it('is true only when DB_RELATIONAL_MODE is "true"', () => {
    delete process.env.DB_RELATIONAL_MODE;
    expect(isRelationalModeRequired()).toBe(false);
    process.env.DB_RELATIONAL_MODE = 'false';
    expect(isRelationalModeRequired()).toBe(false);
    process.env.DB_RELATIONAL_MODE = 'true';
    expect(isRelationalModeRequired()).toBe(true);
  });

  it('does not depend on the temporary outage flag', () => {
    process.env.DB_RELATIONAL_MODE = 'true';
    h.configured = false;
    expect(isRelationalModeRequired()).toBe(true);
  });
});

describe('BookingUnavailableError', () => {
  it('carries the DB_UNAVAILABLE code', () => {
    const err = new BookingUnavailableError();
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('DB_UNAVAILABLE');
  });
});

describe('when relational mode is required and Postgres is failing', () => {
  beforeEach(() => {
    process.env.DB_RELATIONAL_MODE = 'true';
  });

  it('saveAppointment refuses with DB_UNAVAILABLE and writes nothing to the JSON state', async () => {
    h.query.mockRejectedValue(connectionError());
    await expect(Database.saveAppointment(booking('refused-save@example.com'))).rejects.toMatchObject({ code: 'DB_UNAVAILABLE' });
    delete process.env.DB_RELATIONAL_MODE;
    expect(await jsonHas('refused-save@example.com')).toBe(false);
  });

  it('saveAppointment refuses on a non-connection database error too', async () => {
    h.query.mockRejectedValue(Object.assign(new Error('boom'), { code: 'XX000' }));
    await expect(Database.saveAppointment(booking('refused-other@example.com'))).rejects.toBeInstanceOf(BookingUnavailableError);
    delete process.env.DB_RELATIONAL_MODE;
    expect(await jsonHas('refused-other@example.com')).toBe(false);
  });

  it('saveAppointment refuses while the outage flag is set (relational path unavailable) without querying', async () => {
    h.configured = false;
    await expect(Database.saveAppointment(booking('refused-outage@example.com'))).rejects.toMatchObject({ code: 'DB_UNAVAILABLE' });
    expect(h.query).not.toHaveBeenCalled();
    delete process.env.DB_RELATIONAL_MODE;
    expect(await jsonHas('refused-outage@example.com')).toBe(false);
  });

  it('saveAppointment still propagates SLOT_CONFLICT unchanged', async () => {
    h.query.mockRejectedValue(exclusionViolation());
    const err = await Database.saveAppointment(booking('conflict-save@example.com')).catch((e) => e);
    expect(err).not.toBeInstanceOf(BookingUnavailableError);
    expect(err.code).toBe('SLOT_CONFLICT');
  });

  it('updateAppointment refuses with DB_UNAVAILABLE on a connection error', async () => {
    h.query.mockRejectedValue(connectionError());
    await expect(Database.updateAppointment('apt_x', { timeSlot: '11:00 AM' })).rejects.toMatchObject({ code: 'DB_UNAVAILABLE' });
    expect(h.query).toHaveBeenCalledTimes(1);
  });

  it('updateAppointment refuses while the outage flag is set without querying', async () => {
    h.configured = false;
    await expect(Database.updateAppointment('apt_x', { timeSlot: '11:00 AM' })).rejects.toMatchObject({ code: 'DB_UNAVAILABLE' });
    expect(h.query).not.toHaveBeenCalled();
  });

  it('updateAppointment rethrows SLOT_CONFLICT instead of swallowing it', async () => {
    h.query.mockRejectedValue(exclusionViolation());
    const err = await Database.updateAppointment('apt_x', { timeSlot: '11:00 AM' }).catch((e) => e);
    expect(err).not.toBeInstanceOf(BookingUnavailableError);
    expect(err.code).toBe('SLOT_CONFLICT');
    // only the one failed UPDATE: no fallback write to the JSON state
    expect(h.query).toHaveBeenCalledTimes(1);
  });

  it('updateAppointmentStatus refuses with DB_UNAVAILABLE on a connection error', async () => {
    h.query.mockRejectedValue(connectionError());
    await expect(Database.updateAppointmentStatus('apt_x', 'cancelled')).rejects.toMatchObject({ code: 'DB_UNAVAILABLE' });
    expect(h.query).toHaveBeenCalledTimes(1);
  });

  it('updateAppointmentStatus refuses while the outage flag is set without querying', async () => {
    h.configured = false;
    await expect(Database.updateAppointmentStatus('apt_x', 'cancelled')).rejects.toMatchObject({ code: 'DB_UNAVAILABLE' });
    expect(h.query).not.toHaveBeenCalled();
  });

  it('updateAppointmentStatus still propagates SLOT_CONFLICT unchanged', async () => {
    h.query.mockRejectedValue(exclusionViolation());
    await expect(Database.updateAppointmentStatus('apt_x', 'confirmed')).rejects.toMatchObject({ code: 'SLOT_CONFLICT' });
  });
});

describe('when relational mode is not required', () => {
  it('saveAppointment falls back to the JSON state as before, even if Postgres is not configured', async () => {
    delete process.env.DB_RELATIONAL_MODE;
    h.configured = false;
    const saved = await Database.saveAppointment(booking('local-dev@example.com'));
    expect(saved.id).toBeTruthy();
    expect(h.query).not.toHaveBeenCalled();
    expect(await jsonHas('local-dev@example.com')).toBe(true);
  });

  it('updateAppointment and updateAppointmentStatus keep writing to the JSON state', async () => {
    delete process.env.DB_RELATIONAL_MODE;
    h.configured = false;
    const saved = await Database.saveAppointment(booking('local-update@example.com'));
    const updated = await Database.updateAppointment(saved.id, { notes: 'moved' });
    expect(updated?.notes).toBe('moved');
    expect(await Database.updateAppointmentStatus(saved.id, 'cancelled', 'test')).toBe(true);
    expect(h.query).not.toHaveBeenCalled();
  });
});
