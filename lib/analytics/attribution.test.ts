import { describe, it, expect, afterAll, vi } from 'vitest';
import { Database } from '../db';
import { isPostgresConfigured, disablePostgresTemporarily } from '../db/postgres';
import { resolveAttribution, attributionCustomData } from './attribution';
import { POST as leadPost } from '../../app/api/lead/route';
import { POST as widgetEventsPost, OPTIONS as widgetEventsOptions } from '../../app/api/widget-events/route';

const wsId = 'ws_attr_test_' + Math.random().toString(36).substring(2, 8);
const createdAssistantIds: string[] = [];

async function makeAssistant(name: string) {
  const ast = await Database.createAssistant({ name, workspaceId: wsId });
  createdAssistantIds.push(ast.id);
  return ast;
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
  // Release any pool created against the deliberately unreachable test database.
  disablePostgresTemporarily(1);
});

describe('Pilot attribution: resolveAttribution', () => {
  it('keeps a conversation that exists and belongs to the assistant', async () => {
    const ast = await makeAssistant('Attribution A');
    const conv = await Database.getOrCreateConversation(ast.id, 'visitor_attr_1');

    expect(await resolveAttribution({ conversationId: conv.id, source: 'chat' }, ast.id)).toEqual({
      conversationId: conv.id,
      source: 'chat',
    });
    // A verified conversation with no explicit source counts as chat.
    expect(await resolveAttribution({ conversationId: conv.id }, ast.id)).toEqual({
      conversationId: conv.id,
      source: 'chat',
    });
  });

  it('drops a bogus conversationId and downgrades an unverifiable "chat" claim to direct', async () => {
    const ast = await makeAssistant('Attribution B');

    expect(await resolveAttribution({ conversationId: 'conv_does_not_exist', source: 'chat' }, ast.id)).toEqual({
      source: 'direct',
    });
    expect(await resolveAttribution({ source: 'chat' }, ast.id)).toEqual({ source: 'direct' });
    expect(await resolveAttribution({}, ast.id)).toEqual({ source: 'direct' });
  });

  it('drops a conversation that belongs to a different assistant', async () => {
    const astA = await makeAssistant('Owner A');
    const astB = await makeAssistant('Owner B');
    const convOfB = await Database.getOrCreateConversation(astB.id, 'visitor_attr_2');

    expect(await resolveAttribution({ conversationId: convOfB.id, source: 'chat' }, astA.id)).toEqual({
      source: 'direct',
    });
  });

  it('preserves non-chat sources so test and form traffic can be excluded', async () => {
    const ast = await makeAssistant('Attribution C');
    const conv = await Database.getOrCreateConversation(ast.id, 'visitor_attr_3');

    expect(await resolveAttribution({ source: 'landing_form' }, ast.id)).toEqual({ source: 'landing_form' });
    expect(await resolveAttribution({ conversationId: conv.id, source: 'playground' }, ast.id)).toEqual({
      conversationId: conv.id,
      source: 'playground',
    });
  });

  it('matches a conversation started with the assistant landing-page slug', async () => {
    const ast = await makeAssistant('Slug Assistant');
    const slug = 'attr-slug-' + Math.random().toString(36).substring(2, 8);
    const state = await Database.getState();
    const stored = state.assistants.find((a) => a.id === ast.id)!;
    stored.landingPageConfig = { slug } as any;

    const conv = await Database.getOrCreateConversation(slug, 'visitor_slug');
    expect(await resolveAttribution({ conversationId: conv.id, source: 'chat' }, ast.id)).toEqual({
      conversationId: conv.id,
      source: 'chat',
    });
  });

  it('builds namespaced customData that cannot collide with business custom fields', () => {
    expect(attributionCustomData({ conversationId: 'conv_1', source: 'chat' })).toEqual({
      attributionConversationId: 'conv_1',
      attributionSource: 'chat',
    });
    expect(attributionCustomData({ source: 'direct' })).toEqual({ attributionSource: 'direct' });
  });
});

describe('Pilot attribution: /api/lead', () => {
  const leadRequest = (body: Record<string, any>) =>
    new Request('http://localhost/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  it('stores verified attribution on the lead and ignores spoofed system keys', async () => {
    const ast = await makeAssistant('Lead Attribution');
    const conv = await Database.getOrCreateConversation(ast.id, 'visitor_lead_1');

    const res = await leadPost(
      leadRequest({
        assistantId: ast.id,
        name: 'Roof Owner',
        email: 'roof.owner@example.com',
        phone: '+1 555 111 2222',
        conversationId: conv.id,
        source: 'chat',
        customData: { company: 'Acme Roofing', attributionSource: 'spoofed' },
      })
    );
    expect(res.status).toBe(201);

    const lead = (await Database.getLeads(ast.id)).find((l) => l.email === 'roof.owner@example.com');
    expect(lead?.customData?.attributionSource).toBe('chat');
    expect(lead?.customData?.attributionConversationId).toBe(conv.id);
    expect(lead?.customData?.company).toBe('Acme Roofing');
  });

  it('marks a lead with an unverifiable conversation as direct and never fails the lead', async () => {
    const ast = await makeAssistant('Lead Attribution Bogus');

    const res = await leadPost(
      leadRequest({
        assistantId: ast.id,
        name: 'Walk In',
        email: 'walk.in@example.com',
        phone: '+1 555 333 4444',
        conversationId: 'conv_bogus_123',
        source: 'chat',
      })
    );
    expect(res.status).toBe(201);

    const lead = (await Database.getLeads(ast.id)).find((l) => l.email === 'walk.in@example.com');
    expect(lead?.customData?.attributionSource).toBe('direct');
    expect(lead?.customData?.attributionConversationId).toBeUndefined();
  });
});

