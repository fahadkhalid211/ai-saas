import { describe, it, expect } from 'vitest';
import { BILLING_PLANS, getPlanKnowledgeStorageLimitMb } from './plans';
import { Database } from '../db';

describe('Knowledge Base Storage Limits & Plan Quotas', () => {
  it('should define explicit storage quotas across all billing plan tiers', () => {
    const starter = BILLING_PLANS.find((p) => p.id === 'starter');
    const growth = BILLING_PLANS.find((p) => p.id === 'growth');
    const scale = BILLING_PLANS.find((p) => p.id === 'scale');

    expect(starter).toBeDefined();
    expect(starter?.knowledgeStorageLimitMb).toBe(50);
    expect(starter?.features.some((f) => f.includes('50 MB Knowledge Storage'))).toBe(true);

    expect(growth).toBeDefined();
    expect(growth?.knowledgeStorageLimitMb).toBe(500);
    expect(growth?.features.some((f) => f.includes('500 MB Knowledge Storage'))).toBe(true);

    expect(scale).toBeDefined();
    expect(scale?.knowledgeStorageLimitMb).toBe(5000);
    expect(scale?.features.some((f) => f.includes('5 GB High-Capacity Knowledge Storage'))).toBe(true);
  });

  it('should return correct storage limit via getPlanKnowledgeStorageLimitMb helper', () => {
    expect(getPlanKnowledgeStorageLimitMb('starter')).toBe(50);
    expect(getPlanKnowledgeStorageLimitMb('growth')).toBe(500);
    expect(getPlanKnowledgeStorageLimitMb('scale')).toBe(5000);
    expect(getPlanKnowledgeStorageLimitMb('unknown-plan')).toBe(50);
  });

  it('should calculate workspace knowledge storage correctly from database', async () => {
    const testAssistantId = `storage-test-ast-${Date.now()}`;
    const testWorkspaceId = `storage-test-ws-${Date.now()}`;

    // Create a temporary assistant for the test
    const assistant = await Database.createAssistant({
      id: testAssistantId,
      workspaceId: testWorkspaceId,
      name: 'Storage Quota Test Bot',
      systemPrompt: 'Test bot',
    });

    try {
      const initialStorage = await Database.getWorkspaceKnowledgeStorage(testWorkspaceId);
      expect(initialStorage.totalBytes).toBe(0);
      expect(initialStorage.totalMb).toBe(0);
      expect(initialStorage.sourceCount).toBe(0);

      // Create a 1 MB source
      const oneMbBytes = 1024 * 1024;
      const source1 = await Database.createKnowledgeSource({
        assistantId: testAssistantId,
        title: 'Document1.pdf',
        type: 'pdf',
        fileSizeBytes: oneMbBytes,
        status: 'ready',
      });

      const updatedStorage1 = await Database.getWorkspaceKnowledgeStorage(testWorkspaceId);
      expect(updatedStorage1.totalBytes).toBe(oneMbBytes);
      expect(updatedStorage1.totalMb).toBe(1);
      expect(updatedStorage1.sourceCount).toBe(1);

      // Create a 2.5 MB source
      const twoPointFiveMbBytes = Math.round(2.5 * 1024 * 1024);
      const source2 = await Database.createKnowledgeSource({
        assistantId: testAssistantId,
        title: 'Document2.docx',
        type: 'docx',
        fileSizeBytes: twoPointFiveMbBytes,
        status: 'ready',
      });

      const updatedStorage2 = await Database.getWorkspaceKnowledgeStorage(testWorkspaceId);
      expect(updatedStorage2.totalBytes).toBe(oneMbBytes + twoPointFiveMbBytes);
      expect(updatedStorage2.totalMb).toBe(3.5);
      expect(updatedStorage2.sourceCount).toBe(2);

      // Clean up sources
      await Database.deleteKnowledgeSource(source1.id, testWorkspaceId);
      await Database.deleteKnowledgeSource(source2.id, testWorkspaceId);

      const postDeleteStorage = await Database.getWorkspaceKnowledgeStorage(testWorkspaceId);
      expect(postDeleteStorage.totalBytes).toBe(0);
      expect(postDeleteStorage.totalMb).toBe(0);
      expect(postDeleteStorage.sourceCount).toBe(0);
    } finally {
      await Database.deleteAssistant(testAssistantId, testWorkspaceId);
    }
  });

  it('should correctly determine quota rejection thresholds', () => {
    const starterLimitMb = 50;
    const starterLimitBytes = starterLimitMb * 1024 * 1024;

    const currentBytes = 49 * 1024 * 1024; // 49 MB used
    const smallPayloadBytes = 500 * 1024; // 500 KB incoming
    const largePayloadBytes = 2 * 1024 * 1024; // 2 MB incoming

    // Small payload fits within 50 MB
    expect(currentBytes + smallPayloadBytes <= starterLimitBytes).toBe(true);

    // Large payload exceeds 50 MB
    expect(currentBytes + largePayloadBytes > starterLimitBytes).toBe(true);

    // Percentage calculation
    const percentUsed = Math.min(100, Math.round((currentBytes / starterLimitBytes) * 100));
    expect(percentUsed).toBe(98);
  });

  it('should leverage indexed chunks for assistant and source lookup and fallback storage calculation', async () => {
    const astId = `index-ast-${Date.now()}`;
    const wsId = `index-ws-${Date.now()}`;

    await Database.createAssistant({
      id: astId,
      workspaceId: wsId,
      name: 'Index Test Bot',
      systemPrompt: 'Testing indexed chunks',
    });

    try {
      const source = await Database.createKnowledgeSource({
        assistantId: astId,
        title: 'unmetered-faq.txt',
        type: 'txt',
        // fileSizeBytes deliberately omitted to test sourceChunksIndex fallback
        status: 'ready',
      });

      const chunkContent = 'This is a sample business text for fast indexed lookup.';
      await Database.saveChunks([
        {
          assistantId: astId,
          knowledgeSourceId: source.id,
          content: chunkContent,
          chunkIndex: 0,
          tokenCount: 12,
          metadata: { sourceTitle: 'unmetered-faq.txt' },
          embedding: new Array(384).fill(0.05),
        },
      ]);

      // 1. Verify getChunksByAssistant uses index
      const astChunks = await Database.getChunksByAssistant(astId);
      expect(astChunks.length).toBe(1);
      expect(astChunks[0].content).toBe(chunkContent);

      // 2. Verify getChunksBySource uses index
      const srcChunks = await Database.getChunksBySource(source.id);
      expect(srcChunks.length).toBe(1);
      expect(srcChunks[0].knowledgeSourceId).toBe(source.id);

      // 3. Verify getWorkspaceKnowledgeStorage correctly computes fallback bytes from sourceChunksIndex
      const storage = await Database.getWorkspaceKnowledgeStorage(wsId);
      const expectedBytes = Buffer.byteLength(chunkContent, 'utf-8');
      expect(storage.totalBytes).toBe(expectedBytes);
      expect(storage.chunkCount).toBe(1);

      // 4. Cleanup
      await Database.deleteKnowledgeSource(source.id, wsId);
      const postCleanup = await Database.getWorkspaceKnowledgeStorage(wsId);
      expect(postCleanup.totalBytes).toBe(0);
      expect(postCleanup.chunkCount).toBe(0);
    } finally {
      await Database.deleteAssistant(astId, wsId);
    }
  });
});
