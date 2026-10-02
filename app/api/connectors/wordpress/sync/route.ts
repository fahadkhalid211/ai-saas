import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Database } from '@/lib/db';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { clearRetrievalCache } from '@/lib/rag/cache';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Crescelo-Key, X-Crescelo-Secret',
    },
  });
}

function safeSecretCompare(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function formatProductToMarkdown(item: any): string {
  const parts: string[] = [];
  parts.push(`# Product: ${item.title || 'Untitled Product'}`);
  parts.push(`- **Product ID**: ${item.id}`);
  if (item.sku) parts.push(`- **SKU**: ${item.sku}`);
  if (item.price) parts.push(`- **Price**: ${item.price}`);
  if (item.regularPrice && item.regularPrice !== item.price) {
    parts.push(`- **Regular Price**: ${item.regularPrice}`);
  }
  if (item.salePrice) parts.push(`- **Sale Price**: ${item.salePrice}`);
  if (item.stockStatus) {
    const qtyText = item.stockQuantity ? ` (${item.stockQuantity} in stock)` : '';
    parts.push(`- **Stock Status**: ${item.stockStatus}${qtyText}`);
  }

  const categories = Array.isArray(item.categories)
    ? item.categories.join(', ')
    : item.categories || '';
  if (categories) parts.push(`- **Categories**: ${categories}`);

  const tags = Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '';
  if (tags) parts.push(`- **Tags**: ${tags}`);

  if (item.attributes && typeof item.attributes === 'object') {
    const attrLines: string[] = [];
    for (const [key, val] of Object.entries(item.attributes)) {
      const valStr = Array.isArray(val) ? val.join(', ') : String(val);
      attrLines.push(`  - ${key}: ${valStr}`);
    }
    if (attrLines.length > 0) {
      parts.push(`- **Attributes & Variations**:\n${attrLines.join('\n')}`);
    }
  }

  if (item.url) parts.push(`- **Product URL**: ${item.url}`);
  if (item.imageUrl) parts.push(`- **Image URL**: ${item.imageUrl}`);

  if (item.shortDescription) {
    parts.push(`\n### Overview\n${item.shortDescription.trim()}`);
  }

  if (item.description) {
    parts.push(`\n### Product Details & Specifications\n${item.description.trim()}`);
  }

  return parts.join('\n');
}

function formatPageToMarkdown(item: any, batchType: string): string {
  const parts: string[] = [];
  parts.push(`# ${item.title || 'Untitled Document'}`);
  if (item.url) parts.push(`- **URL**: ${item.url}`);
  parts.push(`- **Content Type**: ${item.postType || batchType}`);
  if (item.dateModified) parts.push(`- **Last Updated**: ${item.dateModified}`);

  if (item.excerpt) {
    parts.push(`\n### Summary\n${item.excerpt.trim()}`);
  }

  if (item.content) {
    parts.push(`\n### Content\n${item.content.trim()}`);
  }

  return parts.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, 'wp-sync', { windowMs: 60 * 1000, max: 60 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { assistantId, batchType = 'products', items = [] } = body;

    if (!assistantId) {
      return NextResponse.json(
        { success: false, error: 'assistantId is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) {
      return NextResponse.json(
        { success: false, error: 'Assistant not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Authenticate request using configured webhookSecret
    if (assistant.webhookSecret) {
      const providedSecret = req.headers.get('x-crescelo-secret') || req.headers.get('x-crescelo-key');
      if (!providedSecret || !safeSecretCompare(assistant.webhookSecret, providedSecret)) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid or missing X-Crescelo-Secret' },
          { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: true, processedCount: 0, totalChunks: 0, message: 'No items in batch' },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const existingSources = await Database.getKnowledgeSources(assistantId);
    let totalNewChunks = 0;
    const processedItems: Array<{ id: string | number; title: string; chunks: number }> = [];

    for (const item of items) {
      if (!item || !item.id) continue;

      const itemIdentifier = `[WP:${batchType}:${item.id}]`;
      const itemTitle = `${itemIdentifier} ${item.title || 'Untitled'}`;

      // 1. Delete previous version of this item if already indexed
      const matchedSource = existingSources.find(
        (s) => s.title.startsWith(itemIdentifier) || s.id === `src_${batchType}_${item.id}`
      );

      if (matchedSource) {
        try {
          await Database.deleteChunksBySource(matchedSource.id);
          await Database.deleteKnowledgeSource(matchedSource.id);
        } catch (delErr) {
          console.warn('[WPSync] Failed removing obsolete source chunks:', delErr);
        }
      }

      // 2. Format content to Markdown
      const cleanMarkdown =
        batchType === 'products'
          ? formatProductToMarkdown(item)
          : formatPageToMarkdown(item, batchType);

      if (!cleanMarkdown || cleanMarkdown.trim().length < 10) continue;

      const fileSize = Buffer.byteLength(cleanMarkdown, 'utf-8');

      // 3. Create knowledge source
      const source = await Database.createKnowledgeSource({
        assistantId,
        title: itemTitle,
        type: batchType === 'products' ? 'custom' : 'web_page',
        fileSizeBytes: fileSize,
        status: 'processing',
      });

      // 4. Chunk document
      const doc = {
        title: itemTitle,
        type: (batchType === 'products' ? 'custom' : 'web_page') as any,
        content: cleanMarkdown,
        metadata: {
          wpId: item.id,
          batchType,
          sku: item.sku || '',
          price: item.price || '',
          url: item.url || '',
          imageUrl: item.imageUrl || '',
          stockStatus: item.stockStatus || '',
        },
      };

      const rawChunks = chunkDocument(doc, { maxChunkCharacters: 1600, chunkOverlap: 200 });
      if (rawChunks.length === 0) continue;

      // 5. Generate embeddings locally with @xenova/transformers
      const textsToEmbed = rawChunks.map((c) => c.content);
      const embeddings = await generateEmbeddingsBatch(textsToEmbed);

      const chunkRecords = rawChunks.map((chunk, i) => ({
        assistantId,
        knowledgeSourceId: source.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        tokenCount: chunk.tokenCount,
        metadata: {
          ...chunk.metadata,
          sourceTitle: itemTitle,
          sourceType: batchType,
          wpId: item.id,
          sku: item.sku || '',
          price: item.price || '',
          url: item.url || '',
          imageUrl: item.imageUrl || '',
        },
        embedding: embeddings[i],
      }));

      // 6. Save chunks to database
      await Database.saveChunks(chunkRecords);

      // 7. Mark source as ready
      await Database.updateKnowledgeSource(source.id, {
        status: 'ready',
        chunkCount: chunkRecords.length,
      });

      totalNewChunks += chunkRecords.length;
      processedItems.push({
        id: item.id,
        title: item.title,
        chunks: chunkRecords.length,
      });
    }

    // 8. Invalidate vector search cache
    clearRetrievalCache(assistantId);

    return NextResponse.json(
      {
        success: true,
        processedCount: processedItems.length,
        totalChunks: totalNewChunks,
        items: processedItems,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Crescelo-Key',
        },
      }
    );
  } catch (error: any) {
    console.error('[WordPressConnector] Batch sync failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sync content batch' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
