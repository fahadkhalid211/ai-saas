import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { generateIcsFeed } from '@/lib/calendar/ical';

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId') || 'demo-assistant';

    const assistant = await Database.getAssistantById(assistantId);
    const calendarName = assistant
      ? `${assistant.name} Calendar`
      : 'Kortex AI Appointments';

    const appointments = await Database.getAppointments(assistantId);

    const icsData = generateIcsFeed(appointments, calendarName);

    return new Response(icsData, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="appointments.ics"',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('[CalendarFeed] Error generating iCal feed:', error);
    return new Response('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Kortex AI//Calendar Feed Error//EN\r\nEND:VCALENDAR', {
      status: 500,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
