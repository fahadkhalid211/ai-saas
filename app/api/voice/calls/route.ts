import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getAuthContext, requireWorkspaceAssistant, withAdminAuth } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

/** Dashboard: recent phone calls for one assistant (admin session required, workspace-scoped). */
export const GET = withAdminAuth(async (req: Request) => {
  const ctx = await getAuthContext(req);
  const assistantId = new URL(req.url).searchParams.get('assistantId');
  if (!assistantId) return NextResponse.json({ error: 'assistantId is required' }, { status: 400 });

  const assistant = await requireWorkspaceAssistant(ctx, assistantId);
  if (!assistant) return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });

  const calls = (await Database.getCalls(assistantId, ctx.workspaceId)).slice(0, 25);
  return NextResponse.json({ calls });
});
