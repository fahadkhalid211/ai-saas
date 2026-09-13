import { NextResponse } from 'next/server';
import {
  getAdminKey,
  generateSessionToken,
  verifyAdminRequest,
  createSessionCookieHeader,
  createClearCookieHeader,
} from '@/lib/security/auth';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

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

    return NextResponse.json(
      { success: true, message: 'Authenticated successfully', token: sessionToken },
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
