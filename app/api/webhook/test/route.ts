import { NextResponse } from 'next/server';
import { testWebhookPing } from '@/lib/webhook';
import { withAdminAuth } from '@/lib/security/auth';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const rateLimitRes = enforceRateLimit(req, 'webhook-test', { max: 20, windowMs: 60 * 1000 });
    if (rateLimitRes.errorResponse) return rateLimitRes.errorResponse;

    const body = await req.json();
    const { webhookUrl, secret } = body;

    if (!webhookUrl || !webhookUrl.trim()) {
      return NextResponse.json({ error: 'webhookUrl is required' }, { status: 400 });
    }

    const result = await testWebhookPing(webhookUrl, secret);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Webhook ping failed' },
      { status: 500 }
    );
  }
});
