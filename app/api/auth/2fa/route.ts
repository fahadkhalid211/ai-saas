import { NextRequest, NextResponse } from 'next/server';
import { getMasterEmail } from '@/lib/security/master';
import { Database } from '@/lib/db';
import { verifyAdminRequest, withAdminAuth, getAuthContext } from '@/lib/security/auth';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import {
  generateBase32Secret,
  generateOtpAuthUrl,
  generateRecoveryCodes,
  verifyTotpToken,
} from '@/lib/security/totp';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const members = await Database.getTeamMembers(ctx.workspaceId !== '*' ? ctx.workspaceId : undefined);
    const targetMember = (ctx.memberId && ctx.memberId !== 'admin' && ctx.memberId !== 'master-admin')
      ? members.find((m) => m.id === ctx.memberId)
      : (members.find((m) => m.role === 'owner') || members[0]);

    if (action === 'setup') {
      const secret = generateBase32Secret(20);
      const recoveryCodes = generateRecoveryCodes(8);
      const otpUrl = generateOtpAuthUrl({
        issuer: 'Crescelo Enterprise',
        accountName: targetMember?.email || getMasterEmail(),
        secret,
      });

      return NextResponse.json({
        success: true,
        secret,
        otpUrl,
        recoveryCodes,
      });
    }

    return NextResponse.json({
      enabled: Boolean(targetMember?.twoFactorEnabled),
      lastUpdated: targetMember?.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch 2FA status' }, { status: 500 });
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, secret, code, email } = body;

    if (action === 'verify_login') {
      const targetMember = email
        ? await Database.getTeamMemberByEmail(email.trim().toLowerCase())
        : (await Database.getTeamMembers()).find((m) => m.role === 'owner');

      // Throttle brute-force guessing of the 6-digit TOTP code / recovery codes
      const rateLimitKey = `2fa-verify:${(email || targetMember?.email || '').toLowerCase()}`;
      const rl = enforceRateLimit(req, rateLimitKey, { windowMs: 5 * 60 * 1000, max: 5 });
      if (rl.errorResponse) {
        return rl.errorResponse;
      }

      // Login verification challenge
      if (!targetMember || !targetMember.twoFactorEnabled || !targetMember.twoFactorSecret) {
        return NextResponse.json({ success: true, message: '2FA not enabled for account' });
      }

      const isValid = verifyTotpToken(code, targetMember.twoFactorSecret);
      const isRecovery = targetMember.recoveryCodes?.includes(code.trim().toUpperCase());

      if (!isValid && !isRecovery) {
        return NextResponse.json({ error: 'Invalid authentication code or recovery key' }, { status: 400 });
      }

      // If recovery code was used, remove it from list
      if (isRecovery && targetMember.recoveryCodes) {
        const remaining = targetMember.recoveryCodes.filter((c) => c !== code.trim().toUpperCase());
        await Database.updateTeamMember(targetMember.id, { recoveryCodes: remaining });
      }

      await Database.addAuditLog({
        actor: { id: targetMember.id, name: targetMember.name, email: targetMember.email, ip: req.headers.get('x-forwarded-for') || '127.0.0.1' },
        action: 'auth.2fa_success',
        targetType: 'auth',
        details: { method: isRecovery ? 'recovery_code' : 'totp' },
      });

      return NextResponse.json({ success: true, message: 'Two-factor authentication verified' });
    }

    // Following actions require active admin auth
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const members = await Database.getTeamMembers(ctx.workspaceId !== '*' ? ctx.workspaceId : undefined);
    const targetMember = (ctx.memberId && ctx.memberId !== 'admin' && ctx.memberId !== 'master-admin')
      ? members.find((m) => m.id === ctx.memberId)
      : (members.find((m) => m.role === 'owner') || members[0]);

    if (!targetMember) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    if (action === 'enable') {
      if (!secret || !code) {
        return NextResponse.json({ error: 'Secret and verification code are required' }, { status: 400 });
      }

      const isValid = verifyTotpToken(code, secret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid verification code. Check your authenticator app.' }, { status: 400 });
      }

      await Database.updateTeamMember(targetMember.id, {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        recoveryCodes: body.recoveryCodes || [],
      });

      await Database.addAuditLog({
        actor: { id: targetMember.id, name: targetMember.name, email: targetMember.email, ip: req.headers.get('x-forwarded-for') || '127.0.0.1' },
        action: 'security.2fa_enabled',
        targetType: 'user',
        targetId: targetMember.id,
        details: { email: targetMember.email },
      });

      await Database.addNotification({
        title: 'Two-Factor Authentication Enabled',
        message: `TOTP 2FA was successfully configured and enabled for ${targetMember.email}.`,
        type: 'reminder_dispatched',
      });

      return NextResponse.json({ success: true, message: 'Two-factor authentication enabled successfully' });
    }

    if (action === 'disable') {
      await Database.updateTeamMember(targetMember.id, {
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
        recoveryCodes: undefined,
      });

      await Database.addAuditLog({
        actor: { id: targetMember.id, name: targetMember.name, email: targetMember.email, ip: req.headers.get('x-forwarded-for') || '127.0.0.1' },
        action: 'security.2fa_disabled',
        targetType: 'user',
        targetId: targetMember.id,
        details: { email: targetMember.email },
      });

      await Database.addNotification({
        title: 'Two-Factor Authentication Disabled',
        message: `TOTP 2FA was disabled for account ${targetMember.email}.`,
        type: 'reminder_dispatched',
      });

      return NextResponse.json({ success: true, message: 'Two-factor authentication disabled' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error processing 2FA request' }, { status: 500 });
  }
}
