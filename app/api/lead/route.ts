import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assistantId, email, name, phone, notes } = body;

    if (!assistantId || !email) {
      return NextResponse.json(
        { error: 'assistantId and email are required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const lead = await Database.saveLead({
      assistantId,
      email,
      name,
      phone,
      notes,
    });

    return NextResponse.json({ success: true, lead }, {
      status: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to record lead' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId parameter required' }, { status: 400 });
    }

    const leads = await Database.getLeads(assistantId);
    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch leads' }, { status: 500 });
  }
}
