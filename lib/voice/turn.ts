import type { AssistantData } from '@/lib/db';
import type { ExistingAppointment } from '@/lib/appointments/availability';
import type { ExternalBlock } from '@/lib/calendar/sync/types';
import {
  bookingDateTooFar,
  bookingFailed,
  bookingSlotTaken,
  bookingSucceeded,
  startBooking,
  stepBooking,
  type BookingAction,
  type BookingContext,
  type BookingRequest,
  type BookingState,
  type BookingTurn,
} from '@/lib/voice/booking-flow';
import { buildVoiceSystemPrompt } from '@/lib/voice/prompt';
import { cleanForSpeech, looksLikeEmergency, takeSentences } from '@/lib/voice/text';

/**
 * One conversational turn on a phone call. The worker sends the caller's transcribed words plus the call
 * state; this returns what to say (as sentences, so speech can start early), an optional action (transfer
 * or hang up) and the new state. Every side effect goes through `VoiceDeps`, so the logic is testable
 * without a database or a model.
 */

export interface VoiceCallState {
  callId: string;
  assistantId: string;
  from: string;
  to: string;
  conversationId: string;
  startedAt: string;
  booking: BookingState | null;
  history: { role: 'user' | 'assistant'; content: string }[];
  turns: number;
  llmFailures: number;
  knownName?: string;
  outcome?: 'answered' | 'booked' | 'transferred' | 'callback' | 'abandoned' | 'failed';
  appointmentId?: string;
}

export type VoiceEvent =
  | { type: 'say'; text: string }
  | { type: 'action'; action: { type: 'transfer'; number: string } | { type: 'hangup' } }
  | { type: 'state'; state: VoiceCallState };

export type BookResult =
  | { ok: true; appointmentId: string; hasEmail: boolean }
  | { ok: false; conflict: boolean; /** The date is beyond how far ahead the linked calendars are read. */ tooFarAhead?: boolean };

export interface VoiceDeps {
  getAppointments(assistantId: string): Promise<ExistingAppointment[]>;
  /** Busy periods from linked external calendars, so the times offered skip them. Optional: none when absent. */
  getExternalBlocks?(assistantId: string): Promise<ExternalBlock[]>;
  bookAppointment(args: { assistant: AssistantData; booking: BookingRequest; state: VoiceCallState }): Promise<BookResult>;
  saveMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<void>;
  saveCallback(args: { assistant: AssistantData; name?: string; phone: string; note: string; conversationId: string }): Promise<void>;
  notify(args: { assistant: AssistantData; title: string; message: string; type: string }): Promise<void>;
  markEscalated(conversationId: string): Promise<void>;
  retrieve(assistantId: string, query: string, history: { role: string; content: string }[]): Promise<{ contextText: string }>;
  streamLLM(messages: { role: 'system' | 'user' | 'assistant'; content: string }[], assistant: AssistantData): AsyncIterable<string>;
  now?: () => Date;
}

const MAX_TURNS = 80;
const HISTORY_KEEP = 8;

