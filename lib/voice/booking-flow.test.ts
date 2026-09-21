import { describe, it, expect } from 'vitest';
import {
  bookingSlotTaken,
  bookingSucceeded,
  extractName,
  matchService,
  startBooking,
  stepBooking,
  type BookingContext,
  type BookingTurn,
} from './booking-flow';

const NOW = new Date('2026-09-21T08:00:00Z'); // Monday
const services = [
  { id: 'cut', name: 'Haircut', durationMinutes: 30, price: 35 },
  { id: 'beard', name: 'Beard Trim', durationMinutes: 20, price: 15 },
];
const ctx: BookingContext = {
  services,
  config: { bookingStartHour: '09:00', bookingEndHour: '17:00', bookingSlotDuration: 30, bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], timezone: 'UTC' },
  appointments: [],
  now: NOW,
  callerPhone: '+14155550123',
};

function say(turn: BookingTurn, text: string) {
  return stepBooking(turn.state, text, ctx);
}

describe('helpers', () => {
  it('matches a service by name words', () => {
    expect(matchService('I would like a haircut', services)?.id).toBe('cut');
    expect(matchService('just a beard trim', services)?.id).toBe('beard');
    expect(matchService('something else', services)).toBeNull();
  });
  it('extracts names', () => {
    expect(extractName("my name is sam rivera")).toBe('Sam Rivera');
    expect(extractName("it's Priya")).toBe('Priya');
    expect(extractName('tomorrow at ten')).toBeNull();
  });
});

describe('phone booking flow', () => {
  it('books end to end and asks for each missing detail once', () => {
    let t = startBooking(ctx, 'hi I want to book an appointment');
    expect(t.state.step).toBe('service');
    t = say(t, 'a haircut please');
    expect(t.state.serviceId).toBe('cut');
    expect(t.state.step).toBe('date');
    t = say(t, 'tomorrow');
    expect(t.state.date).toBe('2026-09-22');
    expect(t.state.step).toBe('time');
    expect(t.state.offered?.length).toBe(3);
    expect(t.say).toContain('Tuesday, September 22');
    t = say(t, 'the second one');
    expect(t.state.timeSlot).toBeDefined();
    expect(t.state.step).toBe('name');
    t = say(t, 'my name is Sam');
    expect(t.state.name).toBe('Sam');
    // caller ID is known, so it goes straight to confirmation
    expect(t.state.step).toBe('confirm');
    expect(t.say).toContain('Shall I book that?');
    t = say(t, 'yes please');
    expect(t.action?.type).toBe('book');
    if (t.action?.type === 'book') {
      expect(t.action.booking).toMatchObject({ serviceId: 'cut', date: '2026-09-22', name: 'Sam', phone: '+14155550123', durationMinutes: 30 });
    }
    const done = bookingSucceeded(t.state, false);
    expect(done.say).toContain("You're all set");
    expect(done.state.active).toBe(false);
  });

  it('uses details already given in the opening sentence', () => {
    const t = startBooking(ctx, 'can I get a beard trim tomorrow');
    expect(t.state.serviceId).toBe('beard');
    expect(t.state.date).toBe('2026-09-22');
    expect(t.state.step).toBe('time');
  });

  it('skips the service question with a single service or none', () => {
    const single = startBooking({ ...ctx, services: [services[0]] }, 'book me in');
    expect(single.state.serviceId).toBe('cut');
    expect(single.state.step).toBe('date');
    const none = startBooking({ ...ctx, services: [] }, 'book me in');
    expect(none.state.step).toBe('date');
  });

  it('asks for a number when there is no caller ID', () => {
    const c = { ...ctx, callerPhone: undefined };
    let t = startBooking(c, 'haircut tomorrow');
    t = stepBooking(t.state, 'ten', c);
    t = stepBooking(t.state, 'Sam', c);
    expect(t.state.step).toBe('phone');
    t = stepBooking(t.state, 'plus one four one five five five five zero one two three', c);
    expect(t.state.phone).toBe('+14155550123');
    expect(t.state.step).toBe('confirm');
  });

  it('offers the next open days when the requested day is closed', () => {
    let t = startBooking(ctx, 'haircut');
    t = say(t, 'this saturday'); // 2026-09-26 is a Saturday
    expect(t.state.step).toBe('date');
    expect(t.say).toContain('no openings on Saturday, September 26');
    expect(t.say).toContain('Monday, September 28');
  });

  it('filters by time of day and pages through more times', () => {
    let t = startBooking(ctx, 'haircut tomorrow');
    t = say(t, 'afternoon');
    expect(t.state.offered?.every((s) => s >= '12:00')).toBe(true);
    t = say(t, 'anything later');
    expect(t.state.step).toBe('time');
  });

  it('lets the caller change the day while choosing a time', () => {
    let t = startBooking(ctx, 'haircut tomorrow');
    t = say(t, 'actually thursday');
    expect(t.state.date).toBe('2026-09-24');
    expect(t.state.step).toBe('time');
  });

  it('handles a refusal at confirmation and a change of time', () => {
    let t = startBooking(ctx, 'haircut tomorrow');
    t = say(t, 'the first one');
    t = say(t, 'Sam');
    expect(t.state.step).toBe('confirm');
    t = say(t, 'no');
    expect(t.state.step).toBe('change');
    t = say(t, 'the time');
    expect(t.state.step).toBe('time');
    expect(t.state.timeSlot).toBeUndefined();
  });

  it('never books without a spoken yes', () => {
    let t = startBooking(ctx, 'haircut tomorrow');
    t = say(t, 'the first one');
    t = say(t, 'Sam');
    t = say(t, 'hmm what about the price');
    expect(t.action).toBeUndefined();
    expect(t.state.step).toBe('confirm');
  });

  it('gives up after repeated misunderstanding and offers a callback', () => {
    let t = startBooking(ctx, 'haircut');
    t = say(t, 'blah');
    t = say(t, 'blah');
    t = say(t, 'blah');
    expect(t.action?.type).toBe('callback');
    expect(t.state.active).toBe(false);
  });

  it('transfers to a person and supports cancelling', () => {
    const t = startBooking(ctx, 'haircut');
    expect(say(t, 'can I talk to a real person').action?.type).toBe('transfer');
    expect(say(t, 'never mind').action?.type).toBe('cancelled');
  });

  it('recovers when the slot is taken between read-back and saving', () => {
    let t = startBooking(ctx, 'haircut tomorrow');
    t = say(t, 'the first one');
    const taken = t.state.timeSlot!;
    const withBooking: BookingContext = { ...ctx, appointments: [{ date: '2026-09-22', timeSlot: taken, durationMinutes: 30, status: 'confirmed' }] };
    const again = bookingSlotTaken(t.state, withBooking);
    expect(again.say).toContain('just taken');
    expect(again.state.offered).not.toContain(taken);
    expect(again.state.step).toBe('time');
  });
});
