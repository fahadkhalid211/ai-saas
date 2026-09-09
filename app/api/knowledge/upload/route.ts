import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { parseFileOrText } from '@/lib/rag/parsers';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const assistantId = formData.get('assistantId') as string;

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId is required' }, { status: 400 });
    }

    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const files = formData.getAll('files') as File[];
    const rawText = formData.get('text') as string;
    const textTitle = (formData.get('title') as string) || 'Text Description';

    const processedSources = [];

    // Case 1: Process uploaded files
    if (files && files.length > 0) {
      for (const file of files) {
        if (!file.name) continue;

        const filename = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine extension
        const ext = filename.split('.').pop()?.toLowerCase() || 'txt';

        // 1. Create Knowledge Source record
        const source = await Database.createKnowledgeSource({
          assistantId,
          title: filename,
          type: ext,
          fileSizeBytes: file.size,
          status: 'processing',
        });

        try {
          // 2. Parse file
          const doc = await parseFileOrText({
            filename,
            type: ext,
            buffer,
          });

          // 3. Chunk text
          const rawChunks = chunkDocument(doc);
          if (rawChunks.length === 0) {
            throw new Error('No readable text content extracted from file');
          }

          // 4. Generate local 384-dimensional embeddings
          const textsToEmbed = rawChunks.map((c) => c.content);
          const embeddings = await generateEmbeddingsBatch(textsToEmbed);

          // 5. Store chunks
          const chunkRecords = rawChunks.map((chunk, i) => ({
            assistantId,
            knowledgeSourceId: source.id,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            tokenCount: chunk.tokenCount,
            metadata: {
              ...chunk.metadata,
              sourceTitle: filename,
              sourceType: ext,
            },
            embedding: embeddings[i],
          }));

          await Database.saveChunks(chunkRecords);

          // 6. Mark source READY
          await Database.updateKnowledgeSource(source.id, {
            status: 'ready',
            chunkCount: chunkRecords.length,
          });

          processedSources.push({
            id: source.id,
            title: filename,
            chunks: chunkRecords.length,
            status: 'ready',
          });
        } catch (fileErr: any) {
          console.error(`Failed processing ${filename}:`, fileErr);
          await Database.updateKnowledgeSource(source.id, {
            status: 'failed',
            errorMessage: fileErr?.message || 'Extraction failed',
          });
          processedSources.push({
            id: source.id,
            title: filename,
            status: 'failed',
            error: fileErr?.message,
          });
        }
      }
    }

    // Case 2: Process direct text / business description
    if (rawText && rawText.trim().length > 0) {
      const source = await Database.createKnowledgeSource({
        assistantId,
        title: textTitle,
        type: 'description',
        fileSizeBytes: Buffer.byteLength(rawText, 'utf-8'),
        status: 'processing',
      });

      try {
        const doc = await parseFileOrText({
          filename: textTitle,
          type: 'description',
          text: rawText,
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
            sourceTitle: textTitle,
            sourceType: 'description',
          },
          embedding: embeddings[i],
        }));

        await Database.saveChunks(chunkRecords);

        await Database.updateKnowledgeSource(source.id, {
          status: 'ready',
          chunkCount: chunkRecords.length,
        });

        processedSources.push({
          id: source.id,
          title: textTitle,
          chunks: chunkRecords.length,
          status: 'ready',
        });
      } catch (textErr: any) {
        await Database.updateKnowledgeSource(source.id, {
          status: 'failed',
          errorMessage: textErr?.message || 'Processing failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      sources: processedSources,
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Upload processing failed' },
      { status: 500 }
    );
  }
}