describe('Pilot analytics: no fabricated revenue', () => {
  it('counts unpriced appointments as 0 revenue instead of a made-up $45', async () => {
    const ast = await makeAssistant('Revenue Assistant');

    await Database.saveAppointment({
      assistantId: ast.id,
      name: 'No Price',
      email: 'no.price@example.com',
      date: '2029-01-01',
      timeSlot: '10:00',
    });

    let analytics = await Database.getCompleteAnalytics({ assistantId: ast.id, workspaceId: wsId, days: 30 });
    expect(analytics.overview.totalPipelineRevenue).toBe(0);
    expect(analytics.overview.avgBookingValue).toBe(0);
    expect(analytics.overview.appointmentsWithPrice).toBe(0);

    await Database.saveAppointment({
      assistantId: ast.id,
      name: 'Has Price',
      email: 'has.price@example.com',
      date: '2029-01-02',
      timeSlot: '11:00',
      price: 120,
    });

    analytics = await Database.getCompleteAnalytics({ assistantId: ast.id, workspaceId: wsId, days: 30 });
    // Revenue is only what was actually recorded, and the average ignores the unpriced booking.
    expect(analytics.overview.totalPipelineRevenue).toBe(120);
    expect(analytics.overview.avgBookingValue).toBe(120);
    expect(analytics.overview.appointmentsWithPrice).toBe(1);
  });
});

describe('Pilot funnel: /api/widget-events', () => {
  const eventRequest = (raw: string) =>
    new Request('http://localhost/api/widget-events', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: raw,
    });

  it('accepts a valid event with 202 and CORS headers', async () => {
    const ast = await makeAssistant('Widget Assistant');
    const res = await widgetEventsPost(
      eventRequest(JSON.stringify({ assistantId: ast.id, type: 'widget_loaded', sessionId: 'ws_test_session_1' }))
    );
    expect(res.status).toBe(202);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('rejects malformed input with 400', async () => {
    const ast = await makeAssistant('Widget Assistant 2');
    const bad = [
      JSON.stringify({ assistantId: ast.id, type: 'page_view', sessionId: 'ws_test_session_1' }),
      JSON.stringify({ assistantId: ast.id, type: 'widget_opened', sessionId: 'bad id!' }),
      JSON.stringify({ type: 'widget_opened', sessionId: 'ws_test_session_1' }),
      'not json at all',
    ];
    for (const raw of bad) {
      const res = await widgetEventsPost(eventRequest(raw));
      expect(res.status).toBe(400);
    }
  });

  it('answers unknown assistants with the same 202 so ids cannot be enumerated', async () => {
    const res = await widgetEventsPost(
      eventRequest(JSON.stringify({ assistantId: 'ast_nonexistent_zzz', type: 'widget_opened', sessionId: 'ws_test_session_2' }))
    );
    expect(res.status).toBe(202);
  });

  it('answers the CORS preflight', async () => {
    const res = await widgetEventsOptions();
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('reports the funnel as not tracked (not zero) when relational mode is off', async () => {
    vi.stubEnv('DB_RELATIONAL_MODE', 'false');
    const ast = await makeAssistant('Funnel Off');
    expect(await Database.recordWidgetEvent({ assistantId: ast.id, sessionId: 'ws_s', eventType: 'widget_loaded' })).toBe(false);
    expect(await Database.getWidgetFunnel(ast.id, 30)).toEqual({ available: false, loadedSessions: 0, openedSessions: 0 });
    vi.unstubAllEnvs();
  });

  it('never throws and never trips the shared Postgres kill switch when the database is unreachable', async () => {
    // Create the assistant BEFORE pointing at a dead database, so only the widget-event
    // functions under test touch it (the unrelated cloud-state loader has its own kill-switch).
    const ast = await makeAssistant('Funnel Down');

    // Relational mode on, pointing at a port nothing listens on.
    vi.stubEnv('DB_RELATIONAL_MODE', 'true');
    vi.stubEnv('DATABASE_URL', 'postgres://nobody:nopass@127.0.0.1:1/none');
    expect(isPostgresConfigured()).toBe(true);

    await expect(
      Database.recordWidgetEvent({ assistantId: ast.id, sessionId: 'ws_down_session', eventType: 'widget_opened' })
    ).resolves.toBe(false);
    await expect(Database.getWidgetFunnel(ast.id, 30)).resolves.toEqual({
      available: false,
      loadedSessions: 0,
      openedSessions: 0,
    });

    // If a failed optional-table write had called disablePostgresTemporarily(), bookings and
    // messages would be knocked offline for a minute. It must not.
    expect(isPostgresConfigured()).toBe(true);
    vi.unstubAllEnvs();
  });
});
