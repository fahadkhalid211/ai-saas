import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { createAccessCode, listAccessCodes } from '@/lib/billing/access-codes';
import { getMasterEmail } from '@/lib/security/master';

export const dynamic = 'force-dynamic';

/** Platform owner only: every access code with how often it has been used and by which workspaces. */
async function GETHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  return NextResponse.json({ codes: await listAccessCodes() }, { headers: { 'Cache-Control': 'no-store' } });
}

/** Platform owner only: make a code. Leave the code blank for a random one. */
async function POSTHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  try {
    const code = await createAccessCode(body || {}, getMasterEmail());
    return NextResponse.json({ code });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export const GET = logged(GETHandler, { route: '/api/master/access-codes', sample: 0.1 });
export const POST = logged(POSTHandler, { route: '/api/master/access-codes' });
