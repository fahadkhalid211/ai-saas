import { NextResponse } from 'next/server';
import { Database, sanitizeTeamMember } from '@/lib/db';
import { createSessionCookieHeader, generateSessionToken, getAuthContext } from '@/lib/security/auth';
import { readEmailVerificationToken } from '@/lib/security/email-verification';
import { appBaseUrl } from '@/lib/security/email-verification-mail';
import { enforceDistributedRateLimit } from '@/lib/security/rate-limit-redis';
import { getClientIp } from '@/lib/security/rate-limit';
import { validateString } from '@/lib/security/validation';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

/**
 * The link in the confirmation e-mail.
 *
 * Opening it proves the person can read the mailbox, which is all "confirmed" means. But anyone can type someone else's address
 * into the sign-up form and choose a password, and the mailbox owner then receives the link. So the link only confirms
 * straight away when it is opened in the browser that is signed in to that very account (the person who signed up, reading
 * their mail on the same device). From any other browser, the person must choose a new password first: that replaces whatever
 * password the sign-up used, ends the sessions it started and removes any two-factor setup made on it, so whoever filled in
 * the form is locked out and the owner of the mailbox is in.
 */
async function GETHandler(req: Request) {
  const base = appBaseUrl(req.url);
  const limited = await enforceDistributedRateLimit(req, 'verify-email', { windowMs: 60 * 1000, max: 30 });
  if (limited) return limited;

  const token = new URL(req.url).searchParams.get('token') || '';
  const parsed = readEmailVerificationToken(token);
  const member = parsed ? await Database.findTeamMember(parsed.memberId) : null;
  if (!parsed || !member || (member.email || '').toLowerCase() !== parsed.email) {
    return NextResponse.redirect(new URL('/verify-email?status=invalid', base));
  }
  if (member.emailVerified !== false) {
    return NextResponse.redirect(new URL('/dashboard?emailVerified=1', base));
  }

  const ctx = await getAuthContext(req);
  if (ctx.authenticated && ctx.memberId === member.id) {
    await Database.confirmEmail(member.id);
    await Database.addAuditLog({
      actor: { id: member.id, name: member.name, email: member.email, ip: getClientIp(req) },
      action: 'auth.email_confirmed',
      targetType: 'member',
      targetId: member.id,
      details: { via: 'same-browser' },
    });
    return NextResponse.redirect(new URL('/dashboard?emailVerified=1', base));
  }
  return NextResponse.redirect(new URL(`/verify-email?token=${encodeURIComponent(token)}`, base));
}

/** Confirms the address from a browser that is not signed in: the person chooses a new password. */
async function POSTHandler(req: Request) {
  const limited = await enforceDistributedRateLimit(req, 'verify-email-set', { windowMs: 60 * 1000, max: 10 });
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parsed = readEmailVerificationToken(typeof body?.token === 'string' ? body.token : '');
  const member = parsed ? await Database.findTeamMember(parsed.memberId) : null;
  if (!parsed || !member || (member.email || '').toLowerCase() !== parsed.email) {
    return NextResponse.json({ error: 'This link is not valid or has expired. Sign in and ask for a new one.' }, { status: 400 });
  }
  if (member.emailVerified !== false) {
    return NextResponse.json({ error: 'This email address is already confirmed. Sign in instead.', alreadyConfirmed: true }, { status: 409 });
  }
  const pass = validateString(body?.password, 6, 128, 'Password', true);
  if (!pass.valid || !pass.value) {
    return NextResponse.json({ error: pass.error || 'Choose a password of at least 6 characters.' }, { status: 400 });
  }

  const confirmed = await Database.confirmEmail(member.id, { newPassword: pass.value });
  if (!confirmed) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  // Whoever filled in the sign-up form may have switched on two-factor with a device only they hold.
  const cleared = await Database.updateTeamMember(member.id, {
    twoFactorEnabled: false,
    twoFactorSecret: undefined,
    recoveryCodes: undefined,
    twoFactorLastStep: undefined,
  });
  const final = cleared || confirmed;
  await Database.addAuditLog({
    actor: { id: member.id, name: member.name, email: member.email, ip: getClientIp(req) },
    action: 'auth.email_confirmed',
    targetType: 'member',
    targetId: member.id,
    details: { via: 'new-password', sessionsEnded: true },
  });

  const sessionToken = generateSessionToken(final.role, final.id, final.workspaceId, undefined, final.sessionVersion || 0);
  const res = NextResponse.json({ success: true, member: sanitizeTeamMember(final), token: sessionToken });
  res.headers.append('Set-Cookie', createSessionCookieHeader(sessionToken));
  return res;
}

export const GET = logged(GETHandler, { route: '/api/auth/verify-email' });
export const POST = logged(POSTHandler, { route: '/api/auth/verify-email' });
