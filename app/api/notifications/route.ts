import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth, getAuthContext } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

const GETHandler = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const notifications = await Database.getNotifications(assistantId, limit, ctx.workspaceId);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch notifications' }, { status: 500 });
  }
});

const POSTHandler = withAdminAuth(async (req: Request) => {
  try {
    const ctx = await getAuthContext(req);
    const body = await req.json();
    const { action, id, assistantId } = body;

    if (action === 'mark_read' && id) {
      const ok = await Database.markNotificationAsRead(id, ctx?.workspaceId);
      if (!ok) {
        return NextResponse.json({ error: 'Notification not found or forbidden' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      const ok = await Database.markAllNotificationsAsRead(assistantId, ctx?.workspaceId);
      if (!ok) {
        return NextResponse.json({ error: 'Failed or forbidden' }, { status: 403 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update notification' }, { status: 500 });
  }
});

export const GET = logged(GETHandler, { route: '/api/notifications', sample: 0.05 });
export const POST = logged(POSTHandler, { route: '/api/notifications' });
