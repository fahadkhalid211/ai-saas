import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { sendSupportLeadEmail } from '@/lib/email';
import { dispatchWebhook } from '@/lib/webhook';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistantId parameter is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const appointments = await Database.getAppointments(assistantId);
    return NextResponse.json(
      { appointments },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch appointments' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if this is a status update
    if (body.action === 'update_status') {
      const { id, status } = body;
      if (!id || !status) {
        return NextResponse.json(
          { error: 'id and status are required' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const updated = await Database.updateAppointmentStatus(id, status);
      if (!updated) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      return NextResponse.json(
        { success: true },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // New Appointment Booking
    const { assistantId, name, email, phone, date, timeSlot, durationMinutes, notes } = body;

    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistantId is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!date || !date.trim()) {
      return NextResponse.json(
        { error: 'Appointment date is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!timeSlot || !timeSlot.trim()) {
      return NextResponse.json(
        { error: 'Appointment time slot is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const assistant = await Database.getAssistantById(assistantId);
    const resolvedDuration = durationMinutes || assistant?.bookingSlotDuration || 30;

    const appointment = await Database.saveAppointment({
      assistantId,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : undefined,
      date: date.trim(),
      timeSlot: timeSlot.trim(),
      durationMinutes: resolvedDuration,
      notes: notes?.trim() || undefined,
    });

    // Also record as a Lead so admin has unified visibility and CRM integrations fire
    const durationLabel = resolvedDuration >= 60 
      ? `${Math.floor(resolvedDuration / 60)}h${resolvedDuration % 60 > 0 ? ` ${resolvedDuration % 60}m` : ''}` 
      : `${resolvedDuration}m`;

    const leadNote = `Booked Appointment: ${date.trim()} at ${timeSlot.trim()} (${durationLabel})${
      notes?.trim() ? ' | Notes: ' + notes.trim() : ''
    }`;

    try {
      await Database.saveLead({
        assistantId,
        email: email.trim(),
        name: name.trim(),
        phone: phone ? phone.trim() : undefined,
        notes: leadNote,
        customData: {
          AppointmentId: appointment.id,
          AppointmentDate: date.trim(),
          AppointmentTime: timeSlot.trim(),
          DurationMinutes: resolvedDuration,
          Type: 'Calendar Booking',
        },
      });
    } catch (leadErr) {
      console.warn('[AppointmentsAPI] Lead sync warning:', leadErr);
    }

    // Outbound Webhook dispatch
    if (assistant && assistant.webhookUrl && assistant.webhookUrl.trim()) {
      dispatchWebhook(assistant, 'appointment.created', appointment).catch((webhookErr) => {
        console.warn('[AppointmentsAPI] Webhook dispatch warning:', webhookErr?.message);
      });
    }

    // Email notification if configured
    if (assistant?.supportReceiverEmail && assistant.supportReceiverEmail.trim()) {
      try {
        await sendSupportLeadEmail({
          to: assistant.supportReceiverEmail.trim(),
          cc: assistant.supportCcEmails || [],
          assistantName: assistant.name || 'AI Assistant',
          lead: {
            name: appointment.name,
            email: appointment.email,
            phone: appointment.phone || 'N/A',
            notes: leadNote,
            createdAt: appointment.createdAt,
            customData: {
              AppointmentDate: appointment.date,
              AppointmentTime: appointment.timeSlot,
              Duration: `${appointment.durationMinutes} minutes`,
            },
          },
          customFieldsConfig: [],
        });
      } catch (mailErr: any) {
        console.warn('[AppointmentsAPI] Email notification warning:', mailErr?.message);
      }
    }

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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const deleted = await Database.deleteAppointment(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete appointment' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
