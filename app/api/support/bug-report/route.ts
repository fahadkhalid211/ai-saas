import { NextResponse } from 'next/server';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimit } from '@/lib/security/rate-limit-redis';
import { verifyRecaptchaToken } from '@/lib/security/recaptcha';
import { logged } from '@/lib/logging/route';
import { openTicket, TicketError } from '@/lib/support/tickets';
import { ticketLink } from '@/lib/support/emails';

export const dynamic = 'force-dynamic';

function cleanStr(val: unknown, maxLen = 2000): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLen);
}

function mapSeverityToPriority(severity: unknown): 'low' | 'normal' | 'high' | 'urgent' {
  const s = String(severity || '').toLowerCase().trim();
  if (s === 'critical' || s === 'urgent') return 'urgent';
  if (s === 'high') return 'high';
  if (s === 'low') return 'low';
  return 'normal';
}

/** The public bug reporting endpoint. Creates a structured bug ticket in the support queue. */
async function POSTHandler(req: Request) {
  try {
    const sharedLimited =
      (await enforceDistributedRateLimit(req, 'bug-report', { windowMs: 60 * 1000, max: 10 })) ||
      (await enforceDistributedRateLimit(req, 'bug-report-day', { windowMs: 24 * 60 * 60 * 1000, max: 50 }));
    if (sharedLimited) return sharedLimited;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Honeypot field: real visitors never see or fill this
    if (typeof body.website === 'string' && body.website.trim()) {
      return NextResponse.json({ success: true, ticketRef: 'CR-000000' });
    }

    const recaptcha = await verifyRecaptchaToken(body.recaptchaToken, getClientIp(req));
    if (!recaptcha.success) {
      return NextResponse.json({ error: recaptcha.error || 'Security verification failed. Please try again.' }, { status: 400 });
    }

    const name = cleanStr(body.name, 100);
    const email = cleanStr(body.email, 200).toLowerCase();
    const business = cleanStr(body.business, 120);
    const title = cleanStr(body.title, 150);
    const area = cleanStr(body.area, 60) || 'General';
    const severity = cleanStr(body.severity, 20) || 'Normal';
    const stepsToReproduce = cleanStr(body.stepsToReproduce, 2500);
    const expectedBehavior = cleanStr(body.expectedBehavior, 1500);
    const actualBehavior = cleanStr(body.actualBehavior, 1500);
    const errorMessage = cleanStr(body.errorMessage, 2000);
    const screenshotUrl = cleanStr(body.screenshotUrl, 500);

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Bug title / summary is required' }, { status: 400 });
    }
    if (stepsToReproduce.length < 10) {
      return NextResponse.json({ error: 'Please provide clear steps to reproduce the issue (at least 10 characters).' }, { status: 400 });
    }

    // Safe environment extraction
    const env = typeof body.environment === 'object' && body.environment !== null ? body.environment : {};
    const browser = cleanStr(env.browser, 100) || 'Not provided';
    const os = cleanStr(env.os, 100) || 'Not provided';
    const deviceType = cleanStr(env.deviceType, 50) || 'Not provided';
    const viewport = cleanStr(env.viewport, 50) || 'Not provided';
    const screenRes = cleanStr(env.screenResolution, 50) || 'Not provided';
    const pageUrl = cleanStr(env.pageUrl, 500) || 'Not provided';

    const priority = mapSeverityToPriority(severity);

    // Build structured ticket body
    const formattedMessage = [
      `### Bug Report: ${title}`,
      '',
      `**Affected Area:** ${area}`,
      `**Severity:** ${severity.toUpperCase()}`,
      `**Occurred on URL:** ${pageUrl}`,
      '',
      '---',
      '',
      '#### 1. Steps to Reproduce:',
      stepsToReproduce,
      '',
      '#### 2. Expected Behavior:',
      expectedBehavior || 'Not specified',
      '',
      '#### 3. Actual Behavior:',
      actualBehavior || 'Not specified',
      '',
      errorMessage ? `#### 4. Error Logs / Console Output:\n\`\`\`\n${errorMessage}\n\`\`\`\n` : '',
      screenshotUrl ? `#### 5. Screenshot / Recording Link:\n${screenshotUrl}\n` : '',
      '---',
      '',
      '#### Client Diagnostics:',
      `- **Browser:** ${browser}`,
      `- **Operating System:** ${os}`,
      `- **Device Type:** ${deviceType}`,
      `- **Viewport:** ${viewport}`,
      `- **Screen Resolution:** ${screenRes}`,
      `- **Reported Timestamp:** ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n');

    const subject = `[Bug: ${area}] ${title}`.slice(0, 120);

    const { ticket, token } = await openTicket({
      name,
      email,
      business: business || undefined,
      category: 'Bug Report',
      priority,
      subject,
      message: formattedMessage,
    });

    return NextResponse.json({
      success: true,
      ticketRef: ticket.ref,
      ticketUrl: ticketLink(ticket.ref, token),
    });
  } catch (err: any) {
    if (err instanceof TicketError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[BugReportAPI] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong while submitting the bug report. Please try again.' }, { status: 500 });
  }
}

export const POST = logged(POSTHandler, { route: '/api/support/bug-report' });
