import { sendTransactionalEmail } from '@/lib/email';
import { LEGAL } from '@/lib/legal/config';

/**
 * Billing e-mails sent to the customer: a receipt for every payment, and notices for the moments a card is involved (trial
 * started, trial ending, payment failed, subscription cancelled). Every value that came from outside (names, e-mail addresses,
 * plan names, URLs) is escaped or validated before it goes into HTML, and line breaks are stripped from the subject.
 */

export type BillingEmailKind = 'trial_started' | 'receipt' | 'trial_ending' | 'payment_failed' | 'cancelled';

export interface BillingEmailInput {
  kind: BillingEmailKind;
  to?: string | null;
  workspaceName?: string;
  planName?: string;
  /** Dollars. */
  amount?: number;
  interval?: 'monthly' | 'annual';
  /** ISO date: first charge (trial started / ending), or when access ends (cancelled). */
  date?: string | null;
  /** The provider's hosted invoice or receipt page (Lemon Squeezy). Only https links are used. */
  invoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
  invoiceNumber?: string | null;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only absolute https links to Lemon Squeezy-hosted pages are ever put into an e-mail. */
export function safeInvoiceLink(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && /(^|\.)lemonsqueezy\.com$/i.test(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

const money = (n?: number) => (typeof n === 'number' && Number.isFinite(n) ? `$${n.toFixed(2)}` : '');
const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');
const every = (i?: 'monthly' | 'annual') => (i === 'annual' ? 'year' : 'month');

export function buildBillingEmail(input: BillingEmailInput): { subject: string; text: string; html: string } {
  const plan = input.planName || 'Crescelo';
  const link = safeInvoiceLink(input.invoiceUrl);
  const pdf = safeInvoiceLink(input.invoicePdfUrl);
  let subject = '';
  let heading = '';
  const lines: string[] = [];

  switch (input.kind) {
    case 'trial_started':
      subject = 'Your Crescelo free trial has started';
      heading = 'Your 14-day free trial has started';
      lines.push(`Welcome. ${plan} is free for 14 days, and your card has not been charged.`);
      lines.push(`On ${day(input.date)} your card will be charged ${money(input.amount)} automatically, and then every ${every(input.interval)} until you cancel.`);
      lines.push('You can cancel at any time from Billing in your dashboard ("Cancel or manage"). If you cancel before the trial ends, you will not be charged.');
      break;
    case 'receipt':
      subject = `Your Crescelo receipt${input.invoiceNumber ? ` ${input.invoiceNumber}` : ''}`;
      heading = 'Thank you for your payment';
      lines.push(`We received ${money(input.amount)} for ${plan}.`);
      if (input.invoiceNumber) lines.push(`Invoice number: ${input.invoiceNumber}`);
      lines.push('Keep this e-mail as your record. You can download the invoice using the links below.');
      break;
    case 'trial_ending':
      subject = 'Your Crescelo free trial ends soon';
      heading = 'Your free trial ends soon';
      lines.push(`Your card will be charged ${money(input.amount)} for ${plan} on ${day(input.date)}.`);
      lines.push('To avoid the charge, cancel before then from Billing in your dashboard ("Cancel or manage").');
      break;
    case 'payment_failed':
      subject = 'Your Crescelo payment did not go through';
      heading = 'We could not take your payment';
      lines.push(`The payment for ${plan}${input.amount ? ` (${money(input.amount)})` : ''} failed. We will try again automatically.`);
      lines.push('Please update your card from Billing in your dashboard ("Cancel or manage") so your assistants keep answering visitors.');
      break;
    case 'cancelled':
      subject = 'Your Crescelo subscription has ended';
      heading = 'Your subscription has ended';
      lines.push('Your subscription is cancelled and you will not be charged again.');
      lines.push('Your assistants are paused. We keep your data for 30 days, and you can subscribe again from your dashboard at any time.');
      break;
  }

  const workspace = input.workspaceName ? `Workspace: ${input.workspaceName}` : '';
  const text = [heading, '', ...lines, workspace, link ? `Invoice: ${link}` : '', pdf ? `PDF: ${pdf}` : '', '', `${LEGAL.operatorLine}`, `Questions: open a ticket at ${LEGAL.contactUrl}`]
    .filter((l, i, a) => l !== '' || (a[i - 1] !== '' && i > 0))
    .join('\n');

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:24px auto;border:1px solid #e2e8f0;border-radius:14px;padding:28px;background:#ffffff;color:#0f172a">
    <div style="font-weight:700;font-size:18px;color:#08251a;margin-bottom:16px">Crescelo</div>
    <h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(heading)}</h1>
    ${lines.map((l) => `<p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 10px">${escapeHtml(l)}</p>`).join('')}
    ${workspace ? `<p style="font-size:12px;color:#64748b;margin:14px 0 0">${escapeHtml(workspace)}</p>` : ''}
    ${link ? `<p style="margin:18px 0 0"><a href="${escapeHtml(link)}" style="background:#abff44;color:#08251a;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:600;font-size:13px">View invoice</a>${pdf ? ` <a href="${escapeHtml(pdf)}" style="margin-left:10px;color:#0f172a;font-size:13px">Download PDF</a>` : ''}</p>` : ''}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0 12px" />
    <p style="font-size:11px;color:#94a3b8;margin:0">${escapeHtml(LEGAL.operatorLine)}. Questions: <a href="${escapeHtml(LEGAL.contactUrl)}" style="color:#94a3b8">open a support ticket</a></p>
  </div>`;

  return { subject: subject.replace(/[\r\n]+/g, ' ').slice(0, 200), text, html };
}

/** Sends a billing e-mail. Never throws: a mail problem must not fail the webhook that triggered it. */
export async function sendBillingEmail(input: BillingEmailInput): Promise<boolean> {
  try {
    const to = input.to;
    if (!to || !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(to)) return false;
    const { subject, text, html } = buildBillingEmail(input);
    const r = await sendTransactionalEmail({ to, subject, text, html, fromName: 'Crescelo Billing' });
    return Boolean(r.success);
  } catch (err) {
    console.warn('[BillingEmail] not sent:', (err as Error)?.message);
    return false;
  }
}
