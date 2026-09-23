import { NextResponse } from 'next/server';
import { getRedisClient, isRedisConfigured } from '@/lib/cache/redis';
import { checkRateLimit, getClientIp, type RateLimitOptions } from './rate-limit';

/**
 * Rate limiting that holds across serverless instances.
 *
 * The in-memory limiter in ./rate-limit.ts counts per process, so on Vercel an attacker who is spread
 * over many instances gets a multiple of every limit (bad for login, sign-up and the paid chat model).
 * This one counts in Upstash Redis (fixed window, one INCR round trip) and falls back to the in-memory
 * limiter if Redis is not configured or is unreachable, so a Redis outage never blocks real users.
 */
export async function checkDistributedRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const redis = isRedisConfigured() ? getRedisClient() : null;
  if (!redis) return checkRateLimit(key, options);

  try {
    const bucket = `rl:${key}`;
    const [count, ttl] = await redis.pipeline().incr(bucket).pttl(bucket).exec<[number, number]>();
    let ttlMs = ttl;
    if (ttlMs < 0) {
      // First hit in this window (or a key that lost its expiry): start the window.
      await redis.pexpire(bucket, options.windowMs);
      ttlMs = options.windowMs;
    }
    const resetTime = Date.now() + ttlMs;
    if (count > options.max) return { allowed: false, remaining: 0, resetTime };
    return { allowed: true, remaining: Math.max(0, options.max - count), resetTime };
  } catch (err) {
    console.warn('[RateLimit] Redis unavailable, using per-instance limiter:', (err as Error)?.message);
    return checkRateLimit(key, options);
  }
}

function tooMany(options: RateLimitOptions, resetTime: number): NextResponse {
  const retryAfterSec = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.', retryAfter: retryAfterSec },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Limit': String(options.max),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(resetTime),
      },
    }
  );
}

/** Per-client-IP limit, shared across instances. Returns a 429 response to send, or null when allowed. */
export async function enforceDistributedRateLimit(
  req: Request,
  prefix: string,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const limit = await checkDistributedRateLimit(`${prefix}:${getClientIp(req)}`, options);
  return limit.allowed ? null : tooMany(options, limit.resetTime);
}

/** Limit on an arbitrary key (for example a login e-mail), shared across instances. */
export async function enforceDistributedRateLimitByKey(
  key: string,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const limit = await checkDistributedRateLimit(key, options);
  return limit.allowed ? null : tooMany(options, limit.resetTime);
}
