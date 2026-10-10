import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';

const GETHandler = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

    const logs = await Database.getMcpAuditLogs(ctx.workspaceId, limit);

    return NextResponse.json({
      auditLogs: logs,
      totalCount: logs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch MCP audit logs' },
      { status: 500 }
    );
  }
});

export const GET = logged(GETHandler, { route: '/api/mcp/audit' });
