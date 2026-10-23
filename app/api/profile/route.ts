import { NextResponse } from 'next/server';
import { getMasterEmail } from '@/lib/security/master';
import { Database, TeamMemberData } from '@/lib/db';
import { getAuthContext, getAdminKey, generateSessionToken, createSessionCookieHeader, createClearCookieHeader } from '@/lib/security/auth';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { deleteWorkspaceAndBilling } from '@/lib/platform/account-deletion';
import { getClientIp } from '@/lib/security/rate-limit';
import { verifyPassword, timingSafeStringEqual } from '@/lib/security/password';
import { logged } from '@/lib/logging/route';

async function GETHandler(req: Request) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Session invalid or expired' }, { status: 401 });
    }

    const member = await Database.getTeamMemberById(ctx.memberId, ctx.workspaceId);
    const workspace = await Database.getWorkspaceBilling(ctx.workspaceId);

    const safeMember: TeamMemberData = member || {
      id: ctx.memberId,
      workspaceId: ctx.workspaceId,
      name: ctx.role === 'owner' ? (workspace?.name ? `${workspace.name} Owner` : 'Master Admin') : 'Staff Member',
      email: (workspace as any)?.ownerEmail || workspace.billingEmail || getMasterEmail(),
      role: (ctx.role as any) || 'owner',
      status: 'active',
      title: 'Administrator',
      avatarUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      member: {
        id: safeMember.id,
        workspaceId: safeMember.workspaceId,
        name: safeMember.name,
        email: safeMember.email,
        role: safeMember.role,
        title: safeMember.title || '',
        avatarUrl: safeMember.avatarUrl || '',
        status: safeMember.status,
        createdAt: safeMember.createdAt,
        updatedAt: safeMember.updatedAt,
        lastLoginAt: safeMember.lastLoginAt,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        planId: workspace.planId || 'starter',
        planName: workspace.planName || 'Starter',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch user profile' }, { status: 500 });
  }
}

async function PATCHHandler(req: Request) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Session invalid or expired' }, { status: 401 });
    }
    // the platform owner troubleshooting a customer's workspace must not change that customer's name or password
    if (ctx.supportAccess) {
      return NextResponse.json({ error: 'Not available during support access: sign-in details can only be changed by the account owner.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, title, avatarUrl, currentPassword, newPassword } = body;

    const existingMember = await Database.getTeamMemberById(ctx.memberId, ctx.workspaceId);

    // Password change validation
    if (newPassword) {
      const cleanNew = String(newPassword).trim();
      if (cleanNew.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      const cleanCurr = String(currentPassword).trim();
      const masterKey = getAdminKey();

      let passValid = verifyPassword(cleanCurr, existingMember?.password);
      if (
        !passValid &&
        (ctx.role === 'admin' || ctx.role === 'owner' || ctx.memberId === 'master-admin' || ctx.memberId === 'admin')
      ) {
        passValid = timingSafeStringEqual(cleanCurr, masterKey);
      }

      if (!passValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
    }

    const updated = await Database.updateTeamMemberProfile(
      ctx.memberId,
      {
        name: name !== undefined ? String(name).trim() : undefined,
        title: title !== undefined ? String(title).trim() : undefined,
        avatarUrl: avatarUrl !== undefined ? String(avatarUrl).trim() : undefined,
        password: newPassword ? String(newPassword).trim() : undefined,
      },
      ctx.workspaceId
    );

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update profile: User record could not be updated' }, { status: 400 });
    }

    const ip = getClientIp(req);
    await Database.addAuditLog({
      actor: { id: ctx.memberId, name: updated.name || ctx.role, ip },
      action: 'profile.updated',
      targetType: 'user_profile',
      targetId: ctx.memberId,
      details: {
        nameChanged: name !== undefined,
        titleChanged: title !== undefined,
        avatarChanged: avatarUrl !== undefined,
        passwordChanged: !!newPassword,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      member: {
        id: updated.id,
        workspaceId: updated.workspaceId,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        title: updated.title || '',
        avatarUrl: updated.avatarUrl || '',
        status: updated.status || 'active',
        createdAt: updated.createdAt || new Date().toISOString(),
        updatedAt: updated.updatedAt,
      },
    });
    if (newPassword && !ctx.isMasterAdmin) {
      // a new password ended every other session; keep this one signed in
      response.headers.append('Set-Cookie', createSessionCookieHeader(generateSessionToken(updated.role, updated.id, updated.workspaceId, undefined, updated.sessionVersion || 0)));
    }
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update profile' }, { status: 500 });
  }
}

/**
 * The signed-in person deletes their own account, for good. The owner's account takes the whole workspace with it (assistants,
 * documents, conversations, leads, appointments, team members); anyone else only removes their own sign-in. The person must type
 * their e-mail address and, if the account has a password, give it, so a stolen session or a stray click cannot do this.
 */
async function DELETEHandler(req: Request) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Session invalid or expired' }, { status: 401 });
    }
    if (ctx.supportAccess) {
      return NextResponse.json({ error: 'Not available during support access: only the account owner can delete the account.' }, { status: 403 });
    }
    if (ctx.isMasterAdmin) {
      return NextResponse.json({ error: 'The platform admin account cannot be deleted here.' }, { status: 403 });
    }

    const limited = await enforceDistributedRateLimitByKey(`delete-account:${ctx.memberId}`, { windowMs: 15 * 60 * 1000, max: 5 });
    if (limited) return limited;

    const member = await Database.getTeamMemberById(ctx.memberId, ctx.workspaceId);
    if (!member) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const typedEmail = String(body?.confirmEmail || '').trim().toLowerCase();
    if (!typedEmail || typedEmail !== String(member.email || '').trim().toLowerCase()) {
      return NextResponse.json({ error: 'Type your account e-mail address exactly to confirm.' }, { status: 400 });
    }
    if (member.password) {
      const password = String(body?.password || '').trim();
      if (!password) return NextResponse.json({ error: 'Enter your password to confirm.', needsPassword: true }, { status: 400 });
      if (!verifyPassword(password, member.password)) return NextResponse.json({ error: 'That password is not correct.' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const wipesWorkspace = member.role === 'owner';
    if (wipesWorkspace) {
      const result = await deleteWorkspaceAndBilling(ctx.workspaceId);
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    } else {
      await Database.deleteMemberAccount(member.id);
    }

    // The record of the deletion keeps no name or e-mail address, only that it happened.
    await Database.addAuditLog({
      actor: { id: member.id, name: 'Deleted account', ip },
      action: wipesWorkspace ? 'account.workspace_deleted' : 'account.member_deleted',
      targetType: 'user_profile',
      targetId: member.id,
      details: { selfService: true },
    });

    const res = NextResponse.json({ success: true, deleted: wipesWorkspace ? 'workspace' : 'member' });
    res.headers.append('Set-Cookie', createClearCookieHeader());
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not delete the account' }, { status: 500 });
  }
}

export const GET = logged(GETHandler, { route: '/api/profile' });
export const PATCH = logged(PATCHHandler, { route: '/api/profile' });
export const DELETE = logged(DELETEHandler, { route: '/api/profile' });
