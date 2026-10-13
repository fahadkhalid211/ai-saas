import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { clearRetrievalCache } from '@/lib/rag/cache';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { authorizeConnectorCall, presentedConnectorKey } from '@/lib/connectors/wordpress-auth';
import { wordpressKnowledgeBlock } from '@/lib/connectors/wordpress-quota';

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
  if (item.author) parts.push(`- **Author**: ${item.author}`);
  if (item.dateModified) parts.push(`- **Last Updated**: ${item.dateModified}`);

  const categories = Array.isArray(item.categories)
    ? item.categories.join(', ')
    : item.categories || '';
  if (categories) parts.push(`- **Categories**: ${categories}`);

  const tags = Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '';
  if (tags) parts.push(`- **Tags**: ${tags}`);

  if (item.taxonomies && typeof item.taxonomies === 'object') {
    for (const [taxName, terms] of Object.entries(item.taxonomies)) {
      if (Array.isArray(terms) && terms.length > 0) {
        parts.push(`- **${taxName}**: ${terms.join(', ')}`);
      } else if (typeof terms === 'string' && terms) {
        parts.push(`- **${taxName}**: ${terms}`);
      }
    }
  }

  if (item.meta && typeof item.meta === 'object' && Object.keys(item.meta).length > 0) {
    const metaLines: string[] = [];
    for (const [key, val] of Object.entries(item.meta)) {
      if (val !== undefined && val !== null && val !== '') {
        const valStr = Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val);
        metaLines.push(`  - **${key}**: ${valStr}`);
      }
    }
    if (metaLines.length > 0) {
      parts.push(`- **Metadata & Custom Fields**:\n${metaLines.join('\n')}`);
    }
  }

  if (item.imageUrl) parts.push(`- **Featured Image**: ${item.imageUrl}`);

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

    // The assistant's connector key is required. An assistant with no key rejects the call (fail closed).
    const auth = authorizeConnectorCall(assistant, presentedConnectorKey(req));
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: true, processedCount: 0, totalChunks: 0, message: 'No items in batch' },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const blocked = await wordpressKnowledgeBlock(assistant, Buffer.byteLength(JSON.stringify(items), 'utf-8'));
    if (blocked) {
      return NextResponse.json(
        { success: false, storageLimitReached: blocked.status === 403, error: blocked.error },
        { status: blocked.status, headers: { 'Access-Control-Allow-Origin': '*' } }
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
