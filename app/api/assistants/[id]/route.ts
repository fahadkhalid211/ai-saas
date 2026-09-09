import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assistant = await Database.getAssistantById(id);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }
    return NextResponse.json({ assistant });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to get assistant' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await Database.updateAssistant(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }
    return NextResponse.json({ assistant: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update assistant' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await Database.deleteAssistant(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete assistant' }, { status: 500 });
  }
}
