import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Database } from '@/lib/db';
import { withRoleAuth, getAuthContext, requireWorkspaceAssistant } from '@/lib/security/auth';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

const POSTHandler = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const rateLimit = enforceRateLimit(req, 'wp-auth-connect', { windowMs: 60 * 1000, max: 20 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;

    const ctx = await getAuthContext(req);
    const body = await req.json().catch(() => ({}));
    const {
      assistantId,
      siteUrl,
      siteName = 'My WordPress Website',
      returnUrl,
      state = '',
    } = body;

    if (!siteUrl) {
      return NextResponse.json({ success: false, error: 'siteUrl is required' }, { status: 400 });
    }

    if (!returnUrl) {
      return NextResponse.json({ success: false, error: 'returnUrl is required' }, { status: 400 });
    }

    // SSRF / Open-Redirect Guard: returnUrl must be on the same origin/host as siteUrl
    try {
      const parsedSite = new URL(siteUrl);
      const parsedReturn = new URL(returnUrl);
      if (parsedSite.hostname.toLowerCase() !== parsedReturn.hostname.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Security violation: return_url does not match site_url origin.' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid siteUrl or returnUrl format' }, { status: 400 });
    }

    const cleanDomain = siteUrl
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/[^a-z0-9.-]/gi, '')
      .toLowerCase();

    const targetWorkspace = ctx.workspaceId !== '*' ? ctx.workspaceId : 'default-workspace';
    let assistant = null;

    if (assistantId && assistantId !== 'new') {
      assistant = await requireWorkspaceAssistant(ctx, assistantId);
      if (!assistant) {
        return NextResponse.json({ success: false, error: 'Selected assistant not found' }, { status: 404 });
      }
    }

    // Generate or retain secure secret
    const siteSecret = assistant?.webhookSecret || ('cres_wp_' + crypto.randomBytes(20).toString('hex'));

    if (assistant) {
      const currentDomains = assistant.allowedDomains || [];
      const updatedDomains = Array.from(new Set([...currentDomains, cleanDomain]));
      await Database.updateAssistant(assistant.id, {
        allowedDomains: updatedDomains,
        webhookSecret: siteSecret,
      });
    } else {
      // Auto-create new assistant for this WordPress site
      assistant = await Database.createAssistant({
        name: `${siteName} AI Assistant`,
        description: `Connected to WordPress site ${cleanDomain}`,
        workspaceId: targetWorkspace,
        allowedDomains: [cleanDomain],
        webhookSecret: siteSecret,
        systemPrompt: `You are the AI Assistant for ${siteName}. Answer visitor questions based on store and site documentation.`,
        welcomeMessage: `Hi! Welcome to ${siteName}. How can I assist you today?`,
        starterQuestions: ['Tell me about your services', 'How can I contact support?'],
        allowWebSearch: true,
      });
    }

    // Get current user member info for display
    const member = await Database.getTeamMemberById(ctx.memberId);
    const accountEmail = member?.email || 'admin@crescelo.com';

    // Construct secure redirect URL with connection parameters
    const nextUrl = new URL(req.url);
    const hostUrl = nextUrl.origin;

    const callbackUrl = new URL(returnUrl);
    callbackUrl.searchParams.set('crescelo_action', 'callback');
    callbackUrl.searchParams.set('assistant_id', assistant.id);
    callbackUrl.searchParams.set('assistant_name', assistant.name);
    callbackUrl.searchParams.set('api_key', siteSecret);
    callbackUrl.searchParams.set('site_secret', siteSecret);
    callbackUrl.searchParams.set('host_url', hostUrl);
    callbackUrl.searchParams.set('account_email', accountEmail);
    if (state) {
      callbackUrl.searchParams.set('state', state);
    }

    return NextResponse.json({
      success: true,
      redirectUrl: callbackUrl.toString(),
      assistantId: assistant.id,
      assistantName: assistant.name,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Authorization failed' }, { status: 500 });
  }
});

export const POST = logged(POSTHandler, { route: '/api/connectors/wordpress/authorize' });
