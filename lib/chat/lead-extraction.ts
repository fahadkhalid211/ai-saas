import { Database } from '../db';
import { attributionCustomData } from '../analytics/attribution';

export interface ExtractedContact {
  email?: string;
  phone?: string;
  name?: string;
  rawText: string;
}

/**
 * Scan a message string for email addresses and phone numbers.
 */
export function extractContactDetails(text: string): ExtractedContact | null {
  if (!text || typeof text !== 'string') return null;

  // Extract email address
  const emailMatch = text.match(
    /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/
  );
  const email = emailMatch ? emailMatch[0].trim().toLowerCase() : undefined;

  // Extract phone number (requires at least 10 digits to prevent false positives on years or short codes)
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  let phone: string | undefined = undefined;
  if (phoneMatch) {
    const rawPhone = phoneMatch[0].trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      phone = rawPhone;
    }
  }

  // Extract optional name hint ("my name is Jane Doe", "I am John Smith")
  let name: string | undefined = undefined;
  const nameMatch = text.match(/\b(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i);
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].trim();
  }

  if (!email && !phone) return null;

  return {
    email,
    phone,
    name,
    rawText: text.trim(),
  };
}

/**
 * Auto-persists an in-chat lead when contact details are detected,
 * deduplicating against existing leads for the assistant and conversation.
 */
export async function autoCaptureChatLead(params: {
  assistantId: string;
  conversationId: string;
  userMessage: string;
}): Promise<boolean> {
  const contact = extractContactDetails(params.userMessage);
  if (!contact) return false;

  const targetEmail =
    contact.email || `${contact.phone?.replace(/\D/g, '') || 'visitor'}@kortex-visitor.com`;

  try {
    const existingLeads = await Database.getLeads(params.assistantId);
    const alreadySaved = existingLeads.some(
      (l) =>
        (contact.email && l.email.toLowerCase() === contact.email.toLowerCase()) ||
        (contact.phone && l.phone && l.phone.replace(/\D/g, '') === contact.phone.replace(/\D/g, '')) ||
        (l.customData?.attributionConversationId === params.conversationId &&
          (contact.email ? l.email.toLowerCase() === contact.email.toLowerCase() : true))
    );

    if (alreadySaved) {
      return false;
    }

    const lead = await Database.saveLead({
      assistantId: params.assistantId,
      email: targetEmail,
      name: contact.name || 'Chat Visitor',
      phone: contact.phone,
      notes: `Auto-captured from in-chat message: "${params.userMessage.slice(0, 150)}"`,
      customData: {
        Type: 'In-Chat Auto Capture',
        ...attributionCustomData({
          conversationId: params.conversationId,
          source: 'chat',
        }),
      },
    });

    await Database.addNotification({
      assistantId: params.assistantId,
      title: 'New In-Chat Lead Captured',
      message: `Visitor provided contact information (${contact.email || contact.phone}) in conversation.`,
      type: 'lead_captured',
      metadata: {
        leadId: lead.id,
        conversationId: params.conversationId,
        email: lead.email,
        phone: lead.phone,
      },
    });

    return true;
  } catch (err) {
    console.warn('[AutoCaptureChatLead] Failed to capture in-chat lead:', err);
    return false;
  }
}
