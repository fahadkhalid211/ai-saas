import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Every path that confirms a booking refreshes the owner's linked calendars BEFORE it takes the day lock (the refresh does network
 * work for up to 3 seconds and must not hold the lock), and a refresh that throws never stops the booking.
 * The refresh and the lock are replaced by recorders; everything else is real (JSON mode, every database URL blanked).
 */
const rec = vi.hoisted(() => ({ order: [] as string[], refresh: null as null | ((assistant: any) => Promise<{ stale: boolean }>) }));

vi.mock('@/lib/calendar/sync/sync-link', () => ({
  refreshAssistantCalendars: async (assistant: any) => rec.refresh!(assistant),
}));

vi.mock('@/lib/appointments/booking-lock', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../appointments/booking-lock')>();
  return {
    ...actual,
    acquireDayLock: async (...args: Parameters<typeof actual.acquireDayLock>) => {
      rec.order.push('lock');
      const release = await actual.acquireDayLock(...args);
      return () => {
        rec.order.push('unlock');
        release();
      };
    },
  };
});

import { Database, type AssistantData } from '@/lib/db';
import { createAppointment } from '@/lib/appointments/create';
import { handleCreateBooking } from '@/lib/mcp/tools/bookings';
import type { McpAuthContext } from '@/lib/mcp/types';

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

const DAY = '2099-11-02'; // a Monday
let seq = 0;

const slowRefresh = () => async () => {
  rec.order.push('refresh:start');
  await new Promise((r) => setTimeout(r, 25));
  rec.order.push('refresh:end');
  return { stale: false };
};

