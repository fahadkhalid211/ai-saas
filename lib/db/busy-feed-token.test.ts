import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database } from '../db';
import { generateCalendarFeedToken, generateSessionToken } from '../security/auth';
import { GET as assistantGet, PUT as assistantPut } from '../../app/api/assistants/[id]/route';
import { GET as assistantsList, POST as assistantsPost } from '../../app/api/assistants/route';
import { GET as widgetConfig } from '../../app/api/widget/[id]/config/route';

/**
 * The busy-only feed token (AssistantData.busyFeedToken) is a server-only secret. It is a different thing from the
 * computed `calendarFeedToken` the assistant API returns for the owner's own ICS feed: a dashboard save sends that
 * computed value back, and it must never end up in (or be accepted from) the stored busy token.
 * JSON mode, every database and cache URL blanked.
 */

const tag = Math.random().toString(36).slice(2, 8);
const DB_ENV = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());
beforeEach(() => {
  for (const k of DB_ENV) vi.stubEnv(k, '');
  vi.stubEnv('DB_RELATIONAL_MODE', '');
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
});
afterEach(() => vi.restoreAllMocks());

const TOKEN = 'busy_' + 'k7Jd93hFq2LmZx8Rw4Ty';

async function owner(label: string) {
  const t = await Database.createTenantWorkspace({ businessName: `Busy ${label} ${tag}`, ownerEmail: `${label}-${tag}@example.com`, password: 'a-good-password' });
  await Database.updateWorkspaceBilling(t.workspace.id, { requiresSubscription: false });
  const cookie = `kortex_admin_session=${generateSessionToken('owner', t.owner.id, t.workspace.id)}`;
  return { id: t.assistant.id, ws: t.workspace.id, cookie };
}

