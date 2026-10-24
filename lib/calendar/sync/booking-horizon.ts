import { Database } from '@/lib/db';
import { logEvent } from '@/lib/logging/logger';
import { isBeyondCalendarWindow } from './window';

export { TOO_FAR_AHEAD_MESSAGE } from './window';

/**
 * The one check every path that confirms a booking runs (new booking, client reschedule, admin un-cancel, MCP create_booking; the voice
 * channel books through createAppointment): true when the assistant has at least one linked calendar and `date` is beyond the window
 * those calendars are read for, so the booking could not be checked against them. Assistants without links are never limited.
 * Never throws: when the links cannot be read it answers false, and the booking's own block read still refuses if storage is down.
 */
export async function tooFarAheadForLinkedCalendars(assistantId: string, date: string, now: Date = new Date()): Promise<boolean> {
  if (!isBeyondCalendarWindow(date, now)) return false; // the common case costs no read
  try {
    return (await Database.getCalendarLinks(assistantId)).length > 0;
  } catch (err) {
    logEvent({ level: 'warn', category: 'booking', event: 'calendar.horizon_check_failed', meta: { assistantId, error: err instanceof Error ? err.name : 'unknown' } });
    return false;
  }
}
