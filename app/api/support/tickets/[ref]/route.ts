import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { logged } from '@/lib/logging/route';
import { changeStatus, customerReply, resolveAccess, threadFor, TicketError } from '@/lib/support/tickets';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ ref: string }> };

const publicTicket = (t: any) => ({
  ref: t.ref,
  subject: t.subject,
  category: t.category,
  priority: t.priority,
  status: t.status,
  name: t.name,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
  messageCount: t.messageCount,
});

/** A ticket and its conversation, for the requester (private link) or a member of the workspace that raised it. */
async function GETHandler(req: Request, { params }: Ctx) {
  const { ref } = await params;
  const token = new URL(req.url).searchParams.get('t');
  const limited = await enforceDistributedRateLimitByKey(`ticket-view:${getClientIp(req)}`, { windowMs: 60 * 1000, max: 40 });
  if (limited) return limited;
  const found = await resolveAccess(ref, token, await getAuthContext(req));
  // the platform owner uses the inbox, which also shows internal notes; this route only ever serves what a requester may see
  if (!found || found.access === 'master') return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  const messages = (await threadFor(found.ticket, found.access)).map((m) => ({
    id: m.id,
    author: m.author,
    authorName: m.author === 'staff' ? 'Crescelo Support' : m.authorName,
    body: m.body,
    createdAt: m.createdAt,
  }));
  return NextResponse.json({ ticket: publicTicket(found.ticket), messages, canReply: found.ticket.status !== 'closed' });
}

/** Adds a reply from the requester, or closes the ticket when asked. */
async function POSTHandler(req: Request, { params }: Ctx) {
  try {
    const { ref } = await params;
    const token = new URL(req.url).searchParams.get('t');
    const limited = await enforceDistributedRateLimitByKey(`ticket-reply:${getClientIp(req)}`, { windowMs: 10 * 60 * 1000, max: 20 });
    if (limited) return limited;
    const found = await resolveAccess(ref, token, await getAuthContext(req));
    if (!found || found.access === 'master') return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    if (body.action === 'close') {
      await changeStatus(found.ticket, 'closed');
      return NextResponse.json({ success: true });
    }
    const msg = await customerReply(found.ticket, body.message, found.ticket.name);
    return NextResponse.json({ success: true, message: { id: msg.id, createdAt: msg.createdAt } });
  } catch (err: any) {
    if (err instanceof TicketError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: 'Could not send your reply.' }, { status: 500 });
  }
}

export const GET = logged(GETHandler, { route: '/api/support/tickets/[ref]', sample: 0.2 });
export const POST = logged(POSTHandler, { route: '/api/support/tickets/[ref]' });
