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

  if (providerError) return loginRedirect(origin, 'Google sign-in was cancelled or refused.', true, isMobile);

  // 1. Start. The state cookie must be set on the same host Google will send the browser back to, so if
  // this request came in on another host (for example www.), hop to the canonical one first.
  if (!code) {
    if (url.origin !== origin) return NextResponse.redirect(`${origin}/api/auth/oauth/google${url.search}`);
    if (!isGoogleOAuthConfigured()) return loginRedirect(origin, 'Google sign-in is not available right now.', false, isMobileQuery);
    const newAttempt = createOAuthAttempt(isMobileQuery ? 'mobile' : undefined);
    const authUrl = getGoogleAuthUrl(origin, newAttempt);
    if (!authUrl) return loginRedirect(origin, 'Google sign-in is not available right now.', false, isMobileQuery);
    const res = NextResponse.redirect(authUrl);
    res.headers.append('Set-Cookie', newAttempt.cookie);
    return res;
  }

  // 2. Callback: the state must match the cookie set when this browser started the login.
  if (!attempt) {
    return loginRedirect(origin, 'That sign-in link is invalid or has expired. Please try again.', true, isMobile);
  }

  try {
    const profile = await exchangeGoogleCode(code, origin, attempt.verifier);
    const authResult = await authenticateOAuthUser(
      { email: profile.email, name: profile.name, provider: 'google', providerId: profile.providerId, picture: profile.picture },
      getClientIp(req)
    );

    if (attempt.isMobile) {
      const mobileRedirect = `crescelo://auth?token=${encodeURIComponent(authResult.token)}&email=${encodeURIComponent(profile.email)}&name=${encodeURIComponent(profile.name || '')}`;
      const res = NextResponse.redirect(mobileRedirect);
      res.headers.append('Set-Cookie', authResult.cookieHeader);
      res.headers.append('Set-Cookie', clearOAuthCookie());
      return res;
    }

    const res = NextResponse.redirect(`${origin}/dashboard`);
    res.headers.append('Set-Cookie', authResult.cookieHeader);
    res.headers.append('Set-Cookie', clearOAuthCookie());
    return res;
  } catch (err: any) {
    console.error('[OAuth] google callback failed:', err?.message);
    return loginRedirect(origin, 'Google sign-in could not be completed. Please try again.', true, isMobile);
  }
}

/** No POST sign-in: nothing a browser posts is trusted as proof of identity. */
async function POSTHandler() {
  return NextResponse.json({ error: 'Not supported.' }, { status: 405, headers: { Allow: 'GET' } });
}

export const GET = logged(GETHandler, { route: '/api/auth/oauth/[provider]' });
export const POST = logged(POSTHandler, { route: '/api/auth/oauth/[provider]' });
