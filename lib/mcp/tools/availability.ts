import { Database } from '@/lib/db';
import { getAvailableSlots, isIsoDate, type AvailabilityConfig, type ExistingAppointment } from '@/lib/appointments/availability';
import { McpAuthContext } from '../types';
import { assertScope } from '../auth';

export const checkAvailabilityMetadata = {
  name: 'check_availability',
  description:
    'Check real-time appointment and consultation slot availability for a specified date in the authenticated workspace. ALWAYS use this tool before proposing appointment times to a customer. NEVER invent or assume availability without verifying live slots through this tool.',
  annotations: {
    readOnlyHint: true,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'bookings:read' as const,
};

export async function handleCheckAvailability(
  args: {
    date: string;
    durationMinutes?: number;
    serviceId?: string;
    timezone?: string;
  },
  auth: McpAuthContext
) {
  assertScope(auth, 'bookings:read');

  const date = args?.date?.trim();
  if (!date || !isIsoDate(date)) {
    const error: any = new Error("Invalid date format. Expected 'YYYY-MM-DD' (e.g., '2026-10-15')");
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const assistants = await Database.getAssistants(auth.workspaceId);
  const primaryAssistant = assistants[0];

  if (!primaryAssistant) {
    const error: any = new Error('No assistant found in this workspace to handle bookings');
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Look up service if specified to get default duration
  let serviceDuration = args.durationMinutes;
  let serviceName = '';
  if (args.serviceId) {
    const lpConfig = await Database.getLandingPageConfig(primaryAssistant.id);
    const service = lpConfig?.services?.find(
      (s) => s.id.toLowerCase() === args.serviceId?.toLowerCase().trim()
    );
    if (service) {
      serviceDuration = serviceDuration || service.durationMinutes;
      serviceName = service.name;
    }
  }

  const config: AvailabilityConfig = {
    bookingStartHour: primaryAssistant.bookingStartHour || '09:00',
    bookingEndHour: primaryAssistant.bookingEndHour || '17:00',
    bookingAvailableDays: primaryAssistant.bookingAvailableDays || [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ],
    bookingSlotDuration: primaryAssistant.bookingSlotDuration || 30,
    timezone: args.timezone || primaryAssistant.timezone || 'UTC',
  };

  // Fetch all existing appointments for this assistant/workspace
  const rawAppointments = await Database.getAppointments(primaryAssistant.id, auth.workspaceId, { ownOnly: true });
  const existingAppointments: ExistingAppointment[] = rawAppointments.map((a) => ({
    date: a.date,
    timeSlot: a.timeSlot,
    durationMinutes: a.durationMinutes,
    status: a.status,
  }));

  const blocks = await Database.getExternalBlocks(primaryAssistant.id);

  const slots = getAvailableSlots({
    config,
    date,
    durationMinutes: serviceDuration || config.bookingSlotDuration || 30,
    appointments: existingAppointments,
    blocks,
  });

  return {
    date,
    timezone: config.timezone,
    serviceId: args.serviceId || null,
    serviceName: serviceName || null,
    durationMinutes: serviceDuration || config.bookingSlotDuration || 30,
    availableSlotsCount: slots.length,
    availableSlots: slots,
    message:
      slots.length > 0
        ? `Found ${slots.length} open slot(s) on ${date}.`
        : `No open slots available on ${date}. Please select another date.`,
  };
}
