import { NextResponse } from 'next/server';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { deleteAccessCode, setAccessCodeActive } from '@/lib/billing/access-codes';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ code: string }> };

/** Platform owner only: switch a code on or off. Workspaces that already used it keep their access. */
async function PATCHHandler(req: Request, { params }: Ctx) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  const { code } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body?.active !== 'boolean') return NextResponse.json({ error: 'Say whether the code should be active.' }, { status: 400 });
  const ok = await setAccessCodeActive(decodeURIComponent(code), body.active);
  return ok ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Code not found' }, { status: 404 });
}

/** Platform owner only: delete a code. Workspaces that already used it keep their access. */
async function DELETEHandler(req: Request, { params }: Ctx) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  const { code } = await params;
  const ok = await deleteAccessCode(decodeURIComponent(code));
  return ok ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Code not found' }, { status: 404 });
}

export const PATCH = logged(PATCHHandler, { route: '/api/master/access-codes/[code]' });
export const DELETE = logged(DELETEHandler, { route: '/api/master/access-codes/[code]' });
