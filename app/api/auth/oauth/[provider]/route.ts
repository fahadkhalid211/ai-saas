import { NextResponse } from 'next/server';
import {
  getGoogleAuthUrl,
  getAppleAuthUrl,
  isGoogleOAuthConfigured,
  isAppleOAuthConfigured,
  exchangeGoogleCode,
  parseAppleAuthPayload,
  authenticateOAuthUser,
  decodeJwtPayload,
} from '@/lib/security/oauth';
import { getClientIp } from '@/lib/security/rate-limit';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  // 1. Initial redirect to Provider Login
  if (!code) {
    if (provider === 'google') {
      if (!isGoogleOAuthConfigured()) {
        return NextResponse.redirect(
          `${origin}/login?error=GoogleNotConfigured&message=${encodeURIComponent(
            'Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.'
          )}`
        );
      }
      const authUrl = getGoogleAuthUrl(origin);
      if (!authUrl) {
        return NextResponse.redirect(`${origin}/login?error=GoogleOAuthInitFailed`);
      }
      return NextResponse.redirect(authUrl);
    }

    if (provider === 'apple') {
      if (!isAppleOAuthConfigured()) {
        return NextResponse.redirect(
          `${origin}/login?error=AppleNotConfigured&message=${encodeURIComponent(
            'Sign in with Apple is not configured. Please set APPLE_CLIENT_ID (Services ID) in your .env file.'
          )}`
        );
      }
      const authUrl = getAppleAuthUrl(origin);
      if (!authUrl) {
        return NextResponse.redirect(`${origin}/login?error=AppleOAuthInitFailed`);
      }
      return NextResponse.redirect(authUrl);
    }

    return NextResponse.redirect(`${origin}/login?error=UnsupportedProvider`);
  }

  // 2. OAuth Callback Code Exchange
  try {
    const ip = getClientIp(req);
    let email = '';
    let name = '';
    let providerId = '';

    if (provider === 'google') {
      const googleProfile = await exchangeGoogleCode(code, origin);
      email = googleProfile.email;
      name = googleProfile.name;
      providerId = googleProfile.providerId;
    } else if (provider === 'apple') {
      const idToken = url.searchParams.get('id_token') || undefined;
      const appleProfile = parseAppleAuthPayload({ id_token: idToken, code });
      email = appleProfile.email;
      name = appleProfile.name;
      providerId = appleProfile.providerId;
    } else {
      return NextResponse.redirect(`${origin}/login?error=InvalidProvider`);
    }

    const authResult = await authenticateOAuthUser(
      {
        email,
        name,
        provider: provider as 'google' | 'apple',
        providerId,
      },
      ip
    );

    const redirectRes = NextResponse.redirect(`${origin}/dashboard`);
    redirectRes.headers.set('Set-Cookie', authResult.cookieHeader);
    return redirectRes;
  } catch (err: any) {
    console.error(`[OAuth] ${provider} callback error:`, err?.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(provider + 'AuthFailed')}&message=${encodeURIComponent(
        err?.message || 'Authentication could not be completed.'
      )}`
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const url = new URL(req.url);
    const origin = url.origin;
    const ip = getClientIp(req);
    const contentType = req.headers.get('content-type') || '';

    if (provider !== 'google' && provider !== 'apple') {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // A. Handle browser form_post from Apple Sign-In
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const code = formData.get('code')?.toString();
      const idToken = formData.get('id_token')?.toString();
      const userRaw = formData.get('user')?.toString();
      const error = formData.get('error')?.toString();

      if (error) {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
      }

      const appleProfile = parseAppleAuthPayload({
        id_token: idToken,
        code,
        user: userRaw,
      });

      const authResult = await authenticateOAuthUser(
        {
          email: appleProfile.email,
          name: appleProfile.name,
          provider: 'apple',
          providerId: appleProfile.providerId,
        },
        ip
      );

      const redirectRes = NextResponse.redirect(`${origin}/dashboard`, 303);
      redirectRes.headers.set('Set-Cookie', authResult.cookieHeader);
      return redirectRes;
    }

    // B. Handle JSON API (Google Identity Services / One Tap / Client SDKs)
    const body = await req.json().catch(() => ({}));
    let email = body.email?.trim();
    let name = body.name?.trim();
    let providerId = body.providerId;

    // Decode Google ID Token if present (from Google Identity Services credential)
    if (body.credential && !email) {
      const payload = decodeJwtPayload(body.credential);
      if (payload) {
        if (payload.email) email = payload.email;
        if (payload.name) name = payload.name;
        if (payload.sub) providerId = payload.sub;
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Email address is required for authentication.' }, { status: 400 });
    }

    const authResult = await authenticateOAuthUser(
      {
        email,
        name,
        provider,
        providerId: providerId || body.credential?.slice(0, 24),
      },
      ip
    );

    return NextResponse.json(
      {
        success: true,
        isNewUser: authResult.isNewUser,
        member: authResult.member,
        workspace: authResult.workspace,
        token: authResult.token,
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': authResult.cookieHeader,
        },
      }
    );
  } catch (err: any) {
    console.error('[OAuth] POST auth error:', err);
    return NextResponse.json({ error: err?.message || 'Authentication failed' }, { status: 500 });
  }
}
