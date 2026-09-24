import { Database, DevicePushTokenRecord } from '@/lib/db';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  assistantId?: string;
  workspaceId?: string;
}

/**
 * Dispatches real-time push notifications to registered Android & iOS companion devices
 * via Expo's Push Notification Gateway.
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<{ sent: number }> {
  try {
    const { title, body, data, assistantId, workspaceId } = payload;
    const wsId = workspaceId || '*';
    const tokens = await Database.getPushTokens(wsId, assistantId);

    if (!tokens || tokens.length === 0) {
      return { sent: 0 };
    }

    // Filter valid Expo Push Tokens
    const validTokens = tokens.filter(
      (t) =>
        t.token &&
        (t.token.startsWith('ExponentPushToken[') ||
          t.token.startsWith('ExpoPushToken['))
    );

    if (validTokens.length === 0) {
      return { sent: 0 };
    }

    const messages = validTokens.map((t) => ({
      to: t.token,
      sound: 'default',
      title,
      body,
      data: {
        ...(data || {}),
        assistantId: t.assistantId || assistantId,
        timestamp: new Date().toISOString(),
      },
      priority: 'high',
      channelId: 'crescelo-appointments',
    }));

    // Post to Expo Push Notification API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn('[PushNotification] Expo API responded with status', response.status, errText);
      return { sent: 0 };
    }

    return { sent: messages.length };
  } catch (err) {
    console.warn('[PushNotification] Dispatch failed:', err);
    return { sent: 0 };
  }
}
