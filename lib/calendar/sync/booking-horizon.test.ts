import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Booking-time refreshes would read the links over the network: every read fails at once instead.
vi.mock('./fetch-feed', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./fetch-feed')>();
  return { ...actual, fetchCalendarFeed: async () => ({ status: 'error', error: 'Could not reach the calendar server.' }) };
});

import { Database, type AssistantData } from '@/lib/db';
import { createAppointment } from '@/lib/appointments/create';
import { handleCreateBooking } from '@/lib/mcp/tools/bookings';
import { productionVoiceDeps } from '@/lib/voice/server';
import { newCallState } from '@/lib/voice/turn';
import { bookingDateTooFar, initialBookingState } from '@/lib/voice/booking-flow';
import type { McpAuthContext } from '@/lib/mcp/types';
import { _resetSyncStateForTesting } from './sync-link';
import { isBeyondCalendarWindow, SYNC_WINDOW_FORWARD_DAYS, TOO_FAR_AHEAD_MESSAGE } from './window';
import { tooFarAheadForLinkedCalendars } from './booking-horizon';

/**
 * Linked calendars are read for 400 days ahead. An assistant with a linked calendar refuses a booking, reschedule or restore on a date
 * beyond that (it could not be checked against the calendar); an assistant without one is unchanged. JSON mode, no database, no network.
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

const DAY = 24 * 60 * 60 * 1000;
const dateIn = (days: number) => new Date(Date.now() + days * DAY).toISOString().slice(0, 10);
const FAR = dateIn(450);
const NEAR = dateIn(30);
let seq = 0;

beforeEach(() => {
  for (const k of DB_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  _resetSyncStateForTesting();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

async function newAssistant(opts: { linked: boolean; workspaceId?: string }): Promise<AssistantData> {
  const created = await Database.createAssistant({ name: 'Horizon test', workspaceId: opts.workspaceId ?? `ws_horizon_${Date.now().toString(36)}_${seq++}` });
  const ast = (await Database.updateAssistant(created.id, { timezone: 'UTC' }))!;
  if (opts.linked) {
    await Database.saveCalendarLink({ id: `cal_h${seq++}`, assistantId: ast.id, label: 'google', url: `https://calendar.example.com/h/${seq}.ics`, createdAt: new Date().toISOString() });
  }
  return ast;
}

const book = (assistant: AssistantData, date: string, email = `h${seq++}@example.com`) =>
  createAppointment({ assistant, input: { name: 'Far Guest', email, date, timeSlot: '10:00', durationMinutes: 30 }, attribution: { source: 'direct' }, ip: '127.0.0.1', sendClientEmail: false });

describe('isBeyondCalendarWindow', () => {
  const now = new Date('2026-10-24T10:00:00Z');
  it('allows dates well inside the 400-day window and refuses the last days and anything later', () => {
    expect(SYNC_WINDOW_FORWARD_DAYS).toBe(400);
    expect(isBeyondCalendarWindow('2026-10-24', now)).toBe(false);
    expect(isBeyondCalendarWindow('2027-11-24', now)).toBe(false); // 396 days
    expect(isBeyondCalendarWindow('2027-11-26', now)).toBe(true); // 398 days: its local day may end after the blocks do
    expect(isBeyondCalendarWindow('2030-01-01', now)).toBe(true);
  });
  it('is false for text that is not a date', () => {
    for (const bad of ['', 'soon', '2026-1-1']) expect(isBeyondCalendarWindow(bad, now)).toBe(false);
  });
});

describe('tooFarAheadForLinkedCalendars', () => {
  it('is true only with a linked calendar and a date beyond the window', async () => {
    const linked = await newAssistant({ linked: true });
    const plain = await newAssistant({ linked: false });
    expect(await tooFarAheadForLinkedCalendars(linked.id, FAR)).toBe(true);
    expect(await tooFarAheadForLinkedCalendars(linked.id, NEAR)).toBe(false);
    expect(await tooFarAheadForLinkedCalendars(plain.id, FAR)).toBe(false);
  });
  it('does not read the links for a near date, and answers false when they cannot be read', async () => {
    const linked = await newAssistant({ linked: true });
    const spy = vi.spyOn(Database, 'getCalendarLinks');
    await tooFarAheadForLinkedCalendars(linked.id, NEAR);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRejectedValue(new Error('down'));
    expect(await tooFarAheadForLinkedCalendars(linked.id, FAR)).toBe(false);
  });
});

describe('every path that confirms a booking', () => {
  it('createAppointment refuses a far date with 400 and the friendly message when a calendar is linked', async () => {
    const linked = await newAssistant({ linked: true });
    const res = await book(linked, FAR);
    expect(res).toMatchObject({ ok: false, status: 400, error: TOO_FAR_AHEAD_MESSAGE, reason: 'too_far_ahead' });
    expect(await Database.getAppointments(linked.id, undefined, { ownOnly: true })).toEqual([]);
    expect((await book(linked, NEAR)).ok).toBe(true);
  });

  it('createAppointment is unchanged without a linked calendar', async () => {
    const plain = await newAssistant({ linked: false });
    expect((await book(plain, FAR)).ok).toBe(true);
  });

  it('the public booking API answers 400 with the message', async () => {
    const linked = await newAssistant({ linked: true });
    const { POST } = await import('../../../app/api/appointments/route');
    const day = new Date(Date.parse(`${FAR}T00:00:00Z`));
    // opening days default to weekdays: move to a Monday
    while (day.getUTCDay() !== 1) day.setUTCDate(day.getUTCDate() + 1);
    const res = await POST(
      new Request('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.7.${seq++ % 250}.1` },
        body: JSON.stringify({ assistantId: linked.id, name: 'Far Guest', email: 'far@example.com', date: day.toISOString().slice(0, 10), timeSlot: '10:00' }),
      }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(TOO_FAR_AHEAD_MESSAGE);
  });

  it('client reschedule to a far date answers 400 and leaves the booking as it was', async () => {
    const linked = await newAssistant({ linked: true });
    const mine = await book(linked, NEAR);
    if (!mine.ok) throw new Error('setup booking failed');
    const { POST } = await import('../../../app/api/appointments/route');
    const res = await POST(
      new Request('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'client_reschedule', manageToken: mine.appointment.manageToken, newDate: FAR, newTimeSlot: '11:00' }),
      }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(TOO_FAR_AHEAD_MESSAGE);
    expect((await Database.getAppointmentById(mine.appointment.id))?.date).toBe(NEAR);
  });

  it('admin un-cancel of a far booking answers 409 with the message and keeps it cancelled', async () => {
    const adminKey = `test-admin-${Math.random().toString(36).slice(2)}`;
    vi.stubEnv('ADMIN_API_KEY', adminKey);
    const linked = await newAssistant({ linked: true });
    const apt = await Database.saveAppointment({ assistantId: linked.id, name: 'Held', email: 'held@example.com', date: FAR, timeSlot: '13:00', durationMinutes: 30 });
    await Database.updateAppointmentStatus(apt.id, 'cancelled');
    const { POST } = await import('../../../app/api/appointments/route');
    const res = await POST(
      new Request('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify({ action: 'update_status', id: apt.id, status: 'confirmed' }),
      }),
    );
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe(TOO_FAR_AHEAD_MESSAGE);
    expect((await Database.getAppointmentById(apt.id))?.status).toBe('cancelled');
  });

  it('MCP create_booking refuses a far date with a validation error carrying the message', async () => {
    const ws = `ws_horizon_mcp_${seq++}`;
    await newAssistant({ linked: true, workspaceId: ws });
    const auth: McpAuthContext = { authenticated: true, workspaceId: ws, userId: 'u', tokenName: 't', tokenId: 'tok', scopes: ['bookings:read', 'bookings:create'] };
    await expect(handleCreateBooking({ date: FAR, timeSlot: '10:00', customerName: 'Guest', customerEmail: 'mcp-far@example.com', confirmed: true }, auth)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: TOO_FAR_AHEAD_MESSAGE,
    });
  });

  it('voice: bookAppointment reports the date as too far, and the flow asks for another day', async () => {
    const linked = await newAssistant({ linked: true });
    const state = newCallState({ callId: 'call_h', assistantId: linked.id, from: '+15550001111', to: '+15550002222', conversationId: 'conv_h' });
    const result = await productionVoiceDeps().bookAppointment({ assistant: linked, booking: { date: FAR, timeSlot: '10:00', durationMinutes: 30, name: 'Caller', phone: '+15550001111' }, state });
    expect(result).toEqual({ ok: false, conflict: false, tooFarAhead: true });

    const turn = bookingDateTooFar({ ...initialBookingState(), active: true, step: 'confirm', date: FAR, timeSlot: '10:00', name: 'Caller' });
    expect(turn.say).toContain(TOO_FAR_AHEAD_MESSAGE);
    expect(turn.state).toMatchObject({ active: true, step: 'date', date: undefined, timeSlot: undefined, name: 'Caller' });
  });
});
