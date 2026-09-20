import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { verifyAdminRequest, verifyConversationAccessToken, getAuthContext } from '@/lib/security/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const assistantId = searchParams.get('assistantId');

    // Single conversation lookup (used for live sync in widget and dashboard).
    // The public widget has no login session, so it authorizes with a
    // per-conversation capability token instead; admins may use their
    // existing session/cookie in place of a token.
    if (id) {
      const token = searchParams.get('token');
      const hasValidToken = verifyConversationAccessToken(id, token);
      const ctx = await getAuthContext(req);

      if (!hasValidToken && !ctx.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const conversation = await Database.getConversationById(id);
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      if (!hasValidToken && ctx.authenticated && ctx.workspaceId !== '*') {
        const ast = await Database.getAssistantById(conversation.assistantId);
        if (!ast || (ast.workspaceId || 'default-workspace') !== ctx.workspaceId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

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
        return NextResponse.json({
          conversation: meta,
          newMessages,
          totalMessageCount: allMessages.length,
        });
      }

      return NextResponse.json({ conversation });
    }

    // Listing conversations across an assistant or workspace strictly requires admin auth
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    // Assistant-specific conversations lookup
    if (assistantId) {
      const conversations = await Database.getConversations(assistantId, ctx.workspaceId);
      return NextResponse.json({ conversations });
    }

    // Workspace-wide conversations lookup
    const conversations = await Database.getConversations(undefined, ctx.workspaceId);
    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Only authenticated human operators can send operator messages
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, content, agentName, takeover = true } = body;

    if (!conversationId || !content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'conversationId and non-empty content are required' }, { status: 400 });
    }

    const conv = await Database.getConversationById(conversationId);
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (ctx.workspaceId !== '*') {
      const ast = await Database.getAssistantById(conv.assistantId);
      if (!ast || (ast.workspaceId || 'default-workspace') !== ctx.workspaceId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const cleanName = (agentName && typeof agentName === 'string' && agentName.trim())
      ? agentName.trim()
      : 'Support Agent';

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

    return NextResponse.json({
      success: true,
      message,
      isLiveTakeover: true,
      assignedAgentName: cleanName,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to send operator message' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    // Only authenticated admins/operators can patch conversation status
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { id, resolved, escalated, sentiment, isLiveTakeover, assignedAgentName, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 });
    }

    const conv = await Database.getConversationById(id);
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (ctx.workspaceId !== '*') {
      const ast = await Database.getAssistantById(conv.assistantId);
      if (!ast || (ast.workspaceId || 'default-workspace') !== ctx.workspaceId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const updated = await Database.updateConversation(id, {
      ...(resolved !== undefined ? { resolved } : {}),
      ...(escalated !== undefined ? { escalated } : {}),
      ...(sentiment !== undefined ? { sentiment } : {}),
      ...(isLiveTakeover !== undefined ? { isLiveTakeover } : {}),
      ...(assignedAgentName !== undefined ? { assignedAgentName } : {}),
      ...(status !== undefined ? { status } : {}),
    });

    return NextResponse.json({ success: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update conversation' }, { status: 500 });
  }
}
