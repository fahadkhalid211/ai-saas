import { AssistantData } from '@/lib/db';
import { validateSafeExternalUrl } from '@/lib/security/ssrf';

export interface GoogleSheetsDispatchResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

export interface GoogleSheetsTestResult {
  success: boolean;
  statusCode?: number;
  latencyMs: number;
  error?: string;
}

export { GOOGLE_APPS_SCRIPT_TEMPLATE } from './google-sheets-template';

/**
 * Dispatches a formatted tabular row to a Google Sheets Apps Script Webhook.
 */
export async function dispatchGoogleSheetRow(
  assistant: AssistantData,
  event: string,
  data: any
): Promise<GoogleSheetsDispatchResult> {
  if (!assistant.googleSheetsEnabled || !assistant.googleSheetsWebhookUrl || !assistant.googleSheetsWebhookUrl.trim()) {
    return { success: false, error: 'Google Sheets sync is disabled or webhook URL is missing.' };
  }

  // Check event subscriptions
  const subscribedEvents = assistant.googleSheetsEvents && assistant.googleSheetsEvents.length > 0
    ? assistant.googleSheetsEvents
    : ['lead.created', 'appointment.created'];

  if (!subscribedEvents.includes(event)) {
    return { success: false, error: `Event "${event}" is not subscribed in Google Sheets settings.` };
  }

  // SSRF Verification
  const ssrf = await validateSafeExternalUrl(assistant.googleSheetsWebhookUrl.trim());
  if (!ssrf.safe) {
    console.warn(`[GoogleSheets] Blocked unsafe target URL (${assistant.googleSheetsWebhookUrl}):`, ssrf.error);
    return { success: false, error: ssrf.error || 'Google Sheets webhook URL was blocked by security policy.' };
  }

  const payload = formatSheetPayload(event, assistant, data);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s for Google Apps Script execution

    const res = await fetch(assistant.googleSheetsWebhookUrl.trim(), {
      method: 'POST',
      redirect: 'follow', // Crucial for Google Apps Script 302 redirects
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Crescelo-GoogleSheets-Sync/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      return { success: true, statusCode: res.status };
    } else {
      const errorText = await res.text().catch(() => '');
      return {
        success: false,
        statusCode: res.status,
        error: errorText || `Google Sheets webhook returned HTTP ${res.status}`,
      };
    }
  } catch (err: any) {
    console.warn(`[GoogleSheets] Failed to append row:`, err?.message);
    return {
      success: false,
      error: err?.message || 'Network error syncing row to Google Sheets.',
    };
  }
}

/**
 * Tests the Google Sheets Webhook with a sample verification row.
 */
export async function testGoogleSheetWebhook(
  webhookUrl: string,
  assistantName: string = 'AI Business Assistant'
): Promise<GoogleSheetsTestResult> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, latencyMs: 0, error: 'Google Sheets Webhook URL is required.' };
  }

  const ssrf = await validateSafeExternalUrl(webhookUrl.trim());
  if (!ssrf.safe) {
    return { success: false, latencyMs: 0, error: ssrf.error || 'Blocked by SSRF security policy.' };
  }

  const testPayload = {
    timestamp: new Date().toISOString(),
    event: 'system.test_ping',
    assistantName,
    customerName: 'Alex Morgan (Sample)',
    customerEmail: 'alex.morgan@sample-lead.io',
    customerPhone: '+1 (555) 019-2834',
    service: 'Enterprise Demo',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
    duration: '30m',
    notes: 'Real-time test ping dispatched from Crescelo omnichannel dashboard.',
    source: 'Dashboard Live Test',
    row: [
      new Date().toISOString(),
      'system.test_ping',
      assistantName,
      'Alex Morgan (Sample)',
      'alex.morgan@sample-lead.io',
      '+1 (555) 019-2834',
      'Enterprise Demo',
      new Date().toISOString().split('T')[0],
      '10:00 AM',
      '30m',
      'Real-time test ping dispatched from Crescelo omnichannel dashboard.',
      'Dashboard Live Test',
    ],
  };

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(webhookUrl.trim(), {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Crescelo-GoogleSheets-Sync/1.0',
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      return { success: true, statusCode: res.status, latencyMs };
    } else {
      const errorText = await res.text().catch(() => '');
      return {
        success: false,
        statusCode: res.status,
        latencyMs,
        error: errorText || `Google Sheets returned HTTP ${res.status}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: err?.message || 'Failed to reach Google Sheets webhook URL.',
    };
  }
}

/**
 * Formats lead and appointment events into structured spreadsheet row items.
 */
function formatSheetPayload(event: string, assistant: AssistantData, data: any) {
  const timestamp = new Date().toISOString();
  const assistantName = assistant.name || 'AI Assistant';

  let customerName = '';
  let customerEmail = '';
  let customerPhone = '';
  let service = '';
  let appointmentDate = '';
  let appointmentTime = '';
  let duration = '';
  let notes = '';
  let source = '';

  if (event === 'lead.created') {
    customerName = data.name || 'Anonymous Visitor';
    customerEmail = data.email || '';
    customerPhone = data.phone || '';
    service = 'Lead Capture';
    notes = data.notes || data.message || '';
    source = data.source || 'Website Chat Widget';
  } else if (event === 'appointment.created') {
    customerName = data.customerName || data.name || 'Client';
    customerEmail = data.customerEmail || data.email || '';
    customerPhone = data.customerPhone || data.phone || '';
    service = data.serviceTitle || data.service || 'Appointment';
    appointmentDate = data.date || '';
    appointmentTime = data.time || '';
    duration = data.durationMinutes ? `${data.durationMinutes}m` : '30m';
    notes = data.notes || '';
    source = data.source || 'Calendar Booking';
  } else {
    customerName = data.name || data.customerName || '';
    customerEmail = data.email || '';
    notes = typeof data === 'object' ? JSON.stringify(data) : String(data);
    source = event;
  }

  const row = [
    timestamp,
    event,
    assistantName,
    customerName,
    customerEmail,
    customerPhone,
    service,
    appointmentDate,
    appointmentTime,
    duration,
    notes,
    source,
  ];

  return {
    timestamp,
    event,
    assistantName,
    assistantId: assistant.id,
    customerName,
    customerEmail,
    customerPhone,
    service,
    appointmentDate,
    appointmentTime,
    duration,
    notes,
    source,
    row,
  };
}
