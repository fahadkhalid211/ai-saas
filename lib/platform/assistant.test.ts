import { describe, it, expect } from 'vitest';
import { Database } from '@/lib/db';
import { generateSessionToken } from '@/lib/security/auth';

// no local model server should be reachable in tests: the answer must come from the guides
process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:9/v1';

async function tenant(name: string) {
  const t = await Database.createTenantWorkspace({ businessName: name, ownerEmail: `${name.toLowerCase().replace(/\W+/g, '')}-${Math.random().toString(36).slice(2, 7)}@example.com`, password: 'Passw0rd!Test1' } as any);
  const token = generateSessionToken(t.owner.role, t.owner.id, t.workspace.id, undefined, (t.owner as any).sessionVersion || 0);
  return { ...t, token };
}
const ask = async (token: string | null, message: string) => {
  const { POST } = await import('../../app/api/platform-assistant/route');
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  return POST(new Request('http://localhost/api/platform-assistant', { method: 'POST', headers, body: JSON.stringify({ message }) }));
};

describe('dashboard assistant API', () => {
  it('needs a signed-in user', async () => {
    expect((await ask(null, 'what plan am I on?')).status).toBe(401);
  }, 30000);

  it('tells each person about their own workspace, not someone else’s', async () => {
    const a = await tenant('Alpha Salon');
    const b = await tenant('Beta Clinic');
    const ra = await (await ask(a.token, 'what plan am I on?')).json();
    const rb = await (await ask(b.token, 'what plan am I on?')).json();
    expect(ra.source).toBe('account');
    expect(ra.reply).toContain('Alpha Salon');
    expect(ra.reply).not.toContain('Beta Clinic');
    expect(rb.reply).toContain('Beta Clinic');
  }, 30000);

  it('proposes a plan change with a confirm action and changes nothing by itself', async () => {
    const a = await tenant('Gamma Studio');
    await Database.updateWorkspaceBilling(a.workspace.id, { billingSubscriptionId: 'sub_test', subscriptionStatus: 'active' } as any);
    const before = await Database.getWorkspaceBilling(a.workspace.id);
    const r = await (await ask(a.token, 'upgrade to scale annually')).json();
    expect(r.actions[0]).toMatchObject({ type: 'change_plan', planId: 'scale', interval: 'annual' });
    expect(r.reply).toContain('Confirm');
    const after = await Database.getWorkspaceBilling(a.workspace.id);
    expect(after.planId).toBe(before.planId);
    expect(after.billingInterval).toBe(before.billingInterval);
  }, 30000);

  it('refuses a plan change for a member who cannot manage billing', async () => {
    const a = await tenant('Delta Gym');
    const viewer = await Database.addTeamMember({ workspaceId: a.workspace.id, name: 'View', email: `v-${Math.random().toString(36).slice(2, 7)}@example.com`, role: 'viewer', status: 'active' } as any);
    const token = generateSessionToken('viewer', viewer.id, a.workspace.id, undefined, 0);
    const r = await (await ask(token, 'upgrade my plan')).json();
    expect(r.actions).toEqual([]);
    expect(r.reply).toMatch(/owner, admin or billing manager/i);
  }, 30000);

  it('answers how-to questions from the guides when no model is available', async () => {
    const a = await tenant('Epsilon Spa');
    const r = await (await ask(a.token, 'how do I connect openai')).json();
    expect(r.reply).toMatch(/platform\.openai\.com|OpenAI/);
  }, 60000);
});
