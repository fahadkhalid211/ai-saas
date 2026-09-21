import { describe, it, expect } from 'vitest';
import { sanitizePhoneSettings } from './settings';

const free = async () => false;
const taken = async () => true;

describe('sanitizePhoneSettings', () => {
  it('lets only the platform admin assign a number, and normalises it', async () => {
    const r = await sanitizePhoneSettings({ phoneNumber: '+1 (415) 555-0123' }, { isMasterAdmin: true, isNumberTaken: free });
    expect(r).toEqual({ ok: true, updates: { phoneNumber: '+14155550123' } });
  });

  it('ignores number changes from tenants', async () => {
    const r = await sanitizePhoneSettings({ phoneNumber: '+14155550123', phoneGreeting: 'Hi' }, { isMasterAdmin: false, isNumberTaken: free });
    expect(r.ok && r.updates).toEqual({ phoneGreeting: 'Hi' });
  });

  it('rejects a number another assistant holds, but not the same assistant re-saving its own', async () => {
    const dup = await sanitizePhoneSettings({ phoneNumber: '+14155550123' }, { isMasterAdmin: true, isNumberTaken: taken });
    expect(dup).toMatchObject({ ok: false, status: 409 });
    const same = await sanitizePhoneSettings({ phoneNumber: '+14155550123' }, { isMasterAdmin: true, existingNumber: '+14155550123', isNumberTaken: taken });
    expect(same.ok).toBe(true);
  });

  it('rejects invalid numbers, zones and enums', async () => {
    expect(await sanitizePhoneSettings({ phoneNumber: 'call me' }, { isMasterAdmin: true, isNumberTaken: free })).toMatchObject({ ok: false, status: 400 });
    expect(await sanitizePhoneSettings({ phoneTransferNumber: '12' }, { isMasterAdmin: false, isNumberTaken: free })).toMatchObject({ ok: false });
    expect(await sanitizePhoneSettings({ timezone: 'Mars/Base' }, { isMasterAdmin: false, isNumberTaken: free })).toMatchObject({ ok: false });
    expect(await sanitizePhoneSettings({ phoneAfterHours: 'sleep' }, { isMasterAdmin: false, isNumberTaken: free })).toMatchObject({ ok: false });
    expect(await sanitizePhoneSettings({ phoneMaxCallMinutes: 999 }, { isMasterAdmin: false, isNumberTaken: free })).toMatchObject({ ok: false });
  });

  it('accepts sensible values', async () => {
    const r = await sanitizePhoneSettings(
      { timezone: 'Europe/London', phoneAfterHours: 'voicemail', phoneMaxCallMinutes: 8.4, phoneTransferNumber: '+44 20 7946 0958', phoneLanguage: 'en-GB' },
      { isMasterAdmin: false, isNumberTaken: free }
    );
    expect(r).toEqual({ ok: true, updates: { timezone: 'Europe/London', phoneAfterHours: 'voicemail', phoneMaxCallMinutes: 8, phoneTransferNumber: '+442079460958', phoneLanguage: 'en-GB' } });
  });

  it('will not enable the channel without a number', async () => {
    expect(await sanitizePhoneSettings({ phoneEnabled: true }, { isMasterAdmin: false, isNumberTaken: free })).toMatchObject({ ok: false, status: 400 });
    const ok = await sanitizePhoneSettings({ phoneEnabled: true }, { isMasterAdmin: false, existingNumber: '+14155550123', isNumberTaken: free });
    expect(ok.ok).toBe(true);
  });
});
