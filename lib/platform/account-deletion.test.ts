import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database } from '../db';
import { generateSessionToken, getAuthContext } from '../security/auth';
import { DELETE as deleteProfile } from '../../app/api/profile/route';
import { PATCH as masterPatch, DELETE as masterDelete } from '../../app/api/master/customers/route';
import { GET as twoFactorGet, POST as twoFactorPost } from '../../app/api/auth/2fa/route';
import { serviceBlocked } from '../billing/trial';

const tag = Math.random().toString(36).slice(2, 8);
const PASSWORD = 'a-good-password';

beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());
beforeEach(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));

const ip = () => `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

async function account(label: string) {
  const email = `${label}-${tag}@example.com`;
  const t = await Database.createTenantWorkspace({ businessName: `Delete ${label} ${tag}`, ownerEmail: email, password: PASSWORD });
  await Database.updateWorkspaceBilling(t.workspace.id, { requiresSubscription: false });
  await Database.createKnowledgeSource({ assistantId: t.assistant.id, title: 'Price list', type: 'txt' });
  await Database.saveLead({ assistantId: t.assistant.id, email: `lead-${label}-${tag}@example.com`, name: 'A Lead' });
  const cookie = `kortex_admin_session=${generateSessionToken('owner', t.owner.id, t.workspace.id)}`;
  return { email, ws: t.workspace.id, assistant: t.assistant.id, owner: t.owner.id, cookie };
}

const call = (url: string, method: string, cookie: string, body?: unknown) =>
  new NextRequest(`http://localhost${url}`, { method, headers: { 'content-type': 'application/json', cookie, 'x-forwarded-for': ip() }, body: body === undefined ? undefined : JSON.stringify(body) });

const masterCookie = () => `kortex_admin_session=${generateSessionToken('admin', 'master-admin', '*', true)}`;

describe('an owner deleting their own account', () => {
  it('needs the e-mail typed exactly and the right password, and deletes nothing otherwise', async () => {
    const a = await account('own1');
    const wrongEmail = await deleteProfile(call('/api/profile', 'DELETE', a.cookie, { confirmEmail: 'someone@else.com', password: PASSWORD }));
    expect(wrongEmail.status).toBe(400);
    const noPassword = await deleteProfile(call('/api/profile', 'DELETE', a.cookie, { confirmEmail: a.email }));
    expect(noPassword.status).toBe(400);
    const badPassword = await deleteProfile(call('/api/profile', 'DELETE', a.cookie, { confirmEmail: a.email, password: 'not-it' }));
    expect(badPassword.status).toBe(400);
    expect(await Database.getAssistantById(a.assistant)).not.toBeNull();
  });

  it('removes the workspace and every document, lead, assistant and person in it, and signs them out', async () => {
    const a = await account('own2');
    const other = await account('own2-other'); // someone else's account must be untouched
    const res = await deleteProfile(call('/api/profile', 'DELETE', a.cookie, { confirmEmail: a.email.toUpperCase(), password: PASSWORD }));
    expect(res.status).toBe(200);
    expect((await res.json()).deleted).toBe('workspace');
    expect(res.headers.get('set-cookie') || '').toMatch(/kortex_admin_session=;|Max-Age=0/i);

    const state = await Database.getState();
    expect(state.workspaces.some((w: any) => w.id === a.ws)).toBe(false);
    expect(state.assistants.some((x) => x.id === a.assistant)).toBe(false);
    expect(state.knowledgeSources.some((k) => k.assistantId === a.assistant)).toBe(false);
    expect(state.leads.some((l) => l.assistantId === a.assistant)).toBe(false);
    expect((state.teamMembers || []).some((m) => m.workspaceId === a.ws)).toBe(false);

    expect(state.workspaces.some((w: any) => w.id === other.ws)).toBe(true);
    expect(state.assistants.some((x) => x.id === other.assistant)).toBe(true);
    expect(state.leads.some((l) => l.assistantId === other.assistant)).toBe(true);

    expect((await getAuthContext(call('/api/profile', 'GET', a.cookie))).authenticated).toBe(false);
  });

  it('lets the same e-mail address register again afterwards', async () => {
    const a = await account('own3');
    await deleteProfile(call('/api/profile', 'DELETE', a.cookie, { confirmEmail: a.email, password: PASSWORD }));
    expect(await Database.emailBelongsToConfirmedAccount(a.email)).toBe(false);
  });
});

describe('a team member deleting their own account', () => {
  it('removes only their own sign-in, not the workspace', async () => {
    const a = await account('mem1');
    const member = await Database.addTeamMember({ workspaceId: a.ws, name: 'Helper', email: `helper-${tag}@example.com`, password: PASSWORD, role: 'viewer', status: 'active' });
    const cookie = `kortex_admin_session=${generateSessionToken('viewer', member.id, a.ws, undefined, member.sessionVersion || 0)}`;
    const res = await deleteProfile(call('/api/profile', 'DELETE', cookie, { confirmEmail: member.email, password: PASSWORD }));
    expect(res.status).toBe(200);
    expect((await res.json()).deleted).toBe('member');
    const state = await Database.getState();
    expect((state.teamMembers || []).some((m) => m.id === member.id)).toBe(false);
    expect(state.workspaces.some((w: any) => w.id === a.ws)).toBe(true);
    expect(state.assistants.some((x) => x.id === a.assistant)).toBe(true);
  });
});

