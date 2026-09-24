import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { parseFileOrText } from '@/lib/rag/parsers';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';

const GETHandler = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId query param required' }, { status: 400 });
    }

    if (ctx && ctx.workspaceId && ctx.workspaceId !== '*') {
      const ast = await Database.getAssistantById(assistantId);
      if (!ast || (ast.workspaceId || 'default-workspace') !== ctx.workspaceId) {
        return NextResponse.json({ error: 'Assistant not found or forbidden' }, { status: 404 });
      }
    }

    const unanswered = await Database.getUnansweredQueries(assistantId);
    return NextResponse.json({ unanswered });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch unanswered queries' }, { status: 500 });
  }
});

const POSTHandler = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();
    const { id, assistantId, action, answer, query } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'id and action required' }, { status: 400 });
    }

    if (action === 'delete') {
      const deleted = await Database.deleteUnansweredQuery(id, ctx?.workspaceId);
      if (!deleted) {
        return NextResponse.json({ error: 'Query not found or forbidden' }, { status: 404 });
      }
      return NextResponse.json({ success: true, action: 'delete' });
    }

    if (action === 'resolve') {
      const resolved = await Database.resolveUnansweredQuery(id, answer, ctx?.workspaceId);
      if (!resolved) {
        return NextResponse.json({ error: 'Query not found or forbidden' }, { status: 404 });
      }
      return NextResponse.json({ success: true, action: 'resolve' });
    }

    if (action === 'addKnowledge') {
      if (!assistantId || !answer) {
        return NextResponse.json({ error: 'assistantId and answer required to add knowledge' }, { status: 400 });
      }

      if (ctx && ctx.workspaceId && ctx.workspaceId !== '*') {
        const ast = await Database.getAssistantById(assistantId);
        if (!ast || (ast.workspaceId || 'default-workspace') !== ctx.workspaceId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      const qText = query || 'Frequently Asked Question';
      const title = `Q&A: ${qText.slice(0, 60)}`;
      const combinedText = `Question: ${qText}\n\nAnswer: ${answer}`;

      // 1. Create Knowledge Source
      const source = await Database.createKnowledgeSource({
        assistantId,
        title,
        type: 'description',
        fileSizeBytes: Buffer.byteLength(combinedText, 'utf-8'),
        status: 'ready',
      });

      // 2. Parse & Chunk
      const doc = await parseFileOrText({
        filename: title,
        type: 'description',
        text: combinedText,
      });

      const rawChunks = chunkDocument(doc);
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
          sourceTitle: title,
          sourceType: 'description',
        },
        embedding: embeddings[i],
      }));

      await Database.saveChunks(chunkRecords);
      await Database.updateKnowledgeSource(source.id, {
        status: 'ready',
        chunkCount: chunkRecords.length,
      });

      // Mark the query as resolved
      await Database.resolveUnansweredQuery(id, answer, ctx?.workspaceId);

      return NextResponse.json({
        success: true,
        action: 'addKnowledge',
        sourceId: source.id,
        chunksAdded: chunkRecords.length,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling unanswered query action:', error);
    return NextResponse.json({ error: error?.message || 'Action failed' }, { status: 500 });
  }
});

export const GET = logged(GETHandler, { route: '/api/analytics/unanswered' });
export const POST = logged(POSTHandler, { route: '/api/analytics/unanswered' });
