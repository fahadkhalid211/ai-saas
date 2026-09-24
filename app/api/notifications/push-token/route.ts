import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getAuthContext } from '@/lib/security/auth';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
    },
  });
}

async function POSTHandler(req: Request) {
  try {
    const ctx = await getAuthContext(req);
    if (!ctx.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { token, assistantId, platform = 'android', deviceInfo } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Device push token is required' }, { status: 400 });
    }

    const record = await Database.registerPushToken(
      token.trim(),
      ctx.workspaceId,
      ctx.memberId,
      assistantId,
      platform,
      deviceInfo
    );

    return NextResponse.json({
      success: true,
      message: 'Device push token registered successfully',
      record,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to register push token' },
      { status: 500 }
    );
  }
}

async function DELETEHandler(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const removed = await Database.removePushToken(token.trim());
    return NextResponse.json({ success: true, removed });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to unregister push token' },
      { status: 500 }
    );
  }
}

export const POST = logged(POSTHandler, { route: '/api/notifications/push-token' });
export const DELETE = logged(DELETEHandler, { route: '/api/notifications/push-token' });
