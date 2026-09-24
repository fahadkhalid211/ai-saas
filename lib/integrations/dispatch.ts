import type { AssistantData } from '@/lib/db';
import { dispatchWebhook } from '@/lib/webhook';
import { dispatchSlackNotification } from '@/lib/integrations/slack';
import { dispatchGoogleSheetRow } from '@/lib/integrations/google-sheets';
import { logEvent } from '@/lib/logging/logger';

/**
 * Sends a lead or appointment to the assistant's connected tools (webhook / Zapier, Slack, Google Sheets).
 *
 * On Vercel a function is frozen the moment its response is sent, so a fetch that is merely "not awaited" is cut off
 * and the row never arrives. `dispatchIntegrationsAfterResponse` hands the work to Next's `after()`, which keeps the
 * function alive until it finishes. Every outcome is logged (a failed delivery used to vanish silently).
 */

type Result = { success: boolean; statusCode?: number; error?: string };

async function run(name: string, event: string, assistant: AssistantData, send: () => Promise<Result>): Promise<void> {
  try {
    const started = Date.now();
    const r = await send();
    logEvent({
      level: r.success ? 'info' : 'warn',
      category: 'webhook',
      event: r.success ? `integration.${name}.sent` : `integration.${name}.failed`,
      durationMs: Date.now() - started,
      meta: { assistantId: assistant.id, trigger: event, status: r.statusCode, error: r.success ? undefined : (r.error || '').slice(0, 300) },
    });
  } catch (err) {
    logEvent({ level: 'error', category: 'webhook', event: `integration.${name}.failed`, error: err, meta: { assistantId: assistant.id, trigger: event } });
  }
}

/** Runs every connected integration for an event and waits for them. Never throws. */
export async function dispatchIntegrations(assistant: AssistantData, event: string, data: unknown): Promise<void> {
  const jobs: Promise<void>[] = [];
  if (assistant.webhookUrl?.trim()) jobs.push(run('webhook', event, assistant, () => dispatchWebhook(assistant, event, data)));
  if (assistant.slackEnabled && assistant.slackWebhookUrl?.trim()) jobs.push(run('slack', event, assistant, () => dispatchSlackNotification(assistant, event, data)));
  if (assistant.googleSheetsEnabled && assistant.googleSheetsWebhookUrl?.trim()) jobs.push(run('sheets', event, assistant, () => dispatchGoogleSheetRow(assistant, event, data)));
  await Promise.all(jobs);
}

/** Like dispatchIntegrations, but survives the end of the request (uses after()); falls back to a plain background promise outside one. */
export function dispatchIntegrationsAfterResponse(assistant: AssistantData, event: string, data: unknown): void {
  const task = () => dispatchIntegrations(assistant, event, data);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { after } = require('next/server') as typeof import('next/server');
    after(task);
  } catch {
    void task();
  }
}
