import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assistant = await Database.getAssistantById(id);

    if (!assistant) {
      return NextResponse.json(
        { error: 'Assistant not found' },
        {
          status: 404,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Public sanitized config
    const publicConfig = {
      id: assistant.id,
      name: assistant.name,
      welcomeMessage: assistant.welcomeMessage,
      primaryColor: assistant.primaryColor || '#2563eb',
      launcherPosition: assistant.launcherPosition || 'bottom-right',
      starterQuestions: assistant.starterQuestions || [],
      collectLeadEmail: assistant.collectLeadEmail || false,
      supportCustomFields: assistant.supportCustomFields || [],
    };

    return NextResponse.json(publicConfig, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch widget configuration' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
