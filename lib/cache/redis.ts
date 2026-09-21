import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;
let redisInitAttempted = false;

/**
 * Get or initialize the singleton Upstash Redis client.
 * Returns null if credentials are not configured in environment.
 */
export function getRedisClient(): Redis | null {
  if (redisInitAttempted) {
    return redisInstance;
  }

  redisInitAttempted = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    redisInstance = new Redis({
      url,
      token,
    });
    return redisInstance;
  } catch (err) {
    console.warn('[Upstash Redis] Failed to initialize Redis client:', err);
    redisInstance = null;
    return null;
  }
}

/**
 * Check whether Upstash Redis credentials are configured.
 */
export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Common cache key definitions for Crescelo
 */
export const CACHE_KEYS = {
  STATE: 'kortex:state:v1',
  RAG_PREFIX: 'kortex:rag:',
  ANALYTICS_PREFIX: 'kortex:analytics:',
} as const;

/**
 * Safely retrieve a cached value from Redis.
 * Fails open (returns null) on connection errors or missing keys.
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get<T>(key);
    return data ?? null;
  } catch (err: any) {
    console.warn(`[Upstash Redis] Error fetching key "${key}":`, err?.message || err);
    return null;
  }
}

/**
 * Safely set a value in Redis with an optional TTL in seconds.
 * Fails open (returns false) on errors without interrupting caller.
 */
export async function redisSet(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, value, { ex: ttlSeconds });
    } else {
      await client.set(key, value);
    }
    return true;
  } catch (err: any) {
    console.warn(`[Upstash Redis] Error setting key "${key}":`, err?.message || err);
    return false;
  }
}

/**
 * Safely delete one or more keys from Redis.
 */
export async function redisDel(key: string | string[]): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    if (Array.isArray(key)) {
      if (key.length === 0) return true;
      await client.del(...key);
    } else {
      await client.del(key);
    }
    return true;
  } catch (err: any) {
    console.warn(`[Upstash Redis] Error deleting key "${key}":`, err?.message || err);
    return false;
  }
}

/**
 * Ping Redis to verify connectivity and credentials.
 */
export async function redisPing(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const res = await client.ping();
    return res === 'PONG';
  } catch (err: any) {
    console.warn('[Upstash Redis] Ping check failed:', err?.message || err);
    return false;
  }
}

/**
 * Reset singleton client for testing purposes.
 */
export function _resetRedisClientForTesting(): void {
  redisInstance = null;
  redisInitAttempted = false;
}
