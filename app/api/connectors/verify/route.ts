import { validateSafeExternalUrl } from '@/lib/security/ssrf';
import { NextResponse } from 'next/server';
import { withRoleAuth } from '@/lib/security/auth';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import {
  verifyAiProviderConnection,
  verifyTelegramBotConnection,
  verifyWhatsAppConnection,
  verifyWebhookConnection,
} from '@/lib/connectors/verify';
import { logged } from '@/lib/logging/route';

const POSTHandler = withRoleAuth(['owner', 'admin'], async (req: Request) => {
  try {
    const rateLimit = enforceRateLimit(req, 'connector-verify', { windowMs: 60 * 1000, max: 30 });
    if (rateLimit.errorResponse) {
      return rateLimit.errorResponse;
    }

    const body = await req.json().catch(() => ({}));
    const { type, provider, apiKey, customBaseUrl, modelName, token, phoneNumberId, webhookUrl } = body;

    // The server makes these requests, so refuse targets on private or internal networks.
    for (const target of [webhookUrl, customBaseUrl]) {
      if (typeof target === 'string' && target.trim()) {
        const safe = await validateSafeExternalUrl(target.trim());
        if (!safe.safe) {
          return NextResponse.json({ success: false, message: safe.error || 'That address is blocked by the security policy.' }, { status: 400 });
        }
      }
    }

    if (type === 'ai') {
      const result = await verifyAiProviderConnection(provider, apiKey, { customBaseUrl, modelName });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (type === 'telegram') {
      const result = await verifyTelegramBotConnection(token);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (type === 'whatsapp') {
      const result = await verifyWhatsAppConnection(token, phoneNumberId);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (type === 'webhook') {
      const result = await verifyWebhookConnection(webhookUrl);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid connector type. Supported types: ai, telegram, whatsapp, webhook.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Connection verification failed unexpectedly.' },
      { status: 500 }
    );
  }
});

export const POST = logged(POSTHandler, { route: '/api/connectors/verify' });
