import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Database, type AssistantData } from '@/lib/db';
import { BookingUnavailableError } from '@/lib/appointments/errors';
import { BOOKING_UNAVAILABLE_MESSAGE, createAppointment } from '@/lib/appointments/create';
import { handleCheckAvailability } from '@/lib/mcp/tools/availability';
import { handleCreateBooking } from '@/lib/mcp/tools/bookings';
import { toMcpErrorCode } from '@/lib/mcp/errors';
import { productionVoiceDeps } from '@/lib/voice/server';
import { newCallState } from '@/lib/voice/turn';
import * as logger from '@/lib/logging/logger';
import type { McpAuthContext } from '@/lib/mcp/types';

/**
 * Database.getExternalBlocks throws BookingUnavailableError when the linked calendars cannot be read (relational mode,
 * Postgres down). Code that only NARROWS what is offered falls back to "no blocks" and logs it; code that CONFIRMS a
 * booking refuses the same way it already does for any other DB_UNAVAILABLE. Runs in JSON mode with every database and
 * cache URL blanked; only getExternalBlocks is made to throw.
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

let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  for (const k of DB_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  vi.spyOn(Database, 'getExternalBlocks').mockRejectedValue(new BookingUnavailableError());
  logSpy = vi.spyOn(logger, 'logEvent').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const MON = '2099-11-02';
let seq = 0;

async function newAssistant(workspaceId = `ws_blocks_${Date.now().toString(36)}_${seq++}`): Promise<AssistantData> {
  const created = await Database.createAssistant({ name: 'Blocks failure test', workspaceId });
  return (await Database.updateAssistant(created.id, {
    bookingStartHour: '09:00',
    bookingEndHour: '17:00',
    bookingSlotDuration: 30,
    bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  }))!;
}

const ip = () => `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

async function post(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  const { POST } = await import('../../../app/api/appointments/route');
  const res = await POST(
    new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip(), ...headers },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, headers: res.headers, json: await res.json() };
}

const loggedBlocksUnavailable = () =>
  logSpy.mock.calls.filter((c: unknown[]) => (c[0] as { event?: string }).event === 'booking.blocks_unavailable');

describe('narrowing callers fall back to no blocks', () => {
  it('the booking widget availability check (checkDate) answers normally and logs it', async () => {
    const ast = await newAssistant();
    const { GET } = await import('../../../app/api/appointments/route');
    const res = await GET(new Request(`http://localhost:3000/api/appointments?assistantId=${ast.id}&checkDate=${MON}`));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.date).toBe(MON);
    expect(Array.isArray(json.bookedSlots)).toBe(true);
    expect(loggedBlocksUnavailable()).toHaveLength(1);
  });

  it('the log line carries no URL or personal data', async () => {
    const ast = await newAssistant();
    const { GET } = await import('../../../app/api/appointments/route');
    await GET(new Request(`http://localhost:3000/api/appointments?assistantId=${ast.id}&checkDate=${MON}`));
    const entry = loggedBlocksUnavailable()[0][0] as { meta?: Record<string, unknown> };
    expect(JSON.stringify(entry.meta)).not.toMatch(/https?:|@/);
  });

  it('MCP check_availability returns slots instead of failing', async () => {
    const ws = `ws_blocks_mcp_${seq++}`;
    await newAssistant(ws);
    const auth: McpAuthContext = { authenticated: true, workspaceId: ws, userId: 'u', tokenName: 't', tokenId: 'tok', scopes: ['bookings:read'] };
    const res = await handleCheckAvailability({ date: MON }, auth);
    expect(res.availableSlotsCount).toBeGreaterThan(0);
    expect(loggedBlocksUnavailable()).toHaveLength(1);
  });

  it('voice offers get no blocks instead of an error', async () => {
    const ast = await newAssistant();
    await expect(productionVoiceDeps().getExternalBlocks!(ast.id)).resolves.toEqual([]);
    expect(loggedBlocksUnavailable()).toHaveLength(1);
  });
});

describe('confirming callers fail closed', () => {
  it('createAppointment answers with the friendly retry message and saves nothing', async () => {
    const ast = await newAssistant();
    const result = await createAppointment({
      assistant: ast,
      input: { name: 'Guest', email: 'guest@example.com', date: MON, timeSlot: '10:00', durationMinutes: 30 },
      attribution: { source: 'direct' },
      ip: '127.0.0.1',
      sendClientEmail: false,
    });
    expect(result).toEqual({ ok: false, status: 503, error: BOOKING_UNAVAILABLE_MESSAGE });
    expect((await Database.getAppointments(ast.id, undefined, { ownOnly: true })).filter((a) => a.date === MON)).toHaveLength(0);
  });

  it('a new booking through the route answers 503 with Retry-After: 60', async () => {
    const ast = await newAssistant();
    const res = await post({ assistantId: ast.id, name: 'Guest', email: 'guest2@example.com', date: MON, timeSlot: '10:00' });
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('60');
    expect(res.json.error).toBe(BOOKING_UNAVAILABLE_MESSAGE);
  });

  it('a client reschedule answers 503 with Retry-After: 60 and does not move the booking', async () => {
    const ast = await newAssistant();
    const apt = await Database.saveAppointment({ assistantId: ast.id, name: 'Held', email: 'held@example.com', date: MON, timeSlot: '11:00', durationMinutes: 30 });
    const res = await post({ action: 'client_reschedule', manageToken: apt.manageToken, newDate: MON, newTimeSlot: '12:00' });
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('60');
    expect((await Database.getAppointmentById(apt.id))?.timeSlot).toBe('11:00');
  });

  it('an admin un-cancel answers 503 with Retry-After: 60 and leaves the booking cancelled', async () => {
    const adminKey = `test-admin-${Math.random().toString(36).slice(2)}`;
    vi.stubEnv('ADMIN_API_KEY', adminKey);
    const ast = await newAssistant();
    const apt = await Database.saveAppointment({ assistantId: ast.id, name: 'Held', email: 'held2@example.com', date: MON, timeSlot: '13:00', durationMinutes: 30 });
    await Database.updateAppointmentStatus(apt.id, 'cancelled');
    const res = await post({ action: 'update_status', id: apt.id, status: 'confirmed' }, { Authorization: `Bearer ${adminKey}` });
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('60');
    expect((await Database.getAppointmentById(apt.id))?.status).toBe('cancelled');
  });

  it('MCP create_booking fails with SERVICE_UNAVAILABLE and books nothing', async () => {
    const ws = `ws_blocks_mcp_${seq++}`;
    const ast = await newAssistant(ws);
    const auth: McpAuthContext = { authenticated: true, workspaceId: ws, userId: 'u', tokenName: 't', tokenId: 'tok', scopes: ['bookings:create'] };
    const err = await handleCreateBooking(
      { date: MON, timeSlot: '10:00', customerName: 'Guest', customerEmail: 'guest3@example.com', confirmed: true },
      auth,
    ).then(
      () => null,
      (e: unknown) => e,
    );
    expect(err).toBeTruthy();
    expect(toMcpErrorCode(err)).toBe('SERVICE_UNAVAILABLE');
    expect((await Database.getAppointments(ast.id, undefined, { ownOnly: true })).filter((a) => a.date === MON)).toHaveLength(0);
  });

  it('voice bookAppointment reports a transient failure, not a conflict, and books nothing', async () => {
    const ast = await newAssistant();
    const state = newCallState({ callId: 'call_1', assistantId: ast.id, from: '+15550001111', to: '+15550002222', conversationId: 'conv_1' });
    const result = await productionVoiceDeps().bookAppointment({
      assistant: ast,
      booking: { date: MON, timeSlot: '10:00', durationMinutes: 30, name: 'Caller', phone: '+15550001111' },
      state,
    });
    expect(result).toEqual({ ok: false, conflict: false });
    expect((await Database.getAppointments(ast.id, undefined, { ownOnly: true })).filter((a) => a.date === MON)).toHaveLength(0);
  });
});
