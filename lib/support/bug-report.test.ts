import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CATEGORIES, openTicket, resolveAccess } from './tickets';
import { POST } from '@/app/api/support/bug-report/route';

const uniq = () => Math.random().toString(36).slice(2, 10);

describe('Bug Report System', () => {
  it('includes Bug Report in the canonical ticket CATEGORIES', () => {
    expect(CATEGORIES).toContain('Bug Report');
  });

  it('creates a bug report ticket with Bug Report category', async () => {
    const email = `tester-${uniq()}@example.com`;
    const { ticket, token } = await openTicket({
      name: 'Bug Hunter',
      email,
      category: 'Bug Report',
      priority: 'high',
      subject: '[Bug: AI Assistant] Streaming fails on Safari',
      message: '### Steps to Reproduce:\n1. Click send\n2. Wait for response',
    });

    expect(ticket.category).toBe('Bug Report');
    expect(ticket.priority).toBe('high');
    expect(ticket.subject).toBe('[Bug: AI Assistant] Streaming fails on Safari');
    expect(ticket.status).toBe('open');

    const access = await resolveAccess(ticket.ref, token, null);
    expect(access?.access).toBe('requester');
    expect(access?.ticket.category).toBe('Bug Report');
  });

  it('rejects bug report requests with missing fields in POST /api/support/bug-report', async () => {
    const req = new Request('http://localhost:3000/api/support/bug-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'invalid-email',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('silently absorbs spam bot submissions with honeypot website field', async () => {
    const req = new Request('http://localhost:3000/api/support/bug-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spam Bot',
        email: 'bot@spam.com',
        title: 'Cheap crypto',
        stepsToReproduce: 'Click my spam link',
        website: 'https://spammy-site.xyz',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.ticketRef).toBe('CR-000000');
  });

  it('successfully creates a formatted bug report ticket via API', async () => {
    const email = `dev-${uniq()}@testdomain.com`;
    const req = new Request('http://localhost:3000/api/support/bug-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Engineer',
        email,
        business: 'Alex Co',
        area: 'Calendar & Booking',
        severity: 'high',
        title: 'Calendar timezone discrepancy for AEDT',
        stepsToReproduce: '1. Select Sydney timezone\n2. Book slot at 10am\n3. Slot shows at 9am',
        expectedBehavior: 'Slot should remain at 10am AEDT',
        actualBehavior: 'Slot is shifted by 1 hour',
        errorMessage: 'TimezoneOffsetError: invalid offset for UTC+11',
        screenshotUrl: 'https://loom.com/share/test12345',
        environment: {
          browser: 'Chrome 124',
          os: 'macOS Sonoma',
          deviceType: 'Desktop',
          viewport: '1440x900',
          screenResolution: '1920x1080',
          pageUrl: 'https://crescelo.com/dashboard/calendar',
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.ticketRef).toMatch(/^CR-\d{6}$/);
    expect(data.ticketUrl).toContain(data.ticketRef);
  });
});
