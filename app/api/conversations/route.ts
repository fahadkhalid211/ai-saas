import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId required' }, { status: 400 });
    }

    const conversations = await Database.getConversations(assistantId);
    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, resolved, escalated, sentiment } = body;

    if (!id) {
      return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 });
    }

    const updated = await Database.updateConversation(id, {
      ...(resolved !== undefined ? { resolved } : {}),
      ...(escalated !== undefined ? { escalated } : {}),
      ...(sentiment !== undefined ? { sentiment } : {}),
    });

    return NextResponse.json({ success: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update conversation' }, { status: 500 });
  }
}
