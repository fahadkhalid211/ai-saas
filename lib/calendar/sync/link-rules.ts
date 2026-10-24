import type { CalendarLink } from './types';

/** Most links one assistant may have, and most blocks kept per link. */
export const MAX_CALENDAR_LINKS_PER_ASSISTANT = 5;
export const MAX_BLOCKS_PER_LINK = 20_000;

/** The calendar kinds a link may be labelled with. */
export const CALENDAR_LABELS: ReadonlySet<string> = new Set(['google', 'apple', 'outlook', 'other']);
const MAX_URL_LENGTH = 2048;
const MAX_ERROR_LENGTH = 500;

/**
 * A refusal by the link rules (limit reached, another assistant's id, a value that cannot be stored): the caller's mistake,
 * not a database failure. Messages never contain the feed URL or any other value of the link.
 */
export class CalendarLinkRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalendarLinkRuleError';
  }
}

const isIsoTime = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && Number.isFinite(Date.parse(v));

/** Optional sync-status fields; null clears a field. */
export interface CalendarLinkStatusFields {
  lastSyncedAt?: string | null;
  lastError?: string | null;
  errorSince?: string | null;
  etag?: string | null;
  lastModified?: string | null;
  blockCount?: number | null;
  unsupportedCount?: number | null;
  failureNotifiedFor?: string | null;
  fullSyncedAt?: string | null;
  parsedTimezone?: string | null;
  lastAttemptAt?: string | null;
}

/** Checks the status fields of an update and returns them in storable form (error text capped). Throws CalendarLinkRuleError. */
export function checkStatusFields(fields: CalendarLinkStatusFields): CalendarLinkStatusFields {
  const out: CalendarLinkStatusFields = {};
  for (const key of ['lastSyncedAt', 'errorSince', 'failureNotifiedFor', 'fullSyncedAt', 'lastAttemptAt'] as const) {
    const v = fields[key];
    if (v === undefined) continue;
    if (v !== null && !isIsoTime(v)) throw new CalendarLinkRuleError(`${key} must be a date and time.`);
    out[key] = v;
  }
  for (const key of ['lastError', 'etag', 'lastModified', 'parsedTimezone'] as const) {
    const v = fields[key];
    if (v === undefined) continue;
    if (v !== null && typeof v !== 'string') throw new CalendarLinkRuleError(`${key} must be text.`);
    out[key] = v === null ? null : key === 'lastError' ? v.slice(0, MAX_ERROR_LENGTH) : v.slice(0, 1000);
  }
  for (const key of ['blockCount', 'unsupportedCount'] as const) {
    const v = fields[key];
    if (v === undefined) continue;
    if (v !== null && !(typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 2_000_000_000)) {
      throw new CalendarLinkRuleError(`${key} must be a whole number.`);
    }
    out[key] = v;
  }
  return out;
}

/**
 * Checks a link before it is stored, so a value the database would reject (and whose rejection would echo the secret URL in
 * its error detail) never reaches it. Throws CalendarLinkRuleError. The messages name the field only.
 */
export function checkCalendarLink(link: CalendarLink): void {
  if (!link || typeof link !== 'object') throw new CalendarLinkRuleError('The calendar link is missing.');
  if (typeof link.id !== 'string' || !link.id) throw new CalendarLinkRuleError('The calendar link needs an id.');
  if (typeof link.assistantId !== 'string' || !link.assistantId) throw new CalendarLinkRuleError('The calendar link needs an assistant.');
  if (!CALENDAR_LABELS.has(link.label as string)) throw new CalendarLinkRuleError('The calendar label must be google, apple, outlook or other.');
  if (typeof link.url !== 'string' || !link.url || link.url.length > MAX_URL_LENGTH) {
    throw new CalendarLinkRuleError('The calendar link needs an address of up to 2048 characters.');
  }
  let protocol = '';
  try {
    protocol = new URL(link.url).protocol;
  } catch {
    throw new CalendarLinkRuleError('The calendar address is not a valid web address.');
  }
  // The read is https only (webcal:// is turned into https:// before a link is stored), so nothing else may be stored.
  if (protocol !== 'https:') throw new CalendarLinkRuleError('The calendar address must start with https://.');
  if (!isIsoTime(link.createdAt)) throw new CalendarLinkRuleError('The calendar link needs a creation time.');
  checkStatusFields({
    lastSyncedAt: link.lastSyncedAt,
    lastError: link.lastError,
    errorSince: link.errorSince,
    etag: link.etag,
    lastModified: link.lastModified,
    blockCount: link.blockCount,
    unsupportedCount: link.unsupportedCount,
    failureNotifiedFor: link.failureNotifiedFor,
    fullSyncedAt: link.fullSyncedAt,
    parsedTimezone: link.parsedTimezone,
    lastAttemptAt: link.lastAttemptAt,
  });
}
