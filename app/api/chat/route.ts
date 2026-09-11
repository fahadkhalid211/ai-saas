import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { retrieveRelevantContext } from '@/lib/rag/retrieval';
import { buildSystemPrompt, streamChatResponse } from '@/lib/ai/providers';
import { ChatMessage } from '@/lib/ai/types';

// Handle CORS pre-flight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assistantId, messages, visitorId, conversationId } = body;

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId is required' }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const assistant = await Database.getAssistantById(assistantId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    // Latest user message
    const latestUserMsg = messages[messages.length - 1]?.content || '';
    const conversationHistory = messages.slice(0, -1);

    // 1. Get or create conversation record
    const conv = await Database.getOrCreateConversation(assistantId, visitorId, conversationId);
    await Database.saveMessage(conv.id, 'user', latestUserMsg);

    // 2. Hybrid Context Retrieval
    const topK = assistant.contextChunks || 3;
    const retrieval = await retrieveRelevantContext(
      assistantId,
      latestUserMsg,
      conversationHistory,
      topK
    );

    // 3. Assemble Prompt
    const fullSystemPrompt = buildSystemPrompt({
      businessPrompt: assistant.systemPrompt,
      contextText: retrieval.contextText,
      fallbackMessage: assistant.fallbackMessage,
      assistantName: assistant.name,
    });

    const llmMessages: ChatMessage[] = [
      { role: 'system', content: fullSystemPrompt },
      ...messages.slice(-6).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // 4. Setup Server-Sent Events (SSE) Stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send citations first
        const citationsEvent = `data: ${JSON.stringify({
          type: 'citations',
          citations: retrieval.citations,
          conversationId: conv.id,
        })}\n\n`;
        controller.enqueue(encoder.encode(citationsEvent));

        let fullAssistantReply = '';

        try {
          const tokenGenerator = streamChatResponse(llmMessages, {
            provider: assistant.provider,
            modelName: assistant.modelName,
            apiKey: assistant.apiKeyEncrypted,
            customBaseUrl: assistant.customBaseUrl,
            temperature: assistant.temperature,
            maxTokens: assistant.maxTokens || 2048,
          });

          for await (const token of tokenGenerator) {
            fullAssistantReply += token;
            const tokenEvent = `data: ${JSON.stringify({ type: 'token', token })}\n\n`;
            controller.enqueue(encoder.encode(tokenEvent));
          }

          // Save assistant message in DB
          await Database.saveMessage(
            conv.id,
            'assistant',
            fullAssistantReply,
            retrieval.citations,
            Math.ceil(fullAssistantReply.length / 4)
          );

          // Send done event
          const doneEvent = `data: ${JSON.stringify({
            type: 'done',
            conversationId: conv.id,
          })}\n\n`;
          controller.enqueue(encoder.encode(doneEvent));
        } catch (streamErr: any) {
          console.error('Streaming error in chat route:', streamErr);
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            error: streamErr?.message || 'Inference failed',
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json(
      { error: error?.message || 'Chat generation failed' },
      { status: 500 }
    );
  }
}
