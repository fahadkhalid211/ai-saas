import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { executeWebSearch, ingestWebSearchResults } from '@/lib/rag/web-search';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();
    const { assistantId, query } = body;

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId is required' }, { status: 400 });
    }

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const assistant = await Database.getAssistantById(assistantId, ctx.workspaceId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found or forbidden' }, { status: 404 });
    }

    const cleanQuery = query.trim();
    console.log(`[WebSearchRoute] Searching online for "${cleanQuery}" (Assistant: ${assistantId})...`);

    const results = await executeWebSearch(cleanQuery);
    if (results.length === 0) {
      return NextResponse.json(
        { error: `No relevant search results found online for "${cleanQuery}"` },
        { status: 404 }
      );
    }

    const ingested = await ingestWebSearchResults(assistantId, cleanQuery, results);

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      sourceId: ingested.sourceId,
      chunkCount: ingested.chunkCount,
      resultsCount: results.length,
      sampleResults: results.slice(0, 3),
    });
  } catch (error: any) {
    console.error('[WebSearchRoute] Error during web search ingestion:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to search online and ingest into knowledge base' },
      { status: 500 }
    );
  }
});
