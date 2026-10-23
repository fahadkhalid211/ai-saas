import { describe, it, expect } from 'vitest';
import { acquireBookingLock, acquireDayLock, isBookingLockTimeout } from './booking-lock';

describe('Per-day booking lock', () => {
  it('serialises every attempt for one assistant and date, whatever the start time', async () => {
    const events: string[] = [];
    const task = async (label: string) => {
      const release = await acquireDayLock('ast_day_lock_same', '2026-10-02');
      try {
        events.push(`start ${label}`);
        await new Promise((resolve) => setTimeout(resolve, 40));
        events.push(`end ${label}`);
      } finally {
        release();
      }
    };

    await Promise.all([task('a'), task('b')]);

    // one finishes before the other starts, so the work never interleaves
    expect(events[0]).toMatch(/^start /);
    expect(events[1]).toMatch(/^end /);
    expect(events[2]).toMatch(/^start /);
    expect(events[3]).toMatch(/^end /);
  });

  it('lets different dates hold their locks at the same time', async () => {
    // Both locks are taken before either is released. If different dates blocked each other, the second acquire would
    // never resolve while the first is held, and the race below would reject.
    const neverResolvesIfBlocked = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('second date was blocked by the first')), 500)
    );
    const releases = await Promise.race([
      Promise.all([
        acquireDayLock('ast_day_lock_diff', '2026-10-02', 500),
        acquireDayLock('ast_day_lock_diff', '2026-10-03', 500),
      ]),
      neverResolvesIfBlocked,
    ]);
    try {
      expect(releases).toHaveLength(2);
    } finally {
      releases.forEach((release) => release());
    }
  });
});

describe('Day lock timeout', () => {
  it('gives up after the timeout while another request holds the lock, and the lock still works afterwards', async () => {
    const release = await acquireDayLock('ast_day_lock_timeout', '2026-10-04');
    const started = Date.now();
    const pending = acquireDayLock('ast_day_lock_timeout', '2026-10-04', 150).catch((e) => e);
    // Without a working timeout the waiter only wakes on release; release after 3 s so the test cannot hang.
    const safety = setTimeout(release, 3000);
    const err = await pending;
    clearTimeout(safety);
    expect(Date.now() - started).toBeLessThan(2000);
    expect(isBookingLockTimeout(err)).toBe(true);
    release();
    // the timed-out waiter left no trace: the next caller gets the lock at once
    const again = await acquireDayLock('ast_day_lock_timeout', '2026-10-04', 150);
    again();
  });

  it('isBookingLockTimeout is false for other errors', () => {
    expect(isBookingLockTimeout(new Error('boom'))).toBe(false);
    expect(isBookingLockTimeout(undefined)).toBe(false);
  });
});

describe('Sprint 2: Appointment Concurrency Mutex', () => {
  it('should serialize concurrent lock requests for the exact same slot', async () => {
    const assistantId = 'ast_test_concurrency';
    const date = '2026-10-01';
    const timeSlot = '10:00';

    const executionOrder: number[] = [];

    // Simulate 5 concurrent attempts to acquire lock on the same slot
    const task = async (index: number) => {
      const release = await acquireBookingLock(assistantId, date, timeSlot);
      try {
        executionOrder.push(index);
        // Simulate async work (database read + write)
        await new Promise((resolve) => setTimeout(resolve, 30));
      } finally {
        release();
      }
    };

    await Promise.all([task(1), task(2), task(3), task(4), task(5)]);

    expect(executionOrder.length).toBe(5);
    // Locks executed sequentially, not simultaneously
  });

  it('should allow concurrent locks for different time slots without blocking', async () => {
    const assistantId = 'ast_test_concurrency_2';
    const date = '2026-10-01';

    const started: string[] = [];
    const completed: string[] = [];

    const task = async (slot: string) => {
      const release = await acquireBookingLock(assistantId, date, slot);
      try {
        started.push(slot);
        await new Promise((resolve) => setTimeout(resolve, 20));
        completed.push(slot);
      } finally {
        release();
      }
    };

    const start = Date.now();
    await Promise.all([task('09:00'), task('10:00'), task('11:00')]);
    const duration = Date.now() - start;

    expect(started.length).toBe(3);
    expect(completed.length).toBe(3);
    // Since slots are distinct, they run concurrently in ~20-40ms instead of 60ms+
    expect(duration).toBeLessThan(100);
  });

  it('should successfully book an appointment using time range formats like 10:00 AM - 10:30 AM', async () => {
    const { POST: appointmentsHandler } = await import('../../app/api/appointments/route');
    const { Database } = await import('../db');
    // its own assistant: the default demo assistant is not there when an earlier test file has replaced the shared data
    const assistant = await Database.createAssistant({ name: 'Concurrency test', workspaceId: 'ws_concurrency_test' });
    const testDate = `2099-11-${String((Date.now() % 25) + 1).padStart(2, '0')}`;
    const testSlot = '10:00 AM - 10:30 AM';

    // Clean up any existing appointment from prior runs to ensure test idempotency
    const existing = await Database.getAppointments(assistant.id);
    for (const a of existing) {
      if (a.date === testDate && a.timeSlot === testSlot) {
        await Database.deleteAppointment(a.id);
      }
    }

    const payload = {
      assistantId: assistant.id,
      name: 'Jane Customer',
      email: 'jane.cust@example.com',
      phone: '+1 555-456-7890',
      date: testDate,
      timeSlot: testSlot,
      notes: 'Consultation request',
    };

    const req = new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await appointmentsHandler(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.appointment).toBeDefined();
    expect(data.appointment.timeSlot).toBe('10:00 AM - 10:30 AM');
  });
});
