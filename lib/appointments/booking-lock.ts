import { getRedisClient } from '@/lib/cache/redis';

/**
 * Concurrency lock for appointment slot bookings.
 * Ensures that concurrent requests attempting to book the exact same (assistantId, date, timeSlot) tuple execute one at a
 * time rather than racing to check availability at the same millisecond.
 *
 * Two layers: an in-process mutex (cheap, covers requests on the same server instance) and, when Redis is configured, a
 * shared lock (SET NX with an expiry) that covers requests landing on different serverless instances. Without the shared
 * lock two visitors could each pass the availability check on different instances and both get the slot.
 */

const activeLocks = new Set<string>();
const lockWaiters = new Map<string, Array<() => void>>();

function buildLockKey(assistantId: string, date: string, timeSlot: string): string {
  return `${assistantId.trim().toLowerCase()}:${date.trim()}:${timeSlot.trim()}`;
}

const REDIS_LOCK_TTL_MS = 15_000;
const RELEASE_IF_OWNER = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";

/** Takes the shared lock, waiting for it briefly; returns a release function, or null when Redis is unavailable. */
async function acquireSharedLock(key: string, timeoutMs: number): Promise<(() => Promise<void>) | null> {
  const redis = getRedisClient();
  if (!redis) return null;
  const redisKey = `booking-lock:${key}`;
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const started = Date.now();
  try {
    for (;;) {
      const ok = await redis.set(redisKey, token, { nx: true, px: REDIS_LOCK_TTL_MS });
      if (ok) {
        return async () => {
          try {
            await redis.eval(RELEASE_IF_OWNER, [redisKey], [token]);
          } catch {
            // the lock expires by itself
          }
        };
      }
      if (Date.now() - started > timeoutMs) throw new Error(`Booking lock timeout after ${timeoutMs}ms for slot ${key}`);
      await new Promise((r) => setTimeout(r, 120 + Math.random() * 120));
    }
  } catch (err) {
    if ((err as Error)?.message?.startsWith('Booking lock timeout')) throw err;
    return null; // Redis is unreachable: the in-process lock still applies
  }
}

export async function acquireBookingLock(
  assistantId: string,
  date: string,
  timeSlot: string,
  timeoutMs: number = 10000
): Promise<() => void> {
  const key = buildLockKey(assistantId, date, timeSlot);

  const startTime = Date.now();
  const timeoutError = () => new Error(`Booking lock timeout after ${timeoutMs}ms for slot: ${timeSlot} on ${date}`);
  while (activeLocks.has(key)) {
    const remaining = timeoutMs - (Date.now() - startTime);
    if (remaining <= 0) throw timeoutError();

    // Wait for the holder to release, but no longer than the time left: a waiter that is never woken must still give up.
    const woken = await new Promise<boolean>((resolve) => {
      let waiters = lockWaiters.get(key);
      if (!waiters) {
        waiters = [];
        lockWaiters.set(key, waiters);
      }
      const timer = setTimeout(() => {
        const list = lockWaiters.get(key);
        const at = list ? list.indexOf(wake) : -1;
        if (list && at >= 0) {
          list.splice(at, 1);
          if (list.length === 0) lockWaiters.delete(key);
        }
        resolve(false);
      }, remaining);
      const wake = () => {
        clearTimeout(timer);
        resolve(true);
      };
      waiters.push(wake);
    });
    if (!woken) throw timeoutError();
  }

  activeLocks.add(key);

  let releaseShared: (() => Promise<void>) | null = null;
  try {
    releaseShared = await acquireSharedLock(key, Math.max(1000, timeoutMs - (Date.now() - startTime)));
  } catch (err) {
    activeLocks.delete(key);
    throw err;
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    void releaseShared?.();
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

/**
 * True for the error acquireBookingLock / acquireDayLock throw when the lock could not be taken in time (another request
 * held it). Callers answer HTTP 503 with a short Retry-After: nothing was written and an immediate retry usually works.
 */
export function isBookingLockTimeout(err: unknown): boolean {
  const message = (err as { message?: unknown } | null | undefined)?.message;
  return typeof message === 'string' && message.startsWith('Booking lock timeout');
}

/**
 * Serialises every booking attempt for one assistant and date, whatever the start time. Bookings with different start
 * times can overlap each other, so the per-slot lock alone is not enough: the conflict check and the insert for a given
 * day must run one at a time.
 */
export function acquireDayLock(assistantId: string, date: string, timeoutMs?: number): Promise<() => void> {
  return acquireBookingLock(assistantId, date, 'day', timeoutMs);
}
