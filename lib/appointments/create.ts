import { Database, type AppointmentData, type AssistantData } from '@/lib/db';
import { sendAppointmentConfirmationEmail } from '@/lib/email';
import { dispatchIntegrationsAfterResponse } from '@/lib/integrations/dispatch';
import { acquireDayLock, isBookingLockTimeout } from '@/lib/appointments/booking-lock';
import { attributionCustomData, type ResolvedAttribution } from '@/lib/analytics/attribution';
import { findBookingConflict } from '@/lib/appointments/conflicts';
import { slotRangeFields } from '@/lib/appointments/time-range';
import { isBookingUnavailable } from '@/lib/appointments/errors';
import { logEvent } from '@/lib/logging/logger';
import { blocksLowerBound } from '@/lib/calendar/sync/blocks-bound';
import { refreshCalendarsBeforeBooking } from '@/lib/calendar/sync/refresh-before-booking';

export interface NewAppointmentInput {
  name: string;
  email: string;
  phone?: string;
  date: string;
  timeSlot: string;
  durationMinutes?: number;
  notes?: string;
  serviceId?: string;
  serviceName?: string;
  price?: number;
  landingPageName?: string;
  landingPageSlug?: string;
}

export type CreateAppointmentResult =
  | { ok: true; appointment: AppointmentData; /** The same person had already booked this slot (a retry): nothing new was created. */ duplicate?: boolean }
  | {
      ok: false;
      status: 409 | 500 | 503;
      error: string;
      /** For a 503: seconds the client should wait before retrying (5 for a busy day lock; the route defaults to 60 for an outage). */
      retryAfterSeconds?: number;
    };

/** Answer for a booking refused because the database that guards against double booking is unavailable. */
export const BOOKING_UNAVAILABLE_MESSAGE = 'We could not save your booking right now. Please try again in a moment.';

export interface CreateAppointmentOptions {
  assistant: AssistantData;
  input: NewAppointmentInput;
  attribution: ResolvedAttribution;
  /** Client address for the audit log ("phone" for calls). */
  ip: string;
  /** Who performed the booking, for the audit log. Defaults to the client. */
  actorId?: string;
  /** The id/slug the caller used, when it differs from the resolved assistant (kept on the lead). */
  originalAssistantId?: string;
  /** Send the client's confirmation email (skipped when the email is a synthetic placeholder). */
  sendClientEmail?: boolean;
}

/**
 * Creates an appointment and runs every side effect the public booking API does:
 * range-overlap conflict check (bookings and external calendar blocks) under the day lock, client confirmation email,
 * dashboard notification, audit log, paired lead, webhook and admin email. Shared by the web API and the voice channel.
 */
