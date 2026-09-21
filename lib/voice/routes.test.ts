import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { signVoiceRequest } from './auth';

/**
 * Integration test: the real /api/voice routes, real HMAC signing and the real database layer,
 * with a simulated caller booking an appointment (no language model or network involved).
 */
const SECRET = 'test-voice-secret-'.padEnd(40, 'x');
const NUMBER = '+15550100777';
const CALLER = '+15550100123';

let createdAppointmentIds: string[] = [];

function signed(body: unknown, opts: { tamper?: boolean } = {}): Request {
  const raw = JSON.stringify(body);
  const ts = Math.floor(Date.now() / 1000);
  const sig = signVoiceRequest(SECRET, ts, opts.tamper ? raw + ' ' : raw);
  return new Request('http://localhost/api/voice/x', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-voice-timestamp': String(ts), 'x-voice-signature': sig },
    body: raw,
  });
}

async function readEvents(res: Response) {
  const text = await res.text();
  return text
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

describe('voice API routes', () => {
  let assistantId = '';
  let serviceName = '';

  beforeAll(async () => {
    process.env.VOICE_WORKER_SECRET = SECRET;
    const { Database } = await import('../db');
    const assistants = await Database.getAssistants();
    const a = assistants.find((x) => x.id === 'demo-assistant') || assistants[0];
    assistantId = a.id;
    serviceName = a.landingPageConfig?.services?.[0]?.name || '';
    await Database.updateAssistant(a.id, {
      bookingEnabled: true,
      bookingProvider: 'direct',
      bookingStartHour: '09:00',
      bookingEndHour: '17:00',
      bookingSlotDuration: 30,
      bookingAvailableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timezone: 'UTC',
      phoneEnabled: true,
      phoneNumber: NUMBER,
      phoneAfterHours: 'ai',
      phoneTransferNumber: '+15550100999',
    });
  });

  afterAll(async () => {
    const { Database } = await import('../db');
    for (const id of createdAppointmentIds) await Database.deleteAppointment(id).catch(() => undefined);
    await Database.updateAssistant(assistantId, { phoneEnabled: false, phoneNumber: '' });
  });

  it('refuses unsigned, tampered and unconfigured requests', async () => {
    const { POST } = await import('../../app/api/voice/session/route');
    const unsigned = await POST(new Request('http://localhost/x', { method: 'POST', body: '{}' }));
    expect(unsigned.status).toBe(401);
    const tampered = await POST(signed({ callId: 'c_t', from: CALLER, to: NUMBER }, { tamper: true }));
    expect(tampered.status).toBe(401);
    const saved = process.env.VOICE_WORKER_SECRET;
    delete process.env.VOICE_WORKER_SECRET;
    expect((await POST(signed({ callId: 'c_t', to: NUMBER }))).status).toBe(503);
    process.env.VOICE_WORKER_SECRET = saved;
  });

  it('rejects calls to unknown numbers', async () => {
    const { POST } = await import('../../app/api/voice/session/route');
    const res = await POST(signed({ callId: 'c_unknown', from: CALLER, to: '+15550100000' }));
    expect(await res.json()).toMatchObject({ ok: false, action: 'reject' });
  });

  it('runs a whole call: greeting, booking by voice, appointment saved, call logged', async () => {
    const { POST: session } = await import('../../app/api/voice/session/route');
    const { POST: turn } = await import('../../app/api/voice/turn/route');
    const { POST: end } = await import('../../app/api/voice/end/route');
    const { Database } = await import('../db');

    const callId = `call_int_${Date.now()}`;
    const s = await (await session(signed({ callId, from: CALLER, to: NUMBER }))).json();
    expect(s).toMatchObject({ ok: true, mode: 'ai' });
    expect(s.greeting).toMatch(/AI assistant/i);
    let state = s.state;

    const say = async (text: string) => {
      const events = await readEvents(await turn(signed({ state, text })));
      state = events.find((e) => e.type === 'state').state;
      return { said: events.filter((e) => e.type === 'say').map((e) => e.text).join(' '), action: events.find((e) => e.type === 'action')?.action };
    };

    // Answer whatever the assistant asks next, so the test does not depend on the demo data's exact services.
    let r = await say('I want to book an appointment');
    for (let i = 0; i < 8 && state.booking?.step !== 'confirm'; i++) {
      const step = state.booking?.step;
      const answer: Record<string, string> = {
        service: serviceName || 'anything',
        date: 'tomorrow',
        time: 'the first one',
        name: 'my name is Test Caller',
      };
      r = await say(answer[step] || 'yes');
    }
    expect(state.booking.step).toBe('confirm');
    expect(r.said).toContain('Shall I book that?');

    const before = (await Database.getAppointments(assistantId)).length;
    r = await say('yes');
    expect(r.said).toMatch(/all set/i);
    expect(state.outcome).toBe('booked');
    expect(state.appointmentId).toBeTruthy();
    createdAppointmentIds.push(state.appointmentId);

    const after = await Database.getAppointments(assistantId);
    expect(after.length).toBe(before + 1);
    const apt = after.find((a) => a.id === state.appointmentId)!;
    expect(apt).toMatchObject({ name: 'Test Caller', phone: CALLER, status: 'confirmed' });

    // The same slot can no longer be booked by a second caller.
    const s2 = await (await session(signed({ callId: `${callId}_b`, from: '+15550100456', to: NUMBER }))).json();
    state = s2.state;
    await say(`book ${serviceName || 'an appointment'} on ${apt.date}`);
    expect(state.booking?.slots ?? []).not.toContain(apt.timeSlot);

    const done = await end(signed({ state: s.state, durationSeconds: 42 }));
    expect((await done.json()).ok).toBe(true);
    const calls = await Database.getCalls(assistantId);
    expect(calls.find((c) => c.id === callId)).toMatchObject({ durationSeconds: 42 });
  }, 30000);

  it('transfers on request and refuses a turn for the wrong number', async () => {
    const { POST: session } = await import('../../app/api/voice/session/route');
    const { POST: turn } = await import('../../app/api/voice/turn/route');
    const s = await (await session(signed({ callId: `call_xfer_${Date.now()}`, from: CALLER, to: NUMBER }))).json();
    const events = await readEvents(await turn(signed({ state: s.state, text: 'can I talk to a real person' })));
    expect(events.find((e) => e.type === 'action')?.action).toEqual({ type: 'transfer', number: '+15550100999' });

    const bad = await turn(signed({ state: { ...s.state, to: '+15550100555' }, text: 'hello' }));
    expect(bad.status).toBe(404);
  });
});
