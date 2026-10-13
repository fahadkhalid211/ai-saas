import { sendTransactionalEmail } from '@/lib/email';
import { LEGAL } from '@/lib/legal/config';
import { escapeHtml } from '@/lib/billing/emails';
import { createEmailVerificationToken } from '@/lib/security/email-verification';

/** The address links in e-mails point to: the configured site, else the address the request came in on. */
export function appBaseUrl(requestUrl?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    try {
      return new URL(/^https?:\/\//i.test(configured) ? configured : `https://${configured}`).origin;
    } catch {
      // fall through to the request
    }
  }
  try {
    return requestUrl ? new URL(requestUrl).origin : 'https://www.crescelo.com';
  } catch {
    return 'https://www.crescelo.com';
  }
}

export function buildVerificationEmail(opts: { name?: string; link: string }): { subject: string; text: string; html: string } {
  const greeting = opts.name ? `Hi ${opts.name},` : 'Hi,';
  const subject = 'Confirm your email address for Crescelo';
  const lines = [
    'Please confirm that this is your email address. It takes one click.',
    'The link works for 48 hours. If you did not create a Crescelo account, you can ignore this email: nothing happens unless the link is opened.',
  ];
  const text = [greeting, '', ...lines, '', `Confirm my email: ${opts.link}`, '', LEGAL.operatorLine, `Questions: open a ticket at ${LEGAL.contactUrl}`].join('\n');
  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:24px auto;border:1px solid #e2e8f0;border-radius:14px;padding:28px;background:#ffffff;color:#0f172a">
    <div style="font-weight:700;font-size:18px;color:#08251a;margin-bottom:16px">Crescelo</div>
    <h1 style="font-size:20px;margin:0 0 12px">Confirm your email address</h1>
    <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 10px">${escapeHtml(greeting)}</p>
    ${lines.map((l) => `<p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 10px">${escapeHtml(l)}</p>`).join('')}
    <p style="margin:18px 0 0"><a href="${escapeHtml(opts.link)}" style="background:#abff44;color:#08251a;padding:11px 18px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">Confirm my email</a></p>
    <p style="font-size:12px;color:#64748b;margin:16px 0 0;word-break:break-all">Or paste this link into your browser:<br/>${escapeHtml(opts.link)}</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0 12px" />
    <p style="font-size:11px;color:#94a3b8;margin:0">${escapeHtml(LEGAL.operatorLine)}. Questions: <a href="${escapeHtml(LEGAL.contactUrl)}" style="color:#94a3b8">open a support ticket</a></p>
  </div>`;
  return { subject, text, html };
}

/** Sends the confirmation link. Never throws: a mail problem must not fail the sign-up. `simulated` means no sending service is set up. */
export async function sendVerificationEmail(
  member: { id: string; email: string; name?: string },
  requestUrl?: string,
): Promise<{ sent: boolean; simulated: boolean }> {
  try {
    const token = createEmailVerificationToken(member.id, member.email);
    const link = `${appBaseUrl(requestUrl)}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
    const { subject, text, html } = buildVerificationEmail({ name: member.name, link });
    const r = await sendTransactionalEmail({ to: member.email, subject, text, html, fromName: 'Crescelo' });
    return { sent: Boolean(r.success) && !r.simulated, simulated: Boolean(r.simulated) };
  } catch (err) {
    console.warn('[EmailVerification] not sent:', (err as Error)?.message);
    return { sent: false, simulated: false };
  }
}
