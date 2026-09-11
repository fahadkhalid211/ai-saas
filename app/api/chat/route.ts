import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { retrieveRelevantContext } from '@/lib/rag/retrieval';
import { buildSystemPrompt, streamChatResponse } from '@/lib/ai/providers';
import { ChatMessage } from '@/lib/ai/types';
import { isWebSearchIntent, extractSearchQuery, executeWebSearch, ingestWebSearchResults } from '@/lib/rag/web-search';

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

    // Live Web Search Detection & Automatic Knowledge Ingestion (Admin Controlled)
    const canSearchWeb = assistant.allowWebSearch ?? true;
    let webSearchQuery = '';

    if (canSearchWeb && isWebSearchIntent(latestUserMsg)) {
      try {
        const sources = await Database.getKnowledgeSources(assistantId);
        const contextHints: string[] = [];
        for (const s of sources) {
          if (/sahar/i.test(s.title)) contextHints.push('Dr Sahar Yousef');
          else if (s.title.length > 3 && !s.title.startsWith('Online Search:')) {
            contextHints.push(s.title.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').slice(0, 40));
          }
        }

        const searchQuery = extractSearchQuery(latestUserMsg, conversationHistory, contextHints);
        webSearchQuery = searchQuery;
        console.log(`[ChatRoute] User requested live web search: "${searchQuery}" (Original: "${latestUserMsg}")...`);
        const searchResults = await executeWebSearch(searchQuery);
        if (searchResults.length > 0) {
          await ingestWebSearchResults(assistantId, searchQuery, searchResults);
          console.log(`[ChatRoute] Successfully ingested ${searchResults.length} online web sources into knowledge base for query: "${searchQuery}"!`);
        }
      } catch (searchErr: any) {
        console.warn('[ChatRoute] Online web search auto-ingestion error:', searchErr?.message);
      }
    }

    // 2. Hybrid Context Retrieval
    const isGroq = (assistant.provider || '').toLowerCase() === 'groq';
    const configuredChunks = assistant.contextChunks || 5;
    // On Groq free tier models with 8k TPM limit, clamp topK to 5 chunks to prevent prompt over-stuffing
    const topK = isGroq ? Math.min(configuredChunks, 5) : configuredChunks;
    const effectiveQuery = webSearchQuery || latestUserMsg;
    const retrieval = await retrieveRelevantContext(
      assistantId,
      effectiveQuery,
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
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
