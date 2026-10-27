import { NextResponse } from 'next/server';
import {
  createOAuthAttempt,
  clearOAuthCookie,
  verifyOAuthAttempt,
  getGoogleAuthUrl,
  isGoogleOAuthConfigured,
  exchangeGoogleCode,
  authenticateOAuthUser,
} from '@/lib/security/oauth';
import { getClientIp } from '@/lib/security/rate-limit';
import { enforceDistributedRateLimit } from '@/lib/security/rate-limit-redis';
import { canonicalOrigin } from '@/lib/security/origin';
import { logged } from '@/lib/logging/route';
import { ACCOUNT_DISABLED_ERROR, ACCOUNT_DISABLED_MESSAGE } from '@/lib/security/account-status';
import { getAuthContext } from '@/lib/security/auth';
import { Database } from '@/lib/db';

export const dynamic = 'force-dynamic';

function loginRedirect(origin: string, message: string, clearCookie = false, isMobile = false): NextResponse {
  if (isMobile) {
    const mobileRedirect = `crescelo://auth?error=${encodeURIComponent(message)}`;
    const res = NextResponse.redirect(mobileRedirect);
    if (clearCookie) res.headers.append('Set-Cookie', clearOAuthCookie());
    return res;
  }
  const res = NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(message)}`);
  if (clearCookie) res.headers.append('Set-Cookie', clearOAuthCookie());
  return res;
}

/**
 * Google sign-in (authorization-code flow with `state` + PKCE).
 * GET without `code`  -> start: send the browser to Google.
 * GET with `code`     -> callback: verify state, exchange the code server-side, sign in.
 *
 * Sign in with Apple is disabled until its id_token signature is verified against Apple's keys.
 */
async function GETHandler(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = canonicalOrigin(req);
  const url = new URL(req.url);
  const isMobileQuery = url.searchParams.get('platform') === 'mobile';
  const actionQuery = url.searchParams.get('action');

  if (provider !== 'google') {
    return loginRedirect(origin, 'That sign-in method is not available.', false, isMobileQuery);
  }

  const limited = await enforceDistributedRateLimit(req, 'oauth', { windowMs: 60 * 1000, max: 20 });
  if (limited) return limited;

  const code = url.searchParams.get('code');
  const providerError = url.searchParams.get('error');

  // Verify attempt early if state is provided
  const attempt = code || providerError ? verifyOAuthAttempt(req, url.searchParams.get('state')) : null;
  const isMobile = isMobileQuery || Boolean(attempt?.isMobile);
  const isConnect = Boolean(attempt?.isConnect || actionQuery === 'connect');

  if (providerError) {
    if (isConnect) {
      const res = NextResponse.redirect(`${origin}/dashboard?tab=profile&error=${encodeURIComponent('Google connection was cancelled or refused.')}`);
      res.headers.append('Set-Cookie', clearOAuthCookie());
      return res;
    }
    return loginRedirect(origin, 'Google sign-in was cancelled or refused.', true, isMobile);
  }

  // 1. Start. The state cookie must be set on the same host Google will send the browser back to, so if
  // this request came in on another host (for example www.), hop to the canonical one first.
  if (!code) {
    if (url.origin !== origin) return NextResponse.redirect(`${origin}/api/auth/oauth/google${url.search}`);
    if (!isGoogleOAuthConfigured()) return loginRedirect(origin, 'Google sign-in is not available right now.', false, isMobileQuery);
    const newAttempt = createOAuthAttempt(isMobileQuery ? 'mobile' : undefined, actionQuery || undefined);
    const authUrl = getGoogleAuthUrl(origin, newAttempt);
    if (!authUrl) return loginRedirect(origin, 'Google sign-in is not available right now.', false, isMobileQuery);
    const res = NextResponse.redirect(authUrl);
    res.headers.append('Set-Cookie', newAttempt.cookie);
    return res;
  }

  // 2. Callback: the state must match the cookie set when this browser started the login.
  if (!attempt) {
    if (isConnect) {
      return NextResponse.redirect(`${origin}/dashboard?tab=profile&error=${encodeURIComponent('Sign-in link expired. Please try again.')}`);
    }
    return loginRedirect(origin, 'That sign-in link is invalid or has expired. Please try again.', true, isMobile);
  }

  try {
    const profile = await exchangeGoogleCode(code, origin, attempt.verifier);

    // If connecting Google from user profile settings while authenticated:
    const ctx = await getAuthContext(req);
    if ((isConnect || attempt.isConnect) && ctx.authenticated && ctx.memberId) {
      await Database.linkGoogleAccount(ctx.memberId, {
        googleId: profile.providerId,
        googleEmail: profile.email,
        avatarUrl: profile.picture,
      });

      await Database.addAuditLog({
        actor: { id: ctx.memberId, name: profile.name, email: profile.email, ip: getClientIp(req) },
        action: 'auth.google_connected',
        targetType: 'workspace',
        targetId: ctx.workspaceId,
        details: { googleEmail: profile.email, googleId: profile.providerId },
      });

      const res = NextResponse.redirect(`${origin}/dashboard?tab=profile&connected=google`);
      res.headers.append('Set-Cookie', clearOAuthCookie());
      return res;
    }

    const authResult = await authenticateOAuthUser(
      { email: profile.email, name: profile.name, provider: 'google', providerId: profile.providerId, picture: profile.picture },
      getClientIp(req)
    );

    if (authResult.twoFactorRequired) {
      // no session yet: the browser gets a 5-minute challenge cookie and is asked for its authenticator code
      if (attempt.isMobile) {
        const res = NextResponse.redirect(`crescelo://auth?error=${encodeURIComponent('Two-factor authentication is on for this account. Sign in with your email and password, then enter your code.')}`);
        res.headers.append('Set-Cookie', clearOAuthCookie());
        return res;
      }
      const res = NextResponse.redirect(`${origin}/login?twofactor=1`);
      res.headers.append('Set-Cookie', authResult.cookieHeader);
      res.headers.append('Set-Cookie', clearOAuthCookie());
      return res;
    }

    if (attempt.isMobile) {
      const mobileRedirect = `crescelo://auth?token=${encodeURIComponent(authResult.token)}&email=${encodeURIComponent(profile.email)}&name=${encodeURIComponent(profile.name || '')}`;
      const res = NextResponse.redirect(mobileRedirect);
      res.headers.append('Set-Cookie', authResult.cookieHeader);
      res.headers.append('Set-Cookie', clearOAuthCookie());
      return res;
    }

    const destination = isConnect ? `${origin}/dashboard?tab=profile&connected=google` : `${origin}/dashboard`;
    const res = NextResponse.redirect(destination);
    res.headers.append('Set-Cookie', authResult.cookieHeader);
    res.headers.append('Set-Cookie', clearOAuthCookie());
    return res;
  } catch (err: any) {
    if (err?.message === ACCOUNT_DISABLED_ERROR) return loginRedirect(origin, ACCOUNT_DISABLED_MESSAGE, true, isMobile);
    console.error('[OAuth] google callback failed:', err?.message);
    if (isConnect) {
      return NextResponse.redirect(`${origin}/dashboard?tab=profile&error=${encodeURIComponent('Google connection could not be completed. Please try again.')}`);
    }
    return loginRedirect(origin, 'Google sign-in could not be completed. Please try again.', true, isMobile);
  }
}

/** No POST sign-in: nothing a browser posts is trusted as proof of identity. */
async function POSTHandler() {
  return NextResponse.json({ error: 'Not supported.' }, { status: 405, headers: { Allow: 'GET' } });
}

export const GET = logged(GETHandler, { route: '/api/auth/oauth/[provider]' });
export const POST = logged(POSTHandler, { route: '/api/auth/oauth/[provider]' });
