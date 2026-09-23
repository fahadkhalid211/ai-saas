import { NextResponse } from 'next/server';
import { getAdminKey, generateSessionToken, createSessionCookieHeader } from '@/lib/security/auth';
import { getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimit } from '@/lib/security/rate-limit-redis';
import { timingSafeStringEqual } from '@/lib/security/password';
import { getMasterEmail } from '@/lib/security/master';
import { Database } from '@/lib/db';

export const dynamic = 'force-dynamic';

const GENERIC_FAILURE = { error: 'Invalid credentials' };

/**
 * Platform-owner sign-in. Needs BOTH the master e-mail and the ADMIN_API_KEY, and answers every
 * failure the same way so nobody can tell which half was wrong. The customer sign-in at /api/auth
 * never accepts the master key.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limited = await enforceDistributedRateLimit(req, 'master-login', { windowMs: 60 * 1000, max: 5 });
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const rawKey = typeof body?.key === 'string' ? body.key : '';
    const key = rawKey.trim().replace(/^["']|["']$/g, '');
    if (!email || !key) return NextResponse.json(GENERIC_FAILURE, { status: 401 });

    // Evaluate both checks before deciding, so timing does not reveal which one failed.
    const emailOk = timingSafeStringEqual(email, getMasterEmail());
    const keyOk = timingSafeStringEqual(key, getAdminKey());
    if (!emailOk || !keyOk) {
      await Database.addAuditLog({
        actor: { id: 'unknown', name: 'Unknown', ip },
        action: 'auth.master_admin_login_failed',
        targetType: 'session',
        targetId: 'master',
        details: {},
      }).catch(() => undefined);
      return NextResponse.json(GENERIC_FAILURE, { status: 401 });
    }

    const sessionToken = generateSessionToken('admin', 'master-admin', '*', true);
    await Database.addAuditLog({
      actor: { id: 'admin', name: 'Master Admin', ip },
      action: 'auth.master_admin_login_success',
      targetType: 'session',
      targetId: 'admin',
      details: { role: 'owner' },
    });

    return NextResponse.json(
      {
        success: true,
        isMasterAdmin: true,
        member: { id: 'admin', name: 'Master Admin', email: getMasterEmail(), role: 'owner' },
      },
      { status: 200, headers: { 'Set-Cookie': createSessionCookieHeader(sessionToken) } }
    );
  } catch {
    return NextResponse.json(GENERIC_FAILURE, { status: 401 });
  }
}
