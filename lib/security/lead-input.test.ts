import { describe, it, expect } from 'vitest';
import { sanitizeLeadInput } from './lead-input';

const ok = { assistantId: 'ast_1', name: 'Alex', email: 'alex@example.com', phone: '+1 (555) 010-2030' };

describe('lead input', () => {
  it('accepts a normal lead', () => {
    const r = sanitizeLeadInput(ok);
    expect(r.ok).toBe(true);
  });
  it('rejects bad e-mail, phone and missing fields', () => {
    expect(sanitizeLeadInput({ ...ok, email: 'nope' }).ok).toBe(false);
    expect(sanitizeLeadInput({ ...ok, email: 'a@b.co\r\nBcc: x@y.z' }).ok).toBe(false);
    expect(sanitizeLeadInput({ ...ok, phone: 'call me maybe' }).ok).toBe(false);
    expect(sanitizeLeadInput({ ...ok, name: '   ' }).ok).toBe(false);
    expect(sanitizeLeadInput({ ...ok, assistantId: '../etc' }).ok).toBe(false);
    expect(sanitizeLeadInput(null).ok).toBe(false);
    expect(sanitizeLeadInput([]).ok).toBe(false);
  });
  it('caps lengths and strips control characters', () => {
    const r = sanitizeLeadInput({ ...ok, name: 'A\u0000'.repeat(500), notes: 'x'.repeat(10000) });
    expect(r.ok && r.lead.name.length).toBeLessThanOrEqual(120);
    expect(r.ok && r.lead.name).not.toContain('\u0000');
    expect(r.ok && r.lead.notes.length).toBe(2000);
  });
  it('keeps custom fields small and plain', () => {
    const many: Record<string, unknown> = { __proto__: 'x', good: 'v', nested: { a: 1 }, list: [1], n: 5, t: true };
    for (let i = 0; i < 40; i++) many['k' + i] = 'v';
    const r = sanitizeLeadInput({ ...ok, customData: many });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(Object.keys(r.lead.customData).length).toBeLessThanOrEqual(20);
      expect(r.lead.customData.nested).toBeUndefined();
      expect(r.lead.customData.list).toBeUndefined();
      expect(r.lead.customData.good).toBe('v');
    }
  });
});
