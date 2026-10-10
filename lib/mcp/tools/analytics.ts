import { Database } from '@/lib/db';
import { McpAuthContext } from '../types';
import { assertScope } from '../auth';

export const getBookingSummaryMetadata = {
  name: 'get_booking_summary',
  description:
    'Retrieve aggregated booking and appointment metrics for the authenticated workspace (total bookings, confirmed, cancelled, upcoming count). Returns privacy-preserving statistics with zero customer PII leak.',
  annotations: {
    readOnlyHint: true,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'analytics:read' as const,
};

export const getLeadSummaryMetadata = {
  name: 'get_lead_summary',
  description:
    'Retrieve aggregated lead acquisition volume and growth metrics for the authenticated workspace. Returns privacy-preserving statistics with zero customer PII leak.',
  annotations: {
    readOnlyHint: true,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'analytics:read' as const,
};

export async function handleGetBookingSummary(
  args: { days?: number },
  auth: McpAuthContext
) {
  assertScope(auth, 'analytics:read');

  const days = Math.max(1, Math.min(365, Number(args.days) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const appointments = await Database.getAppointments(undefined, auth.workspaceId);
  const periodAppointments = appointments.filter((a) => a.date >= since);

  let confirmed = 0;
  let cancelled = 0;
  let pending = 0;
  let upcoming = 0;

  for (const a of periodAppointments) {
    if (a.status === 'confirmed') confirmed++;
    else if (a.status === 'cancelled') cancelled++;
    else if (a.status === 'pending') pending++;

    if (a.date >= today && a.status !== 'cancelled') {
      upcoming++;
    }
  }

  return {
    timeframeDays: days,
    totalBookingsInPeriod: periodAppointments.length,
    confirmedCount: confirmed,
    cancelledCount: cancelled,
    pendingCount: pending,
    upcomingActiveCount: upcoming,
  };
}

export async function handleGetLeadSummary(
  args: { days?: number },
  auth: McpAuthContext
) {
  assertScope(auth, 'analytics:read');

  const days = Math.max(1, Math.min(365, Number(args.days) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const leads = await Database.getLeads(undefined, auth.workspaceId);
  const leadsInPeriod = leads.filter((l) => l.createdAt >= since);

  return {
    timeframeDays: days,
    totalAllTimeLeads: leads.length,
    newLeadsInPeriod: leadsInPeriod.length,
    hasPhoneProvidedRate:
      leadsInPeriod.length > 0
        ? Math.round(
            (leadsInPeriod.filter((l) => Boolean(l.phone)).length / leadsInPeriod.length) * 100
          ) / 100
        : 0,
  };
}
