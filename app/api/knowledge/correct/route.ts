import { NextResponse } from 'next/server';
import { Database, ChunkRecord } from '@/lib/db';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { chunkDocument } from '@/lib/rag/chunker';
import { withAdminAuth } from '@/lib/security/auth';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get('sourceId');

    if (!sourceId) {
      return NextResponse.json({ error: 'sourceId parameter is required' }, { status: 400 });
    }

    const source = await Database.getKnowledgeSourceById(sourceId);
    if (!source) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }

    const chunks = await Database.getChunksBySource(sourceId);
    const fullText = chunks.map((c) => c.content).join('\n\n---\n\n');

    return NextResponse.json({
      source,
      chunkCount: chunks.length,
      chunks: chunks.map((c) => ({
        id: c.id,
        chunkIndex: c.chunkIndex,
        content: c.content,
        metadata: c.metadata,
      })),
      fullText,
      corrections: source.corrections || [],
    });
  } catch (error: any) {
    console.error('Error fetching knowledge correction data:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch correction data' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const { sourceId, action, findText, replaceText, note, fullText } = body;

    if (!sourceId) {
      return NextResponse.json({ error: 'sourceId is required' }, { status: 400 });
    }

    const source = await Database.getKnowledgeSourceById(sourceId);
    if (!source) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }

    const existingCorrections = source.corrections || [];

    // 1. Action: find_replace
    if (action === 'find_replace') {
      if (!findText || typeof findText !== 'string' || !findText.trim()) {
        return NextResponse.json({ error: 'findText is required' }, { status: 400 });
      }

      const chunks = await Database.getChunksBySource(sourceId);
      if (chunks.length === 0) {
        return NextResponse.json({ error: 'No chunks exist for this source' }, { status: 404 });
      }

      const targetFind = findText.trim();
      const targetReplace = replaceText ?? '';
      const escaped = targetFind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');

      let totalReplacements = 0;
      const affectedChunks: ChunkRecord[] = [];

      for (const chunk of chunks) {
        const matches = chunk.content.match(regex);
        if (matches && matches.length > 0) {
          totalReplacements += matches.length;
          const updatedContent = chunk.content.replace(regex, targetReplace);
          affectedChunks.push({
            ...chunk,
            content: updatedContent,
            tokenCount: Math.ceil(updatedContent.length / 4),
          });
        }
      }

      if (affectedChunks.length === 0) {
        return NextResponse.json({
          success: true,
          totalReplacements: 0,
          chunksUpdated: 0,
          message: 'Term "' + targetFind + '" was not found in any chunk.',
          corrections: existingCorrections,
        });
      }

      // Re-embed affected chunks in batch
      const newEmbeddings = await generateEmbeddingsBatch(affectedChunks.map((c) => c.content));
      affectedChunks.forEach((c, idx) => {
        c.embedding = newEmbeddings[idx] || c.embedding;
      });

      await Database.updateChunks(affectedChunks);

      const correctionEntry = {
        id: 'corr_' + Math.random().toString(36).substring(2, 9),
        type: 'replace' as const,
        findText: targetFind,
        replaceText: targetReplace,
        note: 'Replaced ' + totalReplacements + ' instance(s) across ' + affectedChunks.length + ' chunk(s)',
        appliedAt: new Date().toISOString(),
      };

      const updatedCorrections = [...existingCorrections, correctionEntry];
      await Database.updateKnowledgeSource(source.id, {
        corrections: updatedCorrections,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        totalReplacements,
        chunksUpdated: affectedChunks.length,
        message: 'Successfully replaced ' + totalReplacements + ' occurrence(s) across ' + affectedChunks.length + ' chunk(s) and refreshed vector embeddings.',
        corrections: updatedCorrections,
      });
    }

    // 2. Action: add_override_note
    if (action === 'add_override_note') {
      if (!note || typeof note !== 'string' || !note.trim()) {
        return NextResponse.json({ error: 'note is required' }, { status: 400 });
      }

      const trimmedNote = note.trim();
      const chunks = await Database.getChunksBySource(sourceId);

      if (chunks.length > 0) {
        // Prepend authoritative fact banner to first chunk
        const firstChunk = { ...chunks[0] };
        firstChunk.content = '[OFFICIAL CORRECTION / FACT OVERRIDE]: ' + trimmedNote + '\n\n' + firstChunk.content;
        firstChunk.tokenCount = Math.ceil(firstChunk.content.length / 4);
        const [emb] = await generateEmbeddingsBatch([firstChunk.content]);
        firstChunk.embedding = emb || firstChunk.embedding;
        await Database.updateChunks([firstChunk]);
      } else {
        const noteContent = '[OFFICIAL CORRECTION / FACT OVERRIDE]: ' + trimmedNote;
        const [emb] = await generateEmbeddingsBatch([noteContent]);
        await Database.saveChunks([
          {
            assistantId: source.assistantId,
            knowledgeSourceId: source.id,
            content: noteContent,
            tokenCount: Math.ceil(noteContent.length / 4),
            embedding: emb || [],
            chunkIndex: 0,
            metadata: {
              sourceTitle: source.title,
              sourceType: source.type,
              isOverride: true,
            },
          },
        ]);
      }

      const correctionEntry = {
        id: 'corr_' + Math.random().toString(36).substring(2, 9),
        type: 'note' as const,
        note: trimmedNote,
        appliedAt: new Date().toISOString(),
      };

      const updatedCorrections = [...existingCorrections, correctionEntry];
      await Database.updateKnowledgeSource(source.id, {
        corrections: updatedCorrections,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Override note added and vector embeddings updated.',
        corrections: updatedCorrections,
      });
    }

    // 3. Action: edit_content (Full text update & re-chunking)
    if (action === 'edit_content') {
      if (!fullText || typeof fullText !== 'string' || !fullText.trim()) {
        return NextResponse.json({ error: 'fullText is required' }, { status: 400 });
      }

      const doc = {
        title: source.title,
        type: source.type,
        content: fullText.trim(),
      };

      const chunkItems = chunkDocument(doc);
      if (chunkItems.length === 0) {
        return NextResponse.json({ error: 'Document could not be chunked' }, { status: 400 });
      }

      const embeddings = await generateEmbeddingsBatch(chunkItems.map((c) => c.content));
      const newChunks = chunkItems.map((c, idx) => ({
        assistantId: source.assistantId,
        knowledgeSourceId: source.id,
        content: c.content,
        tokenCount: c.tokenCount || Math.ceil(c.content.length / 4),
        embedding: embeddings[idx] || [],
        chunkIndex: c.chunkIndex,
        metadata: {
          ...c.metadata,
          sourceTitle: source.title,
          sourceType: source.type,
          isManualEdit: true,
        },
      }));

      await Database.deleteChunksBySource(source.id);
      await Database.saveChunks(newChunks);

      const correctionEntry = {
        id: 'corr_' + Math.random().toString(36).substring(2, 9),
        type: 'edit' as const,
        note: 'Manual text edit applied (' + newChunks.length + ' chunks re-indexed)',
        appliedAt: new Date().toISOString(),
      };

      const updatedCorrections = [...existingCorrections, correctionEntry];
      await Database.updateKnowledgeSource(source.id, {
        chunkCount: newChunks.length,
        corrections: updatedCorrections,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        chunkCount: newChunks.length,
        message: 'Saved edited document with ' + newChunks.length + ' newly embedded chunks.',
        corrections: updatedCorrections,
      });
    }

    return NextResponse.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (error: any) {
    console.error('Error in knowledge correction API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to apply knowledge correction' },
      { status: 500 }
    );
  }
});