import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { retrieveRelevantContext } from '@/lib/rag/retrieval';
import { buildSystemPrompt, streamChatResponse } from '@/lib/ai/providers';
import { ChatMessage } from '@/lib/ai/types';
import { isWebSearchIntent, extractSearchQuery, executeWebSearch, ingestWebSearchResults } from '@/lib/rag/web-search';
import { parseFileOrText } from '@/lib/rag/parsers';

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
    const { assistantId, messages, visitorId, conversationId, preferredLanguage, attachment } = body;

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

    // Process visitor attachment if uploaded
    let attachmentParsedContent = '';
    let attachmentMeta: any = null;

    if (attachment && attachment.name && attachment.data) {
      try {
        const ext = (attachment.name.split('.').pop() || 'txt').toLowerCase();
        let buffer: Buffer;
        if (attachment.data.startsWith('data:')) {
          const base64Data = attachment.data.split(',')[1] || '';
          buffer = Buffer.from(base64Data, 'base64');
        } else {
          buffer = Buffer.from(attachment.data, 'utf8');
        }

        const parsedDoc = await parseFileOrText({
          filename: attachment.name,
          type: ext,
          buffer,
          options: {
            apiKey: assistant.apiKeyEncrypted,
            provider: assistant.provider,
          },
        });

        if (parsedDoc && parsedDoc.content) {
          attachmentParsedContent = parsedDoc.content.trim();
        }

        attachmentMeta = {
          name: attachment.name,
          type: attachment.type || ext,
          size: attachment.size || buffer.length,
          preview: attachmentParsedContent.slice(0, 160),
        };
      } catch (attachErr) {
        console.warn('[ChatRoute] Attachment parse error:', attachErr);
        attachmentParsedContent = `[Attached file: ${attachment.name}]`;
        attachmentMeta = {
          name: attachment.name,
          type: attachment.type || 'file',
          size: attachment.size || 0,
        };
      }
    }

    // Latest user message
    const latestUserMsg = messages[messages.length - 1]?.content || '';
    const conversationHistory = messages.slice(0, -1);

    // Analyze Sentiment and Potential Escalation
    let detectedSentiment: 'urgent' | 'positive' | 'neutral' = 'neutral';
    let isEscalation = false;

    const urgentRegex = /\b(cancel|refund|broken|horrible|terrible|frustrated|angry|scam|lawyer|sue|complaint|worst|unacceptable|stolen|human agent|speak to human|real person|manager|emergency|help me now|urgent)\b/i;
    const positiveRegex = /\b(thank|thanks|great|awesome|love|perfect|excellent|helpful|good job|amazing|kudos|appreciate)\b/i;

    if (urgentRegex.test(latestUserMsg)) {
      detectedSentiment = 'urgent';
      isEscalation = true;
    } else if (positiveRegex.test(latestUserMsg)) {
      detectedSentiment = 'positive';
    }

    // 1. Get or create conversation record
    const conv = await Database.getOrCreateConversation(assistantId, visitorId, conversationId);
    await Database.saveMessage(conv.id, 'user', latestUserMsg, [], 0, attachmentMeta);
    await Database.updateConversation(conv.id, {
      sentiment: detectedSentiment,
      ...(isEscalation ? { escalated: true } : {}),
    });

    // 4. Setup Server-Sent Events (SSE) Stream
    const encoder = new TextEncoder();
    const canSearchWeb = assistant.allowWebSearch ?? true;

    const stream = new ReadableStream({
      async start(controller) {
        let webSearchQuery = '';
        let isWebSearchUsed = false;
        let liveWebResults: any[] = [];

        try {
          // Check for explicit live web search intent
          if (canSearchWeb && isWebSearchIntent(latestUserMsg)) {
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
            isWebSearchUsed = true;

            // Notify UI immediately that web search is underway
            const searchingStatusEvent = `data: ${JSON.stringify({
              type: 'status',
              status: 'searching_web',
              message: `Searching web for "${searchQuery}"...`,
              query: searchQuery,
            })}\n\n`;
            controller.enqueue(encoder.encode(searchingStatusEvent));

            console.log(`[ChatRoute] Executing live web search: "${searchQuery}"...`);
            const searchResults = await executeWebSearch(searchQuery);

            if (searchResults.length > 0) {
              liveWebResults = searchResults;
              await ingestWebSearchResults(assistantId, searchQuery, searchResults);
              console.log(`[ChatRoute] Successfully ingested ${searchResults.length} online web sources for query: "${searchQuery}"`);

              // Notify UI that sources were found
              const foundStatusEvent = `data: ${JSON.stringify({
                type: 'status',
                status: 'web_results_found',
                message: `Found ${searchResults.length} web sources. Synthesizing answer...`,
                count: searchResults.length,
              })}\n\n`;
              controller.enqueue(encoder.encode(foundStatusEvent));
            }
          }

          // 2. Hybrid Context Retrieval
          const isGroq = (assistant.provider || '').toLowerCase() === 'groq';
          const configuredChunks = assistant.contextChunks || 5;
          const topK = isGroq ? Math.min(configuredChunks, 5) : configuredChunks;
          let effectiveQuery = webSearchQuery || latestUserMsg;

          let retrieval = await retrieveRelevantContext(
            assistantId,
            effectiveQuery,
            conversationHistory,
            topK
          );

          // Smart fallback: If local KB found 0 chunks, user asked a real question, and web search is allowed
          const isGreetingOrShort = /^(hi|hello|hey|greetings|help|how are you|good morning|good evening)$/i.test(latestUserMsg.trim());
          if (!isWebSearchUsed && canSearchWeb && retrieval.chunks.length === 0 && latestUserMsg.length > 8 && !isGreetingOrShort) {
            const searchQuery = latestUserMsg.trim();
            isWebSearchUsed = true;

            const fallbackSearchStatus = `data: ${JSON.stringify({
              type: 'status',
              status: 'searching_web',
              message: `Searching web for "${searchQuery}"...`,
              query: searchQuery,
            })}\n\n`;
            controller.enqueue(encoder.encode(fallbackSearchStatus));

            try {
              const searchResults = await executeWebSearch(searchQuery);
              if (searchResults.length > 0) {
                liveWebResults = searchResults;
                await ingestWebSearchResults(assistantId, searchQuery, searchResults);
                retrieval = await retrieveRelevantContext(
                  assistantId,
                  searchQuery,
                  conversationHistory,
                  topK
                );
              }
            } catch (autoErr) {
              console.warn('[ChatRoute] Auto web search fallback error:', autoErr);
            }
          }

          // 3. Assemble Prompt with web-linking instructions
          let fullSystemPrompt = buildSystemPrompt({
            businessPrompt: assistant.systemPrompt,
            contextText: retrieval.contextText,
            fallbackMessage: assistant.fallbackMessage,
            assistantName: assistant.name,
          });

          if (attachmentParsedContent && attachmentMeta) {
            fullSystemPrompt += `\n\n[VISITOR ATTACHED FILE: "${attachmentMeta.name}" (${attachmentMeta.type})]:
The visitor attached a document to their message:
"""
${attachmentParsedContent.slice(0, 15000)}
"""
Directly use the content of this attached document to assist the visitor, answer their questions, extract information, or provide requested feedback.`;
          }

          if (preferredLanguage && preferredLanguage !== 'en') {
            const langNames: Record<string, string> = {
              es: 'Spanish (Español)',
              fr: 'French (Français)',
              de: 'German (Deutsch)',
              ar: 'Arabic (العربية)',
              ur: 'Urdu (اردو)',
            };
            const targetLang = langNames[preferredLanguage] || preferredLanguage;
            fullSystemPrompt += `\n\n[USER PREFERRED LANGUAGE]: The visitor has selected ${targetLang}. Please formulate your reply completely and fluently in ${targetLang} while remaining faithful to the retrieved business facts.`;
          }

          const llmMessages: ChatMessage[] = [
            { role: 'system', content: fullSystemPrompt },
            ...messages.slice(-6).map((m: any) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          ];

          // Format citations ONLY for genuine live external web search results.
          // Never expose internal knowledge base files, documents, or training materials to customers.
          const finalCitations = (isWebSearchUsed && liveWebResults.length > 0)
            ? liveWebResults.map((r) => ({
                sourceTitle: r.title,
                url: r.url,
                preview: r.snippet,
                sourceType: 'web',
                isLiveWebSearch: true,
              }))
            : [];

          // Send citations (strictly only present when live web search is used)
          const citationsEvent = `data: ${JSON.stringify({
            type: 'citations',
            citations: finalCitations,
            conversationId: conv.id,
            isWebSearch: isWebSearchUsed && finalCitations.length > 0,
            webSearchQuery: isWebSearchUsed ? webSearchQuery : undefined,
            attachment: attachmentMeta,
          })}\n\n`;
          controller.enqueue(encoder.encode(citationsEvent));

          let fullAssistantReply = '';

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
            finalCitations,
            Math.ceil(fullAssistantReply.length / 4)
          );

          // Automated Knowledge Gap Detection:
          // Check if the reply fell back or no context was found for a real question
          const isFallback =
            (assistant.fallbackMessage && fullAssistantReply.includes(assistant.fallbackMessage.slice(0, 30))) ||
            /don't have enough specific details|not mentioned in (the|my) knowledge base|connect you with our support team/i.test(fullAssistantReply) ||
            (retrieval.chunks.length === 0 && latestUserMsg.length > 8);

          if (isFallback) {
            Database.recordUnansweredQuery(assistantId, latestUserMsg, visitorId).catch((err) =>
              console.warn('[ChatRoute] Failed to record unanswered query:', err?.message)
            );
          }

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
