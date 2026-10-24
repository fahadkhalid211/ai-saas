import type { CalendarLink } from './sync/types';

/**
 * What the calendar settings screen may know about a linked calendar. Shared by the settings route (which builds it) and the panel
 * (which shows it), so it imports nothing from the server. The calendar address is a secret (the private part of a Google, Apple or
 * Outlook link lets anyone read the calendar): the view carries a masked form only.
 */

export interface CalendarLinkView {
  id: string;
  label: CalendarLink['label'];
  /** Origin and, when it is plainly a word, the first path segment: `https://calendar.google.com/calendar/…` */
  maskedUrl: string;
  lastSyncedAt: string | null;
  lastError: string | null;
  blockCount: number;
  /** Events in the last read whose repeats could not be followed. */
  unsupportedCount: number;
  createdAt: string;
}

const PLAIN_SEGMENT = /^[A-Za-z][A-Za-z_-]{0,19}$/;

/**
 * `https://host[:port]/first/…`, or `https://host[:port]/…` when the first path segment could itself be the secret (anything that is not a
 * short word made of letters: tokens carry digits, dots or are long). Never a query string, fragment, credentials or the rest of the path.
 */
export function maskCalendarUrl(raw: string): string {
  try {
    const url = new URL(String(raw ?? '').trim().replace(/^webcal:\/\//i, 'https://'));
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'Calendar link';
    const first = url.pathname.split('/').filter(Boolean)[0];
    const segment = first && PLAIN_SEGMENT.test(first) ? `${first}/` : '';
    return `${url.protocol}//${url.host}/${segment}…`;
  } catch {
    return 'Calendar link';
  }
}

export type RelativeTime =
  | { kind: 'never' }
  | { kind: 'just_now' }
  | { kind: 'minutes'; n: number }
  | { kind: 'hours'; n: number }
  | { kind: 'days'; n: number }
  | { kind: 'date' };

/** How long ago a time was, in the buckets the panel words ("5 minutes ago"); older than 30 days it asks for a date. */
export function relativeTime(iso: string | null | undefined, now: number = Date.now()): RelativeTime {
  const t = Date.parse(iso ?? '');
  if (!Number.isFinite(t)) return { kind: 'never' };
  const ms = now - t;
  if (ms < 60_000) return { kind: 'just_now' }; // also a time a little ahead of this server's clock
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return { kind: 'minutes', n: minutes };
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 24) return { kind: 'hours', n: hours };
  const days = Math.floor(ms / 86_400_000);
  if (days <= 30) return { kind: 'days', n: days };
  return { kind: 'date' };
}

/** The label choices of the add form, with the line naming where the owner finds the private link in that service. */
export const CALENDAR_LABEL_OPTIONS: ReadonlyArray<{ value: CalendarLink['label']; name: string; help: string }> = [
  {
    value: 'google',
    name: 'Google Calendar',
    help: 'In Google Calendar open Settings, choose the calendar, and copy the "Secret address in iCal format".',
  },
  {
    value: 'apple',
    name: 'Apple or iCloud',
    help: 'In Apple Calendar share the calendar, turn on "Public Calendar", and copy the link.',
  },
  {
    value: 'outlook',
    name: 'Outlook',
    help: 'In Outlook open Settings, Calendar, Shared calendars, then "Publish a calendar" and copy the ICS link.',
  },
  {
    value: 'other',
    name: 'Other',
    help: 'Any calendar link that ends in .ics or starts with webcal:// works.',
  },
];

/** Replaces every address in a text, so an error shown to the owner can never carry a calendar link or its token. */
function withoutAddresses(text: string, link: CalendarLink): string {
  let out = text;
  for (const secret of new Set([link.url, link.url.trim().replace(/^webcal:\/\//i, 'https://')])) {
    if (secret) out = out.split(secret).join('[calendar link]');
  }
  return out.replace(/(?:https?|webcals?):\/\/\S+/gi, '[link]').slice(0, 300);
}

/** The settings view of a stored link: the listed fields only, the address masked. */
export function toLinkView(link: CalendarLink): CalendarLinkView {
  return {
    id: link.id,
    label: link.label,
    maskedUrl: maskCalendarUrl(link.url),
    lastSyncedAt: link.lastSyncedAt ?? null,
    lastError: link.lastError ? withoutAddresses(link.lastError, link) : null,
    blockCount: link.blockCount ?? 0,
    unsupportedCount: link.unsupportedCount ?? 0,
    createdAt: link.createdAt,
  };
}
