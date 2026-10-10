import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { logEvent } from '@/lib/logging/logger';
import { generateSessionToken, getSessionPayload, createSessionCookieHeader } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import {
  SUPPORT_ACCESS_MINUTES,
  MASTER_RETURN_COOKIE,
  supportSessionCookie,
  masterReturnCookie,
  clearMasterReturnCookie,
  readCookie,
} from '@/lib/security/support-access';

export const dynamic = 'force-dynamic';

/**
 * Master admin only: open a customer's workspace to troubleshoot it. The master's own session is put aside in a second
 * cookie and replaced by a 60-minute session as that workspace's owner, marked as support access. Written to the
 * customer's audit trail and to the system log.
 */
async function POSTHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const workspaceId = typeof body?.workspaceId === 'string' ? body.workspaceId.trim() : '';
  await Database.refreshState(0);
  const state = await Database.getState();
  const workspace = workspaceId && workspaceId !== '*' ? (state.workspaces || []).find((w) => w.id === workspaceId) : null;
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  const masterToken = readCookie(req, 'kortex_admin_session');
  if (!masterToken || !getSessionPayload(masterToken)?.isMasterAdmin) {
    // signed in with the master key in a header instead of the browser session: there is nothing to return to
    return NextResponse.json({ error: 'Sign in at /master in this browser first.' }, { status: 400 });
  }

  const people = (state.teamMembers || []).filter((m) => (m.workspaceId || 'default-workspace') === workspace.id);
  const owner = people.find((m) => m.role === 'owner') || people[0];
  const memberId = owner?.id || 'tm_owner';
  const token = generateSessionToken('owner', memberId, workspace.id, false, owner?.sessionVersion || 0, { ttlMs: SUPPORT_ACCESS_MINUTES * 60_000 });

  await Database.addAuditLog({
    workspaceId: workspace.id,
    actor: { id: 'master-admin', name: 'Crescelo Support', ip: getClientIp(req) },
    action: 'support.access_started',
    targetType: 'workspace',
    targetId: workspace.id,
    details: { minutes: SUPPORT_ACCESS_MINUTES },
  }).catch(() => undefined);
  logEvent({
    category: 'auth',
    event: 'master.support_access_started',
    message: `The platform owner opened the workspace "${workspace.name}" for support (${SUPPORT_ACCESS_MINUTES} minutes).`,
    meta: { targetWorkspaceId: workspace.id, workspaceName: workspace.name, ownerEmail: owner?.email || null },
  });

  const res = NextResponse.json({ success: true, workspace: { id: workspace.id, name: workspace.name }, minutes: SUPPORT_ACCESS_MINUTES });
  res.headers.append('Set-Cookie', supportSessionCookie(token));
  res.headers.append('Set-Cookie', masterReturnCookie(masterToken));
  return res;
}

/** Leave the customer's workspace and go back to the master session. Needs the master's own (signed) session in the return cookie. */
async function DELETEHandler(req: Request) {
  const masterToken = readCookie(req, MASTER_RETURN_COOKIE);
  const master = masterToken ? getSessionPayload(masterToken) : null;
  if (!masterToken || !master?.isMasterAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const current = readCookie(req, 'kortex_admin_session');
  const support = current ? getSessionPayload(current) : null;
  if (support?.supportAccess) {
    await Database.addAuditLog({
      workspaceId: support.workspaceId,
      actor: { id: 'master-admin', name: 'Crescelo Support', ip: getClientIp(req) },
      action: 'support.access_ended',
      targetType: 'workspace',
      targetId: support.workspaceId,
      details: {},
    }).catch(() => undefined);
    logEvent({
      category: 'auth',
      event: 'master.support_access_ended',
      message: 'The platform owner left the customer workspace and returned to the master account.',
      meta: { targetWorkspaceId: support.workspaceId },
    });
  }

  const res = NextResponse.json({ success: true });
  res.headers.append('Set-Cookie', createSessionCookieHeader(masterToken));
  res.headers.append('Set-Cookie', clearMasterReturnCookie());
  return res;
}

export const POST = logged(POSTHandler, { route: '/api/master/support-access' });
export const DELETE = logged(DELETEHandler, { route: '/api/master/support-access' });
