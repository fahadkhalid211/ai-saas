import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { sendSupportLeadEmail } from '@/lib/email';

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
    const { assistantId, email, name, phone, notes, customData } = body;

    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistantId is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const assistant = await Database.getAssistantById(assistantId);

    // Validate required custom fields if configured
    if (assistant?.supportCustomFields && Array.isArray(assistant.supportCustomFields)) {
      for (const field of assistant.supportCustomFields) {
        if (field.required) {
          const val = customData ? customData[field.id] : undefined;
          if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
            return NextResponse.json(
              { error: `${field.label} is required` },
              { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
            );
          }
        }
      }
    }

    // Save lead into database
    const lead = await Database.saveLead({
      assistantId,
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      notes: notes?.trim() || undefined,
      customData: customData || undefined,
    });

    // Asynchronously dispatch email notification
    if (assistant?.supportReceiverEmail && assistant.supportReceiverEmail.trim()) {
      try {
        await sendSupportLeadEmail({
          to: assistant.supportReceiverEmail.trim(),
          cc: assistant.supportCcEmails || [],
          assistantName: assistant.name || 'AI Assistant',
          lead,
          customFieldsConfig: assistant.supportCustomFields || [],
        });
      } catch (mailErr: any) {
        console.error('[LeadAPI] Email notification dispatch failed:', mailErr?.message);
        // Do not fail the user's lead submission if email delivery encounters an error
      }
    } else {
      console.log(
        `[LeadAPI] Lead saved for assistant "${assistant?.name || assistantId}". Note: No supportReceiverEmail configured in assistant settings.`
      );
    }

    return NextResponse.json(
      { success: true, lead },
      {
        status: 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error: any) {
    console.error('[LeadAPI] Error recording lead:', error);
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
