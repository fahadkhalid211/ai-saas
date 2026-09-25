import { NextResponse } from 'next/server';
import {
  generateSessionToken,
  verifyAdminRequest,
  getAuthContext,
  createSessionCookieHeader,
  createClearCookieHeader,
} from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { updateLogContext } from '@/lib/logging/context';
import { enforceDistributedRateLimit, enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { getMasterEmail } from '@/lib/security/master';
import { Database, sanitizeTeamMember } from '@/lib/db';
import { validateRegistrationPayload, validateEmail, sanitizeInput } from '@/lib/security/validation';
import { verifyRecaptchaToken } from '@/lib/security/recaptcha';
import { logged } from '@/lib/logging/route';
import { verifyTotpToken } from '@/lib/security/totp';

/**
 * Second step of sign-in. Once the password is right, an account with two-factor authentication turned on must also present a
 * current authenticator code (or an unused recovery code) before any session is issued. Returns a response to send when the
 * sign-in must stop here, or null when it may continue.
 */
async function requireSecondFactor(memberId: string, email: string, code: unknown, ip: string): Promise<Response | null> {
  const member = await Database.getTeamMemberById(memberId);
  if (!member || !member.twoFactorEnabled || !member.twoFactorSecret) return null;

  const supplied = typeof code === 'string' ? code.trim().toUpperCase() : '';
  if (!supplied) {
    return NextResponse.json({ requiresTwoFactor: true, error: 'Enter the 6-digit code from your authenticator app.' }, { status: 401 });
  }

  const limited = await enforceDistributedRateLimitByKey(`login-2fa:${memberId}`, { windowMs: 5 * 60 * 1000, max: 5 });
  if (limited) return limited;

  const totpOk = verifyTotpToken(supplied, member.twoFactorSecret);
  const recoveryOk = !totpOk && Boolean(member.recoveryCodes?.includes(supplied));
  if (!totpOk && !recoveryOk) {
    await Database.addAuditLog({
      actor: { id: member.id, name: member.name, email, username: email.split('@')[0], ip },
      action: 'auth.2fa_failed',
      targetType: 'session',
      targetId: member.id,
      details: { email },
    });
    return NextResponse.json({ requiresTwoFactor: true, error: 'Invalid authentication code.' }, { status: 401 });
  }
  if (recoveryOk) {
    await Database.updateTeamMember(member.id, { recoveryCodes: (member.recoveryCodes || []).filter((c) => c !== supplied) });
  }
  return null;
}

async function GETHandler(req: Request) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ authenticated: false });
    }

    const member = await Database.getTeamMemberById(ctx.memberId);
    const workspace = await Database.getWorkspaceBilling(ctx.workspaceId);

    return NextResponse.json({
      authenticated: true,
      role: ctx.role,
      memberId: ctx.memberId,
      workspaceId: ctx.workspaceId,
      isMasterAdmin: ctx.isMasterAdmin,
      member: sanitizeTeamMember(member) || {
        id: ctx.memberId,
        workspaceId: ctx.workspaceId,
        name: ctx.role === 'owner' ? 'Master Admin' : 'Staff Member',
        email: getMasterEmail(),
        role: ctx.role,
        title: 'Master Administrator',
        avatarUrl: '',
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        planId: workspace.planId || 'starter',
        planName: workspace.planName || 'Starter',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error?.message }, { status: 500 });
  }
}

