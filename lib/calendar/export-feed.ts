import crypto from 'node:crypto';
import { Database, type AppointmentData, type AssistantData } from '../db';
import { slotRange } from '../appointments/time-range';
import { escapeIcsText, formatIcsUtc } from './ical';

/**
 * The busy-only export feed: the link the owner pastes into other calendar tools so Crescelo's bookings show up there as "Busy".
 *
 * PRIVACY: this feed is read by third-party tools and anyone who ever sees the link, so a booking is reduced to a time range.
 * It is deliberately NOT built on generateIcsFeed (which carries guest details). The only booking field that appears is the id,
 * as an opaque UID. Imported external blocks are never re-exported (they are not in the appointment list this receives).
 */

const DAY_MS = 86_400_000;
const FOLD_LIMIT = 75;
const DEFAULT_NAME = 'Crescelo Busy';

/**
 * Folds a content line at 75 octets (RFC 5545 3.1), never inside a multi-byte character. Continuation lines start with one
 * space, which counts toward their 75.
 */
function foldLine(line: string): string {
  if (Buffer.byteLength(line, 'utf8') <= FOLD_LIMIT) return line;
  const out: string[] = [];
  let current = '';
  let size = 0;
  let limit = FOLD_LIMIT;
  for (const ch of line) {
    const n = Buffer.byteLength(ch, 'utf8');
    if (size + n > limit) {
      out.push(current);
      current = ' ';
      size = 1;
      limit = FOLD_LIMIT;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join('\r\n');
}

/** Text value for the calendar name: control characters removed, then escaped per RFC 5545 3.3.11. */
function textValue(raw: string): string {
  // line breaks become the escaped \n; every other control character is dropped
  // eslint-disable-next-line no-control-regex
  return escapeIcsText(raw.replace(/\r\n|\r/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ''));
}

/**
 * A valid RFC 5545 calendar (CRLF, folded at 75 octets) with one timed VEVENT per confirmed or pending booking.
 * Skipped: cancelled bookings, completed ones in the past, bookings whose date/time cannot be read, and anything that ended
 * more than a day before `now` (keeps the feed small). `timezone` is the business's, used to read the booking's local time.
 * `now` exists so the output is reproducible in tests.
 */
export function generateBusyFeed(
  appointments: AppointmentData[],
  calendarName: string,
  timezone?: string,
  now: Date = new Date(),
): string {
  const oldest = now.getTime() - DAY_MS;
  const stamp = formatIcsUtc(now);

  const rows: { id: string; start: Date; end: Date; tentative: boolean }[] = [];
  for (const a of appointments) {
    if (a.status !== 'confirmed' && a.status !== 'pending' && a.status !== 'completed') continue;
    const range = slotRange(a.date, a.timeSlot, a.durationMinutes, timezone);
    if (!range) continue;
    if (a.status === 'completed' && range.end.getTime() <= now.getTime()) continue;
    if (range.end.getTime() < oldest) continue;
    rows.push({ id: String(a.id), start: range.start, end: range.end, tentative: a.status === 'pending' });
  }
  rows.sort((x, y) => x.start.getTime() - y.start.getTime() || x.id.localeCompare(y.id));

  const name = textValue((calendarName || '').trim()) || DEFAULT_NAME;
  const out: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Crescelo//Busy Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${name}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
  ];
  for (const r of rows) {
    out.push(
      'BEGIN:VEVENT',
      `UID:${textUid(r.id)}@crescelo`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${formatIcsUtc(r.start)}`,
      `DTEND:${formatIcsUtc(r.end)}`,
      'SUMMARY:Busy',
      'TRANSP:OPAQUE',
      `STATUS:${r.tentative ? 'TENTATIVE' : 'CONFIRMED'}`,
      'END:VEVENT',
    );
  }
  out.push('END:VCALENDAR');
  return out.map(foldLine).join('\r\n') + '\r\n';
}

/** Booking ids are generated, but the UID is a text value in a header line, so anything outside a safe set is dropped. */
function textUid(id: string): string {
  return id.replace(/[^A-Za-z0-9._-]/g, '');
}

// --- tokens ---------------------------------------------------------------------------------------------------------

const MIN_TOKEN = 20; // Database.setBusyFeedToken / getAssistantByBusyFeedToken refuse anything shorter

function newToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

// The store has no compare-and-set, so two requests that both see "no token" would each write one and one caller would be
// handed a token that was immediately overwritten. Token changes for one assistant therefore run one after another in this
// process (the owner dashboard is the only caller and one process serves a request); the stored value is also read back
// after writing, so a write from another instance cannot leave the caller with a token that is not the stored one.
const queues = new Map<string, Promise<unknown>>();
function serialised<T>(assistantId: string, task: () => Promise<T>): Promise<T> {
  const previous = queues.get(assistantId) ?? Promise.resolve();
  const run = previous.then(task, task);
  const tail = run.catch(() => undefined);
  queues.set(assistantId, tail);
  void tail.then(() => {
    if (queues.get(assistantId) === tail) queues.delete(assistantId);
  });
  return run;
}

async function storedToken(assistantId: string): Promise<string | null> {
  const fresh = await Database.getAssistantById(assistantId);
  if (!fresh) throw new Error('Assistant not found.');
  const t = fresh.busyFeedToken;
  return typeof t === 'string' && t.length >= MIN_TOKEN ? t : null;
}

async function writeToken(assistantId: string, token: string): Promise<string> {
  const ok = await Database.setBusyFeedToken(assistantId, token);
  if (!ok) throw new Error('Assistant not found.');
  return (await storedToken(assistantId)) ?? token;
}

/**
 * The assistant's busy-feed token: the stored one, or a new one (24 random bytes, base64url) stored on first use.
 * The `assistant` argument only identifies the assistant; the stored value is always the answer, so a stale object is fine.
 */
export function ensureBusyFeedToken(assistant: Pick<AssistantData, 'id'>): Promise<string> {
  return serialised(assistant.id, async () => (await storedToken(assistant.id)) ?? (await writeToken(assistant.id, newToken())));
}

/** Replaces the token: the old link stops working at once. Returns the new token. */
export function resetBusyFeedToken(assistant: Pick<AssistantData, 'id'>): Promise<string> {
  return serialised(assistant.id, async () => {
    // make sure the assistant exists before a new secret is generated for it
    await storedToken(assistant.id);
    return writeToken(assistant.id, newToken());
  });
}
