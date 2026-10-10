import { Database } from '@/lib/db';
import { McpAuthContext } from '../types';
import { assertScope } from '../auth';

export const getBusinessInformationMetadata = {
  name: 'get_business_information',
  description:
    'Retrieve verified business overview, operating hours, contact information, location, website, and scheduling timezone for the authenticated Crescelo workspace. Use this tool whenever a customer or user asks about company background, open hours, location, or how to get in touch.',
  annotations: {
    readOnlyHint: true,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'business:read' as const,
};

export async function handleGetBusinessInformation(
  args: Record<string, any>,
  auth: McpAuthContext
) {
  assertScope(auth, 'business:read');

  // Resolve assistants in this workspace
  const assistants = await Database.getAssistants(auth.workspaceId);
  const primaryAssistant = assistants[0];

  if (!primaryAssistant) {
    return {
      businessName: 'Crescelo Client',
      description: 'No active assistant found in workspace.',
      status: 'unconfigured',
    };
  }

  // Check landing page config or assistant settings
  const lpConfig = await Database.getLandingPageConfig(primaryAssistant.id);

  const businessName = lpConfig?.businessName || primaryAssistant.name || 'Business';
  const description =
    (lpConfig as any)?.description ||
    (lpConfig as any)?.heroSubheadline ||
    primaryAssistant.description ||
    '';
  const workingHours = (lpConfig as any)?.workingHours || {
    days: primaryAssistant.bookingAvailableDays?.join(', ') || 'Monday - Friday',
    hours: `${primaryAssistant.bookingStartHour || '09:00'} - ${primaryAssistant.bookingEndHour || '17:00'}`,
  };
  const contact = {
    email: (lpConfig as any)?.email || (lpConfig as any)?.contactEmail || primaryAssistant.supportReceiverEmail || '',
    phone: (lpConfig as any)?.phone || (lpConfig as any)?.contactPhone || primaryAssistant.phoneNumber || '',
    address: (lpConfig as any)?.address || (lpConfig as any)?.locationAddress || '',
    website: (lpConfig as any)?.website || primaryAssistant.allowedDomains?.[0] || '',
  };
  const timezone = primaryAssistant.timezone || 'UTC';

  return {
    businessName,
    description,
    headline: (lpConfig as any)?.headline || (lpConfig as any)?.heroHeadline || '',
    workingHours,
    contact,
    timezone,
    servicesCount: lpConfig?.services?.length || 0,
    bookingEnabled: Boolean(primaryAssistant.bookingEnabled),
    allowedDomains: primaryAssistant.allowedDomains || [],
  };
}
