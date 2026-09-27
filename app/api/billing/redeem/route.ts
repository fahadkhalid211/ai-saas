import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getAuthContext, requireRole } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimit, enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { grantFor, normalizeCode, redeemAccessCode, redeemBlockReason } from '@/lib/billing/access-codes';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

const REFUSED = 'That code is not valid, has expired or has been used up. Check it and try again.';

/** A workspace owner redeems an access code: free access to a plan, no card. Guesses are rate limited. */
async function POSTHandler(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx.authenticated || ctx.isMasterAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!requireRole(ctx, ['owner', 'admin', 'billing_manager'])) {
    return NextResponse.json({ error: 'Only an owner, admin or billing manager can use an access code.' }, { status: 403 });
  }
  const limited =
    (await enforceDistributedRateLimit(req, 'access-code', { windowMs: 60 * 60 * 1000, max: 10 })) ||
    (await enforceDistributedRateLimitByKey(`access-code-ws:${ctx.workspaceId}`, { windowMs: 60 * 60 * 1000, max: 10 }));
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const code = normalizeCode(body?.code);
  if (!code) return NextResponse.json({ error: 'Enter your access code.' }, { status: 400 });

  const ws = await Database.getWorkspaceBilling(ctx.workspaceId);
  const blocked = redeemBlockReason(ws);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 409 });

  const result = await redeemAccessCode(code, ctx.workspaceId);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason === 'already' ? 'Your workspace has already used this code.' : REFUSED }, { status: result.reason === 'already' ? 409 : 400 });
  }

  const grant = grantFor(result.code);
  await Database.updateWorkspaceBilling(ws.id, grant);
  await Database.addAuditLog({
    workspaceId: ws.id,
    actor: { id: ctx.memberId, name: ctx.role, ip: getClientIp(req) },
    action: 'billing.access_code_redeemed',
    targetType: 'workspace_billing',
    targetId: ws.id,
    details: { code: result.code.code, planId: result.code.planId, days: result.code.days },
  });
  return NextResponse.json({ success: true, planId: result.code.planId, days: result.code.days, endsAt: grant.trialEndsAt || null });
}

export const POST = logged(POSTHandler, { route: '/api/billing/redeem' });
