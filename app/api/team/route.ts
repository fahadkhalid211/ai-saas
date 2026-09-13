import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'default-workspace';

    const members = await Database.getTeamMembers(workspaceId);
    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, role = 'support_agent', workspaceId = 'default-workspace' } = body;

    if (!name || !name.trim() || !email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid name and email address are required' }, { status: 400 });
    }

    const existing = await Database.getTeamMemberByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'A team member with this email already exists' }, { status: 400 });
    }

    const member = await Database.addTeamMember({
      workspaceId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status: 'active',
    });

    const ip = getClientIp(req);
    await Database.addAuditLog({
      actor: { id: 'admin', name: 'Master Admin', ip },
      action: 'team.member_invited',
      targetType: 'team_member',
      targetId: member.id,
      details: { email: member.email, role: member.role },
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to add team member' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await req.json();
    const { id, role, status, name } = body;

    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const updated = await Database.updateTeamMember(id, {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(name ? { name } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const ip = getClientIp(req);
    await Database.addAuditLog({
      actor: { id: 'admin', name: 'Master Admin', ip },
      action: 'team.member_updated',
      targetType: 'team_member',
      targetId: id,
      details: { role, status },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update team member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await verifyAdminRequest(req))) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter required' }, { status: 400 });
    }

    const members = await Database.getTeamMembers();
    const member = members.find((m) => m.id === id);

    if (member?.role === 'owner') {
      const ownerCount = members.filter((m) => m.role === 'owner').length;
      if (ownerCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the primary workspace owner' }, { status: 400 });
      }
    }

    const deleted = await Database.deleteTeamMember(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const ip = getClientIp(req);
    await Database.addAuditLog({
      actor: { id: 'admin', name: 'Master Admin', ip },
      action: 'team.member_removed',
      targetType: 'team_member',
      targetId: id,
      details: { memberEmail: member?.email },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to remove team member' }, { status: 500 });
  }
}
