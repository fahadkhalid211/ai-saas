import { NextResponse } from 'next/server';
import {
  getAdminKey,
  generateSessionToken,
  verifyAdminRequest,
  createSessionCookieHeader,
  createClearCookieHeader,
} from '@/lib/security/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { Database } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const isAuthed = await verifyAdminRequest(req);
    return NextResponse.json({ authenticated: isAuthed });
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
    const mode = body?.mode || (body?.email && !body?.businessName ? 'staff' : body?.businessName ? 'register' : 'admin');

    // 1. Self-Serve Business Account Registration
    if (mode === 'register') {
      const businessName = (body?.businessName || '').trim();
      const email = (body?.email || '').toLowerCase().trim();
      const password = (body?.password || '').trim();
      const industryTemplateSlug = body?.industryTemplateSlug || 'classic-barbershop';

      if (!businessName || !email) {
        return NextResponse.json(
          { error: 'Business Name and Work Email are required to create an account' },
          { status: 400 }
        );
      }

      if (password && password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      const tenantResult = await Database.createTenantWorkspace({
        businessName,
        ownerEmail: email,
        password: password || 'Tenant123!',
        industryTemplateSlug,
      });

      const sessionToken = generateSessionToken(
        'owner',
        tenantResult.owner.id,
        tenantResult.workspace.id
      );
      const cookieHeader = createSessionCookieHeader(sessionToken);

      await Database.addAuditLog({
        actor: { id: tenantResult.owner.id, name: tenantResult.owner.name, ip },
        action: 'auth.tenant_registered',
        targetType: 'workspace',
        targetId: tenantResult.workspace.id,
        details: { businessName, email, template: industryTemplateSlug },
      });

      return NextResponse.json(
        {
          success: true,
          message: `Welcome to Kortex AI! Workspace "${businessName}" created successfully.`,
          isStaff: false,
          isOwner: true,
          member: tenantResult.owner,
          workspace: tenantResult.workspace,
          assistant: tenantResult.assistant,
          token: sessionToken,
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
      const email = body?.email?.trim();
      const passwordOrCode = (body?.password || body?.accessCode || '').trim();

      if (!email || !passwordOrCode) {
        return NextResponse.json(
          { error: 'Email and password/access code are required' },
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
          actor: { id: tenantMatch.member.id, name: tenantMatch.member.name, ip },
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
            member: tenantMatch.member,
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
      const staffMember = await Database.verifyStaffLogin(email, passwordOrCode);
      if (!staffMember) {
        return NextResponse.json(
          { error: 'Invalid credentials or account inactive' },
          { status: 401 }
        );
      }

      const sessionToken = generateSessionToken(staffMember.role, staffMember.id, 'default-workspace');
      const cookieHeader = createSessionCookieHeader(sessionToken);

      await Database.addAuditLog({
        actor: { id: staffMember.id, name: staffMember.name, ip },
        action: 'auth.staff_login_success',
        targetType: 'session',
        targetId: staffMember.id,
        details: { email: staffMember.email, role: staffMember.role },
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

    // 2. Master Admin Key / Passcode Login
    const rawKey = body?.key || body?.apiKey || body?.passcode || body?.password;

    if (!rawKey || typeof rawKey !== 'string' || !rawKey.trim()) {
      return NextResponse.json({ error: 'Master Admin Key or Passcode is required' }, { status: 400 });
    }

    const key = rawKey.trim().replace(/^["']|["']$/g, '');
    const masterKey = getAdminKey();
    if (key !== masterKey) {
      return NextResponse.json({ error: 'Invalid master admin access key' }, { status: 401 });
    }

    const sessionToken = generateSessionToken();
    const cookieHeader = createSessionCookieHeader(sessionToken);

    await Database.addAuditLog({
      actor: { id: 'admin', name: 'Master Admin', ip },
      action: 'auth.master_admin_login_success',
      targetType: 'session',
      targetId: 'admin',
      details: { role: 'owner' },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Authenticated successfully as Master Admin',
        isStaff: false,
        member: {
          id: 'admin',
          name: 'Master Admin',
          email: 'admin@kortexai.com',
          role: 'owner',
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
