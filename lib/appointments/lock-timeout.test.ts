import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * A day lock that cannot be taken in time (another request holds it) answers 503 with Retry-After: 5 on every path that
 * takes it, instead of a 500. The day lock is replaced by one that always times out with the real error text; the real
 * isBookingLockTimeout decides. Runs in JSON mode with every database and cache URL blanked.
 */
vi.mock('@/lib/appointments/booking-lock', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./booking-lock')>();
  return {
    ...actual,
    acquireDayLock: async (_assistantId: string, date: string, timeoutMs = 10000) => {
      throw new Error(`Booking lock timeout after ${timeoutMs}ms for slot: day on ${date}`);
    },
  };
});

import { Database, type AssistantData } from '../db';
import { createAppointment } from './create';

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
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const MON = '2099-11-02';
const RETRY_MESSAGE = 'We could not save your booking right now. Please try again in a moment.';
let seq = 0;

async function newAssistant(): Promise<AssistantData> {
  const created = await Database.createAssistant({ name: 'Lock timeout test', workspaceId: `ws_lock_${Date.now().toString(36)}_${seq++}` });
  return (await Database.updateAssistant(created.id, {
    bookingStartHour: '09:00',
    bookingEndHour: '17:00',
    bookingSlotDuration: 30,
    bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  }))!;
}

const ip = () => `10.8.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

async function post(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  const { POST } = await import('../../app/api/appointments/route');
  const res = await POST(
    new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip(), ...headers },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, headers: res.headers, json: await res.json() };
}

/** A booking written straight to the JSON state (the lock is under test here, not the booking path). */
async function stored(ast: AssistantData, timeSlot: string, cancelled = false) {
  const apt = await Database.saveAppointment({ assistantId: ast.id, name: 'Held', email: `held${seq++}@example.com`, date: MON, timeSlot, durationMinutes: 30 });
  if (cancelled) await Database.updateAppointmentStatus(apt.id, 'cancelled');
  return apt;
}

describe('day lock timeout', () => {
  it('createAppointment answers 503 with a 5 second retry instead of throwing', async () => {
    const ast = await newAssistant();
    const result = await createAppointment({
      assistant: ast,
      input: { name: 'Busy', email: 'busy@example.com', date: MON, timeSlot: '10:00', durationMinutes: 30 },
      attribution: { source: 'direct' },
      ip: '127.0.0.1',
      sendClientEmail: false,
    });
    expect(result).toEqual({ ok: false, status: 503, error: RETRY_MESSAGE, retryAfterSeconds: 5 });
  });

  it('a new booking through the route answers 503 with Retry-After: 5', async () => {
    const ast = await newAssistant();
    const res = await post({ assistantId: ast.id, name: 'Busy', email: 'busy2@example.com', date: MON, timeSlot: '10:00' });
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('5');
    expect(res.json.error).toBe(RETRY_MESSAGE);
  });

  it('a client reschedule answers 503 with Retry-After: 5', async () => {
    const ast = await newAssistant();
    const apt = await stored(ast, '11:00');
    const res = await post({ action: 'client_reschedule', manageToken: apt.manageToken, newDate: MON, newTimeSlot: '12:00' });
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('5');
    expect(res.json.error).toBe(RETRY_MESSAGE);
  });

  it('an admin un-cancel answers 503 with Retry-After: 5', async () => {
    const adminKey = `test-admin-${Math.random().toString(36).slice(2)}`;
    vi.stubEnv('ADMIN_API_KEY', adminKey);
    const ast = await newAssistant();
    const apt = await stored(ast, '13:00', true);
    const res = await post({ action: 'update_status', id: apt.id, status: 'confirmed' }, { Authorization: `Bearer ${adminKey}` });
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('5');
  });
});
