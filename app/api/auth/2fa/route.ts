import { NextRequest, NextResponse } from 'next/server';
import { getMasterEmail } from '@/lib/security/master';
import { Database } from '@/lib/db';
import { verifyAdminRequest, withAdminAuth, getAuthContext } from '@/lib/security/auth';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { encryptSecret } from '@/lib/security/crypto';
import { checkSecondFactor, hashRecoveryCodes } from '@/lib/security/two-factor';
import {
  generateBase32Secret,
  generateOtpAuthUrl,
  generateRecoveryCodes,
  verifyTotpToken,
} from '@/lib/security/totp';
import { createSessionCookieHeader, generateSessionToken } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

const GETHandler = withAdminAuth(async (req: Request) => {
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

async function POSTHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, secret, code } = body;

    // Following actions require active admin auth
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    // the platform owner troubleshooting a customer's workspace must not change that customer's two-factor settings
    if (ctx.supportAccess) {
      return NextResponse.json({ error: 'Not available during support access: sign-in details can only be changed by the account owner.' }, { status: 403 });
    }

    const members = await Database.getTeamMembers(ctx.workspaceId !== '*' ? ctx.workspaceId : undefined);
    const targetMember = (ctx.memberId && ctx.memberId !== 'admin' && ctx.memberId !== 'master-admin')
      ? members.find((m) => m.id === ctx.memberId)
      : (members.find((m) => m.role === 'owner') || members[0]);

    if (!targetMember) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    if (action === 'enable') {
      if (targetMember.twoFactorEnabled) {
        return NextResponse.json({ error: 'Two-factor authentication is already on. Turn it off first (this needs a current code) to set up a new device.' }, { status: 409 });
      }
      if (!secret || !code) {
        return NextResponse.json({ error: 'Secret and verification code are required' }, { status: 400 });
      }

      const isValid = verifyTotpToken(code, secret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid verification code. Check your authenticator app.' }, { status: 400 });
      }

      await Database.updateTeamMember(targetMember.id, {
        twoFactorEnabled: true,
        twoFactorSecret: encryptSecret(secret),
        recoveryCodes: hashRecoveryCodes(body.recoveryCodes),
        twoFactorLastStep: undefined,
      });
      // changing the second factor ends every other session; this one continues
      const enabledVersion = await Database.bumpSessionVersion(targetMember.id);

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

      const res = NextResponse.json({ success: true, message: 'Two-factor authentication enabled successfully' });
      res.headers.append('Set-Cookie', createSessionCookieHeader(generateSessionToken(targetMember.role, targetMember.id, targetMember.workspaceId, undefined, enabledVersion)));
      return res;
    }

    if (action === 'disable') {
      // A stolen session must not be able to switch the second factor off: prove possession of the authenticator first.
      if (targetMember.twoFactorEnabled && targetMember.twoFactorSecret) {
        const supplied = typeof code === 'string' ? code.trim().toUpperCase() : '';
        if (!supplied) {
          return NextResponse.json({ error: 'Enter a current authentication code (or a recovery code) to turn off two-factor authentication.', codeRequired: true }, { status: 400 });
        }
        const limited = await enforceDistributedRateLimitByKey(`2fa-disable:${targetMember.id}`, { windowMs: 5 * 60 * 1000, max: 5 });
        if (limited) return limited;
        const check = checkSecondFactor(targetMember, supplied);
        if (!check.ok) {
          return NextResponse.json({ error: 'Invalid authentication code.', codeRequired: true }, { status: 400 });
        }
      }
      await Database.updateTeamMember(targetMember.id, {
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
        recoveryCodes: undefined,
        twoFactorLastStep: undefined,
      });
      const disabledVersion = await Database.bumpSessionVersion(targetMember.id);

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

      const res = NextResponse.json({ success: true, message: 'Two-factor authentication disabled' });
      res.headers.append('Set-Cookie', createSessionCookieHeader(generateSessionToken(targetMember.role, targetMember.id, targetMember.workspaceId, undefined, disabledVersion)));
      return res;
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error processing 2FA request' }, { status: 500 });
  }
}

export const POST = logged(POSTHandler, { route: '/api/auth/2fa' });
export const GET = logged(GETHandler, { route: '/api/auth/2fa' });
