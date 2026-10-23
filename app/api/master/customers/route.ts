import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { trialInfo } from '@/lib/billing/trial';
import { getClientIp } from '@/lib/security/rate-limit';
import { deleteWorkspaceAndBilling } from '@/lib/platform/account-deletion';

export const dynamic = 'force-dynamic';

/**
 * Master admin only: every workspace on the platform with its people (name, e-mail, role, last sign-in), its assistants
 * and its plan status. Never returns passwords, API keys or any other secret.
 */
async function GETHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  try {
    await Database.refreshState(0); // the owner wants today's sign-ups, not this server's minute-old copy
    const state = await Database.getState();
    const members = state.teamMembers || [];
    const assistants = state.assistants || [];

    const customers = (state.workspaces || []).map((ws) => {
      const people = members
        .filter((m) => (m.workspaceId || 'default-workspace') === ws.id)
        .map((m) => ({
          id: m.id,
          name: m.name || '',
          email: m.email || '',
          role: m.role,
          status: m.status,
          createdAt: m.createdAt || null,
          lastLoginAt: m.lastLoginAt || null,
          twoFactorEnabled: Boolean(m.twoFactorEnabled),
          disabled: Boolean(m.disabledAt),
        }));
      const owner = people.find((p) => p.role === 'owner') || people[0] || null;
      const bots = assistants
        .filter((a) => (a.workspaceId || 'default-workspace') === ws.id)
        .map((a) => ({ id: a.id, name: a.name, provider: a.provider, model: a.modelName, hasOwnKey: Boolean(a.apiKeyEncrypted), createdAt: a.createdAt || null }));
      const trial = trialInfo(ws);
      const createdAt = people.map((p) => p.createdAt).filter(Boolean).sort()[0] || null;
      const lastActiveAt = people.map((p) => p.lastLoginAt).filter(Boolean).sort().pop() || null;
      return {
        id: ws.id,
        name: ws.name || 'Workspace',
        planId: ws.planId || 'starter',
        planName: ws.planName || 'Starter',
        status: trial.status,
        trialEndsAt: trial.endsAt,
        accessCode: ws.complimentaryCode || null,
        subscribed: Boolean(ws.billingSubscriptionId),
        disabled: Boolean(ws.disabledAt),
        disabledAt: ws.disabledAt || null,
        protectedWorkspace: ws.id === 'default-workspace',
        billingEmail: ws.billingEmail || null,
        createdAt,
        lastActiveAt,
        owner,
        members: people,
        assistants: bots,
      };
    });

    customers.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return NextResponse.json(
      { customers, totals: { workspaces: customers.length, members: members.length, assistants: assistants.length } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[Master] customers list failed:', (err as Error)?.message);
    return NextResponse.json({ error: 'Could not load the customers' }, { status: 500 });
  }
}

/**
 * Master admin only: disable or re-enable an account (a whole workspace, or one person in it).
 * A disabled person cannot sign in and their open sessions end at once; a disabled workspace also stops its assistants answering.
 * Nothing is deleted, so it can be undone.
 */
async function PATCHHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action === 'disable' ? true : body?.action === 'enable' ? false : null;
    const workspaceId = String(body?.workspaceId || '');
    const memberId = body?.memberId ? String(body.memberId) : '';
    if (action === null || !workspaceId) return NextResponse.json({ error: 'Say which account and whether to disable or enable it.' }, { status: 400 });

    await Database.refreshState(0);
    const state = await Database.getState();
    const ws = (state.workspaces || []).find((w) => w.id === workspaceId);
    if (!ws) return NextResponse.json({ error: 'That account no longer exists.' }, { status: 404 });

    if (memberId) {
      const person = (state.teamMembers || []).find((m) => m.id === memberId && (m.workspaceId || 'default-workspace') === workspaceId);
      if (!person) return NextResponse.json({ error: 'That person no longer exists.' }, { status: 404 });
      await Database.setMemberDisabled(memberId, action);
    } else {
      if (!(await Database.setWorkspaceDisabled(workspaceId, action))) {
        return NextResponse.json({ error: 'The built-in workspace cannot be disabled.' }, { status: 400 });
      }
    }

    await Database.addAuditLog({
      actor: { id: 'master-admin', name: 'Crescelo Support', ip: getClientIp(req) },
      action: action ? 'master.account_disabled' : 'master.account_enabled',
      targetType: memberId ? 'user' : 'workspace',
      targetId: memberId || workspaceId,
      details: { workspaceId },
      workspaceId,
    });
    return NextResponse.json({ success: true, disabled: action });
  } catch (err) {
    console.error('[Master] disable/enable failed:', (err as Error)?.message);
    return NextResponse.json({ error: 'Could not change the account' }, { status: 500 });
  }
}

/**
 * Master admin only: permanently delete an account and all its data (a whole workspace), or remove one team member.
 * Cannot be undone. The request must carry confirm: "DELETE" so a stray call cannot do it.
 */
async function DELETEHandler(req: Request) {
  const denied = await denyUnlessMaster(req);
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => ({}));
    const workspaceId = String(body?.workspaceId || '');
    const memberId = body?.memberId ? String(body.memberId) : '';
    if (!workspaceId) return NextResponse.json({ error: 'Say which account to delete.' }, { status: 400 });
    if (body?.confirm !== 'DELETE') return NextResponse.json({ error: 'Type DELETE to confirm.' }, { status: 400 });

    await Database.refreshState(0);
    const state = await Database.getState();
    const ws = (state.workspaces || []).find((w) => w.id === workspaceId);
    if (!ws) return NextResponse.json({ error: 'That account no longer exists.' }, { status: 404 });

    const ip = getClientIp(req);
    if (memberId) {
      const person = (state.teamMembers || []).find((m) => m.id === memberId && (m.workspaceId || 'default-workspace') === workspaceId);
      if (!person) return NextResponse.json({ error: 'That person no longer exists.' }, { status: 404 });
      if (person.role === 'owner') {
        return NextResponse.json({ error: 'That person owns the account. Delete the whole account instead, or disable them.' }, { status: 400 });
      }
      await Database.deleteMemberAccount(memberId);
      await Database.addAuditLog({
        actor: { id: 'master-admin', name: 'Crescelo Support', ip },
        action: 'master.member_deleted',
        targetType: 'user',
        targetId: memberId,
        details: { workspaceId },
        workspaceId,
      });
      return NextResponse.json({ success: true, deleted: 'member' });
    }

    const result = await deleteWorkspaceAndBilling(workspaceId);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    // The workspace's own log went with it, so the deletion is recorded with no name or e-mail, only the id.
    await Database.addAuditLog({
      actor: { id: 'master-admin', name: 'Crescelo Support', ip },
      action: 'master.workspace_deleted',
      targetType: 'workspace',
      targetId: workspaceId,
      details: { assistants: result.assistants, people: result.people },
    });
    return NextResponse.json({ success: true, deleted: 'workspace', assistants: result.assistants, people: result.people });
  } catch (err) {
    console.error('[Master] delete failed:', (err as Error)?.message);
    return NextResponse.json({ error: 'Could not delete the account' }, { status: 500 });
  }
}

export const GET = logged(GETHandler, { route: '/api/master/customers', sample: 0.1 });
export const PATCH = logged(PATCHHandler, { route: '/api/master/customers' });
export const DELETE = logged(DELETEHandler, { route: '/api/master/customers' });
