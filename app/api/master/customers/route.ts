import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { denyUnlessMaster } from '@/lib/logging/access';
import { logged } from '@/lib/logging/route';
import { trialInfo } from '@/lib/billing/trial';

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
        subscribed: Boolean(ws.stripeSubscriptionId),
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

export const GET = logged(GETHandler, { route: '/api/master/customers', sample: 0.1 });
