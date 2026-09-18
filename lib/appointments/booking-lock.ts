/**
 * In-memory concurrency mutex for appointment slot bookings.
 * Ensures that concurrent requests attempting to book the exact same
 * (assistantId, date, timeSlot) tuple execute sequentially rather than
 * racing to evaluate availability at the exact same millisecond.
 */

const activeLocks = new Set<string>();
const lockWaiters = new Map<string, Array<() => void>>();

function buildLockKey(assistantId: string, date: string, timeSlot: string): string {
  return `${assistantId.trim().toLowerCase()}:${date.trim()}:${timeSlot.trim()}`;
}

export async function acquireBookingLock(
  assistantId: string,
  date: string,
  timeSlot: string,
  timeoutMs: number = 10000
): Promise<() => void> {
  const key = buildLockKey(assistantId, date, timeSlot);

  const startTime = Date.now();
  while (activeLocks.has(key)) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Booking lock timeout after ${timeoutMs}ms for slot: ${timeSlot} on ${date}`);
    }

    await new Promise<void>((resolve) => {
      let waiters = lockWaiters.get(key);
      if (!waiters) {
        waiters = [];
        lockWaiters.set(key, waiters);
      }
      waiters.push(resolve);
    });
  }

  activeLocks.add(key);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeLocks.delete(key);

    const waiters = lockWaiters.get(key);
    if (waiters && waiters.length > 0) {
      const nextWaiter = waiters.shift();
      if (waiters.length === 0) {
        lockWaiters.delete(key);
      }
      if (nextWaiter) {
        nextWaiter();
      }
    } else {
      lockWaiters.delete(key);
    }
  };
}
