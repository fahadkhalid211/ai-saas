import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Enterprise SSO is not available yet.
 *
 * The previous version signed anyone in as any e-mail address without contacting an identity
 * provider. A real SAML/OIDC login must be added with signature verification before this route
 * can issue sessions again.
 */
export async function GET() {
  return NextResponse.json({ ssoEnabled: false });
}

export async function POST() {
  return NextResponse.json({ error: 'Enterprise SSO is not available.' }, { status: 501 });
}
