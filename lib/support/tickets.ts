import crypto from 'crypto';
import { timingSafeStringEqual } from '@/lib/security/password';
import { getAdminKey, type AuthContext } from '@/lib/security/auth';
import {
  addMessage,
  getTicket,
  hashToken,
  insertTicket,
  listMessages,
  newRef,
  recentTicketsForEmail,
  staleResolved,
  updateTicketFields,
  type Ticket,
  type TicketMessage,
  type TicketPriority,
  type TicketStatus,
} from './store';
import { sendTicketEmail } from './emails';

export const CATEGORIES = ['Technical Support', 'Billing & Payments', 'Account & Access', 'Privacy request', 'Security', 'Sales & Enterprise', 'Feature request', 'General Support'] as const;
export const PRIORITIES: TicketPriority[] = ['low', 'normal', 'high', 'urgent'];
export const STATUSES: TicketStatus[] = ['open', 'pending', 'resolved', 'closed'];
export const REOPEN_DAYS = 7;
const MAX_MESSAGES = 200;

const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : '');
const oneLine = (v: unknown, max: number) => clean(v, max).replace(/\s+/g, ' ');

export class TicketError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export interface NewTicketInput {
  name: unknown;
  email: unknown;
  business?: unknown;
  category?: unknown;
  priority?: unknown;
  subject?: unknown;
  message: unknown;
  workspaceId?: string | null;
}

export function normalizePriority(v: unknown): TicketPriority {
  const p = typeof v === 'string' ? v.toLowerCase().trim() : '';
  return (PRIORITIES as string[]).includes(p) ? (p as TicketPriority) : 'normal';
}

export async function openTicket(input: NewTicketInput): Promise<{ ticket: Ticket; token: string }> {
  const name = oneLine(input.name, 100);
  const email = oneLine(input.email, 200).toLowerCase();
  const message = clean(input.message, 5000);
  if (!name) throw new TicketError('Name is required');
  if (!EMAIL_RE.test(email)) throw new TicketError('A valid email address is required');
  if (message.length < 10) throw new TicketError('Please describe your request in a little more detail (at least 10 characters).');

  // Each ticket sends a confirmation to the address typed in, so one address may only be used a few times an hour.
  if ((await recentTicketsForEmail(email, 60)) >= 3) {
    throw new TicketError('We already received several requests from this address. Please wait a while, or add to your existing ticket using the link in our e-mail.', 429);
  }

  const category = (CATEGORIES as readonly string[]).includes(String(input.category)) ? String(input.category) : 'General Support';
  const subject = oneLine(input.subject, 120) || oneLine(message, 80);
  let token = '';
  let ticket: Ticket | null = null;
  for (let attempt = 0; attempt < 5 && !ticket; attempt++) {
    const ref = newRef();
    token = deriveToken(ref);
    try {
      ticket = await insertTicket(
        { ref, workspaceId: input.workspaceId ?? null, name, email, business: oneLine(input.business, 120), category, priority: normalizePriority(input.priority), subject },
        hashToken(token),
        { body: message, authorName: name }
      );
    } catch (err: any) {
      if (err?.code !== '23505') throw err; // reference already used: draw another
    }
  }
  if (!ticket) throw new TicketError('Could not create the ticket. Please try again.', 500);

  await Promise.allSettled([sendTicketEmail('created', ticket, { token, message }), sendTicketEmail('staff_new', ticket, { message })]);
  return { ticket, token };
}

export type Access = 'requester' | 'workspace' | 'master';

/**
 * Who may see a ticket: the requester (holding the private link token), a signed-in member of the workspace that raised it,
 * or the platform owner. Anyone else gets the same "not found" as for a ticket that does not exist.
 */
export async function resolveAccess(ref: string, token: string | null, ctx: AuthContext | null): Promise<{ ticket: Ticket; access: Access } | null> {
  if (!/^CR-\d{6}$/.test(ref)) return null;
  const t = await getTicket(ref);
  if (!t) return null;
  const { tokenHash: _unused, ...ticket } = t;
  if (ctx?.authenticated && ctx.isMasterAdmin) return { ticket, access: 'master' };
  if (ctx?.authenticated && ticket.workspaceId && ctx.workspaceId === ticket.workspaceId) return { ticket, access: 'workspace' };
  if (token && timingSafeStringEqual(token, deriveToken(ref))) return { ticket, access: 'requester' };
  return null;
}

export async function threadFor(ticket: Ticket, access: Access): Promise<TicketMessage[]> {
  return listMessages(ticket.ref, access === 'master');
}

export async function customerReply(ticket: Ticket, body: unknown, authorName: string, token?: string): Promise<TicketMessage> {
  const text = clean(body, 5000);
  if (!text) throw new TicketError('Write a message first.');
  if (ticket.status === 'closed') throw new TicketError('This ticket is closed. Please open a new request from the contact page.', 409);
  if (ticket.messageCount >= MAX_MESSAGES) throw new TicketError('This ticket has reached its message limit. Please open a new request.', 409);
  const msg = await addMessage({ ticketRef: ticket.ref, author: 'customer', authorName: authorName || ticket.name, body: text }, { status: 'open' });
  await sendTicketEmail('staff_customer_reply', { ...ticket, status: 'open' }, { message: text });
  return msg;
}

export async function staffReply(ticket: Ticket, body: unknown, staffName: string, opts: { internal?: boolean; resolve?: boolean } = {}): Promise<TicketMessage> {
  const text = clean(body, 5000);
  if (!text) throw new TicketError('Write a message first.');
  if (ticket.messageCount >= MAX_MESSAGES) throw new TicketError('Message limit reached for this ticket.', 409);
  if (opts.internal) {
    return addMessage({ ticketRef: ticket.ref, author: 'staff', authorName: staffName, body: text, internal: true });
  }
  const status: TicketStatus = opts.resolve ? 'resolved' : 'pending';
  const msg = await addMessage({ ticketRef: ticket.ref, author: 'staff', authorName: staffName, body: text }, { status });
  const token = deriveToken(ticket.ref);
  await sendTicketEmail('staff_reply', ticket, { token, message: text, staffName });
  if (status === 'resolved') await sendTicketEmail('resolved', { ...ticket, status }, { token });
  return msg;
}

/**
 * The private link in every e-mail is derived from the reference and a server secret, so it can be sent again with each
 * message without being stored, and it cannot be guessed from the reference.
 */
export function deriveToken(ref: string): string {
  return crypto.createHmac('sha256', process.env.TICKET_LINK_SECRET || getAdminKey()).update(`ticket-link:${ref}`).digest('hex').slice(0, 48);
}

export async function changeStatus(ticket: Ticket, status: TicketStatus, priority?: TicketPriority): Promise<Ticket> {
  const before = ticket.status;
  const updated = await updateTicketFields(ticket.ref, { status, priority });
  if (!updated) throw new TicketError('Ticket not found', 404);
  if (status === 'resolved' && before !== 'resolved') await sendTicketEmail('resolved', updated, { token: deriveToken(ticket.ref) });
  return updated;
}

/** Daily job: close tickets that were resolved a week ago and never answered. */
export async function closeStaleResolved(): Promise<number> {
  const stale = await staleResolved(REOPEN_DAYS);
  let closed = 0;
  for (const t of stale) {
    const updated = await updateTicketFields(t.ref, { status: 'closed' });
    if (updated) {
      closed += 1;
      await sendTicketEmail('closed', updated);
    }
  }
  return closed;
}
