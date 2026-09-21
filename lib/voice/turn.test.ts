import { describe, it, expect } from 'vitest';
import type { AssistantData } from '@/lib/db';
import { buildGreeting, newCallState, runVoiceTurn, type BookResult, type VoiceCallState, type VoiceDeps, type VoiceEvent } from './turn';

const NOW = new Date('2026-09-21T08:00:00Z'); // Monday

function assistant(over: Partial<AssistantData> = {}): AssistantData {
  return {
    id: 'ast1',
    workspaceId: 'ws',
    name: 'Sam',
    provider: 'groq',
    modelName: 'x',
    systemPrompt: 'Be kind.',
    fallbackMessage: "I don't have that information.",
    bookingEnabled: true,
    bookingProvider: 'direct',
    bookingStartHour: '09:00',
    bookingEndHour: '17:00',
    bookingSlotDuration: 30,
    bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timezone: 'UTC',
    phoneTransferNumber: '+14155559999',
    landingPageConfig: { businessName: 'Sample Barbers', services: [{ id: 'cut', name: 'Haircut', description: '', durationMinutes: 30, price: 35 }] },
    ...over,
  } as unknown as AssistantData;
}

interface Log {
  messages: { role: string; content: string }[];
  callbacks: any[];
  notifications: any[];
  escalated: string[];
  booked: any[];
}

function makeDeps(opts: { llm?: string[] | (() => AsyncIterable<string>); book?: BookResult; appointments?: any[] } = {}): { deps: VoiceDeps; log: Log } {
  const log: Log = { messages: [], callbacks: [], notifications: [], escalated: [], booked: [] };
  const deps: VoiceDeps = {
    now: () => NOW,
    getAppointments: async () => opts.appointments || [],
    bookAppointment: async ({ booking }) => {
      log.booked.push(booking);
      return opts.book || { ok: true, appointmentId: 'apt_1', hasEmail: false };
    },
    saveMessage: async (_c, role, content) => void log.messages.push({ role, content }),
    saveCallback: async (a) => void log.callbacks.push(a),
    notify: async (a) => void log.notifications.push(a),
    markEscalated: async (c) => void log.escalated.push(c),
    retrieve: async () => ({ contextText: 'We are open Monday to Friday.' }),
    streamLLM: () => {
      if (typeof opts.llm === 'function') return opts.llm();
      const chunks = opts.llm || ['We open at nine. ', 'We close at five.'];
      return (async function* () {
        for (const c of chunks) yield c;
      })();
    },
  };
  return { deps, log };
}

const freshState = (over: Partial<VoiceCallState> = {}): VoiceCallState =>
  ({ ...newCallState({ callId: 'c1', assistantId: 'ast1', from: '+14155550123', to: '+14155550000', conversationId: 'conv1' }), ...over });

async function turn(a: AssistantData, state: VoiceCallState, text: string, deps: VoiceDeps) {
  const events: VoiceEvent[] = [];
  for await (const e of runVoiceTurn({ assistant: a, state, text, deps })) events.push(e);
  const next = (events.find((e) => e.type === 'state') as any).state as VoiceCallState;
  const said = events.filter((e) => e.type === 'say').map((e: any) => e.text);
  const action = (events.find((e) => e.type === 'action') as any)?.action;
  return { events, next, said, action };
}

describe('greeting', () => {
  it('always discloses the AI assistant', () => {
    expect(buildGreeting(assistant())).toContain('AI assistant');
    expect(buildGreeting(assistant({ phoneGreeting: 'Welcome to Sample Barbers.' }))).toContain('AI assistant');
    expect(buildGreeting(assistant({ phoneGreeting: 'Hi, this is our automated assistant.' }))).toBe('Hi, this is our automated assistant.');
  });
});