beforeEach(() => {
  for (const k of DB_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  rec.order = [];
  rec.refresh = slowRefresh();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

async function newAssistant(): Promise<AssistantData> {
  const created = await Database.createAssistant({ name: 'Refresh test', workspaceId: `ws_refresh_${Date.now().toString(36)}_${seq++}` });
  return (await Database.updateAssistant(created.id, {
    bookingStartHour: '09:00',
    bookingEndHour: '17:00',
    bookingSlotDuration: 30,
    bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  }))!;
}

const mcpAuth = (workspaceId: string): McpAuthContext => ({
  authenticated: true,
  workspaceId,
  userId: 'user_refresh',
  tokenName: 'Refresh agent',
  tokenId: 'tok_refresh',
  scopes: ['bookings:create', 'bookings:read'],
  isMasterAdmin: false,
});

const create = (assistant: AssistantData, timeSlot: string) =>
  createAppointment({
    assistant,
    input: { name: 'Guest', email: `guest${seq++}@example.com`, date: DAY, timeSlot, durationMinutes: 30 },
    attribution: { source: 'direct' },
    ip: '127.0.0.1',
    sendClientEmail: false,
  });

async function route(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  const { POST } = await import('../../../app/api/appointments/route');
  const res = await POST(
    new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`, ...headers },
      body: JSON.stringify(body),
    }),
  );
  return { status: res.status, json: await res.json() };
}

const stored = async (ast: AssistantData, timeSlot: string, cancelled = false) => {
  const apt = await Database.saveAppointment({ assistantId: ast.id, name: 'Held', email: `held${seq++}@example.com`, date: DAY, timeSlot, durationMinutes: 30 });
  if (cancelled) await Database.updateAppointmentStatus(apt.id, 'cancelled');
  return apt;
};

/** The refresh finished, and only then was the day lock asked for. */
const refreshBeforeLock = () => {
  const refreshEnd = rec.order.indexOf('refresh:end');
  const lock = rec.order.indexOf('lock');
  expect(refreshEnd).toBeGreaterThanOrEqual(0);
  expect(lock).toBeGreaterThan(refreshEnd);
};

describe('createAppointment', () => {
  it('finishes the refresh before it takes the day lock, with the assistant being booked', async () => {
    const ast = await newAssistant();
    const seen: string[] = [];
    rec.refresh = async (a) => {
      seen.push(a.id);
      return slowRefresh()();
    };
    const res = await create(ast, '10:00');
    expect(res.ok).toBe(true);
    expect(seen).toEqual([ast.id]);
    refreshBeforeLock();
  });

  it('a refresh that rejects or throws does not stop the booking', async () => {
    const ast = await newAssistant();
    rec.refresh = async () => {
      throw new Error('refresh exploded');
    };
    expect((await create(ast, '10:30')).ok).toBe(true);
    rec.refresh = (() => {
      throw new Error('sync throw');
    }) as any;
    expect((await create(ast, '11:00')).ok).toBe(true);
  });
});

describe('MCP create_booking', () => {
  const args = (timeSlot: string) => ({ customerName: 'Guest', customerEmail: `mcp${seq++}@example.com`, date: DAY, timeSlot, confirmed: true });

  it('finishes the refresh before it takes the day lock', async () => {
    const ast = await newAssistant();
    const result: any = await handleCreateBooking(args('10:00'), mcpAuth(ast.workspaceId!));
    expect(result.status).toBe('confirmed');
    refreshBeforeLock();
  });

  it('survives a throwing refresh', async () => {
    const ast = await newAssistant();
    rec.refresh = async () => {
      throw new Error('refresh exploded');
    };
    const result: any = await handleCreateBooking(args('10:30'), mcpAuth(ast.workspaceId!));
    expect(result.status).toBe('confirmed');
  });
});

describe('client reschedule', () => {
  it('finishes the refresh before it takes the day lock', async () => {
    const ast = await newAssistant();
    const apt = await stored(ast, '11:00');
    rec.order = [];
    const res = await route({ action: 'client_reschedule', manageToken: apt.manageToken, newDate: DAY, newTimeSlot: '12:00' });
    expect(res.status).toBe(200);
    refreshBeforeLock();
  });

  it('survives a throwing refresh', async () => {
    const ast = await newAssistant();
    const apt = await stored(ast, '11:30');
    rec.refresh = async () => {
      throw new Error('refresh exploded');
    };
    const res = await route({ action: 'client_reschedule', manageToken: apt.manageToken, newDate: DAY, newTimeSlot: '12:30' });
    expect(res.status).toBe(200);
    expect(res.json.appointment.timeSlot).toBe('12:30');
  });
});

describe('admin un-cancel', () => {
  const adminKey = () => `test-admin-${Math.random().toString(36).slice(2)}`;

  it('finishes the refresh before it takes the day lock', async () => {
    const key = adminKey();
    vi.stubEnv('ADMIN_API_KEY', key);
    const ast = await newAssistant();
    const apt = await stored(ast, '13:00', true);
    rec.order = [];
    const res = await route({ action: 'update_status', id: apt.id, status: 'confirmed' }, { Authorization: `Bearer ${key}` });
    expect(res.status).toBe(200);
    refreshBeforeLock();
  });

  it('survives a throwing refresh', async () => {
    const key = adminKey();
    vi.stubEnv('ADMIN_API_KEY', key);
    const ast = await newAssistant();
    const apt = await stored(ast, '13:30', true);
    rec.refresh = async () => {
      throw new Error('refresh exploded');
    };
    const res = await route({ action: 'update_status', id: apt.id, status: 'confirmed' }, { Authorization: `Bearer ${key}` });
    expect(res.status).toBe(200);
  });

  it('does not refresh when the status change is not a restore (a cancel takes no time back)', async () => {
    const key = adminKey();
    vi.stubEnv('ADMIN_API_KEY', key);
    const ast = await newAssistant();
    const apt = await stored(ast, '14:00');
    const spy = vi.fn(slowRefresh());
    rec.refresh = spy;
    const res = await route({ action: 'update_status', id: apt.id, status: 'cancelled' }, { Authorization: `Bearer ${key}` });
    expect(res.status).toBe(200);
    expect(spy).not.toHaveBeenCalled();
  });
});
