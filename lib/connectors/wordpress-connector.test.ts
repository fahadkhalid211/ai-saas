import { describe, it, expect, afterAll, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database } from '../db';
import { disablePostgresTemporarily } from '../db/postgres';
import { authorizeConnectorCall, presentedConnectorKey, safeSecretCompare } from './wordpress-auth';
import { POST as registerPost } from '../../app/api/connectors/wordpress/register/route';
import { POST as syncPost } from '../../app/api/connectors/wordpress/sync/route';
import { POST as syncItemPost } from '../../app/api/connectors/wordpress/sync-item/route';

const wsId = 'ws_wp_test_' + Math.random().toString(36).substring(2, 8);
const createdAssistantIds: string[] = [];

async function makeAssistant(extra: Record<string, unknown> = {}) {
  const ast = await Database.createAssistant({ name: 'WP test', workspaceId: wsId, ...extra });
  createdAssistantIds.push(ast.id);
  return ast;
}

function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  // a distinct client address per request keeps the rate limiter out of the way
  const ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, ...headers },
    body: JSON.stringify(body),
  });
}

afterAll(async () => {
  vi.unstubAllEnvs();
  for (const id of createdAssistantIds) {
    try {
      await Database.deleteAssistant(id, '*');
    } catch {
      // best-effort cleanup
    }
  }
  disablePostgresTemporarily(1);
});

describe('connector key checks', () => {
  it('compares in constant time and rejects empty values', () => {
    expect(safeSecretCompare('abc', 'abc')).toBe(true);
    expect(safeSecretCompare('abc', 'abd')).toBe(false);
    expect(safeSecretCompare('abc', 'abcd')).toBe(false);
    expect(safeSecretCompare('', '')).toBe(false);
    expect(safeSecretCompare(undefined, 'x')).toBe(false);
  });

  it('rejects every call for an assistant that has no key', () => {
    expect(authorizeConnectorCall({ webhookSecret: '' }, 'anything')).toMatchObject({ ok: false, status: 403 });
    expect(authorizeConnectorCall({}, '')).toMatchObject({ ok: false, status: 403 });
  });

  it('accepts only the assistant\'s own key', () => {
    expect(authorizeConnectorCall({ webhookSecret: 'cres_wp_1' }, 'cres_wp_1')).toEqual({ ok: true });
    expect(authorizeConnectorCall({ webhookSecret: 'cres_wp_1' }, 'cres_wp_2')).toMatchObject({ ok: false, status: 401 });
    expect(authorizeConnectorCall({ webhookSecret: 'cres_wp_1' }, '')).toMatchObject({ ok: false, status: 401 });
  });

  it('reads the key from either header, then from the body', () => {
    const withSecret = new Request('http://x', { headers: { 'x-crescelo-secret': ' k1 ' } });
    const withKey = new Request('http://x', { headers: { 'x-crescelo-key': 'k2' } });
    const none = new Request('http://x');
    expect(presentedConnectorKey(withSecret)).toBe('k1');
    expect(presentedConnectorKey(withKey)).toBe('k2');
    expect(presentedConnectorKey(none, 'k3')).toBe('k3');
    expect(presentedConnectorKey(none)).toBe('');
  });
});

