import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { withAdminAuth } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const assistantId = searchParams.get('assistantId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const notifications = await Database.getNotifications(assistantId, limit);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch notifications' }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const { action, id, assistantId } = body;

    if (action === 'mark_read' && id) {
      await Database.markNotificationAsRead(id);
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      await Database.markAllNotificationsAsRead(assistantId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update notification' }, { status: 500 });
  }
});
