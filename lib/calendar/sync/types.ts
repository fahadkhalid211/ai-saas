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
  createdAt: string;
}
