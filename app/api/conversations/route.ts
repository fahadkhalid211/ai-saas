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
