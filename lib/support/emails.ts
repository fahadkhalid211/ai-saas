import { sendTransactionalEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/billing/emails';
import { SITE } from '@/components/marketing/content';
import { getMasterEmail } from '@/lib/security/master';
import type { Ticket } from './store';

/**
 * Every ticket e-mail. Text that came from a person (names, subjects, messages) is escaped before it goes into HTML and
 * line breaks are stripped from subjects. The requester's link carries a private token, so nobody needs an account or a
 * public mailbox: replies go through the ticket page.
 */

export type TicketEmailKind = 'created' | 'staff_reply' | 'resolved' | 'closed' | 'staff_new' | 'staff_customer_reply';

const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

export function ticketLink(ref: string, token?: string): string {
  return `${SITE.url}/support/ticket?ref=${encodeURIComponent(ref)}${token ? `&t=${encodeURIComponent(token)}` : ''}`;
}

const inboxLink = (ref: string) => `${SITE.url}/dashboard?tab=support&ticket=${encodeURIComponent(ref)}`;

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export function staffRecipient(): string {
  return (process.env.SUPPORT_NOTIFY_EMAIL || '').trim() || getMasterEmail();
}

interface Built {
  to: string;
  subject: string;
  text: string;
  html: string;
}

function wrap(heading: string, intro: string, quote: { label: string; body: string } | null, cta: { label: string; href: string } | null, footer: string): { text: string; html: string } {
  const text = [heading, '', intro, quote ? `\n${quote.label}:\n${quote.body}` : '', cta ? `\n${cta.label}: ${cta.href}` : '', '', footer].filter((l) => l !== null).join('\n');
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
    <h2 style="font-size:20px;margin:0 0 12px">${escapeHtml(heading)}</h2>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px">${escapeHtml(intro)}</p>
    ${quote ? `<div style="border-left:3px solid #cbd5e1;padding:8px 14px;margin:0 0 18px;background:#f8fafc"><div style="font-size:11px;color:#64748b;margin-bottom:4px">${escapeHtml(quote.label)}</div><div style="font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(clip(quote.body, 1500))}</div></div>` : ''}
    ${cta ? `<p style="margin:0 0 18px"><a href="${escapeHtml(cta.href)}" style="background:#0f172a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;display:inline-block">${escapeHtml(cta.label)}</a></p>` : ''}
    <p style="font-size:11px;color:#94a3b8;margin:0">${escapeHtml(footer)}</p>
  </div>`;
  return { text, html };
}

export function buildTicketEmail(kind: TicketEmailKind, t: Ticket, opts: { token?: string; message?: string; staffName?: string } = {}): Built {
  const subj = oneLine(t.subject);
  const tag = `[${t.ref}]`;
  const requesterFooter = 'Please do not reply to this e-mail: it is not monitored. Use the button above to answer, and keep the link private, it gives access to this ticket.';
  const link = ticketLink(t.ref, opts.token);

  switch (kind) {
    case 'created': {
      const { text, html } = wrap(
        `We received your request (${t.ref})`,
        `Hi ${oneLine(t.name)}, thank you for contacting Crescelo. Your request is in our queue and we will reply as soon as we can. You can follow it, and add anything we should know, from your ticket page.`,
        { label: 'Your message', body: opts.message || '' },
        { label: 'Open your ticket', href: link },
        requesterFooter
      );
      return { to: t.email, subject: oneLine(`${tag} We received your request: ${clip(subj, 90)}`), text, html };
    }
    case 'staff_reply': {
      const { text, html } = wrap(
        `New reply on ${t.ref}`,
        `${oneLine(opts.staffName || 'The Crescelo team')} replied to your request "${clip(subj, 90)}".`,
        { label: 'Reply', body: opts.message || '' },
        { label: 'View and answer', href: link },
        requesterFooter
      );
      return { to: t.email, subject: oneLine(`${tag} New reply: ${clip(subj, 90)}`), text, html };
    }
    case 'resolved': {
      const { text, html } = wrap(
        `${t.ref} is marked as resolved`,
        `We marked your request "${clip(subj, 90)}" as resolved. If it is not, reply on the ticket page within 7 days and we will reopen it. After that it closes automatically.`,
        null,
        { label: 'Open your ticket', href: link },
        requesterFooter
      );
      return { to: t.email, subject: oneLine(`${tag} Resolved: ${clip(subj, 90)}`), text, html };
    }
    case 'closed': {
      const { text, html } = wrap(
        `${t.ref} is closed`,
        `Your request "${clip(subj, 90)}" was closed because it was resolved and we heard nothing further. If you still need help, please open a new request from our contact page.`,
        null,
        { label: 'Contact us', href: `${SITE.url}/support/contact` },
        'This is an automatic message.'
      );
      return { to: t.email, subject: oneLine(`${tag} Closed: ${clip(subj, 90)}`), text, html };
    }
    case 'staff_new': {
      const { text, html } = wrap(
        `New ticket ${t.ref}: ${clip(subj, 80)}`,
        `${oneLine(t.name)} <${t.email}>${t.business ? ` (${oneLine(t.business)})` : ''} · ${t.category} · priority ${t.priority}.`,
        { label: 'Message', body: opts.message || '' },
        { label: 'Open in the inbox', href: inboxLink(t.ref) },
        'Sent to the support address configured for Crescelo.'
      );
      return { to: staffRecipient(), subject: oneLine(`[New] ${tag} ${t.priority.toUpperCase()} · ${clip(subj, 90)}`), text, html };
    }
    case 'staff_customer_reply': {
      const { text, html } = wrap(
        `Customer replied on ${t.ref}`,
        `${oneLine(t.name)} answered "${clip(subj, 90)}".`,
        { label: 'Reply', body: opts.message || '' },
        { label: 'Open in the inbox', href: inboxLink(t.ref) },
        'Sent to the support address configured for Crescelo.'
      );
      return { to: staffRecipient(), subject: oneLine(`[Reply] ${tag} ${clip(subj, 90)}`), text, html };
    }
  }
}

/** Sends one ticket e-mail. Never throws: a mail problem must not fail the request that triggered it. */
export async function sendTicketEmail(kind: TicketEmailKind, t: Ticket, opts: { token?: string; message?: string; staffName?: string } = {}): Promise<boolean> {
  try {
    const mail = buildTicketEmail(kind, t, opts);
    if (!EMAIL_RE.test(mail.to)) return false;
    const r = await sendTransactionalEmail({ ...mail, fromName: kind.startsWith('staff_') && kind !== 'staff_reply' ? 'Crescelo Support Desk' : 'Crescelo Support' });
    return Boolean(r.success);
  } catch (err) {
    console.warn('[Support] e-mail not sent:', (err as Error)?.message);
    return false;
  }
}
