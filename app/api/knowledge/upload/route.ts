import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { parseFileOrText } from '@/lib/rag/parsers';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';
import { diagnoseKnowledgeFailure } from '@/lib/rag/diagnostics';
import { withAdminAuth } from '@/lib/security/auth';

// Audio/video transcription (+ optional translation) followed by embedding
// hundreds of chunks can legitimately take well over a minute; let the
// platform know this route needs real headroom instead of being killed at
// whatever short default applies (e.g. Vercel's default function timeout).
export const maxDuration = 300;

export const POST = withAdminAuth(async (req: Request) => {
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

        // Determine extension and media type
        const ext = filename.split('.').pop()?.toLowerCase() || 'txt';
        const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', '3gp'].includes(ext);
        const isAudio = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'opus', 'wma'].includes(ext);
        const sourceDocType = isVideo ? 'video' : isAudio ? 'audio' : ext;

        // 1. Create Knowledge Source record
        const source = await Database.createKnowledgeSource({
          assistantId,
          title: filename,
          type: sourceDocType,
          fileSizeBytes: file.size,
          status: 'processing',
        });

        try {
          const processFileTask = (async () => {
            // 2. Parse file (transcribing video/audio speech if media file)
            const doc = await parseFileOrText({
              filename,
              type: ext,
              buffer,
              options: {
                apiKey: assistant.apiKeyEncrypted,
                provider: assistant.provider,
              },
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
                sourceType: doc.type || sourceDocType,
              },
              embedding: embeddings[i],
            }));

            await Database.saveChunks(chunkRecords);

            // 6. Mark source READY
            await Database.updateKnowledgeSource(source.id, {
              status: 'ready',
              chunkCount: chunkRecords.length,
            });

            return chunkRecords.length;
          })();

          // Media files go through transcription (and, for non-English speech,
          // a second translation pass) before chunking/embedding even starts,
          // so they legitimately need much longer than a plain text document.
          // A flat 30s cap was failing real uploads outright rather than
          // protecting against anything — this scales the budget by type
          // while still bounding a genuinely stuck request.
          const timeoutMs = isVideo || isAudio ? 270_000 : 90_000;
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`File processing timed out after ${Math.round(timeoutMs / 1000)} seconds`)),
              timeoutMs
            )
          );

          const chunkCount = await Promise.race([processFileTask, timeoutPromise]);

          processedSources.push({
            id: source.id,
            title: filename,
            chunks: chunkCount,
            status: 'ready',
          });
        } catch (fileErr: any) {
          console.error(`Failed processing ${filename}:`, fileErr);
          const diag = diagnoseKnowledgeFailure({
            filename,
            type: ext,
            errorMessage: fileErr?.message,
            fileSizeBytes: file.size,
          });

          await Database.updateKnowledgeSource(source.id, {
            status: 'failed',
            errorMessage: diag.reason,
            errorResolution: diag.whatToDoNext,
          });

          processedSources.push({
            id: source.id,
            title: filename,
            status: 'failed',
            error: diag.reason,
            whatToDoNext: diag.whatToDoNext,
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
        const diag = diagnoseKnowledgeFailure({
          filename: textTitle,
          type: 'description',
          errorMessage: textErr?.message,
          fileSizeBytes: Buffer.byteLength(rawText, 'utf-8'),
        });
        await Database.updateKnowledgeSource(source.id, {
          status: 'failed',
          errorMessage: diag.reason,
          errorResolution: diag.whatToDoNext,
        });
        processedSources.push({
          id: source.id,
          title: textTitle,
          status: 'failed',
          error: diag.reason,
          whatToDoNext: diag.whatToDoNext,
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
});
