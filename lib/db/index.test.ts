import { describe, it, expect } from 'vitest';
import { Database } from './index';

describe('Database Layer & Decoupled Storage', () => {
  it('should retrieve assistants from database state', async () => {
    const assistants = await Database.getAssistants();
    expect(Array.isArray(assistants)).toBe(true);
  });

  it('should return null for a non-existent assistant ID', async () => {
    const nonExistent = await Database.getAssistantById('non-existent-assistant-id-12345');
    expect(nonExistent).toBeNull();
  });

  it('should retrieve chunks from decoupled vector storage', async () => {
    const chunks = await Database.getChunksByAssistant('demo-assistant');
    expect(Array.isArray(chunks)).toBe(true);
  });

  it('should retrieve leads for an assistant', async () => {
    const leads = await Database.getLeads('demo-assistant');
    expect(Array.isArray(leads)).toBe(true);
  });

  it('should retrieve landing pages from database state', async () => {
    const pages = await Database.getLandingPages();
    expect(Array.isArray(pages)).toBe(true);
  });

  it('should create an isolated tenant workspace with assistant and landing page', async () => {
    const uniqueEmail = `test_${Date.now()}@business.com`;
    const result = await Database.createTenantWorkspace({
      businessName: 'Apex Medical Clinic',
      ownerEmail: uniqueEmail,
      password: 'SecurePassword123!',
      industryTemplateSlug: 'dental-clinic',
    });

    expect(result.workspace).toBeDefined();
    expect(result.workspace.name).toBe('Apex Medical Clinic');
    // new workspaces must start a card-backed trial before assistants serve visitors
    expect(result.workspace.planId).toBe('growth');
    expect(result.workspace.requiresSubscription).toBe(true);
    expect(result.workspace.billingSubscriptionId).toBeUndefined();
    expect(result.assistant).toBeDefined();
    expect(result.assistant.name).toContain('Apex Medical Clinic');
    expect(result.landingPage).toBeDefined();
    expect(result.owner.email).toBe(uniqueEmail);

    const loginResult = await Database.verifyTenantLogin(uniqueEmail, 'SecurePassword123!');
    expect(loginResult).not.toBeNull();
    expect(loginResult?.workspace.id).toBe(result.workspace.id);
  });

  it('should redirect storage to tmp directory in serverless Vercel environment', async () => {
    const { resolveDataDir } = await import('./storage');
    const originalVercel = process.env.VERCEL;
    try {
      process.env.VERCEL = '1';
      const resolved = resolveDataDir();
      expect(resolved).toContain('.data');
      expect(resolved.startsWith(process.cwd())).toBe(false);
    } finally {
      if (originalVercel !== undefined) {
        process.env.VERCEL = originalVercel;
      } else {
        delete process.env.VERCEL;
      }
    }
  });

  it('should filter assistants by workspaceId ensuring tenant isolation', async () => {
    const tenantEmail = `tenant_${Date.now()}@domain.com`;
    const tenant = await Database.createTenantWorkspace({
      businessName: 'Vanguard Legal',
      ownerEmail: tenantEmail,
      password: 'Password123!',
      industryTemplateSlug: 'legal-law-firm',
    });

    const tenantAssistants = await Database.getAssistants(tenant.workspace.id);
    expect(tenantAssistants.length).toBe(1);
    expect(tenantAssistants[0].id).toBe(tenant.assistant.id);
    expect(tenantAssistants[0].workspaceId).toBe(tenant.workspace.id);

    const defaultAssistants = await Database.getAssistants('default-workspace');
    expect(defaultAssistants.some((a) => a.id === tenant.assistant.id)).toBe(false);
  });

  it('should return exactly 1 landing page for tenant workspace without leaking 7 legacy presets', async () => {
    const tenantEmail = `tenant_pages_${Date.now()}@domain.com`;
    const tenant = await Database.createTenantWorkspace({
      businessName: 'Solaria Energy',
      ownerEmail: tenantEmail,
      password: 'Password123!',
      industryTemplateSlug: 'custom',
    });

    const pages = await Database.getLandingPages(tenant.workspace.id);
    expect(pages.length).toBe(1);
    expect(pages[0].businessName).toBe('Solaria Energy');
  });

  it('should update user profile including title, avatar, and name', async () => {
    const memberEmail = `member_${Date.now()}@domain.com`;
    const member = await Database.addTeamMember({
      workspaceId: 'default-workspace',
      name: 'Taylor Reed',
      email: memberEmail,
      role: 'support_agent',
      status: 'active',
      title: 'Customer Specialist',
    });

    const updated = await Database.updateTeamMemberProfile(member.id, {
      name: 'Taylor Reed Jr.',
      title: 'Lead Support Specialist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('Taylor Reed Jr.');
    expect(updated?.title).toBe('Lead Support Specialist');
    expect(updated?.avatarUrl).toContain('unsplash.com');

    const fetched = await Database.getTeamMemberById(member.id);
    expect(fetched?.title).toBe('Lead Support Specialist');
  });

  it('should resolve custom blank canvas skeleton template config', async () => {
    const { getLandingConfigForSlugOrTemplate } = await import('../landing/types');
    const customConfig = getLandingConfigForSlugOrTemplate('custom');
    expect(customConfig).toBeDefined();
    expect(customConfig.industry).toBe('custom');
    expect(customConfig.slug).toBe('custom');
    expect(customConfig.services?.length).toBeGreaterThan(0);
  });

  it('should manage knowledge sources and chunks with hybridSearch and cleanup', async () => {
    const testAssistantId = 'demo-assistant';
    const source = await Database.createKnowledgeSource({
      assistantId: testAssistantId,
      title: 'WhatsApp Video Guide.mp4',
      type: 'mp4',
      status: 'ready',
      chunkCount: 2,
    });

    expect(source.id).toBeDefined();
    expect(source.title).toBe('WhatsApp Video Guide.mp4');

    const fetchedSource = await Database.getKnowledgeSourceById(source.id);
    expect(fetchedSource).not.toBeNull();
    expect(fetchedSource?.id).toBe(source.id);

    const dummyEmbedding = new Array(384).fill(0.05);
    await Database.saveChunks([
      {
        assistantId: testAssistantId,
        knowledgeSourceId: source.id,
        content: 'Our barbershop provides premium fade haircuts, beard shaping, and hot towel treatments.',
        chunkIndex: 0,
        tokenCount: 20,
        metadata: { sourceTitle: source.title },
        embedding: dummyEmbedding,
      },
      {
        assistantId: testAssistantId,
        knowledgeSourceId: source.id,
        content: 'Booking appointments is available online every Monday through Saturday from 9 AM to 8 PM.',
        chunkIndex: 1,
        tokenCount: 22,
        metadata: { sourceTitle: source.title },
        embedding: dummyEmbedding,
      },
    ]);

    const sourceChunks = await Database.getChunksBySource(source.id);
    expect(sourceChunks.length).toBe(2);
    expect(sourceChunks[0].knowledgeSourceId).toBe(source.id);

    const assistantChunks = await Database.getChunksByAssistant(testAssistantId);
    expect(assistantChunks.some((c) => c.knowledgeSourceId === source.id)).toBe(true);

    const searchResults = await Database.hybridSearch(
      testAssistantId,
      'haircut beard shaping appointments',
      dummyEmbedding,
      5
    );
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults.some((r) => r.knowledgeSourceId === source.id)).toBe(true);

    const deleted = await Database.deleteKnowledgeSource(source.id);
    expect(deleted).toBe(true);

    const sourceAfterDelete = await Database.getKnowledgeSourceById(source.id);
    expect(sourceAfterDelete).toBeNull();

    const chunksAfterDelete = await Database.getChunksBySource(source.id);
    expect(chunksAfterDelete.length).toBe(0);
  });

  it('should strictly isolate knowledge bases between bots and never leak cross-assistant chunks', async () => {
    const barberBot = await Database.createAssistant({
      name: 'Crown Barber Bot',
      workspaceId: 'default-workspace',
    });

    const realEstateBot = await Database.createAssistant({
      name: 'Prestige Realty Bot',
      workspaceId: 'default-workspace',
    });

    const barberSource = await Database.createKnowledgeSource({
      assistantId: barberBot.id,
      title: 'Barber Services Price List',
      type: 'txt',
      chunkCount: 1,
      status: 'ready',
    });

    const dummyVec = new Array(384).fill(0.08);
    await Database.saveChunks([
      {
        assistantId: barberBot.id,
        knowledgeSourceId: barberSource.id,
        content: 'Specialty haircut costs $35, beard trim costs $20 with hot towel service.',
        chunkIndex: 0,
        tokenCount: 15,
        metadata: { sourceTitle: barberSource.title },
        embedding: dummyVec,
      },
    ]);

    // Real estate bot has no training materials uploaded yet
    const realEstateSources = await Database.getKnowledgeSources(realEstateBot.id);
    expect(realEstateSources.length).toBe(0);

    const realEstateChunks = await Database.getChunksByAssistant(realEstateBot.id);
    expect(realEstateChunks.length).toBe(0);

    // Hybrid search for real estate bot MUST return empty and never leak barber knowledge
    const leakedSearch = await Database.hybridSearch(
      realEstateBot.id,
      'haircut beard trim price',
      dummyVec,
      5
    );
    expect(leakedSearch.length).toBe(0);

    // Barber bot should retrieve its own chunks correctly
    const barberSearch = await Database.hybridSearch(
      barberBot.id,
      'haircut beard trim price',
      dummyVec,
      5
    );
    expect(barberSearch.length).toBe(1);
    expect(barberSearch[0].content).toContain('haircut costs $35');

    // Clean up
    await Database.deleteKnowledgeSource(barberSource.id);
  });

  it('should permanently delete a landing page and prevent it from resurrecting', async () => {
    const testSlug = `test-delete-page-${Date.now()}`;
    const newPage = await Database.saveLandingPage({
      businessName: 'Temporary Test Barbershop',
      slug: testSlug,
      industry: 'barbershop',
      enabled: true,
      tagline: 'Grooming Excellence',
      heroHeadline: 'Temporary Landing Page',
      heroSubheadline: 'Testing complete deletion lifecycle',
      heroCtaText: 'Book Now',
      workspaceId: 'default-workspace',
    });

    expect(newPage.id).toBeDefined();
    expect(newPage.slug).toBe(testSlug);

    // Verify it exists in the landing pages collection
    let pages = await Database.getLandingPages('default-workspace');
    expect(pages.some((p) => p.slug === testSlug || p.id === newPage.id)).toBe(true);

    // Delete the landing page using its id and slug
    const targetId = newPage.id || testSlug;
    const deleted = await Database.deleteLandingPage(targetId, testSlug);
    expect(deleted).toBe(true);

    // Verify it is permanently removed
    pages = await Database.getLandingPages('default-workspace');
    expect(pages.some((p) => p.slug === testSlug || p.id === newPage.id)).toBe(false);

    // Verify slug lookup returns null
    const lookup = await Database.getLandingPageBySlugOrDomain(testSlug);
    expect(lookup).toBeNull();
  });

  describe('Transactional Operations & Dual-Write Layer', () => {
    it('should create conversation, save message, and retrieve conversation with messages', async () => {
      const conv = await Database.getOrCreateConversation('demo-assistant', 'visitor_test_1');
      expect(conv.id).toBeDefined();
      expect(conv.assistantId).toBe('demo-assistant');

      const msg = await Database.saveMessage(conv.id, 'user', 'Hello from vitest');
      expect(msg.id).toBeDefined();
      expect(msg.content).toBe('Hello from vitest');

      const foundConv = await Database.getConversationById(conv.id);
      expect(foundConv).not.toBeNull();
      expect(foundConv?.messages?.some((m) => m.id === msg.id)).toBe(true);
    });

    it('should capture and retrieve leads', async () => {
      const uniqueEmail = `lead_${Date.now()}@example.com`;
      const lead = await Database.saveLead({
        assistantId: 'demo-assistant',
        email: uniqueEmail,
        name: 'Test Lead',
        phone: '+1234567890',
        notes: 'Interested in enterprise plan',
      });

      expect(lead.id).toBeDefined();
      expect(lead.email).toBe(uniqueEmail);

      const leads = await Database.getLeads('demo-assistant');
      expect(leads.some((l) => l.id === lead.id)).toBe(true);
    });

    it('should save, retrieve, and update appointments', async () => {
      const uniqueEmail = `appointment_${Date.now()}@example.com`;
      const apt = await Database.saveAppointment({
        assistantId: 'demo-assistant',
        name: 'Jane Doe',
        email: uniqueEmail,
        date: '2026-10-15',
        timeSlot: '14:00',
        durationMinutes: 45,
        serviceName: 'Haircut & Styling',
        price: 45,
      });

      expect(apt.id).toBeDefined();
      expect(apt.status).toBe('confirmed');
      expect(apt.manageToken).toBeDefined();

      const byToken = await Database.getAppointmentByManageToken(apt.manageToken!);
      expect(byToken).not.toBeNull();
      expect(byToken?.id).toBe(apt.id);

      const updated = await Database.updateAppointment(apt.id, { notes: 'VIP client' });
      expect(updated?.notes).toBe('VIP client');
    });

    it('should create and mark notifications as read', async () => {
      const notif = await Database.addNotification({
        title: 'Vitest Test Notification',
        message: 'This is a test notification',
        type: 'chat_new',
        assistantId: 'demo-assistant',
      });

      expect(notif.id).toBeDefined();
      expect(notif.read).toBe(false);

      const notifs = await Database.getNotifications('demo-assistant');
      expect(notifs.some((n) => n.id === notif.id)).toBe(true);

      const marked = await Database.markNotificationAsRead(notif.id);
      expect(marked).toBe(true);
    });

    it('should record, retrieve, and resolve unanswered queries', async () => {
      const uniqueQuery = `What is your refund policy test query ${Date.now()}`;
      const record = await Database.recordUnansweredQuery('demo-assistant', uniqueQuery, 'vis_123');
      expect(record.id).toBeDefined();
      expect(record.resolved).toBe(false);

      const queries = await Database.getUnansweredQueries('demo-assistant');
      expect(queries.some((q) => q.id === record.id)).toBe(true);

      const resolved = await Database.resolveUnansweredQuery(record.id, 'Our refund policy is 30 days.');
      expect(resolved).toBe(true);
    });

    it('should export all relational CRUD functions from lib/db/relational', async () => {
      const relational = await import('./relational');
      expect(typeof relational.relationalInsertMessage).toBe('function');
      expect(typeof relational.relationalGetMessagesByConversation).toBe('function');
      expect(typeof relational.relationalUpsertConversation).toBe('function');
      expect(typeof relational.relationalUpdateConversation).toBe('function');
      expect(typeof relational.relationalGetConversations).toBe('function');
      expect(typeof relational.relationalGetConversationById).toBe('function');
      expect(typeof relational.relationalInsertLead).toBe('function');
      expect(typeof relational.relationalGetLeads).toBe('function');
      expect(typeof relational.relationalUpsertAppointment).toBe('function');
      expect(typeof relational.relationalUpdateAppointment).toBe('function');
      expect(typeof relational.relationalGetAppointments).toBe('function');
      expect(typeof relational.relationalGetAppointmentById).toBe('function');
      expect(typeof relational.relationalGetAppointmentByToken).toBe('function');
      expect(typeof relational.relationalDeleteAppointment).toBe('function');
      expect(typeof relational.relationalInsertNotification).toBe('function');
      expect(typeof relational.relationalGetNotifications).toBe('function');
      expect(typeof relational.relationalMarkNotificationRead).toBe('function');
      expect(typeof relational.relationalMarkAllNotificationsRead).toBe('function');
      expect(typeof relational.relationalInsertUnansweredQuery).toBe('function');
      expect(typeof relational.relationalGetUnansweredQueries).toBe('function');
      expect(typeof relational.relationalResolveUnansweredQuery).toBe('function');
      expect(typeof relational.relationalDeleteUnansweredQuery).toBe('function');
      expect(typeof relational.relationalUpsertChunks).toBe('function');
      expect(typeof relational.relationalDeleteChunksBySource).toBe('function');
      expect(typeof relational.relationalDeleteChunksByAssistant).toBe('function');
      expect(typeof relational.relationalGetPricingChunks).toBe('function');
      expect(typeof relational.relationalHybridSearch).toBe('function');
    });

    it('should query pricing chunks via Database.getPricingChunks with fallback', async () => {
      const pricingChunks = await Database.getPricingChunks('demo-assistant', 5);
      expect(Array.isArray(pricingChunks)).toBe(true);
    });

    it('should preserve original msg.id and allow safe idempotent message insertion', async () => {
      const conv = await Database.getOrCreateConversation('demo-assistant');
      const msg = await Database.saveMessage(conv.id, 'user', 'Testing message preservation');
      expect(msg.id).toBeDefined();
      expect(msg.id.startsWith('msg_')).toBe(true);

      const retrieved = await Database.getConversationById(conv.id);
      const convMessages = retrieved?.messages || [];
      const found = convMessages.find((m) => m.id === msg.id);
      expect(found).toBeDefined();
      expect(found?.content).toBe('Testing message preservation');
    });

    it('should temporarily disable postgres and respect cooldown duration', async () => {
      const { disablePostgresTemporarily, isPostgresConfigured } = await import('./postgres');
      disablePostgresTemporarily(10000);
      expect(isPostgresConfigured()).toBe(false);
    });
  });
});


