import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { clearRetrievalCache } from '@/lib/rag/cache';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { authorizeConnectorCall, presentedConnectorKey } from '@/lib/connectors/wordpress-auth';
import { wordpressKnowledgeBlock } from '@/lib/connectors/wordpress-quota';
import {
  ShopifyConnectorError,
  fetchShopifyCatalog,
  normalizeShopDomain,
  shopifyCollectionsToMarkdown,
  shopifyProductToMarkdown,
  shopifySourceKey,
  SHOPIFY_ID_PREFIX,
} from '@/lib/connectors/shopify';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Crescelo-Key, X-Crescelo-Secret',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

function fail(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ success: false, error, ...extra }, { status, headers: CORS });
}

/**
 * Pulls the store's catalog and stores one slice of it as knowledge. The caller loops with `offset` until `hasMore` is
 * false. Every call re-reads the catalog (a few small JSON requests), which keeps the route stateless; the call that
 * reaches the end also removes products that no longer exist in the store, so a full sync leaves the knowledge base
 * matching the store exactly.
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, 'shopify-sync', { windowMs: 60 * 1000, max: 60 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const body = await req.json().catch(() => ({}));
    const assistantId = typeof body.assistantId === 'string' ? body.assistantId : '';
    const domain = normalizeShopDomain(body.shopDomain);
    const offset = Math.max(0, Math.floor(Number(body.offset) || 0));
    const limit = Math.min(25, Math.max(1, Math.floor(Number(body.limit) || 10)));
    const currency = typeof body.currency === 'string' && /^[A-Za-z]{3}$/.test(body.currency) ? body.currency.toUpperCase() : '';

    if (!assistantId) return fail(400, 'assistantId is required');
    if (!domain) return fail(400, 'shopDomain must be your store address, for example my-store.myshopify.com.');

    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) return fail(404, 'Assistant not found');

    const auth = authorizeConnectorCall(assistant, presentedConnectorKey(req));
    if (!auth.ok) return fail(auth.status, auth.error);

    const catalog = await fetchShopifyCatalog(domain);
    const total = catalog.products.length;
    const slice = catalog.products.slice(offset, offset + limit);

    const documents = slice.map((p) => ({
      key: shopifySourceKey('product', p.id),
      title: p.title,
      markdown: shopifyProductToMarkdown(p, currency),
      metadata: { shopifyId: p.id, url: p.url, imageUrl: p.imageUrl, handle: p.handle },
    }));
    if (offset === 0) {
      const markdown = shopifyCollectionsToMarkdown(catalog.collections);
      if (markdown) documents.push({ key: shopifySourceKey('collections', 'all'), title: 'Store collections', markdown, metadata: {} as any });
    }

    const incomingBytes = documents.reduce((n, d) => n + Buffer.byteLength(d.markdown, 'utf-8'), 0);
    const blocked = documents.length ? await wordpressKnowledgeBlock(assistant, incomingBytes) : null;
    if (blocked) return fail(blocked.status, blocked.error, { storageLimitReached: blocked.status === 403 });

    const existing = await Database.getKnowledgeSources(assistantId);
    let totalChunks = 0;
    let processed = 0;

    for (const d of documents) {
      const previous = existing.find((s) => s.title.startsWith(d.key));
      if (previous) {
        await Database.deleteChunksBySource(previous.id);
        await Database.deleteKnowledgeSource(previous.id);
      }

      const title = `${d.key} ${d.title}`;
      const source = await Database.createKnowledgeSource({
        assistantId,
        title,
        type: 'custom',
        fileSizeBytes: Buffer.byteLength(d.markdown, 'utf-8'),
        status: 'processing',
      });

      const rawChunks = chunkDocument(
        { title, type: 'custom' as any, content: d.markdown, metadata: { platform: 'shopify', ...d.metadata } },
        { maxChunkCharacters: 1600, chunkOverlap: 200 },
      );
      if (rawChunks.length === 0) {
        await Database.deleteKnowledgeSource(source.id);
        continue;
      }
      const embeddings = await generateEmbeddingsBatch(rawChunks.map((c) => c.content));
      await Database.saveChunks(
        rawChunks.map((chunk, i) => ({
          assistantId,
          knowledgeSourceId: source.id,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          tokenCount: chunk.tokenCount,
          metadata: { ...chunk.metadata, sourceTitle: title, sourceType: 'shopify', platform: 'shopify', ...d.metadata },
          embedding: embeddings[i],
        })),
      );
      await Database.updateKnowledgeSource(source.id, { status: 'ready', chunkCount: rawChunks.length });
      totalChunks += rawChunks.length;
      processed += 1;
    }

    // The last slice also drops products that were deleted from the store since the previous sync.
    const hasMore = offset + limit < total;
    let removed = 0;
    if (!hasMore) {
      const live = new Set(catalog.products.map((p) => shopifySourceKey('product', p.id)));
      const prefix = `[${SHOPIFY_ID_PREFIX}:product:`;
      for (const s of existing) {
        if (!s.title.startsWith(prefix)) continue;
        const key = s.title.slice(0, s.title.indexOf(']') + 1);
        if (!live.has(key)) {
          await Database.deleteChunksBySource(s.id);
          await Database.deleteKnowledgeSource(s.id);
          removed += 1;
        }
      }
    }

    clearRetrievalCache(assistantId);

    return NextResponse.json(
      {
        success: true,
        shopDomain: domain,
        total,
        processedCount: processed,
        totalChunks,
        removed,
        offset,
        nextOffset: offset + slice.length,
        hasMore,
      },
      { status: 200, headers: CORS },
    );
  } catch (error: any) {
    if (error instanceof ShopifyConnectorError) return fail(error.status, error.message);
    console.error('[ShopifyConnector] Sync failed:', error);
    return fail(500, error?.message || 'Failed to sync the Shopify catalog');
  }
}
