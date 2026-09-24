import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/security/auth';

/**
 * The gate for everything under /api/master/logs. Returns a response to send when the caller is NOT the platform owner,
 * or null when they are. Anonymous callers get 401; anyone signed in who is not the master admin gets 404, so a customer
 * cannot even tell these endpoints exist. Enforced here on the server; hiding the dashboard tab is only a convenience.
 */
export async function denyUnlessMaster(req: Request): Promise<NextResponse | null> {
  const ctx = await getAuthContext(req);
  if (!ctx.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ctx.isMasterAdmin) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return null;
}
