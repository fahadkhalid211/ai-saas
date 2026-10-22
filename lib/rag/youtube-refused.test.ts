import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Database } from '../db';
import { generateSessionToken } from '../security/auth';
import { POST as addUrl } from '../../app/api/knowledge/url/route';
import { POST as previewUrl } from '../../app/api/knowledge/extract/route';
import { YOUTUBE_NOT_SUPPORTED_MESSAGE } from './url-extractor';

const tag = Math.random().toString(36).slice(2, 8);

beforeAll(() => vi.stubEnv('TRUST_PROXY_HEADERS', 'true'));
afterAll(() => vi.unstubAllEnvs());

async function owner() {
  const t = await Database.createTenantWorkspace({ businessName: `NoYouTube ${tag}`, ownerEmail: `noyt-${tag}@example.com`, password: 'a-good-password' });
  await Database.updateWorkspaceBilling(t.workspace.id, { requiresSubscription: false });
  return { assistantId: t.assistant.id, cookie: `kortex_admin_session=${generateSessionToken('owner', t.owner.id, t.workspace.id)}` };
}

function call(handler: (r: NextRequest) => Promise<Response>, path: string, cookie: string, body: unknown) {
  return handler(
    new NextRequest(`http://localhost${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie, 'x-forwarded-for': `10.6.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify(body),
    }),
  ).then(async (res) => ({ status: res.status, json: await res.json() }));
}

describe('YouTube links are refused', () => {
  const links = ['https://www.youtube.com/watch?v=PLEKye_zt4E&pp=ugUEEgJ1cg%3D%3D', 'https://youtu.be/PLEKye_zt4E', 'https://www.youtube.com/shorts/PLEKye_zt4E'];

  it('"Add directly" says so plainly and leaves no failed record behind', async () => {
    const o = await owner();
    for (const url of links) {
      const res = await call(addUrl, '/api/knowledge/url', o.cookie, { assistantId: o.assistantId, url });
      expect(res.status).toBe(400);
      expect(res.json.error).toBe(YOUTUBE_NOT_SUPPORTED_MESSAGE);
    }
    const sources = (await Database.getState()).knowledgeSources.filter((s) => s.assistantId === o.assistantId);
    expect(sources).toHaveLength(0);
  });

  it('"Preview first" says the same', async () => {
    const o = await owner();
    for (const url of links) {
      const res = await call(previewUrl, '/api/knowledge/extract', o.cookie, { assistantId: o.assistantId, url });
      expect(res.status).toBe(400);
      expect(res.json.success).toBe(false);
      expect(res.json.error).toBe(YOUTUBE_NOT_SUPPORTED_MESSAGE);
    }
  });

  it('points to what still works: a video or audio file, or a pasted transcript', () => {
    expect(YOUTUBE_NOT_SUPPORTED_MESSAGE).toMatch(/upload the video or audio file/);
    expect(YOUTUBE_NOT_SUPPORTED_MESSAGE).toMatch(/paste its transcript/);
  });
});
