import { NextResponse } from 'next/server';
import { logged } from '@/lib/logging/route';

export const dynamic = 'force-dynamic';

/**
 * Enterprise SSO is not available yet.
 *
 * The previous version signed anyone in as any e-mail address without contacting an identity
 * provider. A real SAML/OIDC login must be added with signature verification before this route
 * can issue sessions again.
 */
async function GETHandler() {
  return NextResponse.json({ ssoEnabled: false });
}

async function POSTHandler() {
  return NextResponse.json({ error: 'Enterprise SSO is not available.' }, { status: 501 });
}

export const GET = logged(GETHandler, { route: '/api/auth/sso' });
export const POST = logged(POSTHandler, { route: '/api/auth/sso' });
