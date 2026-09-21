import { isValidTimezone } from '@/lib/appointments/availability';
import { normalizeE164 } from '@/lib/voice/text';

/** Phone/voice fields an assistant update may carry. */
const PHONE_KEYS = [
  'phoneEnabled',
  'phoneNumber',
  'phoneGreeting',
  'phoneLanguage',
  'phoneVoice',
  'phoneTransferNumber',
  'phoneAfterHours',
  'phoneMaxCallMinutes',
  'timezone',
] as const;

export type SanitizeResult = { ok: true; updates: Record<string, any> } | { ok: false; status: number; error: string };

/**
 * Validates and normalises the phone-related fields of an assistant update.
 * - Only the platform admin can assign or change the dialled number (numbers are provisioned centrally
 *   and must never be claimable by another tenant); other callers' phoneNumber changes are ignored.
 * - A number can belong to one assistant only.
 * - The channel cannot be enabled without a number.
 */
export async function sanitizePhoneSettings(
  updates: Record<string, any>,
  opts: {
    isMasterAdmin: boolean;
    existingNumber?: string;
    isNumberTaken: (e164: string) => Promise<boolean>;
  }
): Promise<SanitizeResult> {
  const out: Record<string, any> = { ...updates };

  if ('phoneNumber' in out) {
    if (!opts.isMasterAdmin) {
      delete out.phoneNumber;
    } else if (out.phoneNumber === '' || out.phoneNumber === null) {
      out.phoneNumber = '';
    } else {
      const n = normalizeE164(String(out.phoneNumber));
      if (!n) return { ok: false, status: 400, error: 'Phone number must be in international format, e.g. +14155550123.' };
      if (n !== opts.existingNumber && (await opts.isNumberTaken(n))) {
        return { ok: false, status: 409, error: 'That phone number is already assigned to another assistant.' };
      }
      out.phoneNumber = n;
    }
  }

  if ('phoneTransferNumber' in out) {
    if (out.phoneTransferNumber === '' || out.phoneTransferNumber === null) {
      out.phoneTransferNumber = '';
    } else {
      const n = normalizeE164(String(out.phoneTransferNumber));
      if (!n) return { ok: false, status: 400, error: 'Transfer number must be in international format, e.g. +14155550123.' };
      out.phoneTransferNumber = n;
    }
  }

  if ('timezone' in out && out.timezone !== '') {
    if (typeof out.timezone !== 'string' || !isValidTimezone(out.timezone)) {
      return { ok: false, status: 400, error: 'Unknown timezone. Use an IANA name such as America/New_York.' };
    }
  }

  if ('phoneAfterHours' in out && !['ai', 'voicemail', 'forward'].includes(out.phoneAfterHours)) {
    return { ok: false, status: 400, error: 'phoneAfterHours must be ai, voicemail or forward.' };
  }
  if ('phoneMaxCallMinutes' in out) {
    const n = Math.round(Number(out.phoneMaxCallMinutes));
    if (!Number.isFinite(n) || n < 1 || n > 30) return { ok: false, status: 400, error: 'Maximum call length must be between 1 and 30 minutes.' };
    out.phoneMaxCallMinutes = n;
  }
  if ('phoneGreeting' in out) out.phoneGreeting = String(out.phoneGreeting ?? '').slice(0, 300);
  if ('phoneLanguage' in out && out.phoneLanguage !== '' && !/^[a-z]{2}(-[A-Z]{2})?$/.test(String(out.phoneLanguage))) {
    return { ok: false, status: 400, error: 'Language must look like en or en-GB.' };
  }
  if ('phoneVoice' in out && out.phoneVoice !== '' && !/^[\w.-]{1,60}$/.test(String(out.phoneVoice))) {
    return { ok: false, status: 400, error: 'Voice name contains unsupported characters.' };
  }

  if (out.phoneEnabled === true) {
    const number = 'phoneNumber' in out ? out.phoneNumber : opts.existingNumber;
    if (!number) return { ok: false, status: 400, error: 'Assign a phone number before enabling the phone channel.' };
  }
  if ('phoneEnabled' in out) out.phoneEnabled = out.phoneEnabled === true;

  return { ok: true, updates: out };
}

export function hasPhoneKeys(updates: Record<string, any>): boolean {
  return PHONE_KEYS.some((k) => k in updates);
}
