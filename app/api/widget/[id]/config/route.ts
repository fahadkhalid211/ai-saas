import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { logged } from '@/lib/logging/route';
import { widgetTitleFor } from '@/lib/widget/title';

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

async function GETHandler(
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
      // what visitors see at the top of the chat: the owner's short title, or the assistant's name
      name: widgetTitleFor(assistant),
      welcomeMessage: assistant.welcomeMessage,
      primaryColor: assistant.primaryColor || '#2563eb',
      launcherPosition: assistant.launcherPosition || 'bottom-right',
      starterQuestions: assistant.starterQuestions || [],
      collectLeadEmail: assistant.collectLeadEmail || false,
      supportCustomFields: assistant.supportCustomFields || [],
      whiteLabelEnabled: assistant.whiteLabelEnabled || false,
      customBrandingText: assistant.customBrandingText || '',
      customBrandingUrl: assistant.customBrandingUrl || '',
      proactiveMessageEnabled: assistant.proactiveMessageEnabled || false,
      proactiveMessageText: assistant.proactiveMessageText || '',
      proactiveMessageDelay: assistant.proactiveMessageDelay ?? 5,
      bookingEnabled: assistant.bookingEnabled || false,
      bookingProvider: assistant.bookingProvider || 'direct',
      bookingUrl: assistant.bookingUrl || '',
      bookingPromptText: assistant.bookingPromptText || 'Schedule an Appointment',
      bookingSlotDuration: assistant.bookingSlotDuration || 30,
      bookingStartHour: assistant.bookingStartHour || '09:00',
      bookingEndHour: assistant.bookingEndHour || '17:00',
      bookingAvailableDays: assistant.bookingAvailableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
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

export const GET = logged(GETHandler, { route: '/api/widget/[id]/config', sample: 0.1 });
