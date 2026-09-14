import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const logs = await Database.getAuditLogs(limit);
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch audit trail' }, { status: 500 });
  }
});