const BOOKING_RE = /\b(book|booking|appointment|schedule|reserve|reservation|slot|availability|available|come in|see (?:someone|the|a)|make an? (?:appointment|booking))\b/i;
const HUMAN_RE = /\b(human|real person|person|someone|somebody|manager|operator|representative|speak to (?:a|the) (?:team|staff|owner)|talk to (?:a|the) (?:team|staff|owner))\b/i;
const GOODBYE_RE = /^(?:\W*)(?:no,? )?(?:that'?s all|that is all|nothing else|no thanks?|no thank you|goodbye|bye|bye bye|that'?s it|i'?m good|i am good|all done|hang up)\b/i;

export function newCallState(init: { callId: string; assistantId: string; from: string; to: string; conversationId: string; startedAt?: string; knownName?: string }): VoiceCallState {
  return {
    callId: init.callId,
    assistantId: init.assistantId,
    from: init.from,
    to: init.to,
    conversationId: init.conversationId,
    startedAt: init.startedAt || new Date().toISOString(),
    booking: null,
    history: [],
    turns: 0,
    llmFailures: 0,
    knownName: init.knownName,
  };
}

/** Greeting that always tells the caller they are speaking with an AI assistant. */
export function buildGreeting(assistant: AssistantData): string {
  const business = assistant.landingPageConfig?.businessName || assistant.name;
  const custom = (assistant.phoneGreeting || '').trim();
  if (custom) return /\bAI\b|assistant|automated/i.test(custom) ? custom : `${custom} You are speaking with an AI assistant.`;
  return `Hello, thanks for calling ${business}. You're speaking with an AI assistant. How can I help you today?`;
}

function bookingContext(assistant: AssistantData, state: VoiceCallState, appointments: ExistingAppointment[], now?: Date, blocks?: ExternalBlock[]): BookingContext {
  const lc = assistant.landingPageConfig;
  return {
    services: (lc?.services || []).map((s) => ({ id: s.id, name: s.name, durationMinutes: s.durationMinutes, price: s.price })),
    config: {
      bookingStartHour: assistant.bookingStartHour,
      bookingEndHour: assistant.bookingEndHour,
      bookingAvailableDays: assistant.bookingAvailableDays,
      bookingSlotDuration: assistant.bookingSlotDuration,
      timezone: assistant.timezone,
    },
    appointments,
    blocks,
    now,
    callerPhone: state.from || undefined,
    knownName: state.knownName,
  };
}

function bookingSupported(assistant: AssistantData): boolean {
  return !!assistant.bookingEnabled && (assistant.bookingProvider || 'direct') === 'direct';
}

export async function* runVoiceTurn(input: { assistant: AssistantData; state: VoiceCallState; text: string; deps: VoiceDeps }): AsyncGenerator<VoiceEvent> {
  const { assistant, deps } = input;
  const state: VoiceCallState = { ...input.state, history: [...input.state.history] };
  const now = deps.now?.();
  const said: string[] = [];
  const text = (input.text || '').replace(/\s+/g, ' ').trim().slice(0, 1000);

  // Only narrows the times offered; the booking itself re-checks blocks before saving, so a failed read offers without them.
  const loadBlocks = async (): Promise<ExternalBlock[]> => (deps.getExternalBlocks ? deps.getExternalBlocks(assistant.id).catch(() => []) : []);

  const say = (t: string): VoiceEvent => {
    said.push(t);
    return { type: 'say', text: t };
  };

  if (!text) {
    yield say("Sorry, I didn't catch that. Could you say it again?");
    yield { type: 'state', state };
    return;
  }

  state.turns += 1;
  state.history.push({ role: 'user', content: text });
  await deps.saveMessage(state.conversationId, 'user', text);

  const finish = async function* (): AsyncGenerator<VoiceEvent> {
    if (said.length) {
      const reply = said.join(' ');
      state.history.push({ role: 'assistant', content: reply });
      await deps.saveMessage(state.conversationId, 'assistant', reply);
    }
    state.history = state.history.slice(-HISTORY_KEEP);
    yield { type: 'state', state };
  };

  const transfer = async function* (reason: string): AsyncGenerator<VoiceEvent> {
    state.booking = null;
    await deps.markEscalated(state.conversationId).catch(() => undefined);
    if (assistant.phoneTransferNumber) {
      state.outcome = 'transferred';
      await deps.notify({ assistant, title: 'Call transferred', message: `A caller (${state.from}) was transferred to a person. ${reason}`, type: 'takeover_requested' }).catch(() => undefined);
      yield say('One moment while I connect you with the team.');
      yield { type: 'action', action: { type: 'transfer', number: assistant.phoneTransferNumber } };
    } else {
      // Nobody to ring: take a message so the caller is not left hanging.
      yield* callback({ note: `Caller asked for a person. ${reason}`, name: state.knownName });
    }
  };

  const callback = async function* (opts: { note: string; name?: string }): AsyncGenerator<VoiceEvent> {
    state.booking = null;
    await deps.saveCallback({ assistant, name: opts.name || state.knownName, phone: state.from, note: opts.note, conversationId: state.conversationId }).catch(() => undefined);
    await deps.notify({ assistant, title: 'Call-back requested', message: `Caller ${state.from} needs a call back. ${opts.note}`, type: 'lead_captured' }).catch(() => undefined);
    state.outcome = 'callback';
    yield say(`I've noted your number and passed your details to the team. They'll call you back. Is there anything else I can help with?`);
  };

  const applyBookingTurn = async function* (turn: BookingTurn): AsyncGenerator<VoiceEvent> {
    state.booking = turn.state.active ? turn.state : null;
    if (turn.say) yield say(turn.say);
    const action: BookingAction | undefined = turn.action;
    if (!action) return;
    if (action.type === 'transfer') {
      yield* transfer('They asked for a person during booking.');
    } else if (action.type === 'callback') {
      yield* callback({ note: action.note, name: action.name });
    } else if (action.type === 'cancelled') {
      state.booking = null;
    } else if (action.type === 'book') {
      const appointments = await deps.getAppointments(assistant.id);
      const result = await deps.bookAppointment({ assistant, booking: action.booking, state });
      if (result.ok) {
        state.outcome = 'booked';
        state.appointmentId = result.appointmentId;
        const after = bookingSucceeded(turn.state, result.hasEmail);
        state.booking = null;
        yield say(after.say);
      } else if (result.tooFarAhead) {
        const again = bookingDateTooFar(turn.state);
        state.booking = again.state;
        yield say(again.say);
      } else if (result.conflict) {
        const fresh = await deps.getAppointments(assistant.id);
        const again = bookingSlotTaken(turn.state, bookingContext(assistant, state, fresh.length ? fresh : appointments, now, await loadBlocks()));
        state.booking = again.state.active ? again.state : null;
        yield say(again.say);
        if (again.action?.type === 'callback') yield* callback({ note: again.action.note, name: again.action.name });
      } else {
        const failed = bookingFailed(turn.state, bookingContext(assistant, state, appointments, now));
        state.booking = null;
        if (failed.action?.type === 'callback') yield* callback({ note: `Booking could not be saved: ${action.booking.date} ${action.booking.timeSlot}. ${failed.action.note}`, name: action.booking.name });
      }
    }
  };

  // Safety and control first.
  if (state.turns > MAX_TURNS) {
    yield say('Thanks for calling. Goodbye.');
    yield { type: 'action', action: { type: 'hangup' } };
    yield* finish();
    return;
  }

  if (looksLikeEmergency(text)) {
    yield say('If this is an emergency, please hang up and call your local emergency number right now.');
    if (assistant.phoneTransferNumber) {
      yield* transfer('Caller may have an emergency.');
    } else {
      yield { type: 'action', action: { type: 'hangup' } };
    }
    yield* finish();
    return;
  }

  // Continue an in-progress booking.
  if (state.booking?.active) {
    const appointments = await deps.getAppointments(assistant.id);
    yield* applyBookingTurn(stepBooking(state.booking, text, bookingContext(assistant, state, appointments, now, await loadBlocks())));
    yield* finish();
    return;
  }

  if (GOODBYE_RE.test(text) && !BOOKING_RE.test(text)) {
    yield say('Thanks for calling. Goodbye!');
    yield { type: 'action', action: { type: 'hangup' } };
    state.outcome = state.outcome || 'answered';
    yield* finish();
    return;
  }

  if (HUMAN_RE.test(text) && !BOOKING_RE.test(text)) {
    yield* transfer('They asked to speak with a person.');
    yield* finish();
    return;
  }

  if (BOOKING_RE.test(text)) {
    if (!bookingSupported(assistant)) {
      yield say("I can't book appointments over the phone here, but I can take your details and have the team call you back.");
      yield* callback({ note: 'Caller wanted to book; phone booking is not enabled.' });
    } else {
      const appointments = await deps.getAppointments(assistant.id);
      yield* applyBookingTurn(startBooking(bookingContext(assistant, state, appointments, now, await loadBlocks()), text));
    }
    yield* finish();
    return;
  }

  // Everything else: answer from the knowledge base.
  yield* answer();
  yield* finish();

  async function* answer(): AsyncGenerator<VoiceEvent> {
    const lc = assistant.landingPageConfig;
    const business = lc?.businessName || assistant.name;
    let contextText = '';
    try {
      contextText = (await deps.retrieve(assistant.id, text, state.history)).contextText;
    } catch {
      contextText = '';
    }
    const hours = lc?.workingHours?.map((w) => `${w.days} ${w.hours}`).join('; ');
    const services = lc?.services?.slice(0, 12).map((s) => `${s.name}${s.price ? ` ($${s.price})` : ''}`).join(', ');
    const system = buildVoiceSystemPrompt({
      assistantName: assistant.name,
      businessName: business,
      businessPrompt: assistant.systemPrompt,
      contextText,
      fallbackMessage: assistant.fallbackMessage,
      hoursLine: hours,
      servicesLine: services,
      language: assistant.phoneLanguage,
    });
    const messages = [
      { role: 'system' as const, content: system },
      ...state.history.slice(-7, -1).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user' as const, content: text },
    ];

    let total = '';
    let buffer = '';
    let failed = false;
    let spoke = false;
    try {
      for await (const token of deps.streamLLM(messages, assistant)) {
        total += token;
        buffer += token;
        if (/AI Generation Error/i.test(total)) {
          failed = true;
          break;
        }
        const { sentences, rest } = takeSentences(buffer);
        buffer = rest;
        for (const s of sentences) {
          const cleaned = cleanForSpeech(s);
          if (cleaned) {
            spoke = true;
            yield say(cleaned);
          }
        }
      }
    } catch {
      failed = true;
    }
    if (!failed && buffer.trim()) {
      const cleaned = cleanForSpeech(buffer);
      if (cleaned) {
        spoke = true;
        yield say(cleaned);
      }
    }
    if (failed || !spoke) {
      state.llmFailures += 1;
      if (state.llmFailures >= 2) {
        yield say("I'm sorry, I'm having trouble on my end.");
        yield* transfer('The assistant had repeated technical trouble.');
      } else {
        yield say("Sorry, I'm having a little trouble right now. Could you say that again?");
      }
    } else {
      state.llmFailures = 0;
      state.outcome = state.outcome || 'answered';
    }
  }
}
