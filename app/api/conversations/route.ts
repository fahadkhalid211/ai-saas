import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { verifyAdminRequest, verifyConversationAccessToken, getAuthContext } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';
import { enrichConversation } from '@/lib/chat/conversation-enrichment';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const CONVERSATION_STATUSES = ['bot', 'waiting_for_agent', 'live_agent', 'resolved'];
const CONVERSATION_SENTIMENTS = ['urgent', 'positive', 'neutral'];

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: CORS_HEADERS,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

async function GETHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const assistantId = searchParams.get('assistantId');
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search')?.toLowerCase().trim();

    // Single conversation lookup (used for live sync in widget and dashboard).
    // The public widget has no login session, so it authorizes with a
    // per-conversation capability token instead; admins may use their
    // existing session/cookie in place of a token.
    if (id) {
      const token = searchParams.get('token');
      const hasValidToken = verifyConversationAccessToken(id, token);
      const ctx = await getAuthContext(req);

      if (!hasValidToken && !ctx.authenticated) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      const rawConversation = await Database.getConversationById(id);
      if (!rawConversation) {
        return jsonResponse({ error: 'Conversation not found' }, 404);
      }

      const ast = await Database.getAssistantById(rawConversation.assistantId);

      if (!hasValidToken && ctx.authenticated && ctx.workspaceId !== '*') {
        if (!ast || (ast.workspaceId || 'default-workspace') !== ctx.workspaceId) {
          return jsonResponse({ error: 'Forbidden' }, 403);
        }
      }

      const conversation = enrichConversation(rawConversation, ast);

      // Incremental polling support: when the caller already has the first
      // `sinceCount` messages, only return what's new plus lightweight
      // conversation metadata, instead of re-transferring the full,
      // ever-growing transcript on every 1-2s poll.
      const sinceCountRaw = searchParams.get('sinceCount');
      const sinceCount = sinceCountRaw ? parseInt(sinceCountRaw, 10) : NaN;
      if (Number.isInteger(sinceCount) && sinceCount >= 0) {
        const allMessages = conversation.messages || [];
        const newMessages = sinceCount < allMessages.length ? allMessages.slice(sinceCount) : [];
        const { messages: _omit, ...meta } = conversation;
        return jsonResponse({
          conversation: meta,
          newMessages,
          totalMessageCount: allMessages.length,
        });
      }

      return jsonResponse({ conversation });
    }

    // Listing conversations across an assistant or workspace strictly requires admin auth
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return jsonResponse({ error: 'Unauthorized: Admin authentication required' }, 401);
    }

    let rawList: any[] = [];
    let targetAssistant: any = null;

    // Assistant-specific conversations lookup
    if (assistantId) {
      targetAssistant = await Database.getAssistantById(assistantId);
      rawList = await Database.getConversations(assistantId, ctx.workspaceId);
    } else {
      rawList = await Database.getConversations(undefined, ctx.workspaceId);
    }

    // Enrich every conversation so that title, language, summary, metrics, and tools are guaranteed
    let conversations = rawList.map((c) => enrichConversation(c, targetAssistant));

    // Optional status filter
    if (statusParam && statusParam !== 'all') {
      conversations = conversations.filter((c) => {
        if (statusParam === 'waiting_for_agent') return c.status === 'waiting_for_agent' || (c.escalated && !c.resolved);
        if (statusParam === 'live_agent') return c.status === 'live_agent' || c.isLiveTakeover;
        if (statusParam === 'resolved') return c.status === 'resolved' || c.resolved;
        if (statusParam === 'bot') return c.status === 'bot' || (!c.isLiveTakeover && c.status !== 'waiting_for_agent' && !c.resolved);
        return c.status === statusParam;
      });
    }

    // Optional search filter
    if (searchParam) {
      conversations = conversations.filter((c) => {
        const matchesTitle = c.title?.toLowerCase().includes(searchParam);
        const matchesSummary = c.summary?.toLowerCase().includes(searchParam);
        const matchesVisitor = c.visitorId?.toLowerCase().includes(searchParam) ||
          c.visitorEmail?.toLowerCase().includes(searchParam) ||
          c.visitorName?.toLowerCase().includes(searchParam) ||
          c.id?.toLowerCase().includes(searchParam);
        const matchesMessages = (c.messages || []).some((m: any) =>
          m.content?.toLowerCase().includes(searchParam)
        );
        return matchesTitle || matchesSummary || matchesVisitor || matchesMessages;
      });
    }

    return jsonResponse({ conversations });
  } catch (error: any) {
    return jsonResponse({ error: error?.message || 'Failed to fetch conversations' }, 500);
  }
}

