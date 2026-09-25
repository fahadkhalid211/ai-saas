import { describe, it, expect } from 'vitest';
import { Database } from '../db';
import { tokenFor } from './test-session';

const wsA = 'ws_xw_a_' + Math.random().toString(36).slice(2, 8);
const wsB = 'ws_xw_b_' + Math.random().toString(36).slice(2, 8);
const authed = (token: string, extra: RequestInit = {}) => ({ ...extra, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(extra.headers || {}) } });

describe('one workspace cannot reach another through the API', () => {
  it('calendar feed: a signed-in user of another workspace is refused', async () => {
    const { GET } = await import('../../app/api/appointments/calendar/route');
    const bot = await Database.createAssistant({ name: 'A bot', workspaceId: wsA });
    const tokenB = await tokenFor('owner', 'tm_xw_b1', wsB);
    const res = await GET(new Request(`http://localhost/api/appointments/calendar?assistantId=${bot.id}`, authed(tokenB)));
    expect(res.status).toBe(401);
    const tokenA = await tokenFor('owner', 'tm_xw_a1', wsA);
    const own = await GET(new Request(`http://localhost/api/appointments/calendar?assistantId=${bot.id}`, authed(tokenA)));
    expect(own.status).toBe(200);
  });

  it('templates: cannot overwrite another workspace assistant', async () => {
    const { POST } = await import('../../app/api/templates/route');
    const bot = await Database.createAssistant({ name: 'Untouched', workspaceId: wsA });
    const tokenB = await tokenFor('owner', 'tm_xw_b1', wsB);
    const res = await POST(new Request('http://localhost/api/templates', authed(tokenB, { method: 'POST', body: JSON.stringify({ templateId: 'classic-barbershop', assistantId: bot.id }) })));
    expect([403, 404]).toContain(res.status);
    expect((await Database.getAssistantById(bot.id, wsA))?.name).toBe('Untouched');
  }, 30000);

  it('landing page: cannot attach a page to another workspace assistant', async () => {
    const { POST } = await import('../../app/api/landing-page/route');
    const { NextRequest } = await import('next/server');
    const bot = await Database.createAssistant({ name: 'Victim bot', workspaceId: wsA });
    const tokenB = await tokenFor('owner', 'tm_xw_b1', wsB);
    const body = { assistantId: bot.id, isNewPage: true, config: { slug: 'xw-' + Math.random().toString(36).slice(2, 8), businessName: 'Mine', assistantId: bot.id } };
    const res = await POST(new NextRequest('http://localhost/api/landing-page', authed(tokenB, { method: 'POST', body: JSON.stringify(body) }) as any));
    expect(res.status).toBe(403);
  });

  it('by-id deletes check the owning workspace', async () => {
    const bot = await Database.createAssistant({ name: 'Leads bot', workspaceId: wsA });
    const lead = await Database.saveLead({ assistantId: bot.id, email: 'x@y.co' } as any);
    expect(await Database.deleteLead(lead.id, wsB)).toBe(false);
    expect(await Database.deleteLead(lead.id, wsA)).toBe(true);
  });
});
