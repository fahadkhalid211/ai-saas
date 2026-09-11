import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const assistantId = searchParams.get('assistantId');

    // Single conversation lookup (used for live sync in widget and dashboard)
    if (id) {
      const conversation = await Database.getConversationById(id);
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      return NextResponse.json({ conversation });
    }

    // Assistant-specific conversations lookup
    if (assistantId) {
      const conversations = await Database.getConversations(assistantId);
      return NextResponse.json({ conversations });
    }

    // Workspace-wide conversations lookup
    const conversations = await Database.getConversations();
    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, content, agentName, takeover = true } = body;

    if (!conversationId || !content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'conversationId and non-empty content are required' }, { status: 400 });
    }

    const conv = await Database.getConversationById(conversationId);
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
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
    const body = await req.json();
    const { id, resolved, escalated, sentiment, isLiveTakeover, assignedAgentName, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 });
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
