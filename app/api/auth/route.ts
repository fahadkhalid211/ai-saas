import { NextResponse } from 'next/server';
import {
  generateSessionToken,
  verifyAdminRequest,
  getAuthContext,
  createSessionCookieHeader,
  createClearCookieHeader,
} from '@/lib/security/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { getMasterEmail } from '@/lib/security/master';
import { Database, sanitizeTeamMember } from '@/lib/db';
import { validateRegistrationPayload, validateEmail, sanitizeInput } from '@/lib/security/validation';

export async function GET(req: Request) {
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

export async function POST(req: Request) {
  try {
    // Rate limit login attempts to 10 per minute per IP to prevent brute forcing
    const ip = getClientIp(req);
    const limit = checkRateLimit(`login:${ip}`, { windowMs: 60 * 1000, max: 10 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 1 minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const mode = body?.mode || (body?.email && !body?.businessName ? 'staff' : body?.businessName ? 'register' : 'staff');

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

      if (!passwordOrCode) {
        return NextResponse.json(
          { error: 'Password or access code is required' },
          { status: 400 }
        );
      }

      // Check tenant workspace login
      const tenantMatch = await Database.verifyTenantLogin(email, passwordOrCode);
      if (tenantMatch) {
        const sessionToken = generateSessionToken(
          tenantMatch.member.role,
          tenantMatch.member.id,
          tenantMatch.workspace.id
        );
        const cookieHeader = createSessionCookieHeader(sessionToken);

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

      const staffWs = staffMember.workspaceId || 'default-workspace';
      const sessionToken = generateSessionToken(staffMember.role, staffMember.id, staffWs);
      const cookieHeader = createSessionCookieHeader(sessionToken);

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

export async function DELETE() {
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
