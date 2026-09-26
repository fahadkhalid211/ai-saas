import { Database, type AssistantData, type CostCapSettings } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/billing/emails';
import { LEGAL } from '@/lib/legal/config';
import type { CapAlertKind } from './store';

/**
 * Tells the workspace owner that an assistant's own-key spend reached 80% or 100% of its monthly cap: a dashboard notification
 * (which also sends a mobile push) and an e-mail to the billing address, or the owner's address when none is set.
 */

const money = (n: number) => `$${n.toFixed(2)}`;
const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

function appUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (configured) return /^https?:\/\//i.test(configured) ? configured.replace(/\/$/, '') : `https://${configured}`;
  return 'https://www.crescelo.com';
}

export function buildCostCapMessage(assistantName: string, kind: CapAlertKind, spendUsd: number, cap: CostCapSettings) {
  const after =
    cap.onLimit === 'stop'
      ? 'it will stop replying until next month or until you raise the cap'
      : 'it will switch to the free Groq model until next month or until you raise the cap';
  if (kind === 'warning') {
    return {
      title: `${assistantName}: 80% of your AI cost cap used`,
      message: `Estimated spend on your own AI key this month is ${money(spendUsd)} of your ${money(cap.monthlyUsd)} cap. When it reaches the cap, ${after}. You can change the cap in AI Engine settings.`,
    };
  }
  const now =
    cap.onLimit === 'stop'
      ? 'It has stopped replying to visitors'
      : 'Replies now use the free Groq model instead of your key';
  return {
    title: `${assistantName}: AI cost cap reached`,
    message: `Estimated spend on your own AI key this month reached ${money(spendUsd)}, your ${money(cap.monthlyUsd)} cap. ${now}. Raise the cap in AI Engine settings to resume, or it resets on the 1st of next month.`,
  };
}

async function recipientFor(workspaceId: string): Promise<string | null> {
  try {
    const billing = await Database.getWorkspaceBilling(workspaceId);
    if (billing.billingEmail && EMAIL_RE.test(billing.billingEmail)) return billing.billingEmail;
  } catch {
    // fall through to the owner
  }
  try {
    const owner = (await Database.getTeamMembers(workspaceId)).find((m) => m.role === 'owner');
    if (owner?.email && EMAIL_RE.test(owner.email)) return owner.email;
  } catch {
    // no owner found
  }
  return null;
}

/** Never throws: an alert problem must not break a visitor's chat. */
export async function notifyCostCap(assistant: AssistantData, kind: CapAlertKind, spendUsd: number, cap: CostCapSettings): Promise<void> {
  const { title, message } = buildCostCapMessage(assistant.name || 'Your assistant', kind, spendUsd, cap);

  try {
    await Database.addNotification({
      assistantId: assistant.id,
      title,
      message,
      type: kind === 'warning' ? 'cost_cap_warning' : 'cost_cap_reached',
      metadata: { assistantId: assistant.id, spendUsd, capUsd: cap.monthlyUsd, onLimit: cap.onLimit, tab: 'engine' },
    });
  } catch (err) {
    console.warn('[CostCap] notification failed:', (err as Error)?.message);
  }

  try {
    const to = await recipientFor(assistant.workspaceId);
    if (!to) return;
    const link = `${appUrl()}/dashboard?tab=engine`;
    const text = [title, '', message, '', `Change the cap: ${link}`, '', LEGAL.operatorLine].join('\n');
    const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:24px auto;border:1px solid #e2e8f0;border-radius:14px;padding:28px;background:#ffffff;color:#0f172a">
    <div style="font-weight:700;font-size:18px;color:#08251a;margin-bottom:16px">Crescelo</div>
    <h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(title)}</h1>
    <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 10px">${escapeHtml(message)}</p>
    <p style="font-size:12px;color:#64748b;margin:0 0 10px">Spend is estimated from the tokens your provider reports, so your provider's invoice may differ slightly.</p>
    <p style="margin:18px 0 0"><a href="${escapeHtml(link)}" style="background:#abff44;color:#08251a;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:600;font-size:13px">Change the cap</a></p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:22px 0 12px" />
    <p style="font-size:11px;color:#94a3b8;margin:0">${escapeHtml(LEGAL.operatorLine)}</p>
  </div>`;
    await sendTransactionalEmail({ to, subject: title.replace(/[\r\n]+/g, ' ').slice(0, 200), text, html, fromName: 'Crescelo' });
  } catch (err) {
    console.warn('[CostCap] e-mail failed:', (err as Error)?.message);
  }
}
