import { NextResponse } from 'next/server';
import { testSlackWebhook } from '@/lib/integrations/slack';
import { withAdminAuth } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';

const POSTHandler = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const { webhookUrl, assistantName } = body;

    if (!webhookUrl || !webhookUrl.trim()) {
      return NextResponse.json({ error: 'webhookUrl is required' }, { status: 400 });
    }

    const result = await testSlackWebhook(webhookUrl, assistantName);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, latencyMs: 0, error: error?.message || 'Slack test ping failed' },
      { status: 500 }
    );
  }
});

export const POST = logged(POSTHandler, { route: '/api/channels/slack' });
