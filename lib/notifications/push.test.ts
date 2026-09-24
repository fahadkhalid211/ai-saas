import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Database } from '@/lib/db';
import { sendPushNotification } from './push';

describe('Mobile Push Notification Subsystem', () => {
  const testWorkspace = 'ws_push_test';
  const testAssistant = 'ast_push_test';
  const testToken = 'ExponentPushToken[AbCdEf1234567890]';

  beforeEach(async () => {
    await Database.removePushToken(testToken);
  });

  it('should register and retrieve a device push token', async () => {
    const record = await Database.registerPushToken(
      testToken,
      testWorkspace,
      'member_123',
      testAssistant,
      'android',
      'Pixel 8 Android 14'
    );

    expect(record).toBeDefined();
    expect(record.token).toBe(testToken);
    expect(record.workspaceId).toBe(testWorkspace);
    expect(record.platform).toBe('android');

    const tokens = await Database.getPushTokens(testWorkspace, testAssistant);
    expect(tokens.length).toBeGreaterThanOrEqual(1);
    expect(tokens.some((t) => t.token === testToken)).toBe(true);
  });

  it('should dispatch push notification via Expo gateway when tokens exist', async () => {
    await Database.registerPushToken(
      testToken,
      testWorkspace,
      'member_123',
      testAssistant,
      'android'
    );

    // Mock fetch for Expo Push API
    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ status: 'ok', id: 'xxx' }] }),
      text: async () => '{"data":[{"status":"ok"}]}',
    });
    global.fetch = fetchMock;

    try {
      const result = await sendPushNotification({
        title: 'New Appointment Booked',
        body: 'Jane Customer booked a consultation',
        workspaceId: testWorkspace,
        assistantId: testAssistant,
        data: { aptId: 'apt_100' },
      });

      expect(result.sent).toBe(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toContain('exp.host');
      const body = JSON.parse(options.body);
      expect(body[0].to).toBe(testToken);
      expect(body[0].title).toBe('New Appointment Booked');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should remove a registered push token on sign-out', async () => {
    await Database.registerPushToken(testToken, testWorkspace);
    const removed = await Database.removePushToken(testToken);
    expect(removed).toBe(true);

    const tokens = await Database.getPushTokens(testWorkspace);
    expect(tokens.some((t) => t.token === testToken)).toBe(false);
  });
});
