import { afterAll, describe, expect, it, vi } from 'vitest';

/** The data folder is this file's own, created before the Database module is loaded (see state-concurrency.test.ts for why). */
const ownDir = await vi.hoisted(async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crescelo-save-batching-'));
  process.env.DATA_DIR = dir;
  return dir;
});

afterAll(async () => {
  const fs = await import('node:fs');
  fs.rmSync(ownDir, { recursive: true, force: true });
});

describe('saves that arrive together share one write', () => {
  it('has every one of 60 simultaneous changes on disk by the time its own call returns', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { Database } = await import('./index');

    const ast = await Database.createAssistant({ name: 'Batching test', workspaceId: 'ws_batching_test' });
    const before = fs.statSync(path.join(ownDir, 'db.json')).mtimeMs;

    // each call is only allowed to return once its lead is stored, whatever other saves it shared the write with
    const stored = await Promise.all(
      Array.from({ length: 60 }, async (_, i) => {
        await Database.saveLead({ assistantId: ast.id, name: `Lead ${i}`, email: `lead${i}@example.com`, phone: '+1 555-000-0000' } as any);
        const onDisk = JSON.parse(fs.readFileSync(path.join(ownDir, 'db.json'), 'utf8'));
        return onDisk.leads.some((l: any) => l.email === `lead${i}@example.com`);
      }),
    );

    expect(stored.every(Boolean)).toBe(true);
    expect(fs.statSync(path.join(ownDir, 'db.json')).mtimeMs).toBeGreaterThanOrEqual(before);
    const final = JSON.parse(fs.readFileSync(path.join(ownDir, 'db.json'), 'utf8'));
    expect(final.leads.filter((l: any) => l.assistantId === ast.id)).toHaveLength(60);
  });
});
