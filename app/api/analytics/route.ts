import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/security/auth';

export async function GET(req: Request) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'assistantId query parameter required' }, { status: 400 });
    }

    const convs = await Database.getConversations(assistantId);
    const leads = await Database.getLeads(assistantId);
    const appointments = await Database.getAppointments(assistantId);
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

    // 7-day trend
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

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error('Failed to get analytics:', error);
    return NextResponse.json({ error: error?.message || 'Failed to get analytics' }, { status: 500 });
  }
}