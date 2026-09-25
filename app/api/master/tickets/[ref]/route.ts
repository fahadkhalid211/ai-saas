import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { getAuthContext } from '@/lib/security/auth';
import { Database } from '@/lib/db';
import { logged } from '@/lib/logging/route';
import { changeStatus, deriveToken, PRIORITIES, resolveAccess, staffReply, STATUSES, threadFor, TicketError } from '@/lib/support/tickets';
import { getMasterEmail } from '@/lib/security/master';
import { getClientIp } from '@/lib/security/rate-limit';
import type { TicketPriority, TicketStatus } from '@/lib/support/store';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ ref: string }> };

async function GETHandler(req: Request, { params }: Ctx) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  const { ref } = await params;
  const found = await resolveAccess(ref, null, await getAuthContext(req));
  if (!found) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  const messages = await threadFor(found.ticket, 'master');
  return NextResponse.json(
    { ticket: found.ticket, messages, customerLink: `/support/ticket?ref=${found.ticket.ref}&t=${deriveToken(found.ticket.ref)}` },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

/** Reply to the requester (e-mailed), leave an internal note, and/or change status or priority. */
async function POSTHandler(req: Request, { params }: Ctx) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  try {
    const { ref } = await params;
    const ctx = await getAuthContext(req);
    const found = await resolveAccess(ref, null, ctx);
    if (!found) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    const body = await req.json().catch(() => ({}));

    let ticket = found.ticket;
    if (typeof body.message === 'string' && body.message.trim()) {
      await staffReply(ticket, body.message, 'Crescelo Support', { internal: body.internal === true, resolve: body.resolve === true });
      ticket = (await resolveAccess(ref, null, ctx))!.ticket;
    }
    const status = typeof body.status === 'string' && (STATUSES as string[]).includes(body.status) ? (body.status as TicketStatus) : undefined;
    const priority = typeof body.priority === 'string' && (PRIORITIES as string[]).includes(body.priority) ? (body.priority as TicketPriority) : undefined;
    if ((status && status !== ticket.status) || (priority && priority !== ticket.priority)) {
      ticket = await changeStatus(ticket, status || ticket.status, priority);
    }

    await Database.addAuditLog({
      actor: { id: 'master-admin', name: 'Master Admin', email: getMasterEmail(), ip: getClientIp(req) },
      action: 'support.ticket_updated',
      targetType: 'ticket',
      targetId: ref,
      details: { replied: Boolean(body.message), internal: body.internal === true, status: ticket.status, priority: ticket.priority },
    }).catch(() => undefined);

    return NextResponse.json({ success: true, ticket, messages: await threadFor(ticket, 'master') });
  } catch (err: any) {
    if (err instanceof TicketError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: 'Could not update the ticket.' }, { status: 500 });
  }
}

export const GET = logged(GETHandler, { route: '/api/master/tickets/[ref]', sample: 0.1 });
export const POST = logged(POSTHandler, { route: '/api/master/tickets/[ref]' });
