import { Database } from '@/lib/db';
import { McpAuthContext } from '../types';
import { assertScope } from '../auth';

export const createLeadMetadata = {
  name: 'create_lead',
  description:
    'Capture and register a prospective customer lead, including email, full name, phone number, and project/inquiry notes in the authenticated workspace. Use when a visitor shares contact details, asks for a consultation proposal, or requests sales follow-up.',
  annotations: {
    readOnlyHint: false,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'leads:create' as const,
};

export async function handleCreateLead(
  args: {
    email: string;
    name?: string;
    phone?: string;
    notes?: string;
    customData?: Record<string, any>;
  },
  auth: McpAuthContext
) {
  assertScope(auth, 'leads:create');

  const email = args?.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    const error: any = new Error('A valid email address is required to register a lead');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Resolve assistant in this workspace
  const assistants = await Database.getAssistants(auth.workspaceId);
  let primaryAssistant = assistants[0];

  if (!primaryAssistant) {
    primaryAssistant = await Database.createAssistant({
      name: 'Concierge Assistant',
      workspaceId: auth.workspaceId,
    });
  }

  const name = args.name?.trim().slice(0, 150) || '';
  const phone = args.phone?.trim().slice(0, 50) || '';
  const notes = args.notes?.trim().slice(0, 2000) || '';

  const lead = await Database.saveLead({
    assistantId: primaryAssistant.id,
    email,
    name: name || undefined,
    phone: phone || undefined,
    notes: notes || undefined,
    customData: args.customData && typeof args.customData === 'object' ? args.customData : undefined,
  });

  return {
    status: 'captured',
    leadId: lead.id,
    email: lead.email,
    name: lead.name || null,
    phone: lead.phone || null,
    createdAt: lead.createdAt,
    message: `Lead for ${lead.email} successfully captured.`,
  };
}
