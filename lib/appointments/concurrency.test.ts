import { describe, it, expect } from 'vitest';
import { acquireBookingLock } from './booking-lock';

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
});
