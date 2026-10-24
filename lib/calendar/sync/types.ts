/** A busy period on an external calendar, as absolute UTC instants. Half-open: [startAt, endAt). */
export interface ExternalBlock {
  startAt: Date;
  endAt: Date;
}

/** A calendar feed (an iCal link from Google, Apple, Outlook or another service) that an owner linked to one assistant. */
export interface CalendarLink {
  id: string;
  assistantId: string;
  label: 'google' | 'apple' | 'outlook' | 'other';
  url: string;
  /** ISO time of the last successful read of the feed. */
  lastSyncedAt?: string;
  /** Plain-language reason the last read failed; cleared by the next success. Never contains the feed URL. */
  lastError?: string;
  /** ISO time the current run of failures started. */
  errorSince?: string;
  /** Validators from the last successful fetch, sent back so an unchanged feed answers 304. */
  etag?: string;
  lastModified?: string;
  /** Busy blocks stored after the last successful read (shown to the owner). */
  blockCount?: number;
  /** Events in the last read whose repeats could not be followed, so they may not block every date (shown to the owner). */
  unsupportedCount?: number;
  /** The `errorSince` value the 24-hour "calendar not syncing" notice was already sent for, so it is sent once per run of failures. */
  failureNotifiedFor?: string;
  createdAt: string;
}