export async function createAppointment(opts: CreateAppointmentOptions): Promise<CreateAppointmentResult> {
  const { assistant, input, attribution, ip } = opts;
  const date = input.date.trim();
  const timeSlot = input.timeSlot.trim();
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone ? input.phone.trim() : undefined;
  const notes = input.notes?.trim() || undefined;

  const resolvedDuration = input.durationMinutes || assistant.bookingSlotDuration || 30;
  // An assistant without a landing page uses its own name. It must never fall back to the demo barbershop's name, address and
  // phone: those would appear in the confirmation e-mail of every other business.
  const landingConfig: Partial<NonNullable<AssistantData['landingPageConfig']>> = assistant.landingPageConfig || {};

  // Bring the owner's linked calendars up to date BEFORE taking the lock (it may use the network for up to 3 seconds and must not hold
  // the day up). It never fails a booking; the conflict check below reads the blocks it just stored.
  await refreshCalendarsBeforeBooking(assistant);

  // Concurrency lock: serialise every attempt for this assistant and day (bookings with different start times can overlap).
  // (Cross-instance safety comes from the relational exclusion constraint and unique index, which raise SLOT_CONFLICT.)
  let releaseLock: () => void;
  try {
    releaseLock = await acquireDayLock(assistant.id, date);
  } catch (err) {
    // Another request held the day for too long: nothing was written, and a retry in a few seconds usually succeeds.
    if (!isBookingLockTimeout(err)) throw err;
    logEvent({ level: 'warn', category: 'booking', event: 'booking.lock_timeout', meta: { assistantId: assistant.id, date, timeSlot } });
    return { ok: false, status: 503, error: BOOKING_UNAVAILABLE_MESSAGE, retryAfterSeconds: 5 };
  }
  let appointment: AppointmentData;
  try {
    const existingAppointments = await Database.getAppointments(assistant.id, undefined, { ownOnly: true });
    const sameSlot = existingAppointments.find((a) => a.date === date && a.timeSlot === timeSlot && a.status !== 'cancelled');
    // Someone whose first attempt timed out, or who clicked twice, asks again for the slot they already hold. Tell them it is theirs
    // instead of "already booked". The reply leaves out the manage token: knowing an e-mail and a slot must not give control of it.
    if (sameSlot && (sameSlot.email || '').trim().toLowerCase() === email.toLowerCase()) {
      return { ok: true, duplicate: true, appointment: { ...sameSlot, manageToken: undefined } };
    }
    let blocks: Awaited<ReturnType<typeof Database.getExternalBlocks>>;
    try {
      blocks = await Database.getExternalBlocks(assistant.id, blocksLowerBound(date));
    } catch (err) {
      // Linked calendars cannot be read: confirming now could double-book against them, so nothing is written and the visitor retries.
      if (!isBookingUnavailable(err)) throw err;
      logEvent({ level: 'error', category: 'booking', event: 'booking.db_unavailable', meta: { assistantId: assistant.id, date, timeSlot, source: 'external_blocks' } });
      return { ok: false, status: 503, error: BOOKING_UNAVAILABLE_MESSAGE };
    }
    const conflict = findBookingConflict({
      date,
      timeSlot,
      durationMinutes: resolvedDuration,
      timezone: assistant.timezone,
      appointments: existingAppointments,
      blocks,
    });
    if (conflict) {
      logEvent({ level: 'warn', category: 'booking', event: 'booking.slot_conflict', meta: { assistantId: assistant.id, date, timeSlot, kind: conflict.kind } });
      return { ok: false, status: 409, error: `The time slot "${timeSlot}" on ${date} has already been booked. Please select another time.` };
    }

    try {
      appointment = await Database.saveAppointment({
        assistantId: assistant.id,
        name,
        email,
        phone,
        date,
        timeSlot,
        durationMinutes: resolvedDuration,
        notes,
        serviceId: input.serviceId,
        serviceName: input.serviceName,
        price: input.price ? Number(input.price) : undefined,
        landingPageName: input.landingPageName || landingConfig.businessName,
        landingPageSlug: input.landingPageSlug || landingConfig.slug,
        ...slotRangeFields(assistant, { date, timeSlot, durationMinutes: resolvedDuration }),
      });
    } catch (err: any) {
      if (err?.code === 'SLOT_CONFLICT') {
        logEvent({ level: 'warn', category: 'booking', event: 'booking.slot_conflict', meta: { assistantId: assistant.id, date, timeSlot, source: 'database_index' } });
        return { ok: false, status: 409, error: `The time slot "${timeSlot}" on ${date} has already been booked. Please select another time.` };
      }
      if (isBookingUnavailable(err)) {
        logEvent({ level: 'error', category: 'booking', event: 'booking.db_unavailable', meta: { assistantId: assistant.id, date, timeSlot } });
        return { ok: false, status: 503, error: BOOKING_UNAVAILABLE_MESSAGE };
      }
      throw err;
    }
  } finally {
    releaseLock();
  }

  const businessName = landingConfig.businessName || assistant.name || 'Our Business';
  const businessAddress = landingConfig.address || 'In Shop';
  const businessPhone = landingConfig.phone || '';
  const assistantSlug = landingConfig.slug || assistant.id;

  const confirmationBase = {
    clientName: appointment.name,
    clientEmail: appointment.email,
    clientPhone: appointment.phone,
    serviceName: appointment.serviceName || 'Appointment',
    price: appointment.price,
    date: appointment.date,
    timeSlot: appointment.timeSlot,
    durationMinutes: appointment.durationMinutes,
    notes: appointment.notes,
    businessName,
    businessAddress,
    businessPhone,
    manageToken: appointment.manageToken,
    assistantSlug,
    assistantId: assistant.id,
  };

  if (opts.sendClientEmail !== false) {
    try {
      await sendAppointmentConfirmationEmail({ ...confirmationBase, to: appointment.email, isAdminNotification: false });
    } catch (confErr: any) {
      console.warn('[Appointments] Client confirmation email warning:', confErr?.message);
    }
  }

  try {
    await Database.addNotification({
      assistantId: assistant.id,
      title: 'New Appointment Booked',
      message: `${appointment.name} scheduled ${appointment.serviceName || 'an appointment'} on ${appointment.date} at ${appointment.timeSlot}.`,
      type: 'appointment_booked',
    });
  } catch (notifErr: any) {
    console.warn('[Appointments] In-app notification warning:', notifErr?.message);
  }

  try {
    await Database.addAuditLog({
      workspaceId: assistant.workspaceId || 'default-workspace',
      actor: { id: opts.actorId || 'client', name: appointment.name, email: appointment.email, ip },
      action: 'appointment.created',
      targetType: 'appointment',
      targetId: appointment.id,
      details: {
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        serviceName: appointment.serviceName,
        price: appointment.price,
        source: attribution.source,
      },
    });
  } catch (auditErr: any) {
    console.warn('[Appointments] Audit log warning:', auditErr?.message);
  }

  // Also record as a lead so the admin has unified visibility.
  const durationLabel =
    resolvedDuration >= 60 ? `${Math.floor(resolvedDuration / 60)}h${resolvedDuration % 60 > 0 ? ` ${resolvedDuration % 60}m` : ''}` : `${resolvedDuration}m`;
  const leadNote = `Booked Appointment: ${date} at ${timeSlot} (${durationLabel})${appointment.serviceName ? ` | Service: ${appointment.serviceName}` : ''}${
    notes ? ' | Notes: ' + notes : ''
  }`;
  try {
    await Database.saveLead({
      assistantId: assistant.id,
      email,
      name,
      phone,
      notes: leadNote,
      customData: {
        AppointmentId: appointment.id,
        AppointmentDate: date,
        AppointmentTime: timeSlot,
        DurationMinutes: resolvedDuration,
        Service: appointment.serviceName,
        Price: appointment.price,
        Type: 'Calendar Booking',
        originalAssistantId: opts.originalAssistantId && opts.originalAssistantId !== assistant.id ? opts.originalAssistantId : undefined,
        ...attributionCustomData(attribution),
      },
    });
  } catch (leadErr) {
    console.warn('[Appointments] Lead sync warning:', leadErr);
  }

  // Webhook, Slack and Google Sheets: delivered after the response, kept alive by after()
  dispatchIntegrationsAfterResponse(assistant, 'appointment.created', appointment);

  if (assistant.supportReceiverEmail && assistant.supportReceiverEmail.trim()) {
    try {
      await sendAppointmentConfirmationEmail({ ...confirmationBase, to: assistant.supportReceiverEmail.trim(), isAdminNotification: true });
    } catch (mailErr: any) {
      console.warn('[Appointments] Admin email notification warning:', mailErr?.message);
    }
  }

  logEvent({ category: 'booking', event: 'booking.created', meta: { assistantId: assistant.id, appointmentId: appointment.id, date, timeSlot } });
  return { ok: true, appointment };
}
