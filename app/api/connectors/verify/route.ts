import { validateSafeExternalUrl } from '@/lib/security/ssrf';
import { NextResponse } from 'next/server';
import { withRoleAuth, getAuthContext, requireWorkspaceAssistant } from '@/lib/security/auth';
import { checkAssistantKey, effectiveEngine, isMaskedKey, needsOwnKey, storedKeyProvider } from '@/lib/ai/key-health';
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
    const { type, provider, apiKey, customBaseUrl, modelName, token, phoneNumberId, webhookUrl, assistantId } = body;

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
      // The key field shows a masked placeholder ("gsk_xx****...abcd") for a key that is already saved. That is not the key: testing it
      // reported "invalid" for a perfectly good saved key. When the field holds the placeholder (or nothing), the saved key of this
      // assistant is tested instead, and the verdict is stored so the whole dashboard agrees with the button.
      const typed = typeof apiKey === 'string' ? apiKey.trim() : '';
      if ((!typed && needsOwnKey(String(provider))) || isMaskedKey(typed)) {
        const ctx = await getAuthContext(req);
        const assistant = typeof assistantId === 'string' ? await requireWorkspaceAssistant(ctx, assistantId) : null;
        if (!assistant) {
          return NextResponse.json({ success: false, failure: 'missing', message: 'Paste the full key to test it.' }, { status: 400 });
        }
        const wanted = String(provider || assistant.provider || 'groq').toLowerCase();
        const engine = effectiveEngine(assistant);
        const sameProvider = wanted === engine.provider || wanted === String(assistant.provider || '').toLowerCase();
        if (!sameProvider || (assistant.apiKeyEncrypted && storedKeyProvider(assistant) !== wanted && needsOwnKey(wanted))) {
          return NextResponse.json(
            { success: false, failure: 'missing', message: `The key saved on this assistant is for ${storedKeyProvider(assistant)}. Paste your ${wanted} key to test it.` },
            { status: 400 }
          );
        }
        const health = await checkAssistantKey(assistant);
        const ok = health.state === 'valid';
        return NextResponse.json(
          { success: ok, message: health.message, failure: ok ? undefined : health.state === 'unreachable' ? 'unreachable' : health.state === 'missing' ? 'missing' : 'invalid', keyHealth: health },
          { status: ok ? 200 : 400 }
        );
      }
      const result = await verifyAiProviderConnection(provider, typed, { customBaseUrl, modelName });
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
