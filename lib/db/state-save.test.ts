import { afterEach, describe, expect, it } from 'vitest';
import { toCloudPayload, writeStateMerged, type StateClient } from './postgres';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/** One shared state row, as Postgres would hold it. Records the statements so the transaction shape can be checked. */
function fakeDatabase(initial: Record<string, any> | null) {
  const db = { row: initial ? clone(initial) : null, statements: [] as string[], failWrite: false };
  const client: StateClient = {
    async query(text: string, values?: unknown[]) {
      const sql = text.trim().split(/\s+/).slice(0, 2).join(' ').toUpperCase();
      db.statements.push(sql);
      if (sql.startsWith('SELECT')) return { rows: db.row ? [{ data: clone(db.row) }] : [] };
      if (sql.startsWith('INSERT')) {
        if (db.failWrite) throw new Error('disk full');
        const incoming = JSON.parse(String(values![1]));
        if (process.env.DB_RELATIONAL_MODE === 'true') {
          // what the relational statement does: keep the six collections the row already holds
          const kept: Record<string, any> = {};
          for (const k of ['conversations', 'messages', 'leads', 'appointments', 'notifications', 'unansweredQueries']) kept[k] = db.row?.[k] ?? [];
          db.row = { ...incoming, ...kept };
        } else {
          db.row = incoming;
        }
        return { rows: [{ updated_at: new Date() }] };
      }
      return { rows: [] };
    },
  };
  return { db, client };
}

const seed = () => ({
  workspaces: [{ id: 'ws_new', name: 'New Salon', requiresSubscription: true, planId: 'growth' }],
  teamMembers: [{ id: 'tm_new', workspaceId: 'ws_new', email: 'owner@salon.co', role: 'owner' }],
  assistants: [{ id: 'ast_new', workspaceId: 'ws_new', name: 'New Salon Assistant', provider: 'ollama', modelName: 'llama3.2' }],
  knowledgeSources: [],
  auditLogs: [],
});

afterEach(() => {
  delete process.env.DB_RELATIONAL_MODE;
});

describe('saving the shared state row', () => {
  it('two servers with the same starting copy both keep their work', async () => {
    const { db, client } = fakeDatabase(seed());
    // both servers loaded the row at the same time
    const serverA = { state: clone(seed()), base: toCloudPayload(clone(seed())) };
    const serverB = { state: clone(seed()), base: toCloudPayload(clone(seed())) };

    // A: the owner redeems an access code
    Object.assign(serverA.state.workspaces[0], { requiresSubscription: false, complimentaryCode: 'WAQAS' });
    const a = await writeStateMerged(client, toCloudPayload(serverA.state), serverA.base);
    expect(a.changedByOthers).toBe(false);

    // B (still on the old copy): the owner saves an API key and a knowledge source is added
    Object.assign(serverB.state.assistants[0], { provider: 'anthropic', apiKeyEncrypted: 'enc:abc' });
    (serverB.state.knowledgeSources as any[]).push({ id: 'ks_1', assistantId: 'ast_new', title: 'Prices' });
    const b = await writeStateMerged(client, toCloudPayload(serverB.state), serverB.base);

    expect(b.changedByOthers).toBe(true);
    expect(db.row!.workspaces[0]).toMatchObject({ requiresSubscription: false, complimentaryCode: 'WAQAS' }); // A's save survived
    expect(db.row!.assistants[0]).toMatchObject({ provider: 'anthropic', apiKeyEncrypted: 'enc:abc' });
    expect(db.row!.knowledgeSources).toHaveLength(1);
    expect(b.merged!.workspaces[0].complimentaryCode).toBe('WAQAS'); // and B learns about it
  });

  it('a sign-up on one server is not erased by a save from a server that never saw it', async () => {
    const before = { ...seed(), workspaces: [], teamMembers: [], assistants: [{ id: 'ast_old', workspaceId: 'ws_old', name: 'Old', provider: 'groq', modelName: 'm' }] };
    const { db, client } = fakeDatabase(before);
    const stale = { state: clone(before), base: toCloudPayload(clone(before)) };

    // another server registers a new customer
    const fresh = clone(before) as any;
    fresh.workspaces.push({ id: 'ws_new', name: 'New Salon' });
    fresh.teamMembers.push({ id: 'tm_new', workspaceId: 'ws_new', email: 'owner@salon.co', role: 'owner' });
    await writeStateMerged(client, toCloudPayload(fresh), toCloudPayload(clone(before)));

    // the stale server saves something unrelated
    stale.state.assistants[0].name = 'Old (renamed)';
    await writeStateMerged(client, toCloudPayload(stale.state), stale.base);

    expect(db.row!.workspaces.map((w: any) => w.id)).toEqual(['ws_new']);
    expect(db.row!.teamMembers.map((m: any) => m.id)).toEqual(['tm_new']);
    expect(db.row!.assistants[0].name).toBe('Old (renamed)');
  });

  it('a deliberate delete still deletes', async () => {
    const { db, client } = fakeDatabase(seed());
    const state = clone(seed());
    const base = toCloudPayload(clone(seed()));
    state.assistants = [];
    await writeStateMerged(client, toCloudPayload(state), base);
    expect(db.row!.assistants).toEqual([]);
  });

  it('locks the row, reads it and writes inside one transaction', async () => {
    const { db, client } = fakeDatabase(seed());
    await writeStateMerged(client, toCloudPayload(seed()), toCloudPayload(seed()));
    expect(db.statements).toEqual(['BEGIN', 'SET LOCAL', 'SELECT DATA', 'INSERT INTO', 'COMMIT']);
  });

  it('rolls back and reports the failure when the write fails', async () => {
    const { db, client } = fakeDatabase(seed());
    db.failWrite = true;
    await expect(writeStateMerged(client, toCloudPayload(seed()), null)).rejects.toThrow('disk full');
    expect(db.statements.at(-1)).toBe('ROLLBACK');
    expect(db.row).toEqual(seed());
  });

  it('writes the first row as it is', async () => {
    const { db, client } = fakeDatabase(null);
    const r = await writeStateMerged(client, toCloudPayload(seed()), null);
    expect(r).toMatchObject({ ok: true, changedByOthers: false });
    expect(db.row!.workspaces).toHaveLength(1);
  });

  it('in relational mode leaves the six table-backed collections out of the merge and the write', async () => {
    process.env.DB_RELATIONAL_MODE = 'true';
    const stored = { ...seed(), conversations: [{ id: 'frozen' }], leads: [{ id: 'l1' }] };
    const { db, client } = fakeDatabase(stored);
    const state: any = { ...clone(seed()), conversations: [], leads: [], chunks: [{ id: 'c' }] };
    state.assistants[0].name = 'Renamed';
    const payload = toCloudPayload(state);
    expect(Object.keys(payload)).not.toContain('conversations');
    expect(Object.keys(payload)).not.toContain('chunks');
    await writeStateMerged(client, payload, toCloudPayload(clone(seed())));
    expect(db.row!.conversations).toEqual([{ id: 'frozen' }]); // untouched
    expect(db.row!.assistants[0].name).toBe('Renamed');
  });
});
