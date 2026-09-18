import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { sendSupportLeadEmail } from '@/lib/email';
import { dispatchWebhook } from '@/lib/webhook';
import { verifyAdminRequest, getAuthContext, requireWorkspaceAssistant, withRoleAuth } from '@/lib/security/auth';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    // Rate limit lead submissions (max 10 per minute per IP)
    const rateLimit = enforceRateLimit(req, 'lead', { windowMs: 60 * 1000, max: 10 });
    if (rateLimit.errorResponse) {
      return rateLimit.errorResponse;
    }

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
    if (!assistant) {
      return NextResponse.json(
        { error: 'Assistant not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

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
      }
    }

    // Asynchronously dispatch outbound webhook (Zapier, Make, CRM)
    if (assistant?.webhookUrl && assistant.webhookUrl.trim()) {
      dispatchWebhook(assistant, 'lead.created', lead).catch((webhookErr) => {
        console.warn('[LeadAPI] Webhook dispatch warning:', webhookErr?.message);
      });
    }

    // Security Audit Log
    try {
      await Database.addAuditLog({
        workspaceId: assistant.workspaceId || 'default-workspace',
        actor: {
          id: 'visitor',
          name: lead.name || 'Visitor',
          email: lead.email,
          ip: rateLimit.clientIp,
        },
        action: 'lead.captured',
        targetType: 'lead',
        targetId: lead.id,
        details: {
          assistantId,
          email: lead.email,
          name: lead.name,
        },
      });
    } catch (auditErr: any) {
      console.warn('[LeadAPI] Audit log error:', auditErr?.message);
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
    // Only authenticated admins can view customer leads
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId parameter required' }, { status: 400 });
    }

    const assistant = await requireWorkspaceAssistant(ctx, assistantId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found or forbidden' }, { status: 404 });
    }

    const leads = await Database.getLeads(assistantId);
    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

export const DELETE = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter required' }, { status: 400 });
    }

    const deleted = await Database.deleteLead(id, ctx.workspaceId);
    if (!deleted) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await Database.addAuditLog({
      workspaceId: ctx.workspaceId,
      actor: {
        id: ctx.memberId,
        name: ctx.role === 'owner' ? 'Workspace Owner' : 'Admin User',
        ip: getClientIp(req),
      },
      action: 'lead.deleted',
      targetType: 'lead',
      targetId: id,
      details: {
        leadId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete lead' }, { status: 500 });
  }
});
