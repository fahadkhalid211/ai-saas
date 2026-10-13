import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { clearRetrievalCache } from '@/lib/rag/cache';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { authorizeConnectorCall, presentedConnectorKey } from '@/lib/connectors/wordpress-auth';
import { wordpressKnowledgeBlock } from '@/lib/connectors/wordpress-quota';

export const dynamic = 'force-dynamic';

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

export async function POST(req: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(req, 'wp-sync-item', { windowMs: 60 * 1000, max: 60 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const body = await req.json().catch(() => ({}));
    const { assistantId, action = 'update', batchType = 'products', item } = body;

    if (!assistantId || !item || !item.id) {
      return NextResponse.json(
        { success: false, error: 'assistantId and item.id are required' },
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

    const itemIdentifier = `[WP:${batchType}:${item.id}]`;
    const existingSources = await Database.getKnowledgeSources(assistantId);
    const matchedSource = existingSources.find((s) => s.title.startsWith(itemIdentifier));

    // Handle Deletion
    if (action === 'delete') {
      if (matchedSource) {
        await Database.deleteChunksBySource(matchedSource.id);
        await Database.deleteKnowledgeSource(matchedSource.id);
        clearRetrievalCache(assistantId);
      }
      return NextResponse.json(
        { success: true, action: 'deleted', id: item.id },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const blocked = await wordpressKnowledgeBlock(assistant, Buffer.byteLength(JSON.stringify(item), 'utf-8'));
    if (blocked) {
      return NextResponse.json(
        { success: false, storageLimitReached: blocked.status === 403, error: blocked.error },
        { status: blocked.status, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Handle Update / Insert
    if (matchedSource) {
      await Database.deleteChunksBySource(matchedSource.id);
      await Database.deleteKnowledgeSource(matchedSource.id);
    }

    const itemTitle = `${itemIdentifier} ${item.title || 'Untitled'}`;
    let cleanMarkdown = '';

    if (batchType === 'products') {
      const parts: string[] = [];
      parts.push(`# Product: ${item.title || 'Untitled Product'}`);
      parts.push(`- **Product ID**: ${item.id}`);
      if (item.sku) parts.push(`- **SKU**: ${item.sku}`);
      if (item.price) parts.push(`- **Price**: ${item.price}`);
      if (item.regularPrice) parts.push(`- **Regular Price**: ${item.regularPrice}`);
      if (item.salePrice) parts.push(`- **Sale Price**: ${item.salePrice}`);
      if (item.stockStatus) parts.push(`- **Stock Status**: ${item.stockStatus}`);
      if (item.categories) {
        const catStr = Array.isArray(item.categories) ? item.categories.join(', ') : item.categories;
        parts.push(`- **Categories**: ${catStr}`);
      }
      if (item.url) parts.push(`- **Product URL**: ${item.url}`);
      if (item.imageUrl) parts.push(`- **Image URL**: ${item.imageUrl}`);
      if (item.shortDescription) parts.push(`\n### Overview\n${item.shortDescription}`);
      if (item.description) parts.push(`\n### Details\n${item.description}`);
      cleanMarkdown = parts.join('\n');
    } else {
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

      cleanMarkdown = parts.join('\n');
    }

    if (!cleanMarkdown.trim()) {
      return NextResponse.json({ success: true, message: 'Item empty' });
    }

    const source = await Database.createKnowledgeSource({
      assistantId,
      title: itemTitle,
      type: batchType === 'products' ? 'custom' : 'web_page',
      fileSizeBytes: Buffer.byteLength(cleanMarkdown, 'utf-8'),
      status: 'processing',
    });

    const doc = {
      title: itemTitle,
      type: (batchType === 'products' ? 'custom' : 'web_page') as any,
      content: cleanMarkdown,
      metadata: { wpId: item.id, batchType, sku: item.sku || '', price: item.price || '' },
    };

    const rawChunks = chunkDocument(doc, { maxChunkCharacters: 1600, chunkOverlap: 200 });
    const textsToEmbed = rawChunks.map((c) => c.content);
    const embeddings = await generateEmbeddingsBatch(textsToEmbed);

    const chunkRecords = rawChunks.map((chunk, i) => ({
      assistantId,
      knowledgeSourceId: source.id,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      tokenCount: chunk.tokenCount,
      metadata: { ...chunk.metadata, sourceTitle: itemTitle, wpId: item.id },
      embedding: embeddings[i],
    }));

    await Database.saveChunks(chunkRecords);
    await Database.updateKnowledgeSource(source.id, {
      status: 'ready',
      chunkCount: chunkRecords.length,
    });

    clearRetrievalCache(assistantId);

    return NextResponse.json(
      { success: true, action: 'updated', id: item.id, chunks: chunkRecords.length },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error: any) {
    console.error('[WordPressConnector] Sync-item failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sync item' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
