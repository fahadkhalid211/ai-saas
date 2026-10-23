import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Database, type AssistantData } from '../db';
import { createAppointment } from './create';
import { slotRange } from './time-range';
import { handleCreateBooking } from '../mcp/tools/bookings';
import type { McpAuthContext } from '../mcp/types';

/**
 * Every booking path (web/widget via createAppointment, MCP, client reschedule, the public checkDate list) uses the one
 * range-overlap check. Runs in JSON mode: every database and shared-cache URL is blanked, so no real database is reached
 * even when the shell exports them; vitest.config.mts gives the run its own DATA_DIR.
 */

const DB_ENV = [
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
  for (const k of DB_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  // each request comes from its own address, so the per-address booking limit does not get in the way
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

let seq = 0;
async function newAssistant(extra: Partial<AssistantData> = {}): Promise<AssistantData> {
  const ws = `ws_paths_${Date.now().toString(36)}_${seq++}`;
  const created = await Database.createAssistant({ name: 'Paths overlap test', workspaceId: ws });
  return (await Database.updateAssistant(created.id, {
    bookingStartHour: '09:00',
    bookingEndHour: '17:00',
    bookingSlotDuration: 30,
    bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    ...extra,
  }))!;
}

function book(assistant: AssistantData, date: string, timeSlot: string, durationMinutes: number, email = `p${seq++}@example.com`) {
  return createAppointment({
    assistant,
    input: { name: 'Path Tester', email, date, timeSlot, durationMinutes },
    attribution: { source: 'direct' },
    ip: '127.0.0.1',
    sendClientEmail: false,
  });
}

const ip = () => `10.7.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

async function post(body: Record<string, unknown>) {
  const { POST } = await import('../../app/api/appointments/route');
  const res = await POST(
    new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip() },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, headers: res.headers, json: await res.json() };
}

async function checkDate(assistantId: string, date: string): Promise<string[]> {
  const { GET } = await import('../../app/api/appointments/route');
  const res = await GET(new Request(`http://localhost:3000/api/appointments?assistantId=${assistantId}&checkDate=${date}`));
  expect(res.status).toBe(200);
  return (await res.json()).bookedSlots;
}

function mcpAuth(workspaceId: string): McpAuthContext {
  return {
    authenticated: true,
    workspaceId,
    userId: 'user_paths',
    tokenName: 'Paths agent',
    tokenId: 'tok_paths',
    scopes: ['bookings:create', 'bookings:read'],
    isMasterAdmin: false,
  };
}

// 2099-11-02 is a Monday; November 2099 is standard time in New York (UTC-5)
const MON = '2099-11-02';

describe('createAppointment always enforces range overlap', () => {
  it('refuses a 30-minute booking at 10:30 inside a 60-minute booking at 10:00', async () => {
    const ast = await newAssistant();
    const first = await book(ast, MON, '10:00', 60);
    expect(first.ok).toBe(true);
    const second = await book(ast, MON, '10:30', 30);
    expect(second).toMatchObject({ ok: false, status: 409 });
  });

  it('allows a back-to-back booking and stores the range in the assistant timezone', async () => {
    const ast = await newAssistant({ timezone: 'America/New_York' });
    expect((await book(ast, MON, '10:00', 60)).ok).toBe(true);
    const next = await book(ast, MON, '11:00', 30);
    expect(next.ok).toBe(true);
    if (!next.ok) return;
    expect(next.appointment.slotStart).toBe('2099-11-02T16:00:00.000Z');
    expect(next.appointment.slotEnd).toBe('2099-11-02T16:30:00.000Z');
  });

  it('still answers a same-person retry of the same slot as a duplicate', async () => {
    const ast = await newAssistant();
    const first = await book(ast, MON, '13:00', 30, 'same@example.com');
    const again = await book(ast, MON, '13:00', 30, 'SAME@example.com');
    expect(first.ok && again.ok).toBe(true);
    expect(again).toMatchObject({ ok: true, duplicate: true });
  });

  it('refuses a slot covered by an external calendar block', async () => {
    const ast = await newAssistant({ timezone: 'America/New_York' });
    const r = slotRange(MON, '14:00', 60, 'America/New_York')!;
    const spy = vi.spyOn(Database, 'getExternalBlocks').mockResolvedValue([{ startAt: r.start, endAt: r.end }]);
    expect(await book(ast, MON, '14:30', 30)).toMatchObject({ ok: false, status: 409 });
    expect(spy).toHaveBeenCalledWith(ast.id);
    // outside the block is still free
    expect((await book(ast, MON, '15:00', 30)).ok).toBe(true);
  });

  it('maps a database outage to 503 when Postgres is required', async () => {
    const ast = await newAssistant();
    vi.stubEnv('DB_RELATIONAL_MODE', 'true');
    expect(await book(ast, MON, '09:00', 30)).toEqual({
      ok: false,
      status: 503,
      error: 'We could not save your booking right now. Please try again in a moment.',
    });
  });
});

describe('MCP create_booking uses the same check', () => {
  it('throws BOOKING_CONFLICT for an overlapping booking with a different start time', async () => {
    const ast = await newAssistant({ timezone: 'America/New_York' });
    const auth = mcpAuth(ast.workspaceId);
    const first = await handleCreateBooking(
      { date: MON, timeSlot: '10:00', durationMinutes: 60, customerName: 'A', customerEmail: 'a@example.com', confirmed: true },
      auth,
    );
    expect(first.status).toBe('confirmed');
    const stored = await Database.getAppointmentById((first as { bookingId: string }).bookingId);
    expect(stored?.slotStart).toBe('2099-11-02T15:00:00.000Z');
    expect(stored?.slotEnd).toBe('2099-11-02T16:00:00.000Z');

    const err = await handleCreateBooking(
      { date: MON, timeSlot: '10:30', durationMinutes: 30, customerName: 'B', customerEmail: 'b@example.com', confirmed: true },
      auth,
    ).catch((e) => e);
    expect(err?.code).toBe('BOOKING_CONFLICT');
  });

  it('throws BOOKING_CONFLICT for a slot inside an external block', async () => {
    const ast = await newAssistant();
    const r = slotRange(MON, '12:00', 30, undefined)!;
    vi.spyOn(Database, 'getExternalBlocks').mockResolvedValue([{ startAt: r.start, endAt: r.end }]);
    const err = await handleCreateBooking(
      { date: MON, timeSlot: '12:00', durationMinutes: 30, customerName: 'C', customerEmail: 'c@example.com', confirmed: true },
      mcpAuth(ast.workspaceId),
    ).catch((e) => e);
    expect(err?.code).toBe('BOOKING_CONFLICT');
  });

  it('trims a padded date, so it still conflicts and the stored row carries the trimmed date and a range', async () => {
    const ast = await newAssistant();
    const auth = mcpAuth(ast.workspaceId);
    const first = await handleCreateBooking(
      { date: ` ${MON} `, timeSlot: ' 10:00 ', durationMinutes: 60, customerName: 'P', customerEmail: 'p@example.com', confirmed: true },
      auth,
    );
    expect(first.status).toBe('confirmed');
    const stored = await Database.getAppointmentById((first as { bookingId: string }).bookingId);
    expect(stored?.date).toBe(MON);
    expect(stored?.slotStart).toBe('2099-11-02T10:00:00.000Z');

    const err = await handleCreateBooking(
      { date: ` ${MON}`, timeSlot: '10:30', durationMinutes: 30, customerName: 'Q', customerEmail: 'q@example.com', confirmed: true },
      auth,
    ).catch((e) => e);
    expect(err?.code).toBe('BOOKING_CONFLICT');
  });

  it('turns a database SLOT_CONFLICT on save into BOOKING_CONFLICT', async () => {
    const ast = await newAssistant();
    vi.spyOn(Database, 'createAppointment').mockRejectedValue(Object.assign(new Error('Slot conflict'), { code: 'SLOT_CONFLICT' }));
    const err = await handleCreateBooking(
      { date: MON, timeSlot: '15:00', durationMinutes: 30, customerName: 'R', customerEmail: 'r@example.com', confirmed: true },
      mcpAuth(ast.workspaceId),
    ).catch((e) => e);
    expect(err?.code).toBe('BOOKING_CONFLICT');
    expect(err?.message).toMatch(/already booked/i);
  });
});

describe('web POST time slots', () => {
  it('refuses 12h times the validator used to accept but the parser cannot read', async () => {
    const ast = await newAssistant();
    for (const timeSlot of ['13:00 PM', '0:30 AM', '00:30 AM', '23:00 AM']) {
      const res = await post({ assistantId: ast.id, name: 'Bad time', email: `bad${seq++}@example.com`, date: MON, timeSlot });
      expect(res.status, timeSlot).toBe(400);
    }
    const all = await Database.getAppointments(ast.id);
    expect(all.filter((a) => a.assistantId === ast.id)).toHaveLength(0);
  });

  it('still accepts HH:MM and 12h range strings, storing a range', async () => {
    const ast = await newAssistant();
    const plain = await post({ assistantId: ast.id, name: 'Plain', email: 'plain@example.com', date: MON, timeSlot: '09:00', durationMinutes: 30 });
    expect(plain.status).toBe(201);
    expect(plain.json.appointment.slotStart).toBe('2099-11-02T09:00:00.000Z');
    const ranged = await post({ assistantId: ast.id, name: 'Ranged', email: 'ranged@example.com', date: MON, timeSlot: '10:00 AM - 10:30 AM' });
    expect(ranged.status).toBe(201);
    expect(ranged.json.appointment.slotStart).toBe('2099-11-02T10:00:00.000Z');
    expect(ranged.json.appointment.slotEnd).toBe('2099-11-02T10:30:00.000Z');
  });
});

describe('status changes that hit a database slot conflict', () => {
  const conflict = () => Object.assign(new Error('Slot conflict: rebooked'), { code: 'SLOT_CONFLICT' });

  it('client_cancel answers 409 instead of 500', async () => {
    const ast = await newAssistant();
    const mine = await book(ast, MON, '11:30', 30);
    if (!mine.ok) throw new Error('setup booking failed');
    vi.spyOn(Database, 'updateAppointmentStatus').mockRejectedValue(conflict());
    const res = await post({ action: 'client_cancel', manageToken: mine.appointment.manageToken });
    expect(res.status).toBe(409);
    expect(res.json.error).toBe('That time has already been booked. Please select another time.');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('admin update_status answers 409 instead of 500', async () => {
    const adminKey = `test-admin-${Math.random().toString(36).slice(2)}`;
    vi.stubEnv('ADMIN_API_KEY', adminKey);
    const ast = await newAssistant();
    const mine = await book(ast, MON, '12:30', 30);
    if (!mine.ok) throw new Error('setup booking failed');
    vi.spyOn(Database, 'updateAppointmentStatus').mockRejectedValue(conflict());
    const { POST } = await import('../../app/api/appointments/route');
    const res = await POST(
      new Request('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify({ action: 'update_status', id: mine.appointment.id, status: 'confirmed' }),
      }),
    );
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('That time has already been booked. Please select another time.');
  });
});

describe('client reschedule', () => {
  it('refuses an overlapping time, allows an adjacent one and its own overlapping range, and stores the new range', async () => {
    const ast = await newAssistant({ timezone: 'America/New_York' });
    expect((await book(ast, MON, '10:00', 60)).ok).toBe(true);
    const mine = await book(ast, MON, '14:00', 60);
    expect(mine.ok).toBe(true);
    if (!mine.ok) return;
    const manageToken = mine.appointment.manageToken;

    const clash = await post({ action: 'client_reschedule', manageToken, newDate: MON, newTimeSlot: '10:30' });
    expect(clash.status).toBe(409);

    // overlapping only its own current time is fine
    const self = await post({ action: 'client_reschedule', manageToken, newDate: MON, newTimeSlot: '14:30' });
    expect(self.status).toBe(200);

    const adjacent = await post({ action: 'client_reschedule', manageToken, newDate: MON, newTimeSlot: '11:00' });
    expect(adjacent.status).toBe(200);
    expect(adjacent.json.appointment.timeSlot).toBe('11:00');
    expect(adjacent.json.appointment.slotStart).toBe('2099-11-02T16:00:00.000Z');
    expect(adjacent.json.appointment.slotEnd).toBe('2099-11-02T17:00:00.000Z');
  });

  it('refuses an unreadable new date or time, so the stored range never goes stale', async () => {
    const ast = await newAssistant();
    const mine = await book(ast, MON, '16:00', 30);
    if (!mine.ok) throw new Error('setup booking failed');
    const res = await post({ action: 'client_reschedule', manageToken: mine.appointment.manageToken, newDate: MON, newTimeSlot: 'Morning' });
    expect(res.status).toBe(400);
    const bad = await post({ action: 'client_reschedule', manageToken: mine.appointment.manageToken, newDate: 'next week', newTimeSlot: '10:00' });
    expect(bad.status).toBe(400);
  });

  it('refuses a time covered by an external block', async () => {
    const ast = await newAssistant();
    const mine = await book(ast, MON, '09:00', 30);
    if (!mine.ok) throw new Error('setup booking failed');
    const r = slotRange(MON, '15:00', 60, undefined)!;
    vi.spyOn(Database, 'getExternalBlocks').mockResolvedValue([{ startAt: r.start, endAt: r.end }]);
    const res = await post({ action: 'client_reschedule', manageToken: mine.appointment.manageToken, newDate: MON, newTimeSlot: '15:30' });
    expect(res.status).toBe(409);
  });
});

describe('GET checkDate', () => {
  it('lists every grid start a longer booking covers, plus the stored string', async () => {
    const ast = await newAssistant();
    expect((await book(ast, MON, '10:00', 60)).ok).toBe(true);
    const booked = await checkDate(ast.id, MON);
    expect(booked).toContain('10:00');
    expect(booked).toContain('10:30');
    expect(booked).not.toContain('11:00');
    expect(booked).not.toContain('09:30');
  });

  it('lists grid starts an external block covers', async () => {
    const ast = await newAssistant();
    const r = slotRange(MON, '13:00', 30, undefined)!;
    vi.spyOn(Database, 'getExternalBlocks').mockResolvedValue([{ startAt: r.start, endAt: r.end }]);
    const booked = await checkDate(ast.id, MON);
    expect(booked).toEqual(['13:00']);
  });
});

describe('503 when Postgres is required but unavailable', () => {
  it('a new booking through the route answers 503 with Retry-After', async () => {
    const ast = await newAssistant();
    vi.stubEnv('DB_RELATIONAL_MODE', 'true');
    const res = await post({ assistantId: ast.id, name: 'Outage', email: 'outage@example.com', date: MON, timeSlot: '16:00' });
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('5');
  });

  it('reschedule and client cancel answer 503 with Retry-After', async () => {
    const ast = await newAssistant();
    const mine = await book(ast, MON, '09:30', 30);
    if (!mine.ok) throw new Error('setup booking failed');
    vi.stubEnv('DB_RELATIONAL_MODE', 'true');

    const moved = await post({ action: 'client_reschedule', manageToken: mine.appointment.manageToken, newDate: MON, newTimeSlot: '16:30' });
    expect(moved.status).toBe(503);
    expect(moved.headers.get('Retry-After')).toBe('5');

    const cancelled = await post({ action: 'client_cancel', manageToken: mine.appointment.manageToken });
    expect(cancelled.status).toBe(503);
    expect(cancelled.headers.get('Retry-After')).toBe('5');
  });
});