async function POSTHandler(req: Request) {
  try {
    // Only authenticated human operators can send operator messages
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return jsonResponse({ error: 'Unauthorized: Admin authentication required' }, 401);
    }

    const body = await req.json();
    const { conversationId, content, agentName, takeover = true } = body;

    if (!conversationId || !content || typeof content !== 'string' || !content.trim()) {
      return jsonResponse({ error: 'conversationId and non-empty content are required' }, 400);
    }

    const conv = await Database.getConversationById(conversationId);
    if (!conv) {
      return jsonResponse({ error: 'Conversation not found' }, 404);
    }

    if (ctx.workspaceId !== '*') {
      const ast = await Database.getAssistantById(conv.assistantId);
      if (!ast || (ast.workspaceId || 'default-workspace') !== ctx.workspaceId) {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }
    }

    const cleanName = (agentName && typeof agentName === 'string' && agentName.trim())
      ? agentName.trim()
      : 'Support Agent';

    // If live takeover was not active, record an in-stream system announcement
    const wasLiveTakeover = Boolean(conv.isLiveTakeover);
    let systemJoinMessage = null;
    if (takeover && !wasLiveTakeover) {
      systemJoinMessage = await Database.saveMessage(
        conversationId,
        'system',
        `Live agent ${cleanName} has joined the chat.`,
        [],
        0,
        undefined,
        cleanName
      );
    }

    // 1. Save message as human agent
    const message = await Database.saveMessage(
      conversationId,
      'agent',
      content.trim(),
      [],
      0,
      undefined,
      cleanName
    );

    // 2. Mark conversation as live takeover active
    if (takeover) {
      await Database.updateConversation(conversationId, {
        isLiveTakeover: true,
        assignedAgentName: cleanName,
        status: 'live_agent',
      });
    }

    return jsonResponse({
      success: true,
      message,
      systemMessage: systemJoinMessage,
      isLiveTakeover: true,
      assignedAgentName: cleanName,
    });
  } catch (error: any) {
    return jsonResponse({ error: error?.message || 'Failed to send operator message' }, 500);
  }
}

async function PATCHHandler(req: Request) {
  try {
    // Only authenticated admins/operators can patch conversation status
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return jsonResponse({ error: 'Unauthorized: Admin authentication required' }, 401);
    }

    const body = await req.json();
    const {
      id,
      resolved,
      escalated,
      sentiment,
      isLiveTakeover,
      assignedAgentName,
      status,
      title,
      language,
      summary,
      rating,
    } = body;

    if (!id) {
      return jsonResponse({ error: 'Conversation id is required' }, 400);
    }

    // The database only accepts these values. Anything else used to reach it, fail there and take the connection offline.
    if (status !== undefined && !CONVERSATION_STATUSES.includes(status)) {
      return jsonResponse({ error: `status must be one of: ${CONVERSATION_STATUSES.join(', ')}` }, 400);
    }
    if (sentiment !== undefined && sentiment !== null && !CONVERSATION_SENTIMENTS.includes(sentiment)) {
      return jsonResponse({ error: `sentiment must be one of: ${CONVERSATION_SENTIMENTS.join(', ')}` }, 400);
    }

    const conv = await Database.getConversationById(id);
    if (!conv) {
      return jsonResponse({ error: 'Conversation not found' }, 404);
    }

    if (ctx.workspaceId !== '*') {
      const ast = await Database.getAssistantById(conv.assistantId);
      if (!ast || (ast.workspaceId || 'default-workspace') !== ctx.workspaceId) {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }
    }

    const wasLiveTakeover = Boolean(conv.isLiveTakeover);
    const targetAgentName = (assignedAgentName && typeof assignedAgentName === 'string' && assignedAgentName.trim())
      ? assignedAgentName.trim()
      : (conv.assignedAgentName || 'Support Agent');

    // Announce live agent join or departure to both user and agent
    if (isLiveTakeover === true && !wasLiveTakeover) {
      await Database.saveMessage(
        id,
        'system',
        `Live agent ${targetAgentName} has joined the chat.`,
        [],
        0,
        undefined,
        targetAgentName
      );
    } else if (isLiveTakeover === false && wasLiveTakeover) {
      await Database.saveMessage(
        id,
        'system',
        'Live agent session ended. AI assistant is back online.',
        [],
        0,
        undefined,
        'System'
      );
    }

    const updated = await Database.updateConversation(id, {
      ...(resolved !== undefined ? { resolved } : {}),
      ...(escalated !== undefined ? { escalated } : {}),
      ...(sentiment !== undefined ? { sentiment } : {}),
      ...(isLiveTakeover !== undefined ? { isLiveTakeover } : {}),
      ...(assignedAgentName !== undefined ? { assignedAgentName } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(language !== undefined ? { language } : {}),
      ...(summary !== undefined ? { summary } : {}),
      ...(rating !== undefined ? { rating } : {}),
    });

    return jsonResponse({ success: updated });
  } catch (error: any) {
    return jsonResponse({ error: error?.message || 'Failed to update conversation' }, 500);
  }
}

export const GET = logged(GETHandler, { route: '/api/conversations', sample: 0.2 });
export const POST = logged(POSTHandler, { route: '/api/conversations' });
export const PATCH = logged(PATCHHandler, { route: '/api/conversations' });
