import { Database } from '@/lib/db';
import { acquireDayLock } from '@/lib/appointments/booking-lock';
import { parseTimeToMinutes, isIsoDate, minutesToHHMM } from '@/lib/appointments/availability';
import { findBookingConflict } from '@/lib/appointments/conflicts';
import { slotRangeFields } from '@/lib/appointments/time-range';
import { McpAuthContext } from '../types';
import { assertScope } from '../auth';
import { asMcpError } from '../errors';

export const createBookingMetadata = {
  name: 'create_booking',
  description:
    'Book an appointment or consultation for a customer. REQUIRES EXPLICIT CONFIRMATION: You must ask the customer if they would like to book the slot, and set confirmed: true ONLY AFTER they verbally or textually agree. Never book without user consent. Automatically checks concurrency locks and prevents double-booking.',
  annotations: {
    readOnlyHint: false,
    requiresConfirmationHint: true,
    destructiveHint: false,
  },
  requiredScope: 'bookings:create' as const,
};

export const getBookingMetadata = {
  name: 'get_booking',
  description:
    'Retrieve details, status, date, time slot, and service for an existing booking in the authenticated workspace by booking ID or customer email.',
  annotations: {
    readOnlyHint: true,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'bookings:read' as const,
};

export const cancelBookingMetadata = {
  name: 'cancel_booking',
  description:
    'Cancel an existing appointment. DESTRUCTIVE ACTION: Requires explicit customer consent before calling with confirmed: true. Never cancel without confirmation.',
  annotations: {
    readOnlyHint: false,
    requiresConfirmationHint: true,
    destructiveHint: true,
  },
  requiredScope: 'bookings:modify' as const,
};

export async function handleCreateBooking(
  args: {
    date: string;
    timeSlot: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    serviceId?: string;
    serviceName?: string;
    durationMinutes?: number;
    notes?: string;
    confirmed?: boolean;
  },
  auth: McpAuthContext
) {
  assertScope(auth, 'bookings:create');

  // Trimmed once and used everywhere (lock, conflict check, stored row): a padded date would otherwise skip the range check.
  const date = (args.date || '').trim();
  const timeSlot = (args.timeSlot || '').trim();
  const {
    customerName,
    customerEmail,
    customerPhone,
    serviceId,
    serviceName,
    notes,
    confirmed,
  } = args;

  // Basic validation
  if (!date || !isIsoDate(date)) {
    const error: any = new Error("Invalid date format. Expected 'YYYY-MM-DD'");
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!timeSlot) {
    const error: any = new Error('timeSlot parameter is required (e.g. "14:00" or "2:00 PM")');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!customerName || !customerName.trim()) {
    const error: any = new Error('customerName is required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!customerEmail || !customerEmail.includes('@')) {
    const error: any = new Error('A valid customerEmail is required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Confirmation enforcement
  if (confirmed !== true) {
    return {
      status: 'requires_confirmation',
      requiresExplicitConfirmation: true,
      message: `Confirmation required: Please confirm with ${customerName.trim()} before finalizing the appointment for ${serviceName || 'consultation'} on ${date} at ${timeSlot}. Re-invoke this tool with confirmed: true once confirmed.`,
      bookingDraft: {
        date,
        timeSlot,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        serviceName: serviceName || 'General Appointment',
      },
    };
  }

  // Resolve assistant for this workspace
  const assistants = await Database.getAssistants(auth.workspaceId);
  let primaryAssistant = assistants[0];
  if (!primaryAssistant) {
    primaryAssistant = await Database.createAssistant({
      name: 'Concierge Assistant',
      workspaceId: auth.workspaceId,
    });
  }

  const duration = Math.max(10, Math.min(480, Number(args.durationMinutes) || primaryAssistant.bookingSlotDuration || 30));
  const startMinutes = parseTimeToMinutes(timeSlot);

  if (startMinutes === null) {
    const error: any = new Error(`Cannot parse time slot '${timeSlot}'. Expected HH:MM or h:mm AM/PM.`);
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const normalizedSlot = minutesToHHMM(startMinutes);

  // Acquire the day lock (bookings with different start times can overlap) to prevent races across parallel agents
  let releaseLock: (() => void) | null = null;
  try {
    releaseLock = await acquireDayLock(primaryAssistant.id, date, 5000);
  } catch (lockErr: any) {
    const error: any = new Error(`Slot ${normalizedSlot} on ${date} is currently being processed by another client. Please retry in a moment.`);
    error.code = 'BOOKING_CONFLICT';
    throw error;
  }

  try {
    // Check the slot's time range against active bookings in this workspace and the assistant's external calendar blocks.
    // Always the assistant's own timezone, so the stored range matches every other booking path.
    const existingAppointments = await Database.getAppointments(primaryAssistant.id, auth.workspaceId, { ownOnly: true });
    const blocks = await Database.getExternalBlocks(primaryAssistant.id);
    const conflict = findBookingConflict({
      date,
      timeSlot: normalizedSlot,
      durationMinutes: duration,
      timezone: primaryAssistant.timezone,
      appointments: existingAppointments,
      blocks,
    });

    const slotTaken = () => {
      const error: any = new Error(`The requested slot at ${normalizedSlot} on ${date} is already booked. Please run check_availability to select an open time.`);
      error.code = 'BOOKING_CONFLICT';
      return error;
    };
    if (conflict) throw slotTaken();

    // Save appointment (the database's overlap constraint answers SLOT_CONFLICT if another instance won the race)
    const appointment = await Database.createAppointment({
      assistantId: primaryAssistant.id,
      name: customerName.trim(),
      email: customerEmail.trim().toLowerCase(),
      phone: customerPhone?.trim() || '',
      date,
      timeSlot: normalizedSlot,
      durationMinutes: duration,
      serviceId: serviceId?.trim() || '',
      serviceName: serviceName?.trim() || 'General Consultation',
      notes: notes?.trim() || '',
      ...slotRangeFields(primaryAssistant, { date, timeSlot: normalizedSlot, durationMinutes: duration }),
    }).catch((err: any) => {
      throw err?.code === 'SLOT_CONFLICT' ? slotTaken() : asMcpError(err);
    });

    return {
      status: 'confirmed',
      bookingId: appointment.id,
      name: appointment.name,
      email: appointment.email,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      durationMinutes: appointment.durationMinutes,
      serviceName: appointment.serviceName,
      manageToken: appointment.manageToken,
      message: `Appointment successfully booked for ${appointment.name} on ${appointment.date} at ${appointment.timeSlot}.`,
    };
  } finally {
    if (releaseLock) {
      releaseLock();
    }
  }
}

export async function handleGetBooking(
  args: { bookingId?: string; customerEmail?: string },
  auth: McpAuthContext
) {
  assertScope(auth, 'bookings:read');

  if (!args.bookingId && !args.customerEmail) {
    const error: any = new Error('Either bookingId or customerEmail is required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const assistants = await Database.getAssistants(auth.workspaceId);
  const allowedAssistantIds = new Set(assistants.map((a) => a.id));

  if (args.bookingId) {
    const apt = await Database.getAppointmentById(args.bookingId.trim());
    if (!apt || !allowedAssistantIds.has(apt.assistantId)) {
      const error: any = new Error(`Booking '${args.bookingId}' not found in this workspace`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      id: apt.id,
      name: apt.name,
      email: apt.email,
      phone: apt.phone || '',
      date: apt.date,
      timeSlot: apt.timeSlot,
      durationMinutes: apt.durationMinutes,
      serviceName: apt.serviceName || 'Consultation',
      status: apt.status,
      notes: apt.notes || '',
      createdAt: apt.createdAt,
    };
  }

  // Lookup by customer email
  const allAppointments = await Database.getAppointments(undefined, auth.workspaceId);
  const normalizedEmail = args.customerEmail!.trim().toLowerCase();
  const matched = allAppointments.filter(
    (a) => a.email.toLowerCase() === normalizedEmail && allowedAssistantIds.has(a.assistantId)
  );

  return {
    total: matched.length,
    bookings: matched.map((apt) => ({
      id: apt.id,
      name: apt.name,
      email: apt.email,
      phone: apt.phone || '',
      date: apt.date,
      timeSlot: apt.timeSlot,
      durationMinutes: apt.durationMinutes,
      serviceName: apt.serviceName || 'Consultation',
      status: apt.status,
      createdAt: apt.createdAt,
    })),
  };
}

export async function handleCancelBooking(
  args: { bookingId: string; reason?: string; confirmed?: boolean },
  auth: McpAuthContext
) {
  assertScope(auth, 'bookings:modify');

  const bookingId = args?.bookingId?.trim();
  if (!bookingId) {
    const error: any = new Error('bookingId is required to cancel a booking');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Confirmation enforcement for destructive cancel action
  if (args.confirmed !== true) {
    return {
      status: 'requires_confirmation',
      message: `Confirmation required: Are you sure you want to cancel booking ${bookingId}? Please verify with the customer and call this tool with confirmed: true to execute cancellation.`,
      bookingId,
    };
  }

  const success = await Database.updateAppointmentStatus(
    bookingId,
    'cancelled',
    args.reason?.trim() || 'Cancelled via AI assistant',
    auth.workspaceId
  ).catch((err: unknown) => {
    throw asMcpError(err);
  });

  if (!success) {
    const error: any = new Error(`Cannot cancel booking '${bookingId}': Booking not found or does not belong to this workspace.`);
    error.code = 'NOT_FOUND';
    throw error;
  }

  return {
    status: 'cancelled',
    bookingId,
    message: `Booking ${bookingId} has been successfully cancelled.`,
  };
}
