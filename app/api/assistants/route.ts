import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function GET() {
  try {
    const assistants = await Database.getAssistants();
    return NextResponse.json({ assistants });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch assistants' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Assistant name is required' }, { status: 400 });
    }

    const assistant = await Database.createAssistant(body);
    return NextResponse.json({ assistant }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create assistant' },
      { status: 500 }
    );
  }
}
