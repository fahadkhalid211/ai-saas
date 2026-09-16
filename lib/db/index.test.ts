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
    expect(result.workspace.planId).toBe('starter');
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
});

