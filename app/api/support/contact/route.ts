import { NextResponse } from 'next/server';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimit } from '@/lib/security/rate-limit-redis';
import { verifyRecaptchaToken } from '@/lib/security/recaptcha';
import { logged } from '@/lib/logging/route';
import { openTicket, TicketError } from '@/lib/support/tickets';
import { ticketLink } from '@/lib/support/emails';

export const dynamic = 'force-dynamic';

/** The public contact form. It opens a support ticket; the requester gets a confirmation e-mail with a private link to it. */
async function POSTHandler(req: Request) {
  try {
    const rateLimit = enforceRateLimit(req, 'contact-support', { windowMs: 60 * 1000, max: 5 });
    if (rateLimit.errorResponse) return rateLimit.errorResponse;
    const sharedLimited =
      (await enforceDistributedRateLimit(req, 'contact-support', { windowMs: 60 * 1000, max: 5 })) ||
      (await enforceDistributedRateLimit(req, 'contact-support-day', { windowMs: 24 * 60 * 60 * 1000, max: 30 }));
    if (sharedLimited) return sharedLimited;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Bots: a hidden field real visitors never fill, then reCAPTCHA.
    if (typeof body.website === 'string' && body.website.trim()) {
      return NextResponse.json({ success: true, ticketRef: 'CR-000000' });
    }
    const recaptcha = await verifyRecaptchaToken(body.recaptchaToken, getClientIp(req));
    if (!recaptcha.success) {
      return NextResponse.json({ error: recaptcha.error || 'Security check failed. Please try again.' }, { status: 400 });
    }

    const { ticket, token } = await openTicket({
      name: body.name,
      email: body.email,
      business: body.business,
      category: body.category,
      priority: body.priority,
      subject: body.subject,
      message: body.message,
    });

    return NextResponse.json({ success: true, ticketRef: ticket.ref, ticketUrl: ticketLink(ticket.ref, token) });
  } catch (err: any) {
    if (err instanceof TicketError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('[ContactAPI] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export const POST = logged(POSTHandler, { route: '/api/support/contact' });
