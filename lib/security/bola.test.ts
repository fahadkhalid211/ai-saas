import { describe, it, expect } from 'vitest';
import { Database } from '../db';
import {
  getAdminKey,
  requireWorkspaceAssistant,
  generateCalendarFeedToken,
  verifyCalendarFeedToken,
} from './auth';
import { timingSafeStringEqual } from './password';
import {
  getCachedRetrieval,
  setCachedRetrieval,
  clearRetrievalCache,
} from '../rag/cache';

describe('Multi-Tenant Isolation & BOLA/IDOR Security', () => {
  const wsA = 'ws_test_tenant_alpha_' + Math.random().toString(36).substring(2, 8);
  const wsB = 'ws_test_tenant_beta_' + Math.random().toString(36).substring(2, 8);

  it('should isolate assistant retrieval across workspaces', async () => {
    const astA = await Database.createAssistant({
      name: 'Alpha Bot',
      workspaceId: wsA,
    });

    const astB = await Database.createAssistant({
      name: 'Beta Bot',
      workspaceId: wsB,
    });

    // Tenant A can retrieve own assistant
    const foundA = await Database.getAssistantById(astA.id, wsA);
    expect(foundA).not.toBeNull();
    expect(foundA?.id).toBe(astA.id);

    // Tenant B CANNOT retrieve Tenant A's assistant (BOLA prevention)
    const crossRetrieve = await Database.getAssistantById(astA.id, wsB);
    expect(crossRetrieve).toBeNull();

    // Master Admin (wildcard) can retrieve any assistant
    const masterFound = await Database.getAssistantById(astA.id, '*');
    expect(masterFound).not.toBeNull();
    expect(masterFound?.id).toBe(astA.id);
  });

  it('should prevent cross-tenant assistant modification', async () => {
    const astA = await Database.createAssistant({
      name: 'Protected Bot',
      workspaceId: wsA,
    });

    // Tenant B attempts to update Tenant A's assistant
    const crossUpdate = await Database.updateAssistant(astA.id, { name: 'Hacked Name' }, wsB);
    expect(crossUpdate).toBeNull();

    // Verify name was untouched
    const fresh = await Database.getAssistantById(astA.id, wsA);
    expect(fresh?.name).toBe('Protected Bot');

    // Tenant A can update own assistant
    const validUpdate = await Database.updateAssistant(astA.id, { name: 'Legit Update' }, wsA);
    expect(validUpdate).not.toBeNull();
    expect(validUpdate?.name).toBe('Legit Update');
  });

  it('should prevent cross-tenant assistant deletion', async () => {
    const astA = await Database.createAssistant({
      name: 'Undeletable by Others',
      workspaceId: wsA,
    });

    // Tenant B attempts to delete Tenant A's assistant
    const crossDelete = await Database.deleteAssistant(astA.id, wsB);
    expect(crossDelete).toBe(false);

    // Verify assistant still exists
    const stillThere = await Database.getAssistantById(astA.id, wsA);
    expect(stillThere).not.toBeNull();

    // Tenant A deletes own assistant
    const legitDelete = await Database.deleteAssistant(astA.id, wsA);
    expect(legitDelete).toBe(true);

    const gone = await Database.getAssistantById(astA.id, wsA);
    expect(gone).toBeNull();
  });

  it('should strictly isolate conversations between tenant workspaces', async () => {
    const astA = await Database.createAssistant({ name: 'Conv Bot A', workspaceId: wsA });
    const astB = await Database.createAssistant({ name: 'Conv Bot B', workspaceId: wsB });

    const convA = await Database.getOrCreateConversation(astA.id, 'visitor_a');
    await Database.saveMessage(convA.id, 'user', 'Confidential message from Workspace A', [], 10);

    const convB = await Database.getOrCreateConversation(astB.id, 'visitor_b');
    await Database.saveMessage(convB.id, 'user', 'Confidential message from Workspace B', [], 10);

    // Tenant A queries all conversations in workspace
    const convsA = await Database.getConversations(undefined, wsA);
    const convIdsA = convsA.map((c) => c.id);
    expect(convIdsA).toContain(convA.id);
    expect(convIdsA).not.toContain(convB.id);

    // Tenant A queries with Tenant B's assistantId -> must return empty
    const crossConvs = await Database.getConversations(astB.id, wsA);
    expect(crossConvs).toHaveLength(0);

    // Tenant B queries all conversations in workspace
    const convsB = await Database.getConversations(undefined, wsB);
    const convIdsB = convsB.map((c) => c.id);
    expect(convIdsB).toContain(convB.id);
    expect(convIdsB).not.toContain(convA.id);
  });

  it('should prevent cross-tenant knowledge source deletion', async () => {
    const astA = await Database.createAssistant({ name: 'Knowledge Bot A', workspaceId: wsA });
    const sourceA = await Database.createKnowledgeSource({
      assistantId: astA.id,
      title: 'Secret Document A',
      type: 'txt',
      chunkCount: 1,
    });

    // Tenant B tries to delete Tenant A's knowledge source
    const crossDelete = await Database.deleteKnowledgeSource(sourceA.id, wsB);
    expect(crossDelete).toBe(false);

    // Verify source still exists
    const stillThere = await Database.getKnowledgeSourceById(sourceA.id);
    expect(stillThere).not.toBeNull();

    // Tenant A deletes own knowledge source
    const legitDelete = await Database.deleteKnowledgeSource(sourceA.id, wsA);
    expect(legitDelete).toBe(true);

    const gone = await Database.getKnowledgeSourceById(sourceA.id);
    expect(gone).toBeNull();
  });

  it('should prevent cross-tenant landing page deletion', async () => {
    const uniqueSlug = 'lp-test-' + Math.random().toString(36).substring(2, 8);
    const page = await Database.saveLandingPage({
      enabled: true,
      businessName: 'Alpha Dental',
      slug: uniqueSlug,
      industry: 'healthcare',
      tagline: 'Best clinic',
      heroHeadline: 'Welcome',
      heroSubheadline: 'Your health first',
      heroCtaText: 'Book',
      themeColor: '#2563eb',
      services: [],
      workspaceId: wsA,
    });

    // Tenant B attempts to delete Tenant A's landing page
    const pageTargetId = page.id || uniqueSlug;
    const crossDelete = await Database.deleteLandingPage(pageTargetId, uniqueSlug, wsB);
    expect(crossDelete).toBe(false);

    // Verify page still exists in workspace A
    const pagesStillThere = await Database.getLandingPages(wsA);
    expect(pagesStillThere.some((p) => p.slug === uniqueSlug)).toBe(true);

    // Tenant A deletes own landing page
    const legitDelete = await Database.deleteLandingPage(pageTargetId, uniqueSlug, wsA);
    expect(legitDelete).toBe(true);

    const pagesAfter = await Database.getLandingPages(wsA);
    expect(pagesAfter.some((p) => p.slug === uniqueSlug)).toBe(false);
  });

  it('should prevent cross-tenant appointment deletion', async () => {
    const astA = await Database.createAssistant({ name: 'Appt Bot A', workspaceId: wsA });
    const aptA = await Database.saveAppointment({
      assistantId: astA.id,
      name: 'John Client',
      email: 'john@client.com',
      date: '2026-10-15',
      timeSlot: '10:00 AM',
      durationMinutes: 30,
    });

    // Tenant B attempts to delete Tenant A's appointment
    const crossDelete = await Database.deleteAppointment(aptA.id, wsB);
    expect(crossDelete).toBe(false);

    // Tenant A deletes own appointment
    const legitDelete = await Database.deleteAppointment(aptA.id, wsA);
    expect(legitDelete).toBe(true);
  });

  it('should reject insecure fallback credentials in production environment', () => {
    const origEnv = process.env.NODE_ENV;
    const origKey = process.env.ADMIN_API_KEY;
    const origPass = process.env.ADMIN_PASSWORD;

    try {
      delete process.env.ADMIN_API_KEY;
      delete process.env.ADMIN_PASSWORD;
      (process.env as any).NODE_ENV = 'production';

      expect(() => getAdminKey()).toThrow(/Fatal: Running in production without/);
    } finally {
      (process.env as any).NODE_ENV = origEnv;
      if (origKey) process.env.ADMIN_API_KEY = origKey;
      if (origPass) process.env.ADMIN_PASSWORD = origPass;
    }
  });

  it('should perform constant-time string comparisons without timing vulnerability', () => {
    expect(timingSafeStringEqual('my-secret-token', 'my-secret-token')).toBe(true);
    expect(timingSafeStringEqual('my-secret-token', 'my-wrong-token')).toBe(false);
    expect(timingSafeStringEqual('short', 'much-longer-string')).toBe(false);
    expect(timingSafeStringEqual('', '')).toBe(true);
  });

  it('should return 404/403 at API route level when tenant accesses another tenant assistant', async () => {
    const { GET: getAssistantRoute, PUT: putAssistantRoute, DELETE: deleteAssistantRoute } = await import('../../app/api/assistants/[id]/route');
    const { generateSessionToken } = await import('./auth');

    const targetBot = await Database.createAssistant({
      name: 'Alpha Confidential',
      workspaceId: wsA,
    });

    // Tenant B session token
    const tokenB = generateSessionToken('admin', 'user-beta', wsB);
    const authHeaders = { authorization: `Bearer ${tokenB}` };

    // 1. GET attempt from Tenant B
    const getReq = new Request(`http://localhost/api/assistants/${targetBot.id}`, { headers: authHeaders });
    const getRes = await getAssistantRoute(getReq, { params: Promise.resolve({ id: targetBot.id }) });
    expect(getRes.status).toBe(404);

    // 2. PUT attempt from Tenant B
    const putReq = new Request(`http://localhost/api/assistants/${targetBot.id}`, {
      method: 'PUT',
      headers: { ...authHeaders, 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Tampered' }),
    });
    const putRes = await putAssistantRoute(putReq, { params: Promise.resolve({ id: targetBot.id }) });
    expect(putRes.status).toBe(404);

    // 3. DELETE attempt from Tenant B
    const deleteReq = new Request(`http://localhost/api/assistants/${targetBot.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const deleteRes = await deleteAssistantRoute(deleteReq, { params: Promise.resolve({ id: targetBot.id }) });
    expect(deleteRes.status).toBe(404);
  });

  it('should enforce Telegram webhook secret token header requirement', async () => {
    const { POST: telegramRoute } = await import('../../app/api/channels/telegram/route');
    const { NextRequest } = await import('next/server');

    const bot = await Database.createAssistant({
      name: 'Telegram Bot Test',
      workspaceId: wsA,
      telegramBotEnabled: true,
      telegramBotToken: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
    });

    // Request WITHOUT secret token header -> must return 401
    const reqNoHeader = new NextRequest(`http://localhost/api/channels/telegram?assistantId=${bot.id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ update_id: 1001 }),
    });
    const resNoHeader = await telegramRoute(reqNoHeader);
    expect(resNoHeader.status).toBe(401);

    // Request WITH INVALID secret token header -> must return 403
    const reqInvalid = new NextRequest(`http://localhost/api/channels/telegram?assistantId=${bot.id}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-telegram-bot-api-secret-token': 'wrong-secret-token-value',
      },
      body: JSON.stringify({ update_id: 1002 }),
    });
    const resInvalid = await telegramRoute(reqInvalid);
    expect(resInvalid.status).toBe(403);
  });

  it('should enforce WhatsApp webhook signature header requirement', async () => {
    const { POST: whatsappRoute } = await import('../../app/api/channels/whatsapp/route');
    const { NextRequest } = await import('next/server');

    const bot = await Database.createAssistant({
      name: 'WhatsApp Bot Test',
      workspaceId: wsA,
      whatsappEnabled: true,
      whatsappVerifyToken: 'meta_verify_secret_123',
    });

    // Request WITHOUT x-hub-signature-256 header -> must return 401
    const reqNoSig = new NextRequest(`http://localhost/api/channels/whatsapp?assistantId=${bot.id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ entry: [] }),
    });
    const resNoSig = await whatsappRoute(reqNoSig);
    expect(resNoSig.status).toBe(401);

    // Request WITH INVALID signature -> must return 403
    const reqInvalid = new NextRequest(`http://localhost/api/channels/whatsapp?assistantId=${bot.id}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': 'sha256=0000000000000000000000000000000000000000000000000000000000000000',
      },
      body: JSON.stringify({ entry: [] }),
    });
    const resInvalid = await whatsappRoute(reqInvalid);
    expect(resInvalid.status).toBe(403);
  });

  it('should reject unauthorized cron requests with constant-time token comparison', async () => {
    const { GET: cronRoute } = await import('../../app/api/cron/reminders/route');
    const { NextRequest } = await import('next/server');

    // Missing token
    const reqNoToken = new NextRequest('http://localhost/api/cron/reminders');
    const resNoToken = await cronRoute(reqNoToken);
    expect(resNoToken.status).toBe(401);

    // Invalid token
    const reqBadToken = new NextRequest('http://localhost/api/cron/reminders', {
      headers: { authorization: 'Bearer totally-invalid-token-12345' },
    });
    const resBadToken = await cronRoute(reqBadToken);
    expect(resBadToken.status).toBe(401);
  });

  it('should enforce requireWorkspaceAssistant cross-workspace access control', async () => {
    const targetBot = await Database.createAssistant({
      name: 'Isolated Target Bot',
      workspaceId: wsA,
    });

    // Tenant A accessing own bot -> Allowed
    const allowed = await requireWorkspaceAssistant({ workspaceId: wsA }, targetBot.id);
    expect(allowed).not.toBeNull();
    expect(allowed?.id).toBe(targetBot.id);

    // Tenant B accessing Tenant A bot -> Forbidden / Null
    const forbidden = await requireWorkspaceAssistant({ workspaceId: wsB }, targetBot.id);
    expect(forbidden).toBeNull();

    // Master Admin accessing Tenant A bot -> Allowed
    const masterAccess = await requireWorkspaceAssistant({ workspaceId: '*' }, targetBot.id);
    expect(masterAccess).not.toBeNull();
    expect(masterAccess?.id).toBe(targetBot.id);

    // Non-existent assistant -> Null
    const missing = await requireWorkspaceAssistant({ workspaceId: wsA }, 'non_existent_bot_id');
    expect(missing).toBeNull();
  });

  it('should auth-gate the appointments calendar feed with per-assistant feed tokens', async () => {
    const { GET: calendarRoute } = await import('../../app/api/appointments/calendar/route');
    const { NextRequest } = await import('next/server');

    const calBot = await Database.createAssistant({
      name: 'Calendar Secured Bot',
      workspaceId: wsA,
    });

    // 1. Unauthenticated request without token -> Rejected with 401
    const unauthedReq = new NextRequest(`http://localhost/api/appointments/calendar?assistantId=${calBot.id}`);
    const unauthedRes = await calendarRoute(unauthedReq);
    expect(unauthedRes.status).toBe(401);

    // 2. Request with invalid token -> Rejected with 401
    const badTokenReq = new NextRequest(`http://localhost/api/appointments/calendar?assistantId=${calBot.id}&token=invalid_forged_token`);
    const badTokenRes = await calendarRoute(badTokenReq);
    expect(badTokenRes.status).toBe(401);

    // 3. Request with valid per-assistant feed token -> 200 OK with iCal content
    const validToken = generateCalendarFeedToken(calBot.id);
    expect(verifyCalendarFeedToken(calBot.id, validToken)).toBe(true);
    expect(verifyCalendarFeedToken(calBot.id, 'wrong-token')).toBe(false);

    const validReq = new NextRequest(`http://localhost/api/appointments/calendar?assistantId=${calBot.id}&token=${validToken}`);
    const validRes = await calendarRoute(validReq);
    expect(validRes.status).toBe(200);
    expect(validRes.headers.get('content-type')).toContain('text/calendar');
    const bodyText = await validRes.text();
    expect(bodyText).toContain('BEGIN:VCALENDAR');
  });

  it('should invalidate retrieval cache immediately when knowledge is updated or deleted', async () => {
    const cacheBot = await Database.createAssistant({
      name: 'Cache Test Bot',
      workspaceId: wsA,
    });

    const testResult = {
      condensedQuery: 'what are your prices',
      chunks: [],
      contextText: 'haircut is 25 dollars',
      citations: [],
    };

    // Populate retrieval cache
    setCachedRetrieval(cacheBot.id, 'what are your prices', testResult);
    expect(getCachedRetrieval(cacheBot.id, 'what are your prices')).not.toBeNull();
    expect(getCachedRetrieval(cacheBot.id, 'what are your prices')?.contextText).toBe('haircut is 25 dollars');

    // Invalidate cache for this assistant
    clearRetrievalCache(cacheBot.id);
    expect(getCachedRetrieval(cacheBot.id, 'what are your prices')).toBeNull();

    // Populate again and verify Database chunk mutation triggers invalidation
    setCachedRetrieval(cacheBot.id, 'what are your prices', testResult);
    expect(getCachedRetrieval(cacheBot.id, 'what are your prices')).not.toBeNull();

    const src = await Database.createKnowledgeSource({
      assistantId: cacheBot.id,
      title: 'Price Sheet',
    });

    // createKnowledgeSource triggers clearRetrievalCache
    expect(getCachedRetrieval(cacheBot.id, 'what are your prices')).toBeNull();
  });
});

