import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { BILLING_PLANS } from '@/lib/billing/plans';
import { extractFromUrl, isYouTubeUrl, YOUTUBE_NOT_SUPPORTED_MESSAGE } from '@/lib/rag/url-extractor';
import { applyCostCapToMedia } from '@/lib/ai/spend/guard';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { diagnoseKnowledgeFailure } from '@/lib/rag/diagnostics';
import { withRoleAuth, getAuthContext, requireWorkspaceAssistant } from '@/lib/security/auth';
import { validateSafeExternalUrl } from '@/lib/security/ssrf';
import { clearRetrievalCache } from '@/lib/rag/cache';
import { getClientIp, enforceRateLimit } from '@/lib/security/rate-limit';
import { logged } from '@/lib/logging/route';

// Webpage scraping falls back through up to three tiers (direct fetch, curl,
// Jina reader) and media extraction can involve transcription, so
// this route needs more headroom than a typical short-lived API route.
export const maxDuration = 300;

const POSTHandler = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const rateLimit = enforceRateLimit(req, 'knowledge-url', { windowMs: 60 * 1000, max: 20 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const ctx = await getAuthContext(req);
    const body = await req.json();
    const { assistantId, url, customTitle } = body;

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId is required' }, { status: 400 });
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    const cleanUrl = url.trim();

    // YouTube links are not supported: refused here, before a failed record is made for them
    if (isYouTubeUrl(cleanUrl)) {
      return NextResponse.json({ error: YOUTUBE_NOT_SUPPORTED_MESSAGE }, { status: 400 });
    }

    // SSRF Check: Prevent access to internal addresses, loopback, and cloud metadata
    const ssrfCheck = await validateSafeExternalUrl(cleanUrl);
    if (!ssrfCheck.safe) {
      return NextResponse.json(
        { error: ssrfCheck.error || 'Blocked: Target URL points to an internal or forbidden address.' },
        { status: 400 }
      );
    }

    const assistant = await requireWorkspaceAssistant(ctx, assistantId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found or forbidden' }, { status: 404 });
    }

    // Storage Quota Enforcement (Pre-Extraction Check)
    const targetWorkspaceId = assistant.workspaceId || (ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace');
    const wsBilling = await Database.getWorkspaceBilling(targetWorkspaceId);
    const plan = BILLING_PLANS.find((p) => p.id === wsBilling.planId) || BILLING_PLANS[0];
    const storageLimitMb = plan.knowledgeStorageLimitMb;
    const storageLimitBytes = storageLimitMb * 1024 * 1024;
    const currentStorage = await Database.getWorkspaceKnowledgeStorage(targetWorkspaceId);

    if (currentStorage.totalBytes >= storageLimitBytes) {
      return NextResponse.json(
        {
          success: false,
          storageLimitReached: true,
          error: `Knowledge Base storage limit reached. Your ${plan.name} plan includes ${storageLimitMb} MB of knowledge storage (Current: ${currentStorage.totalMb} MB used). Upgrade your plan to index additional content.`,
          currentStorageMb: currentStorage.totalMb,
          limitMb: storageLimitMb,
          planName: plan.name,
          planId: plan.id,
        },
        { status: 403 }
      );
    }

    // 1. Create Knowledge Source in DB
    const initialType = 'web';

    const source = await Database.createKnowledgeSource({
      assistantId,
      title: customTitle?.trim() || cleanUrl,
      type: initialType,
      fileUrl: cleanUrl,
      status: 'processing',
    });

    try {
      // 2. Extract content from URL (direct media, or webpage)
      console.log(`[URLRoute] Extracting knowledge from ${cleanUrl} for assistant ${assistantId}...`);
      // video and audio links are transcribed on the assistant's key, so they count toward its monthly cost cap
      const media = await applyCostCapToMedia(assistant, { apiKey: assistant.apiKeyEncrypted, provider: assistant.provider });
      const doc = await extractFromUrl(cleanUrl, media.options).finally(() => media.settle());

      const docByteSize = Buffer.byteLength(doc.content || '', 'utf-8');
      if (currentStorage.totalBytes + docByteSize > storageLimitBytes) {
        await Database.deleteKnowledgeSource(source.id, ctx.workspaceId);
        const currentMb = currentStorage.totalMb;
        const incomingMb = Number((docByteSize / (1024 * 1024)).toFixed(2));
        return NextResponse.json(
          {
            success: false,
            storageLimitReached: true,
            error: `Knowledge Base storage limit exceeded by extracted URL content (${incomingMb} MB). Your ${plan.name} plan includes ${storageLimitMb} MB of knowledge storage (Current: ${currentMb} MB used). Upgrade your plan to index this content.`,
            currentStorageMb: currentMb,
            limitMb: storageLimitMb,
            incomingMb,
            planName: plan.name,
            planId: plan.id,
          },
          { status: 403 }
        );
      }

      // 3. Chunk document
      const rawChunks = chunkDocument(doc);
      if (rawChunks.length === 0) {
        throw new Error('No readable text content extracted from this URL');
      }

      // 4. Generate local 384-dimensional embeddings ($0 cost)
      const textsToEmbed = rawChunks.map((c) => c.content);
      const embeddings = await generateEmbeddingsBatch(textsToEmbed);

      // 5. Store chunk records
      const chunkRecords = rawChunks.map((chunk, i) => ({
        assistantId,
        knowledgeSourceId: source.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        tokenCount: chunk.tokenCount,
        metadata: {
          ...chunk.metadata,
          sourceTitle: doc.title,
          sourceType: doc.type,
          url: cleanUrl,
        },
        embedding: embeddings[i],
      }));

      await Database.saveChunks(chunkRecords);

      // 6. Update Knowledge Source with official title, type, fileSizeBytes and chunk count
      await Database.updateKnowledgeSource(source.id, {
        title: customTitle?.trim() || doc.title,
        type: doc.type,
        fileSizeBytes: docByteSize,
        status: 'ready',
        chunkCount: chunkRecords.length,
      });

      clearRetrievalCache(assistantId);

      await Database.addAuditLog({
        workspaceId: targetWorkspaceId,
        actor: {
          id: ctx.memberId,
          name: ctx.role === 'owner' ? 'Workspace Owner' : 'Admin User',
          ip: getClientIp(req),
        },
        action: 'knowledge.scraped',
        targetType: 'assistant',
        targetId: assistantId,
        details: {
          url: cleanUrl,
          title: customTitle?.trim() || doc.title,
          chunkCount: chunkRecords.length,
          type: doc.type,
        },
      });

      return NextResponse.json({
        success: true,
        source: {
          id: source.id,
          title: doc.title,
          type: doc.type,
          chunks: chunkRecords.length,
          status: 'ready',
        },
      });
    } catch (extractErr: any) {
      console.error(`[URLRoute] Failed extracting from ${cleanUrl}:`, extractErr);
      const diag = diagnoseKnowledgeFailure({
        filename: cleanUrl,
        type: initialType,
        errorMessage: extractErr?.message,
      });

      await Database.updateKnowledgeSource(source.id, {
        status: 'failed',
        errorMessage: diag.reason,
        errorResolution: diag.whatToDoNext,
      });

      return NextResponse.json({
        success: false,
        error: diag.reason,
        whatToDoNext: diag.whatToDoNext,
        source: {
          id: source.id,
          title: cleanUrl,
          type: initialType,
          status: 'failed',
          error: diag.reason,
          whatToDoNext: diag.whatToDoNext,
        },
      });
    }
  } catch (error: any) {
    console.error('[URLRoute] Global error:', error);
    return NextResponse.json(
      { error: error?.message || 'URL knowledge ingestion failed' },
      { status: 500 }
    );
  }
});

export const POST = logged(POSTHandler, { route: '/api/knowledge/url' });
