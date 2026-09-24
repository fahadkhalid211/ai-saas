import { NextResponse } from 'next/server';
import { logEvent } from '@/lib/logging/logger';

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Automatically clean up stale keys every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    // Keep entries that have at least one timestamp within 15 minutes
    const valid = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      record.timestamps = valid;
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, max: 30 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = rateLimitMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.max) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = oldestTimestamp + options.windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: options.max - record.timestamps.length,
    resetTime: now + options.windowMs,
  };
}

/**
 * Whether this process is known to sit behind a proxy layer that itself
 * sanitizes/overwrites client-supplied forwarding headers before they reach
 * us (Vercel's edge network strips and re-sets x-forwarded-for; an operator
 * can also opt in explicitly via TRUST_PROXY_HEADERS for their own reverse
 * proxy setup). Without one of these, forwarding headers are entirely
 * attacker-controlled and must not be trusted for rate-limiting decisions.
 */
function hasTrustedProxy(): boolean {
  return (
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.VERCEL_ENV) ||
    process.env.TRUST_PROXY_HEADERS === 'true'
  );
}

export function getClientIp(req: Request): string {
  // Cloudflare's edge always overwrites this header itself, so it is safe to
  // trust whenever the request actually came through Cloudflare.
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  if (hasTrustedProxy()) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0].trim();
      if (first) return first;
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
  }

  // No trusted proxy layer identified: client-supplied forwarding headers
  // cannot be relied upon (they are trivially spoofable per-request), so
  // every direct caller is bucketed together rather than letting an attacker
  // rotate a fake header to defeat per-IP limiting entirely.
  return 'untrusted-direct-client';
}

/**
 * Standardized rate limit enforcer.
 * Returns an immediate HTTP 429 response if rate limit is exceeded, or null if allowed.
 */
export function enforceRateLimit(
  req: Request,
  prefix: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, max: 30 }
): { errorResponse: NextResponse | null; remaining: number; resetTime: number; clientIp: string } {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`${prefix}:${ip}`, options);

  if (!limit.allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((limit.resetTime - Date.now()) / 1000));
    logEvent({ level: 'warn', category: 'security', event: 'security.rate_limited', ip, meta: { limiter: prefix, max: options.max, windowMs: options.windowMs } });
    return {
      errorResponse: NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter: retryAfterSec },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(options.max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(limit.resetTime),
          },
        }
      ),
      remaining: 0,
      resetTime: limit.resetTime,
      clientIp: ip,
    };
  }

  return {
    errorResponse: null,
    remaining: limit.remaining,
    resetTime: limit.resetTime,
    clientIp: ip,
  };
}

/**
 * Like enforceRateLimit, but keys the limit purely on the caller-supplied
 * key with no IP suffix. Use this when the bucket should be shared across
 * every caller regardless of (spoofable) client identity — e.g. capping
 * total volume per-assistant/per-resource rather than per-client.
 */
export function enforceRateLimitByKey(
  key: string,
  options: RateLimitOptions
): { errorResponse: NextResponse | null; remaining: number; resetTime: number } {
  const limit = checkRateLimit(key, options);
  if (!limit.allowed) {
    const retryAfterSec = Math.max(1, Math.ceil((limit.resetTime - Date.now()) / 1000));
    return {
      errorResponse: NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfter: retryAfterSec },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(options.max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(limit.resetTime),
          },
        }
      ),
      remaining: 0,
      resetTime: limit.resetTime,
    };
  }
  return { errorResponse: null, remaining: limit.remaining, resetTime: limit.resetTime };
}

/**
 * A global (not per-key) cap layered on top of enforceRateLimit, used as a
 * backstop for expensive/abusable endpoints (e.g. LLM-backed chat) where
 * per-IP limiting alone can be defeated by rotating spoofable client
 * identifiers (IP, domain headers, etc). Bounds worst-case cost regardless of
 * how many distinct "clients" an attacker can present as.
 */
export function enforceGlobalRateLimit(
  prefix: string,
  options: RateLimitOptions
): { errorResponse: NextResponse | null } {
  const { errorResponse } = enforceRateLimitByKey(`global:${prefix}`, options);
  return { errorResponse };
}
