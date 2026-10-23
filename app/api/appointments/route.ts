import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { verifyAdminRequest, getAuthContext } from '@/lib/security/auth';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimit, enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { validateAppointmentPayload } from '@/lib/security/validation';
import { acquireDayLock } from '@/lib/appointments/booking-lock';
import { resolveAttribution } from '@/lib/analytics/attribution';
import { BOOKING_UNAVAILABLE_MESSAGE, createAppointment } from '@/lib/appointments/create';
import { openingHoursProblem } from '@/lib/appointments/availability';
import { blockedSlotStarts, findBookingConflict } from '@/lib/appointments/conflicts';
import { slotRange, slotRangeFields } from '@/lib/appointments/time-range';
import { isBookingUnavailable } from '@/lib/appointments/errors';
import { logged } from '@/lib/logging/route';

/** Postgres is required but unavailable: nothing was saved, and the visitor may retry shortly. */
function bookingUnavailableResponse(message: string = BOOKING_UNAVAILABLE_MESSAGE) {
  return NextResponse.json({ error: message }, { status: 503, headers: { 'Access-Control-Allow-Origin': '*', 'Retry-After': '5' } });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function GETHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const manageToken = searchParams.get('manageToken');

    // Public client lookup via secure self-service token
    if (manageToken) {
      const apt = await Database.getAppointmentByManageToken(manageToken);
      if (!apt) {
        return NextResponse.json({ error: 'Appointment not found or invalid link' }, { status: 404 });
      }
      return NextResponse.json({ appointment: apt });
    }

    const assistantId = searchParams.get('assistantId');
    const checkDate = searchParams.get('checkDate');

    // Public live slot availability check for booking widgets and landing pages
    if (checkDate && assistantId) {
      const allAppointments = await Database.getAppointments(assistantId);
      const exact = allAppointments
        .filter((a) => a.date === checkDate && a.status !== 'cancelled')
        .map((a) => a.timeSlot);

      // Also every grid start that a longer booking or an external calendar block covers, so the widget never offers it.
      const assistant = await Database.getAssistantById(assistantId);
      let bookedSlots = exact;
      if (assistant) {
        const blocks = await Database.getExternalBlocks(assistant.id);
        const covered = blockedSlotStarts({
          config: {
            bookingStartHour: assistant.bookingStartHour,
            bookingEndHour: assistant.bookingEndHour,
            bookingAvailableDays: assistant.bookingAvailableDays,
            bookingSlotDuration: assistant.bookingSlotDuration,
            timezone: assistant.timezone,
          },
          date: checkDate,
          appointments: allAppointments,
          blocks,
        });
        bookedSlots = Array.from(new Set([...exact, ...covered]));
      }

      return NextResponse.json(
        { date: checkDate, bookedSlots },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Only authenticated admins can view list of booked appointments
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistantId parameter is required' },
        { status: 400 }
      );
    }

    if (ctx.workspaceId !== '*') {
      const assistant = await Database.getAssistantById(assistantId, ctx.workspaceId);
      if (!assistant) {
        return NextResponse.json({ error: 'Assistant not found or forbidden' }, { status: 404 });
      }
    }

    const appointments = await Database.getAppointments(assistantId, ctx.workspaceId);
    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

async function POSTHandler(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (body === null || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // Client self-service cancellation via manageToken
    if (body.action === 'client_cancel') {
      const { manageToken, cancellationReason } = body;
      if (!manageToken) {
        return NextResponse.json({ error: 'manageToken required' }, { status: 400 });
      }
      const apt = await Database.getAppointmentByManageToken(manageToken);
      if (!apt) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }
      await Database.updateAppointmentStatus(apt.id, 'cancelled', cancellationReason || 'Cancelled by client');
      await Database.addNotification({
        assistantId: apt.assistantId,
        title: 'Appointment Cancelled',
        message: `${apt.name} cancelled their appointment for ${apt.date} at ${apt.timeSlot}. Reason: ${cancellationReason || 'No reason specified'}`,
        type: 'appointment_cancelled',
      });
      return NextResponse.json({ success: true, message: 'Appointment successfully cancelled' });
    }

    // Client self-service reschedule via manageToken
    if (body.action === 'client_reschedule') {
      const { manageToken, newDate, newTimeSlot } = body;
      if (!manageToken || !newDate || !newTimeSlot) {
        return NextResponse.json({ error: 'manageToken, newDate, and newTimeSlot required' }, { status: 400 });
      }
      const apt = await Database.getAppointmentByManageToken(manageToken);
      if (!apt) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      const date = String(newDate).trim();
      const timeSlot = String(newTimeSlot).trim();
      // An unreadable time would leave the booking's stored range at its old time, so it is refused.
      const range = slotRangeFields({}, { date, timeSlot, durationMinutes: apt.durationMinutes });
      if (!range.slotStart) {
        return NextResponse.json({ error: 'newDate must be YYYY-MM-DD and newTimeSlot a time such as "14:00" or "2:00 PM".' }, { status: 400 });
      }
      const takenResponse = () =>
        NextResponse.json(
          { error: `The time slot "${timeSlot}" on ${date} has already been booked. Please select another time.` },
          { status: 409 }
        );

      // The day lock: a booking with a different start time on the same day can still overlap the new time.
      const releaseLock = await acquireDayLock(apt.assistantId, date);
      let updated;
      try {
        const assistant = await Database.getAssistantById(apt.assistantId);
        const existingAppointments = await Database.getAppointments(apt.assistantId);
        const blocks = await Database.getExternalBlocks(apt.assistantId);
        const conflict = findBookingConflict({
          date,
          timeSlot,
          durationMinutes: apt.durationMinutes,
          timezone: assistant?.timezone,
          appointments: existingAppointments,
          blocks,
          ignoreAppointmentId: apt.id,
        });
        if (conflict) return takenResponse();

        try {
          updated = await Database.updateAppointment(apt.id, {
            date,
            timeSlot,
            status: 'confirmed',
            remindersSent: { reminder24h: false, reminder1h: false },
            ...slotRangeFields(assistant || {}, { date, timeSlot, durationMinutes: apt.durationMinutes }),
          });
        } catch (err: any) {
          if (err?.code === 'SLOT_CONFLICT') return takenResponse();
          throw err;
        }
      } finally {
        releaseLock();
      }

      await Database.addNotification({
        assistantId: apt.assistantId,
        title: 'Appointment Rescheduled',
        message: `${apt.name} rescheduled their appointment to ${date} at ${timeSlot}.`,
        type: 'appointment_booked',
      });
      return NextResponse.json({ success: true, appointment: updated });
    }

    // Check if this is a status update (Requires Admin Authentication)
    if (body.action === 'update_status') {
      const ctx = await getAuthContext(req);
      if (!ctx.authenticated) {
        return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
      }

      const { id, status, cancellationReason } = body;
      if (!id || !status) {
        return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
      }
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return NextResponse.json({ error: 'status must be one of: pending, confirmed, cancelled, completed' }, { status: 400 });
      }

      const existingApt = await Database.getAppointmentById(id);
      if (!existingApt) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      if (ctx.workspaceId !== '*') {
        const ast = existingApt.assistantId ? await Database.getAssistantById(existingApt.assistantId, ctx.workspaceId) : null;
        if (!ast) {
          return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }
      }

      const updated = await Database.updateAppointmentStatus(id, status, cancellationReason, ctx.workspaceId);
      if (!updated) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      const ast = existingApt.assistantId ? await Database.getAssistantById(existingApt.assistantId) : null;

      await Database.addAuditLog({
        workspaceId: ctx.workspaceId !== '*' ? ctx.workspaceId : (ast?.workspaceId || 'default-workspace'),
        actor: {
          id: ctx.memberId || 'admin',
          name: ctx.role === 'owner' ? 'Workspace Owner' : 'Admin User',
          ip: getClientIp(req),
        },
        action: 'appointment.status_updated',
        targetType: 'appointment',
        targetId: id,
        details: {
          status,
          cancellationReason,
          clientName: existingApt.name,
          date: existingApt.date,
          timeSlot: existingApt.timeSlot,
        },
      });

      return NextResponse.json({ success: true });
    }

    // New Appointment Booking (Public Widget / Embed)
    // Rate limit booking submissions (max 10 per minute per IP)
    const rateLimit = enforceRateLimit(req, 'appts', { windowMs: 60 * 1000, max: 10 });
    if (rateLimit.errorResponse) {
      return rateLimit.errorResponse;
    }
    const sharedLimited = await enforceDistributedRateLimit(req, 'appts', { windowMs: 60 * 1000, max: 10 });
    if (sharedLimited) return sharedLimited;
    const ip = rateLimit.clientIp;

    const validation = validateAppointmentPayload(body);
    if (!validation.valid || !validation.sanitized) {
      const firstError = Object.values(validation.errors)[0] || 'Invalid appointment details';
      return NextResponse.json(
        { error: firstError, errors: validation.errors },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const {
      assistantId,
      name,
      email,
      phone,
      date,
      timeSlot,
      durationMinutes,
      notes,
      serviceId,
      serviceName,
      price,
      landingPageName,
      landingPageSlug,
    } = validation.sanitized;

    let assistant = await Database.getAssistantById(assistantId);
    if (!assistant) {
      assistant = await Database.getAssistantBySlug(assistantId);
    }
    if (!assistant && landingPageSlug) {
      assistant = await Database.getAssistantBySlug(landingPageSlug);
    }
    if (!assistant) {
      const page = await Database.getLandingPageBySlugOrDomain(assistantId);
      if (page?.assistantId) {
        assistant = await Database.getAssistantById(page.assistantId);
      }
    }
    // An id that matches no assistant is refused. Falling back to the demo assistant put strangers' bookings into its calendar.
    if (!assistant) {
      return NextResponse.json(
        { error: 'Assistant not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // The owner's opening days and hours apply to the public booking forms as well, not only to the slots the forms offer.
    const closed = openingHoursProblem(assistant, date, timeSlot);
    if (closed) {
      return NextResponse.json({ error: closed }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // A time the range parser cannot read would be saved without a range and escape the overlap checks.
    if (!slotRange(date, timeSlot, durationMinutes, assistant.timezone)) {
      return NextResponse.json(
        { error: 'Please select a valid time slot (e.g. 10:00 AM, 10:00 - 10:30, or 2:30 PM).' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Attribution (verified conversation + source) for pilot measurement. Lives on the
    // paired lead so it works in both blob and relational modes without a schema change.
    const attribution = await resolveAttribution(validation.sanitized, assistant.id);

    const result = await createAppointment({
      assistant,
      input: { name, email, phone, date, timeSlot, durationMinutes, notes, serviceId, serviceName, price, landingPageName, landingPageSlug },
      attribution,
      ip,
      originalAssistantId: assistantId,
    });
    if (!result.ok) {
      if (result.status === 503) return bookingUnavailableResponse(result.error);
      return NextResponse.json({ error: result.error }, { status: result.status, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    const appointment = result.appointment;

    return NextResponse.json(
      { success: true, appointment, ...(result.duplicate ? { alreadyBooked: true } : {}) },
      {
        status: result.duplicate ? 200 : 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error: any) {
    // Any branch (new booking, reschedule, cancel, status update) refused because Postgres is required but down.
    if (isBookingUnavailable(error)) return bookingUnavailableResponse();
    // The database refused the change because the time was booked meanwhile (e.g. un-cancelling onto a rebooked slot).
    if (error?.code === 'SLOT_CONFLICT') {
      return NextResponse.json(
        { error: 'That time has already been booked. Please select another time.' },
        { status: 409, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }
    console.error('[AppointmentsAPI] Error processing appointment:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process appointment' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

async function DELETEHandler(req: Request) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter required' }, { status: 400 });
    }

    const deleted = await Database.deleteAppointment(id, ctx.workspaceId);
    if (!deleted) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    await Database.addAuditLog({
      workspaceId: ctx.workspaceId,
      actor: {
        id: ctx.memberId,
        name: ctx.role === 'owner' ? 'Workspace Owner' : 'Admin User',
        ip: getClientIp(req),
      },
      action: 'appointment.deleted',
      targetType: 'appointment',
      targetId: id,
      details: {
        appointmentId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}

export const GET = logged(GETHandler, { route: '/api/appointments' });
export const POST = logged(POSTHandler, { route: '/api/appointments' });
export const DELETE = logged(DELETEHandler, { route: '/api/appointments' });
