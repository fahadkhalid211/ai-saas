import { NextResponse } from 'next/server';
import { sanitizeLeadInput } from '@/lib/security/lead-input';
import { Database } from '@/lib/db';
import { sendSupportLeadEmail } from '@/lib/email';
import { dispatchIntegrationsAfterResponse } from '@/lib/integrations/dispatch';
import { verifyAdminRequest, getAuthContext, requireWorkspaceAssistant, withRoleAuth } from '@/lib/security/auth';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimit, enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { resolveAttribution, attributionCustomData } from '@/lib/analytics/attribution';
import { logged } from '@/lib/logging/route';

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

async function POSTHandler(req: Request) {
  try {
    // Rate limit lead submissions (max 10 per minute per IP)
    const rateLimit = enforceRateLimit(req, 'lead', { windowMs: 60 * 1000, max: 10 });
    if (rateLimit.errorResponse) {
      return rateLimit.errorResponse;
    }
    const sharedLimited = await enforceDistributedRateLimit(req, 'lead', { windowMs: 60 * 1000, max: 10 });
    if (sharedLimited) return sharedLimited;

    const body = await req.json().catch(() => null);
    const cleaned = sanitizeLeadInput(body);
    if (!cleaned.ok) {
      return NextResponse.json({ error: cleaned.error }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    const { assistantId, email, name, phone, notes, customData } = cleaned.lead;

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

    // Attribution: which conversation/source produced this lead. Stored in customData
    // (JSONB in both DB modes). System keys are written last so they can't be spoofed
    // through a business-defined custom field.
    const attribution = await resolveAttribution(body, assistant.id);
    const baseCustomData =
      customData && typeof customData === 'object' && !Array.isArray(customData) ? customData : {};

    // Save lead into database
    const lead = await Database.saveLead({
      assistantId,
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      notes: notes?.trim() || undefined,
      customData: { ...baseCustomData, ...attributionCustomData(attribution) },
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

    // Webhook (Zapier, Make, CRM), Slack and Google Sheets: delivered after the response, kept alive by after()
    if (assistant) dispatchIntegrationsAfterResponse(assistant, 'lead.created', lead);

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
          source: attribution.source,
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

async function GETHandler(req: Request) {
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

    const leads = await Database.getLeads(assistantId, ctx.workspaceId);
    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch leads' }, { status: 500 });
  }
}

const DELETEHandler = withRoleAuth(['owner', 'admin'], async (req: Request) => {
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

export const POST = logged(POSTHandler, { route: '/api/lead' });
export const GET = logged(GETHandler, { route: '/api/lead' });
export const DELETE = logged(DELETEHandler, { route: '/api/lead' });
