import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId query parameter required' }, { status: 400 });
    }

    const sources = await Database.getKnowledgeSources(assistantId);
    const chunks = await Database.getChunksByAssistant(assistantId);

    return NextResponse.json({
      sources,
      totalSources: sources.length,
      totalChunks: chunks.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch knowledge' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Source id required' }, { status: 400 });
    }

    await Database.deleteKnowledgeSource(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete knowledge source' }, { status: 500 });
  }
}
