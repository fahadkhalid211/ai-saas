import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { validateEmail, sanitizeInput } from '@/lib/security/validation';
import { getClientIp, enforceRateLimit } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { createPasswordResetToken, readPasswordResetToken } from '@/lib/security/password-reset';
import { hashPassword } from '@/lib/security/password';
import { sendTransactionalEmail } from '@/lib/email';
import { appBaseUrl } from '@/lib/security/email-verification-mail';
import { LEGAL } from '@/lib/legal/config';

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { errorResponse } = enforceRateLimit(req, 'reset-password', { windowMs: 15 * 60 * 1000, max: 10 });
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    // Mode 1: Perform password reset with token
    if (body?.token && body?.newPassword) {
      const token = String(body.token).trim();
      const newPassword = String(body.newPassword);

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }

      const decoded = readPasswordResetToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'The password reset link is invalid or has expired. Please request a new one.' }, { status: 400 });
      }

      const member = await Database.getTeamMemberById(decoded.memberId);
      if (!member || member.email.toLowerCase().trim() !== decoded.email.toLowerCase().trim()) {
        return NextResponse.json({ error: 'Account not found. Please request a new reset link.' }, { status: 404 });
      }

      const newHash = hashPassword(newPassword);
      await Database.updateTeamMember(member.id, {
        password: newHash,
      });

      await Database.addAuditLog({
        actor: { id: member.id, name: member.name, email: member.email, username: member.email.split('@')[0], ip },
        action: 'auth.password_reset',
        targetType: 'account',
        targetId: member.id,
        details: { email: member.email },
      });

      return NextResponse.json({ success: true, message: 'Password has been successfully updated. You can now sign in.' });
    }

    // Mode 2: Request reset email
    const rawEmail = typeof body?.email === 'string' ? body.email.trim() : '';
    const cleanEmail = sanitizeInput(rawEmail);

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const keyLimited = await enforceDistributedRateLimitByKey(`reset-email:${cleanEmail.toLowerCase()}`, {
      windowMs: 15 * 60 * 1000,
      max: 3,
    });
    if (keyLimited) return keyLimited;

    const member = await Database.getTeamMemberByEmail(cleanEmail);
    if (member) {
      const token = createPasswordResetToken(member.id, member.email);
      const baseUrl = appBaseUrl(req.url);
      const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

      const subject = 'Reset your Crescelo password';
      const greeting = member.name ? `Hi ${member.name},` : 'Hi,';
      const text = [
        greeting,
        '',
        'We received a request to reset the password for your Crescelo account.',
        'This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.',
        '',
        `Reset your password: ${resetLink}`,
        '',
        LEGAL.operatorLine,
        `Need help? Visit ${LEGAL.contactUrl}`,
      ].join('\n');

      const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:24px auto;border:1px solid #e2e8f0;border-radius:14px;padding:28px;background:#ffffff;color:#0f172a">
        <div style="font-weight:700;font-size:18px;color:#08251a;margin-bottom:16px">Crescelo</div>
        <h1 style="font-size:20px;margin:0 0 12px">Reset your password</h1>
        <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 10px">${escapeHtml(greeting)}</p>
        <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 10px">We received a request to reset your password. Click the button below to choose a new password:</p>
        <p style="margin:20px 0"><a href="${escapeHtml(resetLink)}" style="background:#abff44;color:#08251a;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">Reset Password</a></p>
        <p style="font-size:12px;color:#64748b;margin:16px 0 0;line-height:1.5">This link is valid for <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email; your password will remain unchanged.</p>
        <p style="font-size:12px;color:#64748b;margin:12px 0 0;word-break:break-all">Or copy and paste this URL into your browser:<br/>${escapeHtml(resetLink)}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 14px" />
        <p style="font-size:11px;color:#94a3b8;margin:0">${escapeHtml(LEGAL.operatorLine)}. Need help? <a href="${escapeHtml(LEGAL.contactUrl)}" style="color:#94a3b8">Contact support</a></p>
      </div>`;

      try {
        await sendTransactionalEmail({ to: member.email, subject, text, html, fromName: 'Crescelo' });
      } catch (err) {
        console.warn('[ResetPassword] Failed to send email:', (err as Error)?.message);
      }
    }

    // Always respond with success to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been sent.',
    });
  } catch (err: any) {
    console.error('[ResetPasswordRoute] Error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
