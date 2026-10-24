import { Database, type AppointmentData, type AssistantData } from '@/lib/db';
import { sendOperationalEmail } from '@/lib/email';
import { slotRange } from '@/lib/appointments/time-range';
import { logEvent } from '@/lib/logging/logger';

/**
 * Finds upcoming bookings that overlap a busy block from the owner's linked calendars, marks each one (`externalClashAt`) and tells the
 * owner once. It never cancels, moves or edits the booking: the guest was promised that time, so what to do about the clash is the owner's call.
 *
 * - Only the assistant's own bookings that have not started and are not cancelled, and only ones not already marked.
 * - Overlap is half-open, like the booking check: a booking that ends when a block starts is not a clash.
 * - A block with exactly the booking's own start and end is not a clash: it is the booking itself, copied into the owner's linked calendar
 *   ("Add to Google Calendar" on the booking, or the busy / guest-detail feed merged into a linked calendar). The trade-off: an unrelated
 *   event with exactly the same start and end is not reported either.
 * - A booking that was marked and whose clash has since gone stays marked (nothing clears it automatically).
 * - A failure on one booking (database unavailable, notification, e-mail) never stops the others. If the mark itself could not be stored
 *   no notice is sent, so the next run finds the booking again and tries once more instead of announcing it twice.
 * - Nothing here puts a calendar address in a notification, an e-mail or a log.
 */

// Two runs for one assistant at the same moment in one process (the cron job plus a manual call) would both see the booking unmarked.
const inFlight = new Map<string, Promise<AppointmentData[]>>();

export function detectClashes(assistant: AssistantData, now: Date = new Date()): Promise<AppointmentData[]> {
  const running = inFlight.get(assistant.id);
  if (running) return running;
  const run = findAndFlag(assistant, now).finally(() => {
    if (inFlight.get(assistant.id) === run) inFlight.delete(assistant.id);
  });
  inFlight.set(assistant.id, run);
  return run;
}

async function findAndFlag(assistant: AssistantData, now: Date): Promise<AppointmentData[]> {
  const appointments = await Database.getAppointments(assistant.id, undefined, { ownOnly: true });
  const candidates: Array<{ apt: AppointmentData; start: Date; end: Date }> = [];
  for (const apt of appointments) {
    if (apt.status === 'cancelled' || apt.externalClashAt) continue;
    const range = slotRange(apt.date, apt.timeSlot, apt.durationMinutes, assistant.timezone);
    if (!range || range.start.getTime() <= now.getTime()) continue;
    candidates.push({ apt, start: range.start, end: range.end });
  }
  if (candidates.length === 0) return [];

  // Blocks that ended before now cannot touch a future booking.
  const blocks = await Database.getExternalBlocks(assistant.id, now);
  if (blocks.length === 0) return [];

  const flagged: AppointmentData[] = [];
  const stamp = now.toISOString();
  for (const { apt, start, end } of candidates) {
    const own = (b: { startAt: Date; endAt: Date }) => b.startAt.getTime() === start.getTime() && b.endAt.getTime() === end.getTime();
    if (!blocks.some((b) => start < b.endAt && b.startAt < end && !own(b))) continue;
    try {
      const updated = await Database.updateAppointment(apt.id, { externalClashAt: stamp });
      if (!updated) continue;
    } catch (err) {
      logEvent({
        level: 'warn',
        category: 'booking',
        event: 'calendar.clash_flag_failed',
        meta: { assistantId: assistant.id, appointmentId: apt.id, error: err instanceof Error ? err.name : 'unknown' },
      });
      continue;
    }
    flagged.push({ ...apt, externalClashAt: stamp });
    await announce(assistant, apt);
  }
  if (flagged.length > 0) {
    logEvent({ category: 'booking', event: 'calendar.clash_detected', meta: { assistantId: assistant.id, count: flagged.length } });
  }
  return flagged;
}

async function announce(assistant: AssistantData, apt: AppointmentData): Promise<void> {
  const when = `${apt.date} at ${apt.timeSlot}`;
  const message = `${apt.name} is booked for ${when}, but your linked calendar shows you busy then. The booking has not been changed. Please check it and contact ${apt.name} if it needs to move.`;
  try {
    await Database.addNotification({
      assistantId: assistant.id,
      title: 'Booking clashes with your calendar',
      message,
      type: 'calendar_clash',
      metadata: { appointmentId: apt.id },
    });
  } catch (err) {
    logEvent({ level: 'warn', category: 'booking', event: 'calendar.clash_notice_failed', meta: { assistantId: assistant.id, appointmentId: apt.id, error: err instanceof Error ? err.name : 'unknown' } });
  }

  const to = assistant.supportReceiverEmail?.trim();
  if (!to) return;
  try {
    await sendOperationalEmail({
      to,
      subject: `Calendar clash: ${apt.name} on ${when}`,
      text: `${message}\n\nAssistant: ${assistant.name}\nGuest: ${apt.name} (${apt.email})\nBooking: ${when}`,
    });
  } catch (err) {
    logEvent({ level: 'warn', category: 'booking', event: 'calendar.clash_email_failed', meta: { assistantId: assistant.id, appointmentId: apt.id, error: err instanceof Error ? err.name : 'unknown' } });
  }
}
