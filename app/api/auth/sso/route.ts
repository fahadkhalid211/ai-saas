import { NextResponse } from 'next/server';
import { resolveEnterpriseSSO, authenticateOAuthUser } from '@/lib/security/oauth';
import { getClientIp } from '@/lib/security/rate-limit';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = url.searchParams.get('domain') || url.searchParams.get('email') || '';

  if (!domain.trim()) {
    return NextResponse.json({ error: 'Domain or work email is required' }, { status: 400 });
  }

  const ssoInfo = resolveEnterpriseSSO(domain);
  return NextResponse.json({
    ssoEnabled: true,
    ...ssoInfo,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const domainOrEmail = (body.domain || body.email || '').trim();
    const ip = getClientIp(req);

    if (!domainOrEmail) {
      return NextResponse.json({ error: 'Work email or company domain is required.' }, { status: 400 });
    }

    const ssoInfo = resolveEnterpriseSSO(domainOrEmail);
    const email = domainOrEmail.includes('@')
      ? domainOrEmail.toLowerCase()
      : `admin@${ssoInfo.domain}`;

    const userName = body.name || `${ssoInfo.domain.split('.')[0].toUpperCase()} Enterprise User`;

    const authResult = await authenticateOAuthUser(
      {
        email,
        name: userName,
        provider: 'sso',
        domain: ssoInfo.domain,
        providerId: `sso_${ssoInfo.domain}`,
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
        sso: {
          idp: ssoInfo.idpName,
          domain: ssoInfo.domain,
          protocol: ssoInfo.protocol,
        },
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': authResult.cookieHeader,
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'SSO authentication failed' }, { status: 500 });
  }
}
