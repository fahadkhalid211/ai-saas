import { AssistantData } from '@/lib/db';
import { validateSafeExternalUrl } from '@/lib/security/ssrf';

export interface SlackDispatchResult {
  success: boolean;
  statusCode?: number;
  error?: string;
}

export interface SlackTestResult {
  success: boolean;
  statusCode?: number;
  latencyMs: number;
  error?: string;
}

/**
 * Dispatches a rich Block Kit notification to a Slack Incoming Webhook channel.
 */
export async function dispatchSlackNotification(
  assistant: AssistantData,
  event: string,
  data: any
): Promise<SlackDispatchResult> {
  if (!assistant.slackEnabled || !assistant.slackWebhookUrl || !assistant.slackWebhookUrl.trim()) {
    return { success: false, error: 'Slack integration is disabled or webhook URL is missing.' };
  }

  // Check event subscriptions
  const subscribedEvents = assistant.slackEvents && assistant.slackEvents.length > 0
    ? assistant.slackEvents
    : ['lead.created', 'appointment.created'];

  if (!subscribedEvents.includes(event)) {
    return { success: false, error: `Event "${event}" is not subscribed in Slack settings.` };
  }

  // SSRF Verification
  const ssrf = await validateSafeExternalUrl(assistant.slackWebhookUrl.trim());
  if (!ssrf.safe) {
    console.warn(`[Slack] Blocked unsafe target URL (${assistant.slackWebhookUrl}):`, ssrf.error);
    return { success: false, error: ssrf.error || 'Slack webhook URL was blocked by security policy.' };
  }

  const payload = formatSlackPayload(event, assistant, data);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(assistant.slackWebhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Crescelo-Slack-Notifier/1.0',
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
        error: errorText || `Slack webhook returned HTTP ${res.status}`,
      };
    }
  } catch (err: any) {
    console.warn(`[Slack] Failed to dispatch to channel:`, err?.message);
    return {
      success: false,
      error: err?.message || 'Network error dispatching Slack notification.',
    };
  }
}

/**
 * Tests a Slack incoming webhook with a test Block Kit notification card.
 */
export async function testSlackWebhook(
  webhookUrl: string,
  assistantName: string = 'AI Business Assistant'
): Promise<SlackTestResult> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, latencyMs: 0, error: 'Slack Webhook URL is required.' };
  }

  const ssrf = await validateSafeExternalUrl(webhookUrl.trim());
  if (!ssrf.safe) {
    return { success: false, latencyMs: 0, error: ssrf.error || 'Blocked by SSRF security policy.' };
  }

  const testPayload = {
    text: `🔔 Test notification from Crescelo for ${assistantName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚀 Crescelo Slack Integration Connected!',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Success!* Your incoming webhook is verified and actively monitoring for *${assistantName}*. Real-time customer leads and appointment bookings will appear here instantly.`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Status:*\n✅ Active & Ready`,
          },
          {
            type: 'mrkdwn',
            text: `*Latency Test:*\n⚡ Real-time ping`,
          },
          {
            type: 'mrkdwn',
            text: `*Assistant:*\n${assistantName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Timestamp:*\n<!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toLocaleTimeString()}>`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '⚡ _Dispatched by Crescelo Omnichannel v2.0 Notification Engine_',
          },
        ],
      },
    ],
  };

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Crescelo-Slack-Notifier/1.0',
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
        error: errorText || `Slack returned status ${res.status}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: err?.message || 'Failed to reach Slack webhook endpoint.',
    };
  }
}

/**
 * Formats events into rich Slack Block Kit layout blocks.
 */
function formatSlackPayload(event: string, assistant: AssistantData, data: any) {
  const assistantTitle = assistant.name || 'AI Assistant';

  if (event === 'lead.created') {
    const name = data.name || 'Anonymous Visitor';
    const email = data.email || 'None';
    const phone = data.phone || 'None';
    const source = data.source || 'Website Chat Widget';
    const notes = data.notes || data.message || '';

    const fields = [
      { type: 'mrkdwn', text: `*Lead Name:*\n${name}` },
      { type: 'mrkdwn', text: `*Email Address:*\n${email}` },
      { type: 'mrkdwn', text: `*Phone Number:*\n${phone}` },
      { type: 'mrkdwn', text: `*Source:*\n${source}` },
    ];

    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 New Lead Captured!',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `A new prospective customer just engaged with *${assistantTitle}* and submitted their contact details.`,
        },
      },
      {
        type: 'section',
        fields,
      },
    ];

    if (notes) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Customer Notes / Inquiry:*\n> ${notes.replace(/\n/g, '\n> ')}`,
        },
      });
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `🤖 *${assistantTitle}* • ID: \`${data.id || assistant.id}\` • <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toLocaleTimeString()}>`,
        },
      ],
    });

    return {
      text: `🎯 New Lead Captured: ${name} (${email}) via ${assistantTitle}`,
      blocks,
    };
  }

  if (event === 'appointment.created') {
    const customer = data.customerName || data.name || 'Valued Client';
    const email = data.customerEmail || data.email || 'N/A';
    const phone = data.customerPhone || data.phone || 'N/A';
    const service = data.serviceTitle || data.service || 'General Consultation';
    const date = data.date || 'TBD';
    const time = data.time || 'TBD';
    const duration = data.durationMinutes ? `${data.durationMinutes} minutes` : '30 minutes';
    const meetingUrl = data.meetingUrl || data.zoomUrl || data.meetUrl || '';

    const fields = [
      { type: 'mrkdwn', text: `*Customer:*\n${customer}` },
      { type: 'mrkdwn', text: `*Service:*\n${service}` },
      { type: 'mrkdwn', text: `*Email / Phone:*\n${email} • ${phone}` },
      { type: 'mrkdwn', text: `*Scheduled Time:*\n📅 ${date} at 🕒 ${time} (${duration})` },
    ];

    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📅 New Appointment Booked!',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `A new client appointment has been confirmed on the calendar through *${assistantTitle}*.`,
        },
      },
      {
        type: 'section',
        fields,
      },
    ];

    if (meetingUrl) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Meeting Link:* <${meetingUrl}|Join Video Call>`,
        },
      });
    }

    if (data.notes) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Booking Notes:*\n> ${data.notes.replace(/\n/g, '\n> ')}`,
        },
      });
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `⚡ *Crescelo Calendar Sync* • ${assistantTitle} • <!date^${Math.floor(Date.now() / 1000)}^{date_num} {time_secs}|${new Date().toLocaleTimeString()}>`,
        },
      ],
    });

    return {
      text: `📅 New Appointment Booked: ${customer} for ${service} on ${date} at ${time}`,
      blocks,
    };
  }

  // Fallback / Generic Event
  return {
    text: `⚡ Event [${event}] triggered on ${assistantTitle}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `⚡ Event: ${event}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Event *${event}* received for assistant *${assistantTitle}*.\n\`\`\`${JSON.stringify(data, null, 2).slice(0, 1500)}\`\`\``,
        },
      },
    ],
  };
}
