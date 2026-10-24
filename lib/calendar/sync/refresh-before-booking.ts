import type { AssistantData } from '@/lib/db';
import { logEvent } from '@/lib/logging/logger';
import { refreshAssistantCalendars } from './sync-link';

/**
 * What every path that confirms a booking calls BEFORE it takes the day lock: bring the owner's linked calendars up to date
 * (at most 3 seconds, see refreshAssistantCalendars). The conflict check inside the lock then reads the blocks that were just stored.
 *
 * It can never fail a booking: refreshAssistantCalendars does not throw, and if it ever did, the error is logged here (name only,
 * no addresses, no personal data) and the booking goes ahead with the last good blocks.
 */
export async function refreshCalendarsBeforeBooking(assistant: AssistantData | null | undefined): Promise<void> {
  if (!assistant) return;
  try {
    await refreshAssistantCalendars(assistant);
  } catch (err) {
    logEvent({
      level: 'warn',
      category: 'booking',
      event: 'booking.calendar_stale',
      meta: { assistantId: assistant.id, error: err instanceof Error ? err.name : 'unknown' },
    });
  }
}
