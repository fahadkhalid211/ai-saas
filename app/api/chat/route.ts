import { NextRequest, NextResponse } from 'next/server';
import { Database, getLandingConfigForSlugOrTemplate } from '@/lib/db';
import { retrieveRelevantContext } from '@/lib/rag/retrieval';
import { buildSystemPrompt, streamChatResponse } from '@/lib/ai/providers';
import { ChatMessage } from '@/lib/ai/types';
import { isWebSearchIntent, extractSearchQuery, executeWebSearch } from '@/lib/rag/web-search';
import { parseFileOrText } from '@/lib/rag/parsers';
import { enforceRateLimit } from '@/lib/security/rate-limit';

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
    // 1. Rate Limiting Check (max 35 messages per minute per IP)
    const rateLimit = enforceRateLimit(req, 'chat', { windowMs: 60 * 1000, max: 35 });
    if (rateLimit.errorResponse) {
      return rateLimit.errorResponse;
    }

    const body = await req.json();
    const { assistantId, messages, visitorId, conversationId, preferredLanguage, attachment, landingPageSlug } = body;

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

    // 2. Enforce Allowed Domains Whitelist (if configured)
    if (assistant.allowedDomains && assistant.allowedDomains.length > 0) {
      const origin = req.headers.get('origin');
      const referer = req.headers.get('referer');
      let incomingHost: string | null = null;
      try {
        if (origin) incomingHost = new URL(origin).hostname.toLowerCase();
        else if (referer) incomingHost = new URL(referer).hostname.toLowerCase();
      } catch {
        incomingHost = null;
      }

      const isDevOrLocal =
        process.env.NODE_ENV !== 'production' ||
        incomingHost === 'localhost' ||
        incomingHost === '127.0.0.1';

      const isPermitted =
        isDevOrLocal ||
        (incomingHost &&
          assistant.allowedDomains.some((d) => {
            const clean = d.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
            return incomingHost === clean || incomingHost.endsWith('.' + clean);
          }));

      if (!isPermitted) {
        return NextResponse.json(
          {
            error: `Access forbidden from domain "${incomingHost || 'unknown'}". Widget embedding is restricted to: ${assistant.allowedDomains.join(', ')}`,
          },
          { status: 403 }
        );
      }
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
    const isFirstMessage = (conv.messages || []).length === 0;
    await Database.saveMessage(conv.id, 'user', latestUserMsg, [], 0, attachmentMeta);
    await Database.updateConversation(conv.id, {
      sentiment: detectedSentiment,
      ...(isEscalation ? { escalated: true } : {}),
    });

    // Notify dashboard for new chats or messages
    try {
      if (isFirstMessage) {
        await Database.addNotification({
          title: 'New Live Visitor Chat',
          message: `A new visitor started a chat: "${latestUserMsg.slice(0, 75)}"`,
          type: 'chat_new',
          metadata: { conversationId: conv.id, assistantId },
        });
      } else if (conv.isLiveTakeover) {
        await Database.addNotification({
          title: 'Live Chat Visitor Message',
          message: `Incoming visitor message in active takeover: "${latestUserMsg.slice(0, 75)}"`,
          type: 'chat_message',
          metadata: { conversationId: conv.id, assistantId },
        });
      }
    } catch (notifErr) {
      console.warn('[ChatRoute] Notification error:', notifErr);
    }

    // 2. If Human Agent Takeover is active, pause AI bot auto-reply
    if (conv.isLiveTakeover) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const agentName = conv.assignedAgentName || 'Live Support Agent';
          const notificationMsg = `data: ${JSON.stringify({
            type: 'token',
            token: `[Message delivered to ${agentName}. They will reply shortly.]`,
          })}\n\n`;
          const takeoverEvent = `data: ${JSON.stringify({
            type: 'takeover_active',
            agentName,
            conversationId: conv.id,
          })}\n\n`;
          controller.enqueue(encoder.encode(notificationMsg));
          controller.enqueue(encoder.encode(takeoverEvent));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

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
              console.log(`[ChatRoute] Found ${searchResults.length} live online web sources for query: "${searchQuery}"`);

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
              }
            } catch (autoErr) {
              console.warn('[ChatRoute] Auto web search fallback error:', autoErr);
            }
          }

          // Determine active landing page config
          let activeLandingConfig = assistant.landingPageConfig;
          if (landingPageSlug) {
            const dbPage = await Database.getLandingPageBySlugOrDomain(landingPageSlug);
            if (dbPage) {
              activeLandingConfig = dbPage;
            } else {
              activeLandingConfig = getLandingConfigForSlugOrTemplate(landingPageSlug);
            }
          }

          // Filter out foreign industry knowledge chunks to prevent cross-contamination
          if (activeLandingConfig) {
            const currentIndustry = (activeLandingConfig.industry || activeLandingConfig.slug || '').toLowerCase();
            const isBarber = currentIndustry.includes('barber');
            const isGym = currentIndustry.includes('gym') || currentIndustry.includes('fitness');
            const isRealEstate = currentIndustry.includes('real') || currentIndustry.includes('estate') || currentIndustry.includes('property');

            retrieval.chunks = (retrieval.chunks || []).filter((chunk: any) => {
              const text = (chunk.content || '').toLowerCase();
              if (isBarber) {
                // If on barber page, reject gym, fitness, real estate chunks
                if (text.includes('gym') || text.includes('cardio') || text.includes('sauna') || text.includes('workout pass') || text.includes('property listing')) {
                  return false;
                }
              } else if (isGym) {
                // If on gym page, reject barber haircut chunks
                if (text.includes('haircut') || text.includes('beard trim') || text.includes('fade')) {
                  return false;
                }
              }
              return true;
            });
            retrieval.contextText = retrieval.chunks.map((c: any) => c.content).join('\n\n');
          }

          // Inject official landing page services, pricing, and operating details into context
          let landingKnowledge = '';
          let businessPrompt = assistant.systemPrompt;

          if (activeLandingConfig) {
            const cfg = activeLandingConfig;
            const srvList = (cfg.services || []).map((s: any) => 
              `- ${s.name}: ${s.price} (Duration: ${s.durationMinutes} mins) - ${s.description}`
            ).join('\n');
            const hoursList = (cfg.workingHours || []).map((h: any) => `- ${h.days}: ${h.hours}`).join('\n');
            landingKnowledge = `\n\n[OFFICIAL BUSINESS PROFILE, SERVICES & PRICING CATALOG]:
Business Name: ${cfg.businessName}
Tagline: ${cfg.tagline}
Address / Location: ${cfg.address || 'Local facility'}
Phone: ${cfg.phone || 'Direct contact available'}
Email: ${cfg.email || 'Direct contact available'}

OFFICIAL SERVICES & LIVE PRICING:
${srvList || 'Consultation and custom packages available upon request.'}

OFFICIAL OPERATING HOURS:
${hoursList || 'Regular business hours.'}

INSTRUCTIONS FOR INQUIRIES:
Always cite the exact prices and service durations from the official catalog above when visitors inquire about prices, services, hours, or appointments. Always invite the user to schedule their appointment.
When the user asks to book, schedule, or reserve an appointment, enthusiastically encourage them and ALWAYS include the token [ACTION:BOOKING_FORM] at the very end of your response so the interactive booking card is displayed.`;

            businessPrompt = `You are the friendly, professional AI representative for ${cfg.businessName}.
Tagline: ${cfg.tagline}
Physical Address: ${cfg.address || 'Local facility'}
Phone: ${cfg.phone || 'Available online'}
Email: ${cfg.email || 'Available online'}

CRITICAL IDENTITY & BUSINESS SCOPE:
- You represent ONLY ${cfg.businessName}.
- You answer questions strictly regarding ${cfg.businessName}'s services, haircuts, beard grooming, pricing, appointments, and operating hours.
- You must NEVER mention gym memberships, fitness passes, personal training, real estate listings, legal consults, or any other unrelated business.
- When asked about prices or services, ALWAYS cite the exact services and prices from the official catalog.
- When the visitor expresses interest in booking an appointment, confirm warmly and append [ACTION:BOOKING_FORM] at the end of your message.`;
          }

          const combinedContext = (retrieval.contextText || '') + landingKnowledge;

          // 3. Assemble Prompt with web-linking instructions
          let fullSystemPrompt = buildSystemPrompt({
            businessPrompt,
            contextText: combinedContext,
            fallbackMessage: assistant.fallbackMessage,
            assistantName: activeLandingConfig?.businessName || assistant.name,
          });

          if (liveWebResults.length > 0) {
            const webSnippets = liveWebResults
              .slice(0, 6)
              .map((r, i) => `[Live Web Result ${i + 1}: ${r.title}]\nURL: ${r.url}\nExcerpt: ${r.snippet}`)
              .join('\n\n');
            fullSystemPrompt += `\n\n[LIVE ONLINE WEB SEARCH FINDINGS]:\n${webSnippets}\nUse the above live web search findings to answer the visitor's question accurately and authoritatively.`;
          }

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
