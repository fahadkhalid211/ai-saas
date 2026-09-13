import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assistant = await Database.getAssistantById(id);
    if (!assistant) {
      return NextResponse.json(
        { error: 'Assistant not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const sources = await Database.getKnowledgeSources(id);
    const readySources = sources.filter((s) => s.status === 'ready');
    const allChunks = await Database.getChunksByAssistant(id);

    // Group chunks by knowledgeSourceId
    const chunksBySource: Record<string, typeof allChunks> = {};
    for (const chunk of allChunks) {
      if (!chunksBySource[chunk.knowledgeSourceId]) {
        chunksBySource[chunk.knowledgeSourceId] = [];
      }
      chunksBySource[chunk.knowledgeSourceId].push(chunk);
    }

    const articles = readySources.map((s) => {
      const sourceChunks = (chunksBySource[s.id] || []).sort(
        (a, b) => a.chunkIndex - b.chunkIndex
      );
      const firstChunk = sourceChunks[0]?.content || '';
      const previewSummary =
        firstChunk.length > 150 ? firstChunk.slice(0, 150) + '...' : firstChunk;

      return {
        id: s.id,
        title: s.title,
        type: s.type,
        chunkCount: sourceChunks.length,
        createdAt: s.createdAt,
        previewSummary: previewSummary.replace(/\n+/g, ' ').trim(),
      };
    });

    return NextResponse.json(
      {
        articles,
        total: articles.length,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch knowledge base' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