async function POSTHandler(req: Request) {
  try {
    // Limit sign-in / sign-up attempts per IP (counted in Redis so it holds across serverless instances).
    const ip = getClientIp(req);
    const limited = await enforceDistributedRateLimit(req, 'login', { windowMs: 60 * 1000, max: 10 });
    if (limited) return limited;

    const body = await req.json();
    const mode = body?.mode || (body?.email && !body?.businessName ? 'staff' : body?.businessName ? 'register' : 'staff');

    // Verify Google reCAPTCHA token for web requests if configured (mobile native apps don't run browser recaptcha)
    const isMobileClient = req.headers.get('x-client-platform') === 'mobile' || body?.platform === 'mobile';
    if (!isMobileClient) {
      const recaptchaToken = body?.recaptchaToken;
      const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, ip);
      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: recaptchaResult.error || 'Security check failed. Please verify reCAPTCHA and try again.' },
          { status: 400 }
        );
      }
    }

    // Demo / Quick Preview access for seamless mobile testing
    if (mode === 'demo_preview') {
      const state = await Database.getState();
      const ws = (state.workspaces && state.workspaces[0]) || {
        id: 'default-workspace',
        name: 'Crescelo Workspace',
        planId: 'pro',
        planName: 'Pro',
      };
      const member = (state.teamMembers && state.teamMembers.find((m) => m.workspaceId === ws.id)) || {
        id: 'demo_user',
        workspaceId: ws.id,
        name: 'Workspace Owner',
        email: 'admin@crescelo.com',
        role: 'owner',
      };
      const sessionToken = generateSessionToken((member as any).role || 'owner', member.id, ws.id);
      return NextResponse.json({
        success: true,
        message: 'Connected to workspace',
        member: sanitizeTeamMember(member as any),
        workspace: ws,
        token: sessionToken,
      });
    }

    // 1. Self-Serve Business Account Registration
    if (mode === 'register') {
      const regValidation = validateRegistrationPayload(body);
      if (!regValidation.valid || !regValidation.sanitized) {
        const firstError = Object.values(regValidation.errors)[0] || 'Invalid registration details';
        return NextResponse.json(
          { error: firstError, errors: regValidation.errors },
          { status: 400 }
        );
      }

      const { businessName, email, password, industryTemplateSlug } = regValidation.sanitized;

      const tenantResult = await Database.createTenantWorkspace({
        businessName,
        ownerEmail: email,
        password: password || undefined,
        industryTemplateSlug,
      });

      const sessionToken = generateSessionToken(
        'owner',
        tenantResult.owner.id,
        tenantResult.workspace.id
      );
      const cookieHeader = createSessionCookieHeader(sessionToken);
      updateLogContext({ userId: tenantResult.owner.id, workspaceId: tenantResult.workspace.id, role: 'owner' });

      await Database.addAuditLog({
        actor: {
          id: tenantResult.owner.id,
          name: tenantResult.owner.name,
          email,
          username: email.split('@')[0],
          ip,
        },
        action: 'auth.tenant_registered',
        targetType: 'workspace',
        targetId: tenantResult.workspace.id,
        details: { businessName, email, template: industryTemplateSlug },
      });

      return NextResponse.json(
        {
          success: true,
          message: `Welcome to Crescelo! Workspace "${businessName}" created successfully.`,
          isStaff: false,
          isOwner: true,
          member: sanitizeTeamMember(tenantResult.owner),
          workspace: tenantResult.workspace,
          assistant: tenantResult.assistant,
          token: sessionToken,
          // Only present when the caller didn't supply their own password;
          // show it once so it can be recorded — it is never stored in the clear.
          temporaryPassword: tenantResult.temporaryPassword,
        },
        {
          status: 201,
          headers: {
            'Set-Cookie': cookieHeader,
          },
        }
      );
    }

    // 2. Staff / Tenant Credentials Login
    if (mode === 'staff' || (body?.email && (body?.password || body?.accessCode))) {
      const emailValidation = validateEmail(body?.email);
      if (!emailValidation.valid || !emailValidation.value) {
        return NextResponse.json(
          { error: emailValidation.error || 'A valid email address is required' },
          { status: 400 }
        );
      }

      const email = emailValidation.value;
      const passwordOrCode = (body?.password || body?.accessCode || '').trim();

      // Slow down password guessing against one account, whichever IPs it comes from.
      const emailLimited = await enforceDistributedRateLimitByKey(`login-email:${email}`, { windowMs: 15 * 60 * 1000, max: 10 });
      if (emailLimited) return emailLimited;

      if (!passwordOrCode) {
        return NextResponse.json(
          { error: 'Password or access code is required' },
          { status: 400 }
        );
      }

      // Check tenant workspace login
      const tenantMatch = await Database.verifyTenantLogin(email, passwordOrCode);
      if (tenantMatch) {
        const stop = await requireSecondFactor(tenantMatch.member.id, email, body?.twoFactorCode, ip);
        if (stop) return stop;
        const sessionToken = generateSessionToken(
          tenantMatch.member.role,
          tenantMatch.member.id,
          tenantMatch.workspace.id
        );
        const cookieHeader = createSessionCookieHeader(sessionToken);
        updateLogContext({ userId: tenantMatch.member.id, workspaceId: tenantMatch.workspace.id, role: tenantMatch.member.role });

        await Database.addAuditLog({
          actor: {
            id: tenantMatch.member.id,
            name: tenantMatch.member.name,
            email: tenantMatch.member.email || email,
            username: (tenantMatch.member.email || email).split('@')[0],
            ip,
          },
          action: 'auth.tenant_login_success',
          targetType: 'workspace',
          targetId: tenantMatch.workspace.id,
          details: { email, role: tenantMatch.member.role },
        });

        return NextResponse.json(
          {
            success: true,
            message: `Welcome back, ${tenantMatch.member.name}`,
            isStaff: false,
            isOwner: tenantMatch.member.role === 'owner',
            member: sanitizeTeamMember(tenantMatch.member),
            workspace: tenantMatch.workspace,
            token: sessionToken,
          },
          {
            status: 200,
            headers: {
              'Set-Cookie': cookieHeader,
            },
          }
        );
      }

      // Check staff team member login
      const staffMember = await Database.verifyStaffLogin(email, passwordOrCode, body?.workspaceId);
      if (!staffMember) {
        await Database.addAuditLog({
          actor: { id: 'unknown', name: 'Anonymous', email, username: email.split('@')[0], ip },
          action: 'auth.login_failed',
          targetType: 'session',
          targetId: email,
          details: { attemptedEmail: email },
        });
        return NextResponse.json(
          { error: 'Invalid credentials or account inactive' },
          { status: 401 }
        );
      }

      const stop2 = await requireSecondFactor(staffMember.id, email, body?.twoFactorCode, ip);
      if (stop2) return stop2;

      const staffWs = staffMember.workspaceId || 'default-workspace';
      const sessionToken = generateSessionToken(staffMember.role, staffMember.id, staffWs);
      const cookieHeader = createSessionCookieHeader(sessionToken);
      updateLogContext({ userId: staffMember.id, workspaceId: staffWs, role: staffMember.role });

      await Database.addAuditLog({
        actor: {
          id: staffMember.id,
          name: staffMember.name,
          email: staffMember.email,
          username: staffMember.email ? staffMember.email.split('@')[0] : staffMember.name,
          ip,
        },
        action: 'auth.staff_login_success',
        targetType: 'session',
        targetId: staffMember.id,
        details: { email: staffMember.email, role: staffMember.role, workspaceId: staffWs },
      });

      return NextResponse.json(
        {
          success: true,
          message: `Welcome back, ${staffMember.name}`,
          isStaff: true,
          member: {
            id: staffMember.id,
            name: staffMember.name,
            email: staffMember.email,
            role: staffMember.role,
            workspaceId: staffWs,
          },
          token: sessionToken,
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': cookieHeader,
          },
        }
      );
    }

    // The master key is not accepted here. Platform-owner sign-in lives at /api/master/auth.
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 500 });
  }
}

async function DELETEHandler() {
  const clearHeader = createClearCookieHeader();
  return NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    {
      status: 200,
      headers: {
        'Set-Cookie': clearHeader,
      },
    }
  );
}

export const GET = logged(GETHandler, { route: '/api/auth', sample: 0.2 });
export const POST = logged(POSTHandler, { route: '/api/auth' });
export const DELETE = logged(DELETEHandler, { route: '/api/auth' });