describe('the platform admin', () => {
  it('cannot disable or delete without being the admin', async () => {
    const a = await account('adm0');
    const asOwner = await masterPatch(call('/api/master/customers', 'PATCH', a.cookie, { workspaceId: a.ws, action: 'disable' }));
    expect([401, 403, 404]).toContain(asOwner.status);
    const del = await masterDelete(call('/api/master/customers', 'DELETE', a.cookie, { workspaceId: a.ws, confirm: 'DELETE' }));
    expect([401, 403, 404]).toContain(del.status);
    expect(await Database.getAssistantById(a.assistant)).not.toBeNull();
  });

  it('disables an account: nobody can use their session, the assistants stop answering, and enabling brings it back', async () => {
    const a = await account('adm1');
    expect((await getAuthContext(call('/api/profile', 'GET', a.cookie))).authenticated).toBe(true);

    const off = await masterPatch(call('/api/master/customers', 'PATCH', masterCookie(), { workspaceId: a.ws, action: 'disable' }));
    expect(off.status).toBe(200);
    expect((await getAuthContext(call('/api/profile', 'GET', a.cookie))).authenticated).toBe(false);
    expect(serviceBlocked(await Database.getWorkspaceBilling(a.ws))).toBe(true);
    expect(await Database.isAccountDisabled({ id: a.owner, workspaceId: a.ws })).toBe(true);

    const on = await masterPatch(call('/api/master/customers', 'PATCH', masterCookie(), { workspaceId: a.ws, action: 'enable' }));
    expect(on.status).toBe(200);
    expect((await getAuthContext(call('/api/profile', 'GET', a.cookie))).authenticated).toBe(true);
    expect(await Database.isAccountDisabled({ id: a.owner, workspaceId: a.ws })).toBe(false);
  });

  it('disables one person without touching the rest of the account', async () => {
    const a = await account('adm2');
    const member = await Database.addTeamMember({ workspaceId: a.ws, name: 'Helper', email: `h2-${tag}@example.com`, password: PASSWORD, role: 'viewer', status: 'active' });
    const cookie = `kortex_admin_session=${generateSessionToken('viewer', member.id, a.ws, undefined, member.sessionVersion || 0)}`;
    expect((await getAuthContext(call('/api/profile', 'GET', cookie))).authenticated).toBe(true);
    const res = await masterPatch(call('/api/master/customers', 'PATCH', masterCookie(), { workspaceId: a.ws, memberId: member.id, action: 'disable' }));
    expect(res.status).toBe(200);
    expect((await getAuthContext(call('/api/profile', 'GET', cookie))).authenticated).toBe(false);
    expect((await getAuthContext(call('/api/profile', 'GET', a.cookie))).authenticated).toBe(true);
  });

  it('deletes an account for good, but only when DELETE is confirmed', async () => {
    const a = await account('adm3');
    const unconfirmed = await masterDelete(call('/api/master/customers', 'DELETE', masterCookie(), { workspaceId: a.ws }));
    expect(unconfirmed.status).toBe(400);
    expect(await Database.getAssistantById(a.assistant)).not.toBeNull();

    const res = await masterDelete(call('/api/master/customers', 'DELETE', masterCookie(), { workspaceId: a.ws, confirm: 'DELETE' }));
    expect(res.status).toBe(200);
    const state = await Database.getState();
    expect(state.workspaces.some((w: any) => w.id === a.ws)).toBe(false);
    expect(state.leads.some((l) => l.assistantId === a.assistant)).toBe(false);
  });

  it('will not delete the built-in workspace or an owner as a "person"', async () => {
    const a = await account('adm4');
    const builtIn = await masterDelete(call('/api/master/customers', 'DELETE', masterCookie(), { workspaceId: 'default-workspace', confirm: 'DELETE' }));
    expect(builtIn.status).toBeGreaterThanOrEqual(400);
    const owner = await masterDelete(call('/api/master/customers', 'DELETE', masterCookie(), { workspaceId: a.ws, memberId: a.owner, confirm: 'DELETE' }));
    expect(owner.status).toBe(400);
    expect(await Database.getAssistantById(a.assistant)).not.toBeNull();
  });
});

describe('two-factor set-up', () => {
  it('is refused while it is switched off', async () => {
    const a = await account('tfa1');
    const setup = await twoFactorGet(call('/api/auth/2fa?action=setup', 'GET', a.cookie));
    expect(setup.status).toBe(403);
    const enable = await twoFactorPost(call('/api/auth/2fa', 'POST', a.cookie, { action: 'enable', secret: 'ABCDEFGHIJKLMNOP', code: '123456' }));
    expect(enable.status).toBe(403);
    expect(Boolean((await Database.getTeamMemberById(a.owner, a.ws))?.twoFactorEnabled)).toBe(false);
  });
});
