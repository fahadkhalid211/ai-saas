import {
  getAvailableSlots,
  nextOpenDates,
  nowInTimezone,
  speakTime,
  weekdayOf,
  type AvailabilityConfig,
  type ExistingAppointment,
} from '@/lib/appointments/availability';
import type { ExternalBlock } from '@/lib/calendar/sync/types';
import { TOO_FAR_AHEAD_MESSAGE } from '@/lib/calendar/sync/window';
import { filterByDayPart, parseDayPart, parseSpokenDate, parseYesNo, pickSlot } from '@/lib/voice/datetime';
import { normalizeE164, parseSpokenDigits } from '@/lib/voice/text';

/**
 * Deterministic booking dialogue for phone calls: service -> day -> time -> name -> (number) -> confirm.
 * A pure state machine with no database or model calls, so it is fully testable. The language model
 * never books anything: only a spoken "yes" to the read-back produces a `book` action, and the server
 * re-checks the slot before saving.
 */

export type BookingStep = 'service' | 'date' | 'time' | 'name' | 'phone' | 'confirm' | 'change';

export interface BookingState {
  active: boolean;
  step: BookingStep;
  serviceId?: string;
  serviceName?: string;
  durationMinutes?: number;
  price?: number;
  date?: string;
  /** All open start times for `date`. */
  slots?: string[];
  /** The times most recently read to the caller. */
  offered?: string[];
  offerPage?: number;
  timeSlot?: string;
  name?: string;
  phone?: string;
  attempts: number;
}

export interface BookingService {
  id: string;
  name: string;
  durationMinutes?: number;
  price?: number;
}

export interface BookingContext {
  services: BookingService[];
  config: AvailabilityConfig;
  appointments: ExistingAppointment[];
  /** Busy periods from linked external calendars; slots overlapping one are never offered. */
  blocks?: ExternalBlock[];
  now?: Date;
  /** E.164 caller ID, if the network provided one. */
  callerPhone?: string;
  /** Name from an earlier lead with this number. */
  knownName?: string;
  defaultCountryCode?: string;
}

export interface BookingRequest {
  serviceId?: string;
  serviceName?: string;
  durationMinutes: number;
  price?: number;
  date: string;
  timeSlot: string;
  name: string;
  phone: string;
}

export type BookingAction =
  | { type: 'book'; booking: BookingRequest }
  | { type: 'transfer' }
  | { type: 'callback'; name?: string; phone?: string; note: string }
  | { type: 'cancelled' };

export interface BookingTurn {
  state: BookingState;
  say: string;
  action?: BookingAction;
}

const MAX_ATTEMPTS = 3;
const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'to', 'my', 'me', 'i', 'want', 'like', 'need', 'please', 'book', 'appointment']);

export function initialBookingState(): BookingState {
  return { active: true, step: 'service', attempts: 0 };
}

export function speakDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  return `${weekdayOf(iso)}, ${month} ${d}`;
}

function listSpoken(times: string[]): string {
  const spoken = times.map(speakTime);
  if (spoken.length <= 1) return spoken.join('');
  return `${spoken.slice(0, -1).join(', ')} and ${spoken[spoken.length - 1]}`;
}

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t))
    .map((t) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t));
}

/** Finds the one service the caller named. Returns null when nothing or more than one matches equally. */
export function matchService(utterance: string, services: BookingService[]): BookingService | null {
  const said = new Set(tokens(utterance));
  let best: BookingService | null = null;
  let bestScore = 0;
  let tie = false;
  for (const s of services) {
    const t = tokens(s.name);
    const score = t.filter((w) => said.has(w)).length / Math.max(1, t.length);
    if (score > bestScore) {
      best = s;
      bestScore = score;
      tie = false;
    } else if (score === bestScore && score > 0) {
      tie = true;
    }
  }
  return best && bestScore >= 0.5 && !tie ? best : null;
}

