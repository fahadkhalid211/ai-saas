/**
 * Everything a visitor can send in a lead form is bounded and cleaned before it is stored, e-mailed, posted to Slack or sent
 * to a webhook: strings only, control characters removed, sensible lengths, a valid e-mail and phone number, and a small
 * custom-field object.
 */

const strip = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : '';

const EMAIL_RE = /^[^\s@<>"'`,;:\\]+@[^\s@<>"'`,;:\\]+\.[^\s@<>"'`,;:\\]{2,}$/;
const PHONE_RE = /^[+0-9][0-9 ()\-.]{4,38}$/;

export interface CleanLead {
  assistantId: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  customData: Record<string, string | number | boolean>;
}

export function sanitizeLeadInput(body: unknown): { ok: true; lead: CleanLead } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'Invalid request body' };
  const b = body as Record<string, unknown>;

  const assistantId = strip(b.assistantId, 100);
  if (!assistantId || !/^[\w.\-]+$/.test(assistantId)) return { ok: false, error: 'assistantId is required' };

  const name = strip(b.name, 120);
  if (!name) return { ok: false, error: 'Name is required' };

  const email = strip(b.email, 254);
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'A valid email address is required' };

  const phone = strip(b.phone, 40);
  if (!phone) return { ok: false, error: 'Phone number is required' };
  if (!PHONE_RE.test(phone)) return { ok: false, error: 'Please enter a valid phone number' };

  const notes = strip(b.notes, 2000);

  const customData: CleanLead['customData'] = {};
  if (b.customData && typeof b.customData === 'object' && !Array.isArray(b.customData)) {
    let count = 0;
    for (const [k, v] of Object.entries(b.customData as Record<string, unknown>)) {
      if (count >= 20) break;
      const key = strip(k, 60);
      if (!key || !/^[\w .\-]+$/.test(key) || key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      if (typeof v === 'string') customData[key] = strip(v, 500);
      else if (typeof v === 'number' && Number.isFinite(v)) customData[key] = v;
      else if (typeof v === 'boolean') customData[key] = v;
      else continue;
      count++;
    }
  }
  if (JSON.stringify(customData).length > 8000) return { ok: false, error: 'The extra fields are too long' };

  return { ok: true, lead: { assistantId, name, email, phone, notes, customData } };
}
