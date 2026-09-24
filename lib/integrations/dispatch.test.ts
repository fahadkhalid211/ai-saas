import { describe, it, expect, vi, beforeEach } from 'vitest';

const sheets = vi.fn();
const hook = vi.fn();
const slack = vi.fn();
vi.mock('@/lib/integrations/google-sheets', () => ({ dispatchGoogleSheetRow: (...a: unknown[]) => sheets(...a) }));
vi.mock('@/lib/webhook', () => ({ dispatchWebhook: (...a: unknown[]) => hook(...a) }));
vi.mock('@/lib/integrations/slack', () => ({ dispatchSlackNotification: (...a: unknown[]) => slack(...a) }));

import { dispatchIntegrations } from './dispatch';

const base = { id: 'a1', name: 'Bot' } as any;

describe('dispatchIntegrations', () => {
  beforeEach(() => {
    sheets.mockReset().mockResolvedValue({ success: true });
    hook.mockReset().mockResolvedValue({ success: true });
    slack.mockReset().mockResolvedValue({ success: true });
  });

  it('sends a lead to every connected tool and waits for them', async () => {
    await dispatchIntegrations({ ...base, webhookUrl: 'https://h', slackEnabled: true, slackWebhookUrl: 'https://s', googleSheetsEnabled: true, googleSheetsWebhookUrl: 'https://g' }, 'lead.created', { name: 'x' });
    expect(sheets).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledTimes(1);
    expect(slack).toHaveBeenCalledTimes(1);
  });

  it('skips tools that are not connected', async () => {
    await dispatchIntegrations({ ...base, googleSheetsEnabled: true, googleSheetsWebhookUrl: 'https://g' }, 'lead.created', {});
    expect(sheets).toHaveBeenCalledTimes(1);
    expect(hook).not.toHaveBeenCalled();
    expect(slack).not.toHaveBeenCalled();
  });

  it('a failing tool does not stop the others or throw', async () => {
    sheets.mockRejectedValue(new Error('boom'));
    await expect(
      dispatchIntegrations({ ...base, webhookUrl: 'https://h', googleSheetsEnabled: true, googleSheetsWebhookUrl: 'https://g' }, 'lead.created', {})
    ).resolves.toBeUndefined();
    expect(hook).toHaveBeenCalledTimes(1);
  });
});
