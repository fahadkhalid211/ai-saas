import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getAuthContext } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

/** Records that the signed-in member has been shown the product tour, so it opens by itself only on their first sign-in. */
async function POSTHandler(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (ctx.isMasterAdmin) return NextResponse.json({ success: true });
  const seenAt = await Database.markTourSeen(ctx.memberId);
  return NextResponse.json({ success: true, tourSeenAt: seenAt });
}

export const POST = logged(POSTHandler, { route: '/api/profile/tour' });
