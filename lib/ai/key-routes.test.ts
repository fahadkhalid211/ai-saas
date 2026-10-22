import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database } from '../db';
import { generateSessionToken } from '../security/auth';
import { maskSecret } from '../security/crypto';
import { POST as verifyRoute } from '../../app/api/connectors/verify/route';
import { GET as assistantGet, PUT as assistantPut } from '../../app/api/assistants/[id]/route';
import { GET as assistantsList } from '../../app/api/assistants/route';
import { GET as keyStatus } from '../../app/api/assistants/[id]/key-status/route';

const tag = Math.random().toString(36).slice(2, 8);

beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());
beforeEach(() => {
  vi.stubEnv('TRUST_PROXY_HEADERS', 'true');
  for (const k of ['GROQ_API_KEY', 'GEMINI_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY']) vi.stubEnv(k, '');
});
afterEach(() => vi.unstubAllGlobals());

/** A pretend provider that accepts only the keys it is told about, and records what it was asked. */
function providers(accepted: string[]) {
  const calls: Array<{ host: string; key: string }> = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const h = (init?.headers || {}) as Record<string, string>;
      const key = (h.Authorization || '').replace(/^Bearer\s+/, '') || h['x-api-key'] || '';
      calls.push({ host: new URL(String(url)).host, key });
      const ok = accepted.includes(key);
      return new Response(JSON.stringify(ok ? { data: [] } : { error: { message: 'Incorrect API key provided' } }), { status: ok ? 200 : 401 });
    }),
  );
  return calls;
}

async function owner(label: string, key = '', provider = 'groq') {
  const t = await Database.createTenantWorkspace({ businessName: `Keys ${label} ${tag}`, ownerEmail: `${label}-${tag}@example.com`, password: 'a-good-password' });
  await Database.updateWorkspaceBilling(t.workspace.id, { requiresSubscription: false }); // saving settings needs a plan
  await Database.updateAssistant(t.assistant.id, { provider, apiKeyEncrypted: key } as any);
  await Database.setApiKeyProvider(t.assistant.id, provider);
  const cookie = `kortex_admin_session=${generateSessionToken('owner', t.owner.id, t.workspace.id)}`;
  return { id: t.assistant.id, ws: t.workspace.id, cookie };
}

const headers = (cookie: string) => ({ 'content-type': 'application/json', cookie, 'x-forwarded-for': `10.8.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` });
const ctxOf = (id: string) => ({ params: Promise.resolve({ id }) });

async function put(o: { id: string; cookie: string }, body: Record<string, unknown>) {
  const res = await assistantPut(new NextRequest(`http://localhost/api/assistants/${o.id}`, { method: 'PUT', headers: headers(o.cookie), body: JSON.stringify(body) }), ctxOf(o.id));
  return { status: res.status, json: await res.json() };
}
async function get(o: { id: string; cookie: string }) {
  const res = await assistantGet(new NextRequest(`http://localhost/api/assistants/${o.id}`, { headers: headers(o.cookie) }), ctxOf(o.id));
  return (await res.json()).assistant;
}
async function test(o: { id: string; cookie: string }, body: Record<string, unknown>) {
  const res = await verifyRoute(new NextRequest('http://localhost/api/connectors/verify', { method: 'POST', headers: headers(o.cookie), body: JSON.stringify({ type: 'ai', ...body }) }));
  return { status: res.status, json: await res.json() };
}
async function status(o: { id: string; cookie: string }, force = false) {
  const res = await keyStatus(new NextRequest(`http://localhost/api/assistants/${o.id}/key-status${force ? '?force=1' : ''}`, { headers: headers(o.cookie) }), ctxOf(o.id));
  return { status: res.status, json: await res.json() };
}