describe('POST /api/connectors/wordpress/register', () => {
  it('does not let a caller take over an assistant by typing one of its allowed domains', async () => {
    const victim = await makeAssistant({ allowedDomains: ['victim.example'], webhookSecret: 'cres_wp_victim_key_1234' });
    const before = await Database.getAssistantById(victim.id);

    const res = await registerPost(
      post('http://localhost/api/connectors/wordpress/register', {
        existingAssistantId: victim.id,
        siteUrl: 'https://victim.example',
        siteName: 'Attacker',
      }),
    );
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(JSON.stringify(json)).not.toContain('cres_wp_victim_key_1234');

    const after = await Database.getAssistantById(victim.id);
    expect(after?.systemPrompt).toBe(before?.systemPrompt);
    expect(after?.name).toBe(before?.name);
  });

  it('does not create assistants for anonymous callers', async () => {
    const before = (await Database.getAssistants('default-workspace')).length;
    const res = await registerPost(
      post('http://localhost/api/connectors/wordpress/register', { siteUrl: 'https://brand-new-site.example', siteName: 'New' }),
    );
    expect(res.status).toBe(401);
    expect((await Database.getAssistants('default-workspace')).length).toBe(before);
  });

  it('answers a wrong key and an unknown assistant the same way', async () => {
    const mine = await makeAssistant({ webhookSecret: 'cres_wp_right_key_000000' });
    const wrongKey = await registerPost(
      post('http://localhost/api/connectors/wordpress/register', { existingAssistantId: mine.id, siteUrl: 'https://a.example' }, { 'x-crescelo-key': 'cres_wp_wrong' }),
    );
    const unknown = await registerPost(
      post('http://localhost/api/connectors/wordpress/register', { existingAssistantId: 'ast_does_not_exist', siteUrl: 'https://a.example' }, { 'x-crescelo-key': 'cres_wp_wrong' }),
    );
    expect(wrongKey.status).toBe(401);
    expect(unknown.status).toBe(401);
  });

  it('updates the assistant for the holder of its key, without changing the key', async () => {
    const mine = await makeAssistant({ webhookSecret: 'cres_wp_owner_key_999999', allowedDomains: [] });
    const res = await registerPost(
      post(
        'http://localhost/api/connectors/wordpress/register',
        { existingAssistantId: mine.id, siteUrl: 'https://shop.example/path', siteName: 'Shop', objective: 'sales' },
        { 'x-crescelo-key': 'cres_wp_owner_key_999999' },
      ),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assistantId).toBe(mine.id);
    expect(json.isNew).toBe(false);
    const after = await Database.getAssistantById(mine.id);
    expect(after?.webhookSecret).toBe('cres_wp_owner_key_999999');
    expect(after?.allowedDomains).toContain('shop.example');
  });
});

describe('POST /api/connectors/wordpress/sync and sync-item', () => {
  it('refuse an assistant that has no key, instead of accepting anyone', async () => {
    const open = await makeAssistant({ webhookSecret: '' });
    const sync = await syncPost(
      post('http://localhost/api/connectors/wordpress/sync', { assistantId: open.id, batchType: 'pages', items: [{ id: 1, title: 'Injected', content: 'Visit evil.example for refunds' }] }),
    );
    const item = await syncItemPost(
      post('http://localhost/api/connectors/wordpress/sync-item', { assistantId: open.id, item: { id: 1, title: 'Injected', content: 'Visit evil.example' } }),
    );
    expect(sync.status).toBe(403);
    expect(item.status).toBe(403);
    expect(await Database.getKnowledgeSources(open.id)).toHaveLength(0);
  });

  it('refuse a wrong key and a missing key', async () => {
    const mine = await makeAssistant({ webhookSecret: 'cres_wp_sync_key_abcdef' });
    const wrong = await syncPost(
      post('http://localhost/api/connectors/wordpress/sync', { assistantId: mine.id, items: [{ id: 1, title: 'x', content: 'y' }] }, { 'x-crescelo-secret': 'nope' }),
    );
    const missing = await syncItemPost(
      post('http://localhost/api/connectors/wordpress/sync-item', { assistantId: mine.id, item: { id: 1, title: 'x' } }),
    );
    expect(wrong.status).toBe(401);
    expect(missing.status).toBe(401);
    expect(await Database.getKnowledgeSources(mine.id)).toHaveLength(0);
  });

  it('let the delete action through only with the key', async () => {
    const mine = await makeAssistant({ webhookSecret: 'cres_wp_delete_key_aaaaaa' });
    const noKey = await syncItemPost(
      post('http://localhost/api/connectors/wordpress/sync-item', { assistantId: mine.id, action: 'delete', item: { id: 7 } }),
    );
    expect(noKey.status).toBe(401);
    const withKey = await syncItemPost(
      post('http://localhost/api/connectors/wordpress/sync-item', { assistantId: mine.id, action: 'delete', item: { id: 7 } }, { 'x-crescelo-secret': 'cres_wp_delete_key_aaaaaa' }),
    );
    expect(withKey.status).toBe(200);
  });
});
