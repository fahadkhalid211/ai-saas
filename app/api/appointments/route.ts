import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { verifyAdminRequest, getAuthContext } from '@/lib/security/auth';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { validateAppointmentPayload } from '@/lib/security/validation';
import { acquireBookingLock } from '@/lib/appointments/booking-lock';
import { resolveAttribution } from '@/lib/analytics/attribution';
import { createAppointment } from '@/lib/appointments/create';

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

export async function GET(req: Request) {
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
      const bookedSlots = allAppointments
        .filter((a) => a.date === checkDate && a.status !== 'cancelled')
        .map((a) => a.timeSlot);

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

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

      const releaseLock = await acquireBookingLock(apt.assistantId, newDate.trim(), newTimeSlot.trim());
      let updated;
      try {
        const existingAppointments = await Database.getAppointments(apt.assistantId);
        const conflict = existingAppointments.find(
          (a) =>
            a.id !== apt.id &&
            a.date === newDate.trim() &&
            a.timeSlot === newTimeSlot.trim() &&
            a.status !== 'cancelled'
        );
        if (conflict) {
          return NextResponse.json(
            { error: `The time slot "${newTimeSlot.trim()}" on ${newDate.trim()} has already been booked. Please select another time.` },
            { status: 409 }
          );
        }

        updated = await Database.updateAppointment(apt.id, {
          date: newDate.trim(),
          timeSlot: newTimeSlot.trim(),
          status: 'confirmed',
          remindersSent: { reminder24h: false, reminder1h: false },
        });
      } finally {
        releaseLock();
      }

      await Database.addNotification({
        assistantId: apt.assistantId,
        title: 'Appointment Rescheduled',
        message: `${apt.name} rescheduled their appointment to ${newDate.trim()} at ${newTimeSlot.trim()}.`,
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
    if (!assistant) {
      assistant = await Database.getAssistantById('demo-assistant');
    }

    if (!assistant) {
      return NextResponse.json(
        { error: 'Assistant not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
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
      return NextResponse.json({ error: result.error }, { status: result.status, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    const appointment = result.appointment;

    return NextResponse.json(
      { success: true, appointment },
      {
        status: 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error: any) {
    console.error('[AppointmentsAPI] Error processing appointment:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process appointment' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function DELETE(req: Request) {
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
