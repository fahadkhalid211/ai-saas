import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { clearRetrievalCache } from '@/lib/rag/cache';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Crescelo-Key',
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
      cleanMarkdown = `# ${item.title}\n- URL: ${item.url || ''}\n\n${item.content || item.excerpt || ''}`;
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
