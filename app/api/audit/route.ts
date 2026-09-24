import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

const GETHandler = withAdminAuth(async (req: Request) => {
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

    // Enrich logs with user email / username if not present
    const enrichedLogs = rawLogs.map((log) => {
      let email = log.actor?.email;
      if (!email) {
        if (log.details?.email && typeof log.details.email === 'string') {
          email = log.details.email;
        } else if (log.details?.attemptedEmail && typeof log.details.attemptedEmail === 'string') {
          email = log.details.attemptedEmail;
        } else if (log.details?.ownerEmail && typeof log.details.ownerEmail === 'string') {
          email = log.details.ownerEmail;
        } else if (log.actor?.id === 'admin' || log.actor?.id === 'master-admin' || log.actor?.name === 'Master Admin') {
          email = 'itsfahad9@gmail.com';
        }
      }

      let username = log.actor?.username;
      if (!username) {
        if (email) {
          username = email.split('@')[0];
        } else if (log.actor?.name && log.actor.name !== 'Unknown') {
          username = log.actor.name;
        }
      }

      return {
        ...log,
        actor: {
          ...log.actor,
          email: email || log.actor?.email,
          username: username || log.actor?.username,
        },
      };
    });

    const logs = [...enrichedLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch audit trail' }, { status: 500 });
  }
});

export const GET = logged(GETHandler, { route: '/api/audit' });