const headers = (cookie: string) => ({ 'content-type': 'application/json', cookie, 'x-forwarded-for': `10.7.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });
const ctxOf = (id: string) => ({ params: Promise.resolve({ id }) });

async function put(o: { id: string; cookie: string }, body: Record<string, unknown>) {
  const res = await assistantPut(new NextRequest(`http://localhost/api/assistants/${o.id}`, { method: 'PUT', headers: headers(o.cookie), body: JSON.stringify(body) }), ctxOf(o.id));
  return { status: res.status, json: await res.json() };
}

const stored = async (id: string) => (await Database.getAssistantById(id))?.busyFeedToken;

describe('busyFeedToken is server-only', () => {
  it('setBusyFeedToken is the writer, scoped to one assistant, and refuses short tokens', async () => {
    const o = await owner('writer');
    const other = await owner('writer-other');
    expect(await Database.setBusyFeedToken(o.id, TOKEN)).toBe(true);
    expect(await stored(o.id)).toBe(TOKEN);
    expect(await stored(other.id)).toBeUndefined();
    expect(await Database.setBusyFeedToken('ast_missing', TOKEN)).toBe(false);
    await expect(Database.setBusyFeedToken(o.id, 'short')).rejects.toThrow();
    expect(await stored(o.id)).toBe(TOKEN);
  });

  it('Database.updateAssistant ignores it', async () => {
    const o = await owner('update');
    await Database.setBusyFeedToken(o.id, TOKEN);
    const updated = await Database.updateAssistant(o.id, { name: 'Renamed', busyFeedToken: 'attacker_chosen_token_value_123' } as any);
    expect(updated?.name).toBe('Renamed');
    expect(await stored(o.id)).toBe(TOKEN);

    const fresh = await owner('update-fresh');
    await Database.updateAssistant(fresh.id, { busyFeedToken: 'attacker_chosen_token_value_123' } as any);
    expect(await stored(fresh.id)).toBeUndefined();
  });

  it('a save through the assistant route does not change it, and the response does not carry it', async () => {
    const o = await owner('put');
    await Database.setBusyFeedToken(o.id, TOKEN);
    const res = await put(o, { name: 'Saved', busyFeedToken: 'attacker_chosen_token_value_123' });
    expect(res.status).toBe(200);
    expect(res.json.assistant.name).toBe('Saved');
    expect(await stored(o.id)).toBe(TOKEN);
    expect(JSON.stringify(res.json)).not.toContain(TOKEN);
    expect(res.json.assistant.busyFeedToken).toBeUndefined();
  });

  it('the dashboard sending the whole record back (with its computed calendarFeedToken) stores nothing in the busy token', async () => {
    const o = await owner('roundtrip');
    const before = await assistantGet(new NextRequest(`http://localhost/api/assistants/${o.id}`, { headers: headers(o.cookie) }), ctxOf(o.id));
    const record = (await before.json()).assistant;
    expect(record.calendarFeedToken).toBe(generateCalendarFeedToken(o.id)); // the existing computed field is unchanged
    const res = await put(o, record);
    expect(res.status).toBe(200);
    expect(res.json.assistant.calendarFeedToken).toBe(generateCalendarFeedToken(o.id));
    expect(await stored(o.id)).toBeUndefined();
  });

  it('lookup by the computed calendarFeedToken (the old HMAC) finds nothing', async () => {
    const o = await owner('hmac');
    await put(o, { name: 'x', calendarFeedToken: generateCalendarFeedToken(o.id) });
    expect(await Database.getAssistantByBusyFeedToken(generateCalendarFeedToken(o.id))).toBeNull();
    const mine = 'busy_unique_' + Math.random().toString(36).slice(2, 18); // tokens are unique per assistant; other tests keep theirs in the same state
    await Database.setBusyFeedToken(o.id, mine);
    expect((await Database.getAssistantByBusyFeedToken(mine))?.id).toBe(o.id);
    expect(await Database.getAssistantByBusyFeedToken(generateCalendarFeedToken(o.id))).toBeNull();
  });

  it('the list and single GET do not return it, but still return the computed calendarFeedToken', async () => {
    const o = await owner('get');
    await Database.setBusyFeedToken(o.id, TOKEN);
    const one = await assistantGet(new NextRequest(`http://localhost/api/assistants/${o.id}`, { headers: headers(o.cookie) }), ctxOf(o.id));
    const oneJson = await one.json();
    expect(JSON.stringify(oneJson)).not.toContain(TOKEN);
    expect(oneJson.assistant.calendarFeedToken).toBe(generateCalendarFeedToken(o.id));

    const list = await assistantsList(new NextRequest('http://localhost/api/assistants', { headers: headers(o.cookie) }));
    const listJson = await list.json();
    expect(JSON.stringify(listJson)).not.toContain(TOKEN);
    expect(listJson.assistants.find((a: any) => a.id === o.id).calendarFeedToken).toBe(generateCalendarFeedToken(o.id));
  });

  it('creating an assistant through the route drops a busyFeedToken in the body', async () => {
    const o = await owner('post');
    await Database.updateWorkspaceBilling(o.ws, { planId: 'scale' } as any); // unlimited bots, so the limit check cannot stop the request
    const create = vi.spyOn(Database, 'createAssistant');
    const res = await assistantsPost(new NextRequest('http://localhost/api/assistants', { method: 'POST', headers: headers(o.cookie), body: JSON.stringify({ name: 'New bot', busyFeedToken: 'attacker_chosen_token_value_123' }) }));
    expect(res.status).toBe(201);
    expect(create).toHaveBeenCalledTimes(1);
    expect((create.mock.calls[0][0] as Record<string, unknown>).busyFeedToken).toBeUndefined();
    const json = await res.json();
    expect(await stored(json.assistant.id)).toBeUndefined();
  });

  it('the public widget config does not expose it', async () => {
    const o = await owner('widget');
    await Database.setBusyFeedToken(o.id, TOKEN);
    const res = await widgetConfig(new Request(`http://localhost/api/widget/${o.id}/config`), ctxOf(o.id));
    expect(res.status).toBe(200);
    expect(JSON.stringify(await res.json())).not.toContain(TOKEN);
  });
});
