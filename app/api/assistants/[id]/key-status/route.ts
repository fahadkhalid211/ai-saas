import { NextResponse } from 'next/server';
import { withAdminAuth, getAuthContext, requireWorkspaceAssistant } from '@/lib/security/auth';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { healthOf } from '@/lib/ai/key-health';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

/**
 * Whether the AI key this assistant answers with works. The dashboard asks every few seconds while it is open: a recent verdict is
 * returned as it is, an old one is checked with the provider first (a free "list models" request), so a key that breaks (revoked,
 * out of credit, rotated) shows up within about a minute even if no visitor has chatted yet. `?force=1` always asks the provider.
 */
const GETHandler = withAdminAuth(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const limited = enforceRateLimit(req, 'key-status', { windowMs: 60 * 1000, max: 120 });
  if (limited.errorResponse) return limited.errorResponse;

  const ctx = await getAuthContext(req);
  const { id } = await params;
  const assistant = await requireWorkspaceAssistant(ctx, id);
  if (!assistant) return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });

  const force = new URL(req.url).searchParams.get('force') === '1';
  if (force) {
    // a forced check is a real request to the provider: not more than a handful a minute for one assistant
    const busy = await enforceDistributedRateLimitByKey(`key-status-force:${assistant.id}`, { windowMs: 60 * 1000, max: 10 });
    if (busy) return busy;
  }

  const health = await healthOf(assistant, { force });
  return NextResponse.json({ assistantId: assistant.id, ...health }, { headers: { 'Cache-Control': 'no-store' } });
});

export const GET = logged(GETHandler, { route: '/api/assistants/[id]/key-status' });
