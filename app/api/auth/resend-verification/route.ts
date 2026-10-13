import { NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getAuthContext } from '@/lib/security/auth';
import { enforceDistributedRateLimitByKey } from '@/lib/security/rate-limit-redis';
import { sendVerificationEmail } from '@/lib/security/email-verification-mail';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

/** Sends the confirmation e-mail again to the signed-in member (at most 3 a quarter of an hour). */
async function POSTHandler(req: Request) {
  const ctx = await getAuthContext(req);
  if (!ctx.authenticated || ctx.isMasterAdmin) {
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  }
  const member = await Database.findTeamMember(ctx.memberId);
  if (!member) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  if (member.emailVerified !== false) return NextResponse.json({ success: true, alreadyConfirmed: true });

  const limited = await enforceDistributedRateLimitByKey(`verify-resend:${member.id}`, { windowMs: 15 * 60 * 1000, max: 3 });
  if (limited) return limited;

  const result = await sendVerificationEmail({ id: member.id, email: member.email, name: member.name }, req.url);
  return NextResponse.json({ success: result.sent, simulated: result.simulated, email: member.email });
}

export const POST = logged(POSTHandler, { route: '/api/auth/resend-verification' });
