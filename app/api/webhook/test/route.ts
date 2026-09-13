import { NextResponse } from 'next/server';
import { testWebhookPing } from '@/lib/webhook';
import { verifyAdminRequest } from '@/lib/security/auth';

export async function POST(req: Request) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

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
}
