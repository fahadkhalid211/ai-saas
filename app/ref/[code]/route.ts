import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/db';
import { getClientIp } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cleanCode = (code || '').toLowerCase().trim();

    const ip = getClientIp(req);
    const referrer = req.headers.get('referer') || '';
    const userAgent = req.headers.get('user-agent') || '';

    if (cleanCode) {
      await Database.recordReferralClick(cleanCode, {
        ip,
        referrer,
        userAgent,
        landingPath: `/ref/${cleanCode}`,
      });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const redirectUrl = new URL('/', req.url);

    // Pass ref param so client-side localStorage also retains attribution
    redirectUrl.searchParams.set('ref', cleanCode);

    const res = NextResponse.redirect(redirectUrl);
    res.headers.set(
      'Set-Cookie',
      `crescelo_ref=${encodeURIComponent(cleanCode)}; Path=/; Max-Age=2592000; SameSite=Lax${isProd ? '; Secure' : ''}`
    );

    return res;
  } catch (error) {
    console.error('[Referral Redirect Error]:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}
