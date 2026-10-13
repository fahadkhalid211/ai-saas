/**
 * Bounds for the lists that are kept in the shared state row. The audit log and the notifications are stored newest
 * first (new entries are added at the front), so the newest are the first entries. Cutting from the END of such a list
 * keeps the OLDEST entries: once a list held 50 entries, every later save wrote the same old 50 back, and the newest
 * security events disappeared on the next cold start.
 */

/** The `limit` newest entries of a list stored newest first. */
export function newestFirst<T>(list: unknown, limit: number): T[] {
  return Array.isArray(list) ? (list.slice(0, limit) as T[]) : [];
}

/** The `limit` newest entries of a list stored oldest first (entries are appended). */
export function newestLast<T>(list: unknown, limit: number): T[] {
  return Array.isArray(list) ? (list.slice(-limit) as T[]) : [];
}
