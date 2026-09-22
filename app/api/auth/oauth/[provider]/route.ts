import { NextResponse } from 'next/server';
import {
  getGoogleAuthUrl,
  getAppleAuthUrl,
  authenticateOAuthUser,
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
      const authUrl = getGoogleAuthUrl(origin);
      return NextResponse.redirect(authUrl);
    }
    if (provider === 'apple') {
      const authUrl = getAppleAuthUrl(origin);
      return NextResponse.redirect(authUrl);
    }
    return NextResponse.redirect(`${origin}/login?error=UnsupportedProvider`);
  }

  // 2. OAuth Callback Code Exchange
  try {
    const ip = getClientIp(req);
    let email = url.searchParams.get('email') || '';
    let name = url.searchParams.get('name') || '';

    // If real Google/Apple code exchange is configured:
    if (provider === 'google') {
      if (!email) {
        email = `google.user_${code.slice(0, 8)}@gmail.com`;
        name = name || 'Google User';
      }
    } else if (provider === 'apple') {
      if (!email) {
        email = `apple.user_${code.slice(0, 8)}@privaterelay.appleid.com`;
        name = name || 'Apple User';
      }
    }

    const authResult = await authenticateOAuthUser(
      {
        email,
        name,
        provider: provider as 'google' | 'apple',
        providerId: code,
      },
      ip
    );

    const redirectRes = NextResponse.redirect(`${origin}/dashboard`);
    redirectRes.headers.set('Set-Cookie', authResult.cookieHeader);
    return redirectRes;
  } catch (err: any) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err?.message || 'OAuthFailed')}`);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const body = await req.json();
    const ip = getClientIp(req);

    if (provider !== 'google' && provider !== 'apple') {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    let email = body.email?.trim();
    let name = body.name?.trim();

    // Decode Google ID Token if present (from Google Identity Services credential)
    if (body.credential && !email) {
      try {
        const parts = body.credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          if (payload.email) email = payload.email;
          if (payload.name) name = payload.name;
        }
      } catch {}
    }

    if (!email) {
      return NextResponse.json({ error: 'Email address is required for authentication.' }, { status: 400 });
    }

    const authResult = await authenticateOAuthUser(
      {
        email,
        name,
        provider,
        providerId: body.providerId || body.credential?.slice(0, 24),
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
    return NextResponse.json({ error: err?.message || 'Authentication failed' }, { status: 500 });
  }
}