describe('the Test Connection button on a saved key', () => {
  it('tests the saved key, not the masked placeholder the field shows', async () => {
    const calls = providers(['gsk_saved_and_good']);
    const o = await owner('mask', 'gsk_saved_and_good');
    const shown = (await get(o)).apiKeyEncrypted;
    expect(shown).toContain('****');
    expect(shown).toBe(maskSecret('gsk_saved_and_good')); // what the screen has in its field

    const res = await test(o, { provider: 'groq', assistantId: o.id, apiKey: shown });
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe('gsk_saved_and_good'); // the placeholder was never sent to the provider
  });

  it('says plainly when the saved key has stopped working, and the whole dashboard agrees at once', async () => {
    providers([]); // the provider no longer accepts it
    const o = await owner('dead', 'gsk_was_good');
    const res = await test(o, { provider: 'groq', assistantId: o.id, apiKey: maskSecret('gsk_was_good') });
    expect(res.status).toBe(400);
    expect(res.json.success).toBe(false);
    expect(res.json.message).toMatch(/Incorrect API key/);

    const header = await get(o); // what the header badge reads
    expect(header.hasConnectedKey).toBe(true); // a key is saved...
    expect(header.keyHealth.state).toBe('invalid'); // ...but it is not working, and that is what the screen shows
    expect((await status(o)).json.state).toBe('invalid');
  });

  it('refuses to test a masked placeholder against a different provider than the one it belongs to', async () => {
    const calls = providers(['gsk_groq_key']);
    const o = await owner('wrongprov', 'gsk_groq_key');
    const res = await test(o, { provider: 'openai', assistantId: o.id, apiKey: maskSecret('gsk_groq_key') });
    expect(res.status).toBe(400);
    expect(res.json.message).toMatch(/for groq.*Paste your openai key/);
    expect(calls).toHaveLength(0); // nothing was sent to OpenAI
  });

  it('tests a key typed into the field as it is, without touching the saved one', async () => {
    const calls = providers(['sk-new-openai-key']);
    const o = await owner('typed', 'gsk_groq_key_kept');
    const res = await test(o, { provider: 'openai', assistantId: o.id, apiKey: 'sk-new-openai-key' });
    expect(res.status).toBe(200);
    expect(calls[0]).toEqual({ host: 'api.openai.com', key: 'sk-new-openai-key' });
    expect((await Database.getAssistantById(o.id))!.apiKeyEncrypted).toBe('gsk_groq_key_kept');
  });

  it('cannot test an assistant from another workspace', async () => {
    providers(['gsk_other']);
    const mine = await owner('mine', 'gsk_mine');
    const theirs = await owner('theirs', 'gsk_other');
    const res = await test(mine, { provider: 'groq', assistantId: theirs.id, apiKey: maskSecret('gsk_other') });
    expect(res.status).toBe(400);
    expect(res.json.success).toBe(false);
  });
});

describe('looking at other providers must not break the connected one', () => {
  it('refuses to switch provider on a Groq key alone, and leaves the saved key and provider exactly as they were', async () => {
    const calls = providers(['gsk_groq_good']);
    const o = await owner('switch', 'gsk_groq_good');
    const before = await get(o);

    // what the old screen sent after clicking the OpenAI card: the masked Groq key still in the field
    const res = await put(o, { ...before, provider: 'openai', modelName: 'gpt-4o-mini', apiKeyEncrypted: before.apiKeyEncrypted });
    expect(res.status).toBe(400);
    expect(res.json.keyRequired).toBe(true);
    expect(calls).toHaveLength(0); // the Groq key was not even sent to OpenAI

    const after = await get(o);
    expect(after.provider).toBe('groq');
    expect(after.apiKeyEncrypted).toBe(before.apiKeyEncrypted);
    expect((await Database.getAssistantById(o.id))!.apiKeyEncrypted).toBe('gsk_groq_good');
    expect(after.keyHealth.state).not.toBe('invalid');
  });

  it('switches when a key for the new provider is pasted, and then remembers which provider each key is for', async () => {
    providers(['gsk_groq_good', 'sk-openai-good']);
    const o = await owner('switch2', 'gsk_groq_good');
    const before = await get(o);

    const ok = await put(o, { ...before, provider: 'openai', modelName: 'gpt-4o-mini', apiKeyEncrypted: 'sk-openai-good' });
    expect(ok.status).toBe(200);
    expect(ok.json.assistant.provider).toBe('openai');
    expect(ok.json.assistant.keyHealth.state).toBe('valid'); // just verified, shown at once
    expect((await Database.getAssistantById(o.id))!.apiKeyProvider).toBe('openai');

    // switching back to Groq now needs a Groq key: the saved one is OpenAI's
    const back = await put(o, { ...ok.json.assistant, provider: 'groq', modelName: 'openai/gpt-oss-120b', apiKeyEncrypted: ok.json.assistant.apiKeyEncrypted });
    expect(back.status).toBe(400);
    expect(back.json.error).toMatch(/belongs to openai/);
  });

  it('an invalid pasted key for the new provider is rejected and nothing is changed', async () => {
    providers(['gsk_groq_good']);
    const o = await owner('switch3', 'gsk_groq_good');
    const before = await get(o);
    const res = await put(o, { ...before, provider: 'openai', modelName: 'gpt-4o-mini', apiKeyEncrypted: 'sk-typo' });
    expect(res.status).toBe(400);
    expect(res.json.connectionFailed).toBe(true);
    const after = await Database.getAssistantById(o.id);
    expect(after!.provider).toBe('groq');
    expect(after!.apiKeyEncrypted).toBe('gsk_groq_good');
  });

  it('saving an unrelated setting does not re-check the key or disturb it, even though the screen sends every field', async () => {
    const calls = providers(['gsk_groq_good']);
    const o = await owner('behavior', 'gsk_groq_good');
    const before = await get(o);

    // a save from the Behavior tab: everything comes back, including an empty address and the same provider
    const res = await put(o, { ...before, temperature: 0.1, customBaseUrl: '', ollamaHost: '', provider: 'groq' });
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(0); // no provider request: nothing about the AI connection changed
    expect((await Database.getAssistantById(o.id))!.apiKeyEncrypted).toBe('gsk_groq_good');
    expect(res.json.assistant.temperature).toBe(0.1);
  });

  it('keeps the key when switching to a provider that runs without one, and does not erase it', async () => {
    providers(['gsk_groq_good']);
    const o = await owner('keyless', 'gsk_groq_good');
    const before = await get(o);
    const res = await put(o, { ...before, provider: 'auto_free', apiKeyEncrypted: before.apiKeyEncrypted });
    expect(res.status).toBe(200);
    expect((await Database.getAssistantById(o.id))!.apiKeyEncrypted).toBe('gsk_groq_good');
  });
});

