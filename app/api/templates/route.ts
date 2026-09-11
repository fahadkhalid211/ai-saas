import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { BOT_TEMPLATES } from '@/lib/templates';
import { parseFileOrText } from '@/lib/rag/parsers';
import { chunkDocument } from '@/lib/rag/chunker';
import { generateEmbeddingsBatch } from '@/lib/rag/embedder';

export async function GET() {
  return NextResponse.json({ templates: BOT_TEMPLATES });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { templateId, assistantId, seedKnowledge = true } = body;

    const template = BOT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId required' }, { status: 400 });
    }

    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    // 1. Update Assistant configuration from template
    const updated = await Database.updateAssistant(assistantId, {
      name: `${template.name}`,
      systemPrompt: template.systemPrompt,
      welcomeMessage: template.welcomeMessage,
      fallbackMessage: template.fallbackMessage,
      starterQuestions: template.starterQuestions,
      primaryColor: template.primaryColor,
      collectLeadEmail: template.collectLeadEmail,
      proactiveMessageEnabled: template.proactiveMessageEnabled,
      proactiveMessageText: template.proactiveMessageText,
      proactiveMessageDelay: template.proactiveMessageDelay,
      bookingEnabled: template.bookingEnabled,
      bookingProvider: template.bookingProvider,
      bookingPromptText: template.bookingPromptText,
      supportCustomFields: template.supportCustomFields,
    });

    // 2. Optionally seed sample knowledge articles
    let seededCount = 0;
    if (seedKnowledge && template.sampleKnowledge && template.sampleKnowledge.length > 0) {
      for (const item of template.sampleKnowledge) {
        try {
          const source = await Database.createKnowledgeSource({
            assistantId,
            title: item.title,
            type: 'description',
            fileSizeBytes: Buffer.byteLength(item.content, 'utf-8'),
            status: 'ready',
          });

          const doc = await parseFileOrText({
            filename: item.title,
            type: 'description',
            text: item.content,
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
              sourceTitle: item.title,
              sourceType: 'description',
            },
            embedding: embeddings[i],
          }));

          await Database.saveChunks(chunkRecords);
          await Database.updateKnowledgeSource(source.id, {
            status: 'ready',
            chunkCount: chunkRecords.length,
          });
          seededCount++;
        } catch (kErr) {
          console.warn('[TemplateAPI] Error seeding knowledge article:', kErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      assistant: updated,
      seededKnowledgeCount: seededCount,
    });
  } catch (error: any) {
    console.error('Template apply error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to apply template' }, { status: 500 });
  }
}
