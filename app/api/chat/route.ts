import { NextRequest, NextResponse } from 'next/server';
import { Database, getLandingConfigForSlugOrTemplate } from '@/lib/db';
import { retrieveRelevantContext } from '@/lib/rag/retrieval';
import { buildSystemPrompt, streamChatResponse } from '@/lib/ai/providers';
import { ChatMessage } from '@/lib/ai/types';
import { isWebSearchIntent, extractSearchQuery, executeWebSearch } from '@/lib/rag/web-search';
import { parseFileOrText } from '@/lib/rag/parsers';
import { enforceRateLimit, enforceGlobalRateLimit, enforceRateLimitByKey } from '@/lib/security/rate-limit';
import { generateConversationAccessToken } from '@/lib/security/auth';
import { validateChatPayload } from '@/lib/security/validation';

// Streamed responses (token-by-token LLM output, plus an optional live web
// search round-trip) can run well past a short default function timeout.
export const maxDuration = 120;

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

    // Backstop: per-IP limiting alone can be defeated by rotating spoofable
    // client-supplied headers, so also cap total system-wide chat volume as
    // a circuit breaker on worst-case LLM provider cost/quota exhaustion.
    const globalLimit = enforceGlobalRateLimit('chat', { windowMs: 60 * 1000, max: 600 });
    if (globalLimit.errorResponse) {
      return globalLimit.errorResponse;
    }

    const body = await req.json();

    const validation = validateChatPayload(body);
    if (!validation.valid || !validation.sanitized) {
      const firstError = Object.values(validation.errors)[0] || 'Invalid chat payload';
      return NextResponse.json({ error: firstError, errors: validation.errors }, { status: 400 });
    }

    const {
      assistantId,
      messages,
      visitorId,
      conversationId,
      preferredLanguage,
      landingPageSlug,
    } = validation.sanitized;
    const attachment = body?.attachment;

    let assistant = await Database.getAssistantById(assistantId);
    if (!assistant) {
      // 1. Check if assistantId is actually a landing page slug or custom domain
      let page = await Database.getLandingPageBySlugOrDomain(assistantId);
      if (!page && landingPageSlug) {
        page = await Database.getLandingPageBySlugOrDomain(landingPageSlug);
      }
      if (page?.assistantId) {
        assistant = await Database.getAssistantById(page.assistantId);
      }
      if (!assistant && page) {
        const wsId = page.workspaceId || 'default-workspace';
        const wsAsts = await Database.getAssistants(wsId);
        const matched = wsAsts.find((ast) =>
          ast.id === page!.slug ||
          ast.id === `ast_${page!.slug}` ||
          ast.name.toLowerCase().includes((page!.businessName || '').toLowerCase())
        );
        if (matched) assistant = matched;
      }
      // 2. Check getAssistantBySlug
      if (!assistant) {
        assistant = await Database.getAssistantBySlug(assistantId);
      }
      if (!assistant && landingPageSlug) {
        assistant = await Database.getAssistantBySlug(landingPageSlug);
      }
      // 3. Fallback to demo-assistant ONLY if explicitly requested or for classic barbershop
      if (!assistant && (assistantId === 'demo-assistant' || landingPageSlug === 'classic-barbershop' || !landingPageSlug)) {
        assistant = await Database.getAssistantById('demo-assistant');
      }
    }

    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    // Per-assistant cost/quota cap. The embed-domain allowlist below is
    // enforced by inspecting Origin/Referer headers, which a non-browser
    // caller can freely spoof to bypass it; this bucket bounds how much
    // traffic (and therefore LLM provider spend) any single assistant can
    // absorb regardless of which IP or forged domain it arrives from.
    const perAssistantLimit = enforceRateLimitByKey(`chat:assistant:${assistant.id}`, {
      windowMs: 60 * 1000,
      max: 120,
    });
    if (perAssistantLimit.errorResponse) {
      return perAssistantLimit.errorResponse;
    }

    // Provider fallback: if assistant is still on the default 'ollama' provider but no Ollama
    // is available, transparently upgrade to a configured env-level provider so the chatbot works
    // even when Supabase has not yet persisted the user's Engine settings.
    if ((assistant.provider || 'ollama').toLowerCase() === 'ollama' && !assistant.apiKeyEncrypted) {
      if (process.env.GROQ_API_KEY) {
        assistant = {
          ...assistant,
          provider: 'groq',
          apiKeyEncrypted: process.env.GROQ_API_KEY,
          modelName: assistant.modelName === 'llama3.2' ? 'openai/gpt-oss-120b' : assistant.modelName,
        };
      } else if (process.env.GEMINI_API_KEY) {
        assistant = {
          ...assistant,
          provider: 'gemini',
          apiKeyEncrypted: process.env.GEMINI_API_KEY,
          modelName: assistant.modelName === 'llama3.2' ? 'gemini-3.6-flash' : assistant.modelName,
        };
      } else if (process.env.OPENAI_API_KEY) {
        assistant = {
          ...assistant,
          provider: 'openai',
          apiKeyEncrypted: process.env.OPENAI_API_KEY,
          modelName: assistant.modelName === 'llama3.2' ? 'gpt-4o-mini' : assistant.modelName,
        };
      }
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

    const humanAgentRegex = /\b(human|agent|person|representative|rep|manager|operator|specialist|support team|someone real|talk to a person|speak with someone|transfer me|talk to human|speak to human|live chat|real person|real human|customer service|help desk|support agent)\b/i;
    const urgentRegex = /\b(cancel|refund|broken|horrible|terrible|frustrated|angry|scam|lawyer|sue|complaint|worst|unacceptable|stolen|emergency|help me now|urgent|dispute|chargeback)\b/i;
    const positiveRegex = /\b(thank|thanks|great|awesome|love|perfect|excellent|helpful|good job|amazing|kudos|appreciate)\b/i;

    const asksForHuman = humanAgentRegex.test(latestUserMsg);
    const isUrgent = urgentRegex.test(latestUserMsg);

    if (asksForHuman || isUrgent) {
      detectedSentiment = 'urgent';
      isEscalation = true;
    } else if (positiveRegex.test(latestUserMsg)) {
      detectedSentiment = 'positive';
    }

    // 1. Get or create conversation record with canonical assistant ID
    const conv = await Database.getOrCreateConversation(assistant.id, visitorId, conversationId);
    // Capability token letting the (unauthenticated) widget poll this
    // specific conversation for live-agent replies without exposing every
    // conversation to anyone who knows/guesses its id.
    const convToken = generateConversationAccessToken(conv.id);
    const isFirstMessage = (conv.messages || []).length === 0;
    await Database.saveMessage(conv.id, 'user', latestUserMsg, [], 0, attachmentMeta);

    const nextStatus = conv.isLiveTakeover
      ? 'live_agent'
      : isEscalation
      ? 'waiting_for_agent'
      : conv.status || 'bot';

    await Database.updateConversation(conv.id, {
      assistantId: assistant.id,
      sentiment: detectedSentiment,
      status: nextStatus,
      ...(isEscalation ? { escalated: true } : {}),
    });

    // Notify dashboard for new chats, escalations, or messages.
    // When a visitor explicitly asks for human support, always dispatch an alert
    // to the operator console even if the conversation was previously flagged,
    // ensuring customer follow-up requests are never silently ignored.
    try {
      const shouldNotifyEscalation = isEscalation && !conv.isLiveTakeover && (!conv.escalated || asksForHuman);
      if (shouldNotifyEscalation) {
        await Database.addNotification({
          assistantId: assistant.id || assistantId,
          title: asksForHuman ? 'Live Agent Requested' : 'Chat Escalation (Urgent)',
          message: `Visitor requested human assistance: "${latestUserMsg.slice(0, 75)}"`,
          type: 'chat_escalated',
          metadata: { conversationId: conv.id, assistantId: assistant.id || assistantId, sentiment: detectedSentiment },
        });
      } else if (isFirstMessage) {
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
          const takeoverEvent = `data: ${JSON.stringify({
            type: 'takeover_active',
            agentName,
            conversationId: conv.id,
            conversationToken: convToken,
            messageDelivered: true,
          })}\n\n`;
          const doneEvent = `data: ${JSON.stringify({
            type: 'done',
            conversationId: conv.id,
            conversationToken: convToken,
            messageDelivered: true,
          })}\n\n`;
          controller.enqueue(encoder.encode(takeoverEvent));
          controller.enqueue(encoder.encode(doneEvent));
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

    // 3. If visitor specifically requested a human agent, emit handoff acknowledgment
    if (asksForHuman && !conv.isLiveTakeover) {
      const handoffText =
        'I have alerted our live support team and connected your session. A human representative has received your message and will join this chat shortly.';
      await Database.saveMessage(conv.id, 'assistant', handoffText, [], 0);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'token',
                token: handoffText,
              })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'escalation',
                status: 'waiting_for_agent',
                conversationId: conv.id,
                conversationToken: convToken,
              })}\n\n`
            )
          );
          // Send done so the widget sets its conversationId and starts polling for agent replies
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                conversationId: conv.id,
                conversationToken: convToken,
              })}\n\n`
            )
          );
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
          const effectiveQuery = webSearchQuery || latestUserMsg;

          const retrieval = await retrieveRelevantContext(
            assistant.id,
            effectiveQuery,
            conversationHistory,
            topK
          );

          // Smart fallback: If assistant has 0 chunks, search across workspace concierges
          if (retrieval.chunks.length === 0) {
            const fallbackTarget = assistant.id === 'demo-assistant' ? 'default-workspace' : 'demo-assistant';
            const fallbackRetrieval = await retrieveRelevantContext(
              fallbackTarget,
              effectiveQuery,
              conversationHistory,
              topK
            );
            if (fallbackRetrieval.chunks.length > 0) {
              retrieval.chunks = fallbackRetrieval.chunks;
              retrieval.contextText = fallbackRetrieval.contextText;
            }
          }

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

          // Filter out foreign industry knowledge chunks to prevent cross-contamination from seed presets
          if (activeLandingConfig) {
            const currentIndustry = (activeLandingConfig.industry || activeLandingConfig.slug || '').toLowerCase();
            const isBarber = currentIndustry.includes('barber');
            const isGym = currentIndustry.includes('gym') || currentIndustry.includes('fitness');

            retrieval.chunks = (retrieval.chunks || []).filter((chunk: any) => {
              const src = (chunk.metadata?.sourceTitle || '').toLowerCase();
              if (src.startsWith('template:') || src.startsWith('sample:')) {
                if (isBarber && (src.includes('gym') || src.includes('fitness') || src.includes('real estate'))) {
                  return false;
                }
                if (isGym && src.includes('barber')) {
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
Tagline: ${cfg.tagline || ''}
Address / Location: ${cfg.address || 'Local facility'}
Phone: ${cfg.phone || 'Direct contact available'}
Email: ${cfg.email || 'Direct contact available'}

OFFICIAL SERVICES & LIVE PRICING:
${srvList || 'Consultation and custom packages available upon request.'}

OFFICIAL OPERATING HOURS:
${hoursList || 'Regular business hours.'}

INSTRUCTIONS FOR INQUIRIES:
- Answer visitor questions accurately and authoritatively using the verified knowledge base documentation and the official business catalog above.
- GENERAL PRICING INQUIRIES: When a visitor asks an open-ended question about prices, rates, or packages (e.g. "what is the price?", "how much do you charge?", "what are your prices?"):
  1. If multiple services exist across the catalog and knowledge base, ask the visitor which specific service they want the price for.
  2. ALWAYS proactively offer: "Would you like to see our complete service list and pricing menu?"
- COMPLETE SERVICE LIST / MENU: If the visitor asks to see the full service list or menu, provide a comprehensive bulleted list of all services with their exact prices and descriptions from both the official catalog and the verified knowledge base.
- UNLISTED SERVICES OR BUDGETS: If a service, package, price, or project budget is not listed in the official catalog above, but appears in the verified knowledge base (from uploaded documents, text entries, audio, or video), you MUST retrieve and provide that information authoritatively. Never claim that you lack information if it exists in any knowledge base fragment.
- MULTI-PROJECT BUDGETS: If the visitor asks a general question about budget (e.g. "what is the budget?", "how much is the budget?"):
  1. Inspect the verified knowledge base for all projects with budgets.
  2. If multiple projects exist, list them by name (e.g. "We have budget information for: 1. The Students Help...") and confirm with the visitor which project they want to know about.
  3. When the visitor clarifies (even with compound names, abbreviations, or synonyms like "studenthelp" for "The Students Help"), provide the exact budget and financial breakdown.
- PRICE/BUDGET CONFLICTS: If the knowledge base documentation states a different price, budget, or figure than the official catalog for what appears to be the SAME service or item, do NOT silently pick one number. Point out that you found two different figures, state both (and where each came from, e.g. "the current pricing catalog" vs. "a document titled X"), and ask the visitor a clarifying question (e.g. which package, tier, or scope they mean) before committing to a number. Only state a single confident figure when the sources agree or the visitor has clarified which one applies.
- When the user asks to book, schedule, or reserve an appointment, enthusiastically encourage them and ALWAYS include the token [ACTION:BOOKING_FORM] at the very end of your response so the interactive booking card is displayed.`;

            businessPrompt = `You are the friendly, professional AI representative for ${cfg.businessName}.
Tagline: ${cfg.tagline || ''}
Physical Address: ${cfg.address || 'Local facility'}
Phone: ${cfg.phone || 'Available online'}
Email: ${cfg.email || 'Available online'}

CRITICAL IDENTITY & BUSINESS SCOPE:
- You represent ONLY ${cfg.businessName}.
- You answer questions accurately, politely, and authoritatively using the verified knowledge base and official business services catalog.
- If the visitor asks questions covered in the knowledge base, provide clear, comprehensive answers using that knowledge.
- When asked about prices, hours, or services, cite the exact services and prices from the official catalog by default.
- If a service or price was added to the knowledge base (via doc, text, audio, video) but is absent from the catalog, authoritatively answer with the knowledge base price.
- When the visitor asks generally about prices, ask which service they are interested in and offer to share the complete service list and pricing menu.
- If asked generally about project budgets, list available projects and confirm which one they want to discuss.
- If a knowledge base document quotes a different price/budget for what looks like the same service, don't guess which is right: mention both figures and their source, and ask the visitor to clarify rather than guessing.
- When the visitor expresses interest in booking an appointment or reservation, confirm warmly and append [ACTION:BOOKING_FORM] at the end of your message.`;
          }

          const combinedContext = [
            retrieval.contextText ? `[OFFICIAL VERIFIED KNOWLEDGE BASE]:\n${retrieval.contextText}` : '',
            landingKnowledge,
          ].filter(Boolean).join('\n\n');

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
            // Prior turns can include 'agent' (human live-support) messages
            // once a conversation has gone through a takeover. LLM providers
            // only accept 'user'/'assistant' roles, so collapse anything
            // that isn't a user turn into 'assistant' rather than passing
            // the raw role through (which providers reject with a 400).
            ...messages.slice(-6).map((m: any) => ({
              role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
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
            conversationToken: convToken,
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
            conversationToken: convToken,
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
