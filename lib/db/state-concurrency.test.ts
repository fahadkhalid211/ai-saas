import { afterAll, describe, expect, it, vi } from 'vitest';

/**
 * The whole path (load, change, save) against a pretend cloud database that "another server" writes to in between.
 * Only the cloud module is replaced; the Database layer, the merge and the save transaction are the real ones.
 */
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/**
 * This file drives the real Database layer, which also saves its state to the data folder. That folder is shared by every test file in a
 * run, so the state used here (one salon, one assistant, deleted again at the end) was left behind for whichever file ran next: tests that
 * expect the default demo assistant, or any assistant at all, then failed depending on the order the files ran in (it showed up in CI).
 * It gets a folder of its own, created before the Database module is loaded.
 */
const ownDir = await vi.hoisted(async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crescelo-state-concurrency-'));
  process.env.DATA_DIR = dir;
  return dir;
});

afterAll(async () => {
  const fs = await import('node:fs');
  fs.rmSync(ownDir, { recursive: true, force: true });
});

const cloud = vi.hoisted(() => ({
  row: null as Record<string, any> | null,
  writes: 0,
}));

vi.mock('./cloud', async () => {
  const pg = await vi.importActual<typeof import('./postgres')>('./postgres');
  const copy = <T>(v: T): T => JSON.parse(JSON.stringify(v));
  const client = {
    async query(text: string, values?: unknown[]) {
      const sql = text.trim().toUpperCase();
      if (sql.startsWith('SELECT')) return { rows: cloud.row ? [{ data: copy(cloud.row) }] : [] };
      if (sql.startsWith('INSERT')) {
        cloud.row = JSON.parse(String(values![1]));
        cloud.writes++;
        return { rows: [{ updated_at: new Date() }] };
      }
      return { rows: [] };
    },
  };
  return {
    isCloudDbConfigured: () => true,
    getCloudDbProvider: () => 'postgres',
    fetchCloudState: async () => (cloud.row ? { status: 'found', data: copy(cloud.row) } : { status: 'not_found' }),
    fetchCloudStateUpdatedAt: async () => 'unchanged',
    persistCloudState: async (state: any, options?: { base?: any }) => pg.writeStateMerged(client, pg.toCloudPayload(state), options?.base),
    toCloudPayload: pg.toCloudPayload,
    fetchCloudChunks: async () => [],
    persistCloudChunks: async () => true,
  };
});

import { Database } from './index';

const stored = () => ({
  workspaces: [{ id: 'ws_new', name: 'New Salon', requiresSubscription: true, planId: 'growth', planName: 'Growth', billingInterval: 'monthly', monthlyChatLimit: 500, overageRatePerChat: 0.4, currentPeriodStart: '2026-10-01', currentPeriodEnd: '2026-11-01' }],
  teamMembers: [{ id: 'tm_new', workspaceId: 'ws_new', name: 'Owner', email: 'owner@salon.co', role: 'owner', status: 'active', createdAt: '2026-10-10T06:58:07Z' }],
  assistants: [{ id: 'ast_new', workspaceId: 'ws_new', name: 'New Salon Assistant', provider: 'ollama', modelName: 'llama3.2', systemPrompt: '', welcomeMessage: 'Hi', fallbackMessage: '', temperature: 0.3, primaryColor: '#2563eb', launcherPosition: 'bottom-right', starterQuestions: [], collectLeadEmail: false, allowedDomains: [], createdAt: '2026-10-10', updatedAt: '2026-10-10' }],
  knowledgeSources: [],
  conversations: [],
  leads: [],
  appointments: [],
  unansweredQueries: [],
  landingPages: [],
  landingPagesInitialized: true,
});

describe('one server saving while another has saved in between', () => {
  it('keeps both: the access code redeemed elsewhere and the settings saved here', async () => {
    cloud.row = stored();

    // this server loads its copy
    expect((await Database.getAssistantById('ast_new'))?.provider).toBe('ollama');
    const heldMember = await Database.findTeamMember('tm_new');

    // meanwhile another server redeems an access code and registers a second customer
    const elsewhere = clone(cloud.row!);
    Object.assign(elsewhere.workspaces[0], { requiresSubscription: false, complimentaryCode: 'WAQAS', trialEndsAt: '2099-01-01T00:00:00.000Z' });
    elsewhere.workspaces.push({ ...elsewhere.workspaces[0], id: 'ws_other', name: 'Other Shop', complimentaryCode: undefined });
    elsewhere.teamMembers.push({ id: 'tm_other', workspaceId: 'ws_other', name: 'Other', email: 'other@shop.co', role: 'owner', status: 'active', createdAt: '2026-10-10T07:00:00Z' });
    elsewhere.teamMembers[0].lastLoginAt = '2026-10-10T07:01:00Z';
    cloud.row = elsewhere;

    // this server, still on its older copy, saves the assistant settings
    const saved = await Database.updateAssistant('ast_new', { name: 'Front desk', widgetTitle: 'Ask us' });
    expect(saved?.name).toBe('Front desk');

    // nothing the other server saved was undone
    expect(cloud.row!.workspaces.find((w: any) => w.id === 'ws_new')).toMatchObject({ requiresSubscription: false, complimentaryCode: 'WAQAS' });
    expect(cloud.row!.workspaces.map((w: any) => w.id)).toEqual(['ws_new', 'ws_other']);
    expect(cloud.row!.teamMembers.map((m: any) => m.id)).toEqual(['tm_new', 'tm_other']);
    expect(cloud.row!.assistants[0]).toMatchObject({ name: 'Front desk', widgetTitle: 'Ask us' });

    // and this server now knows about it, in the same objects running code may be holding
    const billing = await Database.getWorkspaceBilling('ws_new');
    expect(billing).toMatchObject({ requiresSubscription: false, complimentaryCode: 'WAQAS' });
    expect(await Database.findTeamMember('tm_other')).not.toBeNull();
    expect(heldMember?.lastLoginAt).toBe('2026-10-10T07:01:00Z');
    expect(await Database.findTeamMember('tm_new')).toBe(heldMember);
  });

  it('a second save from this server builds on the merged result, and its own delete still deletes', async () => {
    const before = cloud.writes;
    await Database.updateWorkspaceBilling('ws_other', { billingEmail: 'bills@shop.co' });
    expect(cloud.writes).toBe(before + 1);
    expect(cloud.row!.workspaces.find((w: any) => w.id === 'ws_other').billingEmail).toBe('bills@shop.co');
    expect(cloud.row!.workspaces.find((w: any) => w.id === 'ws_new').complimentaryCode).toBe('WAQAS');

    // another server adds an assistant; this one deletes its own
    const elsewhere = clone(cloud.row!);
    elsewhere.assistants.push({ ...elsewhere.assistants[0], id: 'ast_other', workspaceId: 'ws_other', name: 'Other bot' });
    cloud.row = elsewhere;
    expect(await Database.deleteAssistant('ast_new')).toBe(true);
    expect(cloud.row!.assistants.map((a: any) => a.id)).toEqual(['ast_other']);
  });
});