export function extractName(utterance: string): string | null {
  let t = utterance.trim().replace(/[.,!?]/g, ' ');
  t = t.replace(/^(?:yes|yeah|sure|ok|okay|well|um|uh|hi|hello)\b[,\s]*/i, '');
  t = t.replace(/^(?:my name is|my name's|the name is|it'?s|it is|this is|i am|i'm|call me|name is|under)\s+/i, '');
  const words = t.split(/\s+/).filter((w) => /^[\p{L}'-]{2,}$/u.test(w));
  if (!words.length || words.length > 4) return null;
  if (/\b(book|appointment|haircut|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|what|when|how|why)\b/i.test(t)) return null;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function pickSpread(slots: string[], page: number): string[] {
  if (slots.length <= 3) return slots;
  const start = page * 3;
  if (start >= slots.length) return [];
  if (page === 0) return [slots[0], slots[Math.floor(slots.length / 2)], slots[slots.length - 1]];
  return slots.slice(start, start + 3);
}

function withAttempts(state: BookingState, failed: boolean): BookingState {
  return { ...state, attempts: failed ? state.attempts + 1 : 0 };
}

function giveUp(state: BookingState, ctx: BookingContext): BookingTurn {
  const phone = state.phone || ctx.callerPhone;
  return {
    state: { ...state, active: false },
    say: "I'm sorry, I'm having trouble getting that. I'll pass your details to the team and they will call you back.",
    action: { type: 'callback', name: state.name || ctx.knownName, phone, note: 'Caller could not complete the phone booking flow.' },
  };
}

/** Says what is needed next, given what is already known. */
function ask(state: BookingState, ctx: BookingContext): BookingTurn {
  // service
  if (!state.serviceId && !state.serviceName) {
    if (ctx.services.length === 1) {
      const s = ctx.services[0];
      return ask({ ...state, serviceId: s.id, serviceName: s.name, durationMinutes: s.durationMinutes, price: s.price }, ctx);
    }
    if (ctx.services.length > 1) {
      const names = ctx.services.slice(0, 4).map((s) => s.name);
      return { state: { ...state, step: 'service' }, say: `Sure. Which service would you like? We offer ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}.` };
    }
  }
  // day
  if (!state.date) {
    return { state: { ...state, step: 'date' }, say: 'What day works best for you?' };
  }
  // time
  if (!state.timeSlot) {
    if (!state.slots?.length) return offerDate(state, ctx);
    const offered = state.offered?.length ? state.offered : pickSpread(state.slots, state.offerPage || 0);
    return {
      state: { ...state, step: 'time', offered },
      say: `On ${speakDate(state.date)} I have ${listSpoken(offered)}. Which would you like?`,
    };
  }
  // name
  if (!state.name) {
    if (ctx.knownName) return ask({ ...state, name: ctx.knownName }, ctx);
    return { state: { ...state, step: 'name' }, say: 'May I have your name, please?' };
  }
  // number
  if (!state.phone) {
    if (ctx.callerPhone) return ask({ ...state, phone: ctx.callerPhone }, ctx);
    return { state: { ...state, step: 'phone' }, say: 'What is the best phone number to reach you on?' };
  }
  // confirm
  const service = state.serviceName ? `a ${state.serviceName}` : 'an appointment';
  return {
    state: { ...state, step: 'confirm' },
    say: `Let me confirm: ${service} on ${speakDate(state.date)} at ${speakTime(state.timeSlot)} for ${state.name}. Shall I book that?`,
  };
}

/** Loads open slots for the chosen date, or explains and offers the nearest open days. */
function offerDate(state: BookingState, ctx: BookingContext): BookingTurn {
  const duration = state.durationMinutes || ctx.config.bookingSlotDuration || 30;
  const slots = getAvailableSlots({ config: ctx.config, date: state.date!, durationMinutes: duration, appointments: ctx.appointments, blocks: ctx.blocks, now: ctx.now });
  if (!slots.length) {
    const next = nextOpenDates({ config: ctx.config, durationMinutes: duration, appointments: ctx.appointments, blocks: ctx.blocks, now: ctx.now, count: 3, from: state.date });
    const cleared = { ...state, date: undefined, slots: undefined, offered: undefined, offerPage: 0 };
    if (!next.length) return giveUp(cleared, ctx);
    const days = next.map((d) => speakDate(d.date));
    return {
      state: { ...cleared, step: 'date' },
      say: `Sorry, we have no openings on ${speakDate(state.date!)}. The next available days are ${days.slice(0, -1).join(', ')}${days.length > 1 ? ' and ' : ''}${days[days.length - 1]}. Which would you like?`,
    };
  }
  return ask({ ...state, slots, offered: undefined, offerPage: 0 }, ctx);
}

/** Starts a booking. `utterance` is what the caller said when asking, so details they already gave are not asked again. */
export function startBooking(ctx: BookingContext, utterance = ''): BookingTurn {
  let state = initialBookingState();
  const svc = ctx.services.length ? matchService(utterance, ctx.services) : null;
  if (svc) state = { ...state, serviceId: svc.id, serviceName: svc.name, durationMinutes: svc.durationMinutes, price: svc.price };
  const today = nowInTimezone(ctx.config.timezone, ctx.now).date;
  const date = parseSpokenDate(utterance, today);
  if (date) state = { ...state, date };
  const first = date ? offerDate(state, ctx) : ask(state, ctx);
  return first;
}

const CANCEL_RE = /\b(never ?mind|forget it|cancel (?:it|that|this)|stop|no thanks|i changed my mind)\b/i;
const HUMAN_RE = /\b(human|person|someone|somebody|manager|operator|real person|talk to (?:a|the) (?:team|staff))\b/i;

/** Advances the booking with what the caller just said. */
export function stepBooking(state: BookingState, utterance: string, ctx: BookingContext): BookingTurn {
  if (!state.active) return { state, say: '' };
  if (HUMAN_RE.test(utterance)) return { state: { ...state, active: false }, say: 'Of course, let me connect you with the team.', action: { type: 'transfer' } };
  if (CANCEL_RE.test(utterance) && state.step !== 'confirm') {
    return { state: { ...state, active: false }, say: 'No problem, I have not booked anything. Is there anything else I can help with?', action: { type: 'cancelled' } };
  }

  const today = nowInTimezone(ctx.config.timezone, ctx.now).date;

  switch (state.step) {
    case 'service': {
      const svc = matchService(utterance, ctx.services);
      if (!svc) {
        const next = withAttempts(state, true);
        return next.attempts >= MAX_ATTEMPTS ? giveUp(next, ctx) : { ...ask(next, ctx), say: `Sorry, which service was that? ${ask(next, ctx).say.replace(/^Sure\.\s*/, '')}` };
      }
      return ask(withAttempts({ ...state, serviceId: svc.id, serviceName: svc.name, durationMinutes: svc.durationMinutes, price: svc.price, slots: undefined, offered: undefined }, false), ctx);
    }

    case 'date': {
      const date = parseSpokenDate(utterance, today);
      if (!date) {
        const next = withAttempts(state, true);
        return next.attempts >= MAX_ATTEMPTS ? giveUp(next, ctx) : { state: next, say: 'Sorry, I did not catch the day. You can say something like tomorrow, or next Tuesday.' };
      }
      return offerDate(withAttempts({ ...state, date, timeSlot: undefined, slots: undefined, offered: undefined }, false), ctx);
    }

    case 'time': {
      // The caller may change their mind about the day here.
      const newDate = parseSpokenDate(utterance, today);
      if (newDate && newDate !== state.date && !pickSlot(utterance, state.offered || [])) {
        return offerDate(withAttempts({ ...state, date: newDate, timeSlot: undefined, slots: undefined, offered: undefined }, false), ctx);
      }
      const slots = state.slots || [];
      if (/\b(later|other|another|more|anything else|different)\b/i.test(utterance) && !parseDayPart(utterance)) {
        const page = (state.offerPage || 0) + 1;
        const more = pickSpread(slots, page);
        if (!more.length) return { state, say: `Those are all I have on ${speakDate(state.date!)}. Would you like a different day?` };
        return { state: { ...state, offerPage: page, offered: more }, say: `I also have ${listSpoken(more)}. Which would you like?` };
      }
      const part = parseDayPart(utterance);
      if (part && !pickSlot(utterance, slots)) {
        const filtered = filterByDayPart(slots, part);
        if (!filtered.length) return { state, say: `I have nothing in the ${part}. The times I have are ${listSpoken(pickSpread(slots, 0))}. Which would you like?` };
        const offered = pickSpread(filtered, 0);
        return { state: { ...state, offered, offerPage: 0 }, say: `In the ${part} I have ${listSpoken(offered)}. Which would you like?` };
      }
      const chosen = pickSlot(utterance, state.offered || []) || pickSlot(utterance, slots);
      if (!chosen) {
        const next = withAttempts(state, true);
        return next.attempts >= MAX_ATTEMPTS ? giveUp(next, ctx) : { state: next, say: `Sorry, which time? I have ${listSpoken(state.offered?.length ? state.offered : pickSpread(slots, 0))}.` };
      }
      return ask(withAttempts({ ...state, timeSlot: chosen }, false), ctx);
    }

    case 'name': {
      const name = extractName(utterance);
      if (!name) {
        const next = withAttempts(state, true);
        return next.attempts >= MAX_ATTEMPTS ? giveUp(next, ctx) : { state: next, say: 'Sorry, could you tell me your name again?' };
      }
      return ask(withAttempts({ ...state, name }, false), ctx);
    }

    case 'phone': {
      const digits = parseSpokenDigits(utterance);
      const hasPlus = /^\s*\+|\bplus\b/i.test(utterance);
      const phone = normalizeE164(digits.length >= 7 ? `${hasPlus ? '+' : ''}${digits}` : '', ctx.defaultCountryCode);
      if (!phone) {
        const next = withAttempts(state, true);
        return next.attempts >= MAX_ATTEMPTS ? giveUp(next, ctx) : { state: next, say: 'Sorry, I did not get a full number. Please say it digit by digit, including the area code.' };
      }
      return ask(withAttempts({ ...state, phone }, false), ctx);
    }

    case 'confirm': {
      const yn = parseYesNo(utterance);
      if (yn === 'yes') {
        return {
          state: { ...state, active: true },
          say: 'One moment while I book that.',
          action: {
            type: 'book',
            booking: {
              serviceId: state.serviceId,
              serviceName: state.serviceName,
              durationMinutes: state.durationMinutes || ctx.config.bookingSlotDuration || 30,
              price: state.price,
              date: state.date!,
              timeSlot: state.timeSlot!,
              name: state.name!,
              phone: state.phone!,
            },
          },
        };
      }
      if (yn === 'no') return { state: { ...state, step: 'change', attempts: 0 }, say: 'No problem. What would you like to change: the day, the time, or the service?' };
      const next = withAttempts(state, true);
      return next.attempts >= MAX_ATTEMPTS ? giveUp(next, ctx) : { state: next, say: 'Sorry, should I go ahead and book that? Please say yes or no.' };
    }

    case 'change': {
      const t = utterance.toLowerCase();
      if (/\bservice\b/.test(t) && ctx.services.length > 1) return ask({ ...state, serviceId: undefined, serviceName: undefined, timeSlot: undefined, slots: undefined, offered: undefined }, ctx);
      if (/\b(day|date)\b/.test(t)) return ask({ ...state, date: undefined, timeSlot: undefined, slots: undefined, offered: undefined }, ctx);
      if (/\b(time|hour)\b/.test(t)) return ask({ ...state, timeSlot: undefined, offered: undefined, offerPage: 0 }, ctx);
      if (/\bname\b/.test(t)) return ask({ ...state, name: undefined }, { ...ctx, knownName: undefined });
      // They may simply say a new day or time.
      const newDate = parseSpokenDate(utterance, today);
      if (newDate) return offerDate({ ...state, date: newDate, timeSlot: undefined, slots: undefined, offered: undefined }, ctx);
      const picked = pickSlot(utterance, state.slots || []);
      if (picked) return ask({ ...state, timeSlot: picked }, ctx);
      const next = withAttempts(state, true);
      return next.attempts >= MAX_ATTEMPTS ? giveUp(next, ctx) : { state: next, say: 'Sorry, is it the day, the time, or the service you would like to change?' };
    }
  }
}

/** Call after the server saved the appointment. */
export function bookingSucceeded(state: BookingState, hasEmail: boolean): BookingTurn {
  const when = `${speakDate(state.date!)} at ${speakTime(state.timeSlot!)}`;
  return {
    state: { ...state, active: false },
    say: `You're all set. I've booked ${state.serviceName ? `your ${state.serviceName}` : 'your appointment'} for ${when}.${hasEmail ? ' A confirmation is on its way.' : ''} Is there anything else I can help with?`,
  };
}

/** Call when the slot was taken between the read-back and saving. Refreshes the offer. */
export function bookingSlotTaken(state: BookingState, ctx: BookingContext): BookingTurn {
  const cleared = { ...state, timeSlot: undefined, slots: undefined, offered: undefined, offerPage: 0, step: 'time' as BookingStep, attempts: 0, active: true };
  const turn = offerDate(cleared, ctx);
  return { ...turn, say: `Sorry, that time was just taken. ${turn.say.replace(/^Sure\.\s*/, '')}` };
}

/** Call when the chosen date is beyond how far ahead the linked calendars are read: the caller is asked for another day. */
export function bookingDateTooFar(state: BookingState): BookingTurn {
  const cleared = { ...state, date: undefined, timeSlot: undefined, slots: undefined, offered: undefined, offerPage: 0, step: 'date' as BookingStep, attempts: 0, active: true };
  return { state: cleared, say: `${TOO_FAR_AHEAD_MESSAGE} What day works best for you?` };
}

/** Call when saving failed for a reason other than a taken slot. */
export function bookingFailed(state: BookingState, ctx: BookingContext): BookingTurn {
  return giveUp({ ...state, active: false }, ctx);
}
