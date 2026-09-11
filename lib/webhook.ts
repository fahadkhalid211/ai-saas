import crypto from 'crypto';
import { AssistantData } from './db';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  assistantId: string;
  assistantName: string;
  data: any;
}

/**
 * Dispatches an outbound webhook payload to an external URL (Zapier, Make.com, n8n, GoHighLevel, CRM).
 */
export async function dispatchWebhook(
  assistant: AssistantData,
  event: string,
  data: any
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  if (!assistant.webhookUrl || !assistant.webhookUrl.trim()) {
    return { success: false, error: 'No webhook URL configured' };
  }

  // Check event whitelist if configured
  if (assistant.webhookEvents && assistant.webhookEvents.length > 0) {
    if (!assistant.webhookEvents.includes(event)) {
      return { success: false, error: `Event ${event} not enabled for this webhook` };
    }
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    assistantId: assistant.id,
    assistantName: assistant.name,
    data,
  };

  const bodyString = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Kortex-AI-Agent-Webhook/1.0',
  };

  if (assistant.webhookSecret && assistant.webhookSecret.trim()) {
    const signature = crypto
      .createHmac('sha256', assistant.webhookSecret.trim())
      .update(bodyString)
      .digest('hex');
    headers['X-Kortex-Signature'] = signature;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(assistant.webhookUrl.trim(), {
      method: 'POST',
      headers,
      body: bodyString,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return {
      success: res.ok,
      statusCode: res.status,
    };
  } catch (err: any) {
    console.warn(`[Webhook] Failed to dispatch to ${assistant.webhookUrl}:`, err.message);
    return {
      success: false,
      error: err?.message || 'Network error dispatching webhook',
    };
  }
}

/**
 * Tests an outbound webhook endpoint with a dummy test payload.
 */
export async function testWebhookPing(
  webhookUrl: string,
  secret?: string
): Promise<{ success: boolean; statusCode?: number; durationMs: number; error?: string }> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, durationMs: 0, error: 'Webhook URL is required' };
  }

  const start = Date.now();
  const testPayload: WebhookPayload = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    assistantId: 'test_assistant',
    assistantName: 'Test Assistant Ping',
    data: {
      message: 'This is a test notification from your Kortex AI Assistant.',
      sampleLead: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1 555-0199',
        notes: 'Interested in enterprise chatbot automation.',
      },
    },
  };

  const bodyString = JSON.stringify(testPayload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Kortex-AI-Agent-Webhook/1.0',
  };

  if (secret && secret.trim()) {
    headers['X-Kortex-Signature'] = crypto
      .createHmac('sha256', secret.trim())
      .update(bodyString)
      .digest('hex');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers,
      body: bodyString,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const durationMs = Date.now() - start;

    return {
      success: res.ok,
      statusCode: res.status,
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Date.now() - start;
    return {
      success: false,
      durationMs,
      error: err?.message || 'Connection timed out or failed',
    };
  }
}
