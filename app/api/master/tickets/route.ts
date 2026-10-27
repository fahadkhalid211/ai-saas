import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { listTickets, ticketCounts, type TicketPriority, type TicketStatus } from '@/lib/support/store';
import { PRIORITIES, STATUSES, openTicket, TicketError } from '@/lib/support/tickets';

export const dynamic = 'force-dynamic';

/** Platform owner only: the support inbox. Query: status (open|pending|resolved|closed|active|all), priority, q, offset. */
async function GETHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  const sp = new URL(req.url).searchParams;
  const status = sp.get('status') || 'active';
  const priority = sp.get('priority') || '';
  const result = await listTickets({
    status: status === 'all' ? undefined : status === 'active' || (STATUSES as string[]).includes(status) ? (status as TicketStatus | 'active') : 'active',
    priority: (PRIORITIES as string[]).includes(priority) ? (priority as TicketPriority) : undefined,
    q: (sp.get('q') || '').slice(0, 100) || undefined,
    limit: 50,
    offset: Number(sp.get('offset')) || 0,
  });
  return NextResponse.json({ ...result, counts: await ticketCounts() }, { headers: { 'Cache-Control': 'no-store' } });
}

/** Platform owner / master admin can create a new support ticket */
async function POSTHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => ({}));
    const { ticket } = await openTicket({
      name: body.name || 'Platform Administrator',
      email: body.email || process.env.SUPPORT_EMAIL || 'support@crescelo.com',
      business: body.business || 'Platform Ops',
      category: body.category || 'General Support',
      priority: body.priority || 'normal',
      subject: body.subject || body.message?.slice(0, 80),
      message: body.message,
      workspaceId: body.workspaceId || null,
    });
    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    if (err instanceof TicketError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: err?.message || 'Could not create ticket' }, { status: 500 });
  }
}

export const GET = logged(GETHandler, { route: '/api/master/tickets', sample: 0.1 });
export const POST = logged(POSTHandler, { route: '/api/master/tickets' });