describe('question answering', () => {
  it('streams sentence by sentence and records the exchange', async () => {
    const { deps, log } = makeDeps();
    const r = await turn(assistant(), freshState(), 'when do you open', deps);
    expect(r.said).toEqual(['We open at nine.', 'We close at five.']);
    expect(r.next.history.map((h) => h.role)).toEqual(['user', 'assistant']);
    expect(log.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(r.next.outcome).toBe('answered');
  });

  it('cleans markdown out of what is spoken', async () => {
    const { deps } = makeDeps({ llm: ['**Sure!** Visit https://x.com/menu. ', '- Haircut is $35.'] });
    const r = await turn(assistant(), freshState(), 'prices?', deps);
    expect(r.said.join(' ')).not.toMatch(/\*|https|- /);
  });

  it('never speaks provider error text and escalates after repeated failures', async () => {
    const bad = () => (async function* () { yield '*(AI Generation Error: 400 bad request)*'; })();
    const { deps } = makeDeps({ llm: bad });
    const first = await turn(assistant(), freshState(), 'hello there', deps);
    expect(first.said.join(' ')).not.toContain('Generation Error');
    expect(first.next.llmFailures).toBe(1);
    const second = await turn(assistant(), first.next, 'hello again', deps);
    expect(second.action).toEqual({ type: 'transfer', number: '+14155559999' });
  });

  it('survives a model that throws', async () => {
    const boom = () => (async function* () { throw new Error('network'); yield ''; })();
    const { deps } = makeDeps({ llm: boom });
    const r = await turn(assistant(), freshState(), 'hello there', deps);
    expect(r.said[0]).toContain('trouble');
  });
});

describe('controls', () => {
  it('handles an empty utterance', async () => {
    const { deps } = makeDeps();
    const r = await turn(assistant(), freshState(), '   ', deps);
    expect(r.said[0]).toContain("didn't catch");
  });

  it('transfers on request and flags the conversation', async () => {
    const { deps, log } = makeDeps();
    const r = await turn(assistant(), freshState(), 'can I talk to a real person', deps);
    expect(r.action).toEqual({ type: 'transfer', number: '+14155559999' });
    expect(log.escalated).toEqual(['conv1']);
    expect(r.next.outcome).toBe('transferred');
  });

  it('takes a message when there is nobody to transfer to', async () => {
    const { deps, log } = makeDeps();
    const r = await turn(assistant({ phoneTransferNumber: undefined }), freshState(), 'let me speak to the manager', deps);
    expect(r.action).toBeUndefined();
    expect(log.callbacks).toHaveLength(1);
    expect(log.callbacks[0].phone).toBe('+14155550123');
    expect(r.next.outcome).toBe('callback');
  });

  it('says goodbye and hangs up', async () => {
    const { deps } = makeDeps();
    const r = await turn(assistant(), freshState(), "no that's all, bye", deps);
    expect(r.action).toEqual({ type: 'hangup' });
  });

  it('points to emergency services and transfers', async () => {
    const { deps } = makeDeps();
    const r = await turn(assistant(), freshState(), 'this is an emergency he is not breathing', deps);
    expect(r.said[0]).toContain('emergency number');
    expect(r.action?.type).toBe('transfer');
  });

  it('stops very long calls', async () => {
    const { deps } = makeDeps();
    const r = await turn(assistant(), freshState({ turns: 80 }), 'hello', deps);
    expect(r.action).toEqual({ type: 'hangup' });
  });
});

describe('booking by phone', () => {
  it('runs the whole flow and saves only after a spoken yes', async () => {
    const a = assistant();
    const { deps, log } = makeDeps();
    let r = await turn(a, freshState(), 'hi I want to book a haircut tomorrow', deps);
    expect(r.next.booking?.step).toBe('time');
    expect(log.booked).toHaveLength(0);
    r = await turn(a, r.next, 'the first one', deps);
    r = await turn(a, r.next, 'my name is Sam Rivera', deps);
    expect(r.next.booking?.step).toBe('confirm');
    expect(log.booked).toHaveLength(0); // still nothing saved
    r = await turn(a, r.next, 'yes', deps);
    expect(log.booked).toHaveLength(1);
    expect(log.booked[0]).toMatchObject({ serviceId: 'cut', date: '2026-09-22', name: 'Sam Rivera', phone: '+14155550123' });
    expect(r.said.join(' ')).toContain("You're all set");
    expect(r.next.outcome).toBe('booked');
    expect(r.next.appointmentId).toBe('apt_1');
    expect(r.next.booking).toBeNull();
  });

  it('recovers when the slot is taken at the last moment', async () => {
    const a = assistant();
    const { deps } = makeDeps({ book: { ok: false, conflict: true } });
    let r = await turn(a, freshState(), 'book a haircut tomorrow', deps);
    r = await turn(a, r.next, 'the first one', deps);
    r = await turn(a, r.next, 'Sam', deps);
    r = await turn(a, r.next, 'yes', deps);
    expect(r.said.join(' ')).toContain('just taken');
    expect(r.next.booking?.step).toBe('time');
    expect(r.next.outcome).not.toBe('booked');
  });

  it('falls back to a call-back when saving fails', async () => {
    const a = assistant();
    const { deps, log } = makeDeps({ book: { ok: false, conflict: false } });
    let r = await turn(a, freshState(), 'book a haircut tomorrow', deps);
    r = await turn(a, r.next, 'the first one', deps);
    r = await turn(a, r.next, 'Sam', deps);
    r = await turn(a, r.next, 'yes', deps);
    expect(log.callbacks).toHaveLength(1);
    expect(r.next.outcome).toBe('callback');
  });

  it('offers a call-back when phone booking is not enabled', async () => {
    const { deps, log } = makeDeps();
    const r = await turn(assistant({ bookingEnabled: false }), freshState(), 'I want to book an appointment', deps);
    expect(log.callbacks).toHaveLength(1);
    expect(r.next.booking).toBeNull();
  });

  it('can be interrupted for a person mid-booking', async () => {
    const a = assistant();
    const { deps } = makeDeps();
    let r = await turn(a, freshState(), 'book a haircut', deps);
    r = await turn(a, r.next, 'actually can I speak to someone', deps);
    expect(r.action?.type).toBe('transfer');
    expect(r.next.booking).toBeNull();
  });
});
