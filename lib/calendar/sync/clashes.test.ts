import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const mail = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('@/lib/email', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/email')>();
  return { ...actual, sendOperationalEmail: (o: unknown) => mail.send(o) };
});

import { Database, resolveDataDir, type AssistantData, type AppointmentData } from '@/lib/db';
import * as logger from '@/lib/logging/logger';
import { detectClashes } from './clashes';

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
const dataFile = () => path.join(resolveDataDir(), 'calendar-sync.json');

const NOW = new Date('2026-10-24T10:00:00.000Z');
const SECRET_URL = 'https://calendar.example.com/private/SECRETKEY-abc123/basic.ics';
let seq = 0;

beforeEach(() => {
  for (const k of REAL_BACKEND_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  fs.rmSync(dataFile(), { force: true });
  mail.send.mockReset();
  mail.send.mockResolvedValue({ success: true });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

async function setup(opts: { email?: string | null; timezone?: string } = {}) {
  const created = await Database.createAssistant({ name: 'Clash test', workspaceId: `ws_clash_${Date.now().toString(36)}_${seq++}` });
  const assistant = (await Database.updateAssistant(created.id, {
    timezone: opts.timezone ?? 'UTC',
    ...(opts.email === null ? {} : { supportReceiverEmail: opts.email ?? 'owner@example.com' }),
  }))!;
  const link = { id: `cal_${seq++}`, assistantId: assistant.id, label: 'google' as const, url: SECRET_URL, createdAt: '2026-10-01T08:00:00.000Z' };
  await Database.saveCalendarLink(link);
  return { assistant, link };
}

const block = (a: string, b: string) => ({ startAt: new Date(a), endAt: new Date(b) });
const book = (assistant: AssistantData, date: string, timeSlot: string, over: Partial<AppointmentData> = {}) =>
  Database.saveAppointment({ assistantId: assistant.id, name: `Guest ${seq++}`, email: `g${seq}@example.com`, date, timeSlot, durationMinutes: 30, ...over });

describe('detectClashes', () => {
  it('flags a future booking that overlaps a block, once, and not again on the next run', async () => {
    const { assistant, link } = await setup();
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T09:00:00Z', '2026-10-25T10:00:00Z')]);
    const apt = await book(assistant, '2026-10-25', '09:30', { name: 'Dana Guest' });

    const first = await detectClashes(assistant, NOW);

    expect(first.map((a) => a.id)).toEqual([apt.id]);
    expect(first[0].externalClashAt).toBe(NOW.toISOString());
    const stored = await Database.getAppointmentById(apt.id);
    expect(stored?.externalClashAt).toBe(NOW.toISOString());

    const second = await detectClashes(assistant, new Date(NOW.getTime() + 600_000));
    expect(second).toEqual([]);
    expect((await Database.getAppointmentById(apt.id))?.externalClashAt).toBe(NOW.toISOString());
    const notes = (await Database.getNotifications(assistant.id, 50)).filter((n) => n.type === 'calendar_clash');
    expect(notes).toHaveLength(1);
    expect(mail.send).toHaveBeenCalledTimes(1);
  });

  it('never changes the booking itself: status, date, time and duration stay as they were', async () => {
    const { assistant, link } = await setup();
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T09:00:00Z', '2026-10-25T10:00:00Z')]);
    const apt = await book(assistant, '2026-10-25', '09:00', { status: 'confirmed' });

    await detectClashes(assistant, NOW);

    const after = await Database.getAppointmentById(apt.id);
    expect(after).toMatchObject({ status: 'confirmed', date: '2026-10-25', timeSlot: '09:00', durationMinutes: 30, name: apt.name, email: apt.email });
  });

  it('uses half-open ranges: back-to-back with a block is not a clash, one minute of overlap is', async () => {
    const { assistant, link } = await setup();
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T09:00:00Z', '2026-10-25T10:00:00Z')]);
    const before = await book(assistant, '2026-10-25', '08:30'); // ends 09:00
    const after = await book(assistant, '2026-10-25', '10:00'); // starts 10:00
    const overlap = await book(assistant, '2026-10-25', '09:45', { durationMinutes: 30 });

    const flagged = await detectClashes(assistant, NOW);

    expect(flagged.map((a) => a.id)).toEqual([overlap.id]);
    expect((await Database.getAppointmentById(before.id))?.externalClashAt).toBeUndefined();
    expect((await Database.getAppointmentById(after.id))?.externalClashAt).toBeUndefined();
  });

  it('ignores a block that is exactly the booking itself (the owner added the booking to the linked calendar)', async () => {
    const { assistant, link } = await setup();
    // 09:00-09:30 is the booking copied into the owner's calendar; 11:00-12:00 is a real meeting.
    await Database.replaceExternalBlocks(link.id, assistant.id, [
      block('2026-10-25T09:00:00Z', '2026-10-25T09:30:00Z'),
      block('2026-10-25T11:00:00Z', '2026-10-25T12:00:00Z'),
    ]);
    const own = await book(assistant, '2026-10-25', '09:00', { durationMinutes: 30 });
    const longer = await book(assistant, '2026-10-25', '09:00', { durationMinutes: 45 }); // overlaps the block but is not identical
    const real = await book(assistant, '2026-10-25', '11:30');

    const flagged = await detectClashes(assistant, NOW);

    expect(flagged.map((a) => a.id).sort()).toEqual([longer.id, real.id].sort());
    expect((await Database.getAppointmentById(own.id))?.externalClashAt).toBeUndefined();
    expect(mail.send).toHaveBeenCalledTimes(2);
  });

  it('reads booking times in the assistant timezone', async () => {
    const { assistant, link } = await setup({ timezone: 'America/New_York' });
    // 14:00-15:00 UTC is 10:00-11:00 in New York (EDT)
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T14:00:00Z', '2026-10-25T15:00:00Z')]);
    const hit = await book(assistant, '2026-10-25', '10:15');
    const miss = await book(assistant, '2026-10-25', '14:15');

    const flagged = await detectClashes(assistant, NOW);

    expect(flagged.map((a) => a.id)).toEqual([hit.id]);
    expect((await Database.getAppointmentById(miss.id))?.externalClashAt).toBeUndefined();
  });

  it('ignores past bookings, cancelled bookings and other assistants\' bookings', async () => {
    const { assistant, link } = await setup();
    const other = (await setup()).assistant;
    await Database.replaceExternalBlocks(link.id, assistant.id, [
      block('2026-10-20T09:00:00Z', '2026-10-20T10:00:00Z'),
      block('2026-10-25T09:00:00Z', '2026-10-25T10:00:00Z'),
    ]);
    const past = await book(assistant, '2026-10-20', '09:00');
    const cancelled = await book(assistant, '2026-10-25', '09:00');
    await Database.updateAppointmentStatus(cancelled.id, 'cancelled');
    const foreign = await book(other, '2026-10-25', '09:00');

    const flagged = await detectClashes(assistant, NOW);

    expect(flagged).toEqual([]);
    for (const id of [past.id, cancelled.id, foreign.id]) expect((await Database.getAppointmentById(id))?.externalClashAt).toBeUndefined();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('does nothing when there are no blocks, and reads no blocks when no booking can clash', async () => {
    const { assistant } = await setup();
    await book(assistant, '2026-10-25', '09:00');
    expect(await detectClashes(assistant, NOW)).toEqual([]);

    const empty = (await setup()).assistant;
    const spy = vi.spyOn(Database, 'getExternalBlocks');
    expect(await detectClashes(empty, NOW)).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('a booking already flagged stays flagged even when the clash has gone', async () => {
    const { assistant, link } = await setup();
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T09:00:00Z', '2026-10-25T10:00:00Z')]);
    const apt = await book(assistant, '2026-10-25', '09:00');
    await detectClashes(assistant, NOW);

    await Database.replaceExternalBlocks(link.id, assistant.id, []);
    expect(await detectClashes(assistant, new Date(NOW.getTime() + 600_000))).toEqual([]);
    expect((await Database.getAppointmentById(apt.id))?.externalClashAt).toBe(NOW.toISOString());
  });

  it('a failing updateAppointment does not stop the other bookings, and the failed one is retried next run', async () => {
    const { assistant, link } = await setup();
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T09:00:00Z', '2026-10-25T12:00:00Z')]);
    const a = await book(assistant, '2026-10-25', '09:00');
    const b = await book(assistant, '2026-10-25', '10:00');
    const c = await book(assistant, '2026-10-25', '11:00');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const real = Database.updateAppointment.bind(Database);
    const update = vi.spyOn(Database, 'updateAppointment').mockImplementation(async (id, patch) => {
      if (id === b.id) throw Object.assign(new Error('Booking unavailable'), { name: 'BookingUnavailableError', code: 'DB_UNAVAILABLE' });
      return real(id, patch);
    });

    const flagged = await detectClashes(assistant, NOW);

    expect(flagged.map((x) => x.id).sort()).toEqual([a.id, c.id].sort());
    expect((await Database.getAppointmentById(b.id))?.externalClashAt).toBeUndefined();
    // one notification each for the two it flagged, none for the one it could not
    const notes = (await Database.getNotifications(assistant.id, 50)).filter((n) => n.type === 'calendar_clash');
    expect(notes).toHaveLength(2);

    update.mockRestore();
    const retry = await detectClashes(assistant, new Date(NOW.getTime() + 600_000));
    expect(retry.map((x) => x.id)).toEqual([b.id]);
  });

  it('a notification or e-mail that fails does not undo the flag or stop the rest', async () => {
    const { assistant, link } = await setup();
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T09:00:00Z', '2026-10-25T12:00:00Z')]);
    const a = await book(assistant, '2026-10-25', '09:00');
    const b = await book(assistant, '2026-10-25', '11:00');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Database, 'addNotification').mockRejectedValue(new Error('db down'));
    mail.send.mockRejectedValue(new Error('smtp down'));

    const flagged = await detectClashes(assistant, NOW);

    expect(flagged.map((x) => x.id).sort()).toEqual([a.id, b.id].sort());
    expect((await Database.getAppointmentById(a.id))?.externalClashAt).toBeTruthy();
    expect((await Database.getAppointmentById(b.id))?.externalClashAt).toBeTruthy();
  });

  it('names the guest and time in the notification and the e-mail, with no calendar address anywhere', async () => {
    const { assistant, link } = await setup();
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T09:00:00Z', '2026-10-25T10:00:00Z')]);
    await book(assistant, '2026-10-25', '09:30', { name: 'Dana Guest' });
    const events = vi.spyOn(logger, 'logEvent');
    const warn = vi.spyOn(console, 'warn');

    await detectClashes(assistant, NOW);

    const [note] = (await Database.getNotifications(assistant.id, 50)).filter((n) => n.type === 'calendar_clash');
    expect(note.assistantId).toBe(assistant.id);
    expect(note.title + note.message).toContain('Dana Guest');
    expect(note.message).toContain('2026-10-25');
    expect(note.message).toContain('09:30');
    expect(mail.send).toHaveBeenCalledTimes(1);
    const sent = mail.send.mock.calls[0][0] as { to: string; subject: string; text: string };
    expect(sent.to).toBe('owner@example.com');
    expect(sent.text).toContain('Dana Guest');
    for (const text of [note.title, note.message, sent.subject, sent.text, JSON.stringify(events.mock.calls), JSON.stringify(warn.mock.calls)]) {
      expect(text).not.toContain('SECRETKEY');
      expect(text).not.toContain('calendar.example.com');
      expect(text).not.toMatch(/https?:\/\//);
    }
  });

  it('sends no e-mail when the assistant has no receiver address, but still flags and notifies', async () => {
    const { assistant, link } = await setup({ email: null });
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T09:00:00Z', '2026-10-25T10:00:00Z')]);
    await book(assistant, '2026-10-25', '09:00');

    const flagged = await detectClashes(assistant, NOW);

    expect(flagged).toHaveLength(1);
    expect(mail.send).not.toHaveBeenCalled();
    expect((await Database.getNotifications(assistant.id, 50)).some((n) => n.type === 'calendar_clash')).toBe(true);
  });

  it('two runs at the same moment in one process flag and announce a booking only once', async () => {
    const { assistant, link } = await setup();
    await Database.replaceExternalBlocks(link.id, assistant.id, [block('2026-10-25T09:00:00Z', '2026-10-25T10:00:00Z')]);
    await book(assistant, '2026-10-25', '09:00');

    const [x, y] = await Promise.all([detectClashes(assistant, NOW), detectClashes(assistant, NOW)]);

    expect(x).toHaveLength(1);
    expect(y).toHaveLength(1);
    expect((await Database.getNotifications(assistant.id, 50)).filter((n) => n.type === 'calendar_clash')).toHaveLength(1);
    expect(mail.send).toHaveBeenCalledTimes(1);
  });
});
