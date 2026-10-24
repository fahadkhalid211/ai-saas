import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Database, type AssistantData } from '@/lib/db';
import { createAppointment } from '@/lib/appointments/create';
import { handleCheckAvailability } from '@/lib/mcp/tools/availability';
import { handleCreateBooking } from '@/lib/mcp/tools/bookings';
import { productionVoiceDeps } from '@/lib/voice/server';
import { newCallState } from '@/lib/voice/turn';
import { blocksLowerBound } from './blocks-bound';
import type { McpAuthContext } from '@/lib/mcp/types';

/**
 * Every booking and availability check passes getExternalBlocks a lower bound, the start of the date minus one day (UTC,
 * built from the date text, never "now"), so a tenant with up to 100,000 stored blocks is not read in full on each booking.
 * One day of slack covers every time-zone offset. JSON mode, every database and cache URL blanked.
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

const MON = '2099-11-02';
const BOUND = new Date('2099-11-01T00:00:00.000Z');
let spy: ReturnType<typeof vi.spyOn>;
let seq = 0;

beforeEach(() => {
  for (const k of DB_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  spy = vi.spyOn(Database, 'getExternalBlocks').mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

async function newAssistant(workspaceId = `ws_bound_${Date.now().toString(36)}_${seq++}`): Promise<AssistantData> {
  const created = await Database.createAssistant({ name: 'Bound test', workspaceId });
  return (await Database.updateAssistant(created.id, {
    bookingStartHour: '09:00',
    bookingEndHour: '17:00',
    bookingSlotDuration: 30,
    bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  }))!;
}

const lastBound = () => (spy.mock.calls[spy.mock.calls.length - 1] as unknown[])[1];
const ip = () => `10.6.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

describe('blocksLowerBound', () => {
  it('is the start of the date minus one day, in UTC', () => {
    expect(blocksLowerBound('2099-11-02')?.toISOString()).toBe('2099-11-01T00:00:00.000Z');
    expect(blocksLowerBound('2026-03-01')?.toISOString()).toBe('2026-02-28T00:00:00.000Z');
    expect(blocksLowerBound('2026-01-01')?.toISOString()).toBe('2025-12-31T00:00:00.000Z');
  });

  it('is undefined (no bound) for anything that is not a real date', () => {
    for (const bad of ['', 'tomorrow', '2026-13-01', '2026-02-30', '26-01-01', undefined, null]) {
      expect(blocksLowerBound(bad as string)).toBeUndefined();
    }
  });
});

describe('callers pass the bound for their date', () => {
  it('createAppointment', async () => {
    const ast = await newAssistant();
    await createAppointment({
      assistant: ast,
      input: { name: 'Guest', email: 'guest@example.com', date: MON, timeSlot: '10:00', durationMinutes: 30 },
      attribution: { source: 'direct' },
      ip: '127.0.0.1',
      sendClientEmail: false,
    });
    expect(spy).toHaveBeenCalled();
    expect(lastBound()).toEqual(BOUND);
  });

  it('the widget availability check (checkDate)', async () => {
    const ast = await newAssistant();
    const { GET } = await import('../../../app/api/appointments/route');
    await GET(new Request(`http://localhost:3000/api/appointments?assistantId=${ast.id}&checkDate=${MON}`));
    expect(lastBound()).toEqual(BOUND);
  });

  it('client reschedule uses the NEW date', async () => {
    const ast = await newAssistant();
    const apt = await Database.saveAppointment({ assistantId: ast.id, name: 'Held', email: 'held@example.com', date: '2099-12-07', timeSlot: '11:00', durationMinutes: 30 });
    const { POST } = await import('../../../app/api/appointments/route');
    await POST(
      new Request('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip() },
        body: JSON.stringify({ action: 'client_reschedule', manageToken: apt.manageToken, newDate: MON, newTimeSlot: '12:00' }),
      }),
    );
    expect(lastBound()).toEqual(BOUND);
  });

  it('admin un-cancel uses the booking\'s date', async () => {
    const adminKey = `test-admin-${Math.random().toString(36).slice(2)}`;
    vi.stubEnv('ADMIN_API_KEY', adminKey);
    const ast = await newAssistant();
    const apt = await Database.saveAppointment({ assistantId: ast.id, name: 'Held', email: 'held2@example.com', date: MON, timeSlot: '13:00', durationMinutes: 30 });
    await Database.updateAppointmentStatus(apt.id, 'cancelled');
    const { POST } = await import('../../../app/api/appointments/route');
    await POST(
      new Request('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip(), Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify({ action: 'update_status', id: apt.id, status: 'confirmed' }),
      }),
    );
    expect(lastBound()).toEqual(BOUND);
  });

  it('MCP check_availability and create_booking', async () => {
    const ws = `ws_bound_mcp_${seq++}`;
    await newAssistant(ws);
    const auth: McpAuthContext = { authenticated: true, workspaceId: ws, userId: 'u', tokenName: 't', tokenId: 'tok', scopes: ['bookings:read', 'bookings:create'] };
    await handleCheckAvailability({ date: MON }, auth);
    expect(lastBound()).toEqual(BOUND);
    spy.mockClear();
    await handleCreateBooking({ date: MON, timeSlot: '10:00', customerName: 'Guest', customerEmail: 'guest3@example.com', confirmed: true }, auth);
    expect(lastBound()).toEqual(BOUND);
  });

  it('voice bookAppointment', async () => {
    const ast = await newAssistant();
    const state = newCallState({ callId: 'call_1', assistantId: ast.id, from: '+15550001111', to: '+15550002222', conversationId: 'conv_1' });
    await productionVoiceDeps().bookAppointment({
      assistant: ast,
      booking: { date: MON, timeSlot: '10:00', durationMinutes: 30, name: 'Caller', phone: '+15550001111' },
      state,
    });
    expect(lastBound()).toEqual(BOUND);
  });
});
