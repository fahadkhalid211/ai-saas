import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/security/auth';
import { Database } from '@/lib/db';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { logged } from '@/lib/logging/route';
import { listTickets } from '@/lib/support/store';
import { CATEGORIES, openTicket, TicketError } from '@/lib/support/tickets';

export const dynamic = 'force-dynamic';

/** A signed-in customer's tickets: everything raised from their workspace. */
async function GETHandler(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (ctx.isMasterAdmin) return NextResponse.json({ error: 'Use the support inbox.' }, { status: 400 });
  const { searchParams } = new URL(req.url);
  const result = await listTickets({ workspaceId: ctx.workspaceId, limit: 50, offset: Number(searchParams.get('offset')) || 0 });
  return NextResponse.json({ ...result, categories: CATEGORIES });
}

/** Opens a ticket for the signed-in member (name and e-mail come from the account, so they cannot be spoofed). */
async function POSTHandler(req: Request) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated || ctx.isMasterAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const limited = await enforceDistributedRateLimitByKey(`ticket-create:${ctx.memberId}`, { windowMs: 60 * 60 * 1000, max: 10 });
    if (limited) return limited;

    const member = await Database.findTeamMember(ctx.memberId);
    if (!member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const workspace = await Database.getWorkspaceBilling(ctx.workspaceId);
    const body = await req.json().catch(() => ({}));
    const { ticket } = await openTicket({
      name: member.name,
      email: member.email,
      business: workspace?.name || '',
      category: body.category,
      priority: body.priority,
      subject: body.subject,
      message: body.message,
      workspaceId: ctx.workspaceId,
    });
    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    if (err instanceof TicketError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: 'Could not create the ticket.' }, { status: 500 });
  }
}

export const GET = logged(GETHandler, { route: '/api/support/tickets', sample: 0.2 });
export const POST = logged(POSTHandler, { route: '/api/support/tickets' });
