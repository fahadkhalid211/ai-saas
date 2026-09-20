import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth, getAuthContext, requireWorkspaceAssistant } from '@/lib/security/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId') || 'demo-assistant';
    const slug = searchParams.get('slug') || 'all';
    const days = parseInt(searchParams.get('days') || '30', 10);

    const assistant = await requireWorkspaceAssistant(ctx, assistantId);
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found or forbidden' }, { status: 404 });
    }

    const convs = await Database.getConversations(assistantId, ctx.workspaceId);
    const leads = await Database.getLeads(assistantId, ctx.workspaceId);
    const appointments = await Database.getAppointments(assistantId, ctx.workspaceId);
    const sources = await Database.getKnowledgeSources(assistantId);
    const chunks = await Database.getChunksByAssistant(assistantId);
    const unanswered = await Database.getUnansweredQueries(assistantId);

    const totalConversations = convs.length;
    const totalMessages = convs.reduce((acc, c) => acc + (c.messages?.length || 0), 0);
    const totalLeads = leads.length;
    const totalAppointments = appointments.length;
    const totalChunks = chunks.length;
    const pendingUnanswered = unanswered.filter((u) => !u.resolved).length;

    const conversionRate = totalConversations > 0
      ? ((totalLeads / totalConversations) * 100).toFixed(1)
      : '0.0';

    const avgMessagesPerConv = totalConversations > 0
      ? (totalMessages / totalConversations).toFixed(1)
      : '0.0';

    const resolutionRate = totalConversations > 0
      ? (Math.max(0, (totalConversations - pendingUnanswered) / totalConversations) * 100).toFixed(1)
      : '100.0';

    const sentiment = {
      urgent: convs.filter((c) => c.sentiment === 'urgent' || c.escalated).length,
      positive: convs.filter((c) => c.sentiment === 'positive').length,
      neutral: convs.filter((c) => !c.sentiment || c.sentiment === 'neutral').length,
    };

    // 7-day conversational trend
    const now = new Date();
    const last7Days: { date: string; label: string; count: number; leads: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const cCount = convs.filter((c) => c.createdAt && c.createdAt.slice(0, 10) === dateStr).length;
      const lCount = leads.filter((l) => l.createdAt && l.createdAt.slice(0, 10) === dateStr).length;
      last7Days.push({ date: dateStr, label: dayLabel, count: cCount, leads: lCount });
    }

    // Google-grade Complete Web Pageviews & Customer Intelligence Analytics
    const webAndCustomerAnalytics = await Database.getCompleteAnalytics({
      assistantId,
      slug,
      days,
      workspaceId: ctx.workspaceId,
    });

    // Widget funnel (distinct sessions that loaded / opened the embeddable widget).
    // `available: false` means not tracked, which is different from a real zero.
    const widgetFunnel = await Database.getWidgetFunnel(assistant.id, Number.isFinite(days) ? days : 30);

    return NextResponse.json({
      widgetFunnel,
      metrics: {
        totalConversations,
        totalMessages,
        totalLeads,
        totalAppointments,
        totalSources: sources.length,
        totalChunks,
        conversionRate,
        avgMessagesPerConv,
        resolutionRate,
        pendingUnanswered,
        sentiment,
        trend: last7Days,
      },
      webAnalytics: webAndCustomerAnalytics,
    });
  } catch (error: any) {
    console.error('Failed to get analytics:', error);
    return NextResponse.json({ error: error?.message || 'Failed to get analytics' }, { status: 500 });
  }
});

// Record live page view event from hosted landing page
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`pageview:${ip}`, { windowMs: 60 * 1000, max: 120 });
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many analytics events' }, { status: 429 });
    }

    const body = await req.json();
    const { slug, landingPageName, visitorId, referrer, userAgent, source } = body;

    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const cleanSlug = slug.trim().slice(0, 80);
    const cleanLandingPageName = (landingPageName && typeof landingPageName === 'string')
      ? landingPageName.trim().slice(0, 120)
      : undefined;
    const cleanVisitorId = (visitorId && typeof visitorId === 'string')
      ? visitorId.trim().slice(0, 64)
      : undefined;
    const cleanReferrer = (referrer && typeof referrer === 'string')
      ? referrer.trim().slice(0, 500)
      : undefined;
    const cleanUserAgent = (userAgent && typeof userAgent === 'string')
      ? userAgent.trim().slice(0, 500)
      : undefined;
    const cleanSource = (source && typeof source === 'string')
      ? source.trim().slice(0, 50)
      : undefined;

    const record = await Database.recordPageView({
      slug: cleanSlug,
      landingPageName: cleanLandingPageName,
      visitorId: cleanVisitorId,
      referrer: cleanReferrer,
      userAgent: cleanUserAgent,
      source: cleanSource,
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Failed to record page view:', error);
    return NextResponse.json({ error: error?.message || 'Failed to record page view' }, { status: 500 });
  }
}
