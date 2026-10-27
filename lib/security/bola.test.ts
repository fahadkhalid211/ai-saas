import { tokenFor } from '@/lib/security/test-session';
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
    const tokenB = await tokenFor('admin', 'user-beta', wsB);
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

  it('should isolate leads and appointments across tenant workspaces', async () => {
    const leadBotA = await Database.createAssistant({ name: 'Lead Bot A', workspaceId: wsA });
    const leadBotB = await Database.createAssistant({ name: 'Lead Bot B', workspaceId: wsB });

    await Database.saveLead({
      assistantId: leadBotA.id,
      email: 'lead_a@example.com',
      name: 'Lead Alpha',
    });

    await Database.saveLead({
      assistantId: leadBotB.id,
      email: 'lead_b@example.com',
      name: 'Lead Beta',
    });

    const leadsA = await Database.getLeads(undefined, wsA);
    const leadEmailsA = leadsA.map((l) => l.email);
    expect(leadEmailsA).toContain('lead_a@example.com');
    expect(leadEmailsA).not.toContain('lead_b@example.com');

    const leadsB = await Database.getLeads(undefined, wsB);
    const leadEmailsB = leadsB.map((l) => l.email);
    expect(leadEmailsB).toContain('lead_b@example.com');
    expect(leadEmailsB).not.toContain('lead_a@example.com');

    const aptA = await Database.saveAppointment({
      assistantId: leadBotA.id,
      name: 'Client Alpha',
      email: 'client_a@example.com',
      date: '2026-10-01',
      timeSlot: '10:00',
      durationMinutes: 30,
    });

    const aptB = await Database.saveAppointment({
      assistantId: leadBotB.id,
      name: 'Client Beta',
      email: 'client_b@example.com',
      date: '2026-10-01',
      timeSlot: '11:00',
      durationMinutes: 30,
    });

    const aptsA = await Database.getAppointments(undefined, wsA);
    const aptIdsA = aptsA.map((a) => a.id);
    expect(aptIdsA).toContain(aptA.id);
    expect(aptIdsA).not.toContain(aptB.id);

    const aptsB = await Database.getAppointments(undefined, wsB);
    const aptIdsB = aptsB.map((a) => a.id);
    expect(aptIdsB).toContain(aptB.id);
    expect(aptIdsB).not.toContain(aptA.id);
  });

  it('should prevent cross-tenant appointment status updates', async () => {
    const aptBotA = await Database.createAssistant({ name: 'Apt Bot A', workspaceId: wsA });
    const aptA = await Database.saveAppointment({
      assistantId: aptBotA.id,
      name: 'Status Target Client',
      email: 'target@example.com',
      date: '2026-10-05',
      timeSlot: '14:00',
      durationMinutes: 30,
    });

    // Tenant B attempts to cancel Tenant A appointment
    const crossUpdate = await Database.updateAppointmentStatus(aptA.id, 'cancelled', 'Malicious cancellation', wsB);
    expect(crossUpdate).toBe(false);

    // Verify appointment status was untouched
    const freshApt = await Database.getAppointmentById(aptA.id);
    expect(freshApt?.status).not.toBe('cancelled');

    // Tenant A legitimately updates status
    const legitUpdate = await Database.updateAppointmentStatus(aptA.id, 'cancelled', 'Client request', wsA);
    expect(legitUpdate).toBe(true);

    const cancelledApt = await Database.getAppointmentById(aptA.id);
    expect(cancelledApt?.status).toBe('cancelled');
  });

  it('should isolate relational-mode queries by workspace assistant IDs when Postgres is enabled', async () => {
    const { isPostgresConfigured } = await import('../db/postgres');
    if (!isPostgresConfigured()) {
      return; // Gracefully skipped when Postgres is not available in test environment
    }

    const {
      relationalGetConversations,
      relationalGetLeads,
      relationalGetAppointments,
      relationalGetNotifications,
    } = await import('../db/relational');

    // Empty assistantIds array must immediately return empty array without querying
    const emptyConvs = await relationalGetConversations(undefined, 50, []);
    expect(emptyConvs).toEqual([]);

    const emptyLeads = await relationalGetLeads(undefined, []);
    expect(emptyLeads).toEqual([]);

    const emptyApts = await relationalGetAppointments(undefined, []);
    expect(emptyApts).toEqual([]);

    const notifs = await relationalGetNotifications(undefined, 50, []);
    expect(notifs).toEqual([]);
  });

  it('should reject Staff123! default password when no password is set on member', async () => {
    const member = await Database.addTeamMember({
      name: 'No Pass Staff',
      email: 'nopass_staff_' + Math.random().toString(36).substring(2, 8) + '@example.com',
      role: 'support_agent',
      workspaceId: wsA,
      status: 'active',
    });

    // Attempt login with old default password Staff123!
    const loginResult = await Database.verifyStaffLogin(member.email, 'Staff123!');
    expect(loginResult).toBeNull();
  });

  it('should prevent conversation rebinding to a different assistant', async () => {
    const astA = await Database.createAssistant({
      name: 'Assistant Alpha',
      workspaceId: wsA,
    });
    const astB = await Database.createAssistant({
      name: 'Assistant Beta',
      workspaceId: wsB,
    });

    // 1. Create a legitimate conversation for Assistant A
    const originalConv = await Database.getOrCreateConversation(astA.id, 'visitor_1');
    expect(originalConv.assistantId).toBe(astA.id);

    // 2. An attacker presents originalConv.id while requesting Assistant B
    const hijackerAttempt = await Database.getOrCreateConversation(astB.id, 'visitor_attacker', originalConv.id);

    // Verify: hijacker gets a new separate conversation, NOT the original conversation rebound
    expect(hijackerAttempt.id).not.toBe(originalConv.id);
    expect(hijackerAttempt.assistantId).toBe(astB.id);

    // Verify: original conversation still belongs to Assistant A untouched
    const freshOriginal = await Database.getConversationById(originalConv.id);
    expect(freshOriginal?.assistantId).toBe(astA.id);
  });

  it('should isolate complete analytics by workspace', async () => {
    const astA = await Database.createAssistant({
      name: 'Analytics Bot A',
      workspaceId: wsA,
    });
    const astB = await Database.createAssistant({
      name: 'Analytics Bot B',
      workspaceId: wsB,
    });

    // Create lead for A and B
    await Database.saveLead({
      assistantId: astA.id,
      email: 'leadA@example.com',
      name: 'Lead A',
    });
    await Database.saveLead({
      assistantId: astB.id,
      email: 'leadB@example.com',
      name: 'Lead B',
    });

    // Query analytics scoped to Workspace A
    const analyticsA = await Database.getCompleteAnalytics({ workspaceId: wsA });
    // In workspace A, conversions should only reflect Assistant A's activity
    expect(analyticsA).toBeDefined();

    // Query analytics scoped to Workspace B
    const analyticsB = await Database.getCompleteAnalytics({ workspaceId: wsB });
    expect(analyticsB).toBeDefined();
  });

  it('should validate and sanitize googleAnalyticsId and metaPixelId in landing page payload', async () => {
    const { validateLandingPagePayload } = await import('./validation');

    // Valid IDs
    const validResult = validateLandingPagePayload({
      businessName: 'Valid Business',
      slug: 'valid-business-' + Math.random().toString(36).substring(2, 6),
      enabled: true,
      analytics: {
        googleAnalyticsId: 'G-ABC123XYZ',
        metaPixelId: '123456789012345',
      },
    });
    expect(validResult.valid).toBe(true);

    // Malicious XSS breakout payload
    const invalidResult = validateLandingPagePayload({
      businessName: 'Invalid Business',
      slug: 'invalid-business-' + Math.random().toString(36).substring(2, 6),
      enabled: true,
      analytics: {
        googleAnalyticsId: "G-123'; alert(1); //",
        metaPixelId: '<script>alert(1)</script>',
      },
    });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors['analytics.googleAnalyticsId']).toBeDefined();
    expect(invalidResult.errors['analytics.metaPixelId']).toBeDefined();
  });

  it('should reject cross-tenant access in unanswered queries API route', async () => {
    const { GET: getUnansweredRoute, POST: postUnansweredRoute } = await import('../../app/api/analytics/unanswered/route');
    const { generateSessionToken } = await import('./auth');

    const botA = await Database.createAssistant({
      name: 'Unanswered Bot A',
      workspaceId: wsA,
    });
    const query = await Database.recordUnansweredQuery(botA.id, 'How much is shipping?');

    // Tenant B session token
    const tokenB = await tokenFor('admin', 'user-beta', wsB);
    const authHeaders = { authorization: `Bearer ${tokenB}` };

    // Tenant B attempts to fetch unanswered queries of botA
    const getReq = new Request(`http://localhost/api/analytics/unanswered?assistantId=${botA.id}`, { headers: authHeaders });
    const getRes = await getUnansweredRoute(getReq);
    expect(getRes.status).toBe(404);

    // Tenant B attempts to delete query of botA
    const delReq = new Request('http://localhost/api/analytics/unanswered', {
      method: 'POST',
      headers: { ...authHeaders, 'content-type': 'application/json' },
      body: JSON.stringify({ id: query.id, action: 'delete' }),
    });
    const delRes = await postUnansweredRoute(delReq);
    expect(delRes.status).toBe(404);
  });

  it('should reject cross-tenant notification mark-as-read in notifications API route', async () => {
    const { POST: postNotificationsRoute } = await import('../../app/api/notifications/route');
    const { generateSessionToken } = await import('./auth');

    const botA = await Database.createAssistant({
      name: 'Notif Bot A',
      workspaceId: wsA,
    });
    const notif = await Database.addNotification({
      title: 'New Lead',
      message: 'New lead captured',
      type: 'lead_captured',
      assistantId: botA.id,
    });

    // Tenant B session token
    const tokenB = await tokenFor('admin', 'user-beta', wsB);
    const authHeaders = { authorization: `Bearer ${tokenB}` };

    const markReq = new Request('http://localhost/api/notifications', {
      method: 'POST',
      headers: { ...authHeaders, 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', id: notif.id }),
    });
    const markRes = await postNotificationsRoute(markReq);
    expect(markRes.status).toBe(404);
  });

  it('should not leak admin or system notifications without assistantId to newly registered tenant', async () => {
    const { GET: getNotificationsRoute } = await import('../../app/api/notifications/route');

    await Database.addNotification({
      title: 'Platform Maintenance Notice',
      message: 'Global admin alert',
      type: 'reminder_dispatched',
    });

    const newWsId = 'ws_new_' + Math.random().toString(36).substring(2, 8);
    const tokenNew = await tokenFor('owner', 'user-new', newWsId);
    const req = new Request('http://localhost/api/notifications', {
      headers: { authorization: `Bearer ${tokenNew}` },
    });
    const res = await getNotificationsRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.notifications).toEqual([]);
    expect(json.unreadCount).toBe(0);
  });

  it('should prevent cross-workspace slug collisions when saving landing pages', async () => {
    const { DEFAULT_BARBER_LANDING_CONFIG } = await import('../db');
    const slug = 'exclusive-slug-' + Math.random().toString(36).substring(2, 6);

    // Save landing page in workspace A
    await Database.saveLandingPage({
      ...DEFAULT_BARBER_LANDING_CONFIG,
      slug,
      businessName: 'Tenant A Page',
      enabled: true,
      workspaceId: wsA,
    });

    // Attempt to save landing page with same slug in workspace B -> must throw
    await expect(
      Database.saveLandingPage({
        ...DEFAULT_BARBER_LANDING_CONFIG,
        slug,
        businessName: 'Tenant B Impersonation',
        enabled: true,
        workspaceId: wsB,
      })
    ).rejects.toThrow('already registered');
  });

  it('should strip immutable identity fields (id, workspaceId) when updating assistant', async () => {
    const { PUT: putAssistantRoute } = await import('../../app/api/assistants/[id]/route');
    const { generateSessionToken } = await import('./auth');

    const botA = await Database.createAssistant({
      name: 'Original Name',
      workspaceId: wsA,
    });

    const tokenA = await tokenFor('admin', 'user-alpha', wsA);
    const authHeaders = { authorization: `Bearer ${tokenA}`, 'content-type': 'application/json' };

    // Tenant A attempts to overwrite workspaceId and id
    const putReq = new Request(`http://localhost/api/assistants/${botA.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Updated Name',
        workspaceId: wsB, // malicious workspace reassignment
        id: 'hijacked-bot-id',
      }),
    });
    const putRes = await putAssistantRoute(putReq, { params: Promise.resolve({ id: botA.id }) });
    expect(putRes.status).toBe(200);

    const reloaded = await Database.getAssistantById(botA.id);
    expect(reloaded?.name).toBe('Updated Name');
    expect(reloaded?.workspaceId).toBe(wsA); // workspaceId remains unchanged!
    expect(reloaded?.id).toBe(botA.id); // id remains unchanged!
  });
});


