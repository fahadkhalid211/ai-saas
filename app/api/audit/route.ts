import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    if (ctx.role !== 'owner' && !ctx.isMasterAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Audit trail is restricted exclusively to workspace owner and master administrator' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const rawLogs = await Database.getAuditLogs(limit, ctx.isMasterAdmin ? undefined : ctx.workspaceId);
    const logs = [...rawLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch audit trail' }, { status: 500 });
  }
});