describe('"connected" can no longer be a stored claim', () => {
  it('does not store the computed flags the screen sends back with every save', async () => {
    providers(['gsk_x']);
    const o = await owner('flags', '');
    const before = await get(o);
    expect(before.hasConnectedKey).toBe(false);
    await put(o, { ...before, hasConnectedKey: true, keyHealth: { state: 'valid' }, aiKeyStatus: { state: 'valid', fingerprint: 'x' }, apiKeyProvider: 'openai', temperature: 0.2 });
    const stored = (await Database.getState()).assistants.find((a) => a.id === o.id)!;
    expect((stored as any).hasConnectedKey).toBeUndefined();
    expect((stored as any).keyHealth).toBeUndefined();
    expect(stored.aiKeyStatus).toBeUndefined();
    expect(stored.apiKeyProvider).not.toBe('openai');
  });

  it('shows no key for an account whose record still carries the old stored "connected" flag', async () => {
    const o = await owner('legacy', '');
    const state = await Database.getState();
    (state.assistants.find((a) => a.id === o.id) as any).hasConnectedKey = true; // what older saves wrote
    const seen = await get(o);
    expect(seen.hasConnectedKey).toBe(false);
    expect(seen.keyHealth.state).toBe('missing');

    const list = await assistantsList(new NextRequest('http://localhost/api/assistants', { headers: headers(o.cookie) }));
    const mine = (await list.json()).assistants.find((a: any) => a.id === o.id);
    expect(mine.hasConnectedKey).toBe(false);
  });
});

describe('keeping watch', () => {
  it('shows a key that breaks later, and shows it recover, without the owner touching anything', async () => {
    const o = await owner('watch', 'gsk_watched');
    providers(['gsk_watched']);
    expect((await status(o, true)).json.state).toBe('valid');

    providers([]); // revoked at the provider
    expect((await status(o, true)).json.state).toBe('invalid');
    expect((await get(o)).keyHealth.state).toBe('invalid');

    providers(['gsk_watched']); // credit added back / key restored
    expect((await status(o, true)).json.state).toBe('valid');
  });

  it('does not call a good key broken because the provider is briefly unreachable', async () => {
    const o = await owner('blip', 'gsk_blip');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('fetch failed'); }));
    const res = await status(o, true);
    expect(res.json.state).toBe('unreachable');
    expect(res.json.state).not.toBe('invalid');
  });

  it('reports a missing key as missing, not as working', async () => {
    const o = await owner('nokey', '');
    const calls = providers([]);
    expect((await status(o, true)).json.state).toBe('missing');
    expect(calls).toHaveLength(0);
  });

  it('only answers for the signed-in workspace\'s own assistants', async () => {
    providers(['gsk_a']);
    const a = await owner('own-a', 'gsk_a');
    const b = await owner('own-b', 'gsk_b');
    const res = await keyStatus(new NextRequest(`http://localhost/api/assistants/${b.id}/key-status`, { headers: headers(a.cookie) }), ctxOf(b.id));
    expect(res.status).toBe(404);
  });
});
