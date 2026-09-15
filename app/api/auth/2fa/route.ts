import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { verifyAdminRequest, withAdminAuth } from '@/lib/security/auth';
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

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const members = await Database.getTeamMembers();
    const owner = members.find((m) => m.role === 'owner') || members[0];

    if (action === 'setup') {
      const secret = generateBase32Secret(20);
      const recoveryCodes = generateRecoveryCodes(8);
      const otpUrl = generateOtpAuthUrl({
        issuer: 'Kortex AI Enterprise',
        accountName: owner?.email || 'admin@kortexai.com',
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
      enabled: Boolean(owner?.twoFactorEnabled),
      lastUpdated: owner?.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch 2FA status' }, { status: 500 });
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, secret, code, email } = body;

    const members = await Database.getTeamMembers();
    const owner = members.find((m) => m.role === 'owner') || members[0];

    if (action === 'verify_login') {
      // Throttle brute-force guessing of the 6-digit TOTP code / recovery
      // codes: a handful of attempts per email+IP per window is far more
      // than a legitimate user ever needs.
      const rateLimitKey = `2fa-verify:${(email || owner?.email || '').toLowerCase()}`;
      const rl = enforceRateLimit(req, rateLimitKey, { windowMs: 5 * 60 * 1000, max: 5 });
      if (rl.errorResponse) {
        return rl.errorResponse;
      }

      // Login verification challenge
      if (!owner || !owner.twoFactorEnabled || !owner.twoFactorSecret) {
        return NextResponse.json({ success: true, message: '2FA not enabled for account' });
      }

      const isValid = verifyTotpToken(code, owner.twoFactorSecret);
      const isRecovery = owner.recoveryCodes?.includes(code.trim().toUpperCase());

      if (!isValid && !isRecovery) {
        return NextResponse.json({ error: 'Invalid authentication code or recovery key' }, { status: 400 });
      }

      // If recovery code was used, remove it from list
      if (isRecovery && owner.recoveryCodes) {
        const remaining = owner.recoveryCodes.filter((c) => c !== code.trim().toUpperCase());
        await Database.updateTeamMember(owner.id, { recoveryCodes: remaining });
      }

      await Database.addAuditLog({
        actor: { id: owner.id, name: owner.name, email: owner.email, ip: req.headers.get('x-forwarded-for') || '127.0.0.1' },
        action: 'auth.2fa_success',
        targetType: 'auth',
        details: { method: isRecovery ? 'recovery_code' : 'totp' },
      });

      return NextResponse.json({ success: true, message: 'Two-factor authentication verified' });
    }

    // Following actions require active admin auth
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    if (action === 'enable') {
      if (!secret || !code) {
        return NextResponse.json({ error: 'Secret and verification code are required' }, { status: 400 });
      }

      const isValid = verifyTotpToken(code, secret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid verification code. Check your authenticator app.' }, { status: 400 });
      }

      if (owner) {
        await Database.updateTeamMember(owner.id, {
          twoFactorEnabled: true,
          twoFactorSecret: secret,
          recoveryCodes: body.recoveryCodes || [],
        });

        await Database.addAuditLog({
          actor: { id: owner.id, name: owner.name, email: owner.email, ip: req.headers.get('x-forwarded-for') || '127.0.0.1' },
          action: 'security.2fa_enabled',
          targetType: 'user',
          targetId: owner.id,
          details: { email: owner.email },
        });

        await Database.addNotification({
          title: 'Two-Factor Authentication Enabled',
          message: `TOTP 2FA was successfully configured and enabled for ${owner.email}.`,
          type: 'reminder_dispatched',
        });
      }

      return NextResponse.json({ success: true, message: 'Two-factor authentication enabled successfully' });
    }

    if (action === 'disable') {
      if (owner) {
        await Database.updateTeamMember(owner.id, {
          twoFactorEnabled: false,
          twoFactorSecret: undefined,
          recoveryCodes: undefined,
        });

        await Database.addAuditLog({
          actor: { id: owner.id, name: owner.name, email: owner.email, ip: req.headers.get('x-forwarded-for') || '127.0.0.1' },
          action: 'security.2fa_disabled',
          targetType: 'user',
          targetId: owner.id,
          details: { email: owner.email },
        });

        await Database.addNotification({
          title: 'Two-Factor Authentication Disabled',
          message: `TOTP 2FA was disabled for account ${owner.email}.`,
          type: 'reminder_dispatched',
        });
      }

      return NextResponse.json({ success: true, message: 'Two-factor authentication disabled' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error processing 2FA request' }, { status: 500 });
  }
}
