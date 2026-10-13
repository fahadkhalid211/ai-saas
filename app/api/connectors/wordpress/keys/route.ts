import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Database } from '@/lib/db';
import { withRoleAuth, getAuthContext, requireWorkspaceAssistant } from '@/lib/security/auth';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

const POSTHandler = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const rateLimit = enforceRateLimit(req, 'wp-keys-gen', { windowMs: 60 * 1000, max: 20 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const ctx = await getAuthContext(req);
    const body = await req.json().catch(() => ({}));
    const { assistantId } = body;

    if (!assistantId) {
      return NextResponse.json({ success: false, error: 'assistantId is required' }, { status: 400 });
    }

    const assistant = await requireWorkspaceAssistant(ctx, assistantId);
    if (!assistant) {
      return NextResponse.json({ success: false, error: 'Assistant not found or forbidden' }, { status: 404 });
    }

    // Generate secure API key with standard prefix
    const newApiKey = 'cres_wp_' + crypto.randomBytes(20).toString('hex');

    await Database.updateAssistant(assistantId, {
      webhookSecret: newApiKey,
    });

    return NextResponse.json({
      success: true,
      apiKey: newApiKey,
      assistantId: assistant.id,
      assistantName: assistant.name,
      message: 'WordPress API Key generated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to generate key' }, { status: 500 });
  }
});

const GETHandler = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const targetWorkspace = ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace';
    const assistants = await Database.getAssistants(targetWorkspace);

    return NextResponse.json({
      success: true,
      assistants: assistants.map((a) => ({
        id: a.id,
        name: a.name,
        hasKey: Boolean(a.webhookSecret),
        apiKey: a.webhookSecret || null,
        allowedDomains: a.allowedDomains || [],
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to list keys' }, { status: 500 });
  }
});

export const POST = logged(POSTHandler, { route: '/api/connectors/wordpress/keys' });
export const GET = logged(GETHandler, { route: '/api/connectors/wordpress/keys' });
